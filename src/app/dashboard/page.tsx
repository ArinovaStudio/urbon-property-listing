import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "@/modules/identity/actions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Hello, {session.user.name}</h1>
      <p className="mt-2 text-sm">
        {session.user.email} · role: {session.user.role}
      </p>
      <form action={logoutAction} className="mt-4">
        <button className="rounded border px-3 py-2">Log out</button>
      </form>
    </main>
  );
}