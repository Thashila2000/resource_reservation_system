import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Layers,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
} from "lucide-react";
import { AdminDashboardActivityClient } from "./AdminDashboardActivityClient";
import { MotionCardLink } from "@/components/ui/MotionCard";

export const metadata: Metadata = { title: "Admin Dashboard | PrimeWave RRMS" };
export const instant = false;

export default async function AdminDashboardPage() {
  await connection();

  const [totalResources, pendingApprovals, approvedReservations, totalUsers] =
    await Promise.all([
      prisma.resource.count(),
      prisma.reservation.count({ where: { status: "PENDING" } }),
      prisma.reservation.count({ where: { status: "APPROVED" } }),
      prisma.user.count(),
    ]);

  const recentReservations = await prisma.reservation.findMany({
    where: {
      endTime: { gte: new Date() },
      status: { in: ["APPROVED", "PENDING"] },
    },
    orderBy: { startTime: "asc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
      resource: {
        select: { name: true, category: true, location: true },
      },
    },
  });

  const kpis = [
    {
      label: "Total Resources",
      value: totalResources,
      icon: Layers,
      color: "from-indigo-500 to-cyan-500",
      href: "/admin/resources",
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      href: "/admin/approvals",
    },
    {
      label: "Active Bookings",
      value: approvedReservations,
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-500",
      href: "/admin/approvals",
    },
    {
      label: "Registered Users",
      value: totalUsers,
      icon: Users,
      color: "from-blue-500 to-indigo-500",
      href: "/admin/users",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Admin Overview
        </h1>
        <p className="text-sm text-slate-400">
          Real-time metrics, system health, and reservation activity across PrimeWave Lab.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <MotionCardLink
              key={kpi.label}
              href={kpi.href}
              className="glass-card group p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {kpi.label}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${kpi.color} shadow-md shadow-indigo-500/10`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-white">{kpi.value}</p>
                <span className="text-xs text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </MotionCardLink>
          );
        })}
      </div>

      {/* Reservation Activity with Date Range Calendar Filter */}
      <AdminDashboardActivityClient reservations={recentReservations} />
    </div>
  );
}
