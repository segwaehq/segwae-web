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
    <div className="min-h-screen bg-[#F4F3F1] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-[#080B14] z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/8">
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <Image
              src="/wordmark_white.png"
              alt="Segwae"
              width={0}
              height={0}
              sizes="100vw"
              className="h-7 w-auto!"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl font-spaceGrotesk font-medium text-sm
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-mainPurple text-white"
                      : "text-white/50 hover:text-white hover:bg-white/6"
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
        <div className="px-3 py-5 border-t border-white/8">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-spaceGrotesk font-medium text-sm text-white/40 hover:text-white/70 hover:bg-white/6 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaArrowRightFromBracket className="w-4 h-4 shrink-0" />
            <span>{loggingOut ? "Logging out…" : "Log out"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#080B14] px-5 py-4 flex items-center justify-between z-30">
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
          className="p-1.5 text-white/60 hover:text-white transition-colors"
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
