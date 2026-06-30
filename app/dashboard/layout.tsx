"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  FaGaugeHigh,
  FaChevronRight,
} from "react-icons/fa6";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [me, setMe] = useState<{ name: string; image: string | null }>({ name: "", image: null });
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.profile) setMe({ name: d.profile.name || "", image: d.profile.profile_image_url || null });
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: FaGaugeHigh, exact: true },
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

  const isItemActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 ${
      active
        ? "bg-[#F4F0FE] text-[#5A2DD4] font-bold"
        : "text-[#6B6478] font-medium hover:bg-[#FAFAFB] hover:text-[#15131C]"
    }`;

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
    <div className="min-h-screen bg-[#F7F7F9] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0F1115]/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-[#ECECF1] z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-6">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="inline-flex items-center"
            aria-label="Segwae home"
          >
            <Image src="/wordmark.png" alt="Segwae" width={3834} height={992} className="h-7 w-auto" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={navLinkClass(isItemActive(item.href, item.exact))}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-5 pb-1">
            <p className="px-3 text-[10px] font-bold text-[#A8A2B4] uppercase tracking-widest">
              Careers
            </p>
          </div>

          {careersNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={navLinkClass(isItemActive(item.href))}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User card + logout */}
        <div className="px-3 py-3">
          <div className="h-px bg-[#F0EFF4] mb-2" />
          <Link
            href="/dashboard/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-[#FAFAFB] transition-colors"
          >
            <div className="w-[38px] h-[38px] rounded-full p-[2px] bg-brand-gradient shrink-0">
              <div className="relative w-full h-full rounded-full border-2 border-white overflow-hidden bg-brand-gradient flex items-center justify-center text-[13px] font-black text-white">
                {me.image ? (
                  <Image src={me.image} alt="" fill className="object-cover" />
                ) : (
                  initialsOf(me.name)
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-bold text-[#15131C] truncate">{me.name || "Your profile"}</div>
              <div className="text-[11.5px] font-medium text-[#9098A3]">View profile</div>
            </div>
            <FaChevronRight className="w-3.5 h-3.5 text-[#A8A2B4] shrink-0" />
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm font-medium text-[#9098A3] hover:text-[#15131C] hover:bg-[#FAFAFB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaArrowRightFromBracket className="w-[18px] h-[18px] shrink-0" />
            <span>{loggingOut ? "Logging out…" : "Log out"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white px-5 py-4 flex items-center justify-between z-30 border-b border-[#ECECF1]">
        <Link href="/" className="inline-flex items-center" aria-label="Segwae home">
          <Image src="/wordmark.png" alt="Segwae" width={3834} height={992} className="h-7 w-auto" />
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-[#6B6478] hover:text-[#15131C] transition-colors"
        >
          {sidebarOpen ? <FaXmark className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </button>
      </div>

      {/* Main content */}
      <main className="lg:ml-60 flex-1 min-h-screen pt-[60px] lg:pt-0">
        <div className="p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
