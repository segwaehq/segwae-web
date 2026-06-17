"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaBuilding,
  FaLocationDot,
  FaBriefcase,
  FaClock,
  FaUsers,
  FaArrowUpRightFromSquare,
  FaXmark,
  FaCheck,
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
  remote: "text-successGreen bg-successGreen/10",
  onsite: "text-blue bg-blue/10",
  hybrid: "text-mainPurple bg-lightPurple",
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

function AdUnit({ slot }: { slot: string }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {}
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-4398584928051251"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

function FollowModal({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col animate-scaleIn">
        <div className="flex items-center px-6 py-4 border-b border-grey4/60 shrink-0">
          <p className="font-satoshi font-semibold text-sm text-grey1">
            Follow Segwae
          </p>
        </div>
        <div className="p-6 flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-lightPurple flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <p className="font-satoshi font-bold text-lg text-grey1 text-center mb-1">
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-grey4/60 hover:border-pink-400 hover:bg-pink-50 transition-colors group"
            >
              <FaInstagram className="w-5 h-5 text-pink-500 shrink-0" />
              <span className="font-satoshi font-semibold text-sm text-grey1 group-hover:text-pink-600">
                Instagram
              </span>
              <span className="ml-auto font-openSans text-xs text-grey3">
                @segwaehq
              </span>
            </a>
            <a
              href="https://x.com/segwaehq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-grey4/60 hover:border-grey1 hover:bg-grey5 transition-colors group"
            >
              <FaXTwitter className="w-5 h-5 text-grey1 shrink-0" />
              <span className="font-satoshi font-semibold text-sm text-grey1">
                X (Twitter)
              </span>
              <span className="ml-auto font-openSans text-xs text-grey3">
                @segwaehq
              </span>
            </a>
            <a
              href="https://www.linkedin.com/company/segwaehq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-grey4/60 hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <FaLinkedin className="w-5 h-5 text-blue shrink-0" />
              <span className="font-satoshi font-semibold text-sm text-grey1 group-hover:text-blue">
                LinkedIn
              </span>
              <span className="ml-auto font-openSans text-xs text-grey3">
                segwaehq
              </span>
            </a>
          </div>
          <button
            onClick={onComplete}
            className="w-full py-3 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
          >
            Continue to application →
          </button>
          <button
            onClick={onComplete}
            className="w-full py-2.5 mt-2 text-grey3 font-openSans text-sm hover:text-grey1 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplyModal({
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

  const stepTitle = {
    loading: "Preparing…",
    no_resumes: "Resume required",
    form: "Apply with Segwae",
    success: "Application sent!",
  }[step];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey4/60 shrink-0">
          <p className="font-satoshi font-semibold text-sm text-grey1">
            {stepTitle}
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-grey3 hover:text-grey1 hover:bg-grey5 transition-colors"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        {/* Loading */}
        {step === "loading" && (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No resumes */}
        {step === "no_resumes" && (
          <div className="p-8 text-center flex-1">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <FaTriangleExclamation className="w-7 h-7 text-amber-500" />
            </div>
            <p className="font-satoshi font-bold text-xl text-grey1 mb-2">
              Add a resume first
            </p>
            <p className="font-openSans text-sm text-grey3 mb-8">
              You need at least one resume on your profile before you can apply.
              Upload one in your dashboard settings — it only takes a minute.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/resumes"
                className="w-full py-3 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors text-center"
                onClick={onClose}
              >
                Go to Resume Manager
              </Link>
              <button
                onClick={onClose}
                className="w-full py-3 border border-grey4 text-grey1 rounded-lg font-satoshi font-semibold text-sm hover:bg-grey5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Application form */}
        {step === "form" && (
          <div className="flex-1 overflow-y-auto">
            {/* Profile preview */}
            {profile && (
              <div className="px-6 py-5 border-b border-grey4/60 bg-grey6/50">
                <p className="font-satoshi font-semibold text-xs text-grey3 uppercase tracking-wide mb-3">
                  HR will see your Segwae profile
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-grey5 flex items-center justify-center shrink-0">
                    {profile.profile_image_url ? (
                      <Image
                        src={profile.profile_image_url}
                        alt={profile.name ?? ""}
                        width={44}
                        height={44}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <FaUser className="w-5 h-5 text-grey3" />
                    )}
                  </div>
                  <div>
                    <p className="font-satoshi font-semibold text-sm text-grey1">
                      {profile.name}
                    </p>
                    {profile.title && (
                      <p className="font-openSans text-xs text-grey3">
                        {profile.title}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  {profile.portfolio_or_website_link && (
                    <a
                      href={profile.portfolio_or_website_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-satoshi font-semibold text-mainPurple hover:opacity-70 transition-opacity"
                    >
                      <FaGlobe className="w-3 h-3" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Resume picker */}
            <div className="px-6 py-5 border-b border-grey4/60">
              <p className="font-satoshi font-semibold text-xs text-grey3 uppercase tracking-wide mb-3">
                Resume
              </p>
              {resumes.length === 1 ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-mainPurple bg-lightPurple">
                  <FaFileLines className="w-4 h-4 text-mainPurple shrink-0" />
                  <span className="font-satoshi font-semibold text-sm text-mainPurple">
                    {resumes[0].label}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {resumes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedResumeId(r.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                        selectedResumeId === r.id
                          ? "border-mainPurple bg-lightPurple"
                          : "border-grey4/60 hover:border-grey3"
                      }`}
                    >
                      <FaFileLines
                        className={`w-4 h-4 shrink-0 ${selectedResumeId === r.id ? "text-mainPurple" : "text-grey3"}`}
                      />
                      <span
                        className={`font-satoshi font-semibold text-sm ${selectedResumeId === r.id ? "text-mainPurple" : "text-grey1"}`}
                      >
                        {r.label}
                      </span>
                      {r.is_default && (
                        <span className="ml-auto text-[10px] font-semibold text-grey3 font-satoshi">
                          Default
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cover note */}
            <div className="px-6 py-5">
              <label className="block font-satoshi font-semibold text-xs text-grey3 uppercase tracking-wide mb-2">
                Cover Note{" "}
                <span className="normal-case text-grey3 font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value.slice(0, 300))}
                rows={4}
                placeholder="Briefly introduce yourself and why you're a great fit…"
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-grey3 font-openSans tabular-nums text-right">
                {coverNote.length}/300
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="p-8 text-center flex-1">
            <div className="w-16 h-16 rounded-full bg-successGreen/10 flex items-center justify-center mx-auto mb-5">
              <FaCheck className="w-7 h-7 text-successGreen" />
            </div>
            <p className="font-satoshi font-bold text-2xl text-grey1 mb-2">
              Application sent!
            </p>
            <p className="font-openSans text-sm text-grey3 mb-8">
              Your Segwae profile has been shared with{" "}
              {job.companies?.name ?? job.company_name ?? "the company"}. Track
              your progress in Applications.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/applications"
                className="w-full py-3 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors text-center"
              >
                View my applications
              </Link>
              <button
                onClick={onClose}
                className="w-full py-3 border border-grey4 text-grey1 rounded-lg font-satoshi font-semibold text-sm hover:bg-grey5 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Submit footer */}
        {step === "form" && (
          <div className="px-6 py-4 border-t border-grey4/60 shrink-0">
            <button
              onClick={submitApplication}
              disabled={submitting}
              className="w-full py-3.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
          </div>
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
  const salary = job.salary_visible
    ? formatSalary(job.salary_min, job.salary_max, job.salary_currency)
    : null;

  const renderCTA = () => {
    if (job.posting_mode === "external") {
      return (
        <button
          onClick={() => handleExternalClick(job.external_url!)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
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
          className="w-full flex items-center justify-center py-3.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
        >
          Log in to apply
        </Link>
      );
    }

    if (existingApp) {
      return (
        <div className="w-full flex items-center justify-center gap-2 py-3.5 bg-successGreen/10 text-successGreen rounded-lg font-satoshi font-semibold text-sm cursor-default">
          <FaCheck className="w-3.5 h-3.5" /> Applied
        </div>
      );
    }

    if (job.status !== "active") {
      return (
        <div className="w-full flex items-center justify-center py-3.5 bg-grey5 text-grey3 rounded-lg font-satoshi font-semibold text-sm cursor-default">
          Applications closed
        </div>
      );
    }

    if (
      job.application_deadline &&
      new Date(job.application_deadline) < new Date()
    ) {
      return (
        <div className="w-full flex items-center justify-center py-3.5 bg-grey5 text-grey3 rounded-lg font-satoshi font-semibold text-sm cursor-default">
          Application deadline has passed
        </div>
      );
    }

    return (
      <button
        onClick={handleApplyClick}
        className="w-full py-3.5 bg-mainPurple text-white rounded-lg font-satoshi font-semibold text-sm hover:bg-[#4338CA] transition-colors"
      >
        Apply with Segwae profile
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-grey6">
      <div className="bg-[#111827] px-5 py-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white font-satoshi transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" /> All jobs
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
          <div className="space-y-6">
            {/* Job header */}
            <div className="bg-white rounded-2xl border border-grey4/60 p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-grey5 flex items-center justify-center shrink-0">
                  {company?.logo_url ? (
                    <Image
                      src={company.logo_url}
                      alt={company.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FaBuilding className="w-6 h-6 text-grey3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-satoshi font-bold text-2xl text-grey1">
                    {job.title}
                  </h1>
                  <p className="font-openSans text-sm text-grey2 mt-0.5">
                    {company?.name ?? job.company_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 flex-wrap">
                <span
                  className={`text-[11px] font-semibold font-satoshi px-2.5 py-1 rounded-full ${WORK_MODE_COLORS[job.work_mode]}`}
                >
                  {WORK_MODE_LABELS[job.work_mode]}
                </span>
                <span className="text-[11px] font-semibold font-satoshi px-2.5 py-1 rounded-full text-grey2 bg-grey5">
                  {JOB_TYPE_LABELS[job.job_type]}
                </span>
                {job.posting_mode === "external" && (
                  <span className="text-[11px] font-semibold font-satoshi px-2.5 py-1 rounded-full text-blue bg-blue/10">
                    External listing
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-grey4/40">
                {job.location && (
                  <div>
                    <p className="font-satoshi text-[11px] font-semibold text-grey3 mb-1 flex items-center gap-1">
                      <FaLocationDot className="w-3 h-3" /> Location
                    </p>
                    <p className="font-openSans text-sm text-grey1">
                      {job.location}
                    </p>
                  </div>
                )}
                <div>
                  <p className="font-satoshi text-[11px] font-semibold text-grey3 mb-1 flex items-center gap-1">
                    <FaBriefcase className="w-3 h-3" /> Experience
                  </p>
                  <p className="font-openSans text-sm text-grey1">
                    {job.experience_years_min > 0
                      ? `${job.experience_years_min}+ years`
                      : "Open to all"}
                  </p>
                </div>
                {salary && (
                  <div>
                    <p className="font-satoshi text-[11px] font-semibold text-grey3 mb-1">
                      Salary
                    </p>
                    <p className="font-openSans text-sm text-grey1">{salary}</p>
                  </div>
                )}
                {job.posting_mode === "internal" && (
                  <div>
                    <p className="font-satoshi text-[11px] font-semibold text-grey3 mb-1 flex items-center gap-1">
                      <FaUsers className="w-3 h-3" /> Applicants
                    </p>
                    <p className="font-openSans text-sm text-grey1">
                      {job.application_count ?? 0}
                    </p>
                  </div>
                )}
              </div>

              {job.application_deadline && (
                <div className="mt-4 flex items-center gap-2 text-xs font-openSans text-grey3">
                  <FaClock className="w-3 h-3" />
                  Deadline:{" "}
                  {new Date(job.application_deadline).toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-grey4/60 p-6">
              <h2 className="font-satoshi font-semibold text-grey1 mb-4">
                Job Description
              </h2>
              <div className="font-openSans text-sm text-grey1 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* In-article ad */}
            <div className="bg-white rounded-2xl border border-grey4/60 p-4">
              <p className="font-satoshi text-[10px] font-semibold text-grey4 uppercase tracking-widest mb-3 text-center">
                Advertisement
              </p>
              <AdUnit slot="8703773096" />
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-2xl border border-grey4/60 p-6">
                <h2 className="font-satoshi font-semibold text-grey1 mb-4">
                  Requirements
                </h2>
                <div className="font-openSans text-sm text-grey1 leading-relaxed whitespace-pre-wrap">
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
                    className="text-xs font-openSans text-grey2 bg-white border border-grey4/60 px-3 py-1.5 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Company info */}
            {(company || job.company_name) && (
              <div className="bg-white rounded-2xl border border-grey4/60 p-6">
                <h2 className="font-satoshi font-semibold text-grey1 mb-4">
                  About {company?.name ?? job.company_name}
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-grey5 flex items-center justify-center shrink-0">
                    {company?.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <FaBuilding className="w-5 h-5 text-grey3" />
                    )}
                  </div>
                  <div>
                    <p className="font-satoshi font-semibold text-sm text-grey1">
                      {company?.name ?? job.company_name}
                    </p>
                    {company && (
                      <>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {company.industry && (
                            <span className="font-openSans text-xs text-grey3">
                              {company.industry}
                            </span>
                          )}
                          {company.size && (
                            <span className="font-openSans text-xs text-grey3">
                              {company.size} employees
                            </span>
                          )}
                          {company.location && (
                            <span className="font-openSans text-xs text-grey3">
                              {company.location}
                            </span>
                          )}
                        </div>
                        {company.description && (
                          <p className="font-openSans text-sm text-grey2 mt-3 leading-relaxed">
                            {company.description}
                          </p>
                        )}
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 text-xs font-satoshi font-semibold text-mainPurple hover:opacity-70 transition-opacity"
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

            <div className="lg:hidden">{renderCTA()}</div>
          </div>

          {/* Sidebar (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-8 space-y-4">
              <div className="bg-white rounded-2xl border border-grey4/60 p-5">
                <p className="font-satoshi font-semibold text-sm text-grey1 mb-4">
                  {job.title}
                </p>
                {renderCTA()}
                <p className="font-openSans text-xs text-grey3 text-center mt-3">
                  Your Segwae profile is sent directly
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-grey4/60 p-5 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="font-satoshi font-semibold text-grey3">
                    Posted
                  </span>
                  <span className="font-openSans text-grey1">
                    {new Date(job.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {job.posting_mode === "internal" && (
                  <div className="flex justify-between text-xs">
                    <span className="font-satoshi font-semibold text-grey3">
                      Applicants
                    </span>
                    <span className="font-openSans text-grey1">
                      {job.application_count ?? 0}
                    </span>
                  </div>
                )}
                {job.experience_years_min > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="font-satoshi font-semibold text-grey3">
                      Experience
                    </span>
                    <span className="font-openSans text-grey1">
                      {job.experience_years_min}+ years
                    </span>
                  </div>
                )}
              </div>
              {/* Sidebar ad */}
              <div className="bg-white rounded-2xl border border-grey4/60 p-4">
                <p className="font-satoshi text-[10px] font-semibold text-grey4 uppercase tracking-widest mb-3 text-center">
                  Advertisement
                </p>
                <AdUnit slot="3842858885" />
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
        <ApplyModal
          job={job}
          onClose={() => setModalOpen(false)}
          onSuccess={() => setExistingApp({ id: "pending", status: "applied" })}
        />
      )}
    </div>
  );
}
