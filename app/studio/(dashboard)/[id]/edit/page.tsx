import { notFound } from 'next/navigation'
import { getPostByIdForStudio } from '@/lib/blog/studioQueries'
import { BlogForm } from '@/components/studio/BlogForm'

export const dynamic = 'force-dynamic'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPostByIdForStudio(id)
  if (!post) notFound()

  return <BlogForm mode="edit" post={post} />
}
