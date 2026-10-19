import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireLogin() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireLogin();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

// Owners and approved agents can list. Reads the role from the DB, not the JWT,
// so an agent approved a minute ago can list immediately without logging out.
export async function requireLister() {
  const session = await requireLogin();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || (user.role !== "OWNER" && user.role !== "AGENT")) redirect("/dashboard");
  return session;
}