"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { updateReservation } from "@/lib/actions";
import { showToast, showErrorAlert } from "@/lib/alerts";
import { GlassButton } from "@/components/ui/GlassButton";
import { Calendar, Clock, AlertCircle, RefreshCw } from "lucide-react";

interface EditBookingFormProps {
  reservation: {
    id: string;
    startTime: Date;
    endTime: Date;
    purpose: string | null;
    resource: {
      name: string;
      category: string;
      location: string | null;
    };
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditBookingForm({ reservation, onSuccess, onCancel }: EditBookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  // Pre-populate from the existing reservation
  const [bookingDate, setBookingDate] = useState(
    format(new Date(reservation.startTime), "yyyy-MM-dd")
  );
  const [startTime, setStartTime] = useState(
    format(new Date(reservation.startTime), "HH:mm")
  );
  const [endTime, setEndTime] = useState(
    format(new Date(reservation.endTime), "HH:mm")
  );
  const [purpose, setPurpose] = useState(reservation.purpose ?? "");

  // Compute the minimum allowed start time (now), only relevant for today
  const getNowTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const endDateTime = new Date(`${bookingDate}T${endTime}:00`);

    // Client-side past-time guard
    if (startDateTime <= new Date()) {
      setError("Start time cannot be in the past. Please choose a future date and time.");
      return;
    }

    if (startDateTime >= endDateTime) {
      setError("End time must be later than start time.");
      return;
    }

    const formData = new FormData();
    formData.append("startTime", startDateTime.toISOString());
    formData.append("endTime", endDateTime.toISOString());
    formData.append("purpose", purpose);

    startTransition(async () => {
      const res = await updateReservation(reservation.id, formData);
      if (res?.error) {
        setError(res.error);
        showErrorAlert("Update Failed", res.error);
      } else {
        showToast(`Reservation for "${reservation.resource.name}" updated & pending re-approval.`, "info");
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Resource Summary */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5">
        <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
          Editing Reservation
        </p>
        <p className="text-sm font-bold text-white mt-0.5">{reservation.resource.name}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
          <span>{reservation.resource.category}</span>
          {reservation.resource.location && <span>• {reservation.resource.location}</span>}
        </div>
      </div>

      {/* Re-approval notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
        <RefreshCw className="h-4 w-4 flex-shrink-0 text-amber-400 mt-0.5" />
        <p className="leading-relaxed">
          Updating this reservation will reset its status to <strong>Pending</strong> for admin re-approval.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Date */}
      <div>
        <label
          htmlFor="editBookingDate"
          className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300"
        >
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          Reservation Date *
        </label>
        <input
          id="editBookingDate"
          type="date"
          min={today}
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          required
          className="glass-input"
        />
      </div>

      {/* Time Slot Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="editStartTime"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300"
          >
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Start Time *
          </label>
          <input
            id="editStartTime"
            type="time"
            value={startTime}
            min={bookingDate === today ? getNowTimeString() : undefined}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="glass-input"
          />
        </div>

        <div>
          <label
            htmlFor="editEndTime"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300"
          >
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            End Time *
          </label>
          <input
            id="editEndTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="glass-input"
          />
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label
          htmlFor="editPurpose"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Purpose / Meeting Title
        </label>
        <input
          id="editPurpose"
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g. Q4 Sprint Planning, Hardware Testing, Client Demo"
          className="glass-input"
        />
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
          Save Changes
        </GlassButton>
      </div>
    </form>
  );
}
