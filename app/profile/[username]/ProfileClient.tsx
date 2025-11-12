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
import { GoShareAndroid } from "react-icons/go";
import { useSocialPlatforms } from "@/hooks/useSocialPlatforms";

interface ContactModalData {
  type: "email" | "phone" | "web" | "resume";
  label: string;
  value: string;
}

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
    linkedin: {
      color: "#0077B5",
      icon: <FaLinkedinIn className="w-5 h-5" />,
    },
    github: {
      color: "#333333",
      icon: <FaGithub className="w-5 h-5" />,
    },
    x: {
      color: "#000000",
      icon: <FaXTwitter className="w-5 h-5" />,
    },
    instagram: {
      color: "#E4405F",
      icon: <FaInstagram className="w-5 h-5" />,
    },
    facebook: {
      color: "#1877F2",
      icon: <FaFacebookF className="w-5 h-5" />,
    },
    dribbble: {
      color: "#EA4C89",
      icon: <FaDribbble className="w-5 h-5" />,
    },
    behance: {
      color: "#1769FF",
      icon: <FaBehance className="w-5 h-5" />,
    },
    whatsapp: {
      color: "#25D366",
      icon: <FaWhatsapp className="w-5 h-5" />,
    },
    youtube: {
      color: "#FF0000",
      icon: <FaYoutube className="w-5 h-5" />,
    },
    tiktok: {
      color: "#000000",
      icon: <FaTiktok className="w-5 h-5" />,
    },
    medium: {
      color: "#000000",
      icon: <FaMedium className="w-5 h-5" />,
    },
    stackoverflow: {
      color: "#F58025",
      icon: <FaStackOverflow className="w-5 h-5" />,
    },
    figma: {
      color: "#F24E1E",
      icon: <FaFigma className="w-5 h-5" />,
    },
    global: {
      color: "#6B73FF",
      icon: <FaGlobe className="w-5 h-5" />,
    },
  };

export default function ProfileClient({ profile }: { profile: UserProfile }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalData, setContactModalData] =
    useState<ContactModalData | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch dynamic social platforms
  const { platforms: dynamicPlatforms } = useSocialPlatforms();

  // Helper function to get platform config (dynamic or fallback)
  const getPlatformConfig = (platformIdentifier: string) => {
    // Normalize identifier (handle legacy "portfolio" → "global")
    const normalizedId =
      platformIdentifier.toLowerCase() === "portfolio"
        ? "global"
        : platformIdentifier.toLowerCase();

    // Try to find in dynamic platforms first
    const dynamicPlatform = dynamicPlatforms.find(
      (p) => p.platform_identifier === normalizedId
    );

    if (dynamicPlatform) {
      const IconComponent = getIconComponent(dynamicPlatform.icon_identifier);
      return {
        name: dynamicPlatform.platform_name,
        color: dynamicPlatform.color_hex,
        icon: <IconComponent className="w-5 h-5" />,
      };
    }

    // Fallback to hardcoded config
    return platformConfig[normalizedId]
      ? {
          name: normalizedId.charAt(0).toUpperCase() + normalizedId.slice(1),
          color: platformConfig[normalizedId].color,
          icon: platformConfig[normalizedId].icon,
        }
      : {
          name: "Global",
          color: platformConfig["global"].color,
          icon: platformConfig["global"].icon,
        };
  };

  // Use web_preferences if available, fallback to defaults
  const prefs = profile.user_web_preferences;
  const showEmail = prefs?.show_email ?? true;
  const showPhone = prefs?.show_phone ?? true;
  const showPortfolio = prefs?.show_portfolio ?? true;
  const showResume = prefs?.show_resume ?? true;
  const showProfileVideo = prefs?.show_profile_video ?? true;
  const showSocialLinks =
    profile.social_links && profile.social_links.length > 0;

  const hasProfileVideo = !!profile.profile_video_url && showProfileVideo;

  // Get theme colors from preferences
  const backgroundColor = prefs?.background_color ?? "#FFFFFF";
  const textColor = prefs?.text_color ?? "#222222";

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Segwae`,
          text: `Connect with me on Segwae! 🚀`,
          url: url,
        });
      } catch {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(url, "link");
      }
    } else {
      copyToClipboard(url, "link");
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const openContactModal = (
    type: ContactModalData["type"],
    label: string,
    value: string
  ) => {
    setContactModalData({ type, label, value });
    setShowContactModal(true);
  };

  const handlePrimaryAction = () => {
    if (!contactModalData) return;

    switch (contactModalData.type) {
      case "email":
        window.location.href = `mailto:${contactModalData.value}`;
        break;
      case "phone":
        window.location.href = `tel:${contactModalData.value}`;
        break;
      case "web":
        window.open(contactModalData.value, "_blank");
        break;
      case "resume":
        window.open(profile.resume_file_url!, "_blank");
        break;
    }
    setShowContactModal(false);
  };

  const handleSecondaryAction = () => {
    if (!contactModalData) return;

    if (contactModalData.type === "resume") {
      // Download the resume
      const link = document.createElement("a");
      link.href = profile.resume_file_url!;
      link.download = "resume.pdf";
      link.click();
    } else {
      // Copy to clipboard
      copyToClipboard(contactModalData.value, "modal");
      setTimeout(() => setShowContactModal(false), 1000);
    }
  };

  const getPrimaryLabel = (type: ContactModalData["type"]) => {
    switch (type) {
      case "phone":
        return "Call";
      case "web":
        return "Visit link";
      case "email":
        return "Open email";
      case "resume":
        return "View in app";
    }
  };

  const getSecondaryLabel = (type: ContactModalData["type"]) => {
    switch (type) {
      case "phone":
        return "Copy number";
      case "web":
        return "Copy link";
      case "email":
        return "Copy email";
      case "resume":
        return "Download file";
    }
  };

  const getContactIcon = (type: ContactModalData["type"]) => {
    switch (type) {
      case "email":
        return <img src="/email_icon.svg" alt="" className="w-5 h-5" />;
      case "phone":
        return <img src="/phone_icon.svg" alt="" className="w-5 h-5" />;
      case "web":
        return <img src="/web_icon.svg" alt="" className="w-5 h-5" />;
      case "resume":
        return <img src="/resume_icon.svg" alt="" className="w-5 h-5" />;
    }
  };

  const handleVideoClick = () => {
    if (hasProfileVideo) {
      setShowVideoModal(true);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      {/* Cover Image Section */}
      <div className="rounded-b-[20px]" style={{ backgroundColor }}>
        <div className="relative">
          {/* Cover Image */}
          <div className="relative h-52 bg-grey2 rounded-b-[20px] overflow-hidden">
            {profile.cover_image_url ? (
              <Image
                src={profile.cover_image_url}
                alt="Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-mainPurple to-blue" />
            )}
          </div>

          {/* Content Container */}
          <div className="px-6">
            {/* Profile Picture - Overlapping */}
            <div className="flex justify-between items-end -mt-12 mb-4">
              {/* Profile Picture with Video Support */}
              <div className="relative">
                {hasProfileVideo ? (
                  <button
                    onClick={handleVideoClick}
                    className="relative w-[104px] h-[104px] rounded-full border-4 border-white overflow-hidden group cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                      padding: "3px",
                    }}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                      <video
                        ref={videoRef}
                        src={profile.profile_video_url || undefined}
                        poster={
                          profile.profile_video_thumbnail_url || undefined
                        }
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
                        <div className="w-12 h-12 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-800 ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="relative w-[104px] h-[104px] rounded-full border-4 border-white overflow-hidden bg-gray-200">
                    {profile.profile_image_url ? (
                      <Image
                        src={profile.profile_image_url}
                        alt={profile.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-mainPurple text-white text-4xl font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-1">
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full border border-grey6 flex items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
                >

                  <GoShareAndroid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Name and Title */}
            <h1
              className="text-xl font-bold leading-tight mb-1"
              style={{ color: textColor }}
            >
              {profile.name}
            </h1>
            <p
              className="text-sm mb-5"
              style={{ color: textColor, opacity: 0.7 }}
            >
              {profile.title}
            </p>

            {/* Bio */}
            {profile.bio ? (
              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: textColor, opacity: 0.9 }}
              >
                {profile.bio}
              </p>
            ) : (
              <p
                className="text-sm italic mb-8"
                style={{ color: textColor, opacity: 0.5 }}
              >
                No bio yet.
              </p>
            )}

            {/* Divider */}
            <div
              className="h-px mb-6"
              style={{ backgroundColor: textColor, opacity: 0.1 }}
            />

            {/* Contact Icons */}
            <div className="flex gap-2 pb-8 mb-6">
              {showEmail && (
                <button
                  onClick={() =>
                    openContactModal("email", "Email Address", profile.email)
                  }
                  className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <img src="/email_icon.svg" alt="" className="w-5 h-5" />
                </button>
              )}
              {showPhone && profile.phone && (
                <button
                  onClick={() =>
                    openContactModal("phone", "Phone Number", profile.phone)
                  }
                  className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <img src="/phone_icon.svg" alt="" className="w-5 h-5" />
                </button>
              )}
              {showPortfolio && profile.portfolio_or_website_link && (
                <button
                  onClick={() =>
                    openContactModal(
                      "web",
                      "Portfolio / Website",
                      profile.portfolio_or_website_link!
                    )
                  }
                  className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <img src="/web_icon.svg" alt="" className="w-5 h-5" />
                </button>
              )}
              {showResume && profile.resume_file_url && (
                <button
                  onClick={() =>
                    openContactModal(
                      "resume",
                      "Resume",
                      profile.resume_file_url!.split("/").pop() || ""
                    )
                  }
                  className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <img src="/resume_icon.svg" alt="" className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      {showSocialLinks &&
        profile.social_links &&
        profile.social_links.filter((link) => link.is_enabled).length > 0 && (
          <div className="mt-2 mx-0">
            <div className="rounded-[20px] p-6" style={{ backgroundColor }}>
              <h2
                className="text-lg font-bold mb-5"
                style={{ color: textColor }}
              >
                Socials
              </h2>
              <div
                className="h-px mb-5"
                style={{ backgroundColor: textColor, opacity: 0.1 }}
              />

              <div className="space-y-6">
                {profile.social_links
                  .filter((link) => link.is_enabled)
                  .map((link) => {
                    // Get platform config (dynamic or fallback)
                    const platform = getPlatformConfig(link.platform);
                    return (
                      <div key={link.id} className="flex items-center gap-4">
                        {/* Platform Icon */}
                        <div className="w-12 h-12 rounded-full bg-grey6 flex items-center justify-center shrink-0">
                          <div style={{ color: platform.color }}>
                            {platform.icon}
                          </div>
                        </div>

                        {/* Platform Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-base font-semibold"
                            style={{ color: textColor }}
                          >
                            {platform.name}
                          </p>
                          <p
                            className="text-base truncate underline"
                            style={{ color: textColor, opacity: 0.6 }}
                          >
                            {link.url}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => copyToClipboard(link.url, link.id)}
                            className="w-8 h-8 flex items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copy link"
                          >
                            {copied === link.id ? (
                              <svg
                                className="w-5 h-5 text-successGreen cursor-default"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => window.open(link.url, "_blank")}
                            className="w-8 h-8 flex items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                            title="Open link"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

      {/* Contact Modal */}
      {showContactModal && contactModalData && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-fadeIn"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-[20px] p-6 max-w-md w-full animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-normal text-gray-900">
                Leaving Segwae
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mb-5" />

            {/* Contact Info Container */}
            <div className="bg-grey6 rounded-lg p-4 mb-5">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {contactModalData.label}
              </p>
              <div className="h-px bg-gray-200 mb-3" />
              <div className="flex items-center gap-2">
                <div className="text-gray-900 shrink-0">
                  {getContactIcon(contactModalData.type)}
                </div>
                <p className="text-base text-gray-900 break-all">
                  {contactModalData.value}
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handlePrimaryAction}
              className="w-full bg-mainPurple text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors mb-3 cursor-pointer"
            >
              {getPrimaryLabel(contactModalData.type)}
            </button>

            {/* Secondary Action Button */}
            <button
              onClick={handleSecondaryAction}
              className="w-full bg-grey6 text-gray-900 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {copied === "modal" && contactModalData.type !== "resume"
                ? "Copied!"
                : getSecondaryLabel(contactModalData.type)}
            </button>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && hasProfileVideo && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => setShowVideoModal(false)}
        >
          <button
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 text-white hover:text-grey3 transition-colors z-10 animate-fadeIn"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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
    </div>
  );
}
