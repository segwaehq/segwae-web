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

  // Alternative: Hide header and footer on admin dashboard pages only (uncomment to use)
  // const isAdminPage = pathname?.startsWith('/admin') && !pathname?.startsWith('/admin/login')

  if (isProfilePage || isAdminPage || isDashboardPage) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
    </>
  )
}