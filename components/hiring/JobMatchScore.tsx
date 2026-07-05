"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaGaugeHigh, FaWandMagicSparkles, FaArrowRight } from "react-icons/fa6";
import type { Job } from "@/lib/types";

type Score = {
  score: number;
  verdict: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
};

type ResumeOpt = { id: string; label: string; file_url: string; is_default?: boolean };

type State = "idle" | "loading" | "done" | "error";

/**
 * Free conversion hook shown on the job detail page: scores the job against a
 * resume the user chooses (Match Score / Haiku, ungated) and funnels into the paid
 * Tailor via "?job=<id>". Rendered only for logged-in users.
 */
export function JobMatchScore({ job }: { job: Job }) {
  const [resumes, setResumes] = useState<ResumeOpt[] | null>(null); // null = still loading
  const [selectedId, setSelectedId] = useState<string>("");
  const [state, setState] = useState<State>("idle");
  const [score, setScore] = useState<Score | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hiring/resumes")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list: ResumeOpt[] = d?.resumes ?? [];
        setResumes(list);
        const def = list.find((x) => x.is_default) ?? list[0];
        if (def) setSelectedId(def.id);
      })
      .catch(() => setResumes([]));
  }, []);

  const run = async () => {
    const pick = resumes?.find((x) => x.id === selectedId) ?? resumes?.[0];
    if (!pick) return;
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/ai/match-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.companies?.name ?? job.company_name ?? undefined,
          jobDescription: [job.description, job.requirements]
            .filter(Boolean)
            .join("\n\n"),
          resumeFileUrl: pick.file_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "Could not score");
      setScore(data.result as Score);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const tailorHref = `/dashboard/ai-tools?job=${job.id}`;
  const selectClass =
    "w-full sm:w-auto rounded-[13px] border border-[#E2E1EA] dark:border-line bg-white dark:bg-surface-sunken px-3 py-2.5 font-satoshi text-sm font-bold text-[#15131C] dark:text-content focus:border-[#A98BE8] dark:focus:border-[#6a4fb0] focus:outline-none";

  // ── Result ──────────────────────────────────────────────────────────────────
  if (state === "done" && score) {
    return (
      <div className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F1ECFD] dark:bg-[#221b36] flex items-center justify-center shrink-0 font-satoshi font-black text-xl text-[#5A2DD4] dark:text-[#b9a4f7]">
            {score.score}%
          </div>
          <div className="min-w-0">
            <p className="font-satoshi font-bold text-[15px] text-[#15131C] dark:text-content">Your match</p>
            <p className="font-openSans text-sm text-[#4B4658] dark:text-content-muted">{score.verdict}</p>
          </div>
        </div>

        {score.gaps?.length > 0 && (
          <div className="mt-4">
            <p className="font-satoshi text-[11px] font-bold uppercase tracking-widest text-[#9098A3] dark:text-content-subtle mb-1.5">
              Gaps to close
            </p>
            <ul className="space-y-1 font-openSans text-sm text-[#4B4658] dark:text-content-muted">
              {score.gaps.slice(0, 4).map((g, i) => (
                <li key={i}>• {g}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-5">
          <Link
            href={tailorHref}
            className="inline-flex items-center gap-2 rounded-[13px] bg-brand-gradient px-5 py-3 font-satoshi text-sm font-bold text-white shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
          >
            <FaWandMagicSparkles className="w-4 h-4" />
            Tailor my resume to fix these
            <FaArrowRight className="w-3 h-3" />
          </Link>
          {resumes && resumes.length > 1 && (
            <button
              onClick={() => {
                setScore(null);
                setState("idle");
              }}
              className="font-openSans text-xs text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content transition-colors"
            >
              Score a different resume
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── No resume on file ─────────────────────────────────────────────────────────
  if (resumes !== null && resumes.length === 0) {
    return (
      <div className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F1ECFD] dark:bg-[#221b36] flex items-center justify-center shrink-0">
            <FaGaugeHigh className="w-5 h-5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
          </div>
          <div>
            <p className="font-satoshi font-bold text-[15px] text-[#15131C] dark:text-content">
              Add a resume to see your match
            </p>
            <p className="font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">
              You need a saved PDF resume on your profile first.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/resumes"
          className="shrink-0 inline-flex items-center justify-center rounded-[13px] border border-[#E2E1EA] dark:border-line px-4 py-2.5 font-satoshi text-sm font-bold text-[#15131C] dark:text-content hover:bg-[#FAFAFB] dark:hover:bg-white/[0.04] transition-colors"
        >
          Resume Manager
        </Link>
      </div>
    );
  }

  // ── Idle / picker ─────────────────────────────────────────────────────────────
  const loadingResumes = resumes === null;

  return (
    <div className="bg-white dark:bg-surface-raised border border-[#E8E8EF] dark:border-line rounded-[18px] p-6 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#F1ECFD] dark:bg-[#221b36] flex items-center justify-center shrink-0">
          <FaGaugeHigh className="w-5 h-5 text-[#5A2DD4] dark:text-[#b9a4f7]" />
        </div>
        <div>
          <p className="font-satoshi font-bold text-[15px] text-[#15131C] dark:text-content">See how well you match</p>
          <p className="font-openSans text-[13px] text-[#9098A3] dark:text-content-subtle">
            {state === "error" ? error : "Free AI match score against your resume."}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
        {resumes && resumes.length > 1 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className={selectClass}
            aria-label="Choose a resume"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={run}
          disabled={state === "loading" || loadingResumes}
          className="inline-flex items-center justify-center gap-2 rounded-[13px] bg-brand-gradient px-5 py-2.5 font-satoshi text-sm font-bold text-white shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0 transition-transform"
        >
          {state === "loading" && (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loadingResumes
            ? "Loading…"
            : state === "loading"
              ? "Checking…"
              : state === "error"
                ? "Try again"
                : "Check my match for free"}
        </button>
      </div>
    </div>
  );
}
