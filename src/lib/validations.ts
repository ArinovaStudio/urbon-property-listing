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

  // Blank form fields arrive as "" — treat them as "not provided".
const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const optText = (max: number) => z.preprocess(blank, z.string().trim().max(max).optional());
const optInt = z.preprocess(blank, z.coerce.number().int().min(0).optional());

export const listingSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters.").max(120),
  description: z.string().trim().min(20, "Description must be at least 20 characters.").max(5000),
  listingType: z.enum(["SALE", "RENT"]),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND"]),
  propertyType: optText(60),
  price: z.coerce.number().int("Price must be a whole number.").positive("Enter a price."),
  areaSqft: optInt,
  bedrooms: optInt,
  bathrooms: optInt,
  addressLine: z.string().trim().min(3, "Enter the street / building."),
  locality: optText(80),
  city: z.string().trim().min(2, "Enter the city."),
  state: z.string().trim().min(2, "Enter the state."),
  pincode: z.preprocess(blank, z.string().regex(/^\d{6}$/, "Pincode must be 6 digits.").optional()),
});

export const enquirySchema = z.object({
  listingId: z.string().min(1),
  phone: z.preprocess(blank, z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number.").optional()),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(1000),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80, "Name must be at most 80 characters."),
  phone: z.preprocess(blank, z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number.").optional()),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(72, "New password must be at most 72 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .superRefine((d, ctx) => {
    if (d.newPassword !== d.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords don't match." });
    } else if (d.newPassword === d.currentPassword) {
      ctx.addIssue({ code: "custom", path: ["newPassword"], message: "New password must be different from the current one." });
    }
  });
