'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { FaCamera } from 'react-icons/fa6'

interface PhotoStepProps {
  value: string | null
  onUpdate: (url: string) => void
  onNext: () => void
  onBack: () => void
}

export default function PhotoStep({ value, onUpdate, onNext, onBack }: PhotoStepProps) {
  const [imageUrl, setImageUrl] = useState(value)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const uploadRes = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type, fileExt }),
      })
      if (!uploadRes.ok) { setError('Failed to upload image. Please try again.'); return }
      const { presignedUrl, publicUrl } = await uploadRes.json()

      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!putRes.ok) { setError('Failed to upload image. Please try again.'); return }

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_image_url: publicUrl }),
      })

      if (res.ok) { setImageUrl(publicUrl); onUpdate(publicUrl) }
      else setError('Failed to update profile. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleContinue = () => {
    if (!imageUrl) { setError('Please upload a profile photo'); return }
    onNext()
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-satoshi font-bold text-2xl text-grey1 mb-2">
          Add a profile photo
        </h2>
        <p className="font-openSans text-grey3 text-sm leading-relaxed">
          A good photo helps people recognise you and builds trust.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative w-36 h-36 rounded-full bg-grey5 border-2 border-dashed border-grey4 hover:border-mainPurple cursor-pointer transition-colors overflow-hidden group disabled:cursor-not-allowed"
        >
          {imageUrl ? (
            <>
              <Image src={imageUrl} alt="Profile" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <FaCamera className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-grey3 gap-2">
              <FaCamera className="w-7 h-7" />
              <span className="font-openSans text-xs">Upload photo</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

        <p className="font-openSans text-xs text-grey3">JPG, PNG or GIF · Max 5 MB</p>
        {error && <p className="text-xs text-errorRed font-openSans">{error}</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={uploading}
          className="flex-1 py-3.5 border border-grey4 text-grey2 rounded-lg font-satoshi font-semibold text-sm hover:border-grey3 transition-colors disabled:opacity-50">
          Back
        </button>
        <button type="button" onClick={handleContinue} disabled={uploading}
          className="flex-2 px-8 py-3.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Continue
        </button>
      </div>
    </div>
  )
}
