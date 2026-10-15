import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(80),
    email: z.string().email("Enter a valid email."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be at most 72 characters."),
    role: z.enum(["BUYER", "OWNER", "AGENT"]), // ADMIN can never be self-registered
    agencyName: z.string().trim().max(120).optional(),
    reraNumber: z.string().trim().max(60).optional(),
    reraState: z.string().trim().max(60).optional(),
    phone: z.string().trim().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.role !== "AGENT") return;
    const required = {
      agencyName: "Agency name",
      reraNumber: "RERA registration number",
      reraState: "RERA state",
      phone: "Phone number",
    } as const;
    for (const [field, label] of Object.entries(required)) {
      if (!d[field as keyof typeof required]) {
        ctx.addIssue({ code: "custom", path: [field], message: `${label} is required for agents.` });
      }
    }
    if (d.phone && !/^[6-9]\d{9}$/.test(d.phone)) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a 10-digit Indian mobile number." });
    }
  });