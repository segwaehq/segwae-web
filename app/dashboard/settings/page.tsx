'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaLock, FaEye, FaEyeSlash, FaBriefcase } from 'react-icons/fa6'
import { toast } from 'sonner'

interface PrivacySettings {
  show_phone: boolean
  show_email: boolean
}

interface CareerSettings {
  open_to_work: boolean
  job_seeking_status: string
}

const inputClass =
  'w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [savingCareer, setSavingCareer] = useState(false)

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

  const [careerSettings, setCareerSettings] = useState<CareerSettings>({
    open_to_work: false,
    job_seeking_status: 'actively_looking',
  })

  const supabase = createClient()

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const [privacyRes, profileRes] = await Promise.all([
        fetch('/api/user/privacy'),
        fetch('/api/user/profile'),
      ])
      if (!privacyRes.ok || !profileRes.ok) throw new Error('Failed to fetch settings')
      const [privacyData, profileData] = await Promise.all([privacyRes.json(), profileRes.json()])
      setPrivacySettings(privacyData.privacySettings)
      setCareerSettings({
        open_to_work: profileData.profile?.open_to_work ?? false,
        job_seeking_status: profileData.profile?.job_seeking_status ?? 'actively_looking',
      })
    } catch (err) {
      console.error('Error fetching settings:', err)
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

  const handleCareerChange = async (patch: Partial<CareerSettings>) => {
    const prev = careerSettings
    const next = { ...prev, ...patch }
    setCareerSettings(next)
    setSavingCareer(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          open_to_work: next.open_to_work,
          job_seeking_status: next.open_to_work ? next.job_seeking_status : null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Career status updated')
    } catch (err) {
      setCareerSettings(prev)
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSavingCareer(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
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
      <div className="mb-8">
        <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.22em] mb-1">
          Dashboard
        </p>
        <h1 className="font-satoshi font-bold text-2xl text-grey1">Settings</h1>
      </div>

      <div className="space-y-5">
        {/* Password */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-mainPurple/10 flex items-center justify-center shrink-0">
              <FaLock className="w-4 h-4 text-mainPurple" />
            </div>
            <div>
              <h2 className="font-satoshi font-semibold text-grey1">Change Password</h2>
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
                <label htmlFor={id} className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
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
                className="px-6 py-3 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {savingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-mainPurple/10 flex items-center justify-center shrink-0">
              <FaEye className="w-4 h-4 text-mainPurple" />
            </div>
            <div>
              <h2 className="font-satoshi font-semibold text-grey1">Privacy Settings</h2>
              <p className="font-openSans text-xs text-grey3">
                Control what&apos;s visible on your public profile
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-grey4 rounded-lg">
              <div>
                <p className="font-satoshi font-semibold text-grey1 text-sm">Show Phone Number</p>
                <p className="font-openSans text-xs text-grey3 mt-0.5">
                  Display your phone on your public profile
                </p>
              </div>
              <Toggle
                checked={privacySettings.show_phone}
                onChange={() => handlePrivacyToggle('show_phone')}
                disabled={savingPrivacy}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-grey4 rounded-lg">
              <div>
                <p className="font-satoshi font-semibold text-grey1 text-sm">Show Email Address</p>
                <p className="font-openSans text-xs text-grey3 mt-0.5">
                  Display your email on your public profile
                </p>
              </div>
              <Toggle
                checked={privacySettings.show_email}
                onChange={() => handlePrivacyToggle('show_email')}
                disabled={savingPrivacy}
              />
            </div>
          </div>

          <p className="mt-5 font-openSans text-xs text-grey3 border-t border-grey4/60 pt-4">
            Hiding contact info may make it harder for others to connect with you.
          </p>
        </div>

        {/* Career */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-mainPurple/10 flex items-center justify-center shrink-0">
              <FaBriefcase className="w-4 h-4 text-mainPurple" />
            </div>
            <div>
              <h2 className="font-satoshi font-semibold text-grey1">Career Status</h2>
              <p className="font-openSans text-xs text-grey3">
                Let employers know you&apos;re available
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-grey4 rounded-lg">
              <div>
                <p className="font-satoshi font-semibold text-grey1 text-sm">Open to work</p>
                <p className="font-openSans text-xs text-grey3 mt-0.5">
                  Show employers you&apos;re looking for opportunities
                </p>
              </div>
              <Toggle
                checked={careerSettings.open_to_work}
                onChange={() => handleCareerChange({ open_to_work: !careerSettings.open_to_work })}
                disabled={savingCareer}
              />
            </div>

            {careerSettings.open_to_work && (
              <div className="p-4 border border-grey4 rounded-lg space-y-3">
                <p className="font-satoshi font-semibold text-grey1 text-sm">Availability</p>
                {(
                  [
                    { value: 'actively_looking', label: 'Actively looking', desc: 'Ready to start soon, actively applying' },
                    { value: 'open_to_offers', label: 'Open to offers', desc: 'Employed but open to the right opportunity' },
                  ] as const
                ).map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      careerSettings.job_seeking_status === value
                        ? 'border-mainPurple bg-lightPurple'
                        : 'border-grey4 hover:border-grey3'
                    }`}
                  >
                    <input
                      type="radio"
                      name="job_seeking_status"
                      value={value}
                      checked={careerSettings.job_seeking_status === value}
                      onChange={() => handleCareerChange({ job_seeking_status: value })}
                      disabled={savingCareer}
                      className="mt-0.5 accent-mainPurple"
                    />
                    <div>
                      <p className="font-satoshi font-semibold text-sm text-grey1">{label}</p>
                      <p className="font-openSans text-xs text-grey3 mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
