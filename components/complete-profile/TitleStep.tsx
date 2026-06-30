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
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <h2 className="font-satoshi font-black text-[27px] tracking-[-0.03em] leading-[1.12] text-[#15131C] mb-1.5">
          What&apos;s your job title?
        </h2>
        <p className="text-[15px] font-medium text-[#8B8499] leading-relaxed">
          Let people know what you do professionally.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-[13px] font-bold text-[#15131C] mb-1.5">
          Job Title / Position
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); onUpdate(e.target.value) }}
          placeholder="e.g. Software Engineer, Product Designer"
          className="w-full px-[15px] py-[13px] border border-[#E2E1EA] rounded-xl bg-white text-[14.5px] font-medium text-[#15131C] placeholder:text-[#B6B0C0] outline-none focus:border-[#A98BE8] transition-colors"
          disabled={saving}
        />
        {error && <p className="mt-2 text-xs font-medium text-errorRed">{error}</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={saving}
          className="flex-1 py-3.5 rounded-xl border border-[#E2E1EA] bg-white text-[14px] font-bold text-[#374151] hover:border-[#B9B9C6] transition-colors disabled:opacity-50">
          Back
        </button>
        <button type="submit" disabled={saving}
          className="flex-2 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-gradient text-white text-[15px] font-bold shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
