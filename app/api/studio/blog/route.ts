import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/adminAuth'
import { checkWriterApiAuth } from '@/lib/writerAuth'
import { sanitizeBlogHtml } from '@/lib/blog/sanitize'
import { readingMinutesFromHtml, slugify } from '@/lib/blog/constants'

// GET /api/studio/blog — list every post (drafts included) for the studio.
export async function GET() {
  const auth = await checkWriterApiAuth()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  return NextResponse.json({ posts: data ?? [] })
}

// POST /api/studio/blog — create a post.
export async function POST(request: Request) {
  const auth = await checkWriterApiAuth()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      body_html,
      cover_image_url,
      category,
      tags,
      author_name,
      author_avatar_url,
      seo_title,
      seo_description,
      status,
    } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const finalSlug = slugify(slug?.trim() || title)
    if (!finalSlug) {
      return NextResponse.json({ error: 'Could not derive a valid slug' }, { status: 400 })
    }

    const cleanHtml = sanitizeBlogHtml(body_html ?? '')
    const publish = status === 'published'

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt?.trim() || null,
        body_html: cleanHtml,
        cover_image_url: cover_image_url?.trim() || null,
        category: category?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        author_name: author_name?.trim() || 'Segwae Team',
        author_avatar_url: author_avatar_url?.trim() || null,
        reading_minutes: readingMinutesFromHtml(cleanHtml),
        seo_title: seo_title?.trim() || null,
        seo_description: seo_description?.trim() || null,
        status: publish ? 'published' : 'draft',
        published_at: publish ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json(
          { error: 'A post with this slug already exists. Try a different title or slug.' },
          { status: 409 },
        )
      }
      throw error
    }

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (err) {
    console.error('Error creating blog post:', err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
