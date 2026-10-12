"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

/**
 * Register a new user and sign them in immediately.
 */
export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const department = (formData.get("department") as string) || null;

  // Basic validation
  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const roleInput = formData.get("role") as string;
  const role = roleInput === "ADMIN" ? "ADMIN" : "EMPLOYEE";

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      department,
      role,
    },
  });

  // Auto sign-in after registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Registration succeeded but auto-login failed. Please sign in manually." };
    }
    throw error; // re-throw redirect errors from NextAuth
  }
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
      user?.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard";

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

  if (!name || !category) {
    return { error: "Name and Category are required." };
  }

  try {
    await prisma.resource.create({
      data: {
        name,
        category,
        description,
        capacity: Number.isNaN(capacity) ? null : capacity,
        location,
        isAvailable,
      },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/resources");
    return { success: true };
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

  if (!name || !category) {
    return { error: "Name and Category are required." };
  }

  try {
    await prisma.resource.update({
      where: { id },
      data: {
        name,
        category,
        description,
        capacity: Number.isNaN(capacity) ? null : capacity,
        location,
        isAvailable,
      },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/resources");
    return { success: true };
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


