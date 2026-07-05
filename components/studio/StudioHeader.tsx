'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaPenNib, FaArrowRightFromBracket } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'

export default function StudioHeader({ userName }: { userName: string }) {
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/studio/login')
    router.refresh()
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-grey4/60 dark:border-line bg-white dark:bg-surface-raised px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mainPurple">
          <FaPenNib className="h-3.5 w-3.5 text-white" />
        </div>
        <Link
          href="/studio"
          className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
        >
          <span className="font-satoshi text-sm font-black text-grey1 dark:text-content">Segwae</span>
          <span className="text-xs text-grey4 dark:text-content-subtle">/</span>
          <span className="font-satoshi text-sm font-semibold text-grey3 dark:text-content-subtle">Content Studio</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-openSans hidden text-sm text-grey3 dark:text-content-subtle sm:block">{userName}</span>
        <ThemeToggle className="w-8 h-8" />
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="font-satoshi flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-grey2 dark:text-content-muted transition-colors hover:bg-grey5 dark:hover:bg-white/[0.06] hover:text-grey1 dark:hover:text-content disabled:opacity-50"
        >
          <FaArrowRightFromBracket className="h-3 w-3" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </header>
  )
}
