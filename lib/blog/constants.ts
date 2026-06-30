// The five content pillars of the Segwae blog. Used by the public /blog
// category filter and (later) the /admin/blog editor's category picker.
export const BLOG_CATEGORIES = [
  'Job Search',
  'Remote Work',
  'Salary & Money',
  'Career Growth',
  'Personal Brand',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

// Per-category accent styling for chips/pills (matches the /jobs palette).
export const CATEGORY_STYLES: Record<string, string> = {
  'Job Search': 'text-[#1E5BBF] bg-[#E8EFFB]',
  'Remote Work': 'text-[#16895E] bg-[#E7F6EF]',
  'Salary & Money': 'text-[#B45309] bg-[#FEF3E2]',
  'Career Growth': 'text-[#5A2DD4] bg-[#F1ECFD]',
  'Personal Brand': 'text-[#BE185D] bg-[#FCE7F3]',
}

export function categoryStyle(category: string | null | undefined): string {
  return (category && CATEGORY_STYLES[category]) || 'text-grey3 bg-grey5'
}

// Estimate reading time from rendered HTML (~200 words/min, floored at 1).
export function readingMinutesFromHtml(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

// URL-safe slug from a title (or a manually edited slug field).
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
