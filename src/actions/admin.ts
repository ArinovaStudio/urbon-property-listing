"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function reviewAgentApplication(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const approve = formData.get("decision") === "APPROVED";
  const reason = String(formData.get("reason") ?? "").trim() || null;

  const app = await prisma.agentApplication.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction([
    prisma.agentApplication.update({
      where: { id },
      data: {
        status: approve ? "APPROVED" : "REJECTED",
        rejectionReason: approve ? null : reason,
        reviewedAt: new Date(),
      },
    }),
    // Approval is what flips the user's role, so it shows up on their account everywhere.
    ...(approve ? [prisma.user.update({ where: { id: app.userId }, data: { role: "AGENT" } })] : []),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: approve ? "agent.approve" : "agent.reject",
        entityType: "AgentApplication",
        entityId: id,
        details: { userId: app.userId },
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/review");
}

export async function reviewListing(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const approve = formData.get("decision") === "LIVE";
  const reason = String(formData.get("reason") ?? "").trim() || null;

  await prisma.$transaction([
    prisma.listing.update({
      where: { id },
      data: approve
        ? { status: "LIVE", publishedAt: new Date(), rejectionReason: null }
        : { status: "REJECTED", rejectionReason: reason },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: approve ? "listing.approve" : "listing.reject",
        entityType: "Listing",
        entityId: id,
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/review");
}