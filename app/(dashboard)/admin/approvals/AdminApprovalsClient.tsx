"use client";

import { useState, useTransition, useMemo } from "react";
import { motion } from "framer-motion";
import {
  format,
  subDays,
  addDays,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
} from "date-fns";
import {
  Clock,
  Calendar,
  User,
  MapPin,
  Check,
  X,
  Inbox,
  RefreshCw,
  CalendarRange,
  RotateCcw,
  TimerOff,
  Users,
} from "lucide-react";
import { approveReservation, rejectReservation } from "@/lib/actions";
import { confirmDeleteAlert, showToast } from "@/lib/alerts";

export interface PendingReservationItem {
  id: string;
  startTime: Date;
  endTime: Date;
  purpose: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    department: string | null;
  };
  resource: {
    id: string;
    name: string;
    category: string;
    location: string | null;
  };
}

interface AdminApprovalsClientProps {
  initialReservations: PendingReservationItem[];
}

export function AdminApprovalsClient({ initialReservations }: AdminApprovalsClientProps) {
  const now = new Date();

  // Default: Past 30 days history + Upcoming 30 days
  const [fromDate, setFromDate] = useState(format(subDays(now, 30), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(addDays(now, 30), "yyyy-MM-dd"));
  const [showAll, setShowAll] = useState(false);

  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [isPending, startTransition] = useTransition();

  /** Expired = end time is in the past */
  const isExpired = (item: PendingReservationItem) =>
    isBefore(new Date(item.endTime), now);

  /** Employee edited the reservation (updatedAt significantly after createdAt) */
  const isResubmitted = (item: PendingReservationItem) => {
    const diffMs =
      new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime();
    return diffMs > 30_000;
  };

  /** Unique list of employees for the dropdown selector */
  const uniqueEmployees = useMemo(() => {
    const map = new Map<string, { id: string; name: string; department: string | null }>();
    initialReservations.forEach((item) => {
      if (item.user && !map.has(item.user.id)) {
        map.set(item.user.id, {
          id: item.user.id,
          name: item.user.name,
          department: item.user.department,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [initialReservations]);

  const resetToDefault = () => {
    setShowAll(false);
    setFromDate(format(subDays(now, 30), "yyyy-MM-dd"));
    setToDate(format(addDays(now, 30), "yyyy-MM-dd"));
    setSelectedEmployee("ALL");
  };

  /** Combined filters: Status + Employee + Date Range */
  const filteredItems = useMemo(() => {
    return initialReservations.filter((item) => {
      // Status filter
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;

      // Employee selector filter
      if (selectedEmployee !== "ALL" && item.user.id !== selectedEmployee) return false;

      // Date range filter
      if (!showAll) {
        const start = startOfDay(new Date(fromDate));
        const end = endOfDay(new Date(toDate));
        const itemDate = new Date(item.startTime);
        if (isBefore(itemDate, start) || isAfter(itemDate, end)) return false;
      }

      return true;
    });
  }, [initialReservations, statusFilter, selectedEmployee, fromDate, toDate, showAll]);

  const handleApprove = (item: PendingReservationItem) => {
    startTransition(async () => {
      await approveReservation(item.id);
      showToast(`Reservation for "${item.resource.name}" approved!`, "success");
    });
  };

  const handleReject = async (item: PendingReservationItem) => {
    const confirmed = await confirmDeleteAlert({
      title: "Reject Request?",
      text: `Reject reservation request for "${item.resource.name}" by ${item.user.name}?`,
      confirmButtonText: "Yes, reject request",
      cancelButtonText: "Keep pending",
    });
    if (!confirmed) return;

    startTransition(async () => {
      await rejectReservation(item.id);
      showToast(`Reservation for "${item.resource.name}" rejected.`, "info");
    });
  };

  const getStatusBadge = (item: PendingReservationItem) => {
    // Expired overrides status display for non-terminal statuses
    if (isExpired(item) && (item.status === "APPROVED" || item.status === "PENDING")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-600/40 bg-slate-600/15 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          <TimerOff className="h-2.5 w-2.5" />
          Expired
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          item.status === "APPROVED"
            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : item.status === "PENDING"
            ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
            : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
        }`}
      >
        {item.status}
      </span>
    );
  };

  const cardClass = (item: PendingReservationItem) => {
    const expired = isExpired(item);
    const base =
      "reservation-card flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center";
    return expired ? `${base} is-expired opacity-55 grayscale-[40%] border-slate-700/40` : base;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Reservation Approvals Queue
        </h1>
        <p className="text-sm text-slate-400">
          Review, approve, or reject employee requests for shared PrimeWave resources.
        </p>
      </div>

      {/* ── Filters Bar: Date Range + Employee Selector ── */}
      <div className="glass-card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range Pickers (From / To) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <CalendarRange className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Dates:</span>
            </div>

            {!showAll ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-slate-500 whitespace-nowrap">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="glass-input !py-1 !text-xs"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-slate-500 whitespace-nowrap">To</label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="glass-input !py-1 !text-xs"
                  />
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-1.5">
              {!showAll ? (
                <button
                  onClick={resetToDefault}
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                  title="Reset to default 1 month"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset (1m)
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
                {showAll ? "Custom Dates" : "All Time"}
              </button>
            </div>
          </div>

          {/* Employee Selector Dropdown */}
          <div className="flex items-center gap-2 border-t border-white/5 pt-2 sm:border-t-0 sm:pt-0 sm:border-l sm:border-white/10 sm:pl-4">
            <Users className="h-4 w-4 text-indigo-400 shrink-0" />
            <label htmlFor="employeeSelect" className="text-[11px] font-semibold text-slate-300 whitespace-nowrap">
              Employee:
            </label>
            <select
              id="employeeSelect"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="glass-input !py-1 !text-xs cursor-pointer max-w-[200px]"
            >
              <option value="ALL" className="bg-slate-900 text-white">
                All Employees ({uniqueEmployees.length})
              </option>
              {uniqueEmployees.map((emp) => (
                <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                  {emp.name} {emp.department ? `(${emp.department})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Count */}
        <p className="text-[11px] text-slate-500 whitespace-nowrap self-end lg:self-auto">
          Showing{" "}
          <span className="font-semibold text-slate-300">{filteredItems.length}</span>{" "}
          of{" "}
          <span className="font-semibold text-slate-300">{initialReservations.length}</span>{" "}
          requests
        </p>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((tab) => {
          const count =
            tab === "ALL"
              ? initialReservations.filter((r) =>
                  selectedEmployee === "ALL" ? true : r.user.id === selectedEmployee
                ).length
              : initialReservations.filter(
                  (r) =>
                    r.status === tab &&
                    (selectedEmployee === "ALL" || r.user.id === selectedEmployee)
                ).length;

          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab === "ALL"
                ? `All Requests (${count})`
                : `${tab.charAt(0) + tab.slice(1).toLowerCase()} (${count})`}
            </button>
          );
        })}
      </div>

      {/* ── Requests List ── */}
      {filteredItems.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <Inbox className="h-10 w-10 text-slate-600 mb-3" />
          <p className="text-base font-semibold text-white">No requests match criteria</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {selectedEmployee !== "ALL"
              ? "No reservations found for the selected employee in this view."
              : statusFilter === "PENDING"
              ? "No pending requests in the selected range."
              : `No "${statusFilter.toLowerCase()}" requests found.`}
          </p>
          <button
            onClick={resetToDefault}
            className="mt-4 text-xs text-indigo-400 hover:underline"
          >
            Reset filters to default
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const expired = isExpired(item);
            return (
              <motion.div
                key={item.id}
                whileHover={expired ? undefined : { scale: 1.015, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }}
                className={cardClass(item)}
              >
                <div className="space-y-2">
                  {/* Resource + Badges */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`text-base font-bold ${expired ? "text-slate-500" : "text-white"}`}>
                      {item.resource.name}
                    </span>
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                      {item.resource.category}
                    </span>
                    {getStatusBadge(item)}

                    {/* Re-submitted badge */}
                    {isResubmitted(item) && item.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400">
                        <RefreshCw className="h-2.5 w-2.5" />
                        Re-submitted
                      </span>
                    )}
                  </div>

                  {/* Purpose */}
                  {item.purpose && (
                    <p className={`text-xs font-medium ${expired ? "text-slate-600" : "text-slate-300"}`}>
                      Purpose:{" "}
                      <span className={expired ? "text-slate-600" : "text-slate-400"}>
                        {item.purpose}
                      </span>
                    </p>
                  )}

                  {/* Requester & Schedule */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className={`h-3.5 w-3.5 ${expired ? "text-slate-600" : "text-indigo-400"}`} />
                      <span className={`font-medium ${expired ? "text-slate-500" : "text-white"}`}>
                        {item.user.name}
                      </span>
                      {item.user.department && (
                        <span className="text-slate-600">({item.user.department})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className={`h-3.5 w-3.5 ${expired ? "text-slate-600" : "text-slate-500"}`} />
                      <span className={expired ? "text-slate-600" : ""}>
                        {format(new Date(item.startTime), "EEE, MMM d, yyyy")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className={`h-3.5 w-3.5 ${expired ? "text-slate-600" : "text-cyan-400"}`} />
                      <span className={expired ? "text-slate-600" : ""}>
                        {format(new Date(item.startTime), "h:mm a")} –{" "}
                        {format(new Date(item.endTime), "h:mm a")}
                      </span>
                    </div>

                    {item.resource.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-600" />
                        <span className={expired ? "text-slate-600" : ""}>{item.resource.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Re-submitted timestamp */}
                  {isResubmitted(item) && (
                    <p className="text-[10px] text-violet-400/70">
                      Updated {format(new Date(item.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}
                </div>

                {/* Action Buttons — only for non-expired PENDING */}
                {item.status === "PENDING" && !expired && (
                  <div className="flex items-center gap-2 self-end lg:self-auto">
                    <button
                      onClick={() => handleReject(item)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition-colors hover:bg-emerald-500"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
