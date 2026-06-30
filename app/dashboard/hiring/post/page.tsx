'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  FaArrowLeft, FaArrowRightLong, FaPlus, FaXmark, FaCheck, FaLocationDot,
} from 'react-icons/fa6'
import { CURRENCIES, getCurrencySymbol, formatSalary } from '@/lib/currencies'
import type { Company } from '@/lib/types'

type PostingMode = 'internal' | 'external'
type JobType = 'full_time' | 'part_time' | 'contract' | 'internship'
type WorkMode = 'remote' | 'onsite' | 'hybrid'

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
]

const MODE_META: Record<WorkMode, { label: string; color: string; bg: string }> = {
  remote: { label: 'Remote', color: '#16895E', bg: '#E7F6EF' },
  hybrid: { label: 'Hybrid', color: '#5A2DD4', bg: '#F1ECFD' },
  onsite: { label: 'On-site', color: '#1E5BBF', bg: '#E8EFFB' },
}

const INPUT_CLASS =
  'w-full px-[15px] py-[13px] border border-[#E2E1EA] rounded-xl bg-white text-[14.5px] font-medium text-[#15131C] placeholder:text-[#B6B0C0] outline-none focus:border-[#A98BE8] transition-colors'
const LABEL_CLASS = 'block text-[13px] font-bold text-[#15131C] mb-[7px]'
const EYEBROW_CLASS = 'text-[11px] font-bold tracking-[0.12em] uppercase text-[#5A2DD4] mb-3.5'

function initialsOf(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '—'
  return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

function chipClass(active: boolean): string {
  return active
    ? 'px-[13px] py-[7px] rounded-[9px] border border-transparent cursor-pointer text-[12.5px] font-bold bg-brand-gradient text-white transition-colors'
    : 'px-[13px] py-[7px] rounded-[9px] border border-[#E2E1EA] cursor-pointer text-[12.5px] font-semibold bg-white text-[#6B7280] hover:border-[#C9BCF2] transition-colors'
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[38px] h-[22px] rounded-full p-0.5 flex shrink-0 transition-all ${
        on ? 'bg-brand-gradient justify-end' : 'bg-[#D8D5E2] justify-start'
      }`}
    >
      <span className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
    </button>
  )
}

function Divider() {
  return <div className="h-px bg-[#E7E5EE]" />
}

export default function PostJobPage() {
  const router = useRouter()
  const [hasCompany, setHasCompany] = useState<boolean | null>(null)
  const [company, setCompany] = useState<{ name: string; logo: string | null }>({ name: '', logo: null })
  const [saving, setSaving] = useState(false)
  const [phase, setPhase] = useState<'form' | 'done'>('form')
  const [createdId, setCreatedId] = useState<string | null>(null)

  const [postingMode, setPostingMode] = useState<PostingMode>('internal')
  const [tagInput, setTagInput] = useState('')
  const [form, setForm] = useState({
    title: '',
    job_type: 'full_time' as JobType,
    work_mode: 'remote' as WorkMode,
    location: '',
    experience_years_min: '0',
    salary_min: '',
    salary_max: '',
    salary_currency: 'NGN',
    salary_visible: true,
    description: '',
    requirements: [''] as string[],
    tags: [] as string[],
    application_deadline: '',
    external_url: '',
  })

  useEffect(() => {
    fetch('/api/hiring/company')
      .then((r) => r.json())
      .then((d) => {
        if (!d.company) {
          router.replace('/dashboard/hiring/setup')
          return
        }
        const c = d.company as Company
        setCompany({ name: c.name || '', logo: c.logo_url || null })
        setHasCompany(true)
      })
      .catch(() => router.replace('/dashboard/hiring/setup'))
  }, [router])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [key]: value }))

  const setReq = (i: number, value: string) =>
    setForm((p) => { const arr = [...p.requirements]; arr[i] = value; return { ...p, requirements: arr } })
  const addReq = () => setForm((p) => ({ ...p, requirements: [...p.requirements, ''] }))
  const removeReq = (i: number) =>
    setForm((p) => { const arr = p.requirements.filter((_, j) => j !== i); return { ...p, requirements: arr.length ? arr : [''] } })

  const addTag = (raw: string) => {
    const v = raw.trim()
    if (!v) return
    setForm((p) => (p.tags.includes(v) ? p : { ...p, tags: [...p.tags, v] }))
    setTagInput('')
  }
  const removeTag = (t: string) => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))

  const submitJob = async (status: 'draft' | 'active') => {
    setSaving(true)
    try {
      const reqText = form.requirements.map((r) => r.trim()).filter(Boolean).join('\n')
      const body = {
        title: form.title,
        description: form.description,
        requirements: reqText || undefined,
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
        tags: form.tags,
        application_deadline: form.application_deadline || undefined,
      }
      const res = await fetch('/api/hiring/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create role')
      if (status === 'draft') {
        toast.success('Saved as draft')
        router.push('/dashboard/hiring')
      } else {
        setCreatedId(data.job?.id ?? null)
        setPhase('done')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (hasCompany === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-[88px] h-[88px] rounded-full bg-brand-gradient flex items-center justify-center shadow-[0_18px_40px_-10px_rgba(74,55,216,0.5)] animate-scaleIn">
          <FaCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-satoshi font-black text-[30px] tracking-[-0.03em] text-[#15131C] mt-6 mb-2">
          Your role is live!
        </h1>
        <p className="text-[15.5px] font-medium text-[#6B7280] max-w-[400px] leading-relaxed">
          <span className="font-extrabold text-[#15131C]">{form.title || 'Your role'}</span> is now visible to
          candidates on Segwae. Applications will appear in your pipeline.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-7">
          <Link
            href="/dashboard/hiring"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-gradient text-white text-[15px] font-bold shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
          >
            Go to hiring dashboard <FaArrowRightLong className="w-4 h-4" />
          </Link>
          {createdId && (
            <Link
              href={`/jobs/${createdId}`}
              className="inline-flex items-center px-7 py-3.5 rounded-xl bg-white border border-[#E2E1EA] text-[#15131C] text-[15px] font-bold hover:border-[#B9B9C6] transition-colors"
            >
              View the posting
            </Link>
          )}
        </div>
        <button
          onClick={() => {
            setPhase('form')
            setCreatedId(null)
            setForm((p) => ({
              ...p, title: '', description: '', requirements: [''], tags: [],
              salary_min: '', salary_max: '', location: '', external_url: '',
            }))
          }}
          className="mt-6 text-[13px] font-semibold text-[#9098A3] hover:text-[#15131C] transition-colors"
        >
          Post another role
        </button>
      </div>
    )
  }

  // ── Preview values ───────────────────────────────────────────────────────
  const mode = MODE_META[form.work_mode]
  const typeLabel = JOB_TYPES.find((t) => t.value === form.job_type)?.label ?? ''
  const minN = form.salary_min ? parseFloat(form.salary_min) : null
  const maxN = form.salary_max ? parseFloat(form.salary_max) : null
  const salaryText = !form.salary_visible
    ? 'Competitive'
    : (formatSalary(minN, maxN, form.salary_currency) ?? 'Salary not disclosed')
  const liveReqs = form.requirements.map((r) => r.trim()).filter(Boolean)

  const canPublish =
    !!form.title.trim() && !!form.description.trim() && (postingMode !== 'external' || !!form.external_url.trim())

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/hiring"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9098A3] hover:text-[#15131C] transition-colors mb-4"
        >
          <FaArrowLeft className="w-3 h-3" /> Back to roles
        </Link>
        <p className="text-[11px] font-bold text-[#5A2DD4] uppercase tracking-[0.16em] mb-1.5">For employers</p>
        <h1 className="font-satoshi font-black text-[22px] tracking-[-0.02em] text-[#15131C]">Post a role</h1>
        <p className="text-[13px] font-medium text-[#9098A3] mt-0.5">{company.name || 'Your company'}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_minmax(340px,400px)] gap-8 items-start">
        {/* ── LEFT: form ── */}
        <div className="min-w-0 flex flex-col gap-8">
          {/* Posting mode */}
          <div>
            <div className={EYEBROW_CLASS}>How candidates apply</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(['internal', 'external'] as const).map((m) => {
                const active = postingMode === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPostingMode(m)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      active ? 'border-[#C9BCF2] bg-[#F4F0FE]' : 'border-[#E8E8EF] bg-white hover:border-[#D6CEEC]'
                    }`}
                  >
                    <p className={`text-sm font-bold capitalize ${active ? 'text-[#5A2DD4]' : 'text-[#15131C]'}`}>{m}</p>
                    <p className="text-[12px] font-medium text-[#9098A3] mt-1 leading-relaxed">
                      {m === 'internal'
                        ? 'Candidates apply on Segwae. Pipeline managed here.'
                        : 'Candidates redirect to your site. No pipeline.'}
                    </p>
                  </button>
                )
              })}
            </div>
            {postingMode === 'external' && (
              <div className="mt-4">
                <label className={LABEL_CLASS}>
                  Application URL <span className="text-[#B6463C]">*</span>
                </label>
                <input
                  type="url"
                  value={form.external_url}
                  onChange={(e) => set('external_url', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="https://yourcompany.com/careers/apply"
                />
              </div>
            )}
          </div>

          <Divider />

          {/* Role basics */}
          <div>
            <div className={EYEBROW_CLASS}>Role basics</div>
            <div className="flex flex-col gap-4">
              <div>
                <label className={LABEL_CLASS}>Role title <span className="text-[#B6463C]">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="e.g. Senior Product Designer"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Employment type</label>
                  <div className="flex flex-wrap gap-[7px]">
                    {JOB_TYPES.map((t) => (
                      <button key={t.value} type="button" onClick={() => set('job_type', t.value)} className={chipClass(form.job_type === t.value)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Work mode</label>
                  <div className="flex flex-wrap gap-[7px]">
                    {WORK_MODES.map((m) => (
                      <button key={m.value} type="button" onClick={() => set('work_mode', m.value)} className={chipClass(form.work_mode === m.value)}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="e.g. Lagos, Nigeria or Remote"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Min. years of experience</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={form.experience_years_min}
                    onChange={(e) => set('experience_years_min', e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Compensation */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#5A2DD4]">Compensation</div>
              <button
                type="button"
                onClick={() => set('salary_visible', !form.salary_visible)}
                className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#6B6478]"
              >
                <Toggle on={form.salary_visible} onClick={() => set('salary_visible', !form.salary_visible)} />
                Show salary publicly
              </button>
            </div>
            <div className="grid sm:grid-cols-[1.1fr_1fr_1fr] gap-3">
              <div>
                <label className={LABEL_CLASS}>Currency</label>
                <select
                  value={form.salary_currency}
                  onChange={(e) => set('salary_currency', e.target.value)}
                  className={`${INPUT_CLASS} appearance-none`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Minimum</label>
                <input
                  type="number"
                  value={form.salary_min}
                  onChange={(e) => set('salary_min', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="300000"
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Maximum</label>
                <input
                  type="number"
                  value={form.salary_max}
                  onChange={(e) => set('salary_max', e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="500000"
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Description */}
          <div>
            <div className={EYEBROW_CLASS}>Description</div>
            <label className={LABEL_CLASS}>About the role <span className="text-[#B6463C]">*</span></label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={`${INPUT_CLASS} min-h-[130px] leading-relaxed resize-y`}
              placeholder="What will this person own? What does success look like? A few sentences on the team and the work."
            />
          </div>

          {/* Requirements (dynamic rows → real `requirements` field) */}
          <div>
            <label className={LABEL_CLASS}>What you&apos;re looking for</label>
            <div className="flex flex-col gap-[9px]">
              {form.requirements.map((r, i) => (
                <div key={i} className="flex items-center gap-[9px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9BCF2] shrink-0 mx-[7px]" />
                  <input
                    value={r}
                    onChange={(e) => setReq(i, e.target.value)}
                    className={`${INPUT_CLASS} flex-1 px-[13px] py-[11px]`}
                    placeholder="Add a requirement…"
                  />
                  <button
                    type="button"
                    onClick={() => removeReq(i)}
                    className="w-8 h-8 rounded-[9px] border border-[#EDECF2] bg-white flex items-center justify-center text-[#B6B0C0] hover:text-[#B6463C] hover:border-[#F0C9C4] shrink-0 transition-colors"
                  >
                    <FaXmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addReq}
              className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-2.5 rounded-xl border border-dashed border-[#D8D5E2] bg-transparent text-[13px] font-bold text-[#5A2DD4] hover:border-[#C9BCF2] transition-colors"
            >
              <FaPlus className="w-3 h-3" /> Add requirement
            </button>
          </div>

          <Divider />

          {/* Skills & tags */}
          <div>
            <div className={EYEBROW_CLASS}>Skills &amp; tags</div>
            <div className="flex gap-[9px] mb-3.5">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
                className={`${INPUT_CLASS} flex-1`}
                placeholder="Type a skill and press Enter"
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                className="px-5 rounded-xl bg-[#15131C] text-white text-sm font-bold hover:bg-[#2A2733] transition-colors"
              >
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeTag(t)}
                    className="inline-flex items-center gap-[7px] px-[13px] py-2 rounded-[9px] border border-[#DDCEFA] bg-[#F4F0FE] text-[#5A2DD4] text-[13px] font-bold hover:border-[#C9BCF2] transition-colors"
                  >
                    {t} <FaXmark className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Deadline */}
          <div>
            <label className={LABEL_CLASS}>Application deadline <span className="text-[#9098A3] font-medium">(optional)</span></label>
            <input
              type="datetime-local"
              value={form.application_deadline}
              onChange={(e) => set('application_deadline', e.target.value)}
              className={`${INPUT_CLASS} max-w-[260px]`}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => submitJob('active')}
              disabled={saving || !canPublish}
              className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-gradient text-white text-[15px] font-bold shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-transform"
            >
              {saving ? 'Publishing…' : 'Publish role'} <FaArrowRightLong className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => submitJob('draft')}
              disabled={saving || !form.title.trim()}
              className="px-6 py-3.5 rounded-xl bg-white border border-[#E2E1EA] text-[#374151] text-[15px] font-bold hover:border-[#B9B9C6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
          </div>
        </div>

        {/* ── RIGHT: live preview ── */}
        <div className="hidden lg:block lg:sticky lg:top-6">
          <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#A29CB0] mb-4 text-center">
            Live preview
          </div>

          <div className="text-[11px] font-semibold text-[#9A93A8] mb-2">As a card on the jobs page</div>
          <div className="bg-white border border-[#E8E8EF] rounded-2xl p-[22px] shadow-[0_14px_34px_-22px_rgba(31,18,72,0.3)]">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-[13px] bg-[#F1F0F6] flex items-center justify-center text-sm font-extrabold text-[#5A2DD4] shrink-0 overflow-hidden">
                {company.logo ? (
                  <Image src={company.logo} alt="" width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  initialsOf(company.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15.5px] font-bold text-[#15131C] leading-snug">{form.title || 'Untitled role'}</div>
                <div className="text-[13px] font-medium text-[#9098A3] mt-0.5">{company.name || 'Your company'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-4">
              <span className="text-[10px] font-bold px-[9px] py-[3px] rounded-md" style={{ color: mode.color, background: mode.bg }}>
                {mode.label}
              </span>
              <span className="text-[10px] font-bold text-[#6B7280] bg-[#F3F3F7] px-[9px] py-[3px] rounded-md">{typeLabel}</span>
              <span className="text-[12px] font-medium text-[#9098A3] inline-flex items-center gap-1">
                <FaLocationDot className="w-2.5 h-2.5" /> {form.location || 'Location'}
              </span>
            </div>
            {form.tags.length > 0 && (
              <div className="flex gap-[7px] flex-wrap mt-3">
                {form.tags.slice(0, 4).map((t) => (
                  <span key={t} className="text-[11px] font-medium text-[#6B7280] bg-[#F6F5FA] px-[9px] py-1 rounded-md">{t}</span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-4 pt-[15px] border-t border-[#F1F1F5]">
              <span className="text-[13px] font-extrabold text-[#15131C]">{salaryText}</span>
              <span className="text-[12px] font-medium text-[#9098A3]">Just now</span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-[#9A93A8] mt-[22px] mb-2">Role description</div>
          <div className="bg-white border border-[#E8E8EF] rounded-2xl p-5">
            <div className="text-sm font-extrabold text-[#15131C] mb-2">About the role</div>
            <p className="text-[13px] leading-relaxed font-medium text-[#4B4658] m-0 min-h-[18px] whitespace-pre-wrap">
              {form.description || 'Your role description will appear here as you write it.'}
            </p>
            {liveReqs.length > 0 && (
              <>
                <div className="text-[13px] font-extrabold text-[#15131C] mt-4 mb-2.5">What you&apos;re looking for</div>
                <div className="flex flex-col gap-2">
                  {liveReqs.slice(0, 6).map((r, i) => (
                    <div key={i} className="flex gap-[9px] items-start">
                      <span className="w-[17px] h-[17px] rounded-[5px] bg-[#F4F0FE] flex items-center justify-center text-[#5A2DD4] shrink-0 mt-0.5">
                        <FaCheck className="w-2.5 h-2.5" />
                      </span>
                      <span className="text-[12.5px] leading-snug font-medium text-[#4B4658]">{r}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {form.salary_visible && (
            <p className="text-[11px] font-medium text-[#B6B0C0] mt-3 text-center">
              Salary shown publicly · {getCurrencySymbol(form.salary_currency)} {form.salary_currency}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
