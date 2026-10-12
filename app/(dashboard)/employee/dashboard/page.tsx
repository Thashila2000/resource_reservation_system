import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CalendarPlus,
} from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { MotionCard } from "@/components/ui/MotionCard";

export const metadata: Metadata = { title: "My Dashboard | PrimeWave RRMS" };
export const instant = false;

export default async function EmployeeDashboardPage() {
  await connection();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [totalReservations, approvedCount, pendingCount, upcomingBookings] =
    await Promise.all([
      prisma.reservation.count({ where: { userId } }),
      prisma.reservation.count({ where: { userId, status: "APPROVED" } }),
      prisma.reservation.count({ where: { userId, status: "PENDING" } }),
      prisma.reservation.findMany({
        where: {
          userId,
          status: { in: ["APPROVED", "PENDING"] },
          endTime: { gte: new Date() },
        },
        include: {
          resource: {
            select: { name: true, category: true, location: true },
          },
        },
        orderBy: { startTime: "asc" },
        take: 3,
      }),
    ]);

  const cards = [
    {
      label: "Total Reservations",
      value: totalReservations,
      icon: Calendar,
      color: "from-indigo-500 to-cyan-500",
    },
    {
      label: "Approved Bookings",
      value: approvedCount,
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
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
            Manage your schedule, track approval statuses, and request new lab spaces.
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <MotionCard key={card.label} className="glass-card p-5" zoomScale={1.02}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${card.color}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white">{card.value}</p>
            </MotionCard>
          );
        })}
      </div>

      {/* Upcoming Schedule */}
      <div className="glass-card no-hover p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white">
            Upcoming Reservations
          </h2>
          <p className="text-xs text-slate-400">
            Your next confirmed and pending bookings.
          </p>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-white">
              No upcoming bookings
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Ready to book a meeting room or lab hardware?
            </p>
            <Link href="/employee/resources" className="mt-4">
              <GlassButton variant="primary" size="sm">
                Explore Resource Catalog
              </GlassButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((item) => (
              <MotionCard
                key={item.id}
                className="reservation-card group flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                zoomScale={1.015}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                      {item.resource.name}
                    </span>
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                      {item.resource.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.status === "APPROVED"
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {item.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Approved
                        </span>
                      ) : (
                        "Pending"
                      )}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-indigo-400" />
                      <span>
                        {format(new Date(item.startTime), "EEE, MMM d, yyyy")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      <span>
                        {format(new Date(item.startTime), "h:mm a")} –{" "}
                        {format(new Date(item.endTime), "h:mm a")}
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
                  href="/employee/my-reservations"
                  className="self-start sm:self-auto rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Details →
                </Link>
              </MotionCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
