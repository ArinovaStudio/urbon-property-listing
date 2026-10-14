import Link from "next/link";
import { LoginForm } from "./login-form";
import { googleSignInAction } from "@/modules/identity/actions";

const messages: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email is already registered with a password. Log in with your email and password instead.",
};

export default async function LoginPage({ searchParams, } : { searchParams: Promise<{ error?: string }>; }) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Log in</h1>
      {error && (
        <p className="text-sm text-red-600">
          {messages[error] ?? "Sign-in failed. Please try again."}
        </p>
      )}
      <form action={googleSignInAction}>
        <button className="w-full rounded border p-2">Continue with Google</button>
      </form>
      <p className="text-center text-sm text-gray-500">or</p>
      <LoginForm />
      <p className="text-sm">
        No account? <Link href="/register" className="underline">Register</Link>
      </p>
    </main>
  );
}