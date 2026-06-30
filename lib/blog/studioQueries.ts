import { createAdminClient } from '@/lib/adminAuth'
import type { BlogPost } from '@/lib/types'

// Studio reads use the service-role client so writers can see drafts too.
// (The public site only ever reads published posts via the anon client.)

export async function getAllPostsForStudio(): Promise<BlogPost[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false })
  return (data ?? []) as BlogPost[]
}

export async function getPostByIdForStudio(id: string): Promise<BlogPost | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return (data as BlogPost) ?? null
}
