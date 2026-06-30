import type { Metadata } from 'next'

// Private area (jobs portal) — keep every /jobs-portal route out of search
// engines. Crawling stays allowed so the noindex tag is seen and honoured.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function JobsPortalRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
