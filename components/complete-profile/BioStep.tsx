'use client'

import { useState } from 'react'

interface BioStepProps {
  value: string
  onUpdate: (bio: string) => void
  onNext: () => void
  onBack: () => void
}

const MIN_BIO_LENGTH = 50

export default function BioStep({ value, onUpdate, onNext, onBack }: BioStepProps) {
  const [bio, setBio] = useState(value)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const charCount = bio.length
  const isValid = charCount >= MIN_BIO_LENGTH

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!bio.trim()) {
      setError('Bio is required')
      return
    }

    if (!isValid) {
      setError(`Bio must be at least ${MIN_BIO_LENGTH} characters`)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bio.trim() }),
      })

      if (res.ok) {
        onUpdate(bio.trim())
        onNext()
      } else {
        setError('Failed to save bio. Please try again.')
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
          Tell us about yourself
        </h2>
        <p className="text-grey3 text-sm">
          Write a short bio that describes who you are and what you do.
        </p>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-grey2 mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="I'm a passionate professional who loves..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all text-grey1 resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          {error ? (
            <p className="text-sm text-errorRed">{error}</p>
          ) : (
            <p className={`text-sm ${isValid ? 'text-successGreen' : 'text-grey3'}`}>
              {isValid ? 'Looks great!' : `${MIN_BIO_LENGTH - charCount} more characters needed`}
            </p>
          )}
          <span className={`text-sm ${isValid ? 'text-successGreen' : 'text-grey3'}`}>
            {charCount}/{MIN_BIO_LENGTH}
          </span>
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
          disabled={saving || !isValid}
          className="flex-1 py-3.5 bg-mainPurple cursor-pointer text-white rounded-full font-semibold hover:bg-mainPurple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
