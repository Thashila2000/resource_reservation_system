"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Layers,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  Flame,
  ShieldAlert,
  Info,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { GlassButton } from "@/components/ui/GlassButton";
import {
  deleteResource,
  toggleResourceAvailability,
  toggleMaintenanceMode,
  updateComplaintStatus,
  deleteComplaint,
} from "@/lib/actions";
import { confirmDeleteAlert, showToast, showErrorAlert } from "@/lib/alerts";

export interface ResourceItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  capacity: number | null;
  location: string | null;
  isAvailable: boolean;
  isUnderMaintenance: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    reservations: number;
    complaints?: number;
  };
}

export interface AdminComplaintItem {
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
    isUnderMaintenance: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
  };
}

interface AdminResourcesClientProps {
  initialResources: ResourceItem[];
  initialComplaints?: AdminComplaintItem[];
}

export function AdminResourcesClient({
  initialResources,
  initialComplaints = [],
}: AdminResourcesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"resources" | "complaints">("resources");
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [complaints, setComplaints] = useState<AdminComplaintItem[]>(initialComplaints);

  // Resource Filters & Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Complaint Filters & Status Modal
  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<string>("ALL");
  const [complaintSeverityFilter, setComplaintSeverityFilter] = useState<string>("ALL");
  const [filterResourceId, setFilterResourceId] = useState<string | null>(null);
  const [resolvingComplaint, setResolvingComplaint] = useState<AdminComplaintItem | null>(null);
  const [resolveStatus, setResolveStatus] = useState<"OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED">("IN_PROGRESS");
  const [resolveNotes, setResolveNotes] = useState("");

  const [isPending, startTransition] = useTransition();

  // Keep state in sync with server props whenever revalidated
  useEffect(() => {
    setResources(initialResources);
  }, [initialResources]);

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

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (filterResourceId && c.resourceId !== filterResourceId) return false;
    if (complaintStatusFilter !== "ALL" && c.status !== complaintStatusFilter) return false;
    if (complaintSeverityFilter !== "ALL" && c.severity !== complaintSeverityFilter) return false;

    if (complaintSearch.trim()) {
      const q = complaintSearch.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchRes = c.resource.name.toLowerCase().includes(q);
      const matchUser =
        c.user.name.toLowerCase().includes(q) ||
        c.user.email.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchRes && !matchUser) return false;
    }

    return true;
  });

  const openComplaintsCount = complaints.filter(
    (c) => c.status === "OPEN" || c.status === "IN_PROGRESS"
  ).length;

  const handleOpenCreate = () => {
    setEditingResource(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (resource: ResourceItem) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
  };

  const handleFormSuccess = (savedResource?: ResourceItem) => {
    if (savedResource) {
      setResources((prev) => {
        const index = prev.findIndex((r) => r.id === savedResource.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...savedResource,
            _count: savedResource._count ?? updated[index]._count,
          };
          return updated;
        }
        return [savedResource, ...prev];
      });
    }
    router.refresh();
    handleCloseModal();
  };

  const handleDelete = async (resource: ResourceItem) => {
    const confirmed = await confirmDeleteAlert({
      title: `Delete "${resource.name}"?`,
      text: `This will permanently delete the resource and all its associated booking and complaint history. This action cannot be undone.`,
      confirmButtonText: "Yes, delete resource",
      cancelButtonText: "Keep resource",
    });

    if (!confirmed) return;

    // Optimistically remove from state
    setResources((prev) => prev.filter((r) => r.id !== resource.id));

    startTransition(async () => {
      const res = await deleteResource(resource.id);
      if (res?.error) {
        setResources(initialResources);
        showErrorAlert("Delete Failed", res.error);
      } else {
        showToast(`"${resource.name}" has been deleted.`, "success");
        router.refresh();
      }
    });
  };

  const handleToggle = (resource: ResourceItem) => {
    const newStatus = !resource.isAvailable;
    // Optimistic update
    setResources((prev) =>
      prev.map((r) => (r.id === resource.id ? { ...r, isAvailable: newStatus } : r))
    );
    startTransition(async () => {
      const res = await toggleResourceAvailability(resource.id, newStatus);
      if (res?.error) {
        setResources((prev) =>
          prev.map((r) => (r.id === resource.id ? { ...r, isAvailable: resource.isAvailable } : r))
        );
        showErrorAlert("Update Failed", res.error);
      } else {
        showToast(
          `"${resource.name}" marked as ${newStatus ? "Available" : "Unavailable"}.`,
          "info"
        );
      }
    });
  };

  const handleToggleMaintenance = (resource: { id: string; name: string; isUnderMaintenance: boolean }) => {
    const newMaintenance = !resource.isUnderMaintenance;
    // Optimistic update in resources state
    setResources((prev) =>
      prev.map((r) => (r.id === resource.id ? { ...r, isUnderMaintenance: newMaintenance } : r))
    );
    // Optimistic update in complaints state
    setComplaints((prev) =>
      prev.map((c) =>
        c.resourceId === resource.id
          ? { ...c, resource: { ...c.resource, isUnderMaintenance: newMaintenance } }
          : c
      )
    );

    startTransition(async () => {
      const res = await toggleMaintenanceMode(resource.id, newMaintenance);
      if (res?.error) {
        setResources((prev) =>
          prev.map((r) => (r.id === resource.id ? { ...r, isUnderMaintenance: resource.isUnderMaintenance } : r))
        );
        showErrorAlert("Update Failed", res.error);
      } else {
        showToast(
          `"${resource.name}" ${newMaintenance ? "placed under maintenance." : "removed from maintenance mode."}`,
          newMaintenance ? "warning" : "success"
        );
      }
    });
  };

  // Jump to complaints filtered by a resource
  const handleFilterComplaintsByResource = (resourceId: string) => {
    setFilterResourceId(resourceId);
    setActiveTab("complaints");
  };

  // Open resolve modal
  const handleOpenResolveModal = (complaint: AdminComplaintItem) => {
    setResolvingComplaint(complaint);
    setResolveStatus(complaint.status === "OPEN" ? "IN_PROGRESS" : complaint.status);
    setResolveNotes(complaint.adminNotes || "");
  };

  const handleCloseResolveModal = () => {
    setResolvingComplaint(null);
    setResolveNotes("");
  };

  const handleSaveComplaintStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint) return;

    const complaintId = resolvingComplaint.id;
    const newStatus = resolveStatus;
    const newNotes = resolveNotes.trim() || undefined;

    // Optimistically update
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId ? { ...c, status: newStatus, adminNotes: newNotes || null } : c
      )
    );

    handleCloseResolveModal();

    startTransition(async () => {
      const res = await updateComplaintStatus(complaintId, newStatus, newNotes);
      if (res?.error) {
        setComplaints(initialComplaints);
        showErrorAlert("Update Failed", res.error);
      } else {
        showToast(`Complaint status updated to ${newStatus.replace("_", " ")}.`, "success");
        router.refresh();
      }
    });
  };

  const handleDeleteComplaint = async (complaint: AdminComplaintItem) => {
    const confirmed = await confirmDeleteAlert({
      title: `Delete this issue report?`,
      text: `Report "${complaint.title}" for ${complaint.resource.name} will be permanently removed.`,
      confirmButtonText: "Yes, delete report",
      cancelButtonText: "Cancel",
    });

    if (!confirmed) return;

    setComplaints((prev) => prev.filter((c) => c.id !== complaint.id));

    startTransition(async () => {
      const res = await deleteComplaint(complaint.id);
      if (res?.error) {
        setComplaints(initialComplaints);
        showErrorAlert("Delete Failed", res.error);
      } else {
        showToast("Report deleted successfully.", "success");
        router.refresh();
      }
    });
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
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Resource Management
          </h1>
          <p className="text-sm text-slate-400">
            Manage PrimeWave Lab rooms, hardware assets, and review employee damage reports.
          </p>
        </div>

        {activeTab === "resources" && (
          <GlassButton
            onClick={handleOpenCreate}
            variant="primary"
            size="md"
            className="inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </GlassButton>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "resources"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          Resources Directory ({resources.length})
        </button>

        <button
          onClick={() => setActiveTab("complaints")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "complaints"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          Damage & Issue Reports
          {openComplaintsCount > 0 ? (
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
              {openComplaintsCount} Active
            </span>
          ) : complaints.length > 0 ? (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              {complaints.length}
            </span>
          ) : null}
        </button>
      </div>

      {/* TAB 1: Resources Management */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, or details..."
                className="glass-input !py-2 !pl-9 text-xs"
              />
            </div>

            {/* Category Pills */}
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

          {/* Resource Cards Grid */}
          {filteredResources.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
              <Layers className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-base font-semibold text-white">
                No resources found
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchQuery || selectedCategory !== "ALL"
                  ? "Try adjusting your search terms or category filters."
                  : "Get started by adding your first organizational resource."}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((res) => (
                <motion.div
                  key={res.id}
                  whileHover={{ scale: 1.018, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }}
                  className="glass-card flex flex-col justify-between p-5 will-change-transform"
                >
                  <div>
                    {/* Header: Category, Maintenance & Availability Badge */}
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

                        {/* Availability Toggle */}
                        <button
                          onClick={() => handleToggle(res)}
                          title="Click to toggle availability"
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                            res.isAvailable
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
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
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-base font-bold text-white mb-1.5">
                      {res.name}
                    </h3>

                    {/* Description */}
                    {res.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {res.description}
                      </p>
                    )}

                    {/* Metadata Pills */}
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
                          <span>Cap: {res.capacity}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        {res._count?.reservations ?? 0} bookings
                      </span>

                      {/* Complaint Pill if any */}
                      {(res._count?.complaints ?? 0) > 0 && (
                        <button
                          onClick={() => handleFilterComplaintsByResource(res.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                          title="Click to view open damage reports for this resource"
                        >
                          <AlertTriangle className="h-3 w-3 text-rose-400" />
                          {res._count?.complaints} Issue{res._count?.complaints === 1 ? "" : "s"}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Maintenance Toggle */}
                      <button
                        onClick={() => handleToggleMaintenance(res)}
                        disabled={isPending}
                        title={res.isUnderMaintenance ? "Remove from maintenance" : "Put under maintenance"}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
                          res.isUnderMaintenance
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                            : "border-white/10 bg-white/5 text-slate-400 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
                        }`}
                      >
                        <Wrench className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(res)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                        title="Edit Resource"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(res)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        title="Delete Resource"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Damage & Issue Reports (Complaints) */}
      {activeTab === "complaints" && (
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
              <span className="text-[11px] font-medium text-rose-300">Open & Urgent</span>
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

          {/* Filter Toolbar */}
          <div className="glass-card flex flex-col gap-3 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  placeholder="Search by resource, reporter, defect title..."
                  className="glass-input !py-2 !pl-9 text-xs"
                />
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
                {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setComplaintStatusFilter(st)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      complaintStatusFilter === st
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                        : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {st === "ALL" ? "All Statuses" : st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity and Resource Filter Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Severity:</span>
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setComplaintSeverityFilter(sev)}
                    className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                      complaintSeverityFilter === sev
                        ? "bg-white/15 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              {filterResourceId && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-300 text-[11px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    Filtered by resource: {resources.find((r) => r.id === filterResourceId)?.name ?? "Selected Resource"}
                  </span>
                  <button
                    onClick={() => setFilterResourceId(null)}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Complaints List */}
          {filteredComplaints.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/60 mb-3" />
              <p className="text-base font-semibold text-white">
                No damage reports found
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {complaintSearch || complaintStatusFilter !== "ALL" || filterResourceId
                  ? "No reports match your current filter settings."
                  : "All organizational resources are operating with no open damage or malfunction reports."}
              </p>
              {(complaintSearch || complaintStatusFilter !== "ALL" || filterResourceId) && (
                <button
                  onClick={() => {
                    setComplaintSearch("");
                    setComplaintStatusFilter("ALL");
                    setComplaintSeverityFilter("ALL");
                    setFilterResourceId(null);
                  }}
                  className="mt-4 text-xs font-semibold text-indigo-400 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredComplaints.map((c) => (
                <motion.div
                  key={c.id}
                  whileHover={{ scale: 1.018, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }}
                  whileTap={{ scale: 0.99 }}
                  className="glass-card flex flex-col justify-between p-5 will-change-transform"
                >
                  <div className="space-y-3">
                    {/* Header: Resource info + badges */}
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {c.resource.name}
                          </h3>
                          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300">
                            {c.resource.category}
                          </span>
                          {c.resource.isUnderMaintenance && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                              <Wrench className="h-2.5 w-2.5" />
                              Under Maintenance
                            </span>
                          )}
                        </div>
                        {c.resource.location && (
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
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

                    {/* Reporter info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500">Reported by: </span>
                        <span className="text-slate-200 font-medium">{c.user.name}</span>
                        <span className="text-slate-500"> ({c.user.email})</span>
                        {c.user.department && (
                          <span className="text-slate-500"> • {c.user.department}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(c.createdAt).toLocaleDateString()} at{" "}
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {/* Report Description */}
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 text-[10px] font-semibold">
                          {c.category}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {c.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
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
                        <p className="text-slate-300 leading-relaxed">{c.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      {/* Maintenance Toggle */}
                      <button
                        onClick={() =>
                          handleToggleMaintenance({
                            id: c.resourceId,
                            name: c.resource.name,
                            isUnderMaintenance: c.resource.isUnderMaintenance,
                          })
                        }
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          c.resource.isUnderMaintenance
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                            : "border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                        }`}
                        title={
                          c.resource.isUnderMaintenance
                            ? "Remove resource from maintenance mode"
                            : "Put resource under maintenance to block reservations"
                        }
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        {c.resource.isUnderMaintenance
                          ? "Remove Maintenance"
                          : "Put Under Maintenance"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenResolveModal(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Update Status & Notes
                      </button>

                      <button
                        onClick={() => handleDeleteComplaint(c)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Resource Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingResource ? "Edit Resource" : "Create New Resource"}
      >
        <ResourceForm
          resource={editingResource}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Update Complaint Status & Notes Modal */}
      {resolvingComplaint && (
        <Modal
          isOpen={!!resolvingComplaint}
          onClose={handleCloseResolveModal}
          title="Review & Update Issue Report"
        >
          <form onSubmit={handleSaveComplaintStatus} className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
              <span className="font-semibold text-slate-300">
                {resolvingComplaint.resource.name}
              </span>
              <p className="text-slate-400 mt-0.5">
                Issue: {resolvingComplaint.title} ({resolvingComplaint.category})
              </p>
            </div>

            {/* Status Selector */}
            <div>
              <label
                htmlFor="resolveStatus"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Report Status *
              </label>
              <select
                id="resolveStatus"
                value={resolveStatus}
                onChange={(e) =>
                  setResolveStatus(
                    e.target.value as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED"
                  )
                }
                className="glass-input [&>option]:bg-[#121722] [&>option]:text-white"
              >
                <option value="OPEN">Open (Requires attention)</option>
                <option value="IN_PROGRESS">In Progress (Work ongoing / parts ordered)</option>
                <option value="RESOLVED">Resolved (Repaired / operational)</option>
                <option value="DISMISSED">Dismissed (Not an issue / invalid)</option>
              </select>
            </div>

            {/* Admin Resolution Notes */}
            <div>
              <label
                htmlFor="resolveNotes"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Admin Resolution Notes (Visible to employee)
              </label>
              <textarea
                id="resolveNotes"
                rows={4}
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="e.g. Technician dispatched, cable replaced, item restored to service..."
                className="glass-input resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseResolveModal}
                disabled={isPending}
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isPending}
              >
                Save Changes
              </GlassButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
