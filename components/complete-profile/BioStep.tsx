'use client'

import { useState } from 'react'

interface BioStepProps {
  value: string
  onUpdate: (bio: string) => void
  onNext: () => void
  onBack: () => void
}

const MIN = 50

export default function BioStep({ value, onUpdate, onNext, onBack }: BioStepProps) {
  const [bio, setBio] = useState(value)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isValid = bio.length >= MIN
  const remaining = MIN - bio.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!bio.trim()) { setError('Bio is required'); return }
    if (!isValid) { setError(`${remaining} more characters needed`); return }

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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="font-satoshi font-black text-3xl text-grey1 mb-2">
          Tell us about yourself
        </h2>
        <p className="font-openSans text-grey3 text-sm leading-relaxed">
          Write a short bio that describes who you are and what you do.
        </p>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="I'm a passionate professional who loves…"
          rows={5}
          className="w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 transition-colors resize-none"
          disabled={saving}
        />
        <div className="flex justify-between items-center mt-2">
          {error ? (
            <p className="text-xs text-errorRed font-openSans">{error}</p>
          ) : (
            <p className={`text-xs font-openSans ${isValid ? 'text-successGreen' : 'text-grey3'}`}>
              {isValid ? 'Looks great!' : `${remaining} more characters needed`}
            </p>
          )}
          <span className={`text-xs font-openSans tabular-nums ${isValid ? 'text-successGreen' : 'text-grey3'}`}>
            {bio.length} / {MIN}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={saving}
          className="flex-1 py-3.5 border border-grey4 text-grey2 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-grey3 transition-colors disabled:opacity-50">
          Back
        </button>
        <button type="submit" disabled={saving || !isValid}
          className="flex-2 px-8 py-3.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
