"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  FaUser,
  FaLink,
  FaQrcode,
  FaGear,
  FaArrowRightFromBracket,
  FaBars,
  FaXmark,
  FaBriefcase,
  FaFileLines,
  FaMagnifyingGlass,
  FaEnvelope,
  FaBuilding,
  FaFolderOpen,
} from "react-icons/fa6";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems = [
    { href: "/dashboard/profile", label: "Profile", icon: FaUser },
    { href: "/dashboard/social-links", label: "Social Links", icon: FaLink },
    { href: "/dashboard/qr", label: "QR Code", icon: FaQrcode },
    { href: "/dashboard/settings", label: "Settings", icon: FaGear },
  ];

  const careersNavItems = [
    { href: "/jobs", label: "Browse Jobs", icon: FaMagnifyingGlass },
    { href: "/dashboard/applications", label: "My Applications", icon: FaFileLines },
    { href: "/dashboard/resumes", label: "Resume Manager", icon: FaFolderOpen },
    { href: "/dashboard/hiring", label: "Hiring Dashboard", icon: FaBriefcase },
    { href: "/dashboard/hiring/company", label: "Company Profile", icon: FaBuilding },
    { href: "/dashboard/hiring/templates", label: "Email Templates", icon: FaEnvelope },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-grey6 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-[#111827] z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/[0.07]">
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <Image
              src="/wordmark_white.png"
              alt="Segwae"
              width={0}
              height={0}
              sizes="100vw"
              className="h-6 w-auto!"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg font-satoshi font-medium text-sm
                  transition-all duration-150
                  ${
                    isActive
                      ? "bg-mainPurple text-white"
                      : "text-white/45 hover:text-white hover:bg-white/6"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-5 pb-1">
            <p className="px-3 text-[10px] font-semibold text-white/20 uppercase tracking-widest font-satoshi">
              Careers
            </p>
          </div>

          {careersNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg font-satoshi font-medium text-sm
                  transition-all duration-150
                  ${
                    isActive
                      ? "bg-mainPurple text-white"
                      : "text-white/45 hover:text-white hover:bg-white/6"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/[0.07]">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-satoshi font-medium text-sm text-white/35 hover:text-white/70 hover:bg-white/6 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaArrowRightFromBracket className="w-4 h-4 shrink-0" />
            <span>{loggingOut ? "Logging out…" : "Log out"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#111827] px-5 py-4 flex items-center justify-between z-30 border-b border-white/[0.07]">
        <Image
          src="/wordmark_white.png"
          alt="Segwae"
          width={0}
          height={0}
          sizes="100vw"
          className="h-6 w-auto!"
        />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-white/50 hover:text-white transition-colors"
        >
          {sidebarOpen ? (
            <FaXmark className="w-5 h-5" />
          ) : (
            <FaBars className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Main content */}
      <main className="lg:ml-60 flex-1 min-h-screen pt-[60px] lg:pt-0">
        <div className="p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
