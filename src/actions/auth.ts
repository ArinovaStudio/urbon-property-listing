"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";

function safeRedirect(url: unknown): string {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//")
    ? url
    : "/dashboard";
}

export async function loginAction(
  _prev: string | undefined,
  formData: FormData,
) {
  const redirectTo = safeRedirect(formData.get("callbackUrl"));
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;
  try {
    await signIn("credentials", { ...parsed.data, redirectTo });
  } catch (e) {
    if (e instanceof AuthError) return "Invalid email or password.";
    throw e; 
  }
}

export async function registerAction(_prev: string | undefined, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;

  const { name, password, role } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  if (await prisma.user.findUnique({ where: { email } })) {
    return "That email is already registered.";
  }

  let application;
  if (role === "AGENT") {
    const reraNumber = parsed.data.reraNumber!.toUpperCase();
    const reraState = parsed.data.reraState!;
    if (await prisma.agentApplication.findFirst({ where: { reraNumber, reraState } })) {
      return "That RERA number is already linked to another account.";
    }
    application = {
      create: {
        agencyName: parsed.data.agencyName!,
        reraNumber,
        reraState,
        phone: parsed.data.phone!,
      },
    };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: role === "OWNER" ? "OWNER" : "BUYER", 
      agentApplication: application,
    },
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function googleSignInAction(callbackUrl?: string) {
  await signIn("google", { redirectTo: safeRedirect(callbackUrl) });
}