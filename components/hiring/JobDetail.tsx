"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaBuilding,
  FaLocationDot,
  FaClock,
  FaUsers,
  FaArrowUpRightFromSquare,
  FaXmark,
  FaCheck,
  FaCircleCheck,
  FaBolt,
  FaUser,
  FaFileLines,
  FaGlobe,
  FaTriangleExclamation,
  FaInstagram,
  FaXTwitter,
  FaLinkedin,
} from "react-icons/fa6";
import { createClient } from "@/lib/supabase/client";
import type { Job, Resume } from "@/lib/types";
import { formatSalary } from "@/lib/currencies";

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};
const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
};
const WORK_MODE_COLORS: Record<string, string> = {
  remote: "text-[#16895E] bg-[#E7F6EF]",
  onsite: "text-[#1E5BBF] bg-[#E8EFFB]",
  hybrid: "text-[#5A2DD4] bg-[#F1ECFD]",
};

type ModalStep = "loading" | "no_resumes" | "form" | "success";

interface UserProfile {
  id: string;
  name: string | null;
  title: string | null;
  bio: string | null;
  profile_image_url: string | null;
  email: string | null;
  portfolio_or_website_link: string | null;
}

function initialsOf(name?: string | null): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function FollowModal({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#0F1115]/45 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-[20px] shadow-2xl flex flex-col animate-scaleIn">
        <div className="flex items-center px-6 py-4 border-b border-[#F0EFF4] shrink-0">
          <p className="font-satoshi font-bold text-sm text-[#15131C]">
            Follow Segwae
          </p>
        </div>
        <div className="p-6 flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-[#F1ECFD] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <p className="font-satoshi font-bold text-lg text-[#15131C] text-center mb-1">
            You&apos;re on a roll!
          </p>
          <p className="font-openSans text-sm text-grey3 text-center mb-6">
            Stay updated with the latest jobs and opportunities. Follow us on
            socials — it only takes a second.
          </p>
          <div className="flex flex-col gap-3 mb-6">
            <a
              href="https://www.instagram.com/segwaehq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#EFEEF4] hover:border-pink-400 hover:bg-pink-50 transition-colors group"
            >
              <FaInstagram className="w-5 h-5 text-pink-500 shrink-0" />
              <span className="font-satoshi font-bold text-sm text-[#15131C] group-hover:text-pink-600">
                Instagram
              </span>
              <span className="ml-auto font-openSans text-xs text-[#9098A3]">
                @segwaehq
              </span>
            </a>
            <a
              href="https://x.com/segwaehq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#EFEEF4] hover:border-[#15131C] hover:bg-[#FAFAFB] transition-colors group"
            >
              <FaXTwitter className="w-5 h-5 text-[#15131C] shrink-0" />
              <span className="font-satoshi font-bold text-sm text-[#15131C]">
                X (Twitter)
              </span>
              <span className="ml-auto font-openSans text-xs text-[#9098A3]">
                @segwaehq
              </span>
            </a>
            <a
              href="https://www.linkedin.com/company/segwaehq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#EFEEF4] hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <FaLinkedin className="w-5 h-5 text-[#1E5BBF] shrink-0" />
              <span className="font-satoshi font-bold text-sm text-[#15131C] group-hover:text-[#1E5BBF]">
                LinkedIn
              </span>
              <span className="ml-auto font-openSans text-xs text-[#9098A3]">
                segwaehq
              </span>
            </a>
          </div>
          <button
            onClick={onComplete}
            className="w-full py-3 bg-brand-gradient text-white rounded-[13px] font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
          >
            Continue to application →
          </button>
          <button
            onClick={onComplete}
            className="w-full py-2.5 mt-2 text-[#9098A3] font-openSans text-sm hover:text-[#15131C] transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplyPanel({
  job,
  onClose,
  onSuccess,
}: {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<ModalStep>("loading");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, resumesRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/hiring/resumes"),
        ]);
        const [profileData, resumesData] = await Promise.all([
          profileRes.json(),
          resumesRes.json(),
        ]);

        setProfile(profileData.profile ?? null);
        const r: Resume[] = resumesData.resumes ?? [];
        setResumes(r);
        setSelectedResumeId(
          r.find((x) => x.is_default)?.id ?? r[0]?.id ?? null,
        );

        setStep(r.length === 0 ? "no_resumes" : "form");
      } catch {
        setStep("form");
      }
    };
    init();
  }, []);

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/hiring/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          cover_note: coverNote || undefined,
          resume_id: selectedResumeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "no_resumes") {
          setStep("no_resumes");
          return;
        }
        throw new Error(data.error || "Failed to apply");
      }
      setStep("success");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const companyName = job.companies?.name ?? job.company_name ?? "the company";

  return (
    <div className="fixed inset-0 z-100">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0F1115]/45 backdrop-blur-[2px] animate-fadeIn"
      />
      <div className="absolute top-0 right-0 bottom-0 w-[440px] max-w-[92vw] bg-white shadow-[-20px_0_60px_-20px_rgba(15,17,21,0.4)] animate-slideInRight flex flex-col">
        {/* Success replaces the whole panel */}
        {step === "success" ? (
          <div className="flex flex-col items-center justify-center h-full p-10 text-center">
            <div className="w-[72px] h-[72px] rounded-full bg-brand-gradient flex items-center justify-center shadow-[0_14px_30px_-8px_rgba(74,55,216,0.5)] animate-scaleIn">
              <FaCheck className="w-8 h-8 text-white" />
            </div>
            <p className="font-satoshi font-black text-[21px] tracking-[-0.02em] text-[#15131C] mt-[22px]">
              Application sent!
            </p>
            <p className="font-openSans text-sm leading-relaxed text-grey3 mt-2.5 max-w-[280px]">
              Your profile and resume are on their way to {companyName}. Track
              your progress in Applications.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[280px] mt-[26px]">
              <Link
                href="/dashboard/applications"
                className="w-full py-3.5 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform text-center"
              >
                View my applications
              </Link>
              <button
                onClick={onClose}
                className="w-full py-3 border border-[#E2E1EA] rounded-xl bg-white font-satoshi font-bold text-sm text-[#15131C] hover:border-[#B9B9C6] transition-colors"
              >
                Back to listing
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 py-[18px] border-b border-[#F0EFF4] shrink-0">
              <div className="min-w-0">
                <div className="font-satoshi text-[11px] font-bold tracking-widest uppercase text-[#5A2DD4] mb-1">
                  Apply
                </div>
                <div className="font-satoshi font-bold text-lg text-[#15131C] tracking-[-0.01em] truncate">
                  {job.title}
                </div>
                <div className="font-openSans text-[13px] text-[#9098A3] mt-0.5 truncate">
                  {companyName}
                  {job.location ? ` · ${job.location}` : ""}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-[34px] h-[34px] rounded-[9px] bg-[#F4F3F7] flex items-center justify-center text-[#6B6478] hover:bg-[#ECEAF2] transition-colors shrink-0"
              >
                <FaXmark className="w-4 h-4" />
              </button>
            </div>

            {/* Loading */}
            {step === "loading" && (
              <div className="flex items-center justify-center flex-1">
                <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* No resumes */}
            {step === "no_resumes" && (
              <div className="flex-1 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#FEF4E6] flex items-center justify-center mx-auto mb-5">
                  <FaTriangleExclamation className="w-7 h-7 text-[#E0921F]" />
                </div>
                <p className="font-satoshi font-bold text-xl text-[#15131C] mb-2">
                  Add a resume first
                </p>
                <p className="font-openSans text-sm text-grey3 mb-8 leading-relaxed">
                  You need at least one resume on your profile before you can
                  apply. Upload one in your dashboard settings — it only takes a
                  minute.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard/resumes"
                    className="w-full py-3 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform text-center"
                    onClick={onClose}
                  >
                    Go to Resume Manager
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full py-3 border border-[#E2E1EA] text-[#15131C] rounded-xl font-satoshi font-bold text-sm hover:bg-[#FAFAFB] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Application form */}
            {step === "form" && (
              <div className="flex-1 overflow-y-auto p-6">
                {/* Profile preview */}
                {profile && (
                  <div className="flex items-center gap-3 p-[15px] rounded-[14px] bg-[#FAFAFB] border border-[#EFEEF4]">
                    <div className="w-[46px] h-[46px] rounded-full p-[2.5px] bg-brand-gradient shrink-0">
                      <div className="w-full h-full rounded-full border-2 border-[#FAFAFB] bg-[#F1F0F6] overflow-hidden flex items-center justify-center">
                        {profile.profile_image_url ? (
                          <Image
                            src={profile.profile_image_url}
                            alt={profile.name ?? ""}
                            width={46}
                            height={46}
                            className="object-cover w-full h-full"
                          />
                        ) : initialsOf(profile.name) ? (
                          <span className="font-satoshi font-black text-[15px] text-[#5A2DD4]">
                            {initialsOf(profile.name)}
                          </span>
                        ) : (
                          <FaUser className="w-5 h-5 text-[#9098A3]" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-satoshi font-bold text-[14.5px] text-[#15131C] truncate">
                        {profile.name}
                      </p>
                      <p className="font-openSans text-[12.5px] text-[#9098A3]">
                        Your Segwae profile will be shared
                      </p>
                    </div>
                    <FaCheck className="w-[18px] h-[18px] text-[#16895E] shrink-0" />
                  </div>
                )}

                {profile?.portfolio_or_website_link && (
                  <a
                    href={profile.portfolio_or_website_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-satoshi font-bold text-[#5A2DD4] hover:opacity-70 transition-opacity"
                  >
                    <FaGlobe className="w-3 h-3" /> Portfolio
                  </a>
                )}

                {/* Resume picker */}
                <div className="font-satoshi text-[13px] font-bold text-[#15131C] mt-[22px] mb-[9px]">
                  Resume / CV
                </div>
                {resumes.length === 1 ? (
                  <div className="flex items-center gap-3 p-3 rounded-[13px] border-[1.5px] border-[#5A2DD4] bg-[#F1ECFD]">
                    <FaFileLines className="w-4 h-4 text-[#5A2DD4] shrink-0" />
                    <span className="font-satoshi font-bold text-sm text-[#5A2DD4]">
                      {resumes[0].label}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedResumeId(r.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-[13px] border-[1.5px] text-left transition-all ${
                          selectedResumeId === r.id
                            ? "border-[#5A2DD4] bg-[#F1ECFD]"
                            : "border-[#E2E1EA] hover:border-[#A98BE8]"
                        }`}
                      >
                        <FaFileLines
                          className={`w-4 h-4 shrink-0 ${selectedResumeId === r.id ? "text-[#5A2DD4]" : "text-[#9098A3]"}`}
                        />
                        <span
                          className={`font-satoshi font-bold text-sm ${selectedResumeId === r.id ? "text-[#5A2DD4]" : "text-[#15131C]"}`}
                        >
                          {r.label}
                        </span>
                        {r.is_default && (
                          <span className="ml-auto text-[10px] font-bold text-[#9098A3] font-satoshi">
                            Default
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Cover note */}
                <div className="font-satoshi text-[13px] font-bold text-[#15131C] mt-[22px] mb-[9px]">
                  Note to the team{" "}
                  <span className="font-medium text-[#9098A3]">· optional</span>
                </div>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value.slice(0, 300))}
                  rows={4}
                  placeholder="A sentence on why you're a great fit…"
                  className="w-full px-3.5 py-[13px] border border-[#E2E1EA] rounded-[13px] focus:outline-none focus:border-[#A98BE8] font-openSans text-sm leading-relaxed text-[#15131C] placeholder:text-[#9098A3] bg-white transition-colors resize-y min-h-24"
                />
                <p className="mt-1 text-xs text-[#9098A3] font-openSans tabular-nums text-right">
                  {coverNote.length}/300
                </p>
              </div>
            )}

            {/* Submit footer */}
            {step === "form" && (
              <div className="px-6 py-[18px] border-t border-[#F0EFF4] shrink-0">
                <button
                  onClick={submitApplication}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-gradient text-white rounded-[13px] font-satoshi font-bold text-[15px] shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-transform"
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {submitting ? "Submitting…" : "Submit application"}
                </button>
                <div className="text-center text-xs font-openSans text-[#9098A3] mt-[11px]">
                  {companyName} will see your Segwae profile &amp; resume
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function JobDetail({ job }: { job: Job }) {
  const [authUser, setAuthUser] = useState<{ id: string } | null | undefined>(
    undefined,
  );
  const [existingApp, setExistingApp] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [pendingExternalUrl, setPendingExternalUrl] = useState<string | null>(
    null,
  );

  const handleApplyClick = async () => {
    try {
      const res = await fetch("/api/hiring/applications?today_count=true");
      const data = await res.json();
      const totalNext = (data.total_count ?? 0) + 1;
      const hasSeenFollow =
        localStorage.getItem("segwae_follow_prompted") === "true";

      if (totalNext === 7 && !hasSeenFollow) {
        setFollowModalOpen(true);
      } else {
        setModalOpen(true);
      }
    } catch {
      setModalOpen(true);
    }
  };

  const handleExternalClick = (url: string) => {
    const hasSeenFollow =
      localStorage.getItem("segwae_follow_prompted") === "true";

    if (!hasSeenFollow) {
      const prevCount = parseInt(
        localStorage.getItem("segwae_external_clicks") ?? "0",
        10,
      );
      const newCount = prevCount + 1;
      localStorage.setItem("segwae_external_clicks", String(newCount));

      if (newCount >= 5) {
        setPendingExternalUrl(url);
        setFollowModalOpen(true);
        return;
      }
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setAuthUser(user ?? null);

        if (user) {
          const checkRes = await fetch(
            `/api/hiring/applications?check_job_id=${job.id}`,
          );
          const checkData = await checkRes.json();
          setExistingApp(checkData.application);
        }
      } catch {
        setAuthUser(null);
      }
    };
    fetchUser();
  }, [job.id]);

  const company = job.companies;
  const companyName = company?.name ?? job.company_name ?? null;
  const companyInitials = initialsOf(companyName);
  const salary = job.salary_visible
    ? formatSalary(job.salary_min, job.salary_max, job.salary_currency)
    : null;
  const postedLabel = new Date(job.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const applicantCount = job.application_count ?? 0;

  const renderCTA = () => {
    if (job.posting_mode === "external") {
      return (
        <button
          onClick={() => handleExternalClick(job.external_url!)}
          className="w-full flex items-center justify-center gap-2 py-[15px] bg-brand-gradient text-white rounded-[13px] font-satoshi font-bold text-[15px] shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
        >
          Apply on company website{" "}
          <FaArrowUpRightFromSquare className="w-3 h-3" />
        </button>
      );
    }

    if (authUser === undefined) return null;

    if (!authUser) {
      return (
        <Link
          href={`/login?redirect=/jobs/${job.id}`}
          className="w-full flex items-center justify-center py-[15px] bg-brand-gradient text-white rounded-[13px] font-satoshi font-bold text-[15px] shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
        >
          Log in to apply
        </Link>
      );
    }

    if (existingApp) {
      return (
        <div className="w-full flex items-center justify-center gap-2 py-[15px] bg-[#E7F6EF] text-[#16895E] rounded-[13px] font-satoshi font-bold text-[15px] cursor-default">
          <FaCheck className="w-3.5 h-3.5" /> Applied
        </div>
      );
    }

    if (job.status !== "active") {
      return (
        <div className="w-full flex items-center justify-center py-[15px] bg-[#F3F3F7] text-[#9098A3] rounded-[13px] font-satoshi font-bold text-[15px] cursor-default">
          Applications closed
        </div>
      );
    }

    if (
      job.application_deadline &&
      new Date(job.application_deadline) < new Date()
    ) {
      return (
        <div className="w-full flex items-center justify-center py-[15px] bg-[#F3F3F7] text-[#9098A3] rounded-[13px] font-satoshi font-bold text-[15px] cursor-default">
          Application deadline has passed
        </div>
      );
    }

    return (
      <button
        onClick={handleApplyClick}
        className="w-full flex items-center justify-center gap-2 py-[15px] bg-brand-gradient text-white rounded-[13px] font-satoshi font-bold text-[15px] shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
      >
        <FaArrowUpRightFromSquare className="w-[15px] h-[15px] rotate-90" />
        Apply with Segwae profile
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      {/* Dark top bar (shared header is hidden on this route) */}
      <div className="bg-[#0F1115] px-6 py-4">
        <div className="max-w-[1100px] mx-auto">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white/55 hover:text-white font-satoshi transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" /> All jobs
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-[9px] mb-5 flex-wrap">
          <Link
            href="/jobs"
            className="font-satoshi text-[13px] font-semibold text-[#9098A3] hover:text-[#5A2DD4] transition-colors"
          >
            Jobs
          </Link>
          <span className="text-[#C2C6CF] text-xs">›</span>
          <span className="font-satoshi text-[13px] font-bold text-[#5A2DD4] truncate max-w-[60vw]">
            {job.title}
          </span>
        </div>

        {/* Hero card */}
        <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-7 mb-5">
          <div className="flex items-start gap-[18px]">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F1F0F6] flex items-center justify-center shrink-0">
              {company?.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={company.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : companyInitials ? (
                <span className="font-satoshi font-black text-lg text-[#5A2DD4]">
                  {companyInitials}
                </span>
              ) : (
                <FaBuilding className="w-6 h-6 text-[#5A2DD4]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-satoshi font-black text-[clamp(1.6rem,2.6vw,2.1rem)] tracking-[-0.025em] leading-[1.1] text-[#15131C]">
                {job.title}
              </h1>
              <div className="flex items-center gap-2.5 mt-[7px] flex-wrap">
                {companyName && (
                  <span className="font-satoshi text-[15px] font-bold text-[#374151]">
                    {companyName}
                  </span>
                )}
                {companyName && job.location && (
                  <span className="w-1 h-1 rounded-full bg-[#C2C6CF]" />
                )}
                {job.location && (
                  <span className="font-satoshi text-sm font-medium text-[#9098A3] inline-flex items-center gap-1.5">
                    <FaLocationDot className="w-[13px] h-[13px]" />
                    {job.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-[18px]">
            <span
              className={`text-[11px] font-bold font-satoshi px-[11px] py-[5px] rounded-[7px] ${WORK_MODE_COLORS[job.work_mode]}`}
            >
              {WORK_MODE_LABELS[job.work_mode]}
            </span>
            <span className="text-[11px] font-bold font-satoshi px-[11px] py-[5px] rounded-[7px] text-grey3 bg-[#F3F3F7]">
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
            {job.posting_mode === "external" ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-satoshi px-[11px] py-[5px] rounded-[7px] text-[#16895E] bg-[#E7F6EF]">
                <FaCircleCheck className="w-3 h-3" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-satoshi px-[11px] py-[5px] rounded-[7px] text-[#5A2DD4] bg-[#F1ECFD]">
                <FaBolt className="w-3 h-3" />
                Direct
              </span>
            )}
          </div>
        </div>

        {/* Two column */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-5 lg:items-start">
          {/* Main */}
          <div className="flex flex-col gap-5">
            {/* About the role */}
            <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-7">
              <h2 className="font-satoshi font-bold text-lg text-[#15131C] tracking-[-0.01em] mb-3">
                About the role
              </h2>
              <div className="font-openSans text-[15px] leading-[1.7] font-medium text-[#4B4658] whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-7">
                <h2 className="font-satoshi font-bold text-lg text-[#15131C] tracking-[-0.01em] mb-3">
                  What we&apos;re looking for
                </h2>
                <div className="font-openSans text-[15px] leading-[1.7] font-medium text-[#4B4658] whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-satoshi font-semibold text-[#4B4658] bg-[#F6F5FA] border border-[#ECECF1] px-3 py-1.5 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Company info */}
            {(company || job.company_name) && (
              <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-7">
                <h2 className="font-satoshi font-bold text-lg text-[#15131C] tracking-[-0.01em] mb-4">
                  About {companyName}
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F1F0F6] flex items-center justify-center shrink-0">
                    {company?.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : companyInitials ? (
                      <span className="font-satoshi font-black text-sm text-[#5A2DD4]">
                        {companyInitials}
                      </span>
                    ) : (
                      <FaBuilding className="w-5 h-5 text-[#5A2DD4]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-satoshi font-bold text-sm text-[#15131C]">
                      {companyName}
                    </p>
                    {company && (
                      <>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {company.industry && (
                            <span className="font-openSans text-xs text-[#9098A3]">
                              {company.industry}
                            </span>
                          )}
                          {company.size && (
                            <span className="font-openSans text-xs text-[#9098A3]">
                              {company.size} employees
                            </span>
                          )}
                          {company.location && (
                            <span className="font-openSans text-xs text-[#9098A3]">
                              {company.location}
                            </span>
                          )}
                        </div>
                        {company.description && (
                          <p className="font-openSans text-sm leading-relaxed text-[#4B4658] mt-3">
                            {company.description}
                          </p>
                        )}
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 text-xs font-satoshi font-bold text-[#5A2DD4] hover:opacity-70 transition-opacity"
                          >
                            <FaGlobe className="w-3 h-3" /> {company.website}
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile CTA */}
            <div className="lg:hidden">{renderCTA()}</div>
          </div>

          {/* Sidebar (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-6 flex flex-col gap-4">
              {/* Apply / salary card */}
              <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-[22px] shadow-[0_14px_34px_-22px_rgba(31,18,72,0.3)]">
                {salary ? (
                  <>
                    <div className="font-satoshi text-[13px] font-semibold text-[#9098A3] mb-1">
                      Salary range
                    </div>
                    <div className="font-satoshi font-black text-2xl tracking-[-0.02em] text-[#15131C]">
                      {salary}
                    </div>
                    <div className="font-openSans text-[13px] font-medium text-[#9098A3] mt-0.5">
                      per year
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-satoshi text-[13px] font-semibold text-[#9098A3] mb-1">
                      Apply for this role
                    </div>
                    <div className="font-satoshi font-black text-lg tracking-[-0.01em] text-[#15131C] leading-snug">
                      {job.title}
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-px my-5 bg-[#F1F1F5] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-3 bg-white">
                    <span className="font-satoshi text-[13px] font-medium text-[#9098A3]">
                      Location
                    </span>
                    <span className="font-satoshi text-[13px] font-bold text-[#15131C] truncate ml-3 text-right">
                      {job.location || WORK_MODE_LABELS[job.work_mode]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-3 bg-white">
                    <span className="font-satoshi text-[13px] font-medium text-[#9098A3]">
                      Type
                    </span>
                    <span className="font-satoshi text-[13px] font-bold text-[#15131C]">
                      {JOB_TYPE_LABELS[job.job_type]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-3 bg-white">
                    <span className="font-satoshi text-[13px] font-medium text-[#9098A3]">
                      Experience
                    </span>
                    <span className="font-satoshi text-[13px] font-bold text-[#15131C]">
                      {job.experience_years_min > 0
                        ? `${job.experience_years_min}+ years`
                        : "Open to all"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-3 bg-white">
                    <span className="font-satoshi text-[13px] font-medium text-[#9098A3]">
                      Posted
                    </span>
                    <span className="font-satoshi text-[13px] font-bold text-[#15131C]">
                      {postedLabel}
                    </span>
                  </div>
                </div>

                {renderCTA()}

                {job.posting_mode === "internal" && (
                  <div className="flex items-center justify-center gap-[7px] mt-3.5 font-satoshi text-[12.5px] font-medium text-[#9098A3]">
                    <FaUsers className="w-3.5 h-3.5" />
                    {applicantCount > 0
                      ? `${applicantCount} ${applicantCount === 1 ? "person has" : "people have"} applied`
                      : "Be the first to apply"}
                  </div>
                )}

                {job.application_deadline && (
                  <div className="flex items-center justify-center gap-[7px] mt-2.5 font-openSans text-[12px] text-[#9098A3]">
                    <FaClock className="w-3 h-3" />
                    Closes{" "}
                    {new Date(job.application_deadline).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {followModalOpen && (
        <FollowModal
          onComplete={() => {
            localStorage.setItem("segwae_follow_prompted", "true");
            setFollowModalOpen(false);
            if (pendingExternalUrl) {
              window.open(pendingExternalUrl, "_blank", "noopener,noreferrer");
              setPendingExternalUrl(null);
            } else {
              setModalOpen(true);
            }
          }}
        />
      )}
      {modalOpen && (
        <ApplyPanel
          job={job}
          onClose={() => setModalOpen(false)}
          onSuccess={() => setExistingApp({ id: "pending", status: "applied" })}
        />
      )}
    </div>
  );
}
