import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ListingCard = {
  id: string;
  slug: string;
  title: string;
  price: number;
  listingType: string;
  category: string;
  locality: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  ownerRole: string;
  distanceKm: number | null;
};

export type SearchFilters = { listingType?: string; category?: string };

const LISTING_TYPES = ["SALE", "RENT"];
const CATEGORIES = ["RESIDENTIAL", "COMMERCIAL", "LAND"];

// Live listings within radiusKm of a point, nearest first.
// Bounding box uses the lat/lng columns first, Haversine then trims to a true circle.
export async function searchNearby(
  lat: number,
  lng: number,
  radiusKm: number,
  filters: SearchFilters,
): Promise<ListingCard[]> {
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const typeFilter = LISTING_TYPES.includes(filters.listingType ?? "")
    ? Prisma.sql`AND l."listingType"::text = ${filters.listingType}`
    : Prisma.empty;
  const catFilter = CATEGORIES.includes(filters.category ?? "")
    ? Prisma.sql`AND l."category"::text = ${filters.category}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<
    (Omit<ListingCard, "price" | "distanceKm"> & { price: bigint; distance_km: number })[]
  >(Prisma.sql`
    SELECT * FROM (
      SELECT l.id, l.slug, l.title, l.price, l."listingType"::text AS "listingType",
             l."category"::text AS "category", l.locality, l.city, l.latitude, l.longitude,
             u.role::text AS "ownerRole",
             6371 * acos(least(1, greatest(-1,
               cos(radians(${lat}::float8)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(${lng}::float8))
               + sin(radians(${lat}::float8)) * sin(radians(l.latitude))
             ))) AS distance_km
      FROM "Listing" l
      JOIN "User" u ON u.id = l."ownerId"
      WHERE l.status = 'LIVE'
        AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL
        AND l.latitude  BETWEEN ${lat - dLat}::float8 AND ${lat + dLat}::float8
        AND l.longitude BETWEEN ${lng - dLng}::float8 AND ${lng + dLng}::float8
        ${typeFilter}
        ${catFilter}
    ) t
    WHERE distance_km <= ${radiusKm}::float8
    ORDER BY distance_km ASC
    LIMIT 50
  `);

  return rows.map(({ distance_km, price, ...r }) => ({
    ...r,
    price: Number(price),
    distanceKm: distance_km,
  }));
}

// No place typed: plain filtered list, newest first.
export async function searchAll(filters: SearchFilters): Promise<ListingCard[]> {
  const rows = await prisma.listing.findMany({
    where: {
      status: "LIVE",
      ...(LISTING_TYPES.includes(filters.listingType ?? "") && {
        listingType: filters.listingType as "SALE" | "RENT",
      }),
      ...(CATEGORIES.includes(filters.category ?? "") && {
        category: filters.category as "RESIDENTIAL" | "COMMERCIAL" | "LAND",
      }),
    },
    include: { owner: { select: { role: true } } },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return rows.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    price: Number(l.price),
    listingType: l.listingType,
    category: l.category,
    locality: l.locality,
    city: l.city,
    latitude: l.latitude,
    longitude: l.longitude,
    ownerRole: l.owner.role,
    distanceKm: null,
  }));
}