'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaSpinner, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6'
import { toast } from 'sonner'

interface PrivacySettings {
  show_phone: boolean
  show_email: boolean
}

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

  useEffect(() => {
    fetchPrivacySettings()
  }, [])

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/privacy')

      if (!response.ok) {
        throw new Error('Failed to fetch privacy settings')
      }

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

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setSavingPassword(true)

    try {
      // Supabase doesn't require current password for password updates
      // It uses the current session to verify identity
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) throw updateError

      toast.success('Password updated successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const handlePrivacyToggle = async (field: 'show_phone' | 'show_email') => {
    const newValue = !privacySettings[field]

    // Optimistic update
    setPrivacySettings({
      ...privacySettings,
      [field]: newValue,
    })

    setSavingPrivacy(true)

    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: newValue,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update privacy settings')
      }

      toast.success('Privacy settings updated')
    } catch (err) {
      // Revert on error
      setPrivacySettings({
        ...privacySettings,
        [field]: !newValue,
      })
      toast.error(
        err instanceof Error ? err.message : 'Failed to update privacy settings'
      )
    } finally {
      setSavingPrivacy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-8 h-8 text-mainPurple animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
            Settings
          </h1>
          <p className="font-openSans text-grey3">
            Manage your account security and privacy preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Password Section */}
          <div className="pb-8 border-b border-grey4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-mainPurple bg-opacity-10 rounded-lg">
                <FaLock className="w-5 h-5 text-mainPurple" />
              </div>
              <div>
                <h2 className="font-spaceGrotesk font-semibold text-xl text-grey1">
                  Change Password
                </h2>
                <p className="font-openSans text-sm text-grey3">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 pr-12 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-grey3 hover:text-grey1"
                  >
                    {showPasswords.current ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={8}
                    className="w-full px-4 py-3 pr-12 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-grey3 hover:text-grey1"
                  >
                    {showPasswords.new ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-sm text-grey3 font-openSans">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 pr-12 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-grey3 hover:text-grey1"
                  >
                    {showPasswords.confirm ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Privacy Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue bg-opacity-10 rounded-lg">
                <FaEye className="w-5 h-5 text-blue" />
              </div>
              <div>
                <h2 className="font-spaceGrotesk font-semibold text-xl text-grey1">
                  Privacy Settings
                </h2>
                <p className="font-openSans text-sm text-grey3">
                  Control what information is visible on your public profile
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Show Phone Toggle */}
              <div className="flex items-center justify-between p-4 border border-grey4 rounded-lg hover:border-mainPurple transition-colors">
                <div>
                  <h3 className="font-spaceGrotesk font-semibold text-grey1 mb-1">
                    Show Phone Number
                  </h3>
                  <p className="font-openSans text-sm text-grey3">
                    Display your phone number on your public profile
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyToggle('show_phone')}
                  disabled={savingPrivacy}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    privacySettings.show_phone ? 'bg-mainPurple' : 'bg-grey4'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      privacySettings.show_phone
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Show Email Toggle */}
              <div className="flex items-center justify-between p-4 border border-grey4 rounded-lg hover:border-mainPurple transition-colors">
                <div>
                  <h3 className="font-spaceGrotesk font-semibold text-grey1 mb-1">
                    Show Email Address
                  </h3>
                  <p className="font-openSans text-sm text-grey3">
                    Display your email address on your public profile
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyToggle('show_email')}
                  disabled={savingPrivacy}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    privacySettings.show_email ? 'bg-mainPurple' : 'bg-grey4'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      privacySettings.show_email
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-openSans text-sm text-yellow-800">
                <strong className="font-semibold">Note:</strong> Hiding contact
                information may make it harder for others to connect with you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
