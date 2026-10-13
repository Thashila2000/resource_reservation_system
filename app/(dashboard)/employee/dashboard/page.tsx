import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarPlus,
  Wrench,
} from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { MotionCard } from "@/components/ui/MotionCard";
import { EmployeeDashboardUpcomingClient } from "./EmployeeDashboardUpcomingClient";
import { EmployeeDashboardMaintenanceClient } from "./EmployeeDashboardMaintenanceClient";

export const metadata: Metadata = { title: "My Dashboard | PrimeWave RRMS" };
export const instant = false;

export default async function EmployeeDashboardPage() {
  await connection();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [
    totalReservations,
    approvedCount,
    pendingCount,
    upcomingBookings,
    maintenanceResources,
  ] = await Promise.all([
    prisma.reservation.count({ where: { userId } }),
    prisma.reservation.count({ where: { userId, status: "APPROVED" } }),
    prisma.reservation.count({ where: { userId, status: "PENDING" } }),
    prisma.reservation.findMany({
      where: {
        endTime: { gte: new Date() },
        status: { in: ["APPROVED", "PENDING", "CANCELLED"] },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        resource: {
          select: { id: true, name: true, category: true, location: true },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.resource.findMany({
      where: { isUnderMaintenance: true },
      select: {
        id: true,
        name: true,
        category: true,
        location: true,
        description: true,
        updatedAt: true,
        complaints: {
          where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
          select: {
            id: true,
            title: true,
            severity: true,
            adminNotes: true,
          },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const cards = [
    {
      label: "Total Reservations",
      value: totalReservations,
      icon: Calendar,
      color: "bg-indigo-600 shadow-indigo-600/20",
    },
    {
      label: "Approved Bookings",
      value: approvedCount,
      icon: CheckCircle2,
      color: "bg-emerald-600 shadow-emerald-600/20",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: Clock,
      color: "bg-amber-600 shadow-amber-600/20",
    },
    {
      label: "In Maintenance",
      value: maintenanceResources.length,
      icon: Wrench,
      color: maintenanceResources.length > 0 ? "bg-amber-600 shadow-amber-600/20" : "bg-slate-700 shadow-slate-700/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {session.user.name?.split(" ")[0] ?? "Member"}
          </h1>
          <p className="text-sm text-slate-400">
            Manage your schedule, track approval statuses, and review active lab equipment availability.
          </p>
        </div>

        <Link href="/employee/resources">
          <GlassButton
            variant="primary"
            size="md"
            className="inline-flex items-center gap-2"
          >
            <CalendarPlus className="h-4 w-4" />
            Book a Resource
          </GlassButton>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <MotionCard key={card.label} className="glass-card p-5" zoomScale={1.02}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-md ${card.color}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white">{card.value}</p>
            </MotionCard>
          );
        })}
      </div>

      {/* Currently Under Maintenance Resources */}
      <EmployeeDashboardMaintenanceClient resources={maintenanceResources} />

      {/* Upcoming Schedule for All Employees */}
      <EmployeeDashboardUpcomingClient
        reservations={upcomingBookings}
        currentUserId={userId}
      />
    </div>
  );
}
