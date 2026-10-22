"use client";

import Link from "next/link";
import { deleteListingAction } from "@/actions/listings";

export function ListingActions({ id }: { id: string }) {
    return (
    <div className="mt-2 flex justify-end gap-2 text-xs">
        <Link href={`/dashboard/listings/${id}/edit`} className="rounded border px-2 py-1">Edit</Link>
        <form action={deleteListingAction} onSubmit={(e) => {
            if (!confirm("Delete this listing? It will be removed from search.")) e.preventDefault();
        }}>
        <input type="hidden" name="id" value={id} />
        <button className="rounded border px-2 py-1">Delete</button>
      </form>
    </div>
  );
}