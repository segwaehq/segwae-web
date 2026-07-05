import type { Metadata } from 'next'
import Link from 'next/link'
import { FaPenNib } from 'react-icons/fa6'
import { getPublishedPosts, BLOG_PAGE_SIZE } from '@/lib/blog/queries'
import { BLOG_CATEGORIES } from '@/lib/blog/constants'
import { BlogCard } from '@/components/blog/BlogCard'

export const metadata: Metadata = {
  title: 'Career Blog | Segwae',
  description:
    'Practical guides on job hunting, remote work, salaries, and career growth for African professionals. The Segwae career playbook.',
  alternates: { canonical: 'https://segwae.com/blog' },
  openGraph: {
    title: 'Career Blog | Segwae',
    description:
      'Practical guides on job hunting, remote work, salaries, and career growth for African professionals.',
    url: 'https://segwae.com/blog',
    type: 'website',
  },
}

function buildPageUrl(category: string | undefined, page: number) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return `/blog${qs ? `?${qs}` : ''}`
}

function Pagination({
  currentPage,
  totalPages,
  category,
}: {
  currentPage: number
  totalPages: number
  category: string | undefined
}) {
  if (totalPages <= 1) return null
  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <Link
        href={buildPageUrl(category, currentPage - 1)}
        aria-disabled={currentPage === 1}
        className={`font-satoshi rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
          currentPage === 1 ? 'pointer-events-none text-grey4 dark:text-line' : 'text-grey2 dark:text-content-muted hover:bg-grey5 dark:hover:bg-surface-sunken'
        }`}
      >
        ← Prev
      </Link>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={buildPageUrl(category, p)}
          className={`font-satoshi flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
            p === currentPage ? 'bg-brand-gradient text-white' : 'text-grey2 dark:text-content-muted hover:bg-grey5 dark:hover:bg-surface-sunken'
          }`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={buildPageUrl(category, currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        className={`font-satoshi rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
          currentPage === totalPages ? 'pointer-events-none text-grey4 dark:text-line' : 'text-grey2 dark:text-content-muted hover:bg-grey5 dark:hover:bg-surface-sunken'
        }`}
      >
        Next →
      </Link>
    </div>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const sp = await searchParams
  const category = BLOG_CATEGORIES.includes(sp.category as never) ? sp.category : undefined
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10))

  const { posts, total } = await getPublishedPosts({ category, page: currentPage })
  const totalPages = Math.ceil(total / BLOG_PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#FAFAFB] dark:bg-surface">
      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0F1115]">
        <div
          className="pointer-events-none absolute -right-16 -top-40 h-[520px] w-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(91,43,217,0.4), transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            WebkitMaskImage: 'linear-gradient(180deg, #000, transparent)',
            maskImage: 'linear-gradient(180deg, #000, transparent)',
          }}
        />
        <div className="relative mx-auto max-w-[1100px] px-6 pb-9 pt-9">
          <div className="mb-5 flex items-center gap-2">
            <Link
              href="/"
              className="font-satoshi text-[11px] font-bold uppercase tracking-[0.1em] text-white/30 transition-colors hover:text-white/60"
            >
              Segwae
            </Link>
            <span className="text-xs text-white/20">›</span>
            <span className="font-satoshi text-[11px] font-bold uppercase tracking-[0.1em] text-[#A78BFA]">
              Blog
            </span>
          </div>
          <h1 className="font-satoshi mb-2 text-[clamp(2.1rem,3.8vw,3rem)] font-black leading-[1.05] tracking-[-0.03em] text-white">
            The career playbook.
          </h1>
          <p className="font-openSans mb-6 max-w-xl text-[15px] font-medium text-white/45">
            Honest, practical guides on landing better jobs, working remotely, and growing your
            career — written for African professionals.
          </p>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`font-satoshi rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
                !category ? 'bg-white text-[#15131C]' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              All
            </Link>
            {BLOG_CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/blog?category=${encodeURIComponent(c)}`}
                className={`font-satoshi rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
                  category === c
                    ? 'bg-white text-[#15131C]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Posts ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1100px] px-6 py-9">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3.5 rounded-[18px] border border-[#E8E8EF] dark:border-line bg-white dark:bg-surface-raised py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F0FE] dark:bg-[#241d38]">
              <FaPenNib className="h-5 w-5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
            </div>
            <p className="font-satoshi text-lg font-extrabold text-[#15131C] dark:text-content">
              {category ? `Nothing in ${category} yet` : 'No articles yet'}
            </p>
            <p className="font-openSans max-w-[320px] text-center text-sm font-medium text-[#9098A3] dark:text-content-subtle">
              {category
                ? 'Try another category — new pieces are published regularly.'
                : 'New guides are on the way. Check back soon.'}
            </p>
            {category && (
              <Link
                href="/blog"
                className="font-satoshi mt-1 rounded-[10px] bg-brand-gradient px-[22px] py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                View all articles
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} category={category} />
          </>
        )}
      </div>
    </div>
  )
}
