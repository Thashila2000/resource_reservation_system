"use client";

import { useState, useTransition } from "react";
import { createReservation } from "@/lib/actions";
import { showToast, showErrorAlert } from "@/lib/alerts";
import { GlassButton } from "@/components/ui/GlassButton";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface BookingFormProps {
  resource: {
    id: string;
    name: string;
    category: string;
    location: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingForm({ resource, onSuccess, onCancel }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Default to today's date
  const today = new Date().toISOString().split("T")[0];
  const [bookingDate, setBookingDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // Compute the minimum allowed start time (current time + 1 min, only for today)
  const getNowTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };
  const [purpose, setPurpose] = useState("");

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
    formData.append("resourceId", resource.id);
    formData.append("startTime", startDateTime.toISOString());
    formData.append("endTime", endDateTime.toISOString());
    formData.append("purpose", purpose);

    startTransition(async () => {
      const res = await createReservation(formData);
      if (res?.error) {
        setError(res.error);
        showErrorAlert("Reservation Failed", res.error);
      } else {
        showToast(`Reservation for "${resource.name}" submitted for approval!`, "success");
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected Resource Summary Box */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5">
        <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
          Reserving
        </p>
        <p className="text-sm font-bold text-white mt-0.5">{resource.name}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
          <span>{resource.category}</span>
          {resource.location && <span>• {resource.location}</span>}
        </div>
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
          htmlFor="bookingDate"
          className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300"
        >
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          Reservation Date *
        </label>
        <input
          id="bookingDate"
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
            htmlFor="startTime"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300"
          >
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            Start Time *
          </label>
          <input
            id="startTime"
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
            htmlFor="endTime"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300"
          >
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            End Time *
          </label>
          <input
            id="endTime"
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
          htmlFor="purpose"
          className="mb-1.5 block text-xs font-medium text-slate-300"
        >
          Purpose / Meeting Title
        </label>
        <input
          id="purpose"
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
          Confirm Reservation
        </GlassButton>
      </div>
    </form>
  );
}
