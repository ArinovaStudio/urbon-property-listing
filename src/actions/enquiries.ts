"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireLogin } from "@/lib/permissions";
import { enquirySchema } from "@/lib/validations";

export type EnquiryState = { ok?: boolean; error?: string } | undefined;

export async function createEnquiryAction(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const session = await requireLogin();

  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { listingId, phone, message } = parsed.data;

  const [listing, user] = await Promise.all([
    prisma.listing.findFirst({ where: { id: listingId, status: "LIVE" }, select: { ownerId: true } }),
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { name: true, email: true } }),
  ]);

  if (!listing) return { error: "This listing is no longer available." };
  if (listing.ownerId === session.user.id) return { error: "You can't enquire on your own listing." };

  const recent = await prisma.enquiry.count({
    where: {
      listingId,
      senderId: session.user.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (recent >= 3) return { error: "You've already sent several enquiries for this listing today." };

  await prisma.enquiry.create({
    data: {
      listingId,
      senderId: session.user.id,
      name: user.name ?? "User",
      email: user.email,
      phone,
      message,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}