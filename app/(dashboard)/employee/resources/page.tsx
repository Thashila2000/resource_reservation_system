import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { EmployeeResourcesClient } from "./EmployeeResourcesClient";

export const metadata: Metadata = { title: "Browse Resources | PrimeWave RRMS" };
export const instant = false;

export default async function EmployeeResourcesPage() {
  await connection();

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <EmployeeResourcesClient resources={resources} />;
}
