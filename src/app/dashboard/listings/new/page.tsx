import Link from "next/link";
import { requireLister } from "@/lib/permissions";
import { NewListingForm } from "./new-listing-form";

export default async function NewListingPage() {
  await requireLister();

  return (
    <main className="mx-auto max-w-lg space-y-4 p-6">
      <Link href="/dashboard" className="text-sm underline">← Back to dashboard</Link>
      <h1 className="text-2xl font-semibold">New listing</h1>
      <p className="text-sm text-gray-600">
        The address is located on the map automatically. Your listing goes live after admin review.
      </p>
      <NewListingForm />
    </main>
  );
}