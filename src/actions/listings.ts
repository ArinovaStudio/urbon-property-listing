"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { geocodeFirst } from "@/lib/geocode";
import { requireLister } from "@/lib/permissions";
import { listingSchema } from "@/lib/validations";

function makeSlug(title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return `${base}-${randomBytes(3).toString("hex")}`;
}

export async function createListingAction(_prev: string | undefined, formData: FormData) {
  const session = await requireLister();

  const parsed = listingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;
  const d = parsed.data;

    const coords = await geocodeFirst([
        [d.addressLine, d.locality, d.city, d.state, "India"].filter(Boolean).join(", "),
        [d.locality, d.city, d.state, "India"].filter(Boolean).join(", "),
        d.pincode ? `${d.pincode}, ${d.city}, ${d.state}, India` : "",
        [d.city, d.state, "India"].join(", "),
    ]);
  if (!coords) {
    return "We couldn't locate that address on the map. Add the locality or pincode and try again.";
  }

  await prisma.listing.create({
    data: {
      ownerId: session.user.id,
      slug: makeSlug(d.title),
      title: d.title,
      description: d.description,
      listingType: d.listingType,
      category: d.category,
      propertyType: d.propertyType,
      price: BigInt(d.price),
      bedrooms: d.bedrooms,
      bathrooms: d.bathrooms,
      areaSqft: d.areaSqft,
      addressLine: d.addressLine,
      locality: d.locality,
      city: d.city,
      state: d.state,
      pincode: d.pincode,
      latitude: coords.lat,
      longitude: coords.lng,
      status: "PENDING_REVIEW",
    },
  });

  redirect("/dashboard?listing=submitted");
}