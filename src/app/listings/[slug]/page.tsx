import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EnquiryForm } from "./enquiry-form";
import { ReportForm } from "./report-form";

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const session = await auth();

  const listing = await prisma.listing
    .update({
      where: { slug, status: "LIVE" },
      data: { viewCount: { increment: 1 } },
      include: { owner: { select: { name: true, role: true } } },
    })
    .catch(() => null);

  if (!listing) notFound();

  const address = [listing.addressLine, listing.locality, listing.city, listing.state, listing.pincode]
    .filter(Boolean)
    .join(", ");

  const isOwner = session?.user.id === listing.ownerId;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Link href="/search" className="text-sm underline">← Back to search</Link>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://placehold.co/1200x500/e5e5e5/525252?text=${encodeURIComponent(listing.category)}`}
        alt={listing.title}
        className="h-72 w-full rounded-xl object-cover"
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="text-sm text-gray-600">{address}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">
            ₹{Number(listing.price).toLocaleString("en-IN")}
            {listing.listingType === "RENT" && <span className="text-sm font-normal"> / month</span>}
          </div>
          {listing.priceNegotiable && <div className="text-xs text-gray-500">Negotiable</div>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {[
          listing.listingType === "SALE" ? "For sale" : "For rent",
          listing.category,
          listing.propertyType,
          listing.bedrooms != null && `${listing.bedrooms} bed`,
          listing.bathrooms != null && `${listing.bathrooms} bath`,
          listing.areaSqft != null && `${listing.areaSqft} sqft`,
        ]
          .filter(Boolean)
          .map((t) => (
            <span key={String(t)} className="rounded border px-2 py-1">{t}</span>
          ))}
      </div>

      <p className="whitespace-pre-line text-gray-800">{listing.description}</p>

      <p className="text-sm text-gray-600">
        Listed by {listing.owner.name}
        {listing.owner.role === "AGENT" && (
          <span className="ml-2 rounded border px-2 py-0.5 text-xs">Verified agent</span>
        )}
        <span className="ml-3 text-gray-400">{listing.viewCount} views</span>
      </p>

      <section className="max-w-md space-y-3 border-t pt-6">
        <h2 className="text-lg font-medium">Contact the owner</h2>
        {isOwner ? (
          <p className="text-sm text-gray-600">This is your listing.</p>
        ) : session ? (
          <EnquiryForm listingId={listing.id} />
        ) : (
          <p className="text-sm text-gray-600">
            <Link href={`/login?callbackUrl=/listings/${listing.slug}`} className="underline">Log in</Link>{" "}
            to send an enquiry.
          </p>
        )}
      </section>
      {session && !isOwner && (
        <div className="border-t pt-4">
          <ReportForm listingId={listing.id} />
        </div>
      )}
    </main>
  );
}