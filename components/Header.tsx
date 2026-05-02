'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { FaBars, FaXmark } from "react-icons/fa6"
import type { User } from "@supabase/supabase-js"

const navLinks = [
  { href: "/jobs", label: "Jobs" },
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
    const onScroll = () => setScrolled(window.scrollY > 20)
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white ${
        scrolled
          ? 'border-b border-grey4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center z-50 shrink-0">
            <Image
              src="/wordmark_svg.svg"
              alt="Segwae"
              width={0}
              height={0}
              sizes="100vw"
              className="h-7 w-auto!"
            />
          </Link>

          {/* Desktop nav — centred */}
          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-satoshi text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-grey1'
                    : 'text-grey3 hover:text-grey1'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {loading ? (
              <div className="w-32 h-9" />
            ) : user ? (
              <Link
                href="/dashboard/profile"
                className="bg-mainPurple text-white px-5 py-2 rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-grey2 font-satoshi font-medium text-sm hover:text-grey1 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-mainPurple text-white px-5 py-2 rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-grey2 hover:text-grey1 transition-colors z-50"
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
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-grey4 shadow-lg z-40 md:hidden">
            <div className="px-4 py-5 space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-2 font-satoshi text-sm font-medium text-grey2 hover:text-grey1 rounded-lg hover:bg-grey6 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-grey4 pt-4 mt-3 space-y-2">
                {loading ? (
                  <div className="h-20" />
                ) : user ? (
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-mainPurple text-white px-6 py-2.5 rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center border border-grey4 text-grey2 px-6 py-2.5 rounded-lg font-satoshi font-semibold text-sm hover:border-grey3 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center bg-mainPurple text-white px-6 py-2.5 rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
                    >
                      Sign up
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
