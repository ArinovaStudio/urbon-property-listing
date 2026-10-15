"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";

const input = "rounded border p-2";

export default function RegisterPage() {
  const [error, formAction, pending] = useActionState(registerAction, undefined);
  const [role, setRole] = useState("BUYER");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form action={formAction} className="flex flex-col gap-3">
        <input name="name" placeholder="Full name" required className={input} />
        <input name="email" type="email" placeholder="Email" required className={input} />
        <input name="password" type="password" placeholder="Password (min 8 characters)" required className={input} />

        <label className="text-sm font-medium">I want to join as</label>
        <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className={input}>
          <option value="BUYER">Buyer / tenant</option>
          <option value="OWNER">Property owner</option>
          <option value="AGENT">Agent (requires verification)</option>
        </select>

        {role === "AGENT" && (
          <>
            <p className="text-xs text-gray-500">
              Agent accounts are reviewed before you can list as an agent. Until then you can use the site as a buyer.
            </p>
            <input name="agencyName" placeholder="Agency name" required className={input} />
            <input name="reraNumber" placeholder="RERA registration number" required className={input} />
            <input name="reraState" placeholder="RERA state (e.g. Madhya Pradesh)" required className={input} />
            <input name="phone" placeholder="10-digit mobile number" required className={input} />
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={pending} className="rounded bg-black p-2 text-white disabled:opacity-50">
          {pending ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="text-sm">
        Already registered? <Link href="/login" className="underline">Log in</Link>
      </p>
    </main>
  );
}