"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  format,
  addDays,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
} from "date-fns";
import {
  Calendar,
  CalendarRange,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  RotateCcw,
} from "lucide-react";
import { MotionCard } from "@/components/ui/MotionCard";

export interface EmployeeDashboardReservationItem {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "PENDING" | "APPROVED" | "CANCELLED" | "REJECTED";
  purpose: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  resource: {
    id: string;
    name: string;
    category: string;
    location: string | null;
  };
}

interface EmployeeDashboardUpcomingClientProps {
  reservations: EmployeeDashboardReservationItem[];
  currentUserId: string;
}

export function EmployeeDashboardUpcomingClient({
  reservations,
  currentUserId,
}: EmployeeDashboardUpcomingClientProps) {
  const now = new Date();

  // Default: Next 30 days filter
  const defaultFrom = format(now, "yyyy-MM-dd");
  const defaultTo = format(addDays(now, 30), "yyyy-MM-dd");

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "PENDING" | "CANCELLED">("ALL");

  const isNext30Days =
    !showAll &&
    fromDate === defaultFrom &&
    toDate === defaultTo;

  const setNext30Days = () => {
    setShowAll(false);
    setFromDate(defaultFrom);
    setToDate(defaultTo);
  };

  /** Filter reservations: upcoming only (endTime >= now), date range, and status */
  const filteredReservations = useMemo(() => {
    return reservations.filter((item) => {
      // Exclude expired bookings
      if (isBefore(new Date(item.endTime), now)) return false;

      // Status filter
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (!showAll) {
        const start = startOfDay(new Date(fromDate));
        const end = endOfDay(new Date(toDate));
        const itemDate = new Date(item.startTime);
        if (isBefore(itemDate, start) || isAfter(itemDate, end)) {
          return false;
        }
      }

      return true;
    });
  }, [reservations, fromDate, toDate, showAll, statusFilter, now]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
            <Clock className="h-2.5 w-2.5" />
            Pending
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
            <XCircle className="h-2.5 w-2.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="glass-card no-hover p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-base font-bold text-white">
            Upcoming Reservations
          </h2>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
            {filteredReservations.length} Scheduled
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Organization-wide schedule of upcoming resource bookings across all team members.
        </p>
      </div>

      {/* ── Filter Bar: Calendar Inputs & Quick Buttons ── */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <CalendarRange className="h-4 w-4 text-indigo-400" />
            <span>Filter Dates:</span>
          </div>

          {!showAll && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-500 whitespace-nowrap">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="glass-input !py-1 !text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-500 whitespace-nowrap">To</label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="glass-input !py-1 !text-xs"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={setNext30Days}
              className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
                isNext30Days
                  ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
              title="Filter next 30 days"
            >
              <RotateCcw className="h-3 w-3" />
              Next 30 Days
            </button>

            <button
              onClick={() => setShowAll((v) => !v)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
                showAll
                  ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {showAll ? "Custom Filter" : "All Upcoming"}
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 self-start lg:self-auto border-t border-white/5 pt-2 lg:border-t-0 lg:pt-0">
          {(["ALL", "APPROVED", "PENDING", "CANCELLED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                statusFilter === st
                  ? "border border-indigo-500/40 bg-indigo-500/20 text-indigo-300"
                  : "border border-transparent bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Info indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
        <p>
          Showing <span className="font-semibold text-slate-300">{filteredReservations.length}</span> of{" "}
          <span className="font-semibold text-slate-300">{reservations.length}</span> upcoming reservations
          {!showAll &&
            ` · ${format(new Date(fromDate), "MMM d")} – ${format(new Date(toDate), "MMM d, yyyy")}`}
        </p>
      </div>

      {/* ── Upcoming Reservations Card List ── */}
      {filteredReservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Calendar className="h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-white">No upcoming reservations found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            There are currently no scheduled bookings matching the selected date range and filters.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={setNext30Days}
              className="text-xs text-indigo-400 hover:underline"
            >
              Reset to Next 30 Days
            </button>
            <span className="text-slate-600">•</span>
            <Link
              href="/employee/resources"
              className="text-xs text-indigo-400 hover:underline"
            >
              Book a Resource
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((item) => {
            const isMine = item.user.id === currentUserId;
            return (
              <MotionCard
                key={item.id}
                className="reservation-card group flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                zoomScale={1.015}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                      {item.resource.name}
                    </span>
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                      {item.resource.category}
                    </span>
                    {getStatusBadge(item.status)}
                    {isMine && (
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                        Your Booking
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <div className="flex items-center gap-1 text-slate-300">
                      <User className="h-3 w-3 text-slate-400" />
                      <span>{isMine ? "You" : item.user.name}</span>
                    </div>

                    <span>•</span>

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

                  {item.purpose && (
                    <p className="text-[11px] text-slate-400 mt-1.5 italic line-clamp-1">
                      &quot;{item.purpose}&quot;
                    </p>
                  )}
                </div>

                {isMine && (
                  <Link
                    href="/employee/my-reservations"
                    className="self-start sm:self-auto rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Manage
                  </Link>
                )}
              </MotionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
