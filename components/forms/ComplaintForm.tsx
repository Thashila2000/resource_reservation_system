"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { submitComplaint } from "@/lib/actions";
import { showToast, showErrorAlert } from "@/lib/alerts";
import { GlassButton } from "@/components/ui/GlassButton";
import {
  AlertTriangle,
  Flame,
  Info,
  ShieldAlert,
  MapPin,
  Layers,
} from "lucide-react";

export interface ResourceSummary {
  id: string;
  name: string;
  category: string;
  location?: string | null;
}

interface ComplaintFormProps {
  resource?: ResourceSummary | null;
  availableResources?: ResourceSummary[];
  onSuccess: (complaint?: any) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  "Physical Damage",
  "Hardware Malfunction",
  "Missing Items / Accessories",
  "Facility / Environmental",
  "Software / Network",
  "Other Issue",
];

const SEVERITIES = [
  {
    value: "LOW",
    label: "Low",
    desc: "Cosmetic or minor flaw",
    icon: Info,
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    selectedColor: "ring-2 ring-blue-500 bg-blue-500/20 text-blue-300",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    desc: "Partially impaired",
    icon: AlertTriangle,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    selectedColor: "ring-2 ring-amber-500 bg-amber-500/20 text-amber-300",
  },
  {
    value: "HIGH",
    label: "High",
    desc: "Unusable or broken",
    icon: ShieldAlert,
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    selectedColor: "ring-2 ring-orange-500 bg-orange-500/20 text-orange-300",
  },
  {
    value: "CRITICAL",
    label: "Critical",
    desc: "Safety hazard or urgent",
    icon: Flame,
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    selectedColor: "ring-2 ring-rose-500 bg-rose-500/20 text-rose-300",
  },
];

export function ComplaintForm({
  resource,
  availableResources,
  onSuccess,
  onCancel,
}: ComplaintFormProps) {
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    resource?.id || (availableResources?.[0]?.id ?? "")
  );
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [severity, setSeverity] = useState<string>("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeResource =
    resource ||
    availableResources?.find((r) => r.id === selectedResourceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedResourceId) {
      setError("Please select a resource.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for the issue.");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a detailed description of the damage or issue.");
      return;
    }

    const formData = new FormData();
    formData.append("resourceId", selectedResourceId);
    formData.append("category", category);
    formData.append("severity", severity);
    formData.append("title", title.trim());
    formData.append("description", description.trim());

    startTransition(async () => {
      const res = await submitComplaint(formData);
      if (res?.error) {
        setError(res.error);
        showErrorAlert("Submission Failed", res.error);
      } else {
        showToast(
          `Damage report submitted for "${activeResource?.name ?? "Resource"}". Administrators have been notified.`,
          "success"
        );
        onSuccess(res?.complaint);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-400">
          {error}
        </div>
      )}

      {/* Target Resource */}
      {resource ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Reporting Issue For
          </span>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{resource.name}</p>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3 text-indigo-400" />
                  {resource.category}
                </span>
                {resource.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    {resource.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : availableResources && availableResources.length > 0 ? (
        <div>
          <label
            htmlFor="resourceId"
            className="mb-1.5 block text-xs font-medium text-slate-300"
          >
            Select Affected Resource *
          </label>
          <select
            id="resourceId"
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            required
            className="glass-input [&>option]:bg-[#121722] [&>option]:text-white"
          >
            {availableResources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.category})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Issue Category */}
      <div>
        <label
          htmlFor="category"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Issue Category *
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="glass-input [&>option]:bg-[#121722] [&>option]:text-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Severity Selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-300">
          Urgency & Severity Level *
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SEVERITIES.map((sev) => {
            const Icon = sev.icon;
            const isSelected = severity === sev.value;
            return (
              <motion.button
                key={sev.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSeverity(sev.value)}
                className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-colors will-change-transform ${
                  isSelected
                    ? sev.selectedColor
                    : "border-white/5 bg-white/[0.03] text-slate-400 hover:border-white/10 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{sev.label}</span>
                </div>
                <span className="mt-1 text-[10px] text-slate-400">
                  {sev.desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Short Summary / Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Smashed display screen, broken lens, loose cable..."
          className="glass-input"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Detailed Description *
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Describe the defect, damage, or malfunction in detail. Mention when you noticed it and if it prevents normal usage..."
          className="glass-input resize-none"
        />
      </div>

      {/* Action buttons */}
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
          className="!bg-rose-600 hover:!bg-rose-500 !shadow-rose-600/30"
        >
          Submit Damage Report
        </GlassButton>
      </div>
    </form>
  );
}
