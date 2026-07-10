import { NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/supabase/api-auth'
import { getEntitlementStatus } from '@/lib/ai/entitlements'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const user = await getRequestUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
