import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEntitlementStatus } from '@/lib/ai/entitlements'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const status = await getEntitlementStatus(user.id)
    return NextResponse.json({ status })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load entitlements' },
      { status: 500 },
    )
  }
}
