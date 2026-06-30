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
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <h2 className="font-satoshi font-black text-[27px] tracking-[-0.03em] leading-[1.12] text-[#15131C] mb-1.5">
          Add your phone number
        </h2>
        <p className="text-[15px] font-medium text-[#8B8499] leading-relaxed">
          Helps people reach you directly from your profile. You can control visibility in settings.
        </p>
      </div>

      <div>
        <label htmlFor="phone" className="block text-[13px] font-bold text-[#15131C] mb-1.5">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234 800 000 0000"
          className="w-full px-[15px] py-[13px] border border-[#E2E1EA] rounded-xl bg-white text-[14.5px] font-medium text-[#15131C] placeholder:text-[#B6B0C0] outline-none focus:border-[#A98BE8] transition-colors"
          disabled={saving}
        />
        {error && <p className="mt-2 text-xs font-medium text-errorRed">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-gradient text-white text-[15px] font-bold shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving…' : 'Continue'}
      </button>
    </form>
  )
}
