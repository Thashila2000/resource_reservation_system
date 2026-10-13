"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import {
  Wrench,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export interface MaintenanceResourceItem {
  id: string;
  name: string;
  category: string;
  location: string | null;
  description: string | null;
  updatedAt: Date;
  complaints?: {
    id: string;
    title: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    adminNotes: string | null;
  }[];
}

interface EmployeeDashboardMaintenanceClientProps {
  resources: MaintenanceResourceItem[];
}

export function EmployeeDashboardMaintenanceClient({
  resources,
}: EmployeeDashboardMaintenanceClientProps) {
  const hasMaintenance = resources.length > 0;

  return (
    <div className="glass-card no-hover p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
              <Wrench className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-base font-bold text-white">
              Currently Under Maintenance
            </h2>
            {hasMaintenance ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {resources.length} {resources.length === 1 ? "Resource" : "Resources"} Offline
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                All Operational
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Real-time advisory on lab hardware, workstations, and rooms temporarily taken offline for repairs or routine service.
          </p>
        </div>

        <Link
          href="/employee/resources"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View All Resources
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Content */}
      {!hasMaintenance ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">All Systems Operational</p>
              <p className="text-slate-400 mt-0.5">
                No organizational resources are currently undergoing maintenance. All active rooms and equipment are available for reservation.
              </p>
            </div>
          </div>
          <Link
            href="/employee/resources"
            className="hidden md:inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            Browse Available
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((res) => {
            const activeComplaint = res.complaints && res.complaints.length > 0 ? res.complaints[0] : null;

            return (
              <motion.div
                key={res.id}
                whileHover={{
                  scale: 1.018,
                  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] },
                }}
                whileTap={{ scale: 0.99 }}
                className="glass-card flex flex-col justify-between p-5 border border-amber-500/25 bg-amber-500/[0.02] will-change-transform"
              >
                <div className="space-y-3">
                  {/* Category + Maintenance Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300">
                      {res.category}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                      <Wrench className="h-3 w-3" />
                      In Maintenance
                    </span>
                  </div>

                  {/* Resource Name and Location */}
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {res.name}
                    </h3>
                    {res.location && (
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {res.location}
                      </p>
                    )}
                  </div>

                  {/* Resource Description */}
                  {res.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  {/* Active Issue Report or Service Reason */}
                  {activeComplaint && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-0.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Maintenance Reason:</span>
                      </div>
                      <p className="text-slate-200 font-medium">
                        {activeComplaint.title}
                      </p>
                      {activeComplaint.adminNotes && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          &quot;{activeComplaint.adminNotes}&quot;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Notice */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Reservation Disabled
                  </span>
                  <span>
                    Last updated {format(new Date(res.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
