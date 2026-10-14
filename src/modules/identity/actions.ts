"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/platform/db/prisma";
import { loginSchema, registerSchema } from "./schemas";

export async function loginAction(
  _prev: string | undefined,
  formData: FormData,
) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
  } catch (e) {
    if (e instanceof AuthError) return "Invalid email or password.";
    throw e; // a successful sign-in redirects by throwing; it must not be swallowed
  }
}

export async function registerAction(
  _prev: string | undefined,
  formData: FormData,
) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;

  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    return "That email is already registered.";
  }
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    },
  });
  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/dashboard" });
}