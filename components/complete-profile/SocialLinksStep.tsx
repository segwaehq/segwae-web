'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa6'

interface SocialLink { id: string; platform: string; url: string }
interface Platform { id: string; platform_identifier: string; platform_name: string; color_hex: string }

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

  useEffect(() => {
    fetch('/api/social-platforms')
      .then(r => r.ok ? r.json() : [])
      .then(d => setPlatforms(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (value.length === 0) {
      fetch('/api/user/social-links')
        .then(r => r.ok ? r.json() : { socialLinks: [] })
        .then(d => { setLinks(d.socialLinks || []); onUpdate(d.socialLinks || []) })
        .catch(() => {})
    }
  }, [value.length, onUpdate])

  const handleAdd = async () => {
    setError('')
    if (!newPlatform) { setError('Please select a platform'); return }
    if (!newUrl.trim()) { setError('Please enter a URL'); return }
    try { new URL(newUrl) } catch { setError('Please enter a valid URL'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/user/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: newPlatform, url: newUrl.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        const updated = [...links, data.socialLink]
        setLinks(updated); onUpdate(updated)
        setNewPlatform(''); setNewUrl('')
      } else setError('Failed to add link. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/user/social-links/${id}`, { method: 'DELETE' })
      if (res.ok) {
        const updated = links.filter(l => l.id !== id)
        setLinks(updated); onUpdate(updated)
      }
    } catch { /* silent */ } finally {
      setDeleting(null)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors"

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-satoshi font-black text-3xl text-grey1 mb-2">
          Add your social links
        </h2>
        <p className="font-openSans text-grey3 text-sm leading-relaxed">
          Help people connect with you online. This step is optional.
        </p>
      </div>

      {/* Existing links */}
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link) => {
            const platform = platforms.find(p => p.platform_identifier === link.platform)
            return (
              <div key={link.id} className="flex items-center gap-3 p-3 border border-grey4 rounded-xl">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: platform?.color_hex || '#6A0DAD' }}
                >
                  {(platform?.platform_name || link.platform).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-spaceGrotesk font-semibold text-grey1 text-xs">
                    {platform?.platform_name || link.platform}
                  </p>
                  <p className="font-openSans text-xs text-grey3 truncate">{link.url}</p>
                </div>
                <button onClick={() => handleDelete(link.id)} disabled={deleting === link.id}
                  className="p-1.5 text-grey3 hover:text-errorRed transition-colors shrink-0">
                  {deleting === link.id
                    ? <div className="w-3.5 h-3.5 border-2 border-grey3 border-t-transparent rounded-full animate-spin" />
                    : <FaTrash className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
            )
          })}
          <p className="font-openSans text-xs text-grey3">{links.length} link{links.length !== 1 ? 's' : ''} added</p>
        </div>
      )}

      {/* Add new */}
      <div className="border border-grey4 rounded-xl p-4 space-y-3">
        <p className="font-spaceGrotesk text-xs font-semibold text-grey2">Add a link</p>
        <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} className={inputClass}>
          <option value="">Select platform</option>
          {platforms.map(p => (
            <option key={p.id} value={p.platform_identifier}>{p.platform_name}</option>
          ))}
        </select>
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
        {error && <p className="text-xs text-errorRed font-openSans">{error}</p>}
        <button onClick={handleAdd} disabled={saving}
          className="w-full py-2.5 border border-mainPurple/30 text-mainPurple rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-mainPurple/5 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {saving
            ? <div className="w-4 h-4 border-2 border-mainPurple border-t-transparent rounded-full animate-spin" />
            : <><FaPlus className="w-3.5 h-3.5" /> Add Link</>
          }
        </button>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 py-3.5 border border-grey4 text-grey2 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-grey3 transition-colors">
          Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-2 px-8 py-3.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors">
          {links.length > 0 ? 'Continue' : 'Skip'}
        </button>
      </div>
    </div>
  )
}
