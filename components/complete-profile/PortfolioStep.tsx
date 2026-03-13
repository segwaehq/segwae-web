'use client'

import { useState } from 'react'

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

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Portfolio/Website URL is required')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_or_website_link: url.trim() }),
      })

      if (res.ok) {
        onUpdate(url.trim())
        const completionError = await onComplete()
        if (completionError) {
          setError(completionError)
          setSaving(false)
          return
        }
      } else {
        setError('Failed to save. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-satoshi text-grey1 mb-2">
          Add your portfolio or website
        </h2>
        <p className="text-grey3 text-sm">
          Share a link to your portfolio, personal website, or any page that showcases your work.
        </p>
      </div>

      <div>
        <label htmlFor="portfolio" className="block text-sm font-medium text-grey2 mb-2">
          Portfolio / Website URL
        </label>
        <input
          type="url"
          id="portfolio"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all text-grey1"
        />
        {error && (
          <p className="mt-2 text-sm text-errorRed">{error}</p>
        )}
      </div>

      {/* Completion Message */}
      <div className="bg-lightPurple/30 border border-mainPurple/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-mainPurple flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-grey1">Almost there!</p>
            <p className="text-sm text-grey2">
              After this step, your profile will be complete and visible to everyone.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 bg-grey5 cursor-pointer text-grey2 rounded-full font-semibold hover:bg-grey4 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3.5 bg-mainPurple cursor-pointer text-white rounded-full font-semibold hover:bg-mainPurple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Completing...' : 'Complete Profile'}
        </button>
      </div>
    </form>
  )
}
