"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FaPlus,
  FaUsers,
  FaArrowRight,
  FaEllipsisVertical,
  FaLocationDot,
} from "react-icons/fa6";
import type { Job } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "text-grey3 bg-grey5",
  active: "text-successGreen bg-successGreen/10",
  paused: "text-warningYellow bg-warningYellow/10",
  archived: "text-errorRed bg-errorRed/10",
};
const MODE_LABELS: Record<string, string> = {
  internal: "Internal",
  external: "External",
};
const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

function useRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function JobRow({
  job,
  onStatusChange,
}: {
  job: Job;
  onStatusChange: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [busy, setBusy] = useState(false);
  const relTime = useRelativeTime(job.created_at);

  const updateStatus = async (status: string) => {
    setBusy(true);
    setMenuOpen(false);
    try {
      const res = await fetch(`/api/hiring/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`Job ${status === "active" ? "published" : status}`);
      onStatusChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const actions = [];
  if (job.status === "draft")
    actions.push({ label: "Publish", next: "active" });
  if (job.status === "active") actions.push({ label: "Pause", next: "paused" });
  if (job.status === "paused")
    actions.push({ label: "Resume", next: "active" });
  if (job.status !== "archived")
    actions.push({ label: "Archive", next: "archived" });

  return (
    <tr className="border-b border-grey4/60 hover:bg-grey6/50 transition-colors">
      <td className="py-4 px-5">
        <div className="flex flex-col gap-1">
          <span className="font-satoshi font-semibold text-sm text-grey1">
            {job.title}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-semibold font-satoshi px-2 py-0.5 rounded-full ${MODE_LABELS[job.posting_mode] === "External" ? "text-blue bg-blue/10" : "text-mainPurple bg-lightPurple"}`}
            >
              {MODE_LABELS[job.posting_mode]}
            </span>
            <span className="text-[10px] text-grey3 font-openSans">
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
            {job.location && (
              <span className="text-[10px] text-grey3 font-openSans flex items-center gap-0.5">
                <FaLocationDot className="w-2.5 h-2.5" />
                {job.location}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-5">
        <span
          className={`text-xs font-semibold font-satoshi px-2.5 py-1 rounded-full ${STATUS_COLORS[job.status]}`}
        >
          {STATUS_LABELS[job.status]}
        </span>
      </td>
      <td className="py-4 px-5 text-sm font-openSans text-grey2 hidden md:table-cell">
        {job.posting_mode === "internal" ? (
          <span className="flex items-center gap-1.5">
            <FaUsers className="w-3.5 h-3.5 text-grey3" />
            {job.application_count ?? 0}
          </span>
        ) : (
          <span className="text-grey4">—</span>
        )}
      </td>
      <td className="py-4 px-5 text-xs font-openSans text-grey3 hidden lg:table-cell">
        {relTime}
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-2 justify-end">
          {job.posting_mode === "internal" && (
            <Link
              href={`/dashboard/hiring/jobs/${job.id}`}
              className="flex items-center gap-1.5 text-xs font-semibold font-satoshi text-mainPurple hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              Applicants <FaArrowRight className="w-3 h-3" />
            </Link>
          )}
          <div className="relative">
            <button
              onClick={(e) => {
                const rect = (
                  e.currentTarget as HTMLButtonElement
                ).getBoundingClientRect();
                setMenuPos({
                  top: rect.bottom + 6,
                  right: window.innerWidth - rect.right,
                });
                setMenuOpen(!menuOpen);
              }}
              disabled={busy}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-grey3 hover:text-grey1 hover:bg-grey5 transition-colors disabled:opacity-40"
            >
              <FaEllipsisVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="fixed z-20 bg-white border border-grey4/60 rounded-xl shadow-lg py-1 min-w-[130px]"
                  style={{ top: menuPos.top, right: menuPos.right }}
                >
                  {actions.map((a) => (
                    <button
                      key={a.next}
                      onClick={() => updateStatus(a.next)}
                      className={`w-full text-left px-4 py-2 text-sm font-openSans hover:bg-grey6 transition-colors ${a.next === "archived" ? "text-errorRed" : "text-grey1"}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function HiringDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const [companyRes, jobsRes] = await Promise.all([
        fetch("/api/hiring/company"),
        fetch("/api/hiring/jobs?mode=hr"),
      ]);
      const companyData = await companyRes.json();
      if (!companyData.company) {
        router.replace("/dashboard/hiring/setup");
        return;
      }
      setHasCompany(true);
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs ?? []);
    } catch {
      toast.error("Failed to load hiring data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  if (loading || hasCompany === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = jobs.filter((j) => j.status === "active").length;
  const draftCount = jobs.filter((j) => j.status === "draft").length;
  const totalApplicants = jobs.reduce(
    (s, j) => s + (j.application_count ?? 0),
    0,
  );
  const unresolved = 0;

  return (
    <div className="max-w-full">
      <div className="mb-8">
        <p className="font-satoshi text-[11px] font-semibold text-mainPurple uppercase tracking-[0.22em] mb-1">
          Hiring
        </p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-satoshi font-bold text-2xl text-grey1">
            Your Jobs
          </h1>
          <Link
            href="/dashboard/hiring/post"
            className="flex items-center gap-2 px-5 py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors whitespace-nowrap shrink-0"
          >
            <FaPlus className="w-3 h-3" /> Post a Job
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active", value: activeCount, color: "text-successGreen" },
          { label: "Drafts", value: draftCount, color: "text-grey3" },
          {
            label: "Total applicants",
            value: totalApplicants,
            color: "text-mainPurple",
          },
          {
            label: "Unresolved",
            value: unresolved,
            color: "text-warningYellow",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-grey4/60 p-5"
          >
            <p className={`font-satoshi font-bold text-3xl ${s.color}`}>
              {s.value}
            </p>
            <p className="font-openSans text-xs text-grey3 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Jobs table */}
      <div className="bg-white rounded-2xl border border-grey4/60 overflow-hidden">
        {jobs.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-lightPurple flex items-center justify-center">
              <FaPlus className="w-5 h-5 text-mainPurple" />
            </div>
            <p className="font-satoshi font-semibold text-grey1">No jobs yet</p>
            <p className="font-openSans text-sm text-grey3">
              Post your first job listing to start receiving applications
            </p>
            <Link
              href="/dashboard/hiring/post"
              className="mt-2 px-6 py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
            >
              Post a Job
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey4/60 bg-grey6/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-grey3 font-satoshi uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-grey3 font-satoshi uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-grey3 font-satoshi uppercase tracking-wide hidden md:table-cell">
                  Applicants
                </th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-grey3 font-satoshi uppercase tracking-wide hidden lg:table-cell">
                  Posted
                </th>
                <th className="py-3 px-5" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <JobRow key={job.id} job={job} onStatusChange={fetchJobs} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
