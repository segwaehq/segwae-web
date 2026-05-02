'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FaSpinner, FaEnvelope } from 'react-icons/fa6'
import AuthLayout from '@/components/AuthLayout'

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-12 h-12 bg-mainPurple/8 rounded-xl flex items-center justify-center mx-auto mb-5">
            <FaEnvelope className="w-5 h-5 text-mainPurple" />
          </div>
          <h1 className="font-satoshi font-bold text-2xl text-grey1 mb-3">
            Check your email
          </h1>
          <p className="font-openSans text-grey3 text-sm leading-relaxed mb-2">
            If an account exists for
          </p>
          <p className="font-satoshi font-semibold text-grey1 text-sm mb-4">
            {email}
          </p>
          <p className="font-openSans text-grey3 text-sm leading-relaxed mb-8">
            we&apos;ve sent a password reset link. Check your spam folder if you don&apos;t see it.
          </p>
          <Link
            href="/login"
            className="font-openSans text-sm text-mainPurple font-semibold hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <h1 className="font-satoshi font-bold text-2xl text-grey1 mb-2">
          Forgot your password?
        </h1>
        <p className="font-openSans text-grey3 text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-grey2 mb-1.5 font-satoshi">
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 transition-colors"
            placeholder="you@example.com"
            disabled={loading}
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-mainPurple text-white py-3 rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="w-4 h-4 animate-spin" />
              Sending…
            </span>
          ) : 'Send reset link'}
        </button>
      </form>

      <p className="font-openSans text-grey3 text-sm text-center mt-6">
        Remember it?{' '}
        <Link href="/login" className="text-mainPurple font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
