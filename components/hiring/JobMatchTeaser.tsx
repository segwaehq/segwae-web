"use client";

import Link from "next/link";
import { FaGaugeHigh, FaWandMagicSparkles, FaUserTie, FaArrowRight } from "react-icons/fa6";

/**
 * Logged-out conversion hook on the job detail page. Anonymous visitors can't run
 * the (auth-gated) Match Score and have no saved resume, so instead of an anonymous
 * run we tease the free AI match + the paid tools and route to login/signup with a
 * redirect back to this job — where the real JobMatchScore/CTAs take over. Rendered
 * only when we know the visitor is logged out (authUser === null), never mid-load.
 */
export function JobMatchTeaser({ jobId }: { jobId: string }) {
  return (
    <div className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F1ECFD] dark:bg-[#221b36] flex items-center justify-center shrink-0">
            <FaGaugeHigh className="w-5 h-5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
          </div>
          <div>
            <p className="font-satoshi font-bold text-[15px] text-[#15131C] dark:text-content">
              See how well you match — free
            </p>
            <p className="font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">
              Instant AI match score and gap analysis against your resume.
            </p>
          </div>
        </div>
        <Link
          href={`/login?redirect=/jobs/${jobId}`}
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-[13px] bg-brand-gradient px-5 py-2.5 font-satoshi text-sm font-bold text-white shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
        >
          See my match
          <FaArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-[#F0EFF4] dark:border-line pt-3.5">
        <span className="inline-flex items-center gap-1.5 font-openSans text-[13px] text-[#4B4658] dark:text-content-muted">
          <FaWandMagicSparkles className="w-3.5 h-3.5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
          Tailor your resume to this job
        </span>
        <span className="inline-flex items-center gap-1.5 font-openSans text-[13px] text-[#4B4658] dark:text-content-muted">
          <FaUserTie className="w-3.5 h-3.5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
          Prep for the interview
        </span>
        <span className="font-openSans text-[12px] text-[#9098A3] dark:text-content-subtle">Free to start</span>
      </div>
    </div>
  );
}
