"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  FaBriefcase,
  FaPlus,
  FaXmark,
  FaPen,
  FaTrash,
  FaArrowUpRightFromSquare,
  FaLocationDot,
  FaCheck,
  FaCircle,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import type { Job } from "@/lib/types";
import { CURRENCIES } from "@/lib/currencies";

// ─── Constants ────────────────────────────────────────────────────────────────

const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
] as const;

const WORK_MODES = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
] as const;

const STATUSES = [
  {
    value: "active",
    label: "Active",
    color: "text-successGreen bg-successGreen/10",
  },
  { value: "draft", label: "Draft", color: "text-grey3 bg-grey5" },
  { value: "paused", label: "Paused", color: "text-amber-600 bg-amber-50" },
  { value: "archived", label: "Archived", color: "text-grey3 bg-grey5" },
] as const;

type StatusFilter = "all" | Job["status"];

// ─── Blank form ───────────────────────────────────────────────────────────────

const blankForm = () => ({
  company_name: "",
  title: "",
  external_url: "",
  job_type: "full_time" as Job["job_type"],
  work_mode: "onsite" as Job["work_mode"],
  location: "",
  description: "",
  requirements: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "NGN",
  salary_visible: false,
  experience_years_min: "0",
  tags: "",
  application_deadline: "",
  status: "active" as Job["status"],
});

type FormState = ReturnType<typeof blankForm>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusStyle(status: Job["status"]) {
  return (
    STATUSES.find((s) => s.value === status)?.color ?? "text-grey3 bg-grey5"
  );
}

function statusLabel(status: Job["status"]) {
  return STATUSES.find((s) => s.value === status)?.label ?? status;
}

function jobTypeLabel(t: Job["job_type"]) {
  return JOB_TYPES.find((x) => x.value === t)?.label ?? t;
}

function workModeLabel(m: Job["work_mode"]) {
  return WORK_MODES.find((x) => x.value === m)?.label ?? m;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function jobToForm(job: Job): FormState {
  return {
    company_name: job.company_name ?? "",
    title: job.title,
    external_url: job.external_url ?? "",
    job_type: job.job_type,
    work_mode: job.work_mode,
    location: job.location ?? "",
    description: job.description,
    requirements: job.requirements ?? "",
    salary_min: job.salary_min?.toString() ?? "",
    salary_max: job.salary_max?.toString() ?? "",
    salary_currency: job.salary_currency ?? "NGN",
    salary_visible: job.salary_visible,
    experience_years_min: job.experience_years_min?.toString() ?? "0",
    tags: (job.tags ?? []).join(", "),
    application_deadline: job.application_deadline
      ? job.application_deadline.split("T")[0]
      : "",
    status: job.status,
  };
}

function formToPayload(form: FormState) {
  return {
    company_name: form.company_name.trim(),
    title: form.title.trim(),
    external_url: form.external_url.trim(),
    job_type: form.job_type,
    work_mode: form.work_mode,
    location: form.location.trim() || null,
    description: form.description.trim(),
    requirements: form.requirements.trim() || null,
    salary_min: form.salary_min ? Number(form.salary_min) : null,
    salary_max: form.salary_max ? Number(form.salary_max) : null,
    salary_currency: form.salary_currency,
    salary_visible: form.salary_visible,
    experience_years_min: Number(form.experience_years_min) || 0,
    tags: form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    application_deadline: form.application_deadline || null,
    status: form.status,
  };
}

// ─── Form Drawer ──────────────────────────────────────────────────────────────

function JobDrawer({
  editingJob,
  onClose,
  onSaved,
}: {
  editingJob: Job | null;
  onClose: () => void;
  onSaved: (job: Job) => void;
}) {
  const isEditing = !!editingJob;
  const [form, setForm] = useState<FormState>(
    isEditing ? jobToForm(editingJob!) : blankForm(),
  );
  const [saving, setSaving] = useState(false);

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Job title is required");
      return;
    }
    if (!form.external_url.trim()) {
      toast.error("LinkedIn / external URL is required");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing
        ? `/api/admin/jobs/${editingJob!.id}`
        : "/api/admin/jobs";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save job");
      toast.success(isEditing ? "Job updated" : "Job posted");
      onSaved(data.job);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 border border-grey4 rounded-lg focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors";
  const labelCls =
    "block font-satoshi font-semibold text-xs text-grey3 uppercase tracking-wide mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey4/60 shrink-0">
          <div>
            <p className="font-satoshi font-bold text-lg text-grey1">
              {isEditing ? "Edit Job" : "Post External Job"}
            </p>
            <p className="font-openSans text-xs text-grey3 mt-0.5">
              Always posted as External — links out to the original listing
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-grey1 hover:bg-grey5 transition-colors"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-4">
              <p className="font-satoshi font-semibold text-xs text-mainPurple uppercase tracking-widest">
                Basic Info
              </p>
              <div>
                <label className={labelCls}>Company Name *</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. Flutterwave"
                  value={form.company_name}
                  onChange={(e) => set("company_name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Job Title *</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. Senior Product Designer"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>LinkedIn / External URL *</label>
                <input
                  type="url"
                  className={inputCls}
                  // placeholder="https://www.linkedin.com/jobs/view/…"
                  placeholder="https://…"
                  value={form.external_url}
                  onChange={(e) => set("external_url", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="border-t border-grey4/40" />

            <div className="space-y-4">
              <p className="font-satoshi font-semibold text-xs text-mainPurple uppercase tracking-widest">
                Job Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Job Type</label>
                  <select
                    className={inputCls}
                    value={form.job_type}
                    onChange={(e) => set("job_type", e.target.value)}
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Work Mode</label>
                  <select
                    className={inputCls}
                    value={form.work_mode}
                    onChange={(e) => set("work_mode", e.target.value)}
                  >
                    {WORK_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Location</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. Lagos, Nigeria"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Min. Experience (yrs)</label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    placeholder="0"
                    value={form.experience_years_min}
                    onChange={(e) =>
                      set("experience_years_min", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-grey4/40" />

            <div className="space-y-4">
              <p className="font-satoshi font-semibold text-xs text-mainPurple uppercase tracking-widest">
                Salary
              </p>
              <div>
                <label className={labelCls}>Currency</label>
                <select
                  className={inputCls}
                  value={form.salary_currency}
                  onChange={(e) => set("salary_currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Minimum</label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    placeholder="e.g. 200000"
                    value={form.salary_min}
                    onChange={(e) => set("salary_min", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Maximum</label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    placeholder="e.g. 400000"
                    value={form.salary_max}
                    onChange={(e) => set("salary_max", e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => set("salary_visible", !form.salary_visible)}
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                    form.salary_visible
                      ? "bg-mainPurple border-mainPurple"
                      : "bg-white border-grey4"
                  }`}
                >
                  {form.salary_visible && (
                    <FaCheck className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <span className="font-openSans text-sm text-grey1">
                  Show salary on listing
                </span>
              </label>
            </div>

            <div className="border-t border-grey4/40" />

            <div className="space-y-4">
              <p className="font-satoshi font-semibold text-xs text-mainPurple uppercase tracking-widest">
                Content
              </p>
              <div>
                <label className={labelCls}>Job Description</label>
                <textarea
                  rows={6}
                  className={inputCls + " resize-none"}
                  placeholder="Describe the role, responsibilities, and team…"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Requirements</label>
                <textarea
                  rows={4}
                  className={inputCls + " resize-none"}
                  placeholder="List qualifications, skills, or experience needed…"
                  value={form.requirements}
                  onChange={(e) => set("requirements", e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-grey4/40" />

            <div className="space-y-4">
              <p className="font-satoshi font-semibold text-xs text-mainPurple uppercase tracking-widest">
                Meta
              </p>
              <div>
                <label className={labelCls}>
                  Tags{" "}
                  <span className="normal-case font-normal">
                    (comma-separated)
                  </span>
                </label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. React, Node.js, PostgreSQL"
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Application Deadline</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.application_deadline}
                    onChange={(e) =>
                      set("application_deadline", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="h-4" />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-grey4/60 shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-grey4 text-grey1 rounded-lg font-satoshi font-semibold text-sm hover:bg-grey5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Post Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  job,
  onClose,
  onDeleted,
}: {
  job: Job;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Job deleted");
      onDeleted(job.id);
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <p className="font-satoshi font-bold text-lg text-grey1 mb-2">
          Delete this job?
        </p>
        <p className="font-openSans text-sm text-grey3 mb-1">
          <span className="font-semibold text-grey1">{job.title}</span> at{" "}
          {job.company_name}
        </p>
        <p className="font-openSans text-sm text-grey3 mb-6">
          This will remove the listing from the public job board immediately.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-grey4 text-grey1 rounded-lg font-satoshi font-semibold text-sm hover:bg-grey5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {deleting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Job Row ──────────────────────────────────────────────────────────────────

function JobRow({
  job,
  onEdit,
  onDelete,
}: {
  job: Job;
  onEdit: (j: Job) => void;
  onDelete: (j: Job) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-grey4/50 p-4 hover:border-mainPurple/30 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className={`text-[10px] font-satoshi font-semibold px-2 py-0.5 rounded-full ${statusStyle(job.status)}`}
            >
              {statusLabel(job.status)}
            </span>
            <span className="text-[10px] font-satoshi font-semibold px-2 py-0.5 rounded-full text-blue bg-blue/10">
              External
            </span>
          </div>
          <p className="font-satoshi font-bold text-sm text-grey1 mt-1 truncate">
            {job.title}
          </p>
          <p className="font-openSans text-xs text-grey3 mt-0.5">
            {job.company_name}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[11px] font-openSans text-grey3">
              {jobTypeLabel(job.job_type)}
            </span>
            <FaCircle className="w-1 h-1 text-grey4" />
            <span className="text-[11px] font-openSans text-grey3">
              {workModeLabel(job.work_mode)}
            </span>
            {job.location && (
              <>
                <FaCircle className="w-1 h-1 text-grey4" />
                <span className="flex items-center gap-1 text-[11px] font-openSans text-grey3">
                  <FaLocationDot className="w-2.5 h-2.5" /> {job.location}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="font-openSans text-[11px] text-grey3">
            {timeAgo(job.created_at)}
          </p>
          <div className="flex items-center gap-1">
            {job.external_url && (
              <a
                href={job.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-mainPurple hover:bg-lightPurple transition-colors"
                title="View listing"
              >
                <FaArrowUpRightFromSquare className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => onEdit(job)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-mainPurple hover:bg-lightPurple transition-colors"
              title="Edit"
            >
              <FaPen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(job)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export default function JobsManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingJob(null);
    setDrawerOpen(true);
  };
  const openEdit = (job: Job) => {
    setEditingJob(job);
    setDrawerOpen(true);
  };

  const handleSaved = (saved: Job) => {
    setJobs((prev) => {
      const idx = prev.findIndex((j) => j.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setDrawerOpen(false);
  };

  const handleDeleted = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setDeletingJob(null);
  };

  useEffect(() => { setPage(1); }, [filter, search]);

  const byStatus = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);
  const q = search.trim().toLowerCase();
  const filtered = q
    ? byStatus.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.company_name ?? "").toLowerCase().includes(q),
      )
    : byStatus;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    all: jobs.length,
    active: jobs.filter((j) => j.status === "active").length,
    draft: jobs.filter((j) => j.status === "draft").length,
    paused: jobs.filter((j) => j.status === "paused").length,
    archived: jobs.filter((j) => j.status === "archived").length,
  };

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "active", label: `Active (${counts.active})` },
    { key: "draft", label: `Draft (${counts.draft})` },
    { key: "paused", label: `Paused (${counts.paused})` },
    { key: "archived", label: `Archived (${counts.archived})` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-satoshi font-black text-3xl text-grey1">
            External Jobs
          </h1>
          <p className="font-openSans text-sm text-grey3 mt-1">
            Manually curated listings sourced from LinkedIn and other job boards
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
        >
          <FaPlus className="w-3.5 h-3.5" />
          Post Job
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-grey4/50 p-4">
          <p className="font-openSans text-xs text-grey3 mb-1">Total Listed</p>
          <p className="font-satoshi font-black text-3xl text-grey1">
            {counts.all}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-grey4/50 p-4">
          <p className="font-openSans text-xs text-grey3 mb-1">Active</p>
          <p className="font-satoshi font-black text-3xl text-successGreen">
            {counts.active}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-grey4/50 p-4">
          <p className="font-openSans text-xs text-grey3 mb-1">Draft</p>
          <p className="font-satoshi font-black text-3xl text-grey2">
            {counts.draft}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-grey4/50 p-4">
          <p className="font-openSans text-xs text-grey3 mb-1">
            Paused / Archived
          </p>
          <p className="font-satoshi font-black text-3xl text-grey2">
            {counts.paused + counts.archived}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex gap-1 bg-white border border-grey4/50 rounded-xl p-1.5 overflow-x-auto shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-satoshi font-semibold text-xs transition-all whitespace-nowrap ${
                filter === tab.key
                  ? "bg-mainPurple text-white"
                  : "text-grey3 hover:text-grey1 hover:bg-grey5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-56 shrink-0">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or company…"
            className="w-full pl-9 pr-3 py-2 border border-grey4 rounded-lg font-openSans text-sm text-grey1 placeholder:text-grey3 focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple bg-white transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-grey4/50 py-20 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-lightPurple flex items-center justify-center">
            <FaBriefcase className="w-6 h-6 text-mainPurple" />
          </div>
          <p className="font-satoshi font-bold text-lg text-grey1">
            No jobs found
          </p>
          <p className="font-openSans text-sm text-grey3 text-center max-w-xs">
            {q
              ? "No jobs match your search."
              : filter === "all"
                ? "Post your first external job to populate the job board."
                : `No ${filter} jobs at the moment.`}
          </p>
          {q ? (
            <button
              onClick={() => setSearch("")}
              className="mt-1 px-5 py-2 border border-grey4 text-grey1 rounded-lg font-satoshi font-semibold text-sm hover:bg-grey5 transition-colors"
            >
              Clear search
            </button>
          ) : filter === "all" ? (
            <button
              onClick={openCreate}
              className="mt-1 flex items-center gap-2 px-5 py-2.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
            >
              <FaPlus className="w-3.5 h-3.5" />
              Post First Job
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="font-openSans text-sm text-grey3">
              {filtered.length} {filtered.length === 1 ? "job" : "jobs"}
              {totalPages > 1 && (
                <span className="ml-1 text-grey4">· page {page} of {totalPages}</span>
              )}
            </p>
          </div>
          <div className="space-y-3">
            {paginated.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                onEdit={openEdit}
                onDelete={setDeletingJob}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg font-satoshi font-semibold text-sm transition-colors disabled:text-grey4 disabled:pointer-events-none text-grey2 hover:bg-grey5"
              >
                ← Prev
              </button>
              {(totalPages <= 7
                ? Array.from({ length: totalPages }, (_, i) => i + 1)
                : [
                    1,
                    ...(page > 3 ? ["ellipsis" as const] : []),
                    ...Array.from(
                      { length: Math.min(3, totalPages - 2) },
                      (_, i) => Math.max(2, page - 1) + i,
                    ).filter((p) => p > 1 && p < totalPages),
                    ...(page < totalPages - 2 ? ["ellipsis" as const] : []),
                    totalPages,
                  ]
              ).map((p, i) =>
                p === "ellipsis" ? (
                  <span key={`e${i}`} className="px-2 text-grey3 font-openSans text-sm select-none">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg font-satoshi font-semibold text-sm transition-colors ${
                      p === page ? "bg-mainPurple text-white" : "text-grey2 hover:bg-grey5"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg font-satoshi font-semibold text-sm transition-colors disabled:text-grey4 disabled:pointer-events-none text-grey2 hover:bg-grey5"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {drawerOpen && (
        <JobDrawer
          editingJob={editingJob}
          onClose={() => setDrawerOpen(false)}
          onSaved={handleSaved}
        />
      )}
      {deletingJob && (
        <DeleteConfirm
          job={deletingJob}
          onClose={() => setDeletingJob(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
