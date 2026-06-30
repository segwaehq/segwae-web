import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/adminAuth'
import { checkWriterApiAuth } from '@/lib/writerAuth'
import { sanitizeBlogHtml } from '@/lib/blog/sanitize'
import { readingMinutesFromHtml, slugify } from '@/lib/blog/constants'

// PATCH /api/studio/blog/[id] — update a post (partial).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await checkWriterApiAuth()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const supabase = createAdminClient()

  try {
    const body = await request.json()
    const patch: Record<string, unknown> = {}

    if (body.title !== undefined) {
      if (!body.title?.trim()) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
      }
      patch.title = body.title.trim()
    }
    if (body.slug !== undefined) {
      const s = slugify(body.slug?.trim() || '')
      if (!s) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
      patch.slug = s
    }
    if (body.excerpt !== undefined) patch.excerpt = body.excerpt?.trim() || null
    if (body.cover_image_url !== undefined)
      patch.cover_image_url = body.cover_image_url?.trim() || null
    if (body.category !== undefined) patch.category = body.category?.trim() || null
    if (body.tags !== undefined) patch.tags = Array.isArray(body.tags) ? body.tags : []
    if (body.author_name !== undefined)
      patch.author_name = body.author_name?.trim() || 'Segwae Team'
    if (body.author_avatar_url !== undefined)
      patch.author_avatar_url = body.author_avatar_url?.trim() || null
    if (body.seo_title !== undefined) patch.seo_title = body.seo_title?.trim() || null
    if (body.seo_description !== undefined)
      patch.seo_description = body.seo_description?.trim() || null

    if (body.body_html !== undefined) {
      const cleanHtml = sanitizeBlogHtml(body.body_html ?? '')
      patch.body_html = cleanHtml
      patch.reading_minutes = readingMinutesFromHtml(cleanHtml)
    }

    // Status transitions: stamp published_at the first time a post goes live.
    if (body.status !== undefined) {
      const status = body.status === 'published' ? 'published' : 'draft'
      patch.status = status
      if (status === 'published') {
        const { data: current } = await supabase
          .from('blog_posts')
          .select('published_at')
          .eq('id', id)
          .maybeSingle()
        if (!current?.published_at) patch.published_at = new Date().toISOString()
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json(
          { error: 'A post with this slug already exists.' },
          { status: 409 },
        )
      }
      throw error
    }
    if (!data) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    return NextResponse.json({ post: data })
  } catch (err) {
    console.error('Error updating blog post:', err)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/studio/blog/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await checkWriterApiAuth()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  return NextResponse.json({ success: true })
}
