import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/actions/auth";
import Link from "next/link";

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight && value > 0 ? "border-amber-400 bg-amber-50" : ""}`}>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function AdminPage() {
    const session = await requireAdmin();

    const [totalUsers, byRole, byStatus, pendingAgents, openReports, enquiries, recentUsers, pendingList] =
    await Promise.all([
        prisma.user.count(),
        prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
        prisma.listing.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.agentApplication.count({ where: { status: "PENDING" } }),
        prisma.report.count({ where: { status: "OPEN" } }),
        prisma.enquiry.count(),
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        }),
        prisma.agentApplication.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { user: { select: { name: true, email: true } } },
        }),
        ]);

    const role = Object.fromEntries(byRole.map((r) => [r.role, r._count._all]));
    const status = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all]));
    const fmt = (d: Date) => d.toLocaleDateString("en-IN");

    return (
        <main className="mx-auto max-w-5xl space-y-8 p-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Admin dashboard</h1>
                    <p className="text-sm text-gray-500">Signed in as {session.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/review" className="rounded bg-black px-3 py-2 text-sm text-white">
                        Review queue
                    </Link>
                    <form action={logoutAction}>
                        <button className="rounded border px-3 py-2 text-sm">Log out</button>
                    </form>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Total users" value={totalUsers} />
                <Stat label="Buyers" value={role.BUYER ?? 0} />
                <Stat label="Owners" value={role.OWNER ?? 0} />
                <Stat label="Agents" value={role.AGENT ?? 0} />
                <Stat label="Listings awaiting review" value={status.PENDING_REVIEW ?? 0} highlight />
                <Stat label="Live listings" value={status.LIVE ?? 0} />
                <Stat label="Agent applications pending" value={pendingAgents} highlight />
                <Stat label="Open reports" value={openReports} highlight />
                <Stat label="Enquiries" value={enquiries} />
            </section>

            <section>
                <h2 className="mb-2 text-lg font-medium">Pending agent applications</h2>
                {pendingList.length === 0 ? (
                    <p className="text-sm text-gray-500">None.</p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500">
                            <tr><th>Name</th><th>Email</th><th>Agency</th><th>RERA</th><th>Applied</th></tr>
                        </thead>
                        <tbody>
                            {pendingList.map((a) => (
                                <tr key={a.id} className="border-t">
                                    <td className="py-2">{a.user.name}</td>
                                    <td>{a.user.email}</td>
                                    <td>{a.agencyName}</td>
                                    <td>{a.reraState} / {a.reraNumber}</td>
                                    <td>{fmt(a.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section>
                <h2 className="mb-2 text-lg font-medium">Recent users</h2>
                <table className="w-full text-left text-sm">
                    <thead className="text-gray-500">
                        <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                    </thead>
                    <tbody>
                        {recentUsers.map((u) => (
                        <tr key={u.id} className="border-t">
                            <td className="py-2">{u.name ?? "—"}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{fmt(u.createdAt)}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}