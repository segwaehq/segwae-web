'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PhoneStep from '@/components/complete-profile/PhoneStep'
import TitleStep from '@/components/complete-profile/TitleStep'
import BioStep from '@/components/complete-profile/BioStep'
import PhotoStep from '@/components/complete-profile/PhotoStep'
import SocialLinksStep from '@/components/complete-profile/SocialLinksStep'
import PortfolioStep from '@/components/complete-profile/PortfolioStep'

interface ProfileData {
  phone: string
  title: string
  bio: string
  profile_image_url: string | null
  portfolio_or_website_link: string
  social_links: { id: string; platform: string; url: string }[]
}

const STEPS = [
  { id: 1, title: 'Phone Number', component: 'phone' },
  { id: 2, title: 'Job Title', component: 'title' },
  { id: 3, title: 'Bio', component: 'bio' },
  { id: 4, title: 'Profile Photo', component: 'photo' },
  { id: 5, title: 'Social Links', component: 'social' },
  { id: 6, title: 'Portfolio', component: 'portfolio' },
] as const

export default function CompleteProfilePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData>({
    phone: '',
    title: '',
    bio: '',
    profile_image_url: null,
    portfolio_or_website_link: '',
    social_links: [],
  })

  // Fetch current profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          setProfileData({
            phone: data.profile?.phone || '',
            title: data.profile?.title || '',
            bio: data.profile?.bio || '',
            profile_image_url: data.profile?.profile_image_url || null,
            portfolio_or_website_link: data.profile?.portfolio_or_website_link || '',
            social_links: data.socialLinks || [],
          })

          // Determine starting step based on what's already filled
          const startStep = determineStartStep(data)
          setCurrentStep(startStep)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  function determineStartStep(data: { profile: ProfileData; socialLinks: ProfileData['social_links'] }): number {
    if (!data.profile?.phone) return 1
    if (!data.profile?.title) return 2
    if (!data.profile?.bio || data.profile.bio.length < 50) return 3
    if (!data.profile?.profile_image_url) return 4
    // Social links are optional, so always allow proceeding to step 6
    if (!data.profile?.portfolio_or_website_link) return 6
    return 6
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async (): Promise<string | null> => {
    try {
      // Trigger profile completion calculation
      const res = await fetch('/api/user/complete-profile', {
        method: 'POST',
      })

      if (res.ok) {
        router.push('/dashboard/profile')
        return null
      } else {
        const data = await res.json()
        console.error('Failed to complete profile:', data)
        // Return error message with details if available
        const details = data.completion?.breakdown || data.completion?.details
        if (details) {
          const missing = Object.entries(details)
            .filter(([, complete]) => !complete)
            .map(([field]) => field.replace(/_/g, ' '))
          if (missing.length > 0) {
            return `Profile incomplete. Missing: ${missing.join(', ')}`
          }
        }
        return data.error || 'Failed to complete profile. Please ensure all required fields are filled.'
      }
    } catch (error) {
      console.error('Error completing profile:', error)
      return 'Something went wrong. Please try again.'
    }
  }

  const updateProfileData = (updates: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...updates }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-grey4 px-6 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold font-satoshi text-grey1">
              Complete Your Profile
            </h1>
            <span className="text-sm text-grey3">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-grey5 rounded-full overflow-hidden">
            <div
              className="h-full bg-mainPurple transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-lg mx-auto">
          {currentStep === 1 && (
            <PhoneStep
              value={profileData.phone}
              onUpdate={(phone) => updateProfileData({ phone })}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <TitleStep
              value={profileData.title}
              onUpdate={(title) => updateProfileData({ title })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <BioStep
              value={profileData.bio}
              onUpdate={(bio) => updateProfileData({ bio })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <PhotoStep
              value={profileData.profile_image_url}
              onUpdate={(url) => updateProfileData({ profile_image_url: url })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <SocialLinksStep
              value={profileData.social_links}
              onUpdate={(links) => updateProfileData({ social_links: links })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 6 && (
            <PortfolioStep
              value={profileData.portfolio_or_website_link}
              onUpdate={(url) => updateProfileData({ portfolio_or_website_link: url })}
              onComplete={handleComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  )
}
