'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaPenNib } from 'react-icons/fa6'
import { studioLoginAction } from './actions'

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

    const result = await studioLoginAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/studio')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey6 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mainPurple">
            <FaPenNib className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-satoshi mb-1 text-3xl font-black text-grey1">Content Studio</h1>
          <p className="font-openSans text-sm text-grey3">Sign in to write and manage blog posts</p>
        </div>

        <div className="rounded-2xl border border-grey4/50 bg-white p-8 shadow-lg">
          {searchParams.get('error') === 'unauthorized' && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-openSans text-sm text-red-600">
                Your account does not have access to the Content Studio.
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="font-satoshi mb-1.5 block text-sm font-semibold text-grey1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="font-openSans w-full rounded-xl border border-grey4 px-4 py-3 text-sm text-grey1 outline-none transition-all placeholder:text-grey3 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="font-satoshi mb-1.5 block text-sm font-semibold text-grey1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="font-openSans w-full rounded-xl border border-grey4 px-4 py-3 text-sm text-grey1 outline-none transition-all placeholder:text-grey3 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-openSans text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-satoshi flex w-full items-center justify-center gap-2 rounded-xl bg-mainPurple py-3 text-sm font-semibold text-white transition-all hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="font-openSans text-xs text-grey3 transition-colors hover:text-grey1"
          >
            ← Back to Segwae
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function StudioLogin() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-grey6">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-mainPurple border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
