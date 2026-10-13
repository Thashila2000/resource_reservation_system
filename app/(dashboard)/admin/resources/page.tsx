import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdminResourcesClient } from "./AdminResourcesClient";

export const metadata: Metadata = { title: "Manage Resources | Admin" };
export const instant = false;

export default async function AdminResourcesPage() {
  await connection();

  const [resources, complaints] = await Promise.all([
    prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            reservations: true,
            complaints: {
              where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
            },
          },
        },
      },
    }),
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
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
    }),
  ]);

  return (
    <AdminResourcesClient
      initialResources={resources}
      initialComplaints={complaints}
    />
  );
}
