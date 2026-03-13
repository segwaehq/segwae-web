// Middleware Supabase client for use in middleware
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Helper function to check if profile is complete
  async function isProfileComplete(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('users')
      .select('is_profile_complete')
      .eq('id', userId)
      .single()
    return data?.is_profile_complete ?? false
  }

  // Protected routes that require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      // Redirect to login if not authenticated
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if profile is complete - redirect to complete-profile if not
    const profileComplete = await isProfileComplete(user.id)
    if (!profileComplete) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/complete-profile'
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect /dashboard to /dashboard/profile
    if (pathname === '/dashboard') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard/profile'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Complete profile route - requires auth but NOT complete profile
  if (pathname.startsWith('/complete-profile')) {
    if (!user) {
      // Redirect to login if not authenticated
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If profile is already complete, redirect to dashboard
    const profileComplete = await isProfileComplete(user.id)
    if (profileComplete) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard/profile'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === '/login' || pathname.startsWith('/signup')) && user) {
    // Check if profile is complete to determine redirect destination
    const profileComplete = await isProfileComplete(user.id)
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = profileComplete ? '/dashboard/profile' : '/complete-profile'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
