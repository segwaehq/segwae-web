'use client'

import { useState } from 'react'
import { FaEnvelope, FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { IoIosBusiness } from 'react-icons/io'
import { MdSupport } from 'react-icons/md'

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      // console.log(response)
      // console.log(data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-successGreen/10 border border-successGreen rounded-2xl p-8">
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
            <h2 className="font-satoshi font-black text-3xl mb-2">Message Sent!</h2>
            <p className="font-openSans text-grey2 mb-6">
              Thank you for contacting us. We&apos;ll get back to you as soon as possible.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({ name: '', email: '', subject: '', message: '' })
              }}
              className="text-mainPurple hover:underline font-spaceGrotesk font-semibold cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-satoshi font-black text-5xl mb-4">Get In Touch</h1>
          <p className="font-spaceGrotesk text-xl text-grey2 max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="font-spaceGrotesk font-bold text-3xl mb-6">Contact Information</h2>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-mainPurple/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="w-6 h-6 text-mainPurple" />
                </div>
                <div>
                  <h3 className="font-spaceGrotesk font-semibold text-lg mb-1">Email</h3>
                  <a
                    href="mailto:hello@segwae.com"
                    className="font-openSans text-grey2 hover:text-mainPurple"
                  >
                    hello@segwae.com
                  </a>
                </div>
              </div>

              {/* Support */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MdSupport className="w-6 h-6 text-blue" />
                </div>
                <div>
                  <h3 className="font-spaceGrotesk font-semibold text-lg mb-1">Support</h3>
                  <p className="font-openSans text-grey2">For technical issues and feature requests</p>
                </div>
              </div>

              {/* Business */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-successGreen/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <IoIosBusiness className="w-6 h-6 text-successGreen" />
                </div>
                <div>
                  <h3 className="font-spaceGrotesk font-semibold text-lg mb-1">Business Inquiries</h3>
                  <p className="font-openSans text-grey2">
                    Partnerships, bulk orders, and enterprise solutions
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-12">
              <h3 className="font-spaceGrotesk font-semibold text-lg mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://x.com/segwaehq"
                  className="w-12 h-12 bg-grey6 rounded-full flex items-center justify-center hover:bg-mainPurple hover:text-white transition-all"
                >
                  <FaXTwitter className="w-6 h-6" />
                </a>
                <a
                  href="https://www.linkedin.com/company/segwaehq"
                  className="w-12 h-12 bg-grey6 rounded-full flex items-center justify-center hover:bg-mainPurple hover:text-white transition-all"
                >
                  <FaLinkedin className="w-6 h-6" />
                </a>
                <a
                  href="https://www.instagram.com/segwaehq"
                  className="w-12 h-12 bg-grey6 rounded-full flex items-center justify-center hover:bg-mainPurple hover:text-white transition-all"
                >
                  <FaInstagram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-grey6 rounded-3xl p-8">
            <h2 className="font-spaceGrotesk font-bold text-3xl mb-6">Send us a message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block font-spaceGrotesk font-semibold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans bg-white"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-spaceGrotesk font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block font-spaceGrotesk font-semibold mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans bg-white"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="business">Business/Partnership</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block font-spaceGrotesk font-semibold mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans resize-none bg-white"
                  placeholder="Tell us how we can help..."
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
                className="w-full bg-mainPurple text-white py-3 rounded-xl font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
