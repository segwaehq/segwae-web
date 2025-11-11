import { notFound } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase'
import { trackProfileView } from '@/lib/analytics'
import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

interface ProfilePageProps {
  // params: { username: string }
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  // const profile = await getUserProfile(params.username)
  const { username } = await params
  const profile = await getUserProfile(username)

  if (!profile) {
    return {
      title: 'Profile Not Found - Segwae',
    }
  }

  return {
    title: `${profile.name} - Segwae`,
    description: profile.bio || `${profile.title} | Professional networking profile on Segwae`,
    openGraph: {
      title: `${profile.name} - Segwae`,
      description: profile.bio || `${profile.title} | Professional networking profile`,
      images: profile.profile_image_url
        ? [{ url: profile.profile_image_url }]
        : [{ url: 'https://segwae.com/logo.png' }],
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // const profile = await getUserProfile(params.username)
  const { username } = await params
  const profile = await getUserProfile(username)

  if (!profile) {
    notFound()
  }

  // Track profile view (server-side)
  await trackProfileView(profile.id)

  return <ProfileClient profile={profile} />
}