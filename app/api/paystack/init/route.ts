import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service'
import { initializeTransaction } from '@/lib/paystack'
import { PASS_PLANS, type PlanKey } from '@/lib/ai/entitlements'

export const runtime = 'nodejs'

function isPlan(v: unknown): v is PlanKey {
  return v === 'sprint' || v === 'job_hunt' || v === 'topup'
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const plan = body?.plan
  if (!isPlan(plan)) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })

  const cfg = PASS_PLANS[plan] // amount is derived here, never from the client
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get('origin') ||
    new URL(request.url).origin
  const callbackUrl = `${base}/api/paystack/callback`

  try {
    const init = await initializeTransaction({
      email: user.email ?? `user-${user.id}@segwae.app`,
      amountKobo: cfg.amountKobo,
      callbackUrl,
      metadata: { userId: user.id, plan, source: 'segwae_ai' },
    })

    await supabaseAdmin.from('ai_payments').insert({
      user_id: user.id,
      reference: init.reference,
      plan,
      amount_kobo: cfg.amountKobo,
      status: 'pending',
    })

    return NextResponse.json({ authorizationUrl: init.authorizationUrl })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not start payment' },
      { status: 500 },
    )
  }
}
