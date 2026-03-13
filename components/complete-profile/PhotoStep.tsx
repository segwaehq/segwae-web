'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'

interface PhotoStepProps {
  value: string | null
  onUpdate: (url: string) => void
  onNext: () => void
  onBack: () => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function PhotoStep({ value, onUpdate, onNext, onBack }: PhotoStepProps) {
  const [imageUrl, setImageUrl] = useState(value)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Failed to upload image. Please try again.')
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new image URL
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_image_url: publicUrl }),
      })

      if (res.ok) {
        setImageUrl(publicUrl)
        onUpdate(publicUrl)
      } else {
        setError('Failed to update profile. Please try again.')
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleContinue = () => {
    if (!imageUrl) {
      setError('Please upload a profile photo')
      return
    }
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-satoshi text-grey1 mb-2">
          Add a profile photo
        </h2>
        <p className="text-grey3 text-sm">
          A good photo helps people recognize you and builds trust.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Image Preview */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-40 h-40 rounded-full bg-grey5 border-2 border-dashed border-grey4 hover:border-mainPurple cursor-pointer transition-colors overflow-hidden group"
        >
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Change</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-grey3">
              <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm">Upload Photo</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-mainPurple border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-xs text-grey3">
          JPG, PNG or GIF. Max 5MB.
        </p>

        {error && (
          <p className="text-sm text-errorRed">{error}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 bg-grey5 cursor-pointer text-grey2 rounded-full font-semibold hover:bg-grey4 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={uploading}
          className="flex-1 py-3.5 bg-mainPurple cursor-pointer text-white rounded-full font-semibold hover:bg-mainPurple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
