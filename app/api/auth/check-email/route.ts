import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/service'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()

    // Service-role client bypasses RLS so we can look up any email. A public.users
    // row is created at signup (via the auth trigger), so this catches registered
    // emails even before they've confirmed.
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalized)
      .limit(1)

    if (error) {
      console.error('Error checking email:', error)
      // Fail open — the signup step-2 identities check is the authoritative backstop.
      return NextResponse.json({ available: true })
    }

    return NextResponse.json({ available: !(data && data.length > 0) })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ available: true })
  }
}
