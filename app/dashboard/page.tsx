"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaFileLines,
  FaHourglassHalf,
  FaCalendarCheck,
  FaArrowRight,
  FaCheck,
  FaMagnifyingGlass,
  FaFolderOpen,
  FaQrcode,
  FaGear,
  FaChevronRight,
  FaBuilding,
} from "react-icons/fa6";

type SocialLink = { id: string };
type AppRow = {
  id: string;
  status: string;
  applied_at: string;
  jobs?: { title?: string; companies?: { name?: string; logo_url?: string | null } | null } | null;
};

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  applied: { label: "Applied", color: "text-[#5A2DD4]", bg: "bg-[#F1ECFD]" },
  under_review: { label: "Under review", color: "text-[#1E5BBF]", bg: "bg-[#E8EFFB]" },
  shortlisted: { label: "Shortlisted", color: "text-[#C2410C]", bg: "bg-[#FDF0E7]" },
  accepted: { label: "Accepted", color: "text-[#16895E]", bg: "bg-[#E7F6EF]" },
  rejected: { label: "Not selected", color: "text-[#9098A3]", bg: "bg-[#F3F3F7]" },
};

const TAB_ORDER = ["applied", "under_review", "shortlisted", "accepted", "rejected"];

function initialsOf(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "—";
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const days = Math.floor(s / 86400);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const SHORTCUTS = [
  { href: "/jobs", label: "Browse jobs", icon: FaMagnifyingGlass },
  { href: "/dashboard/resumes", label: "Resume manager", icon: FaFolderOpen },
  { href: "/dashboard/qr", label: "QR code & NFC", icon: FaQrcode },
  { href: "/dashboard/settings", label: "Settings", icon: FaGear },
];

export default function DashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [apps, setApps] = useState<AppRow[]>([]);
  const [filter, setFilter] = useState("all");
  const [checklist, setChecklist] = useState<{ label: string; done: boolean; href: string }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, appsRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/hiring/applications"),
        ]);

        if (profileRes.ok) {
          const d = await profileRes.json();
          const p = d.profile || {};
          const socials: SocialLink[] = d.socialLinks || [];
          setName(p.name || "");
          setChecklist([
            { label: "Add a job title", done: !!p.title, href: "/dashboard/profile" },
            { label: "Write a short bio", done: !!p.bio, href: "/dashboard/profile" },
            { label: "Add your phone number", done: !!p.phone, href: "/dashboard/profile" },
            { label: "Upload a profile photo", done: !!p.profile_image_url, href: "/dashboard/profile" },
            { label: "Add a portfolio link", done: !!p.portfolio_or_website_link, href: "/dashboard/profile" },
            { label: "Connect 3 social links", done: socials.length >= 3, href: "/dashboard/social-links" },
          ]);
        }

        if (appsRes.ok) {
          const d = await appsRes.json();
          setApps(Array.isArray(d.applications) ? d.applications : []);
        }
      } catch {
        /* leave empty */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = (name || "there").trim().split(/\s+/)[0];
  const total = apps.length;
  const inReview = apps.filter((a) => a.status === "under_review").length;
  const interviews = apps.filter((a) => a.status === "accepted").length;

  const doneCount = checklist.filter((c) => c.done).length;
  const strength = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;
  const strengthLabel = strength >= 80 ? "Strong" : strength >= 50 ? "Good" : "Getting started";
  const nextMissing = checklist.find((c) => !c.done);

  const presentStatuses = TAB_ORDER.filter((s) => apps.some((a) => a.status === s));
  const tabs = ["all", ...presentStatuses];
  const visibleApps = apps.filter((a) => filter === "all" || a.status === filter);

  const subtitle =
    total === 0
      ? "Start applying to track your progress here"
      : inReview > 0
      ? `You have ${inReview} application${inReview === 1 ? "" : "s"} under review`
      : `Tracking ${total} application${total === 1 ? "" : "s"}`;

  return (
    <div className="max-w-full">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-satoshi font-black text-[22px] tracking-[-0.02em] text-[#15131C]">
            Welcome back, {firstName}
          </h1>
          <p className="text-[13px] font-medium text-[#9098A3] mt-0.5">{subtitle}</p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-bold text-white px-[18px] py-2.5 rounded-xl bg-brand-gradient shadow-[0_6px_16px_rgba(74,55,216,0.26)] hover:-translate-y-px transition-transform"
        >
          <FaMagnifyingGlass className="w-[15px] h-[15px]" /> Find jobs
        </Link>
      </div>

      {/* Strength + stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr] mb-5">
        {/* strength */}
        <div className="sm:col-span-2 xl:col-span-1 relative overflow-hidden rounded-[18px] bg-[#0F1115] p-[22px]">
          <div
            className="absolute -top-[60px] -right-10 w-[200px] h-[200px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,90,246,0.4), transparent 70%)" }}
          />
          <div className="relative">
            <div className="text-xs font-semibold text-white/50">Profile strength</div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-[32px] font-black tracking-[-0.03em] text-white">{strength}%</span>
              <span className="text-[12.5px] font-semibold text-[#A78BFA]">{strengthLabel}</span>
            </div>
            <div className="h-[7px] rounded mt-3.5 bg-white/12 overflow-hidden">
              <div
                className="h-full rounded"
                style={{ width: `${strength}%`, background: "linear-gradient(90deg,#9D5CE6,#6D8BF2)" }}
              />
            </div>
            <div className="text-xs font-medium text-white/45 mt-3">
              {nextMissing ? `${nextMissing.label} to reach 100%` : "Your profile is complete 🎉"}
            </div>
          </div>
        </div>

        <StatTile icon={<FaFileLines />} tint="bg-[#F1ECFD] text-[#5A2DD4]" value={total} label="Applications" />
        <StatTile icon={<FaHourglassHalf />} tint="bg-[#FDF0E7] text-[#C2410C]" value={inReview} label="Under review" />
        <StatTile icon={<FaCalendarCheck />} tint="bg-[#E7F6EF] text-[#16895E]" value={interviews} label="Interviews" />
      </div>

      {/* Applications + side */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px] items-start">
        {/* tracker */}
        <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="font-satoshi text-[17px] font-extrabold tracking-[-0.01em] text-[#15131C]">
              Your applications
            </h2>
            {tabs.length > 1 && (
              <div className="flex gap-1.5 flex-wrap">
                {tabs.map((key) => {
                  const on = filter === key;
                  const count = key === "all" ? total : apps.filter((a) => a.status === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-[7px] rounded-[9px] text-[13px] font-bold transition-colors ${
                        on
                          ? "bg-brand-gradient text-white"
                          : "bg-white border border-[#E8E8EF] text-[#6B6478] font-semibold hover:border-[#C9BCF2]"
                      }`}
                    >
                      {key === "all" ? "All" : STATUS[key]?.label ?? key}
                      <span
                        className={`text-[11px] font-bold px-1.5 rounded-md ${
                          on ? "bg-white/20 text-white" : "bg-[#F3F3F7] text-[#9098A3]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {visibleApps.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F1ECFD] flex items-center justify-center text-[#5A2DD4]">
                <FaFileLines className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#15131C]">
                {total === 0 ? "No applications yet" : "Nothing with this status yet"}
              </p>
              {total === 0 && (
                <Link
                  href="/jobs"
                  className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-bold shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
                >
                  Browse jobs
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              {visibleApps.map((app) => {
                const company = app.jobs?.companies;
                const s = STATUS[app.status] ?? STATUS.applied;
                return (
                  <div key={app.id} className="flex items-center gap-3.5 py-[15px] border-t border-[#F4F3F7]">
                    <div className="w-[46px] h-[46px] rounded-xl overflow-hidden bg-[#F1F0F6] flex items-center justify-center text-[13px] font-extrabold text-[#5A2DD4] shrink-0">
                      {company?.logo_url ? (
                        <Image src={company.logo_url} alt="" width={46} height={46} className="object-cover w-full h-full" />
                      ) : company?.name ? (
                        initialsOf(company.name)
                      ) : (
                        <FaBuilding className="w-4 h-4 text-[#9098A3]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14.5px] font-bold text-[#15131C] leading-snug truncate">
                        {app.jobs?.title ?? "—"}
                      </div>
                      <div className="text-[12.5px] font-medium text-[#9098A3] mt-0.5 truncate">
                        {company?.name ?? "—"}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-[#B6B0C0] shrink-0 hidden sm:block">
                      {timeAgo(app.applied_at)}
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-[5px] rounded-lg shrink-0 ${s.color} ${s.bg}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* right column */}
        <div className="flex flex-col gap-5">
          {/* finish your profile */}
          <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-5">
            <h3 className="text-sm font-extrabold text-[#15131C]">Finish your profile</h3>
            <p className="text-xs font-medium text-[#9098A3] mt-0.5 mb-3.5">
              {doneCount}/{checklist.length} complete · {strength}% strength
            </p>
            <div className="flex flex-col gap-1">
              {checklist.map((c) =>
                c.done ? (
                  <div key={c.label} className="flex items-center gap-2.5 px-1 py-1.5 text-[13px] font-medium text-[#9098A3]">
                    <span className="w-[18px] h-[18px] rounded-full bg-[#E7F6EF] text-[#16895E] flex items-center justify-center shrink-0">
                      <FaCheck className="w-2.5 h-2.5" />
                    </span>
                    <span className="line-through">{c.label}</span>
                  </div>
                ) : (
                  <Link
                    key={c.label}
                    href={c.href}
                    className="flex items-center gap-2.5 px-1 py-1.5 -mx-1 rounded-lg text-[13px] font-bold text-[#15131C] hover:bg-[#FAFAFB] transition-colors"
                  >
                    <span className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#D8D5E2] shrink-0" />
                    <span className="flex-1">{c.label}</span>
                    <FaChevronRight className="w-3 h-3 text-[#A8A2B4]" />
                  </Link>
                )
              )}
            </div>
          </div>

          {/* shortcuts */}
          <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-5">
            <h3 className="text-sm font-extrabold text-[#15131C] mb-2.5">Shortcuts</h3>
            <div className="flex flex-col">
              {SHORTCUTS.map((sc) => {
                const Icon = sc.icon;
                return (
                  <Link
                    key={sc.href}
                    href={sc.href}
                    className="flex items-center gap-3 py-2.5 px-1 -mx-1 rounded-lg hover:bg-[#FAFAFB] transition-colors"
                  >
                    <span className="w-9 h-9 rounded-[10px] bg-[#F1F0F6] flex items-center justify-center text-[#5A2DD4] shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 text-[13.5px] font-bold text-[#15131C]">{sc.label}</span>
                    <FaArrowRight className="w-3.5 h-3.5 text-[#A8A2B4]" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <div className="bg-white border border-[#E8E8EF] rounded-[18px] p-5 flex flex-col justify-between min-h-[120px]">
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center [&>svg]:w-[18px] [&>svg]:h-[18px] ${tint}`}>
        {icon}
      </div>
      <div>
        <div className="text-[28px] font-black tracking-[-0.03em] text-[#15131C] leading-none">{value}</div>
        <div className="text-[12.5px] font-medium text-[#9098A3] mt-1">{label}</div>
      </div>
    </div>
  );
}
