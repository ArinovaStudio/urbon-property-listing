"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireLogin } from "@/lib/permissions";
import { enquirySchema, enquiryStatusSchema } from "@/lib/validations";
import { NEXT_STATUSES, type EnquiryStatus } from "@/lib/enquiry-status";

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

  const active = await prisma.enquiry.findFirst({
    where: {
      listingId,
      senderId: session.user.id,
      status: { in: ["NEW", "CONTACTED", "VISIT_SCHEDULED"] },
    },
    select: { id: true },
  });
  if (active) return { error: "You already have an open enquiry on this listing." };

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

export async function updateEnquiryStatusAction(formData: FormData) {
  const session = await requireLogin();

  const parsed = enquiryStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { id, status } = parsed.data;

  // Only the owner of the listing this enquiry is on may change it.
  const enquiry = await prisma.enquiry.findFirst({
    where: { id, listing: { ownerId: session.user.id } },
    select: { status: true },
  });
  if (!enquiry) return;

  const current = enquiry.status as EnquiryStatus;
  if (!NEXT_STATUSES[current].includes(status)) return;

  // Matching on the current status makes a double-click or two tabs harmless.
  await prisma.enquiry.updateMany({
    where: { id, status: current },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/listings/[slug]", "page");
}