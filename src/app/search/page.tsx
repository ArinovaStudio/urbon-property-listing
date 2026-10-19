import Link from "next/link";
import { geocode } from "@/lib/geocode";
import { searchAll, searchNearby } from "@/lib/search";
import NearbyMap from "@/components/NearbyMapLoader";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; listingType?: string; category?: string; radius?: string }>;
}) {
  const { city, listingType, category, radius } = await searchParams;
  const radiusKm = [5, 10, 25, 50].includes(Number(radius)) ? Number(radius) : 10;
  const filters = { listingType, category };

  const place = city?.trim();
  const coords = place ? await geocode(place) : null;
  const results = coords
    ? await searchNearby(coords.lat, coords.lng, radiusKm, filters)
    : place
      ? []
      : await searchAll(filters);

  const pins = results.filter((l) => l.latitude !== null && l.longitude !== null) as ((typeof results)[number] & {
    latitude: number;
    longitude: number;
  })[];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b">
        <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold">RealEstate</Link>
          <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4">
        <form className="flex flex-col gap-2 md:flex-row">
          <input name="city" defaultValue={place} placeholder="Area, locality or city" className="flex-1 rounded border p-2" />
          <select name="listingType" defaultValue={listingType ?? ""} className="rounded border p-2">
            <option value="">Buy or rent</option>
            <option value="SALE">Buy</option>
            <option value="RENT">Rent</option>
          </select>
          <select name="category" defaultValue={category ?? ""} className="rounded border p-2">
            <option value="">All types</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="LAND">Land</option>
          </select>
          <select name="radius" defaultValue={String(radiusKm)} className="rounded border p-2">
            {[5, 10, 25, 50].map((r) => (
              <option key={r} value={r}>{r} km</option>
            ))}
          </select>
          <button className="rounded bg-black px-6 py-2 text-white">Search</button>
        </form>

        {place && !coords && (
          <p className="text-sm text-gray-600">We couldn&apos;t find that place. Try a more specific name.</p>
        )}

        {coords && <NearbyMap center={[coords.lat, coords.lng]} pins={pins} />}

        <p className="text-sm text-gray-600">
          {results.length} {results.length === 1 ? "property" : "properties"}
          {coords ? ` within ${radiusKm} km of ${place}` : ""}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => (
            <Link key={l.id} href={`/listings/${l.slug}`} className="rounded-xl border transition hover:shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://placehold.co/600x400/e5e5e5/525252?text=${encodeURIComponent(l.category)}`}
                alt={l.title}
                className="h-40 w-full rounded-t-xl object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{l.title}</h3>
                  {l.ownerRole === "AGENT" && (
                    <span className="shrink-0 rounded border px-2 py-0.5 text-xs">Verified agent</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {[l.locality, l.city].filter(Boolean).join(", ")}
                </p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="font-medium">
                    ₹{l.price.toLocaleString("en-IN")}
                    {l.listingType === "RENT" && " / month"}
                  </span>
                  {l.distanceKm !== null && <span className="text-gray-500">{l.distanceKm.toFixed(1)} km away</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}