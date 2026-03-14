'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6'
import { toast } from 'sonner'

interface PrivacySettings {
  show_phone: boolean
  show_email: boolean
}

const inputClass =
  'w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_phone: true,
    show_email: true,
  })

  const supabase = createClient()

  useEffect(() => { fetchPrivacySettings() }, [])

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/privacy')
      if (!response.ok) throw new Error('Failed to fetch privacy settings')
      const data = await response.json()
      setPrivacySettings(data.privacySettings)
    } catch (err) {
      console.error('Error fetching privacy settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword })
      if (error) throw error
      toast.success('Password updated')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const handlePrivacyToggle = async (field: 'show_phone' | 'show_email') => {
    const newValue = !privacySettings[field]
    setPrivacySettings({ ...privacySettings, [field]: newValue })
    setSavingPrivacy(true)
    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      })
      if (!response.ok) throw new Error('Failed to update privacy settings')
      toast.success('Privacy updated')
    } catch (err) {
      setPrivacySettings({ ...privacySettings, [field]: !newValue })
      toast.error(err instanceof Error ? err.message : 'Failed to update privacy settings')
    } finally {
      setSavingPrivacy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={savingPrivacy}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-mainPurple' : 'bg-grey4'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="max-w-full">
      {/* Page header */}
      <div className="mb-8">
        <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.15em] mb-1">
          Dashboard
        </p>
        <h1 className="font-satoshi font-black text-3xl text-grey1">Settings</h1>
      </div>

      <div className="space-y-5">
        {/* Password */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-mainPurple/10 flex items-center justify-center shrink-0">
              <FaLock className="w-4 h-4 text-mainPurple" />
            </div>
            <div>
              <h2 className="font-spaceGrotesk font-semibold text-grey1">Change Password</h2>
              <p className="font-openSans text-xs text-grey3">Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {(
              [
                { id: 'currentPassword', label: 'Current Password', key: 'current' as const },
                { id: 'newPassword', label: 'New Password', key: 'new' as const },
                { id: 'confirmPassword', label: 'Confirm New Password', key: 'confirm' as const },
              ] as const
            ).map(({ id, label, key }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-xs font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords[key] ? 'text' : 'password'}
                    id={id}
                    value={passwordData[id as keyof typeof passwordData]}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, [id]: e.target.value })
                    }
                    required
                    className={`${inputClass} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, [key]: !showPasswords[key] })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-grey3 hover:text-grey1 transition-colors cursor-pointer"
                  >
                    {showPasswords[key] ? (
                      <FaEyeSlash className="w-4 h-4" />
                    ) : (
                      <FaEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {id === 'newPassword' && (
                  <p className="mt-1.5 text-xs text-grey3 font-openSans">At least 8 characters</p>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-3 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {savingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue/10 flex items-center justify-center shrink-0">
              <FaEye className="w-4 h-4 text-blue" />
            </div>
            <div>
              <h2 className="font-spaceGrotesk font-semibold text-grey1">Privacy Settings</h2>
              <p className="font-openSans text-xs text-grey3">
                Control what's visible on your public profile
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-grey4 rounded-xl">
              <div>
                <p className="font-spaceGrotesk font-semibold text-grey1 text-sm">Show Phone Number</p>
                <p className="font-openSans text-xs text-grey3 mt-0.5">
                  Display your phone on your public profile
                </p>
              </div>
              <Toggle
                checked={privacySettings.show_phone}
                onChange={() => handlePrivacyToggle('show_phone')}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-grey4 rounded-xl">
              <div>
                <p className="font-spaceGrotesk font-semibold text-grey1 text-sm">Show Email Address</p>
                <p className="font-openSans text-xs text-grey3 mt-0.5">
                  Display your email on your public profile
                </p>
              </div>
              <Toggle
                checked={privacySettings.show_email}
                onChange={() => handlePrivacyToggle('show_email')}
              />
            </div>
          </div>

          <p className="mt-5 font-openSans text-xs text-grey3 border-t border-grey4/60 pt-4">
            Hiding contact info may make it harder for others to connect with you.
          </p>
        </div>
      </div>
    </div>
  )
}
