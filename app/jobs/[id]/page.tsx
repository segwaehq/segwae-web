import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJobById } from "@/lib/hiring/queries";
import { JobDetail } from "@/components/hiring/JobDetail";

// Dedupe the lookup so generateMetadata and the page share one query per request.
const getJob = cache((id: string) => getJobById(id));

const JOB_TYPE_LD: Record<string, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: "Job not found | Segwae" };

  const company = job.companies?.name ?? job.company_name ?? "";
  const title = `${job.title}${company ? ` at ${company}` : ""} | Segwae`;
  const description =
    job.description.replace(/\s+/g, " ").trim().slice(0, 155) ||
    `Apply for ${job.title} on Segwae.`;
  const url = `https://segwae.com/jobs/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const company = job.companies?.name ?? job.company_name ?? undefined;
  const description = [job.description, job.requirements]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: description || job.title,
    datePosted: job.created_at,
    ...(JOB_TYPE_LD[job.job_type] && {
      employmentType: JOB_TYPE_LD[job.job_type],
    }),
    ...(job.application_deadline && { validThrough: job.application_deadline }),
    ...(company && {
      hiringOrganization: {
        "@type": "Organization",
        name: company,
        ...(job.companies?.website && { sameAs: job.companies.website }),
        ...(job.companies?.logo_url && { logo: job.companies.logo_url }),
      },
    }),
    ...(job.location && {
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location,
        },
      },
    }),
    ...(job.work_mode === "remote" && { jobLocationType: "TELECOMMUTE" }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobDetail job={job} />
    </>
  );
}
