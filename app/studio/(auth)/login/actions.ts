'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function studioLoginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

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
              cookieStore.set(name, value, options),
            )
          } catch (error) {
            console.error('Error setting cookies:', error)
          }
        },
      },
    },
  )

  const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

  if (authError) {
    return { error: 'Invalid email or password' }
  }

  if (data.user) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_writer, is_admin')
      .eq('id', data.user.id)
      .single()

    if (userError || (!userData?.is_writer && !userData?.is_admin)) {
      await supabase.auth.signOut()
      return { error: 'You do not have access to the Content Studio' }
    }

    return { success: true }
  }

  return { error: 'Login failed' }
}
