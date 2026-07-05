'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FaUserTie,
  FaComments,
  FaLightbulb,
  FaCircleQuestion,
  FaArrowRight,
  FaEye,
  FaClockRotateLeft,
} from 'react-icons/fa6'
import type { InterviewPrep } from '@/lib/ai/resume-tools'

type ResumeMode = 'text' | 'pdf' | 'stored'
type SavedResume = { id: string; label: string; file_url: string }
type RecentItem = {
  id: string
  job_title: string | null
  company: string | null
  created_at: string
}

export default function InterviewPrepPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [fromJob, setFromJob] = useState<string | null>(null)

  const [resumeMode, setResumeMode] = useState<ResumeMode>('stored')
  const [resumeText, setResumeText] = useState('')
  const [pdfBase64, setPdfBase64] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [resumeFileUrl, setResumeFileUrl] = useState('')
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])

  const [prep, setPrep] = useState<InterviewPrep | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [entitlement, setEntitlement] = useState<
    { remaining: number; hasPaidPass: boolean; canTailor: boolean } | null
  >(null)

  const [recent, setRecent] = useState<RecentItem[]>([])
  const [openingId, setOpeningId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/hiring/resumes')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list: SavedResume[] = d?.resumes ?? []
        setSavedResumes(list)
        if (list[0]) setResumeFileUrl(list[0].file_url)
        else setResumeMode('text')
      })
      .catch(() => {})

    fetchRecent()

    // Safety-net for payments that missed the callback verify, then load status.
    fetch('/api/paystack/reconcile', { method: 'POST' })
      .catch(() => {})
      .finally(refreshEntitlement)

    const params = new URLSearchParams(window.location.search)
    const jobId = params.get('job')
    if (jobId) {
      fetch(`/api/hiring/jobs/${jobId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const job = d?.job
          if (!job) return
          setJobTitle(job.title ?? '')
          setCompany(job.companies?.name ?? job.company_name ?? '')
          setJobDescription([job.description, job.requirements].filter(Boolean).join('\n\n'))
          setFromJob(job.title ?? 'this job')
        })
        .catch(() => {})
    }
  }, [])

  function refreshEntitlement() {
    fetch('/api/ai/entitlements')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEntitlement(d?.status ?? null))
      .catch(() => {})
  }

  function fetchRecent() {
    fetch('/api/ai/generations?kind=interview')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setRecent(d?.generations ?? []))
      .catch(() => {})
  }

  // Reopen a saved prep pack — free, no generation is consumed.
  async function openGeneration(id: string) {
    setOpeningId(id)
    setError(null)
    try {
      const res = await fetch(`/api/ai/generations/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not open that prep pack')
      setPrep(data.generation.payload as InterviewPrep)
      requestAnimationFrame(() =>
        document
          .getElementById('ai-result')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open that prep pack')
    } finally {
      setOpeningId(null)
    }
  }

  async function onPickPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfName(file.name)
    setPdfBase64(await fileToBase64(file))
  }

  const resumeReady =
    (resumeMode === 'text' && resumeText.trim().length > 0) ||
    (resumeMode === 'pdf' && pdfBase64.length > 0) ||
    (resumeMode === 'stored' && resumeFileUrl.length > 0)
  const ready = jobDescription.trim().length > 0 && resumeReady

  async function run() {
    setError(null)
    setLoading(true)
    setPrep(null)

    const body: Record<string, unknown> = { jobTitle, company, jobDescription }
    if (resumeMode === 'pdf') body.resumePdfBase64 = pdfBase64
    else if (resumeMode === 'stored') body.resumeFileUrl = resumeFileUrl
    else body.resumeText = resumeText

    try {
      const res = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || data?.error || 'Request failed')
      setPrep(data.result as InterviewPrep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      refreshEntitlement()
      fetchRecent() // the new prep pack was just saved server-side; surface it
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="font-satoshi font-black text-2xl tracking-[-0.02em] text-[#15131C] dark:text-content">
          Interview Prep
        </h1>
        <p className="font-openSans text-sm text-[#9098A3] dark:text-content-subtle mt-1">
          Get the questions you’re most likely to be asked for a specific role — with answers drawn
          straight from your own resume, ready to rehearse.
        </p>
        {fromJob && (
          <div className="inline-flex items-center gap-2 mt-3 rounded-full bg-[#F1ECFD] dark:bg-[#221b36] px-3 py-1.5">
            <FaUserTie className="w-3.5 h-3.5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
            <span className="font-satoshi text-[13px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7]">
              Prepping for {fromJob}
            </span>
          </div>
        )}
      </header>

      <div className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job title">
            <input
              className={inputClass}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Senior Frontend Engineer"
            />
          </Field>
          <Field label="Company">
            <input
              className={inputClass}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
            />
          </Field>
        </div>

        <Field label="Job description & requirements">
          <textarea
            className={`${inputClass} min-h-[140px] resize-y`}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting…"
          />
        </Field>

        <div>
          <span className="block font-satoshi text-[13px] font-bold text-[#15131C] dark:text-content mb-2">Resume</span>
          <div className="flex flex-wrap gap-2 mb-3">
            <ModePill active={resumeMode === 'stored'} onClick={() => setResumeMode('stored')}>
              My saved resume
            </ModePill>
            <ModePill active={resumeMode === 'pdf'} onClick={() => setResumeMode('pdf')}>
              Upload PDF
            </ModePill>
            <ModePill active={resumeMode === 'text'} onClick={() => setResumeMode('text')}>
              Paste text
            </ModePill>
          </div>

          {resumeMode === 'stored' &&
            (savedResumes.length > 0 ? (
              <select
                className={inputClass}
                value={resumeFileUrl}
                onChange={(e) => setResumeFileUrl(e.target.value)}
              >
                <option value="">Select a saved resume…</option>
                {savedResumes.map((r) => (
                  <option key={r.id} value={r.file_url}>
                    {r.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="font-openSans text-sm text-[#9098A3] dark:text-content-subtle">
                No saved resumes on your account. Add one in Resume Manager, or use another input
                mode. (Saved resumes must be PDFs.)
              </p>
            ))}

          {resumeMode === 'pdf' && (
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={onPickPdf}
                className="font-openSans text-sm text-[#6B6478] dark:text-content-muted file:mr-3 file:rounded-[10px] file:border-0 file:bg-[#F1ECFD] dark:file:bg-[#221b36] file:px-3.5 file:py-2 file:font-satoshi file:text-sm file:font-bold file:text-[#5A2DD4] dark:file:text-[#b9a4f7]"
              />
              {pdfName && <span className="font-openSans text-xs text-[#9098A3] dark:text-content-subtle">{pdfName}</span>}
            </div>
          )}

          {resumeMode === 'text' && (
            <textarea
              className={`${inputClass} min-h-[170px] resize-y`}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your current resume…"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={run}
            disabled={!ready || loading}
            className="inline-flex items-center gap-2 rounded-[13px] bg-brand-gradient px-5 py-3 font-satoshi text-sm font-bold text-white shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0 transition-transform"
          >
            <FaComments className="w-4 h-4" />
            {loading ? 'Preparing… (15–30s)' : 'Prepare me for the interview'}
          </button>
        </div>

        {entitlement && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0EFF4] dark:border-line pt-4">
            <p className="font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">
              {entitlement.remaining > 0
                ? `${entitlement.remaining} AI generation${entitlement.remaining === 1 ? '' : 's'} left` +
                  (entitlement.hasPaidPass ? ' · pass active' : ' · free')
                : "You're out of AI generations — grab a pass to keep going."}
            </p>
            <Link
              href="/dashboard/upgrade"
              className="inline-flex items-center gap-2 rounded-[13px] bg-brand-gradient px-4 py-2.5 font-satoshi text-xs font-bold text-white shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
            >
              {entitlement.remaining > 0 ? 'View passes' : 'Get a pass'}
              <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {error && (
          <p className="rounded-[13px] bg-[#FDECEC] dark:bg-[#2a1512] px-3.5 py-2.5 font-openSans text-sm text-[#C0392B] dark:text-[#f2857b]">
            {error}
          </p>
        )}
      </div>

      <div id="ai-result">
        {prep && <InterviewPrepCard prep={prep} />}
        {!prep && !loading && <PrepExample />}
      </div>

      {recent.length > 0 && (
        <RecentList items={recent} openingId={openingId} onOpen={openGeneration} />
      )}
    </div>
  )
}

const inputClass =
  'w-full rounded-[13px] border border-[#E2E1EA] dark:border-line px-3.5 py-[11px] font-openSans text-sm text-[#15131C] dark:text-content placeholder:text-[#9098A3] dark:placeholder:text-content-subtle focus:border-[#A98BE8] dark:focus:border-[#6a4fb0] focus:outline-none transition-colors bg-white dark:bg-surface-sunken'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

function ModePill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 font-satoshi text-[13px] font-bold transition-colors ${
        active
          ? 'bg-[#F1ECFD] text-[#5A2DD4] dark:bg-[#221b36] dark:text-[#b9a4f7]'
          : 'border border-[#E2E1EA] dark:border-line text-[#6B6478] dark:text-content-muted hover:bg-[#FAFAFB] dark:hover:bg-white/[0.04]'
      }`}
    >
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-satoshi text-[13px] font-bold text-[#15131C] dark:text-content mb-2">{label}</span>
      {children}
    </label>
  )
}

function InterviewPrepCard({ prep }: { prep: InterviewPrep }) {
  return (
    <section className="mt-5 space-y-4">
      {prep.overview && (
        <div className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6">
          <h3 className="font-satoshi text-[11px] font-bold uppercase tracking-widest text-[#9098A3] dark:text-content-subtle mb-1.5">
            What to expect
          </h3>
          <p className="font-openSans text-sm leading-relaxed text-[#4B4658] dark:text-content-muted">{prep.overview}</p>
        </div>
      )}

      <div className="space-y-3">
        {prep.questions?.map((q, i) => (
          <details
            key={i}
            open={i === 0}
            className="group bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] overflow-hidden"
          >
            <summary className="flex items-start gap-3 p-5 cursor-pointer list-none">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1ECFD] dark:bg-[#221b36] font-satoshi text-xs font-black text-[#5A2DD4] dark:text-[#b9a4f7]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                {q.category && (
                  <span className="font-satoshi text-[10px] font-bold uppercase tracking-widest text-[#A8A2B4] dark:text-content-subtle">
                    {q.category}
                  </span>
                )}
                <p className="font-satoshi text-[15px] font-bold text-[#15131C] dark:text-content">{q.question}</p>
              </div>
              <FaArrowRight className="mt-1 w-3 h-3 shrink-0 text-[#A8A2B4] dark:text-content-subtle transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-5 pb-5 pl-14 space-y-3">
              <div>
                <h4 className="font-satoshi text-[11px] font-bold uppercase tracking-widest text-[#5A2DD4] dark:text-[#b9a4f7] mb-1">
                  Your answer
                </h4>
                <p className="whitespace-pre-wrap font-openSans text-sm leading-relaxed text-[#4B4658] dark:text-content-muted">
                  {q.suggestedAnswer}
                </p>
              </div>
              {q.tip && (
                <div className="flex items-start gap-2 rounded-[13px] bg-[#FBF7EC] dark:bg-[#2a2410] px-3.5 py-2.5">
                  <FaLightbulb className="mt-0.5 w-3.5 h-3.5 shrink-0 text-[#E0921F] dark:text-[#e0a94f]" />
                  <p className="font-openSans text-[13px] text-[#8A6D1E] dark:text-[#e0c98a]">{q.tip}</p>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>

      {prep.questionsToAsk?.length > 0 && (
        <div className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6">
          <h3 className="flex items-center gap-2 font-satoshi text-[11px] font-bold uppercase tracking-widest text-[#9098A3] dark:text-content-subtle mb-3">
            <FaCircleQuestion className="w-3.5 h-3.5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
            Smart questions to ask them
          </h3>
          <ul className="space-y-2 font-openSans text-sm text-[#4B4658] dark:text-content-muted">
            {prep.questionsToAsk.map((q, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5A2DD4] dark:bg-[#b9a4f7]" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

/**
 * First-run preview: shows what a prep pack looks like before the user spends a
 * generation. Clearly marked as an example (dashed border + pill) so it is never
 * mistaken for a real result.
 */
function PrepExample() {
  return (
    <section className="mt-5 rounded-[18px] border border-dashed border-[#D9D6E4] dark:border-[#3a3448] bg-white dark:bg-surface-raised p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1ECFD] dark:bg-[#221b36] px-3 py-1 font-satoshi text-[11px] font-bold uppercase tracking-wide text-[#5A2DD4] dark:text-[#b9a4f7]">
          <FaEye className="w-3 h-3" /> Example output
        </span>
        <span className="font-openSans text-xs text-[#9098A3] dark:text-content-subtle">This is what you’ll get</span>
      </div>

      <div>
        <h3 className="font-satoshi text-[11px] font-bold uppercase tracking-widest text-[#9098A3] dark:text-content-subtle mb-1.5">
          What to expect
        </h3>
        <p className="font-openSans text-sm leading-relaxed text-[#4B4658] dark:text-content-muted">
          Expect a mix of behavioural and role-specific questions probing how you make frontend
          architecture decisions and collaborate with design.
        </p>
      </div>

      <div className="rounded-[18px] border border-[#E8E8EF] dark:border-line overflow-hidden">
        <div className="flex items-start gap-3 p-5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1ECFD] dark:bg-[#221b36] font-satoshi text-xs font-black text-[#5A2DD4] dark:text-[#b9a4f7]">
            1
          </span>
          <div className="min-w-0 flex-1">
            <span className="font-satoshi text-[10px] font-bold uppercase tracking-widest text-[#A8A2B4] dark:text-content-subtle">
              Behavioral
            </span>
            <p className="font-satoshi text-[15px] font-bold text-[#15131C] dark:text-content">
              Tell me about a time you improved a web app’s performance.
            </p>
          </div>
        </div>
        <div className="px-5 pb-5 pl-14 space-y-3">
          <div>
            <h4 className="font-satoshi text-[11px] font-bold uppercase tracking-widest text-[#5A2DD4] dark:text-[#b9a4f7] mb-1">
              Your answer
            </h4>
            <p className="font-openSans text-sm leading-relaxed text-[#4B4658] dark:text-content-muted">
              At Zenith Pay our checkout took over 3 seconds to load. I profiled the bundle,
              code-split the payment step, and moved to Next.js server components — load time dropped
              below 1 second and conversion rose 18%.
            </p>
          </div>
          <div className="flex items-start gap-2 rounded-[13px] bg-[#FBF7EC] dark:bg-[#2a2410] px-3.5 py-2.5">
            <FaLightbulb className="mt-0.5 w-3.5 h-3.5 shrink-0 text-[#E0921F] dark:text-[#e0a94f]" />
            <p className="font-openSans text-[13px] text-[#8A6D1E] dark:text-[#e0c98a]">
              They’re checking that you measure impact, not just ship features.
            </p>
          </div>
        </div>
      </div>

      <p className="border-t border-[#F0EFF4] dark:border-line pt-4 font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">
        Fill in the job and your resume above, then hit{' '}
        <span className="font-satoshi font-bold text-[#5A2DD4] dark:text-[#b9a4f7]">Prepare me for the interview</span>{' '}
        to get ~10 of these — each answered from your own resume.
      </p>
    </section>
  )
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

/**
 * Saved history for the tool. Reopening an item pulls the stored payload back into
 * the result view without spending a generation — so a refresh/accident is never
 * costly.
 */
function RecentList({
  items,
  openingId,
  onOpen,
}: {
  items: RecentItem[]
  openingId: string | null
  onOpen: (id: string) => void
}) {
  return (
    <section className="mt-5 bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6">
      <div className="flex items-center gap-2 mb-3">
        <FaClockRotateLeft className="w-3.5 h-3.5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
        <h3 className="font-satoshi text-[11px] font-bold uppercase tracking-widest text-[#9098A3] dark:text-content-subtle">
          Saved prep packs
        </h3>
      </div>
      <ul className="divide-y divide-[#F0EFF4] dark:divide-line">
        {items.map((it) => (
          <li key={it.id}>
            <button
              onClick={() => onOpen(it.id)}
              disabled={openingId !== null}
              className="group flex w-full items-center justify-between gap-3 py-3 text-left disabled:opacity-50"
            >
              <div className="min-w-0">
                <p className="font-satoshi text-sm font-bold text-[#15131C] dark:text-content truncate">
                  {it.job_title || 'Interview prep'}
                  {it.company ? (
                    <span className="font-openSans font-normal text-[#9098A3] dark:text-content-subtle">
                      {' '}
                      · {it.company}
                    </span>
                  ) : null}
                </p>
                <p className="font-openSans text-xs text-[#9098A3] dark:text-content-subtle">
                  {timeAgo(it.created_at)}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 font-satoshi text-xs font-bold text-[#5A2DD4] dark:text-[#b9a4f7]">
                {openingId === it.id ? 'Opening…' : 'Open'}
                <FaArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
