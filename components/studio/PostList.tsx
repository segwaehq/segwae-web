'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FaPenNib, FaTrash, FaPenToSquare } from 'react-icons/fa6'
import type { BlogPost } from '@/lib/types'

function StatusBadge({ status }: { status: BlogPost['status'] }) {
  return status === 'published' ? (
    <span className="font-satoshi rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
      Published
    </span>
  ) : (
    <span className="font-satoshi rounded-md bg-grey5 px-2 py-0.5 text-[11px] font-bold text-grey3">
      Draft
    </span>
  )
}

export function PostList({ posts }: { posts: BlogPost[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const remove = async (post: BlogPost) => {
    if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return
    setDeletingId(post.id)
    try {
      const res = await fetch(`/api/studio/blog/${post.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      toast.success('Post deleted')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-grey4/70 bg-white py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lightPurple">
          <FaPenNib className="h-5 w-5 text-mainPurple" />
        </div>
        <p className="font-satoshi text-lg font-bold text-grey1">No posts yet</p>
        <p className="font-openSans max-w-xs text-center text-sm text-grey3">
          Write your first article — it’ll appear on the public blog once you publish it.
        </p>
        <Link
          href="/studio/new"
          className="font-satoshi mt-1 rounded-xl bg-mainPurple px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4338CA]"
        >
          Write a post
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-grey4/70 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-grey4/70 bg-grey6">
            <th className="font-satoshi px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-grey3">
              Title
            </th>
            <th className="font-satoshi hidden px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-grey3 sm:table-cell">
              Category
            </th>
            <th className="font-satoshi hidden px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-grey3 md:table-cell">
              Updated
            </th>
            <th className="font-satoshi px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-grey3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-grey5 last:border-0 hover:bg-grey6/60">
              <td className="px-5 py-3.5">
                <Link
                  href={`/studio/${post.id}/edit`}
                  className="font-satoshi text-sm font-bold text-grey1 transition-colors hover:text-mainPurple"
                >
                  {post.title}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={post.status} />
                  <span className="font-openSans text-xs text-grey3">/{post.slug}</span>
                </div>
              </td>
              <td className="font-openSans hidden px-5 py-3.5 text-sm text-grey2 sm:table-cell">
                {post.category ?? '—'}
              </td>
              <td className="font-openSans hidden px-5 py-3.5 text-sm text-grey3 md:table-cell">
                {new Date(post.updated_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/studio/${post.id}/edit`}
                    title="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-grey2 transition-colors hover:bg-grey5 hover:text-mainPurple"
                  >
                    <FaPenToSquare className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => remove(post)}
                    disabled={deletingId === post.id}
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-grey2 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <FaTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
