"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { geocodeFirst } from "@/lib/geocode";
import { requireLister } from "@/lib/permissions";
import { listingSchema } from "@/lib/validations";

type ListingInput = ReturnType<typeof listingSchema.parse>;

function makeSlug(title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return `${base}-${randomBytes(3).toString("hex")}`;
}

// Most specific query first; falls back to locality, pincode, then city.
function locate(d: ListingInput) {
  return geocodeFirst([
    [d.addressLine, d.locality, d.city, d.state, "India"].filter(Boolean).join(", "),
    [d.locality, d.city, d.state, "India"].filter(Boolean).join(", "),
    d.pincode ? `${d.pincode}, ${d.city}, ${d.state}, India` : "",
    [d.city, d.state, "India"].join(", "),
  ]);
}

const GEOCODE_ERROR =
  "We couldn't locate that address on the map. Add the locality or pincode and try again.";

export async function createListingAction(_prev: string | undefined, formData: FormData) {
  const session = await requireLister();

  const parsed = listingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;
  const d = parsed.data;

  const coords = await locate(d);
  if (!coords) return GEOCODE_ERROR;

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

// id is bound in the client form: updateListingAction.bind(null, id)
export async function updateListingAction(id: string, _prev: string | undefined, formData: FormData) {
  const session = await requireLister();

  // Only the owner can edit, and archived (deleted) listings are gone.
  const existing = await prisma.listing.findFirst({
    where: { id, ownerId: session.user.id, status: { not: "ARCHIVED" } },
  });
  if (!existing) return "Listing not found.";

  const parsed = listingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;
  const d = parsed.data;

  // Only call the geocoder again if the address actually changed.
  const addressChanged =
    existing.latitude === null ||
    existing.longitude === null ||
    (existing.addressLine ?? "") !== d.addressLine ||
    (existing.locality ?? "") !== (d.locality ?? "") ||
    existing.city !== d.city ||
    existing.state !== d.state ||
    (existing.pincode ?? "") !== (d.pincode ?? "");

  let latitude = existing.latitude;
  let longitude = existing.longitude;
  if (addressChanged) {
    const coords = await locate(d);
    if (!coords) return GEOCODE_ERROR;
    latitude = coords.lat;
    longitude = coords.lng;
  }

  await prisma.listing.update({
    where: { id },
    data: {
      title: d.title,
      description: d.description,
      listingType: d.listingType,
      category: d.category,
      propertyType: d.propertyType ?? null,
      price: BigInt(d.price),
      bedrooms: d.bedrooms ?? null,
      bathrooms: d.bathrooms ?? null,
      areaSqft: d.areaSqft ?? null,
      addressLine: d.addressLine,
      locality: d.locality ?? null,
      city: d.city,
      state: d.state,
      pincode: d.pincode ?? null,
      latitude,
      longitude,
      // Any edit goes back through admin review.
      status: "PENDING_REVIEW",
      rejectionReason: null,
    },
  });

  redirect("/dashboard?listing=updated");
}

// Soft delete: hidden from search and the dashboard, history stays intact.
export async function deleteListingAction(formData: FormData) {
  const session = await requireLister();
  const id = String(formData.get("id"));

  await prisma.listing.updateMany({
    where: { id, ownerId: session.user.id },
    data: { status: "ARCHIVED" },
  });

  redirect("/dashboard?listing=deleted");
}