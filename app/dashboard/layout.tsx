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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-satoshi font-bold text-xl text-grey1">Segwae</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-grey1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <FaXmark className="w-6 h-6" />
          ) : (
            <FaBars className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2 z-50">
              <Image
                // src="/wordmark_svg.svg"
                src="/wordmark.png"
                alt="Segwae Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="h-8 w-auto!"
                priority
              />
            </Link>
            <p className="font-openSans text-sm text-grey3 mt-1">Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-spaceGrotesk font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-mainPurple text-white"
                        : "text-grey1 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-spaceGrotesk font-medium text-red-600 cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowRightFromBracket className="w-5 h-5" />
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
