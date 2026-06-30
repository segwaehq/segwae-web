'use client'

import { useState } from 'react'
import { FaArrowRight } from 'react-icons/fa6'

interface PortfolioStepProps {
  value: string
  onUpdate: (url: string) => void
  onComplete: () => Promise<string | null>
  onBack: () => void
}

export default function PortfolioStep({ value, onUpdate, onComplete, onBack }: PortfolioStepProps) {
  const [url, setUrl] = useState(value)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (url.trim()) {
      try { new URL(url) } catch { setError('Please enter a valid URL (e.g. https://example.com)'); return }
    }

    setSaving(true)
    try {
      if (url.trim()) {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portfolio_or_website_link: url.trim() }),
        })
        if (!res.ok) {
          setError('Failed to save. Please try again.')
          setSaving(false)
          return
        }
        onUpdate(url.trim())
      }
      const err = await onComplete()
      if (err) { setError(err); setSaving(false) }
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <h2 className="font-satoshi font-black text-[27px] tracking-[-0.03em] leading-[1.12] text-[#15131C] mb-1.5">
          Add your portfolio or website
        </h2>
        <p className="text-[15px] font-medium text-[#8B8499] leading-relaxed">
          Share a link to your portfolio, personal website, or any page that showcases your work. This is optional — you can skip it and add one later.
        </p>
      </div>

      <div>
        <label htmlFor="portfolio" className="block text-[13px] font-bold text-[#15131C] mb-1.5">
          Portfolio / Website URL <span className="text-[#9098A3] font-medium">(optional)</span>
        </label>
        <input
          type="url"
          id="portfolio"
          value={url}
          onChange={(e) => { setUrl(e.target.value); onUpdate(e.target.value) }}
          placeholder="https://yourwebsite.com"
          className="w-full px-[15px] py-[13px] border border-[#E2E1EA] rounded-xl bg-white text-[14.5px] font-medium text-[#15131C] placeholder:text-[#B6B0C0] outline-none focus:border-[#A98BE8] transition-colors"
          disabled={saving}
        />
        {error && <p className="mt-2 text-xs font-medium text-errorRed">{error}</p>}
      </div>

      {/* Finish callout */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F4F0FE] border border-[#E6DCFB]">
        <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shrink-0">
          <FaArrowRight className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#15131C]">Almost done</p>
          <p className="text-xs font-medium text-[#6B6478] mt-0.5 leading-relaxed">
            After this step your profile goes live and becomes visible to everyone.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={saving}
          className="flex-1 py-3.5 rounded-xl border border-[#E2E1EA] bg-white text-[14px] font-bold text-[#374151] hover:border-[#B9B9C6] transition-colors disabled:opacity-50">
          Back
        </button>
        <button type="submit" disabled={saving}
          className="flex-2 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-gradient text-white text-[15px] font-bold shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Finishing…' : 'Complete Profile'}
        </button>
      </div>
    </form>
  )
}
