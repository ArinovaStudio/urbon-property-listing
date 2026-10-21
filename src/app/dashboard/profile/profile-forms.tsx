"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateProfileAction,
  type ProfileState,
} from "@/actions/profile";

type Initial = { name: string; phone: string; phoneRequired: boolean };

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    undefined,
  );

  const name = state?.values?.name ?? initial.name;
  const phone = state?.values?.phone ?? initial.phone;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input name="name" defaultValue={name} key={`n-${name}`} required maxLength={80}
          className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone {initial.phoneRequired ? "" : "(optional)"}
        <input name="phone" type="tel" inputMode="numeric" defaultValue={phone} key={`p-${phone}`}
          placeholder="10-digit mobile number" required={initial.phoneRequired} maxLength={10}
          className="rounded border p-2" />
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Profile updated.</p>}
      <button disabled={pending}
        className="rounded bg-black p-2 text-white disabled:opacity-50">
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    changePasswordAction,
    undefined,
  );

  if (!hasPassword) {
    return (
      <p className="rounded border bg-gray-100 p-3 text-sm">
        This account signs in with Google, so there&apos;s no password to change.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="currentPassword" type="password" placeholder="Current password"
        autoComplete="current-password" required className="rounded border p-2" />
      <input name="newPassword" type="password" placeholder="New password (8-72 characters)"
        autoComplete="new-password" required minLength={8} maxLength={72} className="rounded border p-2" />
      <input name="confirmPassword" type="password" placeholder="Confirm new password"
        autoComplete="new-password" required className="rounded border p-2" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Password changed.</p>}
      <button disabled={pending}
        className="rounded bg-black p-2 text-white disabled:opacity-50">
        {pending ? "Updating..." : "Change password"}
      </button>
    </form>
  );
}
