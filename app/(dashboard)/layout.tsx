import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/shared/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const instant = false;

/**
 * Shared dashboard layout wrapping both admin and employee route groups.
 * Reads the authenticated session to render role-aware sidebar navigation.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      userName={session.user.name ?? "User"}
      userEmail={session.user.email ?? ""}
      userRole={session.user.role}
    >
      {children}
    </DashboardShell>
  );
}
