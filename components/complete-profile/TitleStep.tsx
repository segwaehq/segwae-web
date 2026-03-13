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

    if (!title.trim()) {
      setError('Job title is required')
      return
    }

    if (title.trim().length < 2) {
      setError('Job title must be at least 2 characters')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })

      if (res.ok) {
        onUpdate(title.trim())
        onNext()
      } else {
        setError('Failed to save job title. Please try again.')
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
          What&apos;s your job title?
        </h2>
        <p className="text-grey3 text-sm">
          Let people know what you do professionally.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-grey2 mb-2">
          Job Title / Position
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Software Engineer, Product Designer"
          className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all text-grey1"
        />
        {error && (
          <p className="mt-2 text-sm text-errorRed">{error}</p>
        )}
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
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
