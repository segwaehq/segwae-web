'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    title: '',
  })
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [loading, setLoading] = useState(false)
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false)

  // Auto-generate username from name
  useEffect(() => {
    if (!usernameManuallyEdited && formData.name) {
      const generated = generateUsernameFromName(formData.name)
      setFormData(prev => ({ ...prev, username: generated }))
    }
  }, [formData.name, usernameManuallyEdited])

  // Check username availability with debounce
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameStatus('idle')
      return
    }

    const timeoutId = setTimeout(async () => {
      await checkUsernameAvailability(formData.username)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.username])

  const generateUsernameFromName = (name: string): string => {
    // Clean the name: lowercase, remove special chars
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')

    // Limit to 27 characters
    const limitedName = cleanName.slice(0, 27)

    // Add 3 random digits
    const randomDigits = Math.floor(Math.random() * 900 + 100)

    return limitedName + randomDigits
  }

  const checkUsernameAvailability = async (username: string) => {
    setUsernameStatus('checking')

    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (data.available) {
        setUsernameStatus('available')
      } else {
        setUsernameStatus('taken')
      }
    } catch (err) {
      console.error('Error checking username:', err)
      setUsernameStatus('idle')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate username
    if (usernameStatus !== 'available') {
      toast.error('Please choose an available username')
      return
    }

    // Validate all required fields
    if (!formData.name || !formData.email || !formData.username) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Navigate to password page with form data
      router.push(`/signup/password?${new URLSearchParams({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        phone: formData.phone || '',
        title: formData.title || '',
      })}`)
    } catch (err) {
      toast.error('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    setUsernameManuallyEdited(true)
    setFormData(prev => ({ ...prev, username: value }))
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-mainPurple to-blue flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
            Create Account
          </h1>
          <p className="font-openSans text-grey3">
            Step 1 of 3: Enter your details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
            >
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                required
                minLength={3}
                maxLength={30}
                pattern="^[a-z0-9]+$"
                className="w-full px-4 py-3 pr-12 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans lowercase"
                placeholder="johndoe123"
                disabled={loading}
              />
              {usernameStatus === 'checking' && (
                <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grey3 animate-spin" />
              )}
              {usernameStatus === 'available' && (
                <FaCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
              {usernameStatus === 'taken' && (
                <FaTimes className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="mt-1 text-xs text-grey3 font-openSans">
              {usernameStatus === 'taken' && 'Username already taken'}
              {usernameStatus === 'available' && 'Username available'}
              {usernameStatus === 'idle' && 'Only lowercase letters and numbers'}
            </p>
          </div>

          {/* Phone (Optional) */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
              placeholder="+234 800 000 0000"
              disabled={loading}
            />
          </div>

          {/* Title/Role (Optional) */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
            >
              Professional Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
              placeholder="Software Engineer"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || usernameStatus !== 'available'}
            className="w-full bg-mainPurple text-white py-3 rounded-lg font-spaceGrotesk font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Processing...' : 'Continue to Password'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-grey3 font-openSans text-sm">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-mainPurple hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
