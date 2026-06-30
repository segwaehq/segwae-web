import { createClient } from '@/lib/supabase/server'
import type { BlogPost } from '@/lib/types'

export const BLOG_PAGE_SIZE = 9

// Published posts feed, newest first, optionally filtered by category.
export async function getPublishedPosts(opts?: {
  category?: string
  page?: number
}): Promise<{ posts: BlogPost[]; total: number }> {
  const supabase = await createClient()
  const page = Math.max(1, opts?.page ?? 1)
  const from = (page - 1) * BLOG_PAGE_SIZE
  const to = from + BLOG_PAGE_SIZE - 1

  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')

  if (opts?.category) query = query.eq('category', opts.category)

  const { data, count } = await query
    .order('published_at', { ascending: false })
    .range(from, to)

  return { posts: (data ?? []) as BlogPost[], total: count ?? 0 }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  return (data as BlogPost) ?? null
}

// A few other published posts for the "Keep reading" section.
export async function getRelatedPosts(
  excludeId: string,
  category: string | null,
  limit = 3,
): Promise<BlogPost[]> {
  const supabase = await createClient()

  // Prefer same-category posts, then top up with the latest overall.
  const collected: BlogPost[] = []
  const seen = new Set<string>([excludeId])

  if (category) {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .eq('category', category)
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(limit)
    for (const p of (data ?? []) as BlogPost[]) {
      collected.push(p)
      seen.add(p.id)
    }
  }

  if (collected.length < limit) {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(limit + 1)
    for (const p of (data ?? []) as BlogPost[]) {
      if (seen.has(p.id)) continue
      collected.push(p)
      seen.add(p.id)
      if (collected.length >= limit) break
    }
  }

  return collected.slice(0, limit)
}

// Slugs + timestamps for the sitemap.
export async function getPublishedPostsForSitemap(): Promise<
  { slug: string; updated_at: string }[]
> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')
  return (data ?? []) as { slug: string; updated_at: string }[]
}
