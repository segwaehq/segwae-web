'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ContactSettings {
  id: string
  whatsapp_number: string
  instagram_handle: string
}

interface Props {
  initialSettings: ContactSettings | null
}

export default function ContactSettingsForm({ initialSettings }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings?.whatsapp_number || ''
  )
  const [instagramHandle, setInstagramHandle] = useState(
    initialSettings?.instagram_handle || ''
  )

  const validateWhatsappNumber = (number: string): boolean => {
    // Must be digits only, 10-15 characters, starting with 1-9
    const regex = /^[1-9][0-9]{9,14}$/
    return regex.test(number)
  }

  const validateInstagramHandle = (handle: string): boolean => {
    return handle.trim().length > 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate inputs
    if (!validateWhatsappNumber(whatsappNumber)) {
      setError(
        'Invalid WhatsApp number format. Must be 10-15 digits, starting with country code (e.g., 2348012345678)'
      )
      return
    }

    if (!validateInstagramHandle(instagramHandle)) {
      setError('Instagram handle cannot be empty')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/contact-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsapp_number: whatsappNumber,
          instagram_handle: instagramHandle,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings')
      }

      setSuccess(true)
      router.refresh()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatWhatsappForDisplay = (number: string): string => {
    if (number.length < 10) return number

    // Format: +234 801 234 5678
    const countryCode = number.substring(0, 3)
    const firstPart = number.substring(3, 6)
    const secondPart = number.substring(6, 9)
    const thirdPart = number.substring(9)

    return `+${countryCode} ${firstPart} ${secondPart} ${thirdPart}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-errorRed/10 border border-errorRed/20 rounded-xl p-4">
          <p className="font-spaceGrotesk text-errorRed text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-successGreen/10 border border-successGreen/20 rounded-xl p-4">
          <p className="font-spaceGrotesk text-successGreen text-sm">
            ✓ Contact settings updated successfully!
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="whatsapp"
          className="block font-spaceGrotesk font-semibold text-sm mb-2"
        >
          WhatsApp Number
        </label>
        <input
          type="text"
          id="whatsapp"
          value={whatsappNumber}
          onChange={(e) => {
            // Only allow digits
            const value = e.target.value.replace(/\D/g, '')
            setWhatsappNumber(value)
          }}
          placeholder="2348012345678"
          className="w-full px-4 py-3 rounded-xl border border-grey4 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-mainPurple transition-all"
          required
        />
        {whatsappNumber && validateWhatsappNumber(whatsappNumber) && (
          <p className="mt-2 font-openSans text-sm text-grey2">
            Display format: {formatWhatsappForDisplay(whatsappNumber)}
          </p>
        )}
        {whatsappNumber && !validateWhatsappNumber(whatsappNumber) && (
          <p className="mt-2 font-openSans text-sm text-errorRed">
            Invalid format - must be 10-15 digits starting with 1-9
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="instagram"
          className="block font-spaceGrotesk font-semibold text-sm mb-2"
        >
          Instagram Handle
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-grey3">
            @
          </span>
          <input
            type="text"
            id="instagram"
            value={instagramHandle}
            onChange={(e) => {
              // Remove @ if user types it
              let value = e.target.value.replace('@', '')
              // Only allow alphanumeric, underscore, and period
              value = value.replace(/[^a-zA-Z0-9_.]/g, '')
              setInstagramHandle(value)
            }}
            placeholder="segwaehq"
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-grey4 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-mainPurple transition-all"
            required
          />
        </div>
        {instagramHandle && (
          <p className="mt-2 font-openSans text-sm text-grey2">
            Profile URL: instagram.com/{instagramHandle}
          </p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-mainPurple text-white font-spaceGrotesk font-semibold py-3 px-6 rounded-xl cursor-pointer hover:bg-mainPurple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
