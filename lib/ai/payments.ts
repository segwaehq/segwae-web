import { supabaseAdmin as admin } from '@/lib/supabase/service'
import { verifyTransaction } from '@/lib/paystack'
import { grantPass, type PlanKey } from '@/lib/ai/entitlements'

/**
 * Verify-on-callback settlement. Given a Paystack reference, confirm it with
 * Paystack and (idempotently) grant the pass. The atomic pending→success claim
 * on ai_payments guarantees exactly one grant even if the callback fires twice.
 * Server-only.
 */

export type SettleResult = 'granted' | 'already' | 'failed' | 'not_found'

export async function settleReference(reference: string): Promise<SettleResult> {
  const { data: payment } = await admin
    .from('ai_payments')
    .select('id, user_id, plan, amount_kobo, status')
    .eq('reference', reference)
    .maybeSingle()

  if (!payment) return 'not_found'
  if (payment.status === 'success') return 'already'

  const verify = await verifyTransaction(reference)
  const ok =
    verify.success && verify.currency === 'NGN' && verify.amountKobo >= payment.amount_kobo

  if (!ok) {
    await admin
      .from('ai_payments')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', payment.id)
      .eq('status', 'pending')
    return 'failed'
  }

  // Atomic claim — only the request that flips pending→success grants the pass.
  const { data: claimed } = await admin
    .from('ai_payments')
    .update({ status: 'success', updated_at: new Date().toISOString() })
    .eq('id', payment.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (!claimed) return 'already'

  const entitlementId = await grantPass(
    payment.user_id,
    payment.plan as PlanKey,
    `paystack:${reference}`,
  )
  await admin.from('ai_payments').update({ entitlement_id: entitlementId }).eq('id', payment.id)
  return 'granted'
}

/** Safety net for redirects that never completed: settle the user's pending payments. */
export async function reconcileUser(userId: string): Promise<number> {
  const { data: pendings } = await admin
    .from('ai_payments')
    .select('reference')
    .eq('user_id', userId)
    .eq('status', 'pending')

  let granted = 0
  for (const p of pendings ?? []) {
    try {
      if ((await settleReference(p.reference)) === 'granted') granted++
    } catch {
      // Leave it pending for the next reconcile pass.
    }
  }
  return granted
}
