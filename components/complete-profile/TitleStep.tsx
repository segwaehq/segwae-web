'use client'

import { useState } from 'react'

interface TitleStepProps {
  value: string
  onUpdate: (title: string) => void
  onNext: () => void
  onBack: () => void
}

export default function TitleStep({ value, onUpdate, onNext, onBack }: TitleStepProps) {
  const [title, setTitle] = useState(value)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Job title is required'); return }
    if (title.trim().length < 2) { setError('Job title must be at least 2 characters'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })
      if (res.ok) { onUpdate(title.trim()); onNext() }
      else setError('Failed to save. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="font-satoshi font-black text-3xl text-grey1 mb-2">
          What&apos;s your job title?
        </h2>
        <p className="font-openSans text-grey3 text-sm leading-relaxed">
          Let people know what you do professionally.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
          Job Title / Position
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Software Engineer, Product Designer"
          className="w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 transition-colors"
          disabled={saving}
        />
        {error && <p className="mt-2 text-xs text-errorRed font-openSans">{error}</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={saving}
          className="flex-1 py-3.5 border border-grey4 text-grey2 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-grey3 transition-colors disabled:opacity-50">
          Back
        </button>
        <button type="submit" disabled={saving}
          className="flex-2 px-8 py-3.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
