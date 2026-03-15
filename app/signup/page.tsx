'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { FaSpinner, FaCheck, FaXmark } from 'react-icons/fa6'
import AuthLayout from '@/components/AuthLayout'

export default function SignupPage() {
  const router = useRouter()

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

  useEffect(() => {
    if (!usernameManuallyEdited && formData.name) {
      setFormData(prev => ({ ...prev, username: generateUsernameFromName(formData.name) }))
    }
  }, [formData.name, usernameManuallyEdited])

  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameStatus('idle')
      return
    }
    const id = setTimeout(() => checkUsernameAvailability(formData.username), 500)
    return () => clearTimeout(id)
  }, [formData.username])

  const generateUsernameFromName = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 27) +
    Math.floor(Math.random() * 900 + 100)

  const checkUsernameAvailability = async (username: string) => {
    setUsernameStatus('checking')
    try {
      const res = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      setUsernameStatus(data.available ? 'available' : 'taken')
    } catch {
      setUsernameStatus('idle')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameStatus !== 'available') {
      toast.error('Please choose an available username')
      return
    }
    if (!formData.name || !formData.email || !formData.username) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    router.push(`/signup/password?${new URLSearchParams({
      name: formData.name,
      email: formData.email,
      username: formData.username,
      phone: formData.phone || '',
      title: formData.title || '',
    })}`)
  }

  const inputClass = "w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 transition-colors disabled:bg-grey6 disabled:cursor-not-allowed"

  return (
    <AuthLayout step={1} totalSteps={3}>
      <div className="mb-7">
        <h1 className="font-satoshi font-black text-3xl text-grey1 mb-2">
          Create your account
        </h1>
        <p className="font-openSans text-grey3 text-sm">
          Tell us a bit about yourself to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
            Full Name <span className="text-errorRed">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className={inputClass}
            placeholder="John Doe"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
            Email Address <span className="text-errorRed">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className={inputClass}
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
            Username <span className="text-errorRed">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => {
                setUsernameManuallyEdited(true)
                setFormData(prev => ({ ...prev, username: e.target.value }))
              }}
              required
              minLength={3}
              maxLength={30}
              pattern="^[a-z0-9]+$"
              className={`${inputClass} pr-12 lowercase`}
              placeholder="johndoe123"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {usernameStatus === 'checking' && <FaSpinner className="w-4 h-4 text-grey3 animate-spin" />}
              {usernameStatus === 'available' && <FaCheck className="w-4 h-4 text-successGreen" />}
              {usernameStatus === 'taken' && <FaXmark className="w-4 h-4 text-errorRed" />}
            </div>
          </div>
          <p className={`mt-1 text-xs font-openSans ${
            usernameStatus === 'taken' ? 'text-errorRed' :
            usernameStatus === 'available' ? 'text-successGreen' : 'text-grey3'
          }`}>
            {usernameStatus === 'taken' && 'Username already taken'}
            {usernameStatus === 'available' && 'Username is available'}
            {(usernameStatus === 'idle' || usernameStatus === 'checking') && 'Only lowercase letters and numbers'}
          </p>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
            Phone Number <span className="text-grey3 font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className={inputClass}
            placeholder="+234 800 000 0000"
            disabled={loading}
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
            Professional Title <span className="text-grey3 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={inputClass}
            placeholder="Software Engineer"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || usernameStatus !== 'available'}
          className="w-full bg-mainPurple text-white py-3 rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
        >
          {loading ? 'Processing…' : 'Continue'}
        </button>
      </form>

      <p className="font-openSans text-grey3 text-sm text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-mainPurple font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
