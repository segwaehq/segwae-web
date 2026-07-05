'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FaWandMagicSparkles,
  FaFileArrowDown,
  FaEnvelopeOpenText,
  FaGaugeHigh,
  FaArrowRight,
  FaEye,
  FaClockRotateLeft,
} from 'react-icons/fa6'
import type { MatchScore, TailoredResume } from '@/lib/ai/resume-tools'

type ResumeMode = 'text' | 'pdf' | 'stored'
type SavedResume = { id: string; label: string; file_url: string }
type RecentItem = {
  id: string
  job_title: string | null
  company: string | null
  created_at: string
}

export default function ResumeTailorPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [fromJob, setFromJob] = useState<string | null>(null)

  const [resumeMode, setResumeMode] = useState<ResumeMode>('text')
  const [resumeText, setResumeText] = useState('')
  const [pdfBase64, setPdfBase64] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [resumeFileUrl, setResumeFileUrl] = useState('')
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])

  const [match, setMatch] = useState<MatchScore | null>(null)
  const [tailored, setTailored] = useState<TailoredResume | null>(null)
  const [loading, setLoading] = useState<null | 'match' | 'tailor'>(null)
  const [error, setError] = useState<string | null>(null)

  const [entitlement, setEntitlement] = useState<
    { remaining: number; hasPaidPass: boolean; canTailor: boolean } | null
  >(null)
  const [paymentMsg, setPaymentMsg] = useState<string | null>(null)

  const [recent, setRecent] = useState<RecentItem[]>([])
  const [openingId, setOpeningId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/hiring/resumes')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSavedResumes(d?.resumes ?? []))
      .catch(() => {})

    fetchRecent()

    const params = new URLSearchParams(window.location.search)

    const paid = params.get('payment')
    if (paid === 'success') setPaymentMsg('Payment received — your pass is active.')
    else if (paid === 'failed') setPaymentMsg('That payment did not go through.')
    else if (paid === 'error')
      setPaymentMsg('We could not confirm that payment. If you were charged, reload in a minute.')

    fetch('/api/paystack/reconcile', { method: 'POST' })
      .catch(() => {})
      .finally(refreshEntitlement)

    // Pre-fill from a job when arriving via "Tailor for this job".
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
    fetch('/api/ai/generations?kind=tailor')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setRecent(d?.generations ?? []))
      .catch(() => {})
  }

  // Reopen a saved tailor — free, no generation is consumed.
  async function openGeneration(id: string) {
    setOpeningId(id)
    setError(null)
    try {
      const res = await fetch(`/api/ai/generations/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not open that document')
      setMatch(null)
      setTailored(data.generation.payload as TailoredResume)
      requestAnimationFrame(() =>
        document
          .getElementById('ai-result')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open that document')
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

  async function run(kind: 'match' | 'tailor') {
    setError(null)
    setLoading(kind)
    if (kind === 'match') setMatch(null)
    if (kind === 'tailor') setTailored(null)

    const body: Record<string, unknown> = { jobTitle, company, jobDescription }
    if (resumeMode === 'pdf') body.resumePdfBase64 = pdfBase64
    else if (resumeMode === 'stored') body.resumeFileUrl = resumeFileUrl
    else body.resumeText = resumeText

    try {
      const res = await fetch(kind === 'match' ? '/api/ai/match-score' : '/api/ai/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || data?.error || 'Request failed')
      if (kind === 'match') setMatch(data.result as MatchScore)
      else setTailored(data.result as TailoredResume)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
      if (kind === 'tailor') {
        refreshEntitlement()
        fetchRecent() // the new tailor was just saved server-side; surface it
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="font-satoshi font-black text-2xl tracking-[-0.02em] text-[#15131C] dark:text-content">
          Resume Tailor
        </h1>
        <p className="font-openSans text-sm text-[#9098A3] dark:text-content-subtle mt-1">
          Paste a job (or open one from Browse Jobs), add your resume, and get an AI-tailored resume
          and cover letter matched to the role.
        </p>
        {fromJob && (
          <div className="inline-flex items-center gap-2 mt-3 rounded-full bg-[#F1ECFD] dark:bg-[#221b36] px-3 py-1.5">
            <FaWandMagicSparkles className="w-3.5 h-3.5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
            <span className="font-satoshi text-[13px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7]">
              Tailoring for {fromJob}
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
            <ModePill active={resumeMode === 'text'} onClick={() => setResumeMode('text')}>
              Paste text
            </ModePill>
            <ModePill active={resumeMode === 'pdf'} onClick={() => setResumeMode('pdf')}>
              Upload PDF
            </ModePill>
            <ModePill active={resumeMode === 'stored'} onClick={() => setResumeMode('stored')}>
              My saved resume
            </ModePill>
          </div>

          {resumeMode === 'text' && (
            <textarea
              className={`${inputClass} min-h-[170px] resize-y`}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your current resume…"
            />
          )}

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
                No saved resumes on your account. Add one in Resume Manager, or use another input mode.
                (Saved resumes must be PDFs.)
              </p>
            ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => run('match')}
            disabled={!ready || loading !== null}
            className="inline-flex items-center gap-2 rounded-[13px] border border-[#E2E1EA] dark:border-line bg-white dark:bg-surface-sunken px-4 py-3 font-satoshi text-sm font-bold text-[#15131C] dark:text-content hover:bg-[#FAFAFB] dark:hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
          >
            <FaGaugeHigh className="w-4 h-4 text-[#5A2DD4] dark:text-[#b9a4f7]" />
            {loading === 'match' ? 'Scoring…' : 'Match score'}
          </button>
          <button
            onClick={() => run('tailor')}
            disabled={!ready || loading !== null}
            className="inline-flex items-center gap-2 rounded-[13px] bg-brand-gradient px-5 py-3 font-satoshi text-sm font-bold text-white shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0 transition-transform"
          >
            <FaWandMagicSparkles className="w-4 h-4" />
            {loading === 'tailor' ? 'Tailoring… (20–40s)' : 'Tailor my resume'}
          </button>
        </div>

        {paymentMsg && (
          <p className="rounded-[13px] bg-[#E7F6EF] dark:bg-[#12271e] px-3.5 py-2.5 font-openSans text-sm text-[#16895E] dark:text-[#4ade9e]">
            {paymentMsg}
          </p>
        )}

        {entitlement && (
          <div className="space-y-2 border-t border-[#F0EFF4] dark:border-line pt-4">
            <p className="font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">
              {entitlement.remaining > 0
                ? `${entitlement.remaining} tailor${entitlement.remaining === 1 ? '' : 's'} left` +
                  (entitlement.hasPaidPass ? ' · pass active' : ' · free')
                : "You've used your free tailor — grab a pass to keep going."}
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
        {match && <MatchScoreCard match={match} />}
        {tailored && <TailoredResumeCard resume={tailored} />}
        {!match && !tailored && loading === null && <TailorExample />}
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-satoshi text-[11px] font-bold uppercase tracking-widest text-[#9098A3] dark:text-content-subtle mb-1.5">
      {children}
    </h3>
  )
}

function MatchScoreCard({ match }: { match: MatchScore }) {
  return (
    <section className="mt-5 bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F1ECFD] dark:bg-[#221b36] font-satoshi text-xl font-black text-[#5A2DD4] dark:text-[#b9a4f7]">
          {match.score}%
        </div>
        <p className="font-openSans text-sm text-[#4B4658] dark:text-content-muted">{match.verdict}</p>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <List title="Strengths" items={match.strengths} tone="text-[#16895E] dark:text-[#4ade9e]" />
        <List title="Gaps" items={match.gaps} tone="text-[#E0921F] dark:text-[#e0a94f]" />
        <List title="Suggestions" items={match.suggestions} tone="text-[#4B4658] dark:text-content-muted" />
      </div>
    </section>
  )
}

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <ul className={`space-y-1.5 font-openSans text-sm ${tone}`}>
        {items?.map((it, i) => (
          <li key={i}>• {it}</li>
        ))}
      </ul>
    </div>
  )
}

function TailoredResumeCard({ resume }: { resume: TailoredResume }) {
  const [pdfBusy, setPdfBusy] = useState<null | 'resume' | 'cover'>(null)

  async function downloadPdf(type: 'resume' | 'cover') {
    setPdfBusy(type)
    try {
      const res = await fetch('/api/ai/tailor/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, type }),
      })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = type === 'cover' ? 'cover-letter.pdf' : 'tailored-resume.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Could not generate PDF: ${err instanceof Error ? err.message : 'error'}`)
    } finally {
      setPdfBusy(null)
    }
  }

  return (
    <section className="mt-5 bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-satoshi font-black text-xl tracking-[-0.01em] text-[#15131C] dark:text-content">
            {resume.name}
          </h2>
          <p className="font-satoshi text-sm font-bold text-[#5A2DD4] dark:text-[#b9a4f7]">{resume.headline}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadPdf('resume')}
            disabled={pdfBusy !== null}
            className="inline-flex items-center gap-1.5 rounded-[11px] bg-brand-gradient px-3.5 py-2 font-satoshi text-xs font-bold text-white shadow-[0_8px_20px_-8px_rgba(74,55,216,0.5)] hover:-translate-y-px disabled:opacity-50 transition-transform"
          >
            <FaFileArrowDown className="w-3.5 h-3.5" />
            {pdfBusy === 'resume' ? 'Generating…' : 'Resume PDF'}
          </button>
          <button
            onClick={() => downloadPdf('cover')}
            disabled={pdfBusy !== null}
            className="inline-flex items-center gap-1.5 rounded-[11px] border border-[#E2E1EA] dark:border-line px-3.5 py-2 font-satoshi text-xs font-bold text-[#15131C] dark:text-content hover:bg-[#FAFAFB] dark:hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
          >
            <FaEnvelopeOpenText className="w-3.5 h-3.5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
            {pdfBusy === 'cover' ? 'Generating…' : 'Cover letter PDF'}
          </button>
        </div>
      </div>

      <div>
        <SectionTitle>Summary</SectionTitle>
        <p className="font-openSans text-sm leading-relaxed text-[#4B4658] dark:text-content-muted">{resume.summary}</p>
      </div>

      {resume.skills?.length > 0 && (
        <div>
          <SectionTitle>Skills</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((s, i) => (
              <span
                key={i}
                className="rounded-lg bg-[#F6F5FA] dark:bg-white/[0.06] border border-[#ECECF1] dark:border-line px-2.5 py-1 font-openSans text-xs text-[#4B4658] dark:text-content-muted"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle>Experience</SectionTitle>
        <div className="space-y-4">
          {resume.experience?.map((exp, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-satoshi text-sm font-bold text-[#15131C] dark:text-content">
                  {[exp.role, exp.company].filter(Boolean).join(' · ')}
                </p>
                <p className="font-openSans text-xs text-[#9098A3] dark:text-content-subtle shrink-0">{exp.period}</p>
              </div>
              <ul className="mt-1.5 space-y-1 font-openSans text-sm text-[#4B4658] dark:text-content-muted">
                {exp.bullets?.map((b, j) => (
                  <li key={j}>• {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {resume.education?.length > 0 && (
        <div>
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-1">
            {resume.education.map((ed, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 font-openSans text-sm">
                <span className="text-[#4B4658] dark:text-content-muted">
                  {[ed.credential, ed.institution].filter(Boolean).join(' · ')}
                </span>
                <span className="text-xs text-[#9098A3] dark:text-content-subtle shrink-0">{ed.period}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle>Cover letter</SectionTitle>
        <p className="whitespace-pre-wrap font-openSans text-sm leading-relaxed text-[#4B4658] dark:text-content-muted">
          {resume.coverLetter}
        </p>
      </div>
    </section>
  )
}

/**
 * First-run preview: shown before the user has produced anything, so the value is
 * visible before they spend a generation. Clearly marked as an example (dashed
 * border + pill) so it is never mistaken for a real result.
 */
function TailorExample() {
  return (
    <section className="mt-5 rounded-[18px] border border-dashed border-[#D9D6E4] dark:border-[#3a3448] bg-white dark:bg-surface-raised p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1ECFD] dark:bg-[#221b36] px-3 py-1 font-satoshi text-[11px] font-bold uppercase tracking-wide text-[#5A2DD4] dark:text-[#b9a4f7]">
          <FaEye className="w-3 h-3" /> Example output
        </span>
        <span className="font-openSans text-xs text-[#9098A3] dark:text-content-subtle">This is what you’ll get</span>
      </div>

      <div>
        <h2 className="font-satoshi font-black text-xl tracking-[-0.01em] text-[#15131C] dark:text-content">
          Amara Okafor
        </h2>
        <p className="font-satoshi text-sm font-bold text-[#5A2DD4] dark:text-[#b9a4f7]">Senior Frontend Engineer</p>
      </div>

      <div>
        <SectionTitle>Summary</SectionTitle>
        <p className="font-openSans text-sm leading-relaxed text-[#4B4658] dark:text-content-muted">
          Frontend engineer with 6+ years shipping fast, accessible React interfaces for fintech and
          commerce. Led a design-system migration that cut UI defects 40% and mentors junior
          engineers.
        </p>
      </div>

      <div>
        <SectionTitle>Skills</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {['React', 'TypeScript', 'Next.js', 'Accessibility', 'Testing', 'Design Systems'].map(
            (s) => (
              <span
                key={s}
                className="rounded-lg bg-[#F6F5FA] dark:bg-white/[0.06] border border-[#ECECF1] dark:border-line px-2.5 py-1 font-openSans text-xs text-[#4B4658] dark:text-content-muted"
              >
                {s}
              </span>
            ),
          )}
        </div>
      </div>

      <div>
        <SectionTitle>Experience</SectionTitle>
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-satoshi text-sm font-bold text-[#15131C] dark:text-content">
            Frontend Engineer · Zenith Pay
          </p>
          <p className="font-openSans text-xs text-[#9098A3] dark:text-content-subtle shrink-0">2021 — Present</p>
        </div>
        <ul className="mt-1.5 space-y-1 font-openSans text-sm text-[#4B4658] dark:text-content-muted">
          <li>• Rebuilt checkout in Next.js, lifting conversion 18% and cutting load time under 1s.</li>
          <li>• Drove WCAG 2.1 AA accessibility across the app for screen-reader users.</li>
        </ul>
      </div>

      <p className="border-t border-[#F0EFF4] dark:border-line pt-4 font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">
        Fill in the job and your resume above, then hit{' '}
        <span className="font-satoshi font-bold text-[#5A2DD4] dark:text-[#b9a4f7]">Tailor my resume</span> to get this
        tailored to you — with a matching cover letter and one-click PDF export.
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
 * the result card without spending a generation — so a refresh/accident is never
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
          Saved tailors
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
                  {it.job_title || 'Tailored resume'}
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
