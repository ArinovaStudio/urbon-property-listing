import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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