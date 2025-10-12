'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Hide header and footer on profile pages (format: /profile/username or /qr/username)
  const isProfilePage = pathname?.match(/^\/(profile|qr)\/[^/]+$/)
  
  if (isProfilePage) {
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