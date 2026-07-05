"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaDownload, FaArrowUpRightFromSquare, FaCopy } from "react-icons/fa6";
import { toast } from "sonner";
import QRCode from "qrcode";

interface ProfileData {
  username: string | null;
}

export default function QRCodePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getProfileUrl = () => {
    if (!profile?.username) return "";
    return `https://segwae.com/profile/${profile.username}`;
  };

  const generatePrettyQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const profileUrl = profile?.username ? `https://segwae.com/profile/${profile.username}` : "";
    const size = 512;
    const margin = 4;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const qrData = await QRCode.create(profileUrl, { errorCorrectionLevel: "H" });
    const moduleCount = qrData.modules.size;
    const moduleSize = (size - margin * 2) / moduleCount;
    const dotRadius = moduleSize * 0.42;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    const isInFinderPattern = (row: number, col: number) => {
      const fs = 7;
      if (row < fs && col < fs) return true;
      if (row < fs && col >= moduleCount - fs) return true;
      if (row >= moduleCount - fs && col < fs) return true;
      return false;
    };

    ctx.fillStyle = "#080B14";
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrData.modules.get(row, col) && !isInFinderPattern(row, col)) {
          const x = margin + col * moduleSize + moduleSize / 2;
          const y = margin + row * moduleSize + moduleSize / 2;
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const drawFinderPattern = (startRow: number, startCol: number) => {
      const fs = 7;
      const x = margin + startCol * moduleSize;
      const y = margin + startRow * moduleSize;
      const outerSize = fs * moduleSize;

      ctx.fillStyle = "#080B14";
      ctx.beginPath();
      ctx.roundRect(x, y, outerSize, outerSize, moduleSize * 2);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(x + moduleSize, y + moduleSize, (fs - 2) * moduleSize, (fs - 2) * moduleSize, moduleSize * 1.5);
      ctx.fill();

      ctx.fillStyle = "#5A2DD4";
      ctx.beginPath();
      ctx.roundRect(x + moduleSize * 2, y + moduleSize * 2, (fs - 4) * moduleSize, (fs - 4) * moduleSize, moduleSize);
      ctx.fill();
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(0, moduleCount - 7);
    drawFinderPattern(moduleCount - 7, 0);

    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = "/logo_icon.svg";
    logo.onload = () => {
      const maxLogoSize = size * 0.18;
      const ar = logo.naturalWidth / logo.naturalHeight;
      const logoWidth = ar > 1 ? maxLogoSize : maxLogoSize * ar;
      const logoHeight = ar > 1 ? maxLogoSize / ar : maxLogoSize;
      const logoX = (size - logoWidth) / 2;
      const logoY = (size - logoHeight) / 2;

      const bgRadius = Math.max(logoWidth, logoHeight) / 2 + 12;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, bgRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    };
  }, [profile]);

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    if (profile?.username && canvasRef.current) {
      generatePrettyQR();
    }
  }, [profile, generatePrettyQR]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `segwae-qr-${profile?.username || "code"}.png`;
    link.href = url;
    link.click();
  };

  const handleCopyUrl = async () => {
    const url = getProfileUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile?.username) {
    return (
      <div className="max-w-full">
        <div className="mb-8">
          <p className="font-satoshi text-[12px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7] uppercase tracking-[0.14em] mb-1.5">
            Dashboard
          </p>
          <h1 className="font-satoshi font-black tracking-[-0.02em] text-[26px] text-[#15131C] dark:text-content">QR code</h1>
        </div>
        <div className="bg-white dark:bg-surface-raised rounded-[18px] border border-[#E8E8EF] dark:border-line p-12 text-center">
          <p className="text-[#9098A3] dark:text-content-subtle mb-4">
            You need a username to generate a QR code.
          </p>
          <a href="/dashboard/profile" className="font-satoshi text-sm font-bold text-[#5A2DD4] dark:text-[#b9a4f7] hover:opacity-70 transition-opacity">
            Complete your profile →
          </a>
        </div>
      </div>
    );
  }

  const profileUrl = getProfileUrl();

  return (
    <div className="max-w-full">
      <div className="mb-8">
        <p className="font-satoshi text-[12px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7] uppercase tracking-[0.14em] mb-1.5">
          Dashboard
        </p>
        <h1 className="font-satoshi font-black tracking-[-0.02em] text-[26px] text-[#15131C] dark:text-content">QR code</h1>
      </div>

      <div className="bg-white dark:bg-surface-raised rounded-[18px] border border-[#E8E8EF] dark:border-line p-8">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* QR canvas */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="p-5 rounded-2xl border border-[#E8E8EF] dark:border-line bg-white shadow-sm">
              <canvas
                ref={canvasRef}
                style={{ width: "220px", height: "220px" }}
                className="block"
              />
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <FaDownload className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <p className="font-satoshi text-xs font-bold text-[#6B6478] dark:text-content-muted uppercase tracking-[0.12em] mb-2">
                Profile URL
              </p>
              <div className="flex items-center gap-2 p-3.5 bg-[#F7F7F9] dark:bg-surface-sunken rounded-xl border border-[#E8E8EF] dark:border-line">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm font-medium text-[#5A2DD4] dark:text-[#b9a4f7] hover:underline truncate"
                >
                  {profileUrl}
                </a>
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content transition-colors shrink-0 cursor-pointer"
                  title="Copy"
                >
                  <FaCopy className="w-4 h-4" />
                </button>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content transition-colors shrink-0"
                  title="Open"
                >
                  <FaArrowUpRightFromSquare className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="p-5 bg-[#0F1115] rounded-xl text-white">
              <p className="font-satoshi font-bold text-sm mb-3">How to use</p>
              <ul className="space-y-2 text-xs text-white/60">
                <li>Print and attach to physical business cards</li>
                <li>Add to your email signature or LinkedIn</li>
                <li>Anyone can scan it with their camera to view your profile</li>
              </ul>
            </div>

            <p className="text-xs text-[#9098A3] dark:text-content-subtle">
              Your QR code always points to your latest profile — no need to reprint when you update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
