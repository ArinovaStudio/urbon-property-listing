"use client";

import { useActionState } from "react";
import { createListingAction } from "@/actions/listings";

const input = "rounded border p-2";

export function NewListingForm() {
  const [error, formAction, pending] = useActionState(createListingAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="title" placeholder="Title" required className={input} />
      <textarea name="description" placeholder="Description (min 20 characters)" required rows={4} className={input} />

      <div className="grid grid-cols-2 gap-3">
        <select name="listingType" className={input}>
          <option value="SALE">For sale</option>
          <option value="RENT">For rent</option>
        </select>
        <select name="category" className={input}>
          <option value="RESIDENTIAL">Residential</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="LAND">Land</option>
        </select>
      </div>

      <input name="propertyType" placeholder="Property type (apartment, villa, shop, plot...)" className={input} />

      <div className="grid grid-cols-2 gap-3">
        <input name="price" type="number" min={1} placeholder="Price (₹)" required className={input} />
        <input name="areaSqft" type="number" min={0} placeholder="Area (sqft)" className={input} />
        <input name="bedrooms" type="number" min={0} placeholder="Bedrooms" className={input} />
        <input name="bathrooms" type="number" min={0} placeholder="Bathrooms" className={input} />
      </div>

      <input name="addressLine" placeholder="Street / building" required className={input} />
      <input name="locality" placeholder="Locality / area" className={input} />
      <div className="grid grid-cols-2 gap-3">
        <input name="city" placeholder="City" required className={input} />
        <input name="state" placeholder="State" required className={input} />
      </div>
      <input name="pincode" placeholder="Pincode (6 digits)" className={input} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="rounded bg-black p-2 text-white disabled:opacity-50">
        {pending ? "Locating address & saving..." : "Submit for review"}
      </button>
    </form>
  );
}