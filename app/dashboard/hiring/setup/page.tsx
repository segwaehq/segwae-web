'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FaBuilding } from 'react-icons/fa6'

const inputClass =
  'w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors'

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

export default function CompanySetupPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', industry: '', description: '', website: '', size: '', location: '',
  })

  useEffect(() => {
    fetch('/api/hiring/company')
      .then((r) => r.json())
      .then((data) => {
        if (data.company) router.replace('/dashboard/hiring')
        else setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hiring/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create company')
      toast.success('Company created!')
      router.push('/dashboard/hiring')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="mb-8">
        <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.22em] mb-1">
          Hiring
        </p>
        <h1 className="font-satoshi font-bold text-2xl text-grey1">Set up your company</h1>
        <p className="font-openSans text-sm text-grey3 mt-2">
          Create your company profile before posting jobs. You can update this at any time.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-grey4/60 p-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-grey4/60">
          <div className="w-12 h-12 rounded-xl bg-lightPurple flex items-center justify-center">
            <FaBuilding className="w-5 h-5 text-mainPurple" />
          </div>
          <div>
            <p className="font-satoshi font-semibold text-grey1 text-sm">Company Profile</p>
            <p className="font-openSans text-xs text-grey3 mt-0.5">Visible to job seekers on all your listings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Company Name <span className="text-errorRed">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Acme Technologies Ltd"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
                Industry
              </label>
              <select name="industry" value={form.industry} onChange={handleChange} className={inputClass}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
                Company Size
              </label>
              <select name="size" value={form.size} onChange={handleChange} className={inputClass}>
                <option value="">Select size</option>
                {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className={inputClass}
              placeholder="Lagos, Nigeria"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://yourcompany.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              About the Company
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Tell job seekers about what your company does and your culture…"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {saving ? 'Creating…' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
