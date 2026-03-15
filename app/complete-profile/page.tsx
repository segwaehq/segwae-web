'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  { id: 1, label: 'Phone Number' },
  { id: 2, label: 'Job Title' },
  { id: 3, label: 'Bio' },
  { id: 4, label: 'Profile Photo' },
  { id: 5, label: 'Social Links' },
  { id: 6, label: 'Portfolio' },
] as const

export default function CompleteProfilePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData>({
    phone: '',
    title: '',
    bio: '',
    profile_image_url: null,
    portfolio_or_website_link: '',
    social_links: [],
  })

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
          setCurrentStep(determineStartStep(data))
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
    if (!data.profile?.portfolio_or_website_link) return 6
    return 6
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setDirection(1)
      setCurrentStep(s => s + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep(s => s - 1)
    }
  }

  const handleComplete = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/user/complete-profile', { method: 'POST' })
      if (res.ok) {
        router.push('/dashboard/profile')
        return null
      }
      const data = await res.json()
      const details = data.completion?.breakdown || data.completion?.details
      if (details) {
        const missing = Object.entries(details)
          .filter(([, complete]) => !complete)
          .map(([field]) => field.replace(/_/g, ' '))
        if (missing.length > 0) return `Missing: ${missing.join(', ')}`
      }
      return data.error || 'Failed to complete profile. Please ensure all fields are filled.'
    } catch {
      return 'Something went wrong. Please try again.'
    }
  }

  const updateProfileData = (updates: Partial<ProfileData>) =>
    setProfileData(prev => ({ ...prev, ...updates }))

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.2 } }),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-grey4 bg-white">
        <Link href="/">
          <Image
            src="/wordmark_svg.svg"
            alt="Segwae"
            width={0}
            height={0}
            sizes="100vw"
            className="h-6 w-auto!"
          />
        </Link>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`rounded-full transition-all duration-300 ${
                s.id === currentStep
                  ? 'w-5 h-2 bg-mainPurple'
                  : s.id < currentStep
                  ? 'w-2 h-2 bg-mainPurple/40'
                  : 'w-2 h-2 bg-grey4'
              }`}
            />
          ))}
        </div>

        <span className="font-spaceGrotesk text-xs text-grey3 w-14 text-right">
          {currentStep} / {STEPS.length}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-grey5">
        <motion.div
          className="h-full bg-mainPurple"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-6 py-12 overflow-hidden">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Step label — inside animation so it slides with the content */}
              <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.15em] mb-6">
                {STEPS[currentStep - 1].label}
              </p>

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
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
