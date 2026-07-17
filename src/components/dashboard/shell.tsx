"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Brain,
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Plus,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/candidates", label: "People", icon: Users },
  { href: "/dashboard/jobs", label: "Hiring", icon: Briefcase },
  { href: "/dashboard/ai", label: "AI Assistant", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <nav className="floating-nav border border-white/10 bg-[rgba(22,22,22,0.96)] px-3 py-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <Link href="/dashboard" className="mr-4 flex items-center gap-2 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-mustard)]">
            <Brain className="text-[#1F1F1F]" size={15} />
          </div>
          <span className="hidden text-sm font-semibold tracking-tight text-white sm:inline">
            Vetted<span style={{ color: "var(--color-accent-mustard)" }}>.ai</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 lg:flex">
          Stable hiring workspace
        </div>

        <div className="nav-tabs hidden md:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-tab ${isActive ? "nav-tab-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="nav-right">
          <Link href="/dashboard/jobs/new" className="nav-add-btn hidden sm:inline-flex">
            <Plus size={14} />
            Add Job
          </Link>

          <button className="nav-icon-btn" title="Notifications">
            <Bell size={16} />
          </button>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              background: "var(--color-accent-mustard)",
              color: "#1F1F1F",
            }}
            title={user.name}
          >
            {getInitials(user.name)}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="nav-icon-btn hidden lg:flex"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-icon-btn md:hidden"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mx-4 mt-2 rounded-2xl border border-white/10 bg-[rgba(30,30,30,0.96)] p-3 shadow-[0_10px_36px_rgba(0,0,0,0.2)] md:hidden">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm no-underline transition-colors ${
                  isActive
                    ? "bg-white text-[#1E1E1E] font-semibold"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}

          <div className="mt-2 border-t border-white/10 pt-2">
            <Link
              href="/dashboard/jobs/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm no-underline text-[#9CA3AF] hover:text-white"
            >
              <Plus size={16} />
              Add Job
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm"
              style={{ color: "#F87171" }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
