'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaBriefcase, FaArrowRightFromBracket } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'

export default function PortalHeader({ userName }: { userName: string }) {
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/jobs-portal/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-white dark:bg-surface-raised border-b border-grey4/60 dark:border-line flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-mainPurple flex items-center justify-center">
          <FaBriefcase className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/" className="font-satoshi font-black text-sm text-grey1 dark:text-content hover:text-mainPurple dark:hover:text-[#b9a4f7] transition-colors">
            Segwae
          </Link>
          <span className="text-grey4 dark:text-content-subtle text-xs">/</span>
          <span className="font-satoshi font-semibold text-sm text-grey3 dark:text-content-subtle">Jobs Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-openSans text-sm text-grey3 dark:text-content-subtle hidden sm:block">
          {userName}
        </span>
        <ThemeToggle className="w-8 h-8" />
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-satoshi font-semibold text-xs text-grey2 dark:text-content-muted hover:text-grey1 dark:hover:text-content hover:bg-grey5 dark:hover:bg-white/[0.06] transition-colors disabled:opacity-50"
        >
          <FaArrowRightFromBracket className="w-3 h-3" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </header>
  )
}
