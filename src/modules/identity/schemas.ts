import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80),
  email: z.string().email("Enter a valid email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."), // bcrypt ignores bytes past 72
});