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
  FaBriefcase,
  FaPenToSquare,
} from "react-icons/fa6";
import type { Job } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "text-[#9098A3] bg-[#F3F3F7]",
  active: "text-[#16895E] bg-[#E7F6EF]",
  paused: "text-[#C2410C] bg-[#FDF0E7]",
  archived: "text-[#6B6478] bg-[#EFEEF4]",
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
      toast.success(`Role ${status === "active" ? "published" : status}`);
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
    <tr className="border-t border-[#F4F3F7] hover:bg-[#FAFAFB] transition-colors">
      <td className="py-4 px-5">
        <div className="flex flex-col gap-1.5">
          <span className="font-satoshi font-bold text-[14px] text-[#15131C]">
            {job.title}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${MODE_LABELS[job.posting_mode] === "External" ? "text-[#1E5BBF] bg-[#E8EFFB]" : "text-[#5A2DD4] bg-[#F1ECFD]"}`}
            >
              {MODE_LABELS[job.posting_mode]}
            </span>
            <span className="text-[11px] font-medium text-[#9098A3]">
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
            {job.location && (
              <span className="text-[11px] font-medium text-[#9098A3] flex items-center gap-0.5">
                <FaLocationDot className="w-2.5 h-2.5" />
                {job.location}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-5">
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[job.status]}`}
        >
          {STATUS_LABELS[job.status]}
        </span>
      </td>
      <td className="py-4 px-5 text-[13px] font-medium text-[#4B4658] hidden md:table-cell">
        {job.posting_mode === "internal" ? (
          <span className="flex items-center gap-1.5">
            <FaUsers className="w-3.5 h-3.5 text-[#9098A3]" />
            {job.application_count ?? 0}
          </span>
        ) : (
          <span className="text-[#B6B0C0]">—</span>
        )}
      </td>
      <td className="py-4 px-5 text-[12px] font-medium text-[#9098A3] hidden lg:table-cell">
        {relTime}
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-2 justify-end">
          {job.posting_mode === "internal" && (
            <Link
              href={`/dashboard/hiring/jobs/${job.id}`}
              className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#5A2DD4] hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              Pipeline <FaArrowRight className="w-3 h-3" />
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
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9098A3] hover:text-[#15131C] hover:bg-[#F3F3F7] transition-colors disabled:opacity-40"
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
                  className="fixed z-20 bg-white border border-[#ECECF1] rounded-xl shadow-[0_12px_30px_-8px_rgba(31,18,72,0.22)] py-1 min-w-[140px]"
                  style={{ top: menuPos.top, right: menuPos.right }}
                >
                  {actions.map((a) => (
                    <button
                      key={a.next}
                      onClick={() => updateStatus(a.next)}
                      className={`w-full text-left px-4 py-2 text-[13.5px] font-medium hover:bg-[#FAFAFB] transition-colors ${a.next === "archived" ? "text-[#B6463C]" : "text-[#15131C]"}`}
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

function StatTile({
  icon,
  tint,
  value,
  label,
}: {
  icon: React.ReactNode;
  tint: string;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-5 flex flex-col justify-between min-h-[118px]">
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center [&>svg]:w-[17px] [&>svg]:h-[17px] ${tint}`}>
        {icon}
      </div>
      <div>
        <div className="text-[28px] font-black tracking-[-0.03em] text-[#15131C] leading-none">{value}</div>
        <div className="text-[12.5px] font-medium text-[#9098A3] mt-1">{label}</div>
      </div>
    </div>
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = jobs.filter((j) => j.status === "active").length;
  const draftCount = jobs.filter((j) => j.status === "draft").length;
  const totalApplicants = jobs.reduce(
    (s, j) => s + (j.application_count ?? 0),
    0,
  );

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold text-[#5A2DD4] uppercase tracking-[0.16em] mb-1.5">
            For employers
          </p>
          <h1 className="font-satoshi font-black text-[22px] tracking-[-0.02em] text-[#15131C]">
            Your roles
          </h1>
          <p className="text-[13px] font-medium text-[#9098A3] mt-0.5">
            {activeCount} open · {totalApplicants} total applicant{totalApplicants === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/dashboard/hiring/post"
          className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-brand-gradient text-white rounded-xl font-bold text-sm shadow-[0_6px_16px_rgba(74,55,216,0.26)] hover:-translate-y-px transition-transform whitespace-nowrap shrink-0"
        >
          <FaPlus className="w-3 h-3" /> Post a role
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatTile
          icon={<FaBriefcase />}
          tint="bg-[#E7F6EF] text-[#16895E]"
          value={activeCount}
          label="Active roles"
        />
        <StatTile
          icon={<FaPenToSquare />}
          tint="bg-[#F3F3F7] text-[#6B6478]"
          value={draftCount}
          label="Drafts"
        />
        <StatTile
          icon={<FaUsers />}
          tint="bg-[#F1ECFD] text-[#5A2DD4]"
          value={totalApplicants}
          label="Total applicants"
        />
      </div>

      {/* Roles table */}
      <div className="bg-white rounded-[18px] border border-[#E8E8EF] overflow-hidden">
        {jobs.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-[#F1ECFD] flex items-center justify-center text-[#5A2DD4]">
              <FaBriefcase className="w-5 h-5" />
            </div>
            <p className="font-satoshi font-extrabold text-[#15131C]">No roles yet</p>
            <p className="text-sm font-medium text-[#9098A3] max-w-xs">
              Post your first role to start receiving applications from candidates.
            </p>
            <Link
              href="/dashboard/hiring/post"
              className="mt-1 px-6 py-2.5 bg-brand-gradient text-white rounded-xl font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
            >
              Post a role
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAFAFB]">
                <th className="text-left py-3 px-5 text-[11px] font-bold text-[#9098A3] uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left py-3 px-5 text-[11px] font-bold text-[#9098A3] uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-3 px-5 text-[11px] font-bold text-[#9098A3] uppercase tracking-wide hidden md:table-cell">
                  Applicants
                </th>
                <th className="text-left py-3 px-5 text-[11px] font-bold text-[#9098A3] uppercase tracking-wide hidden lg:table-cell">
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
