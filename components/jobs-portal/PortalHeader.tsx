'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaBriefcase, FaArrowRightFromBracket } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'

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
    <header className="h-14 bg-white border-b border-grey4/60 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-mainPurple flex items-center justify-center">
          <FaBriefcase className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/" className="font-satoshi font-black text-sm text-grey1 hover:text-mainPurple transition-colors">
            Segwae
          </Link>
          <span className="text-grey4 text-xs">/</span>
          <span className="font-satoshi font-semibold text-sm text-grey3">Jobs Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-openSans text-sm text-grey3 hidden sm:block">
          {userName}
        </span>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-satoshi font-semibold text-xs text-grey2 hover:text-grey1 hover:bg-grey5 transition-colors disabled:opacity-50"
        >
          <FaArrowRightFromBracket className="w-3 h-3" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </header>
  )
}
