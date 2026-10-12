"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  MapPin,
  Check,
  X,
  Inbox,
} from "lucide-react";
import { approveReservation, rejectReservation } from "@/lib/actions";

export interface PendingReservationItem {
  id: string;
  startTime: Date;
  endTime: Date;
  purpose: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: Date;
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

export function AdminApprovalsClient({
  initialReservations,
}: AdminApprovalsClientProps) {
  const [filter, setFilter] = useState<string>("PENDING");
  const [isPending, startTransition] = useTransition();

  const filteredItems = initialReservations.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveReservation(id);
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      await rejectReservation(id);
    });
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((tab) => (
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
              ? `All Requests (${initialReservations.length})`
              : `${tab.charAt(0) + tab.slice(1).toLowerCase()} (${
                  initialReservations.filter((r) => r.status === tab).length
                })`}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredItems.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <Inbox className="h-10 w-10 text-slate-600 mb-3" />
          <p className="text-base font-semibold text-white">
            Queue is clear
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {filter === "PENDING"
              ? "There are no pending reservation requests waiting for approval."
              : `No requests with status "${filter.toLowerCase()}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card flex flex-col justify-between gap-4 p-5 transition-all hover:border-white/20 lg:flex-row lg:items-center"
            >
              <div className="space-y-2">
                {/* Resource + Status Badge */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-base font-bold text-white">
                    {item.resource.name}
                  </span>
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                    {item.resource.category}
                  </span>
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
                </div>

                {/* Purpose */}
                {item.purpose && (
                  <p className="text-xs font-medium text-slate-300">
                    Purpose: <span className="text-slate-400">{item.purpose}</span>
                  </p>
                )}

                {/* Requester & Schedule details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-white font-medium">
                      {item.user.name}
                    </span>
                    {item.user.department && (
                      <span className="text-slate-500">
                        ({item.user.department})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
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

              {/* Action Buttons for Pending */}
              {item.status === "PENDING" && (
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <button
                    onClick={() => handleReject(item.id)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition-colors hover:bg-emerald-500"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
