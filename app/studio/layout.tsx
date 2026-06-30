import type { Metadata } from 'next'

// Private area (blog CMS) — keep every /studio route out of search engines.
// Crawling stays allowed so the noindex tag is actually seen and honoured.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
