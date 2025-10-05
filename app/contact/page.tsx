// 'use client'

// import { useState } from 'react'
// import type { Metadata } from 'next'

// export default function Contact() {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     subject: '',
//     message: '',
//   })
//   const [submitted, setSubmitted] = useState(false)

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // TODO: Implement contact form submission (e.g., send to email service)
//     console.log('Contact form submitted:', formData)
//     setSubmitted(true)
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     })
//   }

//   if (submitted) {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4">
//         <div className="max-w-md w-full text-center">
//           <div className="bg-successGreen/10 border border-successGreen rounded-2xl p-8">
//             <div className="w-16 h-16 bg-successGreen rounded-full flex items-center justify-center mx-auto mb-4">
//               <svg
//                 className="w-8 h-8 text-white"
//                 fill="none"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path d="M5 13l4 4L19 7"></path>
//               </svg>
//             </div>
//             <h2 className="font-satoshi font-black text-3xl mb-2">Message Sent!</h2>
//             <p className="font-openSans text-grey2 mb-6">
//               Thank you for contacting us. We'll get back to you as soon as possible.
//             </p>
//             <button
//               onClick={() => {
//                 setSubmitted(false)
//                 setFormData({ name: '', email: '', subject: '', message: '' })
//               }}
//               className="text-mainPurple hover:underline font-spaceGrotesk font-semibold"
//             >
//               Send Another Message
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen py-16 px-4">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-16">
//           <h1 className="font-satoshi font-black text-5xl mb-4">Get In Touch</h1>
//           <p className="font-spaceGrotesk text-xl text-grey2 max-w-2xl mx-auto">
//             Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-12">
//           {/* Contact Information */}
//           <div>
//             <h2 className="font-spaceGrotesk font-bold text-3xl mb-6">Contact Information</h2>

//             <div className="space-y-6">
//               {/* Email */}
//               <div className="flex items-start gap-4">
//                 <div className="w-12 h-12 bg-mainPurple/10 rounded-full flex items-center justify-center flex-shrink-0">
//                   <svg className="w-6 h-6 text-mainPurple" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                     <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="font-spaceGrotesk font-semibold text-lg mb-1">Email</h3>
//                   <a href="mailto:support@segwae.com" className="font-openSans text-grey2 hover:text-mainPurple">
//                     support@segwae.com
//                   </a>
//                 </div>
//               </div>

//               {/* Support */}
//               <div className="flex items-start gap-4">
//                 <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
//                   <svg className="w-6 h-6 text-blue" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="font-spaceGrotesk font-semibold text-lg mb-1">Support</h3>
//                   <p className="font-openSans text-grey2">
//                     For technical issues and feature requests
//                   </p>
//                 </div>
//               </div>

//               {/* Business */}
//               <div className="flex items-start gap-4">
//                 <div className="w-12 h-12 bg-successGreen/10 rounded-full flex items-center justify-center flex-shrink-0">
//                   <svg className="w-6 h-6 text-successGreen" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="font-spaceGrotesk font-semibold text-lg mb-1">Business Inquiries</h3>
//                   <p className="font-openSans text-grey2">
//                     Partnerships, bulk orders, and enterprise solutions
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Social Links */}
//             <div className="mt-12">
//               <h3 className="font-spaceGrotesk font-semibold text-lg mb-4">Follow Us</h3>
//               <div className="flex gap-4">
//                 <a href="#" className="w-12 h-12 bg-grey6 rounded-full flex items-center justify-center hover:bg-mainPurple hover:text-white transition-all">
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
//                   </svg>
//                 </a>
//                 <a href="#" className="w-12 h-12 bg-grey6 rounded-full flex items-center justify-center hover:bg-mainPurple hover:text-white transition-all">
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
//                   </svg>
//                 </a>
//                 <a href="#" className="w-12 h-12 bg-grey6 rounded-full flex items-center justify-center hover:bg-mainPurple hover:text-white transition-all">
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
//                   </svg>
//                 </a>
//               </div>
//             </div>
//           </div>

//           {/* Contact Form */}
//           <div className="bg-grey6 rounded-3xl p-8">
//             <h2 className="font-spaceGrotesk font-bold text-3xl mb-6">Send us a message</h2>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label htmlFor="name" className="block font-spaceGrotesk font-semibold mb-2">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
//                   placeholder="Your name"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="email" className="block font-spaceGrotesk font-semibold mb-2">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
//                   placeholder="you@example.com"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="subject" className="block font-spaceGrotesk font-semibold mb-2">
//                   Subject
//                 </label>
//                 <select
//                   id="subject"
//                   name="subject"
//                   value={formData.subject}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
//                 >
//                   <option value="">Select a subject</option>
//                   <option value="general">General Inquiry</option>
//                   <option value="support">Technical Support</option>
//                   <option value="business">Business/Partnership</option>
//                   <option value="feedback">Feedback</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="message" className="block font-spaceGrotesk font-semibold mb-2">
//                   Message
//                 </label>
//                 <textarea
//                   id="message"
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   required
//                   rows={6}
//                   className="w-full px-4 py-3 rounded-xl border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans resize-none"
//                   placeholder="Tell us how we can help..."
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-mainPurple text-white py-3 rounded-xl font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all"
//               >
//                 Send Message
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

















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
    } catch (err: any) {
      setError(err.message)
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
              Thank you for contacting us. We'll get back to you as soon as possible.
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
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
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
