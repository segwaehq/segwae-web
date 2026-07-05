'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { FaBars, FaXmark } from "react-icons/fa6"
import type { User } from "@supabase/supabase-js"
import ThemeToggle from "@/components/ThemeToggle"

const navLinks = [
  { href: "/jobs", label: "Jobs" },
  { href: "/blog", label: "Blog" },
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
  const supabase = useMemo(() => createClient(), [])

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-surface/80 backdrop-blur-xl backdrop-saturate-150 ${
        scrolled
          ? 'border-b border-line shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center z-50 shrink-0" aria-label="Segwae home">
            <Image
              src="/wordmark.png"
              alt="Segwae"
              width={3834}
              height={992}
              priority
              className="h-7 w-auto"
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
                    ? 'text-content'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <ThemeToggle />
            {loading ? (
              <div className="w-32 h-9" />
            ) : user ? (
              <Link
                href="/dashboard/profile"
                className="bg-brand-gradient text-white px-[18px] py-2.5 rounded-[10px] font-satoshi font-bold text-sm shadow-[0_6px_16px_rgba(74,55,216,0.26)] hover:-translate-y-0.5 transition-transform"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-content-muted font-satoshi font-semibold text-sm hover:text-content transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-brand-gradient text-white px-[18px] py-2.5 rounded-[10px] font-satoshi font-bold text-sm shadow-[0_6px_16px_rgba(74,55,216,0.26)] hover:-translate-y-0.5 transition-transform"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1.5 z-50">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-content-muted hover:text-content transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen
                ? <FaXmark className="w-5 h-5" />
                : <FaBars className="w-5 h-5" />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-surface-raised border-b border-line shadow-lg z-40 md:hidden">
            <div className="px-4 py-5 space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-2 font-satoshi text-sm font-medium text-content-muted hover:text-content rounded-lg hover:bg-surface-sunken transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-line pt-4 mt-3 space-y-2">
                {loading ? (
                  <div className="h-20" />
                ) : user ? (
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-brand-gradient text-white px-6 py-2.5 rounded-lg font-satoshi font-bold text-sm shadow-[0_6px_16px_rgba(74,55,216,0.26)]"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center border border-line text-content-muted px-6 py-2.5 rounded-lg font-satoshi font-semibold text-sm hover:border-content-subtle transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center bg-brand-gradient text-white px-6 py-2.5 rounded-lg font-satoshi font-bold text-sm shadow-[0_6px_16px_rgba(74,55,216,0.26)]"
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
