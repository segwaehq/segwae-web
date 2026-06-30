import HomeClient, { type PreviewJob } from '@/components/HomeClient'
import { getActiveJobs } from '@/lib/hiring/queries'
import { formatSalary } from '@/lib/currencies'

const WORK_MODE_LABEL: Record<'remote' | 'onsite' | 'hybrid', PreviewJob['mode']> = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function initialsFrom(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const raw = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)
  return raw.toUpperCase()
}

// Pull the latest active jobs straight from the DB for the homepage previews.
// Falls back to placeholder cards inside HomeClient when the DB has none yet.
async function getPreviewJobs(): Promise<PreviewJob[]> {
  try {
    const { jobs } = await getActiveJobs({ page: 1 })
    return jobs.slice(0, 3).map((job): PreviewJob => {
      const company = job.companies?.name ?? job.company_name ?? 'Company'
      return {
        id: job.id,
        title: job.title,
        company,
        location: job.location ?? (job.work_mode === 'remote' ? 'Remote' : 'Worldwide'),
        mode: WORK_MODE_LABEL[job.work_mode],
        salary: (job.salary_visible && formatSalary(job.salary_min, job.salary_max, job.salary_currency)) || '',
        tags: (job.tags ?? []).slice(0, 2),
        initials: initialsFrom(company),
        timeAgo: timeAgo(job.created_at),
      }
    })
  } catch {
    return []
  }
}

export default async function Home() {
  const previewJobs = await getPreviewJobs()
  return <HomeClient previewJobs={previewJobs} />
}
