'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { FaSun, FaMoon } from 'react-icons/fa6'

/**
 * Light/dark toggle. Flips the resolved theme and remembers the choice.
 * Renders a stable placeholder until mounted so server and client markup match
 * (resolvedTheme is only known on the client).
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  const base =
    'inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-line ' +
    'text-content-muted hover:text-content hover:bg-surface-sunken ' +
    'transition-colors focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface'

  if (!mounted) {
    // Placeholder keeps layout stable and avoids a hydration mismatch on the icon.
    return <span className={`${base} ${className}`} aria-hidden="true" />
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`${base} ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <FaSun className="w-[15px] h-[15px]" />
        : <FaMoon className="w-[14px] h-[14px]" />
      }
    </button>
  )
}
