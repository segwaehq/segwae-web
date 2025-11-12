'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa'

export default function SignupPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-mainPurple to-blue flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <p className="font-openSans text-grey3 text-center">Loading…</p>
          </div>
        </div>
      }
    >
      <PasswordContent />
    </Suspense>
  )
}

function PasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Get user data from URL params
  const name = searchParams.get('name') || ''
  const email = searchParams.get('email') || ''
  const username = searchParams.get('username') || ''
  const phone = searchParams.get('phone') || ''
  const title = searchParams.get('title') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if required data is missing
  if (!name || !email || !username) {
    router.push('/signup')
    return null
  }

  // Password strength validation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '' }

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordValid = password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Create account with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            username: username,
            phone: phone || null,
            title: title || null,
          },
          emailRedirectTo: `${window.location.origin}/dashboard/profile`,
        },
      })

      if (error) throw error

      if (data.user) {
        toast.success('Account created! Please check your email for verification code.')
        // Navigate to OTP verification page
        router.push(`/signup/verify?email=${encodeURIComponent(email)}`)
      }
    } catch (err) {
      console.error('Signup error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-mainPurple to-blue flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
            Create Password
          </h1>
          <p className="font-openSans text-grey3">
            Step 2 of 3: Set a secure password
          </p>
        </div>

        {/* User Info Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-grey4">
          <p className="font-openSans text-sm text-grey3">
            Creating account for: <strong className="text-grey1">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                placeholder="Enter password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-grey3 cursor-pointer hover:text-grey1"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-openSans text-grey3">
                    Password strength:
                  </span>
                  <span className={`text-xs font-semibold font-openSans ${
                    passwordStrength.label === 'Strong' ? 'text-green-600' :
                    passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 bg-grey4 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Password Requirements */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs font-openSans">
                {passwordValid ? (
                  <FaCheck className="w-3 h-3 text-green-500" />
                ) : (
                  <FaTimes className="w-3 h-3 text-grey3" />
                )}
                <span className={passwordValid ? 'text-green-600' : 'text-grey3'}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-openSans">
                {/[A-Z]/.test(password) ? (
                  <FaCheck className="w-3 h-3 text-green-500" />
                ) : (
                  <FaTimes className="w-3 h-3 text-grey3" />
                )}
                <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-grey3'}>
                  One uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-openSans">
                {/[a-z]/.test(password) ? (
                  <FaCheck className="w-3 h-3 text-green-500" />
                ) : (
                  <FaTimes className="w-3 h-3 text-grey3" />
                )}
                <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-grey3'}>
                  One lowercase letter
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-openSans">
                {/[0-9]/.test(password) ? (
                  <FaCheck className="w-3 h-3 text-green-500" />
                ) : (
                  <FaTimes className="w-3 h-3 text-grey3" />
                )}
                <span className={/[0-9]/.test(password) ? 'text-green-600' : 'text-grey3'}>
                  One number
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-openSans">
                {/[^a-zA-Z0-9]/.test(password) ? (
                  <FaCheck className="w-3 h-3 text-green-500" />
                ) : (
                  <FaTimes className="w-3 h-3 text-grey3" />
                )}
                <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : 'text-grey3'}>
                  One special character
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                placeholder="Confirm password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-grey3 cursor-pointer hover:text-grey1"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
              {confirmPassword && (
                <div className="absolute right-14 top-1/2 -translate-y-1/2">
                  {passwordsMatch ? (
                    <FaCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <FaTimes className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-500 font-openSans">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-mainPurple text-mainPurple rounded-lg font-spaceGrotesk font-semibold cursor-pointer hover:bg-mainPurple hover:bg-opacity-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !passwordValid || !passwordsMatch}
              className="flex-1 px-6 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>
          </div>
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
