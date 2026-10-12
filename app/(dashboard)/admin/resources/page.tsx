import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdminResourcesClient } from "./AdminResourcesClient";

export const metadata: Metadata = { title: "Manage Resources | Admin" };
export const instant = false;

export default async function AdminResourcesPage() {
  await connection();
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { reservations: true },
      },
    },
  });

  return <AdminResourcesClient initialResources={resources} />;
}
