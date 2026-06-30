import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Complete Your Profile - Segwae',
  description: 'Complete your profile to unlock all Segwae features',
}

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F4F3F8]">
      {children}
    </div>
  )
}
