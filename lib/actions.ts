"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

/**
/**
 * Admin action: Register a new user in the system.
 * Only authenticated users with role === 'ADMIN' can call this.
 */
export async function adminRegisterUser(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Only administrators can register new users." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const department = ((formData.get("department") as string)?.trim()) || null;
  const roleInput = formData.get("role") as string;
  const role = roleInput === "ADMIN" ? "ADMIN" : "EMPLOYEE";

  // Basic validation
  if (!name || !email || !password) {
    return { error: "Full Name, Email, and Password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "An account with this email address already exists." };
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department,
        role,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: "Failed to register user. Please try again." };
  }
}

/**
 * Public registration is disabled — accounts must be registered by administrators.
 */
export async function registerUser(_formData?: FormData) {
  return {
    error: "Public self-registration is disabled. Please contact your system administrator to receive your login credentials.",
  };
}

/**
 * Authenticate an existing user.
 */
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    // Determine redirect based on user role
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    const redirectTo =
      user?.role === "ADMIN"
        ? "/admin/dashboard?welcome=1"
        : "/employee/dashboard?welcome=1";

    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error; // re-throw redirect errors from NextAuth
  }
}

/**
 * Admin action: Create a new resource.
 */
export async function createResource(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string) || null;
  const capacityRaw = formData.get("capacity") as string;
  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null;
  const location = (formData.get("location") as string) || null;
  const isAvailable = formData.get("isAvailable") === "true" || formData.get("isAvailable") === "on";
  const isUnderMaintenance = formData.get("isUnderMaintenance") === "true" || formData.get("isUnderMaintenance") === "on";

  if (!name || !category) {
    return { error: "Name and Category are required." };
  }

  try {
    const resource = await prisma.resource.create({
      data: {
        name,
        category,
        description,
        capacity: Number.isNaN(capacity) ? null : capacity,
        location,
        isAvailable,
        isUnderMaintenance,
      },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/resources");
    return { success: true, resource };
  } catch (error) {
    console.error("Failed to create resource:", error);
    return { error: "Failed to create resource. Please try again." };
  }
}

/**
 * Admin action: Update an existing resource.
 */
export async function updateResource(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string) || null;
  const capacityRaw = formData.get("capacity") as string;
  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null;
  const location = (formData.get("location") as string) || null;
  const isAvailable = formData.get("isAvailable") === "true" || formData.get("isAvailable") === "on";
  const isUnderMaintenance = formData.get("isUnderMaintenance") === "true" || formData.get("isUnderMaintenance") === "on";

  if (!name || !category) {
    return { error: "Name and Category are required." };
  }

  try {
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        name,
        category,
        description,
        capacity: Number.isNaN(capacity) ? null : capacity,
        location,
        isAvailable,
        isUnderMaintenance,
      },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/resources");
    return { success: true, resource };
  } catch (error) {
    console.error("Failed to update resource:", error);
    return { error: "Failed to update resource. Please try again." };
  }
}

/**
 * Admin action: Delete a resource.
 */
export async function deleteResource(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.resource.delete({
      where: { id },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/resources");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return { error: "Failed to delete resource." };
  }
}

/**
 * Admin action: Toggle availability of a resource.
 */
export async function toggleResourceAvailability(id: string, isAvailable: boolean) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.resource.update({
      where: { id },
      data: { isAvailable },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/resources");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle availability:", error);
    return { error: "Failed to update status." };
  }
}

/**
 * Admin action: Toggle maintenance mode of a resource.
 * Resources under maintenance cannot be booked by employees.
 */
export async function toggleMaintenanceMode(id: string, isUnderMaintenance: boolean) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.resource.update({
      where: { id },
      data: { isUnderMaintenance },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/resources");
    revalidatePath("/employee/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle maintenance mode:", error);
    return { error: "Failed to update maintenance status." };
  }
}

/**
 * Create a new reservation with conflict detection.
 */
export async function createReservation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to create a reservation." };
  }

  const resourceId = formData.get("resourceId") as string;
  const startTimeStr = formData.get("startTime") as string;
  const endTimeStr = formData.get("endTime") as string;
  const purpose = (formData.get("purpose") as string) || null;

  if (!resourceId || !startTimeStr || !endTimeStr) {
    return { error: "Resource, start time, and end time are required." };
  }

  const startDateTime = new Date(startTimeStr);
  const endDateTime = new Date(endTimeStr);

  if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
    return { error: "Invalid date or time provided." };
  }

  // Block reservations with a start time in the past
  const now = new Date();
  if (startDateTime <= now) {
    return { error: "Start time cannot be in the past. Please choose a future date and time." };
  }

  if (startDateTime >= endDateTime) {
    return { error: "End time must be after start time." };
  }

  // Verify resource is active
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    return { error: "Resource not found." };
  }

  if (resource.isUnderMaintenance) {
    return { error: "This resource is currently under maintenance and cannot be reserved. Please check back later or contact the administrator." };
  }

  if (!resource.isAvailable) {
    return { error: "This resource is currently marked as unavailable for booking." };
  }

  // Conflict Detection: check if any active booking overlaps with requested slot
  const conflict = await prisma.reservation.findFirst({
    where: {
      resourceId,
      status: { in: ["APPROVED", "PENDING"] },
      startTime: { lt: endDateTime },
      endTime: { gt: startDateTime },
    },
  });

  if (conflict) {
    return {
      error: "Conflict detected: This resource already has a booking or pending request overlapping with your chosen time window.",
    };
  }

  try {
    // Admins get auto-approved, employees default to PENDING
    const initialStatus = session.user.role === "ADMIN" ? "APPROVED" : "PENDING";

    await prisma.reservation.create({
      data: {
        userId: session.user.id,
        resourceId,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose,
        status: initialStatus,
      },
    });

    revalidatePath("/employee/my-reservations");
    revalidatePath("/employee/dashboard");
    revalidatePath("/employee/resources");
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to create reservation:", error);
    return { error: "Failed to book resource. Please try again." };
  }
}

/**
 * Cancel an existing reservation.
 */
export async function cancelReservation(reservationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    return { error: "Reservation not found." };
  }

  // Only the owner or an admin can cancel
  if (reservation.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Unauthorized to cancel this reservation." };
  }

  try {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/employee/my-reservations");
    revalidatePath("/employee/dashboard");
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel reservation:", error);
    return { error: "Failed to cancel reservation." };
  }
}

/**
 * Admin action: Approve a pending reservation.
 */
export async function approveReservation(reservationId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "APPROVED" },
    });

    revalidatePath("/admin/approvals");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/my-reservations");
    revalidatePath("/employee/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve reservation:", error);
    return { error: "Failed to approve reservation." };
  }
}

/**
 * Admin action: Reject a pending reservation.
 */
export async function rejectReservation(reservationId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "REJECTED" },
    });

    revalidatePath("/admin/approvals");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/my-reservations");
    revalidatePath("/employee/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject reservation:", error);
    return { error: "Failed to reject reservation." };
  }
}

/**
 * Employee action: Update their own reservation times/purpose.
 * Resets the status back to PENDING so the admin must re-approve.
 */
export async function updateReservation(reservationId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    return { error: "Reservation not found." };
  }

  // Only the owner can update their reservation
  if (reservation.userId !== session.user.id) {
    return { error: "Unauthorized to update this reservation." };
  }

  // Only PENDING or APPROVED reservations can be updated
  if (reservation.status === "CANCELLED" || reservation.status === "REJECTED") {
    return { error: "Only active reservations (Pending or Approved) can be updated." };
  }

  const startTimeStr = formData.get("startTime") as string;
  const endTimeStr = formData.get("endTime") as string;
  const purpose = (formData.get("purpose") as string) || null;

  if (!startTimeStr || !endTimeStr) {
    return { error: "Start time and end time are required." };
  }

  const startDateTime = new Date(startTimeStr);
  const endDateTime = new Date(endTimeStr);

  if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
    return { error: "Invalid date or time provided." };
  }

  // Block past start times
  const now = new Date();
  if (startDateTime <= now) {
    return { error: "Start time cannot be in the past. Please choose a future date and time." };
  }

  if (startDateTime >= endDateTime) {
    return { error: "End time must be after start time." };
  }

  // Check for conflicts (excluding the current reservation)
  const conflict = await prisma.reservation.findFirst({
    where: {
      resourceId: reservation.resourceId,
      id: { not: reservationId },
      status: { in: ["APPROVED", "PENDING"] },
      startTime: { lt: endDateTime },
      endTime: { gt: startDateTime },
    },
  });

  if (conflict) {
    return {
      error: "Conflict detected: Another booking overlaps with your chosen time window.",
    };
  }

  try {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        startTime: startDateTime,
        endTime: endDateTime,
        purpose,
        // Reset to PENDING so admin must re-approve the updated booking
        status: "PENDING",
      },
    });

    revalidatePath("/employee/my-reservations");
    revalidatePath("/employee/dashboard");
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update reservation:", error);
    return { error: "Failed to update reservation. Please try again." };
  }
}

/**
 * Admin action: Update an existing user's details.
 */
export async function adminUpdateUser(userId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Only administrators can edit users." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const department = ((formData.get("department") as string)?.trim()) || null;
  const roleInput = formData.get("role") as string;
  const role = roleInput === "ADMIN" ? "ADMIN" : "EMPLOYEE";
  const password = (formData.get("password") as string)?.trim();

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  // Check if another user has this email
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      id: { not: userId },
    },
  });

  if (existingUser) {
    return { error: "An account with this email address already exists." };
  }

  const updateData: {
    name: string;
    email: string;
    department: string | null;
    role: "ADMIN" | "EMPLOYEE";
    password?: string;
  } = {
    name,
    email,
    department,
    role,
  };

  // If a new password is provided, validate and hash it
  if (password) {
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }
    updateData.password = await bcrypt.hash(password, 12);
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { error: "Failed to update user. Please try again." };
  }
}

/**
 * Admin action: Delete a user.
 */
export async function adminDeleteUser(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Only administrators can delete users." };
  }

  // Prevent admin from deleting their own account
  if (session.user.id === userId) {
    return { error: "You cannot delete your own admin account." };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/approvals");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user. Please try again." };
  }
}

/**
 * Employee / User action: Submit a damage complaint or issue report for a resource.
 */
export async function submitComplaint(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to submit a damage or issue report." };
  }

  const resourceId = (formData.get("resourceId") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || "Physical Damage";
  const severityRaw = (formData.get("severity") as string)?.trim() || "MEDIUM";
  const description = (formData.get("description") as string)?.trim();

  if (!resourceId || !title || !description) {
    return { error: "Resource, issue title, and description are required." };
  }

  const validSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const severity = validSeverities.includes(severityRaw) ? severityRaw : "MEDIUM";

  try {
    const complaint = await prisma.complaint.create({
      data: {
        resourceId,
        userId: session.user.id,
        title,
        category,
        severity: severity as any,
        description,
        status: "OPEN",
      },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
            isUnderMaintenance: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/employee/resources");
    revalidatePath("/admin/dashboard");
    return { success: true, complaint };
  } catch (error) {
    console.error("Failed to submit complaint:", error);
    return { error: "Failed to submit damage report. Please try again." };
  }
}

/**
 * Admin action: Update status and optional resolution notes of a complaint.
 */
export async function updateComplaintStatus(
  complaintId: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED",
  adminNotes?: string
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  try {
    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
            isUnderMaintenance: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/employee/resources");
    revalidatePath("/admin/dashboard");
    return { success: true, complaint };
  } catch (error) {
    console.error("Failed to update complaint status:", error);
    return { error: "Failed to update report status." };
  }
}

/**
 * Admin action: Delete a complaint.
 */
export async function deleteComplaint(complaintId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.complaint.delete({
      where: { id: complaintId },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/employee/resources");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete complaint:", error);
    return { error: "Failed to delete report." };
  }
}

