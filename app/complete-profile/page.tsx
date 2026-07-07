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

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'
  return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

export default function CompleteProfilePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [identity, setIdentity] = useState({ name: '', username: '' })
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
          setIdentity({
            name: data.profile?.name || '',
            username: data.profile?.custom_username || data.profile?.username || '',
          })
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
        setDone(true)
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

  const handle = identity.username || identity.name.replace(/\s+/g, '').toLowerCase() || 'yourname'
  const firstName = (identity.name || 'there').trim().split(/\s+/)[0]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F3F8] dark:bg-surface">
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ── Success ──────────────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-[radial-gradient(circle_at_50%_0%,#EBE3FB_0%,#F4F3F8_55%,#F4F3F8_100%)] dark:bg-[radial-gradient(circle_at_50%_0%,#1e1830_0%,#0e0c15_55%,#0e0c15_100%)]">
        <div className="w-[88px] h-[88px] rounded-full bg-brand-gradient flex items-center justify-center shadow-[0_18px_40px_-10px_rgba(74,55,216,0.5)] animate-scaleIn">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-satoshi font-black text-[32px] tracking-[-0.03em] text-[#15131C] dark:text-content mt-7 mb-2">
          You&apos;re all set, {firstName}!
        </h1>
        <p className="text-base font-medium text-grey3 dark:text-content-muted max-w-[380px] leading-relaxed">
          Your profile is live at{' '}
          <span className="font-extrabold text-[#5A2DD4] dark:text-[#b9a4f7]">segwae.com/{handle}</span>. Time to get discovered.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link
            href={identity.username ? `/profile/${identity.username}` : '/dashboard/profile'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-gradient text-white text-[15px] font-bold shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 transition-transform"
          >
            View my profile
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-surface-raised border border-[#E2E1EA] dark:border-line text-[15px] font-bold text-[#15131C] dark:text-content hover:border-[#B9B9C6] dark:hover:border-content-subtle transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    )
  }

  /* ── Builder ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_480px] bg-white dark:bg-surface">

      {/* LEFT: steps */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-12 min-w-0">
        {/* header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center" aria-label="Segwae home">
            <Image src="/wordmark.png" alt="Segwae" width={3834} height={992} className="h-7 w-auto dark:hidden" />
            <Image src="/wordmark_white.png" alt="Segwae" width={3834} height={992} className="h-7 w-auto hidden dark:block" />
          </Link>
          <span className="text-[13px] font-semibold text-[#9098A3] dark:text-content-subtle">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>

        {/* progress */}
        <div className="flex gap-1.5 mt-7 mb-9">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex-1 h-[5px] rounded-full transition-colors duration-300 ${
                s.id <= currentStep ? 'bg-brand-gradient' : 'bg-[#E2DFEC] dark:bg-line'
              }`}
            />
          ))}
        </div>

        {/* step body */}
        <div className="flex-1 w-full max-w-[520px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
            >
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
      </div>

      {/* RIGHT: live preview */}
      <div className="hidden lg:flex flex-col items-center justify-center p-10 border-l border-[#E4E2EC] dark:border-line bg-[radial-gradient(circle_at_50%_0%,#EBE3FB_0%,#E7E5EE_60%,#E7E5EE_100%)] dark:bg-[radial-gradient(circle_at_50%_0%,#1e1830_0%,#12101b_60%,#12101b_100%)]">
        <p className="text-xs font-bold tracking-[0.08em] uppercase text-[#A29CB0] dark:text-content-subtle mb-[18px]">Live preview</p>

        <div className="w-[300px] bg-[#0D0D11] rounded-[42px] p-2.5 shadow-[0_40px_80px_-30px_rgba(38,22,82,0.5)]">
          <div className="bg-white rounded-[33px] overflow-hidden">
            {/* gradient header band */}
            <div className="h-24 bg-brand-gradient relative">
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.16) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            </div>

            <div className="px-[18px] pb-[22px]">
              {/* avatar */}
              <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-brand-gradient -mt-9">
                <div className="relative w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-brand-gradient flex items-center justify-center text-[22px] font-black text-white">
                  {profileData.profile_image_url ? (
                    <Image src={profileData.profile_image_url} alt="" fill className="object-cover" />
                  ) : (
                    initialsOf(identity.name)
                  )}
                </div>
              </div>

              <div className="text-[19px] font-black tracking-[-0.02em] text-[#15131C] mt-[11px]">
                {identity.name || 'Your name'}
              </div>
              <div className="text-[13px] font-medium text-[#8B8499] mt-0.5">
                {profileData.title || 'Your title'}
              </div>
              <p className="text-[12.5px] leading-[1.55] font-medium text-[#4B4658] mt-3 min-h-[18px]">
                {profileData.bio || 'Your bio will appear here as you write it.'}
              </p>

              {(profileData.social_links.length > 0 || profileData.portfolio_or_website_link) && (
                <div className="flex gap-[7px] mt-4">
                  {profileData.social_links.slice(0, 4).map((lk) => (
                    <div
                      key={lk.id}
                      className="w-[34px] h-[34px] rounded-full bg-[#F4F0FE] flex items-center justify-center text-[11px] font-extrabold text-[#5A2DD4]"
                    >
                      {(lk.platform || '?').charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {profileData.portfolio_or_website_link && (
                    <div className="w-[34px] h-[34px] rounded-full bg-[#F4F0FE] flex items-center justify-center text-[#5A2DD4]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M9 7h8v8" />
                      </svg>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center mt-[18px] text-[11px] font-semibold text-[#B6B0C0]">
                segwae.com/{handle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
