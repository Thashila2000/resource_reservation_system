import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EmployeeResourcesClient } from "./EmployeeResourcesClient";

export const metadata: Metadata = { title: "Browse Resources | PrimeWave RRMS" };
export const instant = false;

export default async function EmployeeResourcesPage() {
  await connection();
  const session = await auth();

  const [resources, myComplaints] = await Promise.all([
    prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    }),
    session?.user?.id
      ? prisma.complaint.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          include: {
            resource: {
              select: { id: true, name: true, category: true, location: true },
            },
          },
        })
      : [],
  ]);

  return (
    <EmployeeResourcesClient
      resources={resources}
      initialComplaints={myComplaints}
    />
  );
}
