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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!phone.trim()) { setError('Phone number is required'); return }
    if (phone.replace(/\D/g, '').length < 10) { setError('Please enter a valid phone number'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      })
      if (res.ok) { onUpdate(phone.trim()); onNext() }
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
          Add your phone number
        </h2>
        <p className="font-openSans text-grey3 text-sm leading-relaxed">
          Helps people reach you directly from your profile. You can control visibility in settings.
        </p>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234 800 000 0000"
          className="w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 transition-colors"
          disabled={saving}
        />
        {error && <p className="mt-2 text-xs text-errorRed font-openSans">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Saving…' : 'Continue'}
      </button>
    </form>
  )
}
