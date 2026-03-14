'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { FaBars, FaXmark } from "react-icons/fa6"
import type { User } from "@supabase/supabase-js"

const navLinks = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/store", label: "Store" },
  { href: "/contact", label: "Contact" },
]

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [mobileMenuOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-grey4 shadow-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center z-50">
            <Image
              src={transparent ? "/wordmark_white.png" : "/wordmark_svg.svg"}
              alt="Segwae"
              width={0}
              height={0}
              sizes="100vw"
              className="h-7 w-auto!"
            />
          </Link>

          {/* Desktop nav — centred */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-spaceGrotesk text-sm font-medium transition-colors ${
                  transparent
                    ? 'text-white/65 hover:text-white'
                    : 'text-grey2 hover:text-mainPurple'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="w-32 h-9" />
            ) : user ? (
              <Link
                href="/dashboard/profile"
                className="bg-mainPurple text-white px-5 py-2 rounded-full font-spaceGrotesk font-semibold text-sm hover:opacity-90 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-5 py-2 rounded-full font-spaceGrotesk font-semibold text-sm transition-all ${
                    transparent
                      ? 'text-white/75 hover:text-white hover:bg-white/10'
                      : 'text-mainPurple border border-mainPurple/25 hover:bg-lightPurple'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-mainPurple text-white px-5 py-2 rounded-full font-spaceGrotesk font-semibold text-sm hover:opacity-90 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 transition-colors z-50 ${
              transparent ? 'text-white' : 'text-grey1 hover:text-mainPurple'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen
              ? <FaXmark className="w-5 h-5" />
              : <FaBars className="w-5 h-5" />
            }
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-grey4 shadow-xl z-40 md:hidden">
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 font-spaceGrotesk text-sm text-grey2 hover:text-mainPurple transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-grey4 pt-4 mt-4 space-y-3">
                {loading ? (
                  <div className="h-20" />
                ) : user ? (
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-mainPurple text-white px-6 py-3 rounded-xl font-spaceGrotesk font-semibold text-sm"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center border border-mainPurple/30 text-mainPurple px-6 py-3 rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-lightPurple transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center bg-mainPurple text-white px-6 py-3 rounded-xl font-spaceGrotesk font-semibold text-sm"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
