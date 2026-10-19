type Coords = { lat: number; lng: number };
const cache = new Map<string, Coords>(); // only successful lookups are cached

// Nominatim policy: identify yourself, max ~1 request/second, no autocomplete.
const USER_AGENT = "RealEstateMVP/1.0 (anirudhhh637@email.com)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function geocode(query: string): Promise<Coords | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  const hit = cache.get(key);
  if (hit) return hit;

  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=" +
    encodeURIComponent(query);

  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, cache: "no-store" });
    if (!res.ok) {
      console.warn(`[geocode] HTTP ${res.status} for "${query}"`);
      return null;
    }
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data[0]) {
      console.warn(`[geocode] no results for "${query}"`);
      return null;
    }
    const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    cache.set(key, result);
    return result;
  } catch (e) {
    console.warn(`[geocode] request failed for "${query}":`, e);
    return null;
  }
}

// Tries each query in order (most specific first) and returns the first hit.
// Waits between attempts to stay under Nominatim's 1 request/second limit.
export async function geocodeFirst(queries: string[]): Promise<Coords | null> {
  const unique = [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
  for (let i = 0; i < unique.length; i++) {
    if (i > 0) await sleep(1100);
    const result = await geocode(unique[i]);
    if (result) return result;
  }
  return null;
}