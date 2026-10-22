"use server";

import { prisma } from "@/lib/prisma";
import { requireLogin } from "@/lib/permissions";
import { reportSchema } from "@/lib/validations";

export type ReportState = { ok?: boolean; error?: string } | undefined;

export async function reportListingAction(_prev: ReportState, formData: FormData): Promise<ReportState> {
    const session = await requireLogin();

    const parsed = reportSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { listingId, reason, details } = parsed.data;

    const listing = await prisma.listing.findFirst({
        where: { id: listingId, status: "LIVE" },
        select: { ownerId: true },
    });
    if (!listing) return { error: "This listing is no longer available." };
    if (listing.ownerId === session.user.id) return { error: "You can't report your own listing." };

    // One open report per user per listing.
    const already = await prisma.report.findFirst({
        where: { listingId, reporterId: session.user.id, status: "OPEN" },
        select: { id: true },
    });
    if (already) return { ok: true };

    await prisma.report.create({ data: { listingId, reporterId: session.user.id, reason, details },});

    return { ok: true };
}