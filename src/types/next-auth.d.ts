import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";

type AppRole = "BUYER" | "OWNER" | "AGENT" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: AppRole } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    roleCheckedAt?: number;
  }
}