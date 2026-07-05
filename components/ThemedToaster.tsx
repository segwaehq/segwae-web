'use client'

import { Toaster } from 'sonner'
import { useTheme } from 'next-themes'

/**
 * Sonner toaster wired to the active theme, so toasts are light in light mode
 * and dark in dark mode instead of always white.
 */
export default function ThemedToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      toastOptions={{ duration: 4000 }}
    />
  )
}
