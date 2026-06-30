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
  'w-full px-4 py-3 border border-[#E2E1EA] rounded-xl focus:outline-none focus:border-[#A98BE8] text-sm font-medium text-[#15131C] placeholder:text-[#9098A3] bg-white transition-colors'

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
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-brand-gradient' : 'bg-[#D8D5E2]'
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
        <p className="font-satoshi text-[12px] font-bold text-[#5A2DD4] uppercase tracking-[0.14em] mb-1.5">
          Dashboard
        </p>
        <h1 className="font-satoshi font-black tracking-[-0.02em] text-[26px] text-[#15131C]">Settings</h1>
      </div>

      <div className="space-y-5">
        {/* Password */}
        <div className="bg-white rounded-[18px] border border-[#E8E8EF] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#F1ECFD] flex items-center justify-center shrink-0">
              <FaLock className="w-4 h-4 text-[#5A2DD4]" />
            </div>
            <div>
              <h2 className="font-satoshi font-bold text-[#15131C]">Change password</h2>
              <p className="text-xs text-[#9098A3]">Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {(
              [
                { id: 'currentPassword', label: 'Current password', key: 'current' as const },
                { id: 'newPassword', label: 'New password', key: 'new' as const },
                { id: 'confirmPassword', label: 'Confirm new password', key: 'confirm' as const },
              ] as const
            ).map(({ id, label, key }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-xs font-bold text-[#15131C] mb-1.5 font-satoshi">
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9098A3] hover:text-[#15131C] transition-colors cursor-pointer"
                  >
                    {showPasswords[key] ? (
                      <FaEyeSlash className="w-4 h-4" />
                    ) : (
                      <FaEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {id === 'newPassword' && (
                  <p className="mt-1.5 text-xs text-[#9098A3]">At least 8 characters</p>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-3 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-transform"
              >
                {savingPassword ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-[18px] border border-[#E8E8EF] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#F1ECFD] flex items-center justify-center shrink-0">
              <FaEye className="w-4 h-4 text-[#5A2DD4]" />
            </div>
            <div>
              <h2 className="font-satoshi font-bold text-[#15131C]">Privacy settings</h2>
              <p className="text-xs text-[#9098A3]">
                Control what&apos;s visible on your public profile
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-[#E8E8EF] rounded-xl">
              <div>
                <p className="font-satoshi font-bold text-[#15131C] text-sm">Show phone number</p>
                <p className="text-xs text-[#9098A3] mt-0.5">
                  Display your phone on your public profile
                </p>
              </div>
              <Toggle
                checked={privacySettings.show_phone}
                onChange={() => handlePrivacyToggle('show_phone')}
                disabled={savingPrivacy}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-[#E8E8EF] rounded-xl">
              <div>
                <p className="font-satoshi font-bold text-[#15131C] text-sm">Show email address</p>
                <p className="text-xs text-[#9098A3] mt-0.5">
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

          <p className="mt-5 text-xs text-[#9098A3] border-t border-[#E8E8EF] pt-4">
            Hiding contact info may make it harder for others to connect with you.
          </p>
        </div>

        {/* Career */}
        <div className="bg-white rounded-[18px] border border-[#E8E8EF] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#F1ECFD] flex items-center justify-center shrink-0">
              <FaBriefcase className="w-4 h-4 text-[#5A2DD4]" />
            </div>
            <div>
              <h2 className="font-satoshi font-bold text-[#15131C]">Career status</h2>
              <p className="text-xs text-[#9098A3]">
                Let employers know you&apos;re available
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-[#E8E8EF] rounded-xl">
              <div>
                <p className="font-satoshi font-bold text-[#15131C] text-sm">Open to work</p>
                <p className="text-xs text-[#9098A3] mt-0.5">
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
              <div className="p-4 border border-[#E8E8EF] rounded-xl space-y-3">
                <p className="font-satoshi font-bold text-[#15131C] text-sm">Availability</p>
                {(
                  [
                    { value: 'actively_looking', label: 'Actively looking', desc: 'Ready to start soon, actively applying' },
                    { value: 'open_to_offers', label: 'Open to offers', desc: 'Employed but open to the right opportunity' },
                  ] as const
                ).map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      careerSettings.job_seeking_status === value
                        ? 'border-[#A98BE8] bg-[#F4F0FE]'
                        : 'border-[#E8E8EF] hover:border-[#C9BCF2]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="job_seeking_status"
                      value={value}
                      checked={careerSettings.job_seeking_status === value}
                      onChange={() => handleCareerChange({ job_seeking_status: value })}
                      disabled={savingCareer}
                      className="mt-0.5 accent-[#5A2DD4]"
                    />
                    <div>
                      <p className="font-satoshi font-bold text-sm text-[#15131C]">{label}</p>
                      <p className="text-xs text-[#9098A3] mt-0.5">{desc}</p>
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
