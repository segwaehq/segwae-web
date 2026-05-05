'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaBriefcase } from 'react-icons/fa6'
import { portalLoginAction } from './actions'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    const result = await portalLoginAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/jobs-portal/jobs')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey6 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-mainPurple flex items-center justify-center mx-auto mb-4">
            <FaBriefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-satoshi font-black text-3xl text-grey1 mb-1">Jobs Portal</h1>
          <p className="font-openSans text-sm text-grey3">Sign in to manage job listings</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-grey4/50">
          {searchParams.get('error') === 'unauthorized' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="font-openSans text-red-600 text-sm">
                Your account does not have access to the Jobs Portal.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block font-satoshi font-semibold text-sm text-grey1 mb-1.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans text-sm text-grey1 placeholder:text-grey3"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-satoshi font-semibold text-sm text-grey1 mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans text-sm text-grey1 placeholder:text-grey3"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="font-openSans text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mainPurple text-white py-3 rounded-xl font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="font-openSans text-xs text-grey3 hover:text-grey1 transition-colors">
            ← Back to Segwae
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function JobsPortalLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-grey6">
        <div className="w-6 h-6 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
