'use client'

import { useState } from 'react'
import { submitToWaitlist } from '@/lib/supabase'
import { NIGERIAN_STATES } from '@/lib/constants'

export default function WaitlistForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: submitError } = await submitToWaitlist(name, email, state)

    setLoading(false)

    console.log(data)
    if (submitError) {
      console.log(submitError)
      if (submitError.includes('duplicate')) {
        setError('This email is already on the waitlist!')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } else {
      setSuccess(true)
      setName('')
      setEmail('')
      setState('')
    }
  }

  if (success) {
    return (
      <div className="bg-successGreen/10 border border-successGreen rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-successGreen rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="font-spaceGrotesk font-bold text-2xl mb-2">Thank You!</h3>
        <p className="font-openSans text-grey2">
          You&apos;ve been added to our waitlist. We&apos;ll notify you about upcoming events in your area.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block font-spaceGrotesk font-semibold mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block font-spaceGrotesk font-semibold mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="state" className="block font-spaceGrotesk font-semibold mb-2">
          Where do you attend events the most?
        </label>
        <select
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
        >
          <option value="">Select a state</option>
          {NIGERIAN_STATES.map((stateName) => (
            <option key={stateName} value={stateName}>
              {stateName}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-errorRed/10 border border-errorRed rounded-xl p-4">
          <p className="font-openSans text-errorRed text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-mainPurple text-white py-3 rounded-xl font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? 'Joining...' : 'Join Waitlist'}
      </button>
    </form>
  )
}