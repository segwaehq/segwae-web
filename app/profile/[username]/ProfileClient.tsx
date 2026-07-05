"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UserProfile } from "@/lib/supabase";
import {
  FaBehance,
  FaDribbble,
  FaFacebookF,
  FaFigma,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaMedium,
  FaStackOverflow,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import * as FaIcons from "react-icons/fa6";
import { useSocialPlatforms } from "@/hooks/useSocialPlatforms";

// Utility function to convert icon identifier to React icon component
const getIconComponent = (iconId: string) => {
  // Convert icon identifier to PascalCase for react-icons
  // e.g., "linkedin-in" -> "FaLinkedinIn"
  const iconName =
    "Fa" +
    iconId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

  const IconComponent =
    (
      FaIcons as Record<
        string,
        React.ComponentType<React.SVGProps<SVGSVGElement>>
      >
    )[iconName] || FaIcons.FaLink;
  return IconComponent;
};

// Fallback platform config (used when dynamic fetch fails)
const platformConfig: Record<string, { color: string; icon: React.ReactNode }> =
  {
    linkedin: { color: "#0077B5", icon: <FaLinkedinIn className="w-[18px] h-[18px]" /> },
    github: { color: "#333333", icon: <FaGithub className="w-[18px] h-[18px]" /> },
    x: { color: "#000000", icon: <FaXTwitter className="w-[18px] h-[18px]" /> },
    instagram: { color: "#E4405F", icon: <FaInstagram className="w-[18px] h-[18px]" /> },
    facebook: { color: "#1877F2", icon: <FaFacebookF className="w-[18px] h-[18px]" /> },
    dribbble: { color: "#EA4C89", icon: <FaDribbble className="w-[18px] h-[18px]" /> },
    behance: { color: "#1769FF", icon: <FaBehance className="w-[18px] h-[18px]" /> },
    whatsapp: { color: "#25D366", icon: <FaWhatsapp className="w-[18px] h-[18px]" /> },
    youtube: { color: "#FF0000", icon: <FaYoutube className="w-[18px] h-[18px]" /> },
    tiktok: { color: "#000000", icon: <FaTiktok className="w-[18px] h-[18px]" /> },
    medium: { color: "#000000", icon: <FaMedium className="w-[18px] h-[18px]" /> },
    stackoverflow: { color: "#F58025", icon: <FaStackOverflow className="w-[18px] h-[18px]" /> },
    figma: { color: "#F24E1E", icon: <FaFigma className="w-[18px] h-[18px]" /> },
    global: { color: "#6B73FF", icon: <FaGlobe className="w-[18px] h-[18px]" /> },
  };

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

const normalizeUrl = (u: string) =>
  /^https?:\/\//i.test(u) ? u : `https://${u}`;

const prettyDomain = (u: string) =>
  u
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");

export default function ProfileClient({ profile }: { profile: UserProfile }) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch dynamic social platforms
  const { platforms: dynamicPlatforms } = useSocialPlatforms();

  const flash = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const copyText = (text: string, msg: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {}
    flash(msg);
  };

  // Helper function to get platform config (dynamic or fallback)
  const getPlatformConfig = (platformIdentifier: string) => {
    const normalizedId =
      platformIdentifier.toLowerCase() === "portfolio"
        ? "global"
        : platformIdentifier.toLowerCase();

    const dynamicPlatform = dynamicPlatforms.find(
      (p) => p.platform_identifier === normalizedId
    );

    if (dynamicPlatform) {
      const IconComponent = getIconComponent(dynamicPlatform.icon_identifier);
      return {
        name: dynamicPlatform.platform_name,
        icon: <IconComponent className="w-[18px] h-[18px]" />,
      };
    }

    return platformConfig[normalizedId]
      ? {
          name: normalizedId.charAt(0).toUpperCase() + normalizedId.slice(1),
          icon: platformConfig[normalizedId].icon,
        }
      : {
          name: "Website",
          icon: platformConfig["global"].icon,
        };
  };

  // Use web_preferences toggles if available, fallback to defaults
  const prefs = profile.user_web_preferences;
  const showEmail = prefs?.show_email ?? true;
  const showPhone = prefs?.show_phone ?? true;
  const showPortfolio = prefs?.show_portfolio ?? true;
  const showResume = prefs?.show_resume ?? true;
  const showProfileVideo = prefs?.show_profile_video ?? true;

  const hasProfileVideo = !!profile.profile_video_url && showProfileVideo;
  const handle = profile.custom_username || profile.username;

  const enabledSocials =
    profile.social_links?.filter((link) => link.is_enabled) ?? [];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Segwae`,
          text: `Connect with me on Segwae! 🚀`,
          url,
        });
      } catch {
        copyText(url, "Profile link copied");
      }
    } else {
      copyText(url, "Profile link copied");
    }
  };

  const saveContact = () => {
    const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${profile.name}`];
    if (profile.title) lines.push(`TITLE:${profile.title}`);
    if (showEmail && profile.email) lines.push(`EMAIL:${profile.email}`);
    if (showPhone && profile.phone) lines.push(`TEL:${profile.phone}`);
    if (showPortfolio && profile.portfolio_or_website_link)
      lines.push(`URL:${normalizeUrl(profile.portfolio_or_website_link)}`);
    lines.push("END:VCARD");

    const blob = new Blob([lines.join("\r\n")], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Contact saved");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-5 pt-10 pb-14 bg-[radial-gradient(circle_at_50%_-10%,#EBE3FB_0%,#F4F3F8_46%,#F4F3F8_100%)] dark:bg-[radial-gradient(circle_at_50%_-10%,#1e1830_0%,#0e0c15_46%,#0e0c15_100%)]">
      {/* Public profile label */}
      <div className="flex items-center gap-[7px] mb-5 font-satoshi text-[13px] font-semibold text-[#9A93A8] dark:text-content-subtle">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
        Public profile · segwae.com/{handle}
      </div>

      {/* Card */}
      <div className="w-full max-w-[400px] bg-white dark:bg-surface-raised rounded-[40px] overflow-hidden shadow-[0_40px_90px_-30px_rgba(38,22,82,0.45),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)]">
        {/* Cover */}
        <div className="relative h-[152px] overflow-hidden">
          {profile.cover_image_url ? (
            <Image
              src={profile.cover_image_url}
              alt="Cover"
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(125deg,#6D1FB3 0%,#4A37D8 55%,#2563EB 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.16) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
            </div>
          )}
        </div>

        <div className="px-[22px] pb-[30px]">
          {/* Avatar + share */}
          <div className="flex items-end justify-between -mt-[52px] mb-4">
            {hasProfileVideo ? (
              <button
                onClick={() => setShowVideoModal(true)}
                className="relative w-[104px] h-[104px] rounded-full p-1 bg-brand-gradient cursor-pointer group"
              >
                <div className="relative w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-[#F1F0F6]">
                  <video
                    ref={videoRef}
                    src={profile.profile_video_url || undefined}
                    poster={profile.profile_video_thumbnail_url || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                    <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#15131C] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="w-[104px] h-[104px] rounded-full p-1 bg-brand-gradient">
                <div className="relative w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-brand-gradient flex items-center justify-center">
                  {profile.profile_image_url ? (
                    <Image
                      src={profile.profile_image_url}
                      alt={profile.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-satoshi font-black text-[34px] tracking-[-0.02em] text-white">
                      {initialsOf(profile.name)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleShare}
              className="w-[42px] h-[42px] mb-1.5 rounded-full border border-[#EBEAF0] dark:border-line bg-white dark:bg-surface-sunken flex items-center justify-center text-[#6B6478] dark:text-content-muted hover:bg-[#F4F0FE] dark:hover:bg-[#241d38] hover:text-[#5A2DD4] dark:hover:text-[#b9a4f7] transition-colors cursor-pointer"
              aria-label="Share profile"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="2.6" />
                <circle cx="6" cy="12" r="2.6" />
                <circle cx="18" cy="19" r="2.6" />
                <path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3" />
              </svg>
            </button>
          </div>

          {/* Name + title */}
          <h1 className="font-satoshi font-black text-[23px] tracking-[-0.025em] text-[#15131C] dark:text-content">
            {profile.name}
          </h1>
          {profile.title && (
            <p className="font-satoshi text-[14.5px] font-medium text-[#8B8499] dark:text-content-muted mt-[3px]">
              {profile.title}
            </p>
          )}

          {/* Incomplete badge */}
          {!profile.is_profile_complete && (
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-[#FEF4E6] dark:bg-[#2a2410] border border-[#F6D9A8] dark:border-[#4a3d1a]">
              <svg className="w-4 h-4 text-[#E0921F] dark:text-[#e0a94f]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-satoshi text-xs font-bold text-[#B97509] dark:text-[#e0c98a]">
                Profile incomplete
              </span>
            </div>
          )}

          {/* Bio */}
          {profile.bio ? (
            <p className="font-satoshi text-[14.5px] leading-[1.6] font-medium text-[#4B4658] dark:text-content-muted mt-4">
              {profile.bio}
            </p>
          ) : (
            <p className="font-satoshi text-[14.5px] italic font-medium text-[#B6B0C0] dark:text-content-subtle mt-4">
              No bio yet.
            </p>
          )}

          <div className="h-px bg-[#F0EFF4] dark:bg-line my-[22px]" />

          {/* Contact cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {showEmail && profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-[11px] p-[14px] rounded-[15px] bg-[#F6F5FA] dark:bg-white/[0.04] hover:bg-[#F0ECFB] dark:hover:bg-white/[0.07] transition-colors"
              >
                <span className="w-[34px] h-[34px] rounded-[10px] bg-white dark:bg-[#241d38] flex items-center justify-center text-[#5A2DD4] dark:text-[#b9a4f7] shrink-0 shadow-[0_1px_3px_rgba(31,18,72,0.07)]">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M3.5 7l8.5 6 8.5-6" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block font-satoshi text-[13.5px] font-bold text-[#15131C] dark:text-content">Email</span>
                  <span className="block font-satoshi text-[11.5px] font-medium text-[#9A93A8] dark:text-content-subtle truncate">{profile.email}</span>
                </span>
              </a>
            )}
            {showPhone && profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-[11px] p-[14px] rounded-[15px] bg-[#F6F5FA] dark:bg-white/[0.04] hover:bg-[#F0ECFB] dark:hover:bg-white/[0.07] transition-colors"
              >
                <span className="w-[34px] h-[34px] rounded-[10px] bg-white dark:bg-[#241d38] flex items-center justify-center text-[#5A2DD4] dark:text-[#b9a4f7] shrink-0 shadow-[0_1px_3px_rgba(31,18,72,0.07)]">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block font-satoshi text-[13.5px] font-bold text-[#15131C] dark:text-content">Call</span>
                  <span className="block font-satoshi text-[11.5px] font-medium text-[#9A93A8] dark:text-content-subtle truncate">{profile.phone}</span>
                </span>
              </a>
            )}
            {showPortfolio && profile.portfolio_or_website_link && (
              <a
                href={normalizeUrl(profile.portfolio_or_website_link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[11px] p-[14px] rounded-[15px] bg-[#F6F5FA] dark:bg-white/[0.04] hover:bg-[#F0ECFB] dark:hover:bg-white/[0.07] transition-colors"
              >
                <span className="w-[34px] h-[34px] rounded-[10px] bg-white dark:bg-[#241d38] flex items-center justify-center text-[#5A2DD4] dark:text-[#b9a4f7] shrink-0 shadow-[0_1px_3px_rgba(31,18,72,0.07)]">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block font-satoshi text-[13.5px] font-bold text-[#15131C] dark:text-content">Website</span>
                  <span className="block font-satoshi text-[11.5px] font-medium text-[#9A93A8] dark:text-content-subtle truncate">{prettyDomain(profile.portfolio_or_website_link)}</span>
                </span>
              </a>
            )}
            {showResume && profile.resume_file_url && (
              <a
                href={profile.resume_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[11px] p-[14px] rounded-[15px] bg-[#F6F5FA] dark:bg-white/[0.04] hover:bg-[#F0ECFB] dark:hover:bg-white/[0.07] transition-colors"
              >
                <span className="w-[34px] h-[34px] rounded-[10px] bg-white dark:bg-[#241d38] flex items-center justify-center text-[#5A2DD4] dark:text-[#b9a4f7] shrink-0 shadow-[0_1px_3px_rgba(31,18,72,0.07)]">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
                    <path d="M14 3v5h5" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block font-satoshi text-[13.5px] font-bold text-[#15131C] dark:text-content">Résumé</span>
                  <span className="block font-satoshi text-[11.5px] font-medium text-[#9A93A8] dark:text-content-subtle truncate">View PDF</span>
                </span>
              </a>
            )}
          </div>

          {/* Save to contacts (vCard) */}
          <button
            onClick={saveContact}
            className="w-full flex items-center justify-center gap-[9px] mt-3 py-[15px] rounded-[15px] bg-brand-gradient text-white font-satoshi text-[14.5px] font-bold shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-px transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6M22 11h-6" />
            </svg>
            Save to contacts
          </button>

          {/* Socials */}
          {enabledSocials.length > 0 && (
            <>
              <div className="font-satoshi text-[13px] font-extrabold tracking-[0.02em] text-[#15131C] dark:text-content mt-[30px] mb-1">
                Socials
              </div>
              <div className="h-px bg-[#F0EFF4] dark:bg-line mb-1.5" />
              {enabledSocials.map((link) => {
                const platform = getPlatformConfig(link.platform);
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-[13px] py-[13px] border-b border-[#F4F3F7] dark:border-white/[0.06] last:border-b-0"
                  >
                    <div className="w-[42px] h-[42px] rounded-[13px] bg-[#F6F5FA] dark:bg-white/[0.06] flex items-center justify-center text-[#374151] dark:text-content-muted shrink-0">
                      {platform.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-satoshi text-[14.5px] font-bold text-[#15131C] dark:text-content">{platform.name}</div>
                      <div className="font-satoshi text-[12.5px] font-medium text-[#9A93A8] dark:text-content-subtle truncate">{prettyDomain(link.url)}</div>
                    </div>
                    <button
                      onClick={() => copyText(link.url, "Link copied")}
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#A8A2B4] dark:text-content-subtle hover:bg-[#F4F0FE] dark:hover:bg-[#241d38] hover:text-[#5A2DD4] dark:hover:text-[#b9a4f7] transition-colors cursor-pointer"
                      aria-label="Copy link"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="11" height="11" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </button>
                    <a
                      href={normalizeUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#A8A2B4] dark:text-content-subtle hover:bg-[#F4F0FE] dark:hover:bg-[#241d38] hover:text-[#5A2DD4] dark:hover:text-[#b9a4f7] transition-colors"
                      aria-label="Open link"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M9 7h8v8" />
                      </svg>
                    </a>
                  </div>
                );
              })}
            </>
          )}

          {/* Footer mark */}
          <div className="flex items-center justify-center gap-1.5 mt-[30px] font-satoshi text-xs font-semibold text-[#B6B0C0] dark:text-content-subtle">
            Powered by{" "}
            <span className="font-black tracking-[-0.03em] text-brand-gradient">segwae</span>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && hasProfileVideo && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => setShowVideoModal(false)}
        >
          <button
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 text-white hover:text-grey3 transition-colors z-10"
            aria-label="Close video"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <video
            src={profile.profile_video_url || undefined}
            controls
            autoPlay
            className="max-w-full max-h-full animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#15131C] dark:bg-[#2a2536] text-white font-satoshi text-[13.5px] font-semibold px-5 py-3 rounded-xl shadow-[0_12px_30px_-8px_rgba(0,0,0,0.4)] flex items-center gap-[9px] z-100 animate-fadeIn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
