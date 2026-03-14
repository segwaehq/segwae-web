'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide header and footer on profile pages (format: /profile/username or /qr/username)
  const isProfilePage = pathname?.match(/^\/(profile|qr)\/[^/]+$/)

  // Hide header and footer on all admin pages
  const isAdminPage = pathname?.startsWith('/admin')

  // Hide header and footer on all admin pages
  const isDashboardPage = pathname?.startsWith('/dashboard')

  // Hide header and footer on auth pages (full-screen layouts)
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup')

  // Hide header and footer on onboarding flow
  const isOnboardingPage = pathname?.startsWith('/complete-profile')

  // Hide header and footer on contact page (full-screen split layout)
  const isContactPage = pathname === '/contact'

  // Alternative: Hide header and footer on admin dashboard pages only (uncomment to use)
  // const isAdminPage = pathname?.startsWith('/admin') && !pathname?.startsWith('/admin/login')

  if (isProfilePage || isAdminPage || isDashboardPage || isAuthPage || isOnboardingPage || isContactPage) {
    return <>{children}</>
  }

  // Landing page: no top padding so the hero can slide behind the fixed header
  const isLandingPage = pathname === '/'

  return (
    <>
      <Header />
      <main className={`min-h-screen ${isLandingPage ? '' : 'pt-16'}`}>{children}</main>
      <Footer />
    </>
  )
}