import { cache } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://segwae.com'

const EMPLOYMENT_TYPE: Record<string, string> = {
  full_time: 'FULL_TIME',
  part_time: 'PART_TIME',
  contract: 'CONTRACTOR',
  internship: 'INTERN',
}

const getJobForMeta = cache(async function getJobForMeta(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('jobs')
    .select('title, description, company_name, location, job_type, work_mode, salary_min, salary_max, salary_currency, salary_visible, created_at, application_deadline, companies(name)')
    .eq('id', id)
    .single()
  return data
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const job = await getJobForMeta(id)
  if (!job) return {}

  const company = (job.companies as unknown as { name: string } | null)?.name ?? job.company_name ?? 'Company'
  const title = `${job.title} at ${company} | Segwae Jobs`
  const description = (job.description ?? '').slice(0, 155) || `Apply for ${job.title} at ${company} on Segwae.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/jobs/${id}`,
      type: 'website',
    },
  }
}

export default async function JobDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getJobForMeta(id)

  const jsonLd = job
    ? {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        datePosted: job.created_at,
        ...(job.application_deadline && { validThrough: job.application_deadline }),
        hiringOrganization: {
          '@type': 'Organization',
          name: (job.companies as unknown as { name: string } | null)?.name ?? job.company_name ?? 'Company',
          sameAs: BASE_URL,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            ...(job.location && { addressLocality: job.location }),
          },
        },
        ...(job.work_mode === 'remote' && { jobLocationType: 'TELECOMMUTE' }),
        employmentType: EMPLOYMENT_TYPE[job.job_type] ?? 'OTHER',
        ...(job.salary_visible &&
          job.salary_min && {
            baseSalary: {
              '@type': 'MonetaryAmount',
              currency: job.salary_currency ?? 'NGN',
              value: {
                '@type': 'QuantitativeValue',
                minValue: job.salary_min,
                ...(job.salary_max && { maxValue: job.salary_max }),
                unitText: 'YEAR',
              },
            },
          }),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
