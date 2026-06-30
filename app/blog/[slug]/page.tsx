import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FaArrowLeft, FaClock, FaArrowRight, FaUser } from 'react-icons/fa6'
import { getPostBySlug, getRelatedPosts } from '@/lib/blog/queries'
import { categoryStyle } from '@/lib/blog/constants'
import { BlogCard } from '@/components/blog/BlogCard'

const BASE_URL = 'https://segwae.com'

// Dedupe the lookup so generateMetadata and the page share one query per request.
const getPost = cache((slug: string) => getPostBySlug(slug))

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Article not found | Segwae' }

  const title = post.seo_title || `${post.title} | Segwae`
  const description = post.seo_description || post.excerpt || `${post.title} — read on Segwae.`
  const url = `${BASE_URL}/blog/${post.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      ...(post.cover_image_url && { images: [{ url: post.cover_image_url }] }),
    },
    twitter: {
      card: post.cover_image_url ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(post.cover_image_url && { images: [post.cover_image_url] }),
    },
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post.id, post.category)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo_description || post.excerpt || post.title,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: post.author_name },
    publisher: {
      '@type': 'Organization',
      name: 'Segwae',
      url: BASE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${post.slug}` },
    ...(post.cover_image_url && { image: post.cover_image_url }),
    ...(post.tags.length > 0 && { keywords: post.tags.join(', ') }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Dark top bar */}
        <div className="bg-[#0F1115] px-6 py-4">
          <div className="mx-auto max-w-[760px]">
            <Link
              href="/blog"
              className="font-satoshi inline-flex items-center gap-1.5 text-xs font-bold text-white/55 transition-colors hover:text-white"
            >
              <FaArrowLeft className="h-3 w-3" /> All articles
            </Link>
          </div>
        </div>

        <article className="mx-auto max-w-[760px] px-6 py-10">
          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className={`font-satoshi inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${categoryStyle(post.category)}`}
              >
                {post.category}
              </Link>
            )}
            <h1 className="font-satoshi mt-4 text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-[1.1] tracking-[-0.025em] text-[#15131C]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="font-openSans mt-4 text-[17px] font-medium leading-relaxed text-[#6B6478]">
                {post.excerpt}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3 border-t border-[#F0EFF4] pt-5">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#F1F0F6]">
                {post.author_avatar_url ? (
                  <Image
                    src={post.author_avatar_url}
                    alt={post.author_name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaUser className="h-4 w-4 text-[#9098A3]" />
                )}
              </div>
              <div>
                <p className="font-satoshi text-[13.5px] font-bold text-[#15131C]">
                  {post.author_name}
                </p>
                <p className="font-openSans flex items-center gap-2 text-[12.5px] font-medium text-[#9098A3]">
                  <span>{formatDate(post.published_at)}</span>
                  <span className="h-1 w-1 rounded-full bg-[#C2C6CF]" />
                  <span className="inline-flex items-center gap-1">
                    <FaClock className="h-3 w-3" />
                    {post.reading_minutes} min read
                  </span>
                </p>
              </div>
            </div>
          </header>

          {/* Cover */}
          {post.cover_image_url && (
            <div className="relative mb-9 aspect-[16/9] overflow-hidden rounded-[18px] bg-[#F1F0F6]">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                sizes="(max-width: 760px) 100vw, 760px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Body — admin-authored, sanitised HTML */}
          <div
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.body_html }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-[#F0EFF4] pt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-satoshi rounded-lg border border-[#ECECF1] bg-[#F6F5FA] px-3 py-1.5 text-xs font-semibold text-[#4B4658]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="bg-brand-gradient relative mt-10 flex flex-col items-center justify-between gap-5 overflow-hidden rounded-[20px] p-[30px] sm:flex-row">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)',
                backgroundSize: '26px 26px',
                opacity: 0.4,
              }}
            />
            <div className="relative">
              <p className="font-satoshi text-[19px] font-extrabold tracking-[-0.02em] text-white">
                Ready to put this to work?
              </p>
              <p className="font-openSans mt-1 text-sm font-medium text-white/70">
                Browse hand-checked roles and apply with your Segwae profile.
              </p>
            </div>
            <Link
              href="/jobs"
              className="font-satoshi relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[11px] bg-white px-6 py-3.5 text-sm font-bold text-[#5A2DD4] transition-transform hover:-translate-y-0.5"
            >
              Browse jobs <FaArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <div className="border-t border-[#EFEEF4] bg-[#FAFAFB]">
            <div className="mx-auto max-w-[1100px] px-6 py-12">
              <h2 className="font-satoshi mb-6 text-xl font-extrabold tracking-[-0.01em] text-[#15131C]">
                Keep reading
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
