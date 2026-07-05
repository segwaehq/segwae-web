'use client'

import { useState, useEffect, useCallback, use, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  FaArrowLeft, FaCheck, FaXmark, FaArrowUpRightFromSquare,
  FaUser, FaEnvelope, FaPhone, FaFileLines, FaLink, FaGlobe,
  FaCalendarPlus, FaCalendarCheck, FaTableList, FaTableColumns,
} from 'react-icons/fa6'
import type { JobApplication, Job, ApplicantProfile, EmailTemplate, InterviewSchedule } from '@/lib/types'

// ─── Status constants ─────────────────────────────────────────────────────────

const APP_STATUSES = ['all', 'applied', 'under_review', 'shortlisted', 'accepted', 'rejected'] as const
type AppTab = (typeof APP_STATUSES)[number]

const STATUS_LABEL: Record<string, string> = {
  applied: 'Applied', under_review: 'Under Review', shortlisted: 'Shortlisted',
  accepted: 'Accepted', rejected: 'Rejected',
}
const STATUS_COLORS: Record<string, string> = {
  applied: 'text-[#5A2DD4] bg-[#F1ECFD] dark:text-[#b9a4f7] dark:bg-[#221b36]',
  under_review: 'text-[#1E5BBF] bg-[#E8EFFB] dark:text-[#7fb0f5] dark:bg-[#13203a]',
  shortlisted: 'text-[#C2410C] bg-[#FDF0E7] dark:text-[#f2a56b] dark:bg-[#2a1a10]',
  accepted: 'text-[#16895E] bg-[#E7F6EF] dark:text-[#4ade9e] dark:bg-[#12271e]',
  rejected: 'text-[#9098A3] bg-[#F3F3F7] dark:text-content-subtle dark:bg-white/[0.06]',
}

const PIPELINE_STAGES = [
  { key: 'applied', label: 'Applied', dot: '#5A2DD4' },
  { key: 'under_review', label: 'Under Review', dot: '#1E5BBF' },
  { key: 'shortlisted', label: 'Shortlisted', dot: '#C2410C' },
  { key: 'accepted', label: 'Accepted', dot: '#16895E' },
  { key: 'rejected', label: 'Rejected', dot: '#9098A3' },
] as const

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7C5AF6,#2563EB)',
  'linear-gradient(135deg,#16895E,#34D399)',
  'linear-gradient(135deg,#C2410C,#F59E0B)',
  'linear-gradient(135deg,#DB2777,#F472B6)',
  'linear-gradient(135deg,#0891B2,#22D3EE)',
  'linear-gradient(135deg,#4F46E5,#818CF8)',
]
function avatarFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length]
}
function initialsOf(name: string | null | undefined): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '—'
  return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 border border-[#E2E1EA] dark:border-line rounded-xl text-sm font-medium text-[#15131C] dark:text-content placeholder:text-[#B6B0C0] dark:placeholder:text-content-subtle bg-white dark:bg-surface-sunken outline-none focus:border-[#A98BE8] dark:focus:border-[#6a4fb0] transition-colors'

// ─── Send Email Modal ─────────────────────────────────────────────────────────

function SendEmailModal({
  application,
  companyName,
  onClose,
}: {
  application: JobApplication
  companyName: string
  onClose: () => void
}) {
  const profile = application.users as ApplicantProfile | undefined
  const applicantEmail = profile?.email ?? ''
  const firstName = profile?.name?.split(' ')[0] ?? 'there'

  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  useEffect(() => {
    fetch('/api/hiring/templates')
      .then((r) => r.json())
      .then((data) => {
        const tpls: EmailTemplate[] = data.templates ?? []
        setTemplates(tpls)
        if (tpls.length > 0) fillTemplate(tpls[0], tpls[0].id, firstName)
      })
      .catch(() => toast.error('Failed to load templates'))
      .finally(() => setLoadingTemplates(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function fillTemplate(tpl: EmailTemplate, id: string, fn: string) {
    const replace = (str: string) =>
      str
        .replace(/{{first_name}}/g, fn)
        .replace(/{{job_title}}/g, (application.jobs as { title?: string } | undefined)?.title ?? 'the role')
        .replace(/{{company_name}}/g, companyName || 'the company')
        .replace(/{{decision_date}}/g, new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
    setSelectedTemplateId(id)
    setSubject(replace(tpl.subject))
    setBody(replace(tpl.body))
  }

  const handleTemplateSelect = (id: string) => {
    const tpl = templates.find((t) => t.id === id)
    if (tpl) fillTemplate(tpl, id, firstName)
  }

  const handleSend = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/hiring/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: application.id,
          template_id: selectedTemplateId || undefined,
          subject_override: subject,
          body_override: body,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSent(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="fixed inset-0 bg-[#0F1115]/45 dark:bg-black/65 backdrop-blur-[2px] z-200 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-raised rounded-2xl w-full max-w-sm p-10 flex flex-col items-center shadow-[0_24px_60px_-15px_rgba(15,17,21,0.4)] animate-scaleIn">
          <div className="w-14 h-14 rounded-full bg-[#E7F6EF] dark:bg-[#12271e] flex items-center justify-center mb-4">
            <FaCheck className="w-6 h-6 text-[#16895E] dark:text-[#4ade9e]" />
          </div>
          <h3 className="font-satoshi font-black text-xl text-[#15131C] dark:text-content mb-2">Email sent</h3>
          <p className="text-sm font-medium text-[#8B8499] dark:text-content-muted text-center mb-6">
            Your message was delivered to {applicantEmail}
          </p>
          <button onClick={onClose} className="w-full py-2.5 bg-brand-gradient text-white rounded-xl font-bold text-sm shadow-[0_8px_18px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0F1115]/45 dark:bg-black/65 backdrop-blur-[2px] z-200 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-raised rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-[0_24px_60px_-15px_rgba(15,17,21,0.4)] animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECECF1] dark:border-line shrink-0">
          <p className="font-satoshi font-bold text-sm text-[#15131C] dark:text-content">Email — {profile?.name ?? 'Applicant'}</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content hover:bg-[#F3F3F7] dark:hover:bg-white/[0.06] transition-colors">
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {loadingTemplates ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : templates.length > 0 ? (
            <div>
              <p className="text-xs font-bold text-[#9098A3] dark:text-content-subtle mb-2">Template</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      selectedTemplateId === t.id
                        ? 'border-[#DDCEFA] bg-[#F4F0FE] text-[#5A2DD4] dark:border-[#4a3d78] dark:bg-[#241d38] dark:text-[#b9a4f7]'
                        : 'border-[#E8E8EF] dark:border-line text-[#6B6478] dark:text-content-muted hover:border-[#C9BCF2] dark:hover:border-[#4a3d78]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#FAFAFB] dark:bg-white/[0.03] border border-[#EFEEF4] dark:border-line rounded-xl">
            <FaEnvelope className="w-3.5 h-3.5 text-[#9098A3] dark:text-content-subtle shrink-0" />
            <span className="text-xs font-medium text-[#9098A3] dark:text-content-subtle">To: <span className="text-[#15131C] dark:text-content font-bold">{applicantEmail}</span></span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-[#ECECF1] dark:border-line flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#E2E1EA] dark:border-line bg-white dark:bg-surface-raised text-[#374151] dark:text-content-muted rounded-xl font-bold text-sm hover:border-[#B9B9C6] dark:hover:border-content-subtle transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="flex-2 flex items-center justify-center gap-2 py-2.5 bg-brand-gradient text-white rounded-xl font-bold text-sm shadow-[0_8px_18px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-transform"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaEnvelope className="w-3.5 h-3.5" />
            )}
            {sending ? 'Sending…' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Schedule Interview Modal ─────────────────────────────────────────────────

function ScheduleInterviewModal({
  application,
  onClose,
  onScheduled,
}: {
  application: JobApplication
  onClose: () => void
  onScheduled: (interview: InterviewSchedule) => void
}) {
  const profile = application.users as ApplicantProfile | undefined
  const tomorrow = new Date(Date.now() + 86400000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const defaultDate = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`

  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState('45')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<InterviewSchedule | null>(null)

  const handleSchedule = async () => {
    if (!date || !time) return
    setSaving(true)
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString()
      const res = await fetch('/api/hiring/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: application.id,
          scheduled_at: scheduledAt,
          duration_minutes: parseInt(duration),
          notes: notes || null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setResult(data.interview)
      onScheduled(data.interview)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to schedule interview')
    } finally {
      setSaving(false)
    }
  }

  if (result) {
    const dateStr = new Date(result.scheduled_at).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const timeStr = new Date(result.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return (
      <div className="fixed inset-0 bg-[#0F1115]/45 dark:bg-black/65 backdrop-blur-[2px] z-200 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-raised rounded-2xl w-full max-w-sm p-10 flex flex-col items-center shadow-[0_24px_60px_-15px_rgba(15,17,21,0.4)] animate-scaleIn">
          <div className="w-14 h-14 rounded-full bg-[#E7F6EF] dark:bg-[#12271e] flex items-center justify-center mb-4">
            <FaCheck className="w-6 h-6 text-[#16895E] dark:text-[#4ade9e]" />
          </div>
          <h3 className="font-satoshi font-black text-xl text-[#15131C] dark:text-content mb-1">Interview scheduled</h3>
          <p className="text-sm font-medium text-[#8B8499] dark:text-content-muted text-center mb-1">{dateStr} at {timeStr}</p>
          <p className="text-xs font-medium text-[#9098A3] dark:text-content-subtle text-center mb-5">{duration} minutes</p>
          {result.meet_link && (
            <div className="w-full p-3 bg-[#F4F0FE] dark:bg-[#241d38] rounded-xl mb-5">
              <p className="text-[11px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7] mb-1">Meeting link</p>
              <a href={result.meet_link} target="_blank" rel="noopener noreferrer"
                className="text-xs font-medium text-[#5A2DD4] dark:text-[#b9a4f7] break-all hover:underline">
                {result.meet_link}
              </a>
            </div>
          )}
          <button onClick={onClose} className="w-full py-2.5 bg-brand-gradient text-white rounded-xl font-bold text-sm shadow-[0_8px_18px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0F1115]/45 dark:bg-black/65 backdrop-blur-[2px] z-200 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-raised rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-[0_24px_60px_-15px_rgba(15,17,21,0.4)] animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECECF1] dark:border-line shrink-0">
          <p className="font-satoshi font-bold text-sm text-[#15131C] dark:text-content">
            Schedule interview — {profile?.name ?? 'Applicant'}
          </p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content hover:bg-[#F3F3F7] dark:hover:bg-white/[0.06] transition-colors">
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={defaultDate}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
            </select>
          </div>

          <div className="p-3.5 bg-[#F4F0FE] dark:bg-[#241d38] border border-[#E6DCFB] dark:border-[#4a3d78] rounded-xl">
            <p className="text-xs font-bold text-[#5A2DD4] dark:text-[#b9a4f7] mb-1">Video link</p>
            <p className="text-xs font-medium text-[#6B6478] dark:text-content-muted">
              A Jitsi Meet link will be auto-generated and shared with the applicant.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5">Internal notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Interviewer prep notes, topics to cover…"
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-[#ECECF1] dark:border-line flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#E2E1EA] dark:border-line bg-white dark:bg-surface-raised text-[#374151] dark:text-content-muted rounded-xl font-bold text-sm hover:border-[#B9B9C6] dark:hover:border-content-subtle transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={saving || !date || !time}
            className="flex-2 flex items-center justify-center gap-2 py-2.5 bg-brand-gradient text-white rounded-xl font-bold text-sm shadow-[0_8px_18px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-transform"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaCalendarPlus className="w-3.5 h-3.5" />
            )}
            {saving ? 'Scheduling…' : 'Schedule Interview'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Applicant Avatar ─────────────────────────────────────────────────────────

function Avatar({
  profile,
  size,
  ring,
}: {
  profile: ApplicantProfile | undefined
  size: number
  ring?: boolean
}) {
  const name = profile?.name ?? ''
  const fontSize = Math.round(size * 0.32)
  if (profile?.profile_image_url) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 ${ring ? 'border-4 border-white dark:border-surface-raised' : ''}`}
        style={{ width: size, height: size }}
      >
        <Image src={profile.profile_image_url} alt={name} width={size} height={size} className="object-cover w-full h-full" />
      </div>
    )
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-black text-white shrink-0 ${ring ? 'border-4 border-white dark:border-surface-raised' : ''}`}
      style={{ width: size, height: size, fontSize, background: avatarFor(name || profile?.id || 'x') }}
    >
      {name ? initialsOf(name) : <FaUser style={{ width: fontSize, height: fontSize }} />}
    </div>
  )
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({
  application,
  onClick,
  onDragStart,
}: {
  application: JobApplication
  onClick: () => void
  onDragStart: (e: React.DragEvent, id: string) => void
}) {
  const profile = application.users as ApplicantProfile | undefined
  const hasInterview = !!(application as JobApplication & { interview_schedules?: unknown }).interview_schedules

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, application.id)}
      onClick={onClick}
      className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[13px] p-[13px] cursor-grab active:cursor-grabbing transition-all hover:shadow-[0_8px_20px_-10px_rgba(31,18,72,0.3)] hover:border-[#D6CEEC] dark:hover:border-[#4a3d78] active:opacity-75 select-none"
    >
      <div className="flex items-center gap-2.5">
        <Avatar profile={profile} size={38} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[13.5px] text-[#15131C] dark:text-content truncate">{profile?.name ?? '—'}</p>
          {profile?.title && <p className="text-[11.5px] font-medium text-[#9098A3] dark:text-content-subtle truncate">{profile.title}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-[11px] font-medium text-[#B6B0C0] dark:text-content-subtle">
          {new Date(application.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
        <div className="flex items-center gap-1.5 text-[#B6B0C0] dark:text-content-subtle">
          {application.resume_url && <FaFileLines className="w-3 h-3" title="Resume attached" />}
          {profile?.portfolio_or_website_link && <FaGlobe className="w-3 h-3" title="Portfolio" />}
          {hasInterview && <FaCalendarCheck className="w-3 h-3 text-[#16895E] dark:text-[#4ade9e]" title="Interview scheduled" />}
        </div>
      </div>
    </div>
  )
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────

function KanbanBoard({
  applications,
  onCardClick,
  onStatusChange,
}: {
  applications: JobApplication[]
  onCardClick: (app: JobApplication) => void
  onStatusChange: (id: string, status: string) => Promise<void>
}) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const draggingId = useRef<string | null>(null)

  const onDragStart = (e: React.DragEvent, id: string) => {
    draggingId.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(col)
  }

  const onDragLeave = () => setDragOverCol(null)

  const onDrop = async (e: React.DragEvent, col: string) => {
    e.preventDefault()
    setDragOverCol(null)
    const id = draggingId.current
    if (!id) return
    const app = applications.find((a) => a.id === id)
    if (!app || app.status === col) return
    await onStatusChange(id, col)
    draggingId.current = null
  }

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-4 min-h-[60vh]">
      {PIPELINE_STAGES.map((stage) => {
        const colApps = applications.filter((a) => a.status === stage.key)
        const isDragTarget = dragOverCol === stage.key
        return (
          <div
            key={stage.key}
            onDragOver={(e) => onDragOver(e, stage.key)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, stage.key)}
            className={`shrink-0 w-[266px] flex flex-col rounded-2xl p-3 transition-colors ${
              isDragTarget ? 'bg-[#F0EBFC] dark:bg-[#241d38] outline-2 outline-dashed outline-[#C9BCF2] dark:outline-[#4a3d78] -outline-offset-2' : 'bg-[#F1F1F4] dark:bg-white/[0.04]'
            }`}
          >
            <div className="px-1 pb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: stage.dot }} />
                <span className="font-extrabold text-[13px] text-[#15131C] dark:text-content">{stage.label}</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#E7E6EE] dark:bg-white/[0.08] text-[#6B6478] dark:text-content-muted">
                {colApps.length}
              </span>
            </div>
            <div className="flex-1 space-y-2.5 min-h-[60px]">
              {colApps.map((app) => (
                <KanbanCard
                  key={app.id}
                  application={app}
                  onClick={() => onCardClick(app)}
                  onDragStart={onDragStart}
                />
              ))}
              {colApps.length === 0 && (
                <div className={`h-16 flex items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                  isDragTarget ? 'border-[#C9BCF2] dark:border-[#4a3d78]' : 'border-[#DEDDE6] dark:border-line'
                }`}>
                  <span className="text-[11px] font-medium text-[#9098A3] dark:text-content-subtle">Drop here</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Applicant Slide-over ─────────────────────────────────────────────────────

function ApplicantDrawer({
  application,
  companyName,
  onClose,
  onStatusChange,
}: {
  application: JobApplication
  companyName: string
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [emailModal, setEmailModal] = useState(false)
  const [scheduleModal, setScheduleModal] = useState(false)
  const [localApp, setLocalApp] = useState(application)
  const profile = localApp.users as ApplicantProfile | undefined

  const updateStatus = async (status: string) => {
    setBusy(status)
    try {
      const res = await fetch(`/api/hiring/applications/${localApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setLocalApp((prev) => ({ ...prev, status: status as JobApplication['status'] }))
      onStatusChange(localApp.id, status)
      toast.success(`Marked as ${STATUS_LABEL[status]}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setBusy(null)
    }
  }

  const isResolved = ['accepted', 'rejected'].includes(localApp.status)
  const canSchedule = ['shortlisted', 'accepted'].includes(localApp.status)

  return (
    <>
      <div className="fixed inset-0 bg-[#0F1115]/45 dark:bg-black/65 backdrop-blur-[2px] z-40 animate-fadeIn" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[460px] max-w-[94vw] bg-white dark:bg-surface-raised z-50 shadow-[-20px_0_60px_-20px_rgba(15,17,21,0.4)] flex flex-col overflow-hidden animate-slideInRight">
        {/* Cover */}
        <div className="h-[88px] bg-brand-gradient relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-[34px] h-[34px] rounded-[9px] bg-white/18 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/28 transition-colors"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Identity */}
          <div className="flex items-end gap-3.5 -mt-[34px]">
            <Avatar profile={profile} size={80} ring />
            <div className="pb-1.5">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[localApp.status]}`}>
                {STATUS_LABEL[localApp.status]}
              </span>
            </div>
          </div>

          <h2 className="font-satoshi font-black text-[21px] tracking-[-0.02em] text-[#15131C] dark:text-content mt-3.5 mb-0.5">
            {profile?.name ?? 'Unknown'}
          </h2>
          <p className="text-sm font-medium text-[#8B8499] dark:text-content-muted">
            {profile?.title ?? 'Candidate'}
            {profile?.years_experience != null && (
              <> · {profile.years_experience} yr{profile.years_experience !== 1 ? 's' : ''} experience</>
            )}
          </p>
          {profile?.open_to_work && (
            <span className="inline-block mt-2.5 text-[11px] font-bold px-2.5 py-1 rounded-lg text-[#16895E] bg-[#E7F6EF] dark:text-[#4ade9e] dark:bg-[#12271e]">
              Open to work
            </span>
          )}

          {profile?.bio && (
            <p className="text-sm font-medium text-[#4B4658] dark:text-content-muted leading-relaxed mt-4">{profile.bio}</p>
          )}

          {/* Actions */}
          {!isResolved && (
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => updateStatus('accepted')}
                disabled={!!busy}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#16895E] text-white text-sm font-bold hover:bg-[#147A53] disabled:opacity-50 transition-colors"
              >
                {busy === 'accepted'
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <FaCheck className="w-3.5 h-3.5" />}
                Accept
              </button>
              <button
                onClick={() => updateStatus('rejected')}
                disabled={!!busy}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#F0C9C4] dark:border-[#5a2a26] text-[#B6463C] dark:text-[#f2857b] text-sm font-bold hover:bg-[#FBEAE8] dark:hover:bg-[#2a1512] disabled:opacity-50 transition-colors"
              >
                {busy === 'rejected'
                  ? <div className="w-4 h-4 border-2 border-[#B6463C] border-t-transparent rounded-full animate-spin" />
                  : <FaXmark className="w-3.5 h-3.5" />}
                Reject
              </button>
            </div>
          )}

          {/* Stage progression */}
          {!isResolved && (localApp.status === 'applied' || localApp.status === 'under_review') && (
            <button
              onClick={() => updateStatus(localApp.status === 'applied' ? 'under_review' : 'shortlisted')}
              disabled={!!busy}
              className={`w-full mt-2.5 py-2.5 rounded-xl text-[13px] font-bold transition-colors disabled:opacity-50 ${
                localApp.status === 'applied'
                  ? 'border border-[#E2E1EA] dark:border-line text-[#6B6478] dark:text-content-muted hover:bg-[#FAFAFB] dark:hover:bg-white/[0.04]'
                  : 'border border-[#DDCEFA] dark:border-[#4a3d78] text-[#5A2DD4] dark:text-[#b9a4f7] hover:bg-[#F4F0FE] dark:hover:bg-[#241d38]'
              }`}
            >
              {localApp.status === 'applied' ? 'Move to Under Review' : 'Shortlist candidate'}
            </button>
          )}

          {/* Note from candidate */}
          {localApp.cover_note && (
            <div className="mt-5 p-4 rounded-2xl bg-[#FAFAFB] dark:bg-white/[0.03] border border-[#EFEEF4] dark:border-line">
              <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#9098A3] dark:text-content-subtle mb-2">Note from candidate</p>
              <p className="text-sm font-medium text-[#4B4658] dark:text-content-muted leading-relaxed italic">“{localApp.cover_note}”</p>
            </div>
          )}

          {/* Resume */}
          {localApp.resume_url && (
            <a
              href={localApp.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 mt-3.5 p-3.5 rounded-[13px] border border-[#E8E8EF] dark:border-line hover:border-[#C9BCF2] dark:hover:border-[#4a3d78] transition-colors"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#F4F0FE] dark:bg-[#241d38] flex items-center justify-center text-[#5A2DD4] dark:text-[#b9a4f7] shrink-0">
                <FaFileLines className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold text-[#15131C] dark:text-content">Résumé</div>
                <div className="text-xs font-medium text-[#9098A3] dark:text-content-subtle">Tap to view</div>
              </div>
              <FaArrowUpRightFromSquare className="w-3.5 h-3.5 text-[#A8A2B4] dark:text-content-subtle shrink-0" />
            </a>
          )}

          {/* Contact */}
          <div className="mt-6">
            <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#9098A3] dark:text-content-subtle mb-3">Contact</p>
            <div className="space-y-3">
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 group">
                  <FaEnvelope className="w-4 h-4 text-[#9098A3] dark:text-content-subtle shrink-0" />
                  <span className="text-sm font-medium text-[#15131C] dark:text-content group-hover:text-[#5A2DD4] dark:group-hover:text-[#b9a4f7] transition-colors truncate">{profile.email}</span>
                </a>
              )}
              {profile?.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-3 group">
                  <FaPhone className="w-4 h-4 text-[#9098A3] dark:text-content-subtle shrink-0" />
                  <span className="text-sm font-medium text-[#15131C] dark:text-content group-hover:text-[#5A2DD4] dark:group-hover:text-[#b9a4f7] transition-colors">{profile.phone}</span>
                </a>
              )}
              {profile?.portfolio_or_website_link && (
                <a href={profile.portfolio_or_website_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                  <FaGlobe className="w-4 h-4 text-[#9098A3] dark:text-content-subtle shrink-0" />
                  <span className="text-sm font-medium text-[#5A2DD4] dark:text-[#b9a4f7] group-hover:underline truncate">{profile.portfolio_or_website_link}</span>
                  <FaArrowUpRightFromSquare className="w-3 h-3 text-[#5A2DD4] dark:text-[#b9a4f7] shrink-0" />
                </a>
              )}
            </div>
          </div>

          {/* Social links */}
          {profile?.social_links && profile.social_links.filter((s) => s.is_enabled).length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#9098A3] dark:text-content-subtle mb-3">Social links</p>
              <div className="flex flex-wrap gap-2">
                {profile.social_links.filter((s) => s.is_enabled).map((s) => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F5FA] dark:bg-white/[0.06] hover:bg-[#EFEEF4] dark:hover:bg-white/[0.1] rounded-lg transition-colors">
                    <FaLink className="w-3 h-3 text-[#9098A3] dark:text-content-subtle" />
                    <span className="text-xs font-bold text-[#15131C] dark:text-content capitalize">{s.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Interview details */}
          {localApp.interview_schedules && (
            <div className="mt-6">
              <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#9098A3] dark:text-content-subtle mb-3">Scheduled interview</p>
              <div className="p-4 bg-[#E7F6EF] dark:bg-[#12271e] border border-[#C9ECDC] dark:border-[#1e3a2e] rounded-2xl">
                <p className="text-xs font-bold text-[#16895E] dark:text-[#4ade9e] mb-1">
                  {new Date(localApp.interview_schedules.scheduled_at).toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}{' '}
                  at {new Date(localApp.interview_schedules.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs font-medium text-[#16895E]/80 dark:text-[#4ade9e]/80 mb-2">{localApp.interview_schedules.duration_minutes} minutes</p>
                {localApp.interview_schedules.meet_link && (
                  <a href={localApp.interview_schedules.meet_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16895E] dark:text-[#4ade9e] hover:underline">
                    Join meeting →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-6">
            <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#9098A3] dark:text-content-subtle mb-3">Actions</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEmailModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#F3F3F7] dark:bg-white/[0.06] hover:bg-[#ECEBF2] dark:hover:bg-white/[0.1] rounded-lg text-xs font-bold text-[#15131C] dark:text-content transition-colors"
              >
                <FaEnvelope className="w-3 h-3" /> Send email
              </button>
              {canSchedule && !localApp.interview_schedules && (
                <button
                  onClick={() => setScheduleModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#F3F3F7] dark:bg-white/[0.06] hover:bg-[#ECEBF2] dark:hover:bg-white/[0.1] rounded-lg text-xs font-bold text-[#15131C] dark:text-content transition-colors"
                >
                  <FaCalendarPlus className="w-3 h-3" /> Schedule interview
                </button>
              )}
            </div>
          </div>

          {/* Application meta */}
          <div className="mt-6">
            <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#9098A3] dark:text-content-subtle mb-3">Application</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs font-medium text-[#9098A3] dark:text-content-subtle">Applied</span>
                <span className="text-xs font-semibold text-[#15131C] dark:text-content">
                  {new Date(localApp.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {localApp.reviewed_at && (
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-[#9098A3] dark:text-content-subtle">Reviewed</span>
                  <span className="text-xs font-semibold text-[#15131C] dark:text-content">
                    {new Date(localApp.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isResolved && (
            <div className="mt-6 p-3.5 bg-[#FAFAFB] dark:bg-white/[0.03] border border-[#EFEEF4] dark:border-line rounded-xl text-center text-xs font-semibold text-[#9098A3] dark:text-content-subtle">
              Decision recorded · {localApp.status === 'accepted' ? 'Accepted' : 'Not selected'}
            </div>
          )}
        </div>
      </aside>

      {emailModal && (
        <SendEmailModal application={localApp} companyName={companyName} onClose={() => setEmailModal(false)} />
      )}
      {scheduleModal && (
        <ScheduleInterviewModal
          application={localApp}
          onClose={() => setScheduleModal(false)}
          onScheduled={(interview) => {
            setLocalApp((prev) => ({ ...prev, interview_schedules: interview }))
            setScheduleModal(false)
          }}
        />
      )}
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function quickUpdateStatus(appId: string, status: string): Promise<boolean> {
  const res = await fetch(`/api/hiring/applications/${appId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return res.ok
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApplicantManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params)
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AppTab>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drawerApp, setDrawerApp] = useState<JobApplication | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [archiveModal, setArchiveModal] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban')

  const fetchData = useCallback(async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        fetch(`/api/hiring/jobs/${jobId}`),
        fetch(`/api/hiring/jobs/${jobId}/applications`),
      ])
      const [jobData, appsData] = await Promise.all([jobRes.json(), appsRes.json()])
      if (jobData.job) setJob(jobData.job)
      if (appsData.applications) setApplications(appsData.applications)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => { fetchData() }, [fetchData])

  const tabCounts = APP_STATUSES.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? applications.length : applications.filter((a) => a.status === tab).length
    return acc
  }, {} as Record<AppTab, number>)

  const filteredApps = activeTab === 'all'
    ? applications
    : applications.filter((a) => a.status === activeTab)

  const unresolvedIds = applications
    .filter((a) => !['accepted', 'rejected'].includes(a.status))
    .map((a) => a.id)

  const inReview = applications.filter((a) => a.status === 'under_review').length
  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length

  const applyStatusChange = (id: string, status: string) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: status as JobApplication['status'] } : a))
    setDrawerApp((prev) => prev?.id === id ? { ...prev, status: status as JobApplication['status'] } : prev)
  }

  const handleKanbanStatusChange = async (id: string, status: string) => {
    const ok = await quickUpdateStatus(id, status)
    if (ok) {
      applyStatusChange(id, status)
    } else {
      toast.error('Failed to update status')
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const allSelected = filteredApps.every((a) => selectedIds.has(a.id))
    setSelectedIds(allSelected ? new Set() : new Set(filteredApps.map((a) => a.id)))
  }

  const bulkUpdate = async (status: string, ids?: string[]) => {
    const targetIds = ids ?? Array.from(selectedIds)
    if (targetIds.length === 0) return
    setBulkBusy(true)
    try {
      const res = await fetch(`/api/hiring/jobs/${jobId}/applications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_ids: targetIds, status }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setApplications((prev) =>
        prev.map((a) => targetIds.includes(a.id) ? { ...a, status: status as JobApplication['status'] } : a)
      )
      setSelectedIds(new Set())
      toast.success(`${targetIds.length} applicant${targetIds.length !== 1 ? 's' : ''} updated`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to bulk update')
    } finally {
      setBulkBusy(false)
    }
  }

  const archiveJob = async (force = false) => {
    if (!force && unresolvedIds.length > 0) { setArchiveModal(true); return }
    try {
      const res = await fetch(`/api/hiring/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Role archived')
      setArchiveModal(false)
      setJob((prev) => prev ? { ...prev, status: 'archived' } : prev)
    } catch {
      toast.error('Failed to archive role')
    }
  }

  const handleBulkRejectThenArchive = async () => {
    await bulkUpdate('rejected', unresolvedIds)
    await archiveJob(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="mb-6">
        <Link href="/dashboard/hiring" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content transition-colors mb-4">
          <FaArrowLeft className="w-3 h-3" /> Back to roles
        </Link>
        <p className="text-[11px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7] uppercase tracking-[0.16em] mb-1.5">Pipeline</p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-satoshi font-black text-[22px] tracking-[-0.02em] text-[#15131C] dark:text-content">{job?.title ?? 'Applicants'}</h1>
            <p className="text-[13px] font-medium text-[#9098A3] dark:text-content-subtle mt-0.5">
              {applications.length} applicant{applications.length === 1 ? '' : 's'}
              {inReview > 0 && ` · ${inReview} in review`}
              {shortlisted > 0 && ` · ${shortlisted} shortlisted`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* View toggle */}
            <div className="flex bg-[#F1F1F4] dark:bg-white/[0.04] rounded-xl p-0.5 gap-0.5">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  viewMode === 'kanban' ? 'bg-white dark:bg-surface-raised text-[#5A2DD4] dark:text-[#b9a4f7] shadow-sm' : 'text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content'
                }`}
              >
                <FaTableColumns className="w-3 h-3" /> Board
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  viewMode === 'table' ? 'bg-white dark:bg-surface-raised text-[#5A2DD4] dark:text-[#b9a4f7] shadow-sm' : 'text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content'
                }`}
              >
                <FaTableList className="w-3 h-3" /> Table
              </button>
            </div>
            {job && job.status !== 'archived' && (
              <button
                onClick={() => archiveJob()}
                className="px-4 py-2 border border-[#F0C9C4] dark:border-[#5a2a26] text-[#B6463C] dark:text-[#f2857b] rounded-xl font-bold text-xs hover:bg-[#FBEAE8] dark:hover:bg-[#2a1512] transition-colors"
              >
                Archive
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban view */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          applications={applications}
          onCardClick={setDrawerApp}
          onStatusChange={handleKanbanStatusChange}
        />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
            {APP_STATUSES.map((tab) => {
              const on = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedIds(new Set()) }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] font-bold text-xs whitespace-nowrap transition-all ${
                    on ? 'bg-brand-gradient text-white' : 'text-[#6B6478] dark:text-content-muted hover:bg-[#FAFAFB] dark:hover:bg-white/[0.04] border border-[#E8E8EF] dark:border-line'
                  }`}
                >
                  {tab === 'all' ? 'All' : STATUS_LABEL[tab]}
                  <span className={`px-1.5 rounded-md text-[11px] font-bold ${on ? 'bg-white/20 text-white' : 'bg-[#F3F3F7] dark:bg-white/[0.06] text-[#9098A3] dark:text-content-subtle'}`}>
                    {tabCounts[tab]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-[#F4F0FE] dark:bg-[#241d38] border border-[#E6DCFB] dark:border-[#4a3d78] rounded-xl flex-wrap">
              <span className="text-xs font-bold text-[#5A2DD4] dark:text-[#b9a4f7]">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                {[
                  { status: 'under_review', label: 'Under Review', cls: 'text-[#1E5BBF] bg-[#E8EFFB] hover:brightness-95 dark:text-[#7fb0f5] dark:bg-[#13203a]' },
                  { status: 'shortlisted', label: 'Shortlist', cls: 'text-[#C2410C] bg-[#FDF0E7] hover:brightness-95 dark:text-[#f2a56b] dark:bg-[#2a1a10]' },
                  { status: 'rejected', label: 'Reject all', cls: 'text-[#B6463C] bg-[#FBEAE8] hover:brightness-95 dark:text-[#f2857b] dark:bg-[#2a1512]' },
                  { status: 'accepted', label: 'Accept all', cls: 'text-[#16895E] bg-[#E7F6EF] hover:brightness-95 dark:text-[#4ade9e] dark:bg-[#12271e]' },
                ].map((a) => (
                  <button key={a.status} onClick={() => bulkUpdate(a.status)} disabled={bulkBusy}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs disabled:opacity-50 transition-all ${a.cls}`}>
                    {a.label}
                  </button>
                ))}
                <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-[#9098A3] dark:text-content-subtle text-xs font-medium hover:text-[#15131C] dark:hover:text-content transition-colors">
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Applicants table */}
          <div className="bg-white dark:bg-surface-raised rounded-[18px] border border-[#E8E8EF] dark:border-line overflow-hidden">
            {filteredApps.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-satoshi font-extrabold text-[#9098A3] dark:text-content-subtle">No applicants in this category</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFB] dark:bg-white/[0.03]">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={filteredApps.length > 0 && filteredApps.every((a) => selectedIds.has(a.id))}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded accent-[#5A2DD4] cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold text-[#9098A3] dark:text-content-subtle uppercase tracking-wide">Applicant</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold text-[#9098A3] dark:text-content-subtle uppercase tracking-wide hidden sm:table-cell">Status</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold text-[#9098A3] dark:text-content-subtle uppercase tracking-wide hidden md:table-cell">Applied</th>
                    <th className="py-3 px-4 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app) => {
                    const profile = app.users as ApplicantProfile | undefined
                    const isResolved = ['accepted', 'rejected'].includes(app.status)
                    return (
                      <tr
                        key={app.id}
                        className="border-t border-[#F4F3F7] dark:border-white/[0.06] hover:bg-[#FAFAFB] dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                        onClick={() => setDrawerApp(app)}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(app.id)}
                            onChange={() => toggleSelect(app.id)}
                            className="w-4 h-4 rounded accent-[#5A2DD4] cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar profile={profile} size={36} />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-[#15131C] dark:text-content truncate">{profile?.name ?? '—'}</p>
                              {profile?.title && <p className="text-xs font-medium text-[#9098A3] dark:text-content-subtle truncate">{profile.title}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[app.status]}`}>
                            {STATUS_LABEL[app.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-xs font-medium text-[#9098A3] dark:text-content-subtle">
                            {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          {!isResolved && (
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                title="Reject"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#C99] dark:text-[#8a5a55] hover:text-[#B6463C] dark:hover:text-[#f2857b] hover:bg-[#FBEAE8] dark:hover:bg-[#2a1512] transition-colors"
                                onClick={async () => {
                                  const ok = await quickUpdateStatus(app.id, 'rejected')
                                  if (ok) applyStatusChange(app.id, 'rejected')
                                  else toast.error('Failed')
                                }}
                              >
                                <FaXmark className="w-3 h-3" />
                              </button>
                              <button
                                title="Accept"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8FC9AF] dark:text-[#5a8a73] hover:text-[#16895E] dark:hover:text-[#4ade9e] hover:bg-[#E7F6EF] dark:hover:bg-[#12271e] transition-colors"
                                onClick={async () => {
                                  const ok = await quickUpdateStatus(app.id, 'accepted')
                                  if (ok) applyStatusChange(app.id, 'accepted')
                                  else toast.error('Failed')
                                }}
                              >
                                <FaCheck className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Applicant drawer */}
      {drawerApp && (
        <ApplicantDrawer
          application={drawerApp}
          companyName={job?.companies?.name ?? job?.company_name ?? ''}
          onClose={() => setDrawerApp(null)}
          onStatusChange={applyStatusChange}
        />
      )}

      {/* Archive confirmation modal */}
      {archiveModal && (
        <div className="fixed inset-0 bg-[#0F1115]/45 dark:bg-black/65 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-raised rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_60px_-15px_rgba(15,17,21,0.4)] animate-scaleIn">
            <h2 className="font-satoshi font-black text-xl text-[#15131C] dark:text-content mb-2">Archive this role?</h2>
            <p className="text-sm font-medium text-[#4B4658] dark:text-content-muted mb-1">
              You have <strong className="text-[#15131C] dark:text-content">{unresolvedIds.length}</strong> unresolved applicant{unresolvedIds.length !== 1 ? 's' : ''}.
            </p>
            <p className="text-sm font-medium text-[#4B4658] dark:text-content-muted mb-6">
              Please send them a decision before archiving, or bulk reject all remaining.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleBulkRejectThenArchive}
                disabled={bulkBusy}
                className="w-full py-3 bg-[#B6463C] text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {bulkBusy ? 'Processing…' : `Reject ${unresolvedIds.length} remaining & archive`}
              </button>
              <button
                onClick={() => setArchiveModal(false)}
                className="w-full py-3 border border-[#E2E1EA] dark:border-line bg-white dark:bg-surface-raised text-[#374151] dark:text-content-muted rounded-xl font-bold text-sm hover:border-[#B9B9C6] dark:hover:border-content-subtle transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
