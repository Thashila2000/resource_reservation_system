import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdminApprovalsClient } from "./AdminApprovalsClient";

export const metadata: Metadata = { title: "Approvals Queue | Admin" };
export const instant = false;

export default async function AdminApprovalsPage() {
  await connection();

  const reservations = await prisma.reservation.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
        },
      },
      resource: {
        select: {
          id: true,
          name: true,
          category: true,
          location: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <AdminApprovalsClient initialReservations={reservations} />;
}
