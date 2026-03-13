'use client'

import { useState } from 'react'

interface PhoneStepProps {
  value: string
  onUpdate: (phone: string) => void
  onNext: () => void
}

export default function PhoneStep({ value, onUpdate, onNext }: PhoneStepProps) {
  const [phone, setPhone] = useState(value)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const validatePhone = (phoneNumber: string) => {
    // Basic phone validation - at least 10 digits
    const digits = phoneNumber.replace(/\D/g, '')
    return digits.length >= 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) {
      setError('Phone number is required')
      return
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (at least 10 digits)')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      })

      if (res.ok) {
        onUpdate(phone.trim())
        onNext()
      } else {
        setError('Failed to save phone number. Please try again.')
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
          Add your phone number
        </h2>
        <p className="text-grey3 text-sm">
          This helps people reach you directly from your profile. <br /> You can disable it from showing on your public profile later in Settings.
        </p>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-grey2 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234 800 000 0000"
          className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all text-grey1"
        />
        {error && (
          <p className="mt-2 text-sm text-errorRed">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3.5 bg-mainPurple cursor-pointer text-white rounded-full font-semibold hover:bg-mainPurple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Saving...' : 'Continue'}
      </button>
    </form>
  )
}
