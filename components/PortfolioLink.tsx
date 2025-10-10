'use client'

interface PortfolioLinkProps {
  url: string
  profileId: string
}

export default function PortfolioLink({ url, profileId }: PortfolioLinkProps) {
  const handleClick = async () => {
    // Track analytics client-side
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          eventType: 'link_click',
          linkType: 'portfolio',
        }),
      })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-mainPurple hover:underline font-spaceGrotesk font-semibold"
    >
      Visit Website
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
