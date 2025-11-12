'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { FaCamera, FaSpinner } from 'react-icons/fa6'
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

  const supabase = createClient()

  // Fetch profile data
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      setUploading(true)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${profile.id}/${fileName}` // RLS policy expects: avatars/{user_id}/filename

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // Update profile with new avatar URL
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_image_url: publicUrl,
        }),
      })

      if (!response.ok) throw new Error('Failed to update avatar')

      // Update local state
      setProfile({ ...profile, profile_image_url: publicUrl })
      toast.success('Avatar updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload avatar')
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
      await fetchProfile()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
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
            Edit Profile
          </h1>
          <p className="font-openSans text-grey3">
            Update your profile information and avatar
          </p>
        </div>

        {/* Avatar Upload */}
        <div className="mb-8 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-grey4 flex items-center justify-center">
              {profile?.profile_image_url ? (
                <Image
                  src={profile.profile_image_url}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-3xl font-satoshi font-bold text-grey2">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-mainPurple text-white p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
            >
              {uploading ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaCamera className="w-4 h-4" />
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
            <h3 className="font-spaceGrotesk font-semibold text-grey1 mb-1">
              Profile Picture
            </h3>
            <p className="font-openSans text-sm text-grey3">
              JPG, PNG or GIF. Max 5MB
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-spaceGrotesk font-semibold text-xl text-grey1">
              Profile Information
            </h2>
            {profile?.username && (
              <a
                href={`/profile/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-openSans text-mainPurple hover:underline"
              >
                View Public Profile →
              </a>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                placeholder="John Doe"
              />
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
              >
                Professional Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                placeholder="Software Engineer, Product Designer, etc."
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="mt-2 text-sm text-grey3 font-openSans">
                {formData.bio.length} characters
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-grey4 rounded-lg bg-gray-50 text-grey3 font-openSans cursor-not-allowed"
              />
              <p className="mt-2 text-sm text-grey3 font-openSans">
                Email cannot be changed
              </p>
            </div>

            {/* Username (Read-only) */}
            {profile?.username && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
                >
                  Username
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-grey3 font-openSans">segwae.com/</span>
                  <input
                    type="text"
                    id="username"
                    value={profile.username}
                    disabled
                    className="flex-1 px-4 py-3 border border-grey4 rounded-lg bg-gray-50 text-grey3 font-openSans cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
