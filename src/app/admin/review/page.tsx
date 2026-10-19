import Link from "next/link";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { reviewAgentApplication, reviewListing } from "@/actions/admin";

export default async function ReviewPage() {
  await requireAdmin();

  const [applications, listings] = await Promise.all([
    prisma.agentApplication.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.listing.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "asc" },
      include: { owner: { select: { email: true, role: true } } },
    }),
  ]);

  const reason = "rounded border p-1 text-sm";

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-6">
      <Link href="/admin" className="text-sm underline">← Admin dashboard</Link>

      <section>
        <h2 className="mb-3 text-lg font-medium">Agent applications ({applications.length})</h2>
        {applications.length === 0 && <p className="text-sm text-gray-500">None pending.</p>}
        {applications.map((a) => (
          <form key={a.id} action={reviewAgentApplication} className="mb-3 flex flex-wrap items-center gap-3 rounded border p-3">
            <input type="hidden" name="id" value={a.id} />
            <div className="min-w-64 flex-1 text-sm">
              <b>{a.agencyName}</b> · {a.user.name} ({a.user.email})
              <br />
              <span className="text-gray-600">RERA {a.reraState} / {a.reraNumber} · {a.phone}</span>
            </div>
            <input name="reason" placeholder="Reject reason (optional)" className={reason} />
            <button name="decision" value="APPROVED" className="rounded bg-black px-3 py-1 text-sm text-white">Approve</button>
            <button name="decision" value="REJECTED" className="rounded border px-3 py-1 text-sm">Reject</button>
          </form>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Listings awaiting review ({listings.length})</h2>
        {listings.length === 0 && <p className="text-sm text-gray-500">None pending.</p>}
        {listings.map((l) => (
          <form key={l.id} action={reviewListing} className="mb-3 flex flex-wrap items-center gap-3 rounded border p-3">
            <input type="hidden" name="id" value={l.id} />
            <div className="min-w-64 flex-1 text-sm">
              <b>{l.title}</b> · ₹{Number(l.price).toLocaleString("en-IN")} · {l.listingType} · {l.category}
              <br />
              <span className="text-gray-600">
                {[l.addressLine, l.locality, l.city].filter(Boolean).join(", ")} · {l.owner.email} ({l.owner.role})
              </span>
            </div>
            <input name="reason" placeholder="Reject reason (optional)" className={reason} />
            <button name="decision" value="LIVE" className="rounded bg-black px-3 py-1 text-sm text-white">Approve</button>
            <button name="decision" value="REJECTED" className="rounded border px-3 py-1 text-sm">Reject</button>
          </form>
        ))}
      </section>
    </main>
  );
}