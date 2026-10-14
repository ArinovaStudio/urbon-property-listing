import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/platform/db/prisma";
import { loginSchema } from "@/modules/identity/schemas";

import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

type AppRole = "BUYER" | "AGENT" | "ADMIN";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
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
        jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.role = (user as { role: AppRole }).role;
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