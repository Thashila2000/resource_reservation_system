"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export interface DashboardReservationItem {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
  resource: {
    name: string;
    category: string;
    location: string | null;
  };
}

interface AdminDashboardActivityClientProps {
  reservations: DashboardReservationItem[];
}

export function AdminDashboardActivityClient({
  reservations,
}: AdminDashboardActivityClientProps) {
  const now = new Date();

  // Default: Upcoming 30 days of active reservations
  const [fromDate, setFromDate] = useState(format(now, "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(addDays(now, 30), "yyyy-MM-dd"));
  const [showAll, setShowAll] = useState(false);

  const resetToDefault = () => {
    setShowAll(false);
    setFromDate(format(now, "yyyy-MM-dd"));
    setToDate(format(addDays(now, 30), "yyyy-MM-dd"));
  };

  /** Filter reservations: only active (non-expired) and within the selected date range */
  const activeReservations = useMemo(() => {
    return reservations.filter((item) => {
      // Exclude expired reservations
      if (isBefore(new Date(item.endTime), now)) return false;

      // Exclude cancelled/rejected
      if (item.status === "CANCELLED" || item.status === "REJECTED") return false;

      // Date range filter
      if (!showAll) {
        const start = startOfDay(new Date(fromDate));
        const end = endOfDay(new Date(toDate));
        const itemDate = new Date(item.startTime);
        if (isBefore(itemDate, start) || isAfter(itemDate, end)) return false;
      }
      return true;
    });
  }, [reservations, fromDate, toDate, showAll]);

  return (
    <div className="glass-card no-hover p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          Active Reservations
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            {activeReservations.length} Active
          </span>
        </h2>
        <p className="text-xs text-slate-400">
          Real-time active and upcoming resource bookings across the organization.
        </p>
      </div>

      {/* ── Date Range & Calendar Filter ── */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            {!showAll ? (
              <button
                onClick={resetToDefault}
                className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                title="Reset to 30 days"
              >
                <RotateCcw className="h-3 w-3" />
                Reset (30 Days)
              </button>
            ) : null}

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

        <p className="text-[11px] text-slate-500 whitespace-nowrap">
          Showing{" "}
          <span className="font-semibold text-slate-300">
            {activeReservations.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-300">{reservations.length}</span>{" "}
          active bookings
          {!showAll &&
            ` · ${format(new Date(fromDate), "MMM d")} – ${format(new Date(toDate), "MMM d, yyyy")}`}
        </p>
      </div>

      {/* Active Reservations List */}
      {activeReservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Calendar className="h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-white">No active reservations found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            There are currently no active bookings matching the selected date range.
          </p>
          <button
            onClick={() => setShowAll(true)}
            className="mt-3 text-xs text-indigo-400 hover:underline"
          >
            Show all upcoming
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeReservations.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.015, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }}
              className="reservation-card group flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between will-change-transform"
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
                  <span className="text-slate-300">By {item.user.name}</span>
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
              </div>

              <Link
                href="/admin/approvals"
                className="self-start sm:self-auto rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Manage
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
