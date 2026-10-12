import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdminUsersClient } from "./AdminUsersClient";

export const metadata: Metadata = { title: "User Management | Admin" };
export const instant = false;

export default async function AdminUsersPage() {
  await connection();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminUsersClient initialUsers={users} />;
}
