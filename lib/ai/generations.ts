import { supabaseAdmin as admin } from '@/lib/supabase/service'

/**
 * Persistence for AI generation history. Every successful paid output (Resume
 * Tailor, Interview Prep) is saved here so a refresh/accident never loses what a
 * user paid to generate, and past outputs can be reopened for free. Server-only
 * (uses the service-role client, which bypasses RLS — see `entitlements.ts`).
 */

export type GenerationKind = 'tailor' | 'interview'

/** Row shape for the "Recent" list — no payload, so lists stay light. */
export type GenerationSummary = {
  id: string
  kind: GenerationKind
  job_title: string | null
  company: string | null
  created_at: string
}

/** Full row, including the stored result payload. */
export type GenerationRecord = GenerationSummary & {
  job_id: string | null
  payload: unknown
}

export async function saveGeneration(input: {
  userId: string
  kind: GenerationKind
  jobTitle?: string | null
  company?: string | null
  jobId?: string | null
  payload: unknown
}): Promise<string | null> {
  const { data, error } = await admin
    .from('ai_generations')
    .insert({
      user_id: input.userId,
      kind: input.kind,
      job_title: input.jobTitle?.trim() || null,
      company: input.company?.trim() || null,
      job_id: input.jobId ?? null,
      payload: input.payload,
    })
    .select('id')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.id ?? null
}

export async function listGenerations(
  userId: string,
  kind?: GenerationKind,
  limit = 20,
): Promise<GenerationSummary[]> {
  let q = admin
    .from('ai_generations')
    .select('id, kind, job_title, company, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (kind) q = q.eq('kind', kind)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data as GenerationSummary[] | null) ?? []
}

export async function getGeneration(
  userId: string,
  id: string,
): Promise<GenerationRecord | null> {
  const { data, error } = await admin
    .from('ai_generations')
    .select('id, kind, job_title, company, created_at, job_id, payload')
    .eq('user_id', userId) // scope to owner even though service-role bypasses RLS
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as GenerationRecord | null) ?? null
}
