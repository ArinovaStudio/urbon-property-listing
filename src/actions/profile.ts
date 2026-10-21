"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireLogin } from "@/lib/permissions";
import { changePasswordSchema, profileSchema } from "@/lib/validations";

export type ProfileState =
  | { ok?: boolean; error?: string; values?: { name: string; phone: string } }
  | undefined;

async function requireProfileUser() {
  const session = await requireLogin();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, passwordHash: true },
  });
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  return user;
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireProfileUser();

  const raw = Object.fromEntries(formData);
  const values = { name: String(raw.name ?? ""), phone: String(raw.phone ?? "") };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const { name, phone } = parsed.data;

  if (user.role === "AGENT" && !phone) {
    return { error: "Phone number is required for agents.", values };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, phone: phone ?? null },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { ok: true, values: { name, phone: phone ?? "" } };
}

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireProfileUser();

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { currentPassword, newPassword } = parsed.data;

  if (!user.passwordHash) {
    return { error: "This account signs in with Google, so there's no password to change." };
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) return { error: "Current password is incorrect." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });

  return { ok: true };
}
