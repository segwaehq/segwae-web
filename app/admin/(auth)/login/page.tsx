'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginAction } from './actions'

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

    const result = await loginAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Redirect to admin dashboard
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey6 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-satoshi font-black text-4xl mb-2">Admin Login</h1>
          <p className="font-openSans text-grey2">Access the admin dashboard</p>
        </div>

        {searchParams.get('error') === 'unauthorized' && (
          <div className="bg-errorRed/10 border border-errorRed rounded-xl p-4 mb-6">
            <p className="font-openSans text-errorRed text-sm">
              You do not have admin access. Please contact the administrator.
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block font-spaceGrotesk font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
              placeholder="admin@segwae.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-spaceGrotesk font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-errorRed/10 border border-errorRed rounded-xl p-4">
              <p className="font-openSans text-errorRed text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mainPurple text-white py-3 rounded-xl font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-mainPurple hover:underline font-spaceGrotesk text-sm">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-grey6">
        <div className="text-grey2">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}