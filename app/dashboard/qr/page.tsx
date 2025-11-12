"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  FaSpinner,
  FaDownload,
  FaArrowUpRightFromSquare,
  FaCopy,
} from "react-icons/fa6";
import { toast } from "sonner";

interface ProfileData {
  username: string | null;
}

export default function QRCodePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const getProfileUrl = () => {
    if (!profile?.username) return "";
    return `https://segwae.com/${profile.username}`;
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Create a download link
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
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-8 h-8 text-mainPurple animate-spin" />
      </div>
    );
  }

  if (!profile?.username) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center py-12">
            <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-4">
              QR Code Not Available
            </h1>
            <p className="font-openSans text-grey3 mb-6">
              You need a username to generate a QR code. Please complete your
              profile setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const profileUrl = getProfileUrl();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
            Your QR Code
          </h1>
          <p className="font-openSans text-grey3">
            Share your digital profile with a scan
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <div className="flex flex-col items-center justify-center">
            <div
              ref={qrRef}
              className="p-8 bg-white border-4 border-grey4 rounded-2xl shadow-lg"
            >
              <QRCodeCanvas
                value={profileUrl}
                size={256}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo.png",
                  excavate: true,
                  width: 48,
                  height: 48,
                }}
              />
            </div>

            <button
              onClick={handleDownload}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity"
            >
              <FaDownload className="w-4 h-4" />
              Download QR Code
            </button>
          </div>

          {/* Profile Information */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h2 className="font-spaceGrotesk font-semibold text-xl text-grey1 mb-4">
                Profile URL
              </h2>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-grey4">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 font-openSans text-mainPurple hover:underline truncate"
                >
                  {profileUrl}
                </a>
                <button
                  onClick={handleCopyUrl}
                  className="p-2 text-grey1 hover:bg-white rounded-lg transition-colors"
                  title="Copy URL"
                >
                  <FaCopy className="w-5 h-5" />
                </button>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-grey1 hover:bg-white rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <FaArrowUpRightFromSquare className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="p-6 bg-linear-to-br from-mainPurple to-blue rounded-xl text-white">
              <h3 className="font-spaceGrotesk font-semibold text-lg mb-2">
                How to use
              </h3>
              <ul className="space-y-2 font-openSans text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    Download and print your QR code for physical business cards
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    Share it in email signatures or social media posts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    Anyone can scan it with their phone camera to view your
                    profile
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-openSans text-sm text-blue-800">
                <strong className="font-semibold">Tip:</strong> Update your
                profile information anytime - your QR code will always link to
                your latest profile!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
