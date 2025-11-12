'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FaSpinner } from 'react-icons/fa'

export default function SignupVerifyPage() {
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
      <VerifyContent />
    </Suspense>
  )
}

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  // Don't render if email is missing
  if (!email) {
    return null
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      })

      if (error) throw error

      toast.success('Email verified! Welcome to Segwae!')
      router.push('/dashboard/profile')
      router.refresh()
    } catch (err) {
      console.error('OTP verification error:', err)
      toast.error(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setResending(true)

    try {
      // Resend OTP by triggering a new signup (Supabase will send another OTP to existing signup)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) throw error

      toast.success('Verification code sent!')
      setCanResend(false)
      setCountdown(60)
    } catch (err) {
      console.error('Resend error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-mainPurple to-blue flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
            Verify Email
          </h1>
          <p className="font-openSans text-grey3">
            Step 3 of 3: Enter verification code
          </p>
        </div>

        {/* Email Display */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-openSans text-sm text-blue-800 text-center">
            We sent a 6-digit code to
          </p>
          <p className="font-openSans text-sm font-semibold text-blue-900 text-center mt-1">
            {email}
          </p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk text-center"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/\D/g, '')
                setOtp(value.slice(0, 6))
              }}
              required
              maxLength={6}
              className="w-full px-4 py-4 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans text-center text-3xl tracking-[0.5em] font-semibold"
              placeholder="000000"
              disabled={loading}
              autoComplete="one-time-code"
            />
            <p className="mt-2 text-xs text-grey3 font-openSans text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-mainPurple text-white py-3 rounded-lg font-spaceGrotesk font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="w-4 h-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              'Verify & Complete Signup'
            )}
          </button>

          {/* Resend Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || resending}
              className="font-openSans text-sm text-mainPurple cursor-pointer hover:underline disabled:text-grey3 disabled:no-underline disabled:cursor-not-allowed"
            >
              {resending ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="w-3 h-3 animate-spin" />
                  Sending...
                </span>
              ) : canResend ? (
                'Resend code'
              ) : (
                `Resend code in ${countdown}s`
              )}
            </button>
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="w-full text-grey3 cursor-pointer hover:text-grey1 transition-colors font-openSans text-sm"
          >
            ← Start over
          </button>
        </form>

        {/* Tips */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-grey4">
          <p className="font-openSans text-xs text-grey3">
            <strong className="font-semibold text-grey1">Tip:</strong> Check your spam folder if you don&apos;t see the email. The code expires in 60 minutes.
          </p>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
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
