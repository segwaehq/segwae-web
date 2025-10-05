'use client'

import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function AdminHeader({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="bg-white border-b border-grey4 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-spaceGrotesk font-semibold text-lg text-grey1">
            Welcome back!
          </h2>
          <p className="text-sm text-grey3">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-grey6 hover:bg-grey4 rounded-lg font-spaceGrotesk transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  )
}