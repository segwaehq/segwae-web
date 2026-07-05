import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reconcileUser } from '@/lib/ai/payments'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const granted = await reconcileUser(user.id)
    return NextResponse.json({ granted })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Reconcile failed' },
      { status: 500 },
    )
  }
}
