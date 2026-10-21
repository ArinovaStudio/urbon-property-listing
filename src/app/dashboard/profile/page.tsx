import Link from "next/link";
import { redirect } from "next/navigation";
import { requireLogin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PasswordForm, ProfileForm } from "./profile-forms";

export default async function ProfilePage() {
  const session = await requireLogin();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      passwordHash: true,
      agentApplication: { select: { phone: true } },
    },
  });
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  return (
    <main className="mx-auto max-w-lg space-y-8 p-6">
      <div className="space-y-2">
        <Link href="/dashboard" className="text-sm underline">← Back to dashboard</Link>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-gray-600">
          {user.email} · {user.role}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Personal details</h2>
        <ProfileForm
          initial={{
            name: user.name ?? "",
            // Agents already gave a phone at signup; use it until they save their own.
            phone: user.phone ?? user.agentApplication?.phone ?? "",
            phoneRequired: user.role === "AGENT",
          }}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Change password</h2>
        <PasswordForm hasPassword={!!user.passwordHash} />
      </section>
    </main>
  );
}
