import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed dev accounts in production.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "Demo@12345";

type Seed = {
  slug: string;
  title: string;
  description: string;
  listingType: "SALE" | "RENT";
  category: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  propertyType: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  by: "agent" | "owner";
};

const listings: Seed[] = [
  // ---- Bhopal ----
  { slug: "seed-bpl-1", title: "3 BHK apartment near MP Nagar", description: "Spacious 3 BHK on the 4th floor with covered parking, power backup and a nearby market.", listingType: "SALE", category: "RESIDENTIAL", propertyType: "apartment", price: 6800000, bedrooms: 3, bathrooms: 3, areaSqft: 1450, addressLine: "Zone 1", locality: "MP Nagar", city: "Bhopal", state: "Madhya Pradesh", pincode: "462011", latitude: 23.2330, longitude: 77.4340, by: "agent" },
  { slug: "seed-bpl-2", title: "2 BHK flat for rent in Arera Colony", description: "Fully furnished 2 BHK in a quiet, green neighbourhood close to schools and parks.", listingType: "RENT", category: "RESIDENTIAL", propertyType: "apartment", price: 18000, bedrooms: 2, bathrooms: 2, areaSqft: 1050, addressLine: "E-5", locality: "Arera Colony", city: "Bhopal", state: "Madhya Pradesh", pincode: "462016", latitude: 23.2120, longitude: 77.4310, by: "owner" },
  { slug: "seed-bpl-3", title: "Ground-floor shop at New Market", description: "High-footfall corner shop on the main road, suitable for retail or a showroom.", listingType: "SALE", category: "COMMERCIAL", propertyType: "shop", price: 9500000, areaSqft: 600, addressLine: "Main Road", locality: "New Market", city: "Bhopal", state: "Madhya Pradesh", pincode: "462003", latitude: 23.2330, longitude: 77.4010, by: "agent" },
  { slug: "seed-bpl-4", title: "Residential plot on Kolar Road", description: "East-facing 1500 sqft plot in a developed colony with road, water and electricity access.", listingType: "SALE", category: "LAND", propertyType: "plot", price: 3200000, areaSqft: 1500, addressLine: "Sector B", locality: "Kolar Road", city: "Bhopal", state: "Madhya Pradesh", pincode: "462042", latitude: 23.1700, longitude: 77.4200, by: "owner" },
  { slug: "seed-bpl-5", title: "Office space in Shahpura", description: "Furnished 900 sqft office with conference room, reception and 24x7 access.", listingType: "RENT", category: "COMMERCIAL", propertyType: "office", price: 45000, areaSqft: 900, addressLine: "B-Block", locality: "Shahpura", city: "Bhopal", state: "Madhya Pradesh", pincode: "462016", latitude: 23.1950, longitude: 77.4350, by: "agent" },
  // ---- Indore ----
  { slug: "seed-idr-1", title: "4 BHK villa in Vijay Nagar", description: "Independent villa with a garden, two-car parking and a modular kitchen.", listingType: "SALE", category: "RESIDENTIAL", propertyType: "villa", price: 21500000, bedrooms: 4, bathrooms: 4, areaSqft: 2800, addressLine: "Scheme 54", locality: "Vijay Nagar", city: "Indore", state: "Madhya Pradesh", pincode: "452010", latitude: 22.7530, longitude: 75.8930, by: "agent" },
  { slug: "seed-idr-2", title: "1 BHK studio for rent near Palasia", description: "Compact, well-ventilated studio with a balcony. Ideal for working professionals.", listingType: "RENT", category: "RESIDENTIAL", propertyType: "apartment", price: 11000, bedrooms: 1, bathrooms: 1, areaSqft: 550, addressLine: "AB Road", locality: "Palasia", city: "Indore", state: "Madhya Pradesh", pincode: "452001", latitude: 22.7240, longitude: 75.8830, by: "owner" },
  { slug: "seed-idr-3", title: "Showroom space near Rajwada", description: "Double-height ground-floor showroom in the busiest market of the city.", listingType: "RENT", category: "COMMERCIAL", propertyType: "showroom", price: 120000, areaSqft: 1800, addressLine: "MG Road", locality: "Rajwada", city: "Indore", state: "Madhya Pradesh", pincode: "452002", latitude: 22.7180, longitude: 75.8570, by: "agent" },
  { slug: "seed-idr-4", title: "Agricultural land near Bhawarkuan", description: "2-acre fertile parcel with a borewell and road frontage, ready for development or farming.", listingType: "SALE", category: "LAND", propertyType: "agricultural", price: 15000000, areaSqft: 87120, addressLine: "Ring Road", locality: "Bhawarkuan", city: "Indore", state: "Madhya Pradesh", pincode: "452001", latitude: 22.6970, longitude: 75.8620, by: "owner" },
  // ---- Gwalior ----
  { slug: "seed-gwl-1", title: "3 BHK house in Lashkar", description: "Two-storey independent house with a terrace, close to the main market and hospitals.", listingType: "SALE", category: "RESIDENTIAL", propertyType: "house", price: 7400000, bedrooms: 3, bathrooms: 3, areaSqft: 1600, addressLine: "Jayendraganj", locality: "Lashkar", city: "Gwalior", state: "Madhya Pradesh", pincode: "474009", latitude: 26.2050, longitude: 78.1620, by: "agent" },
  { slug: "seed-gwl-2", title: "2 BHK flat for rent at City Centre", description: "Semi-furnished 2 BHK with lift, security and covered parking.", listingType: "RENT", category: "RESIDENTIAL", propertyType: "apartment", price: 14000, bedrooms: 2, bathrooms: 2, areaSqft: 1000, addressLine: "City Centre", locality: "City Centre", city: "Gwalior", state: "Madhya Pradesh", pincode: "474002", latitude: 26.2140, longitude: 78.1900, by: "owner" },
  { slug: "seed-gwl-3", title: "Commercial shop in Thatipur", description: "Ready-to-use shop on a busy road, with a mezzanine for storage.", listingType: "SALE", category: "COMMERCIAL", propertyType: "shop", price: 5200000, areaSqft: 500, addressLine: "Main Road", locality: "Thatipur", city: "Gwalior", state: "Madhya Pradesh", pincode: "474011", latitude: 26.2000, longitude: 78.2050, by: "agent" },
  { slug: "seed-gwl-4", title: "Plot near Morar", description: "Corner plot of 2000 sqft in an approved colony, close to the highway.", listingType: "SALE", category: "LAND", propertyType: "plot", price: 2800000, areaSqft: 2000, addressLine: "Colony Road", locality: "Morar", city: "Gwalior", state: "Madhya Pradesh", pincode: "474006", latitude: 26.2150, longitude: 78.2370, by: "owner" },
];

async function upsertUser(email: string, name: string, role: "ADMIN" | "BUYER" | "OWNER" | "AGENT", password: string) {
  return prisma.user.upsert({
    where: { email },
    update: { role },
    create: {
      email,
      name,
      role,
      passwordHash: await bcrypt.hash(password, 12),
      emailVerified: new Date(),
    },
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables.");
  }

  await upsertUser(adminEmail, "Admin", "ADMIN", adminPassword);
  console.log(`Dev admin ready: ${adminEmail}`);

  const buyer = await upsertUser("buyer@demo.test", "Demo Buyer", "BUYER", DEMO_PASSWORD);
  const owner = await upsertUser("owner@demo.test", "Demo Owner", "OWNER", DEMO_PASSWORD);
  const agent = await upsertUser("agent@demo.test", "Demo Agent", "AGENT", DEMO_PASSWORD);

  // Approved application so the agent matches what real approval produces.
  await prisma.agentApplication.upsert({
    where: { userId: agent.id },
    update: { status: "APPROVED" },
    create: {
      userId: agent.id,
      agencyName: "Demo Realty",
      reraNumber: "DEMO-RERA-0001",
      reraState: "Madhya Pradesh",
      phone: "9876543210",
      status: "APPROVED",
      reviewedAt: new Date(),
    },
  });

  for (const { by, ...l } of listings) {
    await prisma.listing.upsert({
      where: { slug: l.slug },
      update: {},
      create: {
        ...l,
        price: BigInt(l.price),
        ownerId: by === "agent" ? agent.id : owner.id,
        status: "LIVE",
        publishedAt: new Date(),
      },
    });
  }

  console.log(`Seeded ${listings.length} live listings.`);
  console.log(`Demo logins (password: ${DEMO_PASSWORD}): buyer@demo.test, owner@demo.test, agent@demo.test`);
  void buyer;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());