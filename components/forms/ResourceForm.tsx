"use client";

import { useTransition, useState } from "react";
import { createResource, updateResource } from "@/lib/actions";
import { showToast, showErrorAlert } from "@/lib/alerts";
import { GlassButton } from "@/components/ui/GlassButton";

interface ResourceData {
  id: string;
  name: string;
  category: string;
  description: string | null;
  capacity: number | null;
  location: string | null;
  isAvailable: boolean;
  isUnderMaintenance: boolean;
}

interface ResourceFormProps {
  resource?: ResourceData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  "Conference Room",
  "Lab Hardware",
  "Equipment",
  "Specialized Tool",
  "Workspace",
];

export function ResourceForm({
  resource,
  onSuccess,
  onCancel,
}: ResourceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!resource;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let res;
      if (isEditing && resource) {
        res = await updateResource(resource.id, formData);
      } else {
        res = await createResource(formData);
      }

      if (res?.error) {
        setError(res.error);
        showErrorAlert(
          isEditing ? "Update Failed" : "Create Failed",
          res.error
        );
      } else {
        const name = (formData.get("name") as string) || resource?.name || "Resource";
        showToast(
          isEditing
            ? `"${name}" updated successfully!`
            : `"${name}" created successfully!`,
          "success"
        );
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Resource Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Resource Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={resource?.name ?? ""}
          placeholder="e.g. Quantum Boardroom (Room 401)"
          className="glass-input"
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Category *
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={resource?.category ?? "Conference Room"}
          className="glass-input [&>option]:bg-[#121722] [&>option]:text-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={resource?.description ?? ""}
          placeholder="Key features, specs, equipment included..."
          className="glass-input resize-none"
        />
      </div>

      {/* Capacity & Location Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="capacity"
            className="mb-1.5 block text-xs font-medium text-slate-300"
          >
            Capacity (persons/units)
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={resource?.capacity ?? ""}
            placeholder="e.g. 12"
            className="glass-input"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="mb-1.5 block text-xs font-medium text-slate-300"
          >
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={resource?.location ?? ""}
            placeholder="e.g. Building B, 2nd Floor"
            className="glass-input"
          />
        </div>
      </div>

      {/* Availability toggle */}
      <div className="flex items-center gap-3 pt-1">
        <input
          id="isAvailable"
          name="isAvailable"
          type="checkbox"
          defaultChecked={resource ? resource.isAvailable : true}
          className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50"
        />
        <label htmlFor="isAvailable" className="text-xs text-slate-300">
          Ready & Available for reservation requests
        </label>
      </div>

      {/* Maintenance Mode toggle */}
      <div className="flex items-center gap-3">
        <input
          id="isUnderMaintenance"
          name="isUnderMaintenance"
          type="checkbox"
          defaultChecked={resource ? resource.isUnderMaintenance : false}
          className="h-4 w-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/50"
        />
        <label htmlFor="isUnderMaintenance" className="text-xs text-amber-300/80">
          Under Maintenance — blocks all employee reservations
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
        <GlassButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
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
          {isEditing ? "Update Resource" : "Create Resource"}
        </GlassButton>
      </div>
    </form>
  );
}
