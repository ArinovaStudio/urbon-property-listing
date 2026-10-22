import Link from "next/link";
import { notFound } from "next/navigation";
import { requireLister } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { EditListingForm } from "./edit-listing-form";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireLister();
  const { id } = await params;

  const l = await prisma.listing.findFirst({
    where: { id, ownerId: session.user.id, status: { not: "ARCHIVED" } },
  });
  if (!l) notFound();

  return (
    <main className="mx-auto max-w-lg space-y-4 p-6">
      <Link href="/dashboard" className="text-sm underline">← Back to dashboard</Link>
      <h1 className="text-2xl font-semibold">Edit listing</h1>
      <p className="text-sm text-gray-600">
        After saving, the listing goes back to admin review and won&apos;t show in search until it&apos;s approved again.
      </p>
      <EditListingForm
        listing={{
          id: l.id,
          title: l.title,
          description: l.description,
          listingType: l.listingType,
          category: l.category,
          propertyType: l.propertyType ?? "",
          price: Number(l.price),
          areaSqft: l.areaSqft ?? "",
          bedrooms: l.bedrooms ?? "",
          bathrooms: l.bathrooms ?? "",
          addressLine: l.addressLine ?? "",
          locality: l.locality ?? "",
          city: l.city,
          state: l.state,
          pincode: l.pincode ?? "",
        }}
      />
    </main>
  );
}