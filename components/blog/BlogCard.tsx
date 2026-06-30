import Link from 'next/link'
import Image from 'next/image'
import { FaClock, FaArrowRight } from 'react-icons/fa6'
import type { BlogPost } from '@/lib/types'
import { categoryStyle } from '@/lib/blog/constants'

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8E8EF] bg-white transition-all duration-200 hover:-translate-y-[3px] hover:border-[#C9BCF2] hover:shadow-[0_16px_34px_-18px_rgba(74,55,216,0.45)]">
        {/* Cover */}
        <div className="relative aspect-[16/9] overflow-hidden bg-[#F1F0F6]">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="bg-brand-gradient absolute inset-0 flex items-center justify-center">
              <span className="font-satoshi text-5xl font-black text-white/25">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
          {post.category && (
            <span
              className={`font-satoshi absolute left-3 top-3 rounded-md px-2.5 py-[3px] text-[10px] font-bold ${categoryStyle(post.category)}`}
            >
              {post.category}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-[22px]">
          <h3 className="font-satoshi text-[16.5px] font-bold leading-snug tracking-[-0.01em] text-[#15131C] transition-colors group-hover:text-[#5A2DD4]">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="font-openSans mt-2 line-clamp-2 text-[13.5px] font-medium leading-relaxed text-[#9098A3]">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="font-openSans flex items-center gap-2.5 text-xs font-medium text-[#9098A3]">
              <span>{formatDate(post.published_at)}</span>
              <span className="h-1 w-1 rounded-full bg-[#C2C6CF]" />
              <span className="inline-flex items-center gap-1">
                <FaClock className="h-3 w-3" />
                {post.reading_minutes} min
              </span>
            </div>
            <FaArrowRight className="h-3.5 w-3.5 text-[#5A2DD4] opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </article>
    </Link>
  )
}
