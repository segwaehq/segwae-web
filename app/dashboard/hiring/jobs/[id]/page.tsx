'use client'

import { useState, useEffect, useCallback, use, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  FaArrowLeft, FaCheck, FaXmark, FaArrowUpRightFromSquare,
  FaUser, FaEnvelope, FaPhone, FaFileLines, FaLink, FaGlobe,
  FaCalendarPlus, FaTableList, FaSquareFull,
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
  applied: 'text-blue bg-blue/10',
  under_review: 'text-warningYellow bg-warningYellow/10',
  shortlisted: 'text-mainPurple bg-lightPurple',
  accepted: 'text-successGreen bg-successGreen/10',
  rejected: 'text-errorRed bg-errorRed/10',
}

const PIPELINE_STAGES = [
  { key: 'applied', label: 'Applied', color: 'text-blue', border: 'border-blue' },
  { key: 'under_review', label: 'Under Review', color: 'text-warningYellow', border: 'border-warningYellow' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'text-mainPurple', border: 'border-mainPurple' },
  { key: 'accepted', label: 'Accepted', color: 'text-successGreen', border: 'border-successGreen' },
  { key: 'rejected', label: 'Rejected', color: 'text-errorRed', border: 'border-errorRed' },
] as const

// ─── Send Email Modal ─────────────────────────────────────────────────────────

function SendEmailModal({
  application,
  onClose,
}: {
  application: JobApplication
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
        .replace(/{{company_name}}/g, 'the company')
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
      <div className="fixed inset-0 bg-black/50 z-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-10 flex flex-col items-center shadow-2xl animate-scaleIn">
          <div className="w-14 h-14 rounded-full bg-successGreen/10 flex items-center justify-center mb-4">
            <FaCheck className="w-6 h-6 text-successGreen" />
          </div>
          <h3 className="font-satoshi font-bold text-xl text-grey1 mb-2">Email sent!</h3>
          <p className="font-openSans text-sm text-grey3 text-center mb-6">
            Your message was delivered to {applicantEmail}
          </p>
          <button onClick={onClose} className="w-full py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey4/60 shrink-0">
          <p className="font-satoshi font-semibold text-sm text-grey1">Email — {profile?.name ?? 'Applicant'}</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-grey1 hover:bg-grey5 transition-colors">
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {loadingTemplates ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-mainPurple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : templates.length > 0 ? (
            <div>
              <p className="font-satoshi font-semibold text-xs text-grey3 mb-2">Template</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold font-satoshi border transition-colors ${
                      selectedTemplateId === t.id
                        ? 'border-mainPurple bg-lightPurple text-mainPurple'
                        : 'border-grey4 text-grey2 hover:border-mainPurple/50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2 px-3 py-2.5 bg-grey6 rounded-lg">
            <FaEnvelope className="w-3.5 h-3.5 text-grey3 shrink-0" />
            <span className="font-openSans text-xs text-grey3">To: <span className="text-grey1 font-semibold">{applicantEmail}</span></span>
          </div>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full px-3 py-2.5 border border-grey4 rounded-lg font-openSans text-sm text-grey1 focus:outline-none focus:border-mainPurple transition-colors"
            />
          </div>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 border border-grey4 rounded-lg font-openSans text-sm text-grey1 focus:outline-none focus:border-mainPurple transition-colors resize-none"
            />
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-grey4/60 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-grey4 text-grey1 rounded-lg font-satoshi font-semibold text-sm hover:bg-grey5 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="flex-2 flex items-center justify-center gap-2 py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      <div className="fixed inset-0 bg-black/50 z-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-10 flex flex-col items-center shadow-2xl animate-scaleIn">
          <div className="w-14 h-14 rounded-full bg-successGreen/10 flex items-center justify-center mb-4">
            <FaCheck className="w-6 h-6 text-successGreen" />
          </div>
          <h3 className="font-satoshi font-bold text-xl text-grey1 mb-1">Interview Scheduled!</h3>
          <p className="font-openSans text-sm text-grey3 text-center mb-1">{dateStr} at {timeStr}</p>
          <p className="font-openSans text-xs text-grey3 text-center mb-5">{duration} minutes</p>
          {result.meet_link && (
            <div className="w-full p-3 bg-lightPurple rounded-lg mb-5">
              <p className="font-satoshi font-semibold text-[11px] text-mainPurple mb-1">Meeting Link</p>
              <a href={result.meet_link} target="_blank" rel="noopener noreferrer"
                className="font-openSans text-xs text-mainPurple break-all hover:underline">
                {result.meet_link}
              </a>
            </div>
          )}
          <button onClick={onClose} className="w-full py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors">
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey4/60 shrink-0">
          <p className="font-satoshi font-semibold text-sm text-grey1">
            Schedule Interview — {profile?.name ?? 'Applicant'}
          </p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-grey1 hover:bg-grey5 transition-colors">
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={defaultDate}
                className="w-full px-3 py-2.5 border border-grey4 rounded-lg font-openSans text-sm text-grey1 focus:outline-none focus:border-mainPurple transition-colors"
              />
            </div>
            <div>
              <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-grey4 rounded-lg font-openSans text-sm text-grey1 focus:outline-none focus:border-mainPurple transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2.5 border border-grey4 rounded-lg font-openSans text-sm text-grey1 focus:outline-none focus:border-mainPurple transition-colors bg-white"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
            </select>
          </div>

          <div className="p-3 bg-lightPurple rounded-lg">
            <p className="font-satoshi font-semibold text-xs text-mainPurple mb-1">Video Link</p>
            <p className="font-openSans text-xs text-mainPurple/80">
              A Jitsi Meet link will be auto-generated and shared with the applicant.
            </p>
          </div>

          <div>
            <label className="block font-satoshi font-semibold text-xs text-grey3 mb-1.5">Internal Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Interviewer prep notes, topics to cover…"
              className="w-full px-3 py-2.5 border border-grey4 rounded-lg font-openSans text-sm text-grey1 focus:outline-none focus:border-mainPurple transition-colors resize-none"
            />
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-grey4/60 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-grey4 text-grey1 rounded-lg font-satoshi font-semibold text-sm hover:bg-grey5 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={saving || !date || !time}
            className="flex-2 flex items-center justify-center gap-2 py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      className="bg-white border border-grey4/70 hover:border-mainPurple rounded-xl p-3 cursor-pointer transition-all hover:shadow-[0_4px_16px_rgba(79,70,229,0.12)] active:opacity-75 select-none"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-grey5 flex items-center justify-center shrink-0">
          {profile?.profile_image_url ? (
            <Image src={profile.profile_image_url} alt={profile.name ?? ''} width={32} height={32} className="object-cover w-full h-full" />
          ) : (
            <FaUser className="w-3.5 h-3.5 text-grey3" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-satoshi font-semibold text-xs text-grey1 truncate">{profile?.name ?? '—'}</p>
          {profile?.title && <p className="font-openSans text-[10px] text-grey3 truncate">{profile.title}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-openSans text-[10px] text-grey3">
          {new Date(application.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
        <div className="flex gap-1">
          {application.resume_url && <span className="text-[10px] text-grey3" title="Resume">📄</span>}
          {profile?.portfolio_or_website_link && <span className="text-[10px] text-grey3" title="Portfolio">🌐</span>}
          {hasInterview && <span className="text-[10px] text-successGreen" title="Interview scheduled">📅</span>}
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
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
      {PIPELINE_STAGES.map((stage) => {
        const colApps = applications.filter((a) => a.status === stage.key)
        const isDragTarget = dragOverCol === stage.key
        return (
          <div
            key={stage.key}
            onDragOver={(e) => onDragOver(e, stage.key)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, stage.key)}
            className={`shrink-0 w-52 flex flex-col rounded-xl border-2 transition-colors ${
              isDragTarget ? 'border-mainPurple bg-lightPurple/30' : 'border-grey4/60 bg-grey6/50'
            }`}
          >
            <div className="px-3 py-2.5 flex items-center justify-between shrink-0">
              <span className={`font-satoshi font-semibold text-xs ${stage.color}`}>{stage.label}</span>
              <span className="font-satoshi font-semibold text-[10px] px-1.5 py-0.5 rounded-full bg-white border border-grey4/60 text-grey3">
                {colApps.length}
              </span>
            </div>
            <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
              {colApps.map((app) => (
                <KanbanCard
                  key={app.id}
                  application={app}
                  onClick={() => onCardClick(app)}
                  onDragStart={onDragStart}
                />
              ))}
              {colApps.length === 0 && (
                <div className={`h-16 flex items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isDragTarget ? 'border-mainPurple' : 'border-grey4'
                }`}>
                  <span className="font-openSans text-[11px] text-grey3">Drop here</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Applicant Drawer ─────────────────────────────────────────────────────────

function ApplicantDrawer({
  application,
  onClose,
  onStatusChange,
}: {
  application: JobApplication
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
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey4/60 shrink-0">
          <p className="font-satoshi font-semibold text-sm text-grey1">Applicant Profile</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-grey1 hover:bg-grey5 transition-colors">
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile hero */}
          <div className="px-6 py-6 border-b border-grey4/60">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-grey5 flex items-center justify-center shrink-0">
                {profile?.profile_image_url ? (
                  <Image src={profile.profile_image_url} alt={profile.name ?? ''} width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <FaUser className="w-6 h-6 text-grey3" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-satoshi font-bold text-xl text-grey1">{profile?.name ?? 'Unknown'}</p>
                {profile?.title && <p className="font-openSans text-sm text-grey2 mt-0.5">{profile.title}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs font-semibold font-satoshi px-2.5 py-0.5 rounded-full ${STATUS_COLORS[localApp.status]}`}>
                    {STATUS_LABEL[localApp.status]}
                  </span>
                  {profile?.open_to_work && (
                    <span className="text-xs font-semibold font-satoshi px-2.5 py-0.5 rounded-full text-successGreen bg-successGreen/10">
                      Open to work
                    </span>
                  )}
                </div>
              </div>
            </div>
            {profile?.bio && (
              <p className="font-openSans text-sm text-grey2 mt-4 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Contact */}
          <div className="px-6 py-5 border-b border-grey4/60 space-y-3">
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-3 group">
                <FaEnvelope className="w-4 h-4 text-grey3 shrink-0" />
                <span className="font-openSans text-sm text-grey1 group-hover:text-mainPurple transition-colors">{profile.email}</span>
              </a>
            )}
            {profile?.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-3 group">
                <FaPhone className="w-4 h-4 text-grey3 shrink-0" />
                <span className="font-openSans text-sm text-grey1 group-hover:text-mainPurple transition-colors">{profile.phone}</span>
              </a>
            )}
            {profile?.years_experience != null && (
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 text-[10px] font-bold text-grey3 flex items-center justify-center shrink-0">YR</span>
                <span className="font-openSans text-sm text-grey1">
                  {profile.years_experience} year{profile.years_experience !== 1 ? 's' : ''} experience
                </span>
              </div>
            )}
            {localApp.resume_url && (
              <a href={localApp.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <FaFileLines className="w-4 h-4 text-grey3 shrink-0" />
                <span className="font-openSans text-sm text-mainPurple group-hover:underline">View Resume</span>
                <FaArrowUpRightFromSquare className="w-3 h-3 text-mainPurple" />
              </a>
            )}
            {profile?.portfolio_or_website_link && (
              <a href={profile.portfolio_or_website_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <FaGlobe className="w-4 h-4 text-grey3 shrink-0" />
                <span className="font-openSans text-sm text-mainPurple group-hover:underline truncate">{profile.portfolio_or_website_link}</span>
                <FaArrowUpRightFromSquare className="w-3 h-3 text-mainPurple shrink-0" />
              </a>
            )}
          </div>

          {/* Social links */}
          {profile?.social_links && profile.social_links.filter((s) => s.is_enabled).length > 0 && (
            <div className="px-6 py-5 border-b border-grey4/60">
              <p className="font-satoshi font-semibold text-xs text-grey3 uppercase tracking-wide mb-3">Social Links</p>
              <div className="flex flex-wrap gap-2">
                {profile.social_links.filter((s) => s.is_enabled).map((s) => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-grey6 hover:bg-grey5 rounded-lg transition-colors">
                    <FaLink className="w-3 h-3 text-grey3" />
                    <span className="font-satoshi text-xs font-semibold text-grey1 capitalize">{s.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Cover note */}
          {localApp.cover_note && (
            <div className="px-6 py-5 border-b border-grey4/60">
              <p className="font-satoshi font-semibold text-xs text-grey3 uppercase tracking-wide mb-2">Cover Note</p>
              <p className="font-openSans text-sm text-grey1 leading-relaxed">{localApp.cover_note}</p>
            </div>
          )}

          {/* Interview details */}
          {localApp.interview_schedules && (
            <div className="px-6 py-5 border-b border-grey4/60">
              <p className="font-satoshi font-semibold text-xs text-grey3 uppercase tracking-wide mb-3">Scheduled Interview</p>
              <div className="p-4 bg-successGreen/5 border border-successGreen/20 rounded-xl">
                <p className="font-satoshi font-semibold text-xs text-successGreen mb-1">
                  {new Date(localApp.interview_schedules.scheduled_at).toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}{' '}
                  at {new Date(localApp.interview_schedules.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="font-openSans text-xs text-grey3 mb-2">{localApp.interview_schedules.duration_minutes} minutes</p>
                {localApp.interview_schedules.meet_link && (
                  <a href={localApp.interview_schedules.meet_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold font-satoshi text-successGreen hover:underline">
                    Join Meeting →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="px-6 py-5">
            <p className="font-satoshi font-semibold text-xs text-grey3 uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEmailModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-grey5 hover:bg-grey4/60 rounded-lg font-satoshi font-semibold text-xs text-grey1 transition-colors"
              >
                <FaEnvelope className="w-3 h-3" /> Send Email
              </button>
              {canSchedule && !localApp.interview_schedules && (
                <button
                  onClick={() => setScheduleModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-grey5 hover:bg-grey4/60 rounded-lg font-satoshi font-semibold text-xs text-grey1 transition-colors"
                >
                  <FaCalendarPlus className="w-3 h-3" /> Schedule Interview
                </button>
              )}
            </div>
          </div>

          {/* Application meta */}
          <div className="px-6 pb-6">
            <p className="font-satoshi font-semibold text-xs text-grey3 uppercase tracking-wide mb-3">Application</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-openSans text-xs text-grey3">Applied</span>
                <span className="font-openSans text-xs text-grey1">
                  {new Date(localApp.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {localApp.reviewed_at && (
                <div className="flex justify-between">
                  <span className="font-openSans text-xs text-grey3">Reviewed</span>
                  <span className="font-openSans text-xs text-grey1">
                    {new Date(localApp.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        {!isResolved ? (
          <div className="shrink-0 border-t border-grey4/60 px-6 py-4 space-y-2">
            <div className="flex gap-3">
              <button
                onClick={() => updateStatus('rejected')}
                disabled={!!busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-errorRed text-errorRed rounded-lg font-satoshi font-semibold text-sm hover:bg-errorRed/5 disabled:opacity-50 transition-colors"
              >
                {busy === 'rejected'
                  ? <div className="w-4 h-4 border-2 border-errorRed border-t-transparent rounded-full animate-spin" />
                  : <FaXmark className="w-3.5 h-3.5" />}
                Reject
              </button>
              <button
                onClick={() => updateStatus('accepted')}
                disabled={!!busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-successGreen text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#2DB34C] disabled:opacity-50 transition-colors"
              >
                {busy === 'accepted'
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <FaCheck className="w-3.5 h-3.5" />}
                Accept
              </button>
            </div>
            {localApp.status === 'applied' && (
              <button
                onClick={() => updateStatus('under_review')}
                disabled={!!busy}
                className="w-full py-2 border border-grey4 text-grey2 rounded-lg font-satoshi font-semibold text-xs hover:bg-grey5 disabled:opacity-50 transition-colors"
              >
                Mark Under Review
              </button>
            )}
            {localApp.status === 'under_review' && (
              <button
                onClick={() => updateStatus('shortlisted')}
                disabled={!!busy}
                className="w-full py-2 border border-mainPurple text-mainPurple rounded-lg font-satoshi font-semibold text-xs hover:bg-lightPurple disabled:opacity-50 transition-colors"
              >
                Shortlist
              </button>
            )}
          </div>
        ) : (
          <div className="shrink-0 border-t border-grey4/60 px-6 py-4">
            <div className="p-3 bg-grey6 rounded-lg text-center font-openSans text-xs text-grey3">
              Decision recorded · {localApp.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
            </div>
          </div>
        )}
      </aside>

      {emailModal && (
        <SendEmailModal application={localApp} onClose={() => setEmailModal(false)} />
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
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

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
      toast.success('Job archived')
      setArchiveModal(false)
      setJob((prev) => prev ? { ...prev, status: 'archived' } : prev)
    } catch {
      toast.error('Failed to archive job')
    }
  }

  const handleBulkRejectThenArchive = async () => {
    await bulkUpdate('rejected', unresolvedIds)
    await archiveJob(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="mb-6">
        <Link href="/dashboard/hiring" className="inline-flex items-center gap-1.5 text-xs font-semibold text-grey3 hover:text-grey1 font-satoshi transition-colors mb-4">
          <FaArrowLeft className="w-3 h-3" /> Back to jobs
        </Link>
        <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.22em] mb-1">Hiring · Pipeline</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-satoshi font-bold text-2xl text-grey1">{job?.title ?? 'Applicants'}</h1>
            {job?.location && <p className="font-openSans text-sm text-grey3 mt-1">{job.location}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* View toggle */}
            <div className="flex bg-grey5 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-satoshi font-semibold text-xs transition-all ${
                  viewMode === 'table' ? 'bg-white text-mainPurple shadow-sm' : 'text-grey3 hover:text-grey1'
                }`}
              >
                <FaTableList className="w-3 h-3" /> Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-satoshi font-semibold text-xs transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-mainPurple shadow-sm' : 'text-grey3 hover:text-grey1'
                }`}
              >
                <FaSquareFull className="w-3 h-3" /> Kanban
              </button>
            </div>
            {job && job.status !== 'archived' && (
              <button
                onClick={() => archiveJob()}
                className="px-4 py-2 border border-errorRed text-errorRed rounded-lg font-satoshi font-semibold text-xs hover:bg-errorRed/5 transition-colors"
              >
                Archive Job
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
          <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
            {APP_STATUSES.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedIds(new Set()) }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-satoshi font-semibold text-xs whitespace-nowrap transition-all ${
                  activeTab === tab ? 'bg-mainPurple text-white' : 'text-grey2 hover:bg-grey5'
                }`}
              >
                {tab === 'all' ? 'All' : STATUS_LABEL[tab]}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-grey5 text-grey3'}`}>
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-mainPurple/5 border border-mainPurple/20 rounded-lg flex-wrap">
              <span className="font-satoshi font-semibold text-xs text-mainPurple">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                {[
                  { status: 'under_review', label: 'Under Review', cls: 'text-warningYellow bg-warningYellow/10 hover:bg-warningYellow/20' },
                  { status: 'shortlisted', label: 'Shortlist', cls: 'text-mainPurple bg-lightPurple hover:bg-mainPurple/15' },
                  { status: 'rejected', label: 'Reject All', cls: 'text-errorRed bg-errorRed/10 hover:bg-errorRed/20' },
                  { status: 'accepted', label: 'Accept All', cls: 'text-successGreen bg-successGreen/10 hover:bg-successGreen/20' },
                ].map((a) => (
                  <button key={a.status} onClick={() => bulkUpdate(a.status)} disabled={bulkBusy}
                    className={`px-3 py-1.5 rounded-lg font-satoshi font-semibold text-xs disabled:opacity-50 transition-colors ${a.cls}`}>
                    {a.label}
                  </button>
                ))}
                <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-grey3 text-xs font-openSans hover:text-grey1 transition-colors">
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Applicants table */}
          <div className="bg-white rounded-2xl border border-grey4/60 overflow-hidden">
            {filteredApps.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-satoshi font-semibold text-grey3">No applicants in this category</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey4/60 bg-grey6/50">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={filteredApps.length > 0 && filteredApps.every((a) => selectedIds.has(a.id))}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded accent-mainPurple cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-grey3 font-satoshi uppercase tracking-wide">Applicant</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-grey3 font-satoshi uppercase tracking-wide hidden sm:table-cell">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-grey3 font-satoshi uppercase tracking-wide hidden md:table-cell">Applied</th>
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
                        className="border-b border-grey4/60 last:border-0 hover:bg-grey6/30 transition-colors cursor-pointer"
                        onClick={() => setDrawerApp(app)}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(app.id)}
                            onChange={() => toggleSelect(app.id)}
                            className="w-4 h-4 rounded accent-mainPurple cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-grey5 flex items-center justify-center shrink-0">
                              {profile?.profile_image_url ? (
                                <Image src={profile.profile_image_url} alt={profile.name ?? ''} width={36} height={36} className="object-cover w-full h-full" />
                              ) : (
                                <FaUser className="w-4 h-4 text-grey3" />
                              )}
                            </div>
                            <div>
                              <p className="font-satoshi font-semibold text-sm text-grey1">{profile?.name ?? '—'}</p>
                              {profile?.title && <p className="font-openSans text-xs text-grey3">{profile.title}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className={`text-xs font-semibold font-satoshi px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status]}`}>
                            {STATUS_LABEL[app.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="font-openSans text-xs text-grey3">
                            {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          {!isResolved && (
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                title="Reject"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-errorRed/50 hover:text-errorRed hover:bg-errorRed/10 transition-colors"
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
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-successGreen/50 hover:text-successGreen hover:bg-successGreen/10 transition-colors"
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
          onClose={() => setDrawerApp(null)}
          onStatusChange={applyStatusChange}
        />
      )}

      {/* Archive confirmation modal */}
      {archiveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn">
            <h2 className="font-satoshi font-bold text-xl text-grey1 mb-2">Archive this job?</h2>
            <p className="font-openSans text-sm text-grey2 mb-1">
              You have <strong>{unresolvedIds.length}</strong> unresolved applicant{unresolvedIds.length !== 1 ? 's' : ''}.
            </p>
            <p className="font-openSans text-sm text-grey2 mb-6">
              Please send them a decision before archiving, or bulk reject all remaining.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleBulkRejectThenArchive}
                disabled={bulkBusy}
                className="w-full py-3 bg-errorRed text-white rounded-lg font-satoshi font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {bulkBusy ? 'Processing…' : `Reject ${unresolvedIds.length} remaining & archive`}
              </button>
              <button
                onClick={() => setArchiveModal(false)}
                className="w-full py-3 border border-grey4 text-grey1 rounded-lg font-satoshi font-semibold text-sm hover:bg-grey5 transition-colors"
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
