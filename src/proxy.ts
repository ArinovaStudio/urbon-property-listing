import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PROTECTED = ["/dashboard", "/admin"];

const AUTH_PAGES = ["/login", "/register"];

const matches = (path: string, bases: string[]) =>
  bases.some((b) => path === b || path.startsWith(`${b}/`));

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const session = req.auth;
  if (session && matches(path, AUTH_PAGES)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!session && matches(path, PROTECTED)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (session && matches(path, ["/admin"]) && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};