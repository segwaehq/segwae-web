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

  const inputClass = "w-full px-[15px] py-[13px] border border-[#E2E1EA] rounded-xl bg-white text-[14.5px] font-medium text-[#15131C] placeholder:text-[#B6B0C0] outline-none focus:border-[#A98BE8] transition-colors"

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-satoshi font-black text-[27px] tracking-[-0.03em] leading-[1.12] text-[#15131C] mb-1.5">
          Add your social links
        </h2>
        <p className="text-[15px] font-medium text-[#8B8499] leading-relaxed">
          Help people connect with you online. This step is optional.
        </p>
      </div>

      {/* Existing links */}
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link) => {
            const platform = platforms.find(p => p.platform_identifier === link.platform)
            return (
              <div key={link.id} className="flex items-center gap-3 p-3 border border-[#E8E8EF] rounded-xl bg-white">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: platform?.color_hex || '#5A2DD4' }}
                >
                  {(platform?.platform_name || link.platform).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#15131C]">
                    {platform?.platform_name || link.platform}
                  </p>
                  <p className="text-xs font-medium text-[#9098A3] truncate">{link.url}</p>
                </div>
                <button onClick={() => handleDelete(link.id)} disabled={deleting === link.id}
                  className="p-1.5 text-[#9098A3] hover:text-errorRed transition-colors shrink-0">
                  {deleting === link.id
                    ? <div className="w-3.5 h-3.5 border-2 border-[#9098A3] border-t-transparent rounded-full animate-spin" />
                    : <FaTrash className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
            )
          })}
          <p className="text-xs font-medium text-[#9098A3]">{links.length} link{links.length !== 1 ? 's' : ''} added</p>
        </div>
      )}

      {/* Add new */}
      <div className="border border-[#E8E8EF] rounded-2xl p-4 space-y-3 bg-[#FAFAFB]">
        <p className="text-xs font-bold text-[#15131C]">Add a link</p>
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
        {error && <p className="text-xs font-medium text-errorRed">{error}</p>}
        <button onClick={handleAdd} disabled={saving}
          className="w-full py-2.5 border border-[#DDCEFA] text-[#5A2DD4] rounded-xl text-sm font-bold hover:bg-[#F4F0FE] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {saving
            ? <div className="w-4 h-4 border-2 border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
            : <><FaPlus className="w-3.5 h-3.5" /> Add Link</>
          }
        </button>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-[#E2E1EA] bg-white text-[14px] font-bold text-[#374151] hover:border-[#B9B9C6] transition-colors">
          Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-2 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-gradient text-white text-[15px] font-bold shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform">
          {links.length > 0 ? 'Continue' : 'Skip'}
        </button>
      </div>
    </div>
  )
}
