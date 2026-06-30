import Link from 'next/link'
import { FaPlus } from 'react-icons/fa6'
import { getAllPostsForStudio } from '@/lib/blog/studioQueries'
import { PostList } from '@/components/studio/PostList'

export const dynamic = 'force-dynamic'

export default async function StudioHome() {
  const posts = await getAllPostsForStudio()
  const published = posts.filter((p) => p.status === 'published').length

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-satoshi text-2xl font-black text-grey1">Posts</h1>
          <p className="font-openSans mt-1 text-sm text-grey3">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} · {published} published
          </p>
        </div>
        <Link
          href="/studio/new"
          className="font-satoshi inline-flex items-center gap-2 rounded-xl bg-mainPurple px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4338CA]"
        >
          <FaPlus className="h-3 w-3" /> New post
        </Link>
      </div>

      <PostList posts={posts} />
    </div>
  )
}
