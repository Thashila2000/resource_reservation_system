"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowRight,
} from "lucide-react";
import { cancelReservation } from "@/lib/actions";
import { GlassButton } from "@/components/ui/GlassButton";

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

export function MyReservationsClient({
  reservations,
}: MyReservationsClientProps) {
  const [filter, setFilter] = useState<string>("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredReservations = reservations.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const handleCancel = (id: string) => {
    startTransition(async () => {
      await cancelReservation(id);
      setCancellingId(null);
    });
  };

  const getStatusBadge = (status: UserReservationItem["status"]) => {
    switch (status) {
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            My Reservations
          </h1>
          <p className="text-sm text-slate-400">
            Review status, upcoming schedules, or cancel pending bookings.
          </p>
        </div>

        <Link href="/employee/resources">
          <GlassButton
            variant="primary"
            size="md"
            className="inline-flex items-center gap-2"
          >
            Browse Resources
            <ArrowRight className="h-4 w-4" />
          </GlassButton>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "APPROVED", "PENDING", "CANCELLED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter === tab
                ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20"
                : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab === "ALL"
              ? `All (${reservations.length})`
              : `${tab.charAt(0) + tab.slice(1).toLowerCase()} (${
                  reservations.filter((r) => r.status === tab).length
                })`}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <Calendar className="h-10 w-10 text-slate-600 mb-3" />
          <p className="text-base font-semibold text-white">
            No reservations found
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {filter !== "ALL"
              ? `You don't have any reservations with "${filter.toLowerCase()}" status.`
              : "You haven't requested any resource bookings yet."}
          </p>
          <Link href="/employee/resources" className="mt-4">
            <GlassButton variant="primary" size="sm">
              Book a Resource Now
            </GlassButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((item) => (
            <div
              key={item.id}
              className="glass-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-base font-bold text-white">
                    {item.resource.name}
                  </span>
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                    {item.resource.category}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                {item.purpose && (
                  <p className="text-xs text-slate-300 font-medium">
                    Purpose: <span className="text-slate-400">{item.purpose}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <span>
                      {format(new Date(item.startTime), "EEE, MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>
                      {format(new Date(item.startTime), "h:mm a")} –{" "}
                      {format(new Date(item.endTime), "h:mm a")}
                    </span>
                  </div>

                  {item.resource.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.resource.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cancellation button */}
              {(item.status === "PENDING" || item.status === "APPROVED") && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {cancellingId === item.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCancel(item.id)}
                        disabled={isPending}
                        className="rounded-lg bg-red-600/80 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600"
                      >
                        Confirm Cancel
                      </button>
                      <button
                        onClick={() => setCancellingId(null)}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Back
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCancellingId(item.id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
