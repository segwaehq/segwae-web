'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaCamera, FaArrowUpRightFromSquare } from 'react-icons/fa6'
import { toast } from 'sonner'

interface ProfileData {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  bio: string | null
  title: string | null
  profile_image_url: string | null
  username: string | null
}

const inputClass =
  'w-full px-4 py-3 border border-[#E2E1EA] dark:border-line rounded-xl focus:outline-none focus:border-[#A98BE8] dark:focus:border-[#6a4fb0] text-sm font-medium text-[#15131C] dark:text-content placeholder:text-[#9098A3] dark:placeholder:text-content-subtle bg-white dark:bg-surface-sunken transition-colors'

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    title: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data.profile)
      setFormData({
        name: data.profile.name || '',
        phone: data.profile.phone || '',
        bio: data.profile.bio || '',
        title: data.profile.title || '',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size must be less than 5MB'); return }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const uploadRes = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type, fileExt }),
      })
      if (!uploadRes.ok) throw new Error('Failed to get upload URL')
      const { presignedUrl, publicUrl } = await uploadRes.json()

      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!putRes.ok) throw new Error('Failed to upload photo')

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_image_url: publicUrl }),
      })
      if (!response.ok) throw new Error('Failed to update avatar')
      setProfile({ ...profile, profile_image_url: publicUrl })
      toast.success('Photo updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
      toast.success('Profile saved')
      await fetchProfile()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="mb-8">
        <p className="font-satoshi text-[12px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7] uppercase tracking-[0.14em] mb-1.5">
          Dashboard
        </p>
        <div className="flex items-center justify-between">
          <h1 className="font-satoshi font-black tracking-[-0.02em] text-[26px] text-[#15131C] dark:text-content">Edit profile</h1>
          {profile?.username && (
            <a
              href={`/profile/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-satoshi text-xs font-bold text-[#5A2DD4] dark:text-[#b9a4f7] hover:opacity-70 transition-opacity"
            >
              View profile
              <FaArrowUpRightFromSquare className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-surface-raised rounded-[18px] border border-[#E8E8EF] dark:border-line p-8 space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F1F0F6] dark:bg-[#241d38] flex items-center justify-center">
              {profile?.profile_image_url ? (
                <Image
                  src={profile.profile_image_url}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-2xl font-satoshi font-black text-[#5A2DD4] dark:text-[#b9a4f7]">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-brand-gradient text-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_12px_-2px_rgba(74,55,216,0.5)] hover:-translate-y-0.5 transition-transform"
            >
              {uploading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaCamera className="w-3 h-3" />
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="font-satoshi font-bold text-[#15131C] dark:text-content text-sm">Profile photo</p>
            <p className="text-xs text-[#9098A3] dark:text-content-subtle mt-0.5">JPG, PNG or GIF · Max 5 MB</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5 font-satoshi">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={inputClass}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5 font-satoshi">
                Professional Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5 font-satoshi">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="+234 801 234 5678"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5 font-satoshi">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Tell us about yourself…"
            />
            <p className="mt-1.5 text-xs text-[#9098A3] dark:text-content-subtle tabular-nums">{formData.bio.length} characters</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5 font-satoshi">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={profile?.email || ''}
              disabled
              className={`${inputClass} bg-[#F4F3F8] dark:bg-surface-sunken text-[#9098A3] dark:text-content-subtle cursor-not-allowed`}
            />
            <p className="mt-1.5 text-xs text-[#9098A3] dark:text-content-subtle">Email cannot be changed</p>
          </div>

          {profile?.username && (
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5 font-satoshi">
                Username
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#9098A3] dark:text-content-subtle whitespace-nowrap">segwae.com/</span>
                <input
                  type="text"
                  id="username"
                  value={profile.username}
                  disabled
                  className={`${inputClass} bg-[#F4F3F8] dark:bg-surface-sunken text-[#9098A3] dark:text-content-subtle cursor-not-allowed`}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-transform"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
