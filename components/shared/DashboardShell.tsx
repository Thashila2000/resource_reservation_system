"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Box,
  Calendar,
  CheckCircle,
  LogOut,
  Users,
} from "lucide-react";

interface DashboardShellProps {
  userName: string;
  userEmail: string;
  userRole: string;
  children: React.ReactNode;
}

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Resources", href: "/admin/resources", icon: Box },
  { label: "Approvals", href: "/admin/approvals", icon: CheckCircle },
  { label: "Users", href: "/admin/users", icon: Users },
];

const employeeNav = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Resources", href: "/employee/resources", icon: Box },
  { label: "My Reservations", href: "/employee/my-reservations", icon: Calendar },
];

export function DashboardShell({
  userName,
  userEmail,
  userRole,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const navItems = userRole === "ADMIN" ? adminNav : employeeNav;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f17]">
      {/* ── Sidebar ── */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-white/5 bg-[rgba(15,23,42,0.55)] backdrop-blur-xl">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400">
            <span className="text-xs font-extrabold text-white">R</span>
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            RRMS
          </span>
          <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {userRole}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-500/15 text-indigo-400"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer + Sign out */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {userName}
              </p>
              <p className="truncate text-[10px] text-slate-500">{userEmail}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 bg-[rgba(15,23,42,0.35)] px-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="hidden sm:inline">
              {userRole === "ADMIN" ? "Admin Panel" : "Employee Portal"}
            </span>
            <span className="text-slate-700">/</span>
            <span className="font-medium text-white">
              {navItems.find((n) => pathname === n.href)?.label ?? "Page"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
