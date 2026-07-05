'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  FaArrowLeft,
  FaUpload,
  FaSpinner,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6'
import type { BlogPost } from '@/lib/types'
import { BLOG_CATEGORIES, slugify } from '@/lib/blog/constants'
import { BlogEditor } from '@/components/studio/BlogEditor'

const labelCls = 'font-satoshi block text-[13px] font-semibold text-grey1 dark:text-content mb-1.5'
const inputCls =
  'font-openSans w-full rounded-xl border border-grey4 dark:border-line dark:bg-surface-sunken px-3.5 py-2.5 text-sm text-grey1 dark:text-content outline-none transition-all placeholder:text-grey3 dark:placeholder:text-content-subtle focus:border-mainPurple dark:focus:border-[#6a4fb0] focus:ring-2 focus:ring-mainPurple/20'

export function BlogForm({
  mode,
  post,
}: {
  mode: 'create' | 'edit'
  post?: BlogPost
}) {
  const router = useRouter()

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [category, setCategory] = useState(post?.category ?? '')
  const [tagsInput, setTagsInput] = useState((post?.tags ?? []).join(', '))
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? '')
  const [authorName, setAuthorName] = useState(post?.author_name ?? 'Segwae Team')
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? '')
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? '')
  const [bodyHtml, setBodyHtml] = useState(post?.body_html ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status ?? 'draft')

  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const onTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const uploadCover = async (file: File) => {
    setUploadingCover(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/studio/blog/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setCoverImageUrl(data.publicUrl)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cover upload failed')
    } finally {
      setUploadingCover(false)
    }
  }

  const save = async () => {
    if (!title.trim()) {
      toast.error('Give the post a title first')
      return
    }
    setSaving(true)

    const payload = {
      title,
      slug,
      excerpt,
      body_html: bodyHtml,
      cover_image_url: coverImageUrl,
      category: category || null,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      author_name: authorName,
      seo_title: seoTitle,
      seo_description: seoDescription,
      status,
    }

    try {
      const res = await fetch(
        mode === 'create' ? '/api/studio/blog' : `/api/studio/blog/${post!.id}`,
        {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')

      toast.success(mode === 'create' ? 'Post created' : 'Changes saved')
      router.push('/studio')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/studio"
          className="font-satoshi inline-flex items-center gap-1.5 text-sm font-semibold text-grey3 dark:text-content-subtle transition-colors hover:text-grey1 dark:hover:text-content"
        >
          <FaArrowLeft className="h-3 w-3" /> All posts
        </Link>
        <div className="flex items-center gap-2.5">
          {mode === 'edit' && post?.status === 'published' && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-satoshi inline-flex items-center gap-1.5 rounded-xl border border-grey4 dark:border-line px-4 py-2.5 text-sm font-semibold text-grey2 dark:text-content-muted transition-colors hover:bg-grey5 dark:hover:bg-white/[0.06]"
            >
              View <FaArrowUpRightFromSquare className="h-3 w-3" />
            </a>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="font-satoshi inline-flex items-center gap-2 rounded-xl bg-mainPurple px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <FaSpinner className="h-3.5 w-3.5 animate-spin" />}
            {saving ? 'Saving…' : status === 'published' ? 'Save & publish' : 'Save draft'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Main column */}
        <div className="flex flex-col gap-5">
          <div>
            <label className={labelCls}>Title</label>
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="How to land your first remote job"
              className={`${inputCls} font-satoshi text-base font-bold`}
            />
          </div>

          <div>
            <label className={labelCls}>Slug</label>
            <div className="flex items-center gap-2">
              <span className="font-openSans text-sm text-grey3 dark:text-content-subtle">/blog/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value)
                }}
                onBlur={(e) => setSlug(slugify(e.target.value))}
                placeholder="how-to-land-your-first-remote-job"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Excerpt <span className="font-normal text-grey3 dark:text-content-subtle">· shown on cards & search</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="A one or two sentence summary of the article."
              className={`${inputCls} resize-y`}
            />
          </div>

          <div>
            <label className={labelCls}>Content</label>
            <BlogEditor value={bodyHtml} onChange={setBodyHtml} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Publish */}
          <div className="rounded-2xl border border-grey4/70 dark:border-line bg-white dark:bg-surface-raised p-5">
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className={inputCls}
            >
              <option value="draft">Draft — only you can see it</option>
              <option value="published">Published — live on the site</option>
            </select>
            {mode === 'edit' && post?.published_at && (
              <p className="font-openSans mt-2 text-xs text-grey3 dark:text-content-subtle">
                First published {new Date(post.published_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>

          {/* Cover image */}
          <div className="rounded-2xl border border-grey4/70 dark:border-line bg-white dark:bg-surface-raised p-5">
            <label className={labelCls}>Cover image</label>
            {coverImageUrl ? (
              <div className="overflow-hidden rounded-xl border border-grey4 dark:border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImageUrl} alt="Cover" className="aspect-[16/9] w-full object-cover" />
                <button
                  onClick={() => setCoverImageUrl('')}
                  className="font-satoshi w-full border-t border-grey4 dark:border-line bg-grey6 dark:bg-white/[0.03] py-2 text-xs font-semibold text-grey2 dark:text-content-muted hover:bg-grey5 dark:hover:bg-white/[0.06]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-grey4 dark:border-line py-7 text-grey3 dark:text-content-subtle transition-colors hover:border-mainPurple dark:hover:border-[#6a4fb0] hover:text-mainPurple dark:hover:text-[#b9a4f7] ${
                  uploadingCover ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {uploadingCover ? (
                  <FaSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <FaUpload className="h-4 w-4" />
                )}
                <span className="font-satoshi text-xs font-semibold">
                  {uploadingCover ? 'Uploading…' : 'Upload image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadCover(file)
                    e.target.value = ''
                  }}
                />
              </label>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-4 rounded-2xl border border-grey4/70 dark:border-line bg-white dark:bg-surface-raised p-5">
            <div>
              <label className={labelCls}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Tags <span className="font-normal text-grey3 dark:text-content-subtle">· comma separated</span>
              </label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="remote work, cv tips"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Author</label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* SEO */}
          <div className="flex flex-col gap-4 rounded-2xl border border-grey4/70 dark:border-line bg-white dark:bg-surface-raised p-5">
            <p className="font-satoshi text-[13px] font-bold text-grey1 dark:text-content">SEO overrides</p>
            <div>
              <label className={labelCls}>Meta title</label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Defaults to the post title"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Meta description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                placeholder="Defaults to the excerpt"
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
