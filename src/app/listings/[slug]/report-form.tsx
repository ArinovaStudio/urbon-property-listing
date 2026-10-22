"use client";

import { useActionState } from "react";
import { reportListingAction } from "@/actions/reports";

export function ReportForm({ listingId }: { listingId: string }) {
    const [state, formAction, pending] = useActionState(reportListingAction, undefined);

    if (state?.ok) {
        return <p className="text-sm text-gray-600">Thanks. Our team will review this listing.</p>;
    }

    return (
    <details className="text-sm">
        <summary className="cursor-pointer text-gray-500 underline">Report this listing</summary>
        <form action={formAction} className="mt-3 flex max-w-md flex-col gap-2">
            <input type="hidden" name="listingId" value={listingId} />
            <select name="reason" className="rounded border p-2">
                <option value="FAKE">Fake or misleading listing</option>
                <option value="SPAM">Spam</option>
                <option value="DUPLICATE">Duplicate listing</option>
                <option value="WRONG_INFO">Wrong price or details</option>
                <option value="OTHER">Other</option>
            </select>
            <textarea name="details" rows={3} placeholder="Details (optional)" className="rounded border p-2" />
            {state?.error && <p className="text-red-600">{state.error}</p>}
            <button disabled={pending} className="rounded border px-3 py-2 disabled:opacity-50">
                {pending ? "Sending..." : "Submit report"}
            </button>
        </form>
    </details>
  );
}