import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Shared cookie-bound Supabase client for the Content Studio guards.
async function studioClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — safe to ignore (middleware refreshes).
          }
        },
      },
    },
  )
}

// Page guard — use in /studio layouts/pages. Redirects out if not a writer/admin.
export async function checkWriterAuth() {
  const supabase = await studioClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/studio/login')

  const { data: userData, error } = await supabase
    .from('users')
    .select('name, is_writer, is_admin')
    .eq('id', user.id)
    .single()

  if (error || (!userData?.is_writer && !userData?.is_admin)) {
    redirect('/studio/login?error=unauthorized')
  }

  return {
    id: user.id,
    email: user.email ?? '',
    name: (userData?.name as string) ?? user.email ?? '',
    isAdmin: !!userData?.is_admin,
  }
}

export type WriterApiAuth =
  | { ok: true; user: { id: string; isAdmin: boolean } }
  | { ok: false; status: number; error: string }

// API-route guard — non-redirecting. Returns a status to send back instead.
export async function checkWriterApiAuth(): Promise<WriterApiAuth> {
  const supabase = await studioClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, status: 401, error: 'Unauthorized' }

  const { data: userData } = await supabase
    .from('users')
    .select('is_writer, is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_writer && !userData?.is_admin) {
    return { ok: false, status: 403, error: 'Forbidden: Content Studio access required' }
  }

  return { ok: true, user: { id: user.id, isAdmin: !!userData.is_admin } }
}
