'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FaEye, FaEyeSlash, FaCheck, FaXmark } from 'react-icons/fa6'
import AuthLayout from '@/components/AuthLayout'

export default function SignupPasswordPage() {
  return (
    <Suspense fallback={<AuthLayout step={2} totalSteps={3}><div className="h-96" /></AuthLayout>}>
      <PasswordContent />
    </Suspense>
  )
}

function PasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

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

  if (!name || !email || !username) {
    router.push('/signup')
    return null
  }

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
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, username, phone: phone || null, title: title || null },
          emailRedirectTo: `${window.location.origin}/dashboard/profile`,
        },
      })
      if (error) throw error
      if (data.user) {
        toast.success('Account created! Check your email for a verification code.')
        router.push(`/signup/verify?email=${encodeURIComponent(email)}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 transition-colors disabled:bg-grey6"

  return (
    <AuthLayout step={2} totalSteps={3}>
      <div className="mb-7">
        <h1 className="font-satoshi font-black text-3xl text-grey1 mb-2">
          Set your password
        </h1>
        <p className="font-openSans text-grey3 text-sm">
          Creating account for{' '}
          <span className="font-semibold text-grey1">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
            Password
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
              placeholder="Enter password"
              disabled={loading}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-grey3 hover:text-grey1 transition-colors cursor-pointer">
              {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
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

          {/* Requirements */}
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

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`${inputClass} pr-20`}
              placeholder="Confirm password"
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

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} disabled={loading}
            className="flex-1 py-3 border border-grey4 text-grey2 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-grey3 transition-colors disabled:opacity-50 cursor-pointer">
            Back
          </button>
          <button type="submit" disabled={loading || !passwordValid || !passwordsMatch}
            className="flex-2 px-8 py-3 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      </form>

      <p className="font-openSans text-grey3 text-sm text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-mainPurple font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
