'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa6'

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface Platform {
  id: string
  platform_identifier: string
  platform_name: string
  color_hex: string
}

interface SocialLinksStepProps {
  value: SocialLink[]
  onUpdate: (links: SocialLink[]) => void
  onNext: () => void
  onBack: () => void
}

export default function SocialLinksStep({ value, onUpdate, onNext, onBack }: SocialLinksStepProps) {
  const [links, setLinks] = useState<SocialLink[]>(value)
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [newPlatform, setNewPlatform] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch available platforms
  useEffect(() => {
    async function fetchPlatforms() {
      try {
        const res = await fetch('/api/social-platforms')
        if (res.ok) {
          const data = await res.json()
          // API returns array directly, not wrapped in { platforms: [...] }
          setPlatforms(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching platforms:', error)
      }
    }
    fetchPlatforms()
  }, [])

  // Fetch current links
  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch('/api/user/social-links')
        if (res.ok) {
          const data = await res.json()
          setLinks(data.socialLinks || [])
          onUpdate(data.socialLinks || [])
        }
      } catch (error) {
        console.error('Error fetching links:', error)
      }
    }
    if (value.length === 0) {
      fetchLinks()
    }
  }, [value.length, onUpdate])

  const handleAddLink = async () => {
    setError('')

    if (!newPlatform) {
      setError('Please select a platform')
      return
    }

    if (!newUrl.trim()) {
      setError('Please enter a URL')
      return
    }

    // Basic URL validation
    try {
      new URL(newUrl)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/user/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: newPlatform, url: newUrl.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        const updatedLinks = [...links, data.socialLink]
        setLinks(updatedLinks)
        onUpdate(updatedLinks)
        setNewPlatform('')
        setNewUrl('')
      } else {
        setError('Failed to add link. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    setDeleting(linkId)
    try {
      const res = await fetch(`/api/user/social-links/${linkId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        const updatedLinks = links.filter(l => l.id !== linkId)
        setLinks(updatedLinks)
        onUpdate(updatedLinks)
      }
    } catch (error) {
      console.error('Error deleting link:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleContinue = () => {
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-satoshi text-grey1 mb-2">
          Add your social links
        </h2>
        <p className="text-grey3 text-sm">
          Add links to help people connect with you on social media. (Optional)
        </p>
      </div>

      {/* Current Links */}
      {links.length > 0 && (
        <div className="space-y-3">
          {links.map((link) => {
            const platform = platforms.find(p => p.platform_identifier === link.platform)
            return (
              <div
                key={link.id}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-grey4"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: platform?.color_hex || '#6A0DAD' }}
                >
                  {(platform?.platform_name || link.platform).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-grey1 text-sm">
                    {platform?.platform_name || link.platform}
                  </p>
                  <p className="text-xs text-grey3 truncate">{link.url}</p>
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  disabled={deleting === link.id}
                  className="p-2 text-grey3 hover:text-errorRed transition-colors"
                >
                  {deleting === link.id ? (
                    <div className="w-4 h-4 border-2 border-grey3 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaTrash className="w-4 h-4" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Links Count */}
      {links.length > 0 && (
        <p className="text-sm text-grey3">
          {links.length} link{links.length !== 1 ? 's' : ''} added
        </p>
      )}

      {/* Add New Link Form */}
      <div className="bg-white rounded-xl border border-grey4 p-4 space-y-3">
        <p className="text-sm font-medium text-grey2">Add a new link</p>

        <select
          value={newPlatform}
          onChange={(e) => setNewPlatform(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all text-grey1 bg-white"
        >
          <option value="">Select platform</option>
          {platforms.map((platform) => (
            <option key={platform.id} value={platform.platform_identifier}>
              {platform.platform_name}
            </option>
          ))}
        </select>

        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all text-grey1"
        />

        <button
          onClick={handleAddLink}
          disabled={saving}
          className="w-full py-3 bg-grey5 text-grey1 rounded-full font-medium hover:bg-grey4 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-grey3 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FaPlus className="w-4 h-4" />
              Add Link
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-errorRed">{error}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 bg-grey5 text-grey2 rounded-full font-semibold hover:bg-grey4 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-3.5 bg-mainPurple cursor-pointer text-white rounded-full font-semibold hover:bg-mainPurple/90 transition-colors"
        >
          {links.length > 0 ? 'Continue' : 'Skip'}
        </button>
      </div>
    </div>
  )
}
