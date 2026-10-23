import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/actions/auth";
import { ListingActions } from "./listing-actions";

import { updateEnquiryStatusAction } from "@/actions/enquiries";
import {
  ACTION_LABEL,
  NEXT_STATUSES,
  STATUS_LABEL,
  canRevealContact,
  type EnquiryStatus,
} from "@/lib/enquiry-status";

const BANNERS: Record<string, string> = {
  submitted: "Listing submitted. It goes live after admin review.",
  updated: "Listing updated. It's back in admin review and will show in search once approved.",
  deleted: "Listing deleted.",
};

function EnquiryStatusActions({ id, status }: { id: string; status: EnquiryStatus }) {
  const next = NEXT_STATUSES[status];
  if (next.length === 0) return null;
  return (
    <form action={updateEnquiryStatusAction} className="flex flex-wrap gap-2 pt-1">
      <input type="hidden" name="id" value={id} />
      {next.map((s) => (
        <button
          key={s}
          name="status"
          value={s}
          className={`rounded border px-2 py-1 text-xs ${s === "CONTACTED" ? "bg-black text-white" : ""}`}
        >
          {ACTION_LABEL[s]}
        </button>
      ))}
    </form>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const { listing } = await searchParams;

  // Read from the DB so a freshly approved agent sees the change immediately.
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      agentApplication: true,
      listings: { where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" } },
    },
  });

  const canList = user.role === "OWNER" || user.role === "AGENT";
  const app = user.agentApplication;

  const enquiries = canList ? await prisma.enquiry.findMany({
        where: { listing: { ownerId: session.user.id } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { listing: { select: { title: true, slug: true } } },
      }) : [];

  const sent = await prisma.enquiry.findMany({
    where: { senderId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      listing: {
        select: { title: true, slug: true, owner: { select: { name: true, email: true, phone: true } } },
      },
    },
  });

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hello, {user.name}</h1>
          <p className="text-sm text-gray-600">
            {user.email} · {user.role}
            {user.role === "AGENT" && (
              <span className="ml-2 rounded border px-2 py-0.5 text-xs">Verified agent</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/profile" className="rounded border px-3 py-2 text-sm">Profile</Link>
          <form action={logoutAction}>
            <button className="rounded border px-3 py-2 text-sm">Log out</button>
          </form>
        </div>
      </header>

      {listing && BANNERS[listing] && (
        <p className="rounded border bg-gray-100 p-3 text-sm">{BANNERS[listing]}</p>
      )}

      {app && app.status === "PENDING" && (
        <p className="rounded border bg-gray-100 p-3 text-sm">
          Your agent application is under review. You&apos;ll be able to list properties once it&apos;s approved.
        </p>
      )}
      {app && app.status === "REJECTED" && (
        <p className="rounded border bg-gray-100 p-3 text-sm">
          Your agent application was rejected{app.rejectionReason ? `: ${app.rejectionReason}` : "."}
        </p>
      )}

      <div className="flex gap-3 text-sm">
        <Link href="/search" className="rounded border px-3 py-2">Browse properties</Link>
        {canList && (
          <Link href="/dashboard/listings/new" className="rounded bg-black px-3 py-2 text-white">
            + New listing
          </Link>
        )}
      </div>

      {canList && (
        <section>
          <h2 className="mb-2 text-lg font-medium">My listings ({user.listings.length})</h2>
          {user.listings.length === 0 && <p className="text-sm text-gray-500">No listings yet.</p>}
          <div className="divide-y rounded border">
            {user.listings.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="font-medium">{l.title}</div>
                  <div className="text-gray-600">
                    {[l.locality, l.city].filter(Boolean).join(", ")} · ₹{Number(l.price).toLocaleString("en-IN")}
                  </div>
                  {l.status === "REJECTED" && l.rejectionReason && (
                    <div className="text-gray-500">Rejected: {l.rejectionReason}</div>
                  )}
                </div>
                <div className="text-right">
                  <span className="rounded border px-2 py-0.5 text-xs">{l.status.replace("_", " ")}</span>
                  <div className="mt-1 text-gray-500">{l.viewCount} views</div>
                  <ListingActions id={l.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

            {canList && (
        <section>
          <h2 className="mb-2 text-lg font-medium">Received enquiries ({enquiries.length})</h2>
          {enquiries.length === 0 && <p className="text-sm text-gray-500">No enquiries yet.</p>}
          <div className="divide-y rounded border">
            {enquiries.map((e) => (
              <div key={e.id} className="space-y-1 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{e.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="rounded border px-2 py-0.5 text-xs">{STATUS_LABEL[e.status]}</span>
                    <span className="text-gray-500">{e.createdAt.toLocaleDateString("en-IN")}</span>
                  </span>
                </div>
                <div className="text-gray-600">
                  {e.email}
                  {e.phone && ` · ${e.phone}`} · on{" "}
                  <Link href={`/listings/${e.listing.slug}`} className="underline">{e.listing.title}</Link>
                </div>
                <p className="whitespace-pre-line">{e.message}</p>
                {e.status === "NEW" && (
                  <p className="text-xs text-gray-500">
                    Accepting shares your phone and email with this buyer.
                  </p>
                )}
                <EnquiryStatusActions id={e.id} status={e.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {sent.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-medium">My enquiries ({sent.length})</h2>
          <div className="divide-y rounded border">
            {sent.map((e) => (
              <div key={e.id} className="space-y-1 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <Link href={`/listings/${e.listing.slug}`} className="font-medium underline">
                    {e.listing.title}
                  </Link>
                  <span className="rounded border px-2 py-0.5 text-xs">{STATUS_LABEL[e.status]}</span>
                </div>
                {canRevealContact(e.status) ? (
                  <p className="text-gray-700">
                    {e.listing.owner.name} · {e.listing.owner.email}
                    {e.listing.owner.phone && ` · ${e.listing.owner.phone}`}
                  </p>
                ) : e.status === "NOT_INTERESTED" ? (
                  <p className="text-gray-500">The owner isn&apos;t taking this enquiry forward.</p>
                ) : (
                  <p className="text-gray-500">Contact details unlock once the owner responds.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}