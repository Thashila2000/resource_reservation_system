"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { GlassButton } from "@/components/ui/GlassButton";
import { deleteResource, toggleResourceAvailability } from "@/lib/actions";
import { confirmDeleteAlert, showToast, showErrorAlert } from "@/lib/alerts";

export interface ResourceItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  capacity: number | null;
  location: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    reservations: number;
  };
}

interface AdminResourcesClientProps {
  initialResources: ResourceItem[];
}

export function AdminResourcesClient({
  initialResources,
}: AdminResourcesClientProps) {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Keep state in sync with server props
  if (resources !== initialResources && !isPending && initialResources.length !== resources.length) {
    setResources(initialResources);
  }

  const categories = [
    "ALL",
    ...Array.from(new Set(initialResources.map((r) => r.category))),
  ];

  const filteredResources = initialResources.filter((r) => {
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

  const handleDelete = async (resource: ResourceItem) => {
    const confirmed = await confirmDeleteAlert({
      title: `Delete "${resource.name}"?`,
      text: `This will permanently delete the resource and all its associated booking history. This action cannot be undone.`,
      confirmButtonText: "Yes, delete resource",
      cancelButtonText: "Keep resource",
    });

    if (!confirmed) return;

    startTransition(async () => {
      const res = await deleteResource(resource.id);
      if (res?.error) {
        showErrorAlert("Delete Failed", res.error);
      } else {
        showToast(`"${resource.name}" has been deleted.`, "success");
      }
    });
  };

  const handleToggle = (resource: ResourceItem) => {
    const newStatus = !resource.isAvailable;
    startTransition(async () => {
      await toggleResourceAvailability(resource.id, newStatus);
      showToast(
        `"${resource.name}" marked as ${newStatus ? "Available" : "Unavailable"}.`,
        "info"
      );
    });
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
            Create, update, and manage PrimeWave Lab rooms, equipment, and assets.
          </p>
        </div>
        <GlassButton
          onClick={handleOpenCreate}
          variant="primary"
          size="md"
          className="inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </GlassButton>
      </div>

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
                  ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20"
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
                {/* Header: Category & Availability Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300">
                    {res.category}
                  </span>

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
                <span className="text-[11px] text-slate-500">
                  {res._count?.reservations ?? 0} bookings
                </span>

                <div className="flex items-center gap-1.5">
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingResource ? "Edit Resource" : "Create New Resource"}
      >
        <ResourceForm
          resource={editingResource}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
