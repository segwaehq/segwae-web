'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { FaFileLines, FaPen, FaTrash, FaCheck, FaXmark } from 'react-icons/fa6'
import type { Resume } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

export default function ResumeManagerPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch('/api/hiring/resumes')
      const data = await res.json()
      setResumes(data.resumes ?? [])
    } catch {
      toast.error('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchResumes() }, [fetchResumes])

  const uploadFile = async (file: File) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5 MB.'); return }
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(ext ?? '')) {
      toast.error('Only PDF, DOC, or DOCX files allowed')
      return
    }

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const path = `resumes/${user.id}/${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage.from('user-uploads').upload(path, file)
      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('user-uploads').getPublicUrl(path)
      const fileUrl = urlData.publicUrl

      const res = await fetch('/api/hiring/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: file.name.replace(/\.[^.]+$/, ''),
          file_url: fileUrl,
          is_default: resumes.length === 0,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Resume uploaded')
      fetchResumes()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const setDefault = async (id: string) => {
    setSaving(id)
    try {
      const res = await fetch(`/api/hiring/resumes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setResumes((prev) => prev.map((r) => ({ ...r, is_default: r.id === id })))
      toast.success('Default resume updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSaving(null)
    }
  }

  const saveLabel = async (id: string) => {
    if (!editLabel.trim()) return
    setSaving(id)
    try {
      const res = await fetch(`/api/hiring/resumes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: editLabel.trim() }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setResumes((prev) => prev.map((r) => r.id === id ? { ...r, label: editLabel.trim() } : r))
      setEditId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to rename')
    } finally {
      setSaving(null)
    }
  }

  const deleteResume = async (id: string) => {
    setSaving(id)
    try {
      const res = await fetch(`/api/hiring/resumes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setResumes((prev) => prev.filter((r) => r.id !== id))
      toast.success('Resume deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSaving(null)
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
    <div className="max-w-full">
      <div className="mb-8">
        <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.22em] mb-1">
          Careers
        </p>
        <h1 className="font-satoshi font-bold text-2xl text-grey1">Resume Manager</h1>
        <p className="font-openSans text-sm text-grey3 mt-1">
          Upload and manage your resumes. Your default resume is sent when you apply.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-6 ${
          dragActive ? 'border-mainPurple bg-lightPurple' : 'border-grey4 bg-grey6 hover:border-mainPurple/50 hover:bg-grey5/50'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = '' }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
            <p className="font-openSans text-sm text-grey3">Uploading…</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-lightPurple flex items-center justify-center mx-auto mb-3">
              <FaFileLines className="w-5 h-5 text-mainPurple" />
            </div>
            <p className="font-satoshi font-semibold text-sm text-grey1 mb-1">Drop your resume here or click to upload</p>
            <p className="font-openSans text-xs text-grey3">PDF, DOC, DOCX · Max 5 MB</p>
          </>
        )}
      </div>

      {/* Resume list */}
      <div className="space-y-3">
        {resumes.length === 0 ? (
          <div className="text-center py-10">
            <p className="font-openSans text-sm text-grey3">No resumes yet. Upload your first one above.</p>
          </div>
        ) : (
          resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white rounded-2xl border border-grey4/60 p-4 flex items-center gap-4"
            >
              <div className="w-11 h-12 rounded-xl bg-lightPurple flex items-center justify-center shrink-0">
                <FaFileLines className="w-5 h-5 text-mainPurple" />
              </div>

              <div className="flex-1 min-w-0">
                {editId === resume.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveLabel(resume.id)}
                      autoFocus
                      className="flex-1 px-2.5 py-1.5 border border-mainPurple rounded-lg font-openSans text-sm text-grey1 focus:outline-none"
                    />
                    <button
                      onClick={() => saveLabel(resume.id)}
                      disabled={saving === resume.id}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-mainPurple text-white hover:bg-[#4338CA] disabled:opacity-50 transition-colors"
                    >
                      <FaCheck className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-grey3 hover:text-grey1 hover:bg-grey5 transition-colors"
                    >
                      <FaXmark className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-satoshi font-semibold text-sm text-grey1">{resume.label}</span>
                    {resume.is_default && (
                      <span className="text-[10px] font-semibold font-satoshi px-2 py-0.5 rounded-full text-successGreen bg-successGreen/10">
                        Default
                      </span>
                    )}
                  </div>
                )}
                <p className="font-openSans text-xs text-grey3 mt-0.5">
                  Uploaded {new Date(resume.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={resume.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-mainPurple hover:bg-lightPurple transition-colors"
                  title="View resume"
                >
                  <FaFileLines className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => { setEditId(resume.id); setEditLabel(resume.label) }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-grey1 hover:bg-grey5 transition-colors"
                  title="Rename"
                >
                  <FaPen className="w-3 h-3" />
                </button>
                {!resume.is_default && (
                  <button
                    onClick={() => setDefault(resume.id)}
                    disabled={saving === resume.id}
                    className="px-3 h-8 rounded-lg border border-grey4 font-satoshi font-semibold text-[11px] text-grey2 hover:border-mainPurple hover:text-mainPurple disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => deleteResume(resume.id)}
                  disabled={saving === resume.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-errorRed hover:bg-errorRed/10 disabled:opacity-50 transition-colors"
                  title="Delete"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {resumes.length > 0 && (
        <div className="mt-5 flex items-start gap-3 p-4 bg-lightPurple rounded-xl">
          <span className="text-mainPurple text-base mt-0.5">💡</span>
          <p className="font-openSans text-xs text-mainPurple leading-relaxed">
            Your <strong>default resume</strong> is automatically attached when you apply to a job. You can always pick a different one from the application form.
          </p>
        </div>
      )}
    </div>
  )
}
