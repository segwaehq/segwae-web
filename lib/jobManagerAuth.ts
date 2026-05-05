import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function checkJobManagerAuth() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
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
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/jobs-portal/login')
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('name, is_job_manager, is_admin')
    .eq('id', user.id)
    .single()

  if (error || (!userData?.is_job_manager && !userData?.is_admin)) {
    redirect('/jobs-portal/login?error=unauthorized')
  }

  return {
    id: user.id,
    email: user.email ?? '',
    name: (userData?.name as string) ?? user.email ?? '',
  }
}
