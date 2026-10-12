"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  CalendarPlus,
  Layers,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { BookingForm } from "@/components/forms/BookingForm";
import { GlassButton } from "@/components/ui/GlassButton";

export interface EmployeeResourceItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  capacity: number | null;
  location: string | null;
  isAvailable: boolean;
  createdAt: Date;
}

interface EmployeeResourcesClientProps {
  resources: EmployeeResourceItem[];
}

export function EmployeeResourcesClient({
  resources,
}: EmployeeResourcesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedResource, setSelectedResource] =
    useState<EmployeeResourceItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Resource Catalog
        </h1>
        <p className="text-sm text-slate-400">
          Browse and reserve meeting spaces, specialized lab hardware, and transport vehicles.
        </p>
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
                  ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20"
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
            <div
              key={res.id}
              className="glass-card flex flex-col justify-between p-5 transition-all hover:border-white/20"
            >
              <div>
                {/* Category & Availability Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300">
                    {res.category}
                  </span>

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
                        In Maintenance
                      </>
                    )}
                  </span>
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

              {/* Action Button */}
              <div className="pt-3 border-t border-white/5">
                <GlassButton
                  onClick={() => handleOpenBooking(res)}
                  disabled={!res.isAvailable}
                  variant={res.isAvailable ? "primary" : "ghost"}
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  {res.isAvailable ? "Reserve Resource" : "Unavailable"}
                </GlassButton>
              </div>
            </div>
          ))}
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
    </div>
  );
}
