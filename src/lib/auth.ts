import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

type AppRole = "BUYER" | "OWNER" | "AGENT" | "ADMIN";
const SESSION_MAX_AGE = 15 * 24 * 60 * 60;
const SESSION_UPDATE_AGE = 24 * 60 * 60;
const ROLE_REFRESH_MS = 5 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        maxAge: SESSION_MAX_AGE,
        updateAge: SESSION_UPDATE_AGE,
    },
    jwt: { maxAge: SESSION_MAX_AGE },
    pages: { signIn: "/login" },
    providers: [
        Google,
        Credentials({
            credentials: { email: {}, password: {} },
            authorize: async (raw) => {
                const parsed = loginSchema.safeParse(raw);
                if (!parsed.success) return null;
                const user = await prisma.user.findUnique({
                    where: { email: parsed.data.email.toLowerCase() },
                });
                if (!user?.passwordHash) return null;
                const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
                if (!ok) return null;
                return { id: user.id, email: user.email, name: user.name, role: user.role };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) token.id = user.id;
            if (!token.id) return token;

            const stale =
                !token.roleCheckedAt || Date.now() - token.roleCheckedAt > ROLE_REFRESH_MS;
            if (user || trigger === "update" || stale) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: { role: true },
                });
                if (!dbUser) return null;
                token.role = dbUser.role;
                token.roleCheckedAt = Date.now();
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id as string;
            session.user.role = token.role as AppRole;
            return session;
        },
    },
});