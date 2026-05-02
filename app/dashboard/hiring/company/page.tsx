'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { FaBuilding, FaCheck, FaPen } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import type { Company } from '@/lib/types'

const COMPANY_SIZES = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '501-1000', label: '501–1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education',
  'Media & Entertainment', 'FMCG / Retail', 'Consulting', 'Telecoms',
  'Oil & Gas', 'Real Estate', 'Agriculture', 'Logistics', 'Other',
]

const inputClass =
  'w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors'

export default function CompanyProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [form, setForm] = useState({
    name: '', industry: '', description: '', website: '', size: '', location: '',
  })

  useEffect(() => {
    fetch('/api/hiring/company')
      .then((r) => r.json())
      .then((data) => {
        if (!data.company) {
          router.replace('/dashboard/hiring/setup')
          return
        }
        const c: Company = data.company
        setCompany(c)
        setForm({
          name: c.name ?? '',
          industry: c.industry ?? '',
          description: c.description ?? '',
          website: c.website ?? '',
          size: c.size ?? '',
          location: c.location ?? '',
        })
        if (c.logo_url) setLogoPreview(c.logo_url)
      })
      .catch(() => toast.error('Failed to load company'))
      .finally(() => setLoading(false))
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setSaved(false)
  }

  const handleLogoUpload = async (file: File) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image too large. Max 2 MB.'); return }
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return }

    setUploadingLogo(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const ext = file.name.split('.').pop()
      const path = `company-logos/${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('user-uploads').upload(path, file, { upsert: true })
      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('user-uploads').getPublicUrl(path)
      const logoUrl = urlData.publicUrl

      const res = await fetch('/api/hiring/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: logoUrl }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setLogoPreview(logoUrl)
      toast.success('Logo updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Logo upload failed')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Company name is required'); return }
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/hiring/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setCompany(data.company)
      setSaved(true)
      toast.success('Company profile saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.22em] mb-1">
          Hiring
        </p>
        <h1 className="font-satoshi font-bold text-2xl text-grey1">Company Profile</h1>
        <p className="font-openSans text-sm text-grey3 mt-1">
          Visible to all job seekers on your listings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Logo upload */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-6">
          <p className="font-satoshi font-semibold text-sm text-grey1 mb-4">Company Logo</p>
          <div className="flex items-center gap-5">
            <div
              className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-mainPurple overflow-hidden cursor-pointer group"
              onClick={() => !uploadingLogo && fileRef.current?.click()}
            >
              {logoPreview ? (
                <Image src={logoPreview} alt="Logo" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-lightPurple flex items-center justify-center">
                  <FaBuilding className="w-7 h-7 text-mainPurple" />
                </div>
              )}
              <div className="absolute inset-0 bg-mainPurple/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                {uploadingLogo ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPen className="w-4 h-4 text-white" />
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = '' }}
              />
            </div>
            <div>
              <p className="font-satoshi font-semibold text-sm text-grey1">{form.name || 'Your Company'}</p>
              {company?.is_verified && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold font-satoshi text-successGreen bg-successGreen/10 px-2 py-0.5 rounded-full">
                  <FaCheck className="w-2.5 h-2.5" /> Verified
                </span>
              )}
              <p className="font-openSans text-xs text-grey3 mt-1">Click the logo to upload a new one</p>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-6 space-y-4">
          <p className="font-satoshi font-semibold text-sm text-grey1 mb-2">Company Details</p>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">
              Company Name <span className="text-errorRed">*</span>
            </label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Flutterwave" className={inputClass} />
          </div>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Industry</label>
            <select name="industry" value={form.industry} onChange={handleChange} className={inputClass}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Company Size</label>
            <select name="size" value={form.size} onChange={handleChange} className={inputClass}>
              <option value="">Select size</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Lagos, Nigeria" className={inputClass} />
          </div>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Website</label>
            <input name="website" value={form.website} onChange={handleChange} type="url" placeholder="https://yourcompany.com" className={inputClass} />
          </div>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">About the Company</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell job seekers what your company does and what makes it a great place to work…"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-mainPurple text-white rounded-xl font-satoshi font-semibold text-sm hover:bg-[#4338CA] disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <FaCheck className="w-4 h-4" />
          ) : null}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
