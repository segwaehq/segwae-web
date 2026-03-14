'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FaSpinner } from 'react-icons/fa6'
import AuthLayout from '@/components/AuthLayout'

export default function SignupVerifyPage() {
  return (
    <Suspense fallback={<AuthLayout step={3} totalSteps={3}><div className="h-96" /></AuthLayout>}>
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

  useEffect(() => {
    if (!email) router.push('/signup')
  }, [email, router])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  if (!email) return null

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Please enter a 6-digit code'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' })
      if (error) throw error
      toast.success('Email verified! Welcome to Segwae!')
      router.push('/complete-profile')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      toast.success('Verification code sent!')
      setCanResend(false)
      setCountdown(60)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout step={3} totalSteps={3}>
      <div className="mb-8">
        <h1 className="font-satoshi font-black text-3xl text-grey1 mb-2">
          Check your email
        </h1>
        <p className="font-openSans text-grey3 text-sm">
          We sent a 6-digit code to
        </p>
        <p className="font-spaceGrotesk font-semibold text-grey1 text-sm mt-0.5">
          {email}
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label htmlFor="otp" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
            Verification Code
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            className="w-full px-4 py-4 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-satoshi font-bold text-center text-3xl tracking-[0.6em] text-grey1 placeholder:text-grey4 placeholder:tracking-[0.3em] transition-colors"
            placeholder="······"
            disabled={loading}
          />
          <p className="mt-2 text-xs text-grey3 font-openSans text-center">
            Can&apos;t find it? Check your spam folder.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-mainPurple text-white py-3 rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="w-4 h-4 animate-spin" />
              Verifying…
            </span>
          ) : 'Verify & Continue'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resending}
            className="font-openSans text-sm text-mainPurple hover:underline disabled:text-grey3 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
          >
            {resending ? (
              <span className="flex items-center gap-2">
                <FaSpinner className="w-3 h-3 animate-spin" />
                Sending…
              </span>
            ) : canResend ? 'Resend code' : `Resend in ${countdown}s`}
          </button>
        </div>

        <button type="button" onClick={() => router.push('/signup')}
          className="w-full text-grey3 hover:text-grey1 transition-colors font-openSans text-sm cursor-pointer">
          ← Start over
        </button>
      </form>

      <p className="font-openSans text-grey3 text-sm text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-mainPurple font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
