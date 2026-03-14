'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaEnvelope, FaInstagram, FaLinkedinIn, FaXTwitter, FaArrowLeft } from 'react-icons/fa6'

const inputClass =
  'w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to send message')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-successGreen/10 border border-successGreen/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-successGreen" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-satoshi font-black text-3xl text-grey1 mb-2">Message sent</h2>
          <p className="font-openSans text-sm text-grey3 leading-relaxed mb-8">
            Thanks for reaching out. We&apos;ll get back to you as soon as possible.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({ name: '', email: '', subject: '', message: '' })
              }}
              className="px-6 py-3 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors"
            >
              Send Another Message
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-grey4 text-grey2 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-grey3 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left panel ────────────────────────────────────────────── */}
      <div className="relative lg:w-[42%] bg-[#080B14] flex flex-col px-10 py-12 lg:py-16 overflow-hidden">
        {/* Background dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Purple glow */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-mainPurple/20 blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 mb-16">
          <Link href="/">
            <Image
              src="/wordmark_white.png"
              alt="Segwae"
              width={0}
              height={0}
              sizes="100vw"
              className="h-7 w-auto!"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1">
          <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple/80 uppercase tracking-[0.2em] mb-4">
            Contact
          </p>
          <h1 className="font-satoshi font-black text-4xl lg:text-5xl text-white leading-[1.05] mb-6">
            Let&apos;s talk.
          </h1>
          <p className="font-openSans text-white/50 text-sm leading-relaxed max-w-xs mb-12">
            Whether you have a question, a partnership idea, or just want to say hello — we&apos;re always happy to hear from you.
          </p>

          {/* Contact details */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                <FaEnvelope className="w-3.5 h-3.5 text-white/60" />
              </div>
              <div>
                <p className="font-spaceGrotesk text-xs text-white/30 mb-0.5 uppercase tracking-[0.12em]">Email</p>
                <a
                  href="mailto:hello@segwae.com"
                  className="font-openSans text-sm text-white/80 hover:text-white transition-colors"
                >
                  hello@segwae.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
              </div>
              <div>
                <p className="font-spaceGrotesk text-xs text-white/30 mb-0.5 uppercase tracking-[0.12em]">Response time</p>
                <p className="font-openSans text-sm text-white/80">Within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="font-spaceGrotesk text-xs text-white/30 uppercase tracking-[0.12em] mb-4">Follow us</p>
            <div className="flex gap-3">
              {[
                { href: 'https://x.com/segwaehq', icon: FaXTwitter, label: 'X' },
                { href: 'https://www.linkedin.com/company/segwaehq', icon: FaLinkedinIn, label: 'LinkedIn' },
                { href: 'https://www.instagram.com/segwaehq', icon: FaInstagram, label: 'Instagram' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] transition-all"
                  title={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="relative z-10 mt-16">
          <Link
            href="/"
            className="flex items-center gap-2 font-spaceGrotesk text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" />
            Back to home
          </Link>
        </div>
      </div>

      {/* ── Right panel ───────────────────────────────────────────── */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-16 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-satoshi font-black text-3xl text-grey1 mb-1">Send a message</h2>
            <p className="font-openSans text-sm text-grey3">Fill in the form and we&apos;ll be in touch.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-xs font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="business">Business / Partnership</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className={`${inputClass} resize-none`}
                placeholder="Tell us how we can help…"
              />
            </div>

            {error && (
              <p className="text-xs text-errorRed font-openSans">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
