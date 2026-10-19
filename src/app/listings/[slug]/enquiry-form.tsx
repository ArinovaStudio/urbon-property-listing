"use client";

import { useActionState } from "react";
import { createEnquiryAction } from "@/actions/enquiries";

const input = "rounded border p-2";

export function EnquiryForm({ listingId }: { listingId: string }) {
  const [state, formAction, pending] = useActionState(createEnquiryAction, undefined);

  if (state?.ok) {
    return <p className="rounded border bg-gray-100 p-3 text-sm">Enquiry sent. The owner will get back to you.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="listingId" value={listingId} />
      <input name="phone" placeholder="Your mobile number (optional)" className={input} />
      <textarea
        name="message"
        rows={4}
        required
        placeholder="Hi, I'm interested in this property. Is it still available?"
        className={input}
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded bg-black p-2 text-white disabled:opacity-50">
        {pending ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}