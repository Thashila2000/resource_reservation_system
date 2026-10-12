import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import type { Status } from "@prisma/client";

/**
 * Merge Tailwind CSS class names safely, resolving conflicts.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display in the UI.
 * @example formatDate(new Date()) → "Oct 12, 2026, 1:30 PM"
 */
export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy, h:mm a");
}

/**
 * Format a date as a short date string.
 * @example formatShortDate(new Date()) → "Oct 12, 2026"
 */
export function formatShortDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

/**
 * Returns a human-readable relative time string.
 * @example timeAgo(pastDate) → "3 hours ago"
 */
export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Check whether two time ranges overlap.
 * Used for conflict detection when creating reservations.
 */
export function isOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return isBefore(startA, endB) && isAfter(endA, startB);
}

/**
 * Map a Reservation Status enum value to a human-readable label.
 */
export function statusLabel(status: Status): string {
  const labels: Record<Status, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };
  return labels[status];
}

/**
 * Map a Reservation Status to its CSS badge class.
 */
export function statusBadgeClass(status: Status): string {
  const classes: Record<Status, string> = {
    PENDING: "badge-pending",
    APPROVED: "badge-approved",
    REJECTED: "badge-rejected",
    CANCELLED: "badge-cancelled",
  };
  return cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    classes[status]
  );
}

/**
 * Truncate a string to a given max length, appending "…" if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}
