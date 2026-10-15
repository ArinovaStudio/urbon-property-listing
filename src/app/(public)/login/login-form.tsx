"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <input name="email" type="email" placeholder="Email" required
        className="rounded border p-2" />
      <input name="password" type="password" placeholder="Password" required
        className="rounded border p-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending}
        className="rounded bg-black p-2 text-white disabled:opacity-50">
        {pending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}