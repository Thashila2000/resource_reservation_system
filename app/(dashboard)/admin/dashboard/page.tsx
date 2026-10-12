import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  Layers,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";

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
    take: 5,
    orderBy: { createdAt: "desc" },
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
      href: "/admin/dashboard",
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
            <Link
              key={kpi.label}
              href={kpi.href}
              className="glass-card group p-5 transition-all hover:border-white/20"
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
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white">
              Recent Reservation Activity
            </h2>
            <p className="text-xs text-slate-400">
              Latest requests submitted by employees.
            </p>
          </div>
          <Link
            href="/admin/approvals"
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all requests <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentReservations.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">
            No reservations made yet.
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {recentReservations.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {item.resource.name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.status === "APPROVED"
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : item.status === "PENDING"
                          ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                          : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="text-slate-300">By {item.user.name}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-indigo-400" />
                      <span>
                        {format(new Date(item.startTime), "MMM d, h:mm a")}
                      </span>
                    </div>
                    {item.resource.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{item.resource.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Link
                  href="/admin/approvals"
                  className="self-start sm:self-auto rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
