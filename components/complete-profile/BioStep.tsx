'use client'

import { useState } from 'react'

interface BioStepProps {
  value: string
  onUpdate: (bio: string) => void
  onNext: () => void
  onBack: () => void
}

const SUGGESTED_MIN = 50

export default function BioStep({ value, onUpdate, onNext, onBack }: BioStepProps) {
  const [bio, setBio] = useState(value)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isSuggested = bio.length >= SUGGESTED_MIN
  const remaining = SUGGESTED_MIN - bio.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bio.trim() }),
      })
      if (res.ok) { onUpdate(bio.trim()); onNext() }
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
        <h2 className="font-satoshi font-black text-[27px] tracking-[-0.03em] leading-[1.12] text-[#15131C] dark:text-content mb-1.5">
          Tell us about yourself
        </h2>
        <p className="text-[15px] font-medium text-[#8B8499] dark:text-content-muted leading-relaxed">
          Write a short bio that describes who you are and what you do.
        </p>
      </div>

      <div>
        <label htmlFor="bio" className="block text-[13px] font-bold text-[#15131C] dark:text-content mb-1.5">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => { setBio(e.target.value); onUpdate(e.target.value) }}
          placeholder="I'm a passionate professional who loves…"
          rows={5}
          className="w-full px-[15px] py-[13px] border border-[#E2E1EA] dark:border-line rounded-xl bg-white dark:bg-surface-sunken text-[14.5px] font-medium text-[#15131C] dark:text-content placeholder:text-[#B6B0C0] dark:placeholder:text-content-subtle outline-none focus:border-[#A98BE8] dark:focus:border-[#6a4fb0] transition-colors resize-none leading-relaxed"
          disabled={saving}
        />
        <div className="flex justify-between items-center mt-2">
          {error ? (
            <p className="text-xs font-medium text-errorRed">{error}</p>
          ) : (
            <p className={`text-xs font-medium ${isSuggested ? 'text-successGreen' : 'text-[#9098A3] dark:text-content-subtle'}`}>
              {isSuggested ? 'Looks great!' : bio.length > 0 ? `${remaining} more characters suggested` : 'Optional'}
            </p>
          )}
          <span className={`text-xs font-medium tabular-nums ${isSuggested ? 'text-successGreen' : 'text-[#9098A3] dark:text-content-subtle'}`}>
            {bio.length} / {SUGGESTED_MIN}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={saving}
          className="flex-1 py-3.5 rounded-xl border border-[#E2E1EA] dark:border-line bg-white dark:bg-surface-raised text-[14px] font-bold text-[#374151] dark:text-content-muted hover:border-[#B9B9C6] dark:hover:border-content-subtle transition-colors disabled:opacity-50">
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
