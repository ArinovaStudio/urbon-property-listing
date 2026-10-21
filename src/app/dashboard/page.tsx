import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/actions/auth";

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
      listings: { orderBy: { createdAt: "desc" } },
    },
  });

  const canList = user.role === "OWNER" || user.role === "AGENT";
  const app = user.agentApplication;

  const enquiries = canList
    ? await prisma.enquiry.findMany({
        where: { listing: { ownerId: session.user.id } },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { listing: { select: { title: true, slug: true } } },
      })
    : [];

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

      {listing === "submitted" && (
        <p className="rounded border bg-gray-100 p-3 text-sm">
          Listing submitted. It goes live after admin review.
        </p>
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
                <div className="flex justify-between">
                  <span className="font-medium">{e.name}</span>
                  <span className="text-gray-500">{e.createdAt.toLocaleDateString("en-IN")}</span>
                </div>
                <div className="text-gray-600">
                  {e.email}
                  {e.phone && ` · ${e.phone}`} · on{" "}
                  <Link href={`/listings/${e.listing.slug}`} className="underline">{e.listing.title}</Link>
                </div>
                <p className="whitespace-pre-line">{e.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}