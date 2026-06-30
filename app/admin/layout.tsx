import type { Metadata } from 'next'

// Private area (admin) — keep every /admin route out of search engines.
// Crawling stays allowed so the noindex tag is actually seen and honoured.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
