'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FaSpinner, FaEye, FaEyeSlash, FaCheck, FaXmark } from 'react-icons/fa6'
import AuthLayout from '@/components/AuthLayout'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [ready, setReady] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hasCode = new URLSearchParams(window.location.search).has('code')
    const timeout = setTimeout(() => setInvalid(true), 10000)

    // Supabase auto-exchanges the PKCE code — check if it already happened
    if (hasCode) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          clearTimeout(timeout)
          setReady(true)
        }
      })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        clearTimeout(timeout)
        setReady(true)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    if (score <= 2) return { score, label: 'Weak', color: 'bg-errorRed' }
    if (score <= 4) return { score, label: 'Medium', color: 'bg-warningYellow' }
    return { score, label: 'Strong', color: 'bg-successGreen' }
  }

  const strength = getStrength()
  const passwordValid = password.length >= 8
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^a-zA-Z0-9]/.test(password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated successfully!')
      router.push('/dashboard/profile')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 transition-colors disabled:bg-grey6"

  if (invalid) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-12 h-12 bg-errorRed/8 rounded-xl flex items-center justify-center mx-auto mb-5">
            <FaXmark className="w-5 h-5 text-errorRed" />
          </div>
          <h1 className="font-satoshi font-bold text-2xl text-grey1 mb-3">
            Link expired
          </h1>
          <p className="font-openSans text-grey3 text-sm leading-relaxed mb-8">
            This password reset link is invalid or has already been used. Request a new one below.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-mainPurple text-white px-6 py-3 rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
          >
            Request new link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (!ready) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <FaSpinner className="w-6 h-6 text-mainPurple animate-spin" />
          <p className="font-openSans text-grey3 text-sm">Verifying reset link…</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <h1 className="font-satoshi font-bold text-2xl text-grey1 mb-2">
          Set new password
        </h1>
        <p className="font-openSans text-grey3 text-sm">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-grey2 mb-1.5 font-satoshi">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={`${inputClass} pr-12`}
              placeholder="Enter new password"
              disabled={loading}
              autoFocus
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-grey3 hover:text-grey1 transition-colors cursor-pointer">
              {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
            </button>
          </div>

          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                    strength.score >= i * 2 ? strength.color : 'bg-grey4'
                  }`} />
                ))}
              </div>
              <p className={`text-xs font-openSans font-medium ${
                strength.label === 'Strong' ? 'text-successGreen' :
                strength.label === 'Medium' ? 'text-warningYellow' : 'text-errorRed'
              }`}>{strength.label}</p>
            </div>
          )}

          {password && (
            <div className="mt-3 grid grid-cols-1 gap-1">
              {requirements.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  {r.met
                    ? <FaCheck className="w-3 h-3 text-successGreen shrink-0" />
                    : <FaXmark className="w-3 h-3 text-grey4 shrink-0" />
                  }
                  <span className={`text-xs font-openSans ${r.met ? 'text-grey2' : 'text-grey3'}`}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-grey2 mb-1.5 font-satoshi">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`${inputClass} pr-20`}
              placeholder="Confirm new password"
              disabled={loading}
            />
            {confirmPassword && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                {passwordsMatch
                  ? <FaCheck className="w-4 h-4 text-successGreen" />
                  : <FaXmark className="w-4 h-4 text-errorRed" />
                }
              </div>
            )}
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-grey3 hover:text-grey1 transition-colors cursor-pointer">
              {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="mt-1 text-xs text-errorRed font-openSans">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !passwordValid || !passwordsMatch}
          className="w-full bg-mainPurple text-white py-3 rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="w-4 h-4 animate-spin" />
              Updating…
            </span>
          ) : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  )
}
