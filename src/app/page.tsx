import Link from "next/link";
import { auth } from "@/lib/auth";
import { connection } from "next/server";

const categories = [
  { title: "Residential", text: "Apartments, houses and villas to buy or rent.", value: "RESIDENTIAL" },
  { title: "Commercial", text: "Shops, offices and showrooms for your business.", value: "COMMERCIAL" },
  { title: "Land", text: "Plots and agricultural land, ready to build or invest.", value: "LAND" },
];

const points = [
  { title: "Reviewed listings", text: "Every listing is checked by our team before it goes live." },
  { title: "Verified agents", text: "Agents are verified against their RERA registration." },
  { title: "Contact owners directly", text: "Send an enquiry from your account, no middlemen." },
];

export default async function HomePage() {
  await connection();
  const session = await auth();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b">
        <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold">RealEstate</Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/search?listingType=SALE" className="hover:underline">Buy</Link>
            <Link href="/search?listingType=RENT" className="hover:underline">Rent</Link>
            {session ? (
              <Link href="/dashboard" className="rounded bg-black px-3 py-2 text-white">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="hover:underline">Log in</Link>
                <Link href="/register" className="rounded bg-black px-3 py-2 text-white">Register</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Find your next property</h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Buy, sell or rent homes, shops and land across India.
          </p>
          <form action="/search" className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-xl border bg-white p-3 shadow-sm md:flex-row">
            <input name="city" placeholder="City or locality" className="flex-1 rounded border p-3" />
            <select name="listingType" className="rounded border p-3">
              <option value="SALE">Buy</option>
              <option value="RENT">Rent</option>
            </select>
            <select name="category" className="rounded border p-3">
              <option value="">All types</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="LAND">Land</option>
            </select>
            <button className="rounded bg-black px-6 py-3 text-white">Search</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Browse by type</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.value} href={`/search?category=${c.value}`}
              className="rounded-xl border p-6 transition hover:shadow-md">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{c.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
          {points.map((p) => (
            <div key={p.title}>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="text-2xl font-semibold">Have a property to list?</h2>
        <p className="mt-2 text-gray-600">Create an account as an owner or agent and reach buyers today.</p>
        <Link href="/register" className="mt-6 inline-block rounded bg-black px-6 py-3 text-white">
          Get started
        </Link>
      </section>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} RealEstate
      </footer>
    </div>
  );
}