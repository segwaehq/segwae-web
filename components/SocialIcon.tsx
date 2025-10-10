'use client'

import {
  FaLinkedin,
  FaGithub,
  FaXTwitter,
  FaInstagram,
  FaFacebook,
  FaDribbble,
  FaBehance,
  FaWhatsapp,
  FaYoutube,
  FaTiktok,
  FaGlobe,
  FaMedium,
  FaStackOverflow,
  FaFigma,
} from 'react-icons/fa6'
import { IconType } from 'react-icons'
import { SOCIAL_PLATFORMS } from '@/lib/constants'

interface SocialIconProps {
  platform: string
  url: string
  profileId: string
  size?: number
}

const iconMap: Record<string, IconType> = {
  FaLinkedin,
  FaGithub,
  FaXTwitter,
  FaInstagram,
  FaFacebook,
  FaDribbble,
  FaBehance,
  FaWhatsapp,
  FaYoutube,
  FaTiktok,
  FaGlobe,
  FaMedium,
  FaStackOverflow,
  FaFigma,
}

export default function SocialIcon({ platform, url, profileId, size = 24 }: SocialIconProps) {
  const platformData = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]
  if (!platformData) return null

  const IconComponent = iconMap[platformData.icon]
  if (!IconComponent) return null

  const handleClick = async () => {
    // Track analytics client-side
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          eventType: 'link_click',
          linkType: platform,
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
      className="group relative"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
        style={{ backgroundColor: platformData.color + '20' }}
      >
        <IconComponent size={size} color={platformData.color} />
      </div>
      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {platformData.name}
      </span>
    </a>
  )
}