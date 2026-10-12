import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyReservationsClient } from "./MyReservationsClient";

export const metadata: Metadata = { title: "My Reservations | PrimeWave RRMS" };
export const instant = false;

export default async function MyReservationsPage() {
  await connection();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
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
      startTime: "desc",
    },
  });

  return <MyReservationsClient reservations={reservations} />;
}
