"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  CalendarPlus,
  Layers,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  ShieldAlert,
  Flame,
  Info,
  FileText,
  PlusCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { BookingForm } from "@/components/forms/BookingForm";
import { ComplaintForm } from "@/components/forms/ComplaintForm";
import { GlassButton } from "@/components/ui/GlassButton";

export interface EmployeeResourceItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  capacity: number | null;
  location: string | null;
  isAvailable: boolean;
  isUnderMaintenance: boolean;
  createdAt: Date;
}

export interface UserComplaintItem {
  id: string;
  resourceId: string;
  title: string;
  category: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
  adminNotes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  resource: {
    id: string;
    name: string;
    category: string;
    location?: string | null;
  };
}

interface EmployeeResourcesClientProps {
  resources: EmployeeResourceItem[];
  initialComplaints?: UserComplaintItem[];
}

export function EmployeeResourcesClient({
  resources,
  initialComplaints = [],
}: EmployeeResourcesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"catalog" | "my-reports">("catalog");
  const [complaints, setComplaints] = useState<UserComplaintItem[]>(initialComplaints);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Booking Modal
  const [selectedResource, setSelectedResource] =
    useState<EmployeeResourceItem | null>(null);

  // Complaint / Report Modal
  const [reportingResource, setReportingResource] =
    useState<EmployeeResourceItem | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setComplaints(initialComplaints);
  }, [initialComplaints]);

  const categories = [
    "ALL",
    ...Array.from(new Set(resources.map((r) => r.category))),
  ];

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location &&
        r.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.description &&
        r.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || r.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenBooking = (resource: EmployeeResourceItem) => {
    setSelectedResource(resource);
  };

  const handleCloseBooking = () => {
    setSelectedResource(null);
  };

  const handleBookingSuccess = () => {
    const resourceName = selectedResource?.name;
    setSelectedResource(null);
    setSuccessMessage(
      `Reservation submitted for ${resourceName}! You can track its status in "My Reservations".`
    );
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handleOpenReport = (resource?: EmployeeResourceItem) => {
    setReportingResource(resource || null);
    setIsReportModalOpen(true);
  };

  const handleCloseReport = () => {
    setIsReportModalOpen(false);
    setReportingResource(null);
  };

  const handleReportSuccess = (newComplaint?: UserComplaintItem) => {
    if (newComplaint) {
      setComplaints((prev) => [newComplaint, ...prev]);
    }
    router.refresh();
    handleCloseReport();
    setSuccessMessage(
      "Your damage/issue report has been submitted to administrators. You can track updates in the 'My Damage Reports' tab."
    );
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
            <Flame className="h-3 w-3" />
            Critical
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-orange-300">
            <ShieldAlert className="h-3 w-3" />
            High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
            <AlertTriangle className="h-3 w-3" />
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
            <Info className="h-3 w-3" />
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
            <Clock className="h-3 w-3" />
            Open
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400">
            <Wrench className="h-3 w-3" />
            In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </span>
        );
      case "DISMISSED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
            <XCircle className="h-3 w-3" />
            Dismissed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Resource Catalog
          </h1>
          <p className="text-sm text-slate-400">
            Browse and reserve workspaces, lab gear, or report damages and equipment defects.
          </p>
        </div>

        <GlassButton
          onClick={() => handleOpenReport()}
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2 self-start sm:self-auto border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
        >
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          Report Damage / Issue
        </GlassButton>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "catalog"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          Browse Resources ({resources.length})
        </button>

        <button
          onClick={() => setActiveTab("my-reports")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "my-reports"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          My Reported Issues
          {complaints.length > 0 && (
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
              {complaints.length}
            </span>
          )}
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: Resource Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Search & Category Filter Toolbar */}
          <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources by name, specs, location..."
                className="glass-input !py-2 !pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Cards */}
          {filteredResources.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
              <Layers className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-base font-semibold text-white">
                No matching resources found
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Try adjusting your search criteria or switching to a different category filter.
              </p>
              {(searchQuery || selectedCategory !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                  }}
                  className="mt-4 text-xs font-semibold text-indigo-400 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((res) => (
                <motion.div
                  key={res.id}
                  whileHover={{
                    scale: 1.018,
                    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] },
                  }}
                  className="glass-card flex flex-col justify-between p-5 will-change-transform"
                >
                  <div>
                    {/* Category & Status Tags */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300">
                        {res.category}
                      </span>

                      <div className="flex flex-col items-end gap-1.5">
                        {/* Maintenance Badge */}
                        {res.isUnderMaintenance && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                            <Wrench className="h-3 w-3" />
                            Under Maintenance
                          </span>
                        )}

                        {/* Availability Badge */}
                        {!res.isUnderMaintenance && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              res.isAvailable
                                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {res.isAvailable ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Unavailable
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Resource Title */}
                    <h3 className="text-base font-bold text-white mb-1.5">
                      {res.name}
                    </h3>

                    {/* Description */}
                    {res.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {res.description}
                      </p>
                    )}

                    {/* Location & Capacity */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
                      {res.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span>{res.location}</span>
                        </div>
                      )}

                      {res.capacity !== null && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          <span>Capacity: {res.capacity}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    {res.isUnderMaintenance ? (
                      <div className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400">
                        <Wrench className="h-3.5 w-3.5" />
                        Under Maintenance
                      </div>
                    ) : (
                      <GlassButton
                        onClick={() => handleOpenBooking(res)}
                        disabled={!res.isAvailable}
                        variant={res.isAvailable ? "primary" : "ghost"}
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        {res.isAvailable ? "Reserve" : "Unavailable"}
                      </GlassButton>
                    )}

                    {/* Report Damage button */}
                    <button
                      type="button"
                      onClick={() => handleOpenReport(res)}
                      title="Report damage or defect for this resource"
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-rose-300 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                      <span className="hidden sm:inline">Report Damage</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Reported Issues */}
      {activeTab === "my-reports" && (
        <div className="space-y-6">
          {/* Metrics summary banner */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <motion.div
              whileHover={{ scale: 1.018, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }}
              whileTap={{ scale: 0.99 }}
              className="glass-card p-4 will-change-transform"
            >
              <span className="text-[11px] font-medium text-slate-400">Total Reports</span>
              <p className="mt-1 text-2xl font-bold text-white">{complaints.length}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.018, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }}
              whileTap={{ scale: 0.99 }}
              className="glass-card p-4 border-rose-500/20 bg-rose-500/5 will-change-transform"
            >
              <span className="text-[11px] font-medium text-rose-300">Open & Pending</span>
              <p className="mt-1 text-2xl font-bold text-rose-400">
                {complaints.filter((c) => c.status === "OPEN").length}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.018, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }}
              whileTap={{ scale: 0.99 }}
              className="glass-card p-4 border-indigo-500/20 bg-indigo-500/5 will-change-transform"
            >
              <span className="text-[11px] font-medium text-indigo-300">In Progress</span>
              <p className="mt-1 text-2xl font-bold text-indigo-400">
                {complaints.filter((c) => c.status === "IN_PROGRESS").length}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.018, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }}
              whileTap={{ scale: 0.99 }}
              className="glass-card p-4 border-emerald-500/20 bg-emerald-500/5 will-change-transform"
            >
              <span className="text-[11px] font-medium text-emerald-300">Resolved</span>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {complaints.filter((c) => c.status === "RESOLVED").length}
              </p>
            </motion.div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing {complaints.length} issue {complaints.length === 1 ? "report" : "reports"} filed by you.
            </p>
            <GlassButton
              onClick={() => handleOpenReport()}
              variant="primary"
              size="sm"
              className="inline-flex items-center gap-2 !bg-rose-600 hover:!bg-rose-500"
            >
              <PlusCircle className="h-4 w-4" />
              File New Damage Report
            </GlassButton>
          </div>

          {complaints.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/60 mb-3" />
              <p className="text-base font-semibold text-white">
                No damage reports submitted
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Notice broken furniture, faulty electronics, or missing gear? Use the damage reporting form to notify administrators immediately.
              </p>
              <button
                onClick={() => handleOpenReport()}
                className="mt-4 rounded-lg bg-rose-600/20 border border-rose-500/30 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-600/30"
              >
                File an Issue Report
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {complaints.map((c) => (
                <motion.div
                  key={c.id}
                  whileHover={{
                    scale: 1.018,
                    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] },
                  }}
                  whileTap={{ scale: 0.99 }}
                  className="glass-card flex flex-col justify-between p-5 will-change-transform"
                >
                  <div className="space-y-3">
                    {/* Header: Resource info, severity, status */}
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">
                            {c.resource.name}
                          </h3>
                          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300">
                            {c.resource.category}
                          </span>
                        </div>
                        {c.resource.location && (
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {c.resource.location}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {getSeverityBadge(c.severity)}
                        {getStatusBadge(c.status)}
                      </div>
                    </div>

                    {/* Complaint Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                          {c.category}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-200">
                          {c.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line mt-1">
                        {c.description}
                      </p>
                    </div>

                    {/* Admin Response Note */}
                    {c.adminNotes && (
                      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs">
                        <span className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
                          <FileText className="h-3.5 w-3.5" />
                          Admin Resolution Note:
                        </span>
                        <p className="text-slate-300">{c.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Timestamp */}
                  <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Reported on {new Date(c.createdAt).toLocaleDateString()} at{" "}
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="capitalize">
                      Status: {c.status.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedResource && (
        <Modal
          isOpen={!!selectedResource}
          onClose={handleCloseBooking}
          title="Reserve Resource"
        >
          <BookingForm
            resource={selectedResource}
            onSuccess={handleBookingSuccess}
            onCancel={handleCloseBooking}
          />
        </Modal>
      )}

      {/* Report Damage Modal */}
      {isReportModalOpen && (
        <Modal
          isOpen={isReportModalOpen}
          onClose={handleCloseReport}
          title="Report Resource Damage / Issue"
        >
          <ComplaintForm
            resource={reportingResource}
            availableResources={resources}
            onSuccess={handleReportSuccess}
            onCancel={handleCloseReport}
          />
        </Modal>
      )}
    </div>
  );
}

