import { supabaseAdmin as admin } from '@/lib/supabase/service'

/**
 * Cost guardrail for the AI tools. Only the Tailor (Opus) is metered; Match Score
 * (Haiku) stays free/unlimited. Uses the service-role client (bypasses RLS) — see
 * the store orders route for the same pattern. Server-only.
 */

/** Free tier: one Tailor, lifetime. Easily changed (or made monthly) here. */
export const FREE_TAILOR_CAP = 1

/** Pass plans — server-authoritative price (kobo), cap, and validity. Tunable. */
export const PASS_PLANS = {
  sprint: { label: 'Sprint Pass', amountKobo: 250_000, generations_cap: 8, days: 7 },
  job_hunt: { label: 'Job-Hunt Pass', amountKobo: 500_000, generations_cap: 20, days: 30 },
  topup: { label: 'Top-up (5 tailors)', amountKobo: 150_000, generations_cap: 5, days: null },
} as const

export type PlanKey = keyof typeof PASS_PLANS

/** Grants a pass/top-up as a new entitlement bucket. Returns the new bucket id. */
export async function grantPass(
  userId: string,
  plan: PlanKey,
  source: string,
): Promise<string | null> {
  const cfg = PASS_PLANS[plan]
  const expiresAt = cfg.days ? new Date(Date.now() + cfg.days * 86_400_000).toISOString() : null
  const { data, error } = await admin
    .from('ai_entitlements')
    .insert({
      user_id: userId,
      kind: plan,
      generations_cap: cfg.generations_cap,
      expires_at: expiresAt,
      source,
    })
    .select('id')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.id ?? null
}

export type EntitlementStatus = {
  canTailor: boolean
  remaining: number
  activeKind: 'free' | 'sprint' | 'job_hunt' | 'topup' | null
  hasPaidPass: boolean
  passExpiresAt: string | null
}

type Bucket = {
  id: string
  kind: 'free' | 'sprint' | 'job_hunt' | 'topup'
  generations_cap: number
  generations_used: number
  expires_at: string | null
}

async function ensureFreeBucket(userId: string): Promise<void> {
  const { data } = await admin
    .from('ai_entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('kind', 'free')
    .limit(1)

  if (!data || data.length === 0) {
    // A concurrent request may win the race; the unique index makes the loser a
    // no-op 23505, which we intentionally ignore.
    await admin
      .from('ai_entitlements')
      .insert({ user_id: userId, kind: 'free', generations_cap: FREE_TAILOR_CAP, source: 'auto' })
  }
}

async function usableBuckets(userId: string): Promise<Bucket[]> {
  const nowIso = new Date().toISOString()
  const { data, error } = await admin
    .from('ai_entitlements')
    .select('id, kind, generations_cap, generations_used, expires_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)

  if (error) throw new Error(error.message)
  return (data as Bucket[] | null ?? []).filter((b) => b.generations_used < b.generations_cap)
}

/** Consume order: free first (it never expires and is the taste), then paid buckets soonest-expiry first. */
function consumeOrder(a: Bucket, b: Bucket): number {
  const aFree = a.kind === 'free' ? 0 : 1
  const bFree = b.kind === 'free' ? 0 : 1
  if (aFree !== bFree) return aFree - bFree
  const ax = a.expires_at ? Date.parse(a.expires_at) : Infinity
  const bx = b.expires_at ? Date.parse(b.expires_at) : Infinity
  return ax - bx
}

export async function getEntitlementStatus(userId: string): Promise<EntitlementStatus> {
  await ensureFreeBucket(userId)
  const buckets = await usableBuckets(userId)
  const remaining = buckets.reduce((n, b) => n + (b.generations_cap - b.generations_used), 0)
  const paid = buckets.filter((b) => b.kind !== 'free').sort(consumeOrder)
  const next = [...buckets].sort(consumeOrder)[0] ?? null

  return {
    canTailor: remaining > 0,
    remaining,
    activeKind: next?.kind ?? null,
    hasPaidPass: paid.length > 0,
    passExpiresAt: paid[0]?.expires_at ?? null,
  }
}

/**
 * Atomically claims one Tailor generation. Returns the bucket id so a failed
 * generation can be refunded. The `.eq(generations_used, …)` acts as an optimistic
 * lock: if a concurrent request bumped the counter, the update matches 0 rows and
 * we fall through to the next bucket.
 */
export async function consumeTailor(
  userId: string,
): Promise<{ ok: true; entitlementId: string } | { ok: false }> {
  await ensureFreeBucket(userId)
  const buckets = (await usableBuckets(userId)).sort(consumeOrder)

  for (const b of buckets) {
    const { data } = await admin
      .from('ai_entitlements')
      .update({ generations_used: b.generations_used + 1 })
      .eq('id', b.id)
      .eq('generations_used', b.generations_used)
      .lt('generations_used', b.generations_cap)
      .select('id')
      .maybeSingle()

    if (data) return { ok: true, entitlementId: data.id }
  }
  return { ok: false }
}

/** Best-effort refund when a generation fails after being claimed. */
export async function refundTailor(entitlementId: string): Promise<void> {
  const { data } = await admin
    .from('ai_entitlements')
    .select('generations_used')
    .eq('id', entitlementId)
    .maybeSingle()

  if (!data) return
  await admin
    .from('ai_entitlements')
    .update({ generations_used: Math.max(0, data.generations_used - 1) })
    .eq('id', entitlementId)
}
