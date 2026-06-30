'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { FaArrowLeft, FaPlus, FaTrash, FaPen, FaXmark, FaCheck } from 'react-icons/fa6'
import type { EmailTemplate } from '@/lib/types'

const TYPE_LABELS: Record<string, string> = {
  rejection: 'Rejection',
  acceptance: 'Acceptance / Interview',
  general: 'General',
}
const TYPE_COLORS: Record<string, string> = {
  rejection: 'text-[#B6463C] bg-[#FBEAE8]',
  acceptance: 'text-[#16895E] bg-[#E7F6EF]',
  general: 'text-[#6B6478] bg-[#F3F3F7]',
}

const MERGE_TAGS = ['{{first_name}}', '{{job_title}}', '{{company_name}}', '{{decision_date}}']

const BLANK_FORM = { type: 'rejection' as EmailTemplate['type'], label: '', subject: '', body: '', is_default: false }

function TemplateModal({
  template,
  onClose,
  onSaved,
}: {
  template: EmailTemplate | null
  onClose: () => void
  onSaved: (t: EmailTemplate) => void
}) {
  const isEdit = !!template
  const [form, setForm] = useState(
    template
      ? { type: template.type, label: template.label, subject: template.subject, body: template.body, is_default: template.is_default }
      : BLANK_FORM
  )
  const [saving, setSaving] = useState(false)

  const insertTag = (tag: string, field: 'subject' | 'body') => {
    setForm((prev) => ({ ...prev, [field]: prev[field] + tag }))
  }

  const save = async () => {
    if (!form.label.trim() || !form.subject.trim() || !form.body.trim()) {
      toast.error('Label, subject, and body are required')
      return
    }
    setSaving(true)
    try {
      const url = isEdit ? `/api/hiring/templates/${template!.id}` : '/api/hiring/templates'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, body: form.body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success(isEdit ? 'Template updated' : 'Template created')
      onSaved(data.template)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 border border-[#E2E1EA] rounded-xl focus:outline-none focus:border-[#A98BE8] text-sm font-medium text-[#15131C] placeholder:text-[#9098A3] bg-white transition-colors'

  return (
    <div className="fixed inset-0 bg-[#0F1115]/45 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8EF] shrink-0">
          <p className="font-satoshi font-bold text-sm text-[#15131C]">
            {isEdit ? 'Edit template' : 'New template'}
          </p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9098A3] hover:text-[#15131C] hover:bg-[#F4F3F8] transition-colors">
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#15131C] mb-1.5 font-satoshi">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as EmailTemplate['type'] }))}
                disabled={isEdit && template?.is_seeded}
                className={inputClass}
              >
                <option value="rejection">Rejection</option>
                <option value="acceptance">Acceptance / Interview</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#15131C] mb-1.5 font-satoshi">Internal label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                className={inputClass}
                placeholder="e.g. Standard rejection"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#15131C] font-satoshi">Subject</label>
              <div className="flex gap-1 flex-wrap justify-end">
                {MERGE_TAGS.map((tag) => (
                  <button key={tag} onClick={() => insertTag(tag, 'subject')}
                    className="text-[10px] font-mono text-[#5A2DD4] bg-[#F1ECFD] px-1.5 py-0.5 rounded hover:bg-[#E6DCFB] transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Your application for {{job_title}} at {{company_name}}"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#15131C] font-satoshi">Body</label>
              <div className="flex gap-1 flex-wrap justify-end">
                {MERGE_TAGS.map((tag) => (
                  <button key={tag} onClick={() => insertTag(tag, 'body')}
                    className="text-[10px] font-mono text-[#5A2DD4] bg-[#F1ECFD] px-1.5 py-0.5 rounded hover:bg-[#E6DCFB] transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              rows={10}
              className={`${inputClass} resize-none`}
              placeholder="Dear {{first_name}},&#10;&#10;Thank you for applying for {{job_title}} at {{company_name}}…"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))}
              className="w-4 h-4 rounded accent-[#5A2DD4]"
            />
            <span className="text-sm font-medium text-[#15131C]">Set as default for this type</span>
          </label>
        </div>

        <div className="shrink-0 border-t border-[#E8E8EF] px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-[#E2E1EA] text-[#6B6478] rounded-xl font-satoshi font-bold text-sm hover:border-[#B9B9C6] transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-3 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-transform"
          >
            {saving ? 'Saving…' : 'Save template'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [modalTemplate, setModalTemplate] = useState<EmailTemplate | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    const res = await fetch('/api/hiring/templates')
    const data = await res.json()
    setTemplates(data.templates ?? [])
  }, [])

  useEffect(() => {
    fetchTemplates().finally(() => setLoading(false))
  }, [fetchTemplates])

  const openNew = () => { setModalTemplate(null); setModalOpen(true) }
  const openEdit = (t: EmailTemplate) => { setModalTemplate(t); setModalOpen(true) }

  const handleSaved = (t: EmailTemplate) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = t; return next }
      return [...prev, t]
    })
    setModalOpen(false)
  }

  const deleteTemplate = async (t: EmailTemplate) => {
    if (t.is_seeded) { toast.error('Seeded templates cannot be deleted'); return }
    if (!confirm(`Delete "${t.label}"?`)) return
    setDeletingId(t.id)
    try {
      const res = await fetch(`/api/hiring/templates/${t.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setTemplates((prev) => prev.filter((x) => x.id !== t.id))
      toast.success('Template deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const grouped = (['rejection', 'acceptance', 'general'] as const).map((type) => ({
    type,
    items: templates.filter((t) => t.type === type),
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="mb-8">
        <Link href="/dashboard/hiring" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9098A3] hover:text-[#15131C] font-satoshi transition-colors mb-4">
          <FaArrowLeft className="w-3 h-3" /> Back to jobs
        </Link>
        <p className="font-satoshi text-[12px] font-bold text-[#5A2DD4] uppercase tracking-[0.14em] mb-1.5">Hiring</p>
        <div className="flex items-center justify-between">
          <h1 className="font-satoshi font-black tracking-[-0.02em] text-[26px] text-[#15131C]">Email templates</h1>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 transition-transform"
          >
            <FaPlus className="w-3 h-3" /> New template
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {grouped.map(({ type, items }) => (
          <div key={type}>
            <h2 className="font-satoshi font-bold text-sm text-[#15131C] mb-3 flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[type]}`}>
                {TYPE_LABELS[type]}
              </span>
            </h2>

            {items.length === 0 ? (
              <div className="bg-white rounded-[18px] border border-[#E2E1EA] border-dashed py-10 flex flex-col items-center gap-3">
                <p className="text-sm text-[#9098A3]">No {TYPE_LABELS[type].toLowerCase()} templates yet</p>
                <button onClick={openNew} className="text-xs font-bold font-satoshi text-[#5A2DD4] hover:opacity-70 transition-opacity">
                  + Add one
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((t) => (
                  <div key={t.id} className="bg-white rounded-[18px] border border-[#E8E8EF] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-satoshi font-bold text-sm text-[#15131C]">{t.label}</p>
                          {t.is_default && (
                            <span className="flex items-center gap-1 text-[10px] font-satoshi font-bold text-[#16895E] bg-[#E7F6EF] px-2 py-0.5 rounded-full">
                              <FaCheck className="w-2.5 h-2.5" /> Default
                            </span>
                          )}
                          {t.is_seeded && (
                            <span className="text-[10px] font-satoshi font-bold text-[#6B6478] bg-[#F3F3F7] px-2 py-0.5 rounded-full">
                              Seeded
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9098A3] mt-1">{t.subject}</p>
                        <p className="text-xs text-[#6B6478] mt-2 line-clamp-2 leading-relaxed">{t.body}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(t)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9098A3] hover:text-[#15131C] hover:bg-[#F4F3F8] transition-colors"
                        >
                          <FaPen className="w-3.5 h-3.5" />
                        </button>
                        {!t.is_seeded && (
                          <button
                            onClick={() => deleteTemplate(t)}
                            disabled={deletingId === t.id}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9098A3] hover:text-[#B6463C] hover:bg-[#FBEAE8] disabled:opacity-40 transition-colors"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <TemplateModal
          template={modalTemplate}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
