"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  format,
  subDays,
  addDays,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowRight,
  Pencil,
  CalendarRange,
  RotateCcw,
  TimerOff,
} from "lucide-react";
import { cancelReservation } from "@/lib/actions";
import { confirmDeleteAlert, showSuccessAlert, showToast } from "@/lib/alerts";
import { GlassButton } from "@/components/ui/GlassButton";
import { Modal } from "@/components/ui/Modal";
import { EditBookingForm } from "@/components/forms/EditBookingForm";

export interface UserReservationItem {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  purpose: string | null;
  createdAt: Date;
  resource: {
    id: string;
    name: string;
    category: string;
    location: string | null;
  };
}

interface MyReservationsClientProps {
  reservations: UserReservationItem[];
}

export function MyReservationsClient({ reservations }: MyReservationsClientProps) {
  const now = new Date();

  // Default: Past 30 days history + Upcoming 30 days
  const [fromDate, setFromDate] = useState(
    format(subDays(now, 30), "yyyy-MM-dd")
  );
  const [toDate, setToDate] = useState(
    format(addDays(now, 30), "yyyy-MM-dd")
  );
  const [showAll, setShowAll] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingReservation, setEditingReservation] =
    useState<UserReservationItem | null>(null);
  const [isPending, startTransition] = useTransition();

  /** A reservation is "expired" if its end time is in the past */
  const isExpired = (item: UserReservationItem) =>
    isBefore(new Date(item.endTime), now);

  /** Apply date-range + status filters */
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Status filter
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;

      // Date-range filter (skip when showAll)
      if (!showAll) {
        const start = startOfDay(new Date(fromDate));
        const end = endOfDay(new Date(toDate));
        const itemDate = new Date(r.startTime);
        if (isBefore(itemDate, start) || isAfter(itemDate, end)) return false;
      }

      return true;
    });
  }, [reservations, statusFilter, fromDate, toDate, showAll]);

  const handleCancel = async (item: UserReservationItem) => {
    const confirmed = await confirmDeleteAlert({
      title: "Cancel Reservation?",
      text: `Are you sure you want to cancel your reservation for "${item.resource.name}"?`,
      confirmButtonText: "Yes, cancel booking",
      cancelButtonText: "Keep booking",
    });

    if (!confirmed) return;

    startTransition(async () => {
      await cancelReservation(item.id);
      showToast(`Reservation for "${item.resource.name}" was cancelled.`, "info");
    });
  };

  const handleEditSuccess = () => {
    const resourceName = editingReservation?.resource.name;
    setEditingReservation(null);
    showSuccessAlert(
      "Reservation Updated",
      `Your reservation for "${resourceName}" has been updated and re-submitted for approval.`
    );
  };

  const resetToDefault = () => {
    setShowAll(false);
    setFromDate(format(subDays(now, 30), "yyyy-MM-dd"));
    setToDate(format(addDays(now, 30), "yyyy-MM-dd"));
  };

  const getStatusBadge = (item: UserReservationItem) => {
    // Expired overrides normal status badge for approved/pending
    if (isExpired(item) && (item.status === "APPROVED" || item.status === "PENDING")) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/40 bg-slate-600/15 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
          <TimerOff className="h-3 w-3" />
          Expired
        </span>
      );
    }

    switch (item.status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
            <Clock className="h-3 w-3" />
            Pending Approval
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
            <Ban className="h-3 w-3" />
            Cancelled
          </span>
        );
    }
  };

  /** Dynamic card styling based on expired state */
  const cardClass = (item: UserReservationItem) => {
    const expired = isExpired(item);
    if (expired) {
      return "reservation-card is-expired flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center opacity-55 grayscale-[40%] border-slate-700/40";
    }
    return "reservation-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center";
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">My Reservations</h1>
          <p className="text-sm text-slate-400">
            Review status, edit or cancel upcoming bookings, and browse history.
          </p>
        </div>
        <Link href="/employee/resources">
          <GlassButton variant="primary" size="md" className="inline-flex items-center gap-2">
            Browse Resources
            <ArrowRight className="h-4 w-4" />
          </GlassButton>
        </Link>
      </div>



      {/* ── Date Range & Calendar Filter ── */}
      <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
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
                  className="glass-input !py-1.5 !text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-500 whitespace-nowrap">To</label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="glass-input !py-1.5 !text-xs"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            {!showAll ? (
              <button
                onClick={resetToDefault}
                className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                title="Reset to default 1 month"
              >
                <RotateCcw className="h-3 w-3" />
                Reset (1 Month)
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
              {showAll ? "Custom Filter" : "All Time"}
            </button>
          </div>
        </div>

        {/* Result count */}
        <p className="text-[11px] text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-300">{filteredReservations.length}</span>{" "}
          of{" "}
          <span className="font-semibold text-slate-300">{reservations.length}</span>{" "}
          reservations
          {!showAll && ` · ${format(new Date(fromDate), "MMM d")} – ${format(new Date(toDate), "MMM d, yyyy")}`}
        </p>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "APPROVED", "PENDING", "CANCELLED", "REJECTED"].map((tab) => {
          const count =
            tab === "ALL"
              ? filteredReservations.length
              : filteredReservations.filter((r) => r.status === tab).length;
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
              {tab === "ALL" ? `All (${count})` : `${tab.charAt(0) + tab.slice(1).toLowerCase()} (${count})`}
            </button>
          );
        })}
      </div>

      {/* ── Reservations List ── */}
      {filteredReservations.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <Calendar className="h-10 w-10 text-slate-600 mb-3" />
          <p className="text-base font-semibold text-white">No reservations found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {statusFilter !== "ALL"
              ? `No "${statusFilter.toLowerCase()}" reservations in the selected date range.`
              : "No reservations match the selected date range."}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => { setShowAll(true); setStatusFilter("ALL"); }}
              className="text-xs text-indigo-400 hover:underline"
            >
              Show all time
            </button>
            <Link href="/employee/resources">
              <GlassButton variant="primary" size="sm">Book a Resource</GlassButton>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((item) => {
            const expired = isExpired(item);
            const canEdit =
              !expired &&
              (item.status === "PENDING" || item.status === "APPROVED");

            return (
              <motion.div
                key={item.id}
                whileHover={expired ? undefined : { scale: 1.015, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }}
                className={cardClass(item)}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`text-base font-bold ${expired ? "text-slate-500" : "text-white"}`}>
                      {item.resource.name}
                    </span>
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                      {item.resource.category}
                    </span>
                    {getStatusBadge(item)}
                  </div>

                  {item.purpose && (
                    <p className={`text-xs font-medium ${expired ? "text-slate-600" : "text-slate-300"}`}>
                      Purpose:{" "}
                      <span className={expired ? "text-slate-600" : "text-slate-400"}>
                        {item.purpose}
                      </span>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className={`h-3.5 w-3.5 ${expired ? "text-slate-600" : "text-indigo-400"}`} />
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
                </div>

                {/* Actions — only for non-expired PENDING/APPROVED */}
                {canEdit && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => setEditingReservation(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/20"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleCancel(item)}
                      disabled={isPending}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Reservation Modal */}
      {editingReservation && (
        <Modal
          isOpen={!!editingReservation}
          onClose={() => setEditingReservation(null)}
          title="Edit Reservation"
        >
          <EditBookingForm
            reservation={editingReservation}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingReservation(null)}
          />
        </Modal>
      )}
    </div>
  );
}
