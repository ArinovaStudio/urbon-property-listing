import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed the dev admin account in production.");
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
        throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables.");
    }

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: "ADMIN" },
        create: {
            email: adminEmail,
            name: "Admin",
            passwordHash: await bcrypt.hash(adminPassword, 12),
            role: "ADMIN",
            emailVerified: new Date(),
        },
    });
    console.log(`Dev admin ready: ${adminEmail}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());