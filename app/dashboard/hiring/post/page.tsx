'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FaArrowLeft, FaCircleInfo } from 'react-icons/fa6'
import Link from 'next/link'
import { CURRENCIES } from '@/lib/currencies'

const inputClass =
  'w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors'

type PostingMode = 'internal' | 'external'
type JobType = 'full_time' | 'part_time' | 'contract' | 'internship'
type WorkMode = 'remote' | 'onsite' | 'hybrid'

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const WORK_MODES: { value: WorkMode; label: string; desc: string }[] = [
  { value: 'remote', label: 'Remote', desc: 'Work from anywhere' },
  { value: 'onsite', label: 'On-site', desc: 'Come to the office' },
  { value: 'hybrid', label: 'Hybrid', desc: 'Mix of both' },
]

export default function PostJobPage() {
  const router = useRouter()
  const [hasCompany, setHasCompany] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  const [postingMode, setPostingMode] = useState<PostingMode>('internal')
  const [form, setForm] = useState({
    title: '',
    job_type: 'full_time' as JobType,
    work_mode: 'onsite' as WorkMode,
    location: '',
    experience_years_min: '0',
    salary_min: '',
    salary_max: '',
    salary_currency: 'NGN',
    salary_visible: true,
    description: '',
    requirements: '',
    tags: '',
    application_deadline: '',
    external_url: '',
  })

  useEffect(() => {
    fetch('/api/hiring/company')
      .then((r) => r.json())
      .then((d) => {
        if (!d.company) router.replace('/dashboard/hiring/setup')
        else setHasCompany(true)
      })
      .catch(() => router.replace('/dashboard/hiring/setup'))
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const submitJob = async (status: 'draft' | 'active') => {
    setSaving(true)
    try {
      const tagsArr = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const body = {
        title: form.title,
        description: form.description,
        requirements: form.requirements || undefined,
        location: form.location || undefined,
        job_type: form.job_type,
        work_mode: form.work_mode,
        posting_mode: postingMode,
        external_url: postingMode === 'external' ? form.external_url : undefined,
        status,
        salary_min: form.salary_min ? parseFloat(form.salary_min) : undefined,
        salary_max: form.salary_max ? parseFloat(form.salary_max) : undefined,
        salary_currency: form.salary_currency,
        salary_visible: form.salary_visible,
        experience_years_min: parseInt(form.experience_years_min) || 0,
        tags: tagsArr,
        application_deadline: form.application_deadline || undefined,
      }

      const res = await fetch('/api/hiring/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create job')
      toast.success(status === 'active' ? 'Job published!' : 'Saved as draft')
      router.push('/dashboard/hiring')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (hasCompany === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="mb-8">
        <Link
          href="/dashboard/hiring"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-grey3 hover:text-grey1 font-satoshi transition-colors mb-4"
        >
          <FaArrowLeft className="w-3 h-3" /> Back to jobs
        </Link>
        <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.22em] mb-1">
          Hiring
        </p>
        <h1 className="font-satoshi font-bold text-2xl text-grey1">Post a Job</h1>
      </div>

      <div className="space-y-6">
        {/* Posting mode */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-6">
          <h2 className="font-satoshi font-semibold text-grey1 text-sm mb-4">Posting Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['internal', 'external'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPostingMode(mode)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  postingMode === mode
                    ? 'border-mainPurple bg-lightPurple'
                    : 'border-grey4/60 hover:border-grey3'
                }`}
              >
                <p className={`font-satoshi font-semibold text-sm capitalize ${postingMode === mode ? 'text-mainPurple' : 'text-grey1'}`}>
                  {mode}
                </p>
                <p className="font-openSans text-xs text-grey3 mt-1">
                  {mode === 'internal'
                    ? 'Applicants apply on Segwae. Full pipeline managed here.'
                    : 'Applicants redirect to your website. No pipeline.'}
                </p>
              </button>
            ))}
          </div>
          {postingMode === 'external' && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
                Application URL <span className="text-errorRed">*</span>
              </label>
              <input
                type="url"
                name="external_url"
                value={form.external_url}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="https://yourcompany.com/careers/apply"
              />
            </div>
          )}
        </div>

        {/* Job basics */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-6 space-y-5">
          <h2 className="font-satoshi font-semibold text-grey1 text-sm">Job Details</h2>
          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Job Title <span className="text-errorRed">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="e.g. Senior Product Designer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
                Job Type <span className="text-errorRed">*</span>
              </label>
              <select name="job_type" value={form.job_type} onChange={handleChange} className={inputClass}>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-grey1 mb-2 font-satoshi">
              Work Mode <span className="text-errorRed">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {WORK_MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, work_mode: m.value }))}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    form.work_mode === m.value
                      ? 'border-mainPurple bg-lightPurple'
                      : 'border-grey4/60 hover:border-grey3'
                  }`}
                >
                  <p className={`font-satoshi font-semibold text-xs ${form.work_mode === m.value ? 'text-mainPurple' : 'text-grey1'}`}>
                    {m.label}
                  </p>
                  <p className="font-openSans text-[10px] text-grey3 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Experience & salary */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-6 space-y-5">
          <h2 className="font-satoshi font-semibold text-grey1 text-sm">Experience & Compensation</h2>
          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Minimum Years of Experience
            </label>
            <input
              type="number"
              name="experience_years_min"
              value={form.experience_years_min}
              onChange={handleChange}
              min="0"
              max="30"
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Currency
            </label>
            <select name="salary_currency" value={form.salary_currency} onChange={handleChange} className={inputClass}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
                Salary Min
              </label>
              <input
                type="number"
                name="salary_min"
                value={form.salary_min}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 300000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
                Salary Max
              </label>
              <input
                type="number"
                name="salary_max"
                value={form.salary_max}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 500000"
              />
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              name="salary_visible"
              checked={form.salary_visible}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-mainPurple"
            />
            <span className="font-openSans text-sm text-grey1">Show salary on job listing</span>
          </label>
        </div>

        {/* Description & requirements */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-6 space-y-5">
          <h2 className="font-satoshi font-semibold text-grey1 text-sm">Description & Requirements</h2>
          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Job Description <span className="text-errorRed">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
              className={`${inputClass} resize-none`}
              placeholder="Describe the role, responsibilities, and what the candidate will be working on…"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Requirements
            </label>
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="List the skills, experience, and qualifications required…"
            />
          </div>
        </div>

        {/* Tags & deadline */}
        <div className="bg-white rounded-2xl border border-grey4/60 p-6 space-y-5">
          <h2 className="font-satoshi font-semibold text-grey1 text-sm">Tags & Deadline</h2>
          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className={inputClass}
              placeholder="React, TypeScript, Remote-friendly (comma-separated)"
            />
            <p className="mt-1.5 text-xs text-grey3 font-openSans flex items-center gap-1">
              <FaCircleInfo className="w-3 h-3" /> Separate tags with commas
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-grey1 mb-1.5 font-satoshi">
              Application Deadline
            </label>
            <input
              type="datetime-local"
              name="application_deadline"
              value={form.application_deadline}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pb-8">
          <button
            type="button"
            onClick={() => submitJob('draft')}
            disabled={saving || !form.title.trim()}
            className="px-6 py-3 border border-grey4 text-grey1 rounded-lg font-satoshi font-semibold text-sm hover:bg-grey5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => submitJob('active')}
            disabled={saving || !form.title.trim() || !form.description.trim()}
            className="px-8 py-3 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {saving ? 'Publishing…' : 'Publish Job'}
          </button>
        </div>
      </div>
    </div>
  )
}
