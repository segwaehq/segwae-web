'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: name,
          },
        },
      })

      if (error) throw error

      toast.success('Verification code sent to your email')
      setStep('otp')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) throw error

      toast.success('Account created successfully!')
      // After successful verification, redirect to dashboard
      router.push('/dashboard/profile')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-mainPurple to-blue flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
            Create Account
          </h1>
          <p className="font-openSans text-grey3">
            {step === 'details'
              ? 'Get started with Segwae'
              : 'Enter the code sent to your email'}
          </p>
        </div>

        {/* Details Step */}
        {step === 'details' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mainPurple text-white py-3 rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending code...' : 'Continue'}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
              >
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans text-center text-2xl tracking-widest"
                placeholder="000000"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-grey3 font-openSans">
                Sent to {email}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mainPurple text-white py-3 rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button
              type="button"
              onClick={() => setStep('details')}
              className="w-full text-grey3 hover:text-grey1 transition-colors font-openSans text-sm"
            >
              ← Back to details
            </button>
          </form>
        )}

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
