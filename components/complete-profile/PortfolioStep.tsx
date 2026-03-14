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
    if (!url.trim()) { setError('Portfolio / website URL is required'); return }
    try { new URL(url) } catch { setError('Please enter a valid URL (e.g. https://example.com)'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_or_website_link: url.trim() }),
      })
      if (res.ok) {
        onUpdate(url.trim())
        const err = await onComplete()
        if (err) { setError(err); setSaving(false) }
      } else {
        setError('Failed to save. Please try again.')
        setSaving(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="font-satoshi font-black text-3xl text-grey1 mb-2">
          Add your portfolio or website
        </h2>
        <p className="font-openSans text-grey3 text-sm leading-relaxed">
          Share a link to your portfolio, personal website, or any page that showcases your work.
        </p>
      </div>

      <div>
        <label htmlFor="portfolio" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
          Portfolio / Website URL
        </label>
        <input
          type="url"
          id="portfolio"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 transition-colors"
          disabled={saving}
        />
        {error && <p className="mt-2 text-xs text-errorRed font-openSans">{error}</p>}
      </div>

      {/* Finish callout */}
      <div className="flex items-center gap-3 p-4 bg-mainPurple/5 border border-mainPurple/15 rounded-xl">
        <div className="w-9 h-9 rounded-full bg-mainPurple flex items-center justify-center shrink-0">
          <FaArrowRight className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="font-spaceGrotesk font-semibold text-grey1 text-sm">Almost done</p>
          <p className="font-openSans text-xs text-grey2 mt-0.5">
            After this step your profile goes live and becomes visible to everyone.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={saving}
          className="flex-1 py-3.5 border border-grey4 text-grey2 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-grey3 transition-colors disabled:opacity-50">
          Back
        </button>
        <button type="submit" disabled={saving}
          className="flex-2 px-8 py-3.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saving ? 'Finishing…' : 'Complete Profile'}
        </button>
      </div>
    </form>
  )
}
