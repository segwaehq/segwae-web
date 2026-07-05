'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * App-wide theme provider. Adds a `.dark` / `.light` class to <html>, defaulting
 * to the visitor's OS setting and remembering any manual override. The blocking
 * script next-themes injects sets the class before first paint, so there's no
 * flash of the wrong theme. Keep this mounted high in the tree (root layout).
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
