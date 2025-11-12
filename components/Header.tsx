// import Link from "next/link";
// import Image from "next/image";

// export default function Header() {
//   return (
//     <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-grey4">
//       <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <Link href="/" className="flex items-center space-x-2">
//             <Image
//               src="/wordmark_svg.svg"
//               alt="Segwae Logo"
//               width={0}
//               height={0}
//               sizes="100vw"
//               className="h-8 w-auto!"
//             />
//           </Link>

//           {/* Navigation Links */}
//           <div className="hidden md:flex items-center space-x-8">
//             <Link
//               href="/#how-it-works"
//               className="font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
//             >
//               How It Works
//             </Link>
//             <Link
//               href="/about"
//               className="font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
//             >
//               About
//             </Link>
//             <Link
//               href="/store"
//               className="font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
//             >
//               Store
//             </Link>
//             <Link
//               href="/contact"
//               className="font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
//             >
//               Contact
//             </Link>
//           </div>

//           {/* CTA Button */}
//           <div className="flex items-center space-x-4">
//             <button className="bg-mainPurple text-white px-6 py-2 rounded-full font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all">
//               Coming Soon
//             </button>
//           </div>
//         </div>
//       </nav>
//     </header>
//   );
// }










'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { FaBars, FaXmark } from "react-icons/fa6"
import type { User } from "@supabase/supabase-js"

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const navLinks = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/about", label: "About" },
    { href: "/store", label: "Store" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-grey4">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50">
            <Image
              src="/wordmark_svg.svg"
              alt="Segwae Logo"
              width={0}
              height={0}
              sizes="100vw"
              className="h-8 w-auto!"
            />
          </Link>

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-32 h-10" />
            ) : user ? (
              <Link
                href="/dashboard/profile"
                className="bg-mainPurple text-white px-6 py-2 rounded-full font-spaceGrotesk font-semibold hover:opacity-90 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="border-2 border-mainPurple text-mainPurple px-6 py-2 rounded-full font-spaceGrotesk font-semibold hover:bg-lightPurple transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-mainPurple text-white px-6 py-2 rounded-full font-spaceGrotesk font-semibold hover:opacity-90 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-grey1 hover:text-mainPurple transition-colors z-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <FaXmark className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-grey4 shadow-xl z-40 md:hidden">
            <div className="px-4 py-6 space-y-4">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 font-spaceGrotesk text-grey2 hover:text-mainPurple transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="border-t border-grey4 my-4" />

              {/* Auth Buttons */}
              {loading ? (
                <div className="h-24" />
              ) : user ? (
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-mainPurple text-white px-6 py-3 rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center border-2 border-mainPurple text-mainPurple px-6 py-3 rounded-lg font-spaceGrotesk font-semibold hover:bg-lightPurple transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-mainPurple text-white px-6 py-3 rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}