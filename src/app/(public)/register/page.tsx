"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/modules/identity/actions";

export default function RegisterPage() {
  const [error, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form action={formAction} className="flex flex-col gap-3">
        <input name="name" placeholder="Full name" required
          className="rounded border p-2" />
        <input name="email" type="email" placeholder="Email" required
          className="rounded border p-2" />
        <input name="password" type="password" placeholder="Password (min 8 characters)"
          required className="rounded border p-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={pending}
          className="rounded bg-black p-2 text-white disabled:opacity-50">
          {pending ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="text-sm">
        Already registered? <Link href="/login" className="underline">Log in</Link>
      </p>
    </main>
  );
}