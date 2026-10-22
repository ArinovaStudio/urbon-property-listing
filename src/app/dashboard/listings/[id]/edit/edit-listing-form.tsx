"use client";

import { useActionState } from "react";
import { updateListingAction } from "@/actions/listings";

const input = "rounded border p-2";

type Props = {
  listing: {
    id: string;
    title: string;
    description: string;
    listingType: string;
    category: string;
    propertyType: string;
    price: number;
    areaSqft: number | "";
    bedrooms: number | "";
    bathrooms: number | "";
    addressLine: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
  };
};

export function EditListingForm({ listing: l }: Props) {
  const [error, formAction, pending] = useActionState(updateListingAction.bind(null, l.id), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="title" defaultValue={l.title} placeholder="Title" required className={input} />
      <textarea name="description" defaultValue={l.description} required rows={4} className={input} />

      <div className="grid grid-cols-2 gap-3">
        <select name="listingType" defaultValue={l.listingType} className={input}>
          <option value="SALE">For sale</option>
          <option value="RENT">For rent</option>
        </select>
        <select name="category" defaultValue={l.category} className={input}>
          <option value="RESIDENTIAL">Residential</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="LAND">Land</option>
        </select>
      </div>

      <input name="propertyType" defaultValue={l.propertyType} placeholder="Property type" className={input} />

      <div className="grid grid-cols-2 gap-3">
        <input name="price" type="number" min={1} defaultValue={l.price} placeholder="Price (₹)" required className={input} />
        <input name="areaSqft" type="number" min={0} defaultValue={l.areaSqft} placeholder="Area (sqft)" className={input} />
        <input name="bedrooms" type="number" min={0} defaultValue={l.bedrooms} placeholder="Bedrooms" className={input} />
        <input name="bathrooms" type="number" min={0} defaultValue={l.bathrooms} placeholder="Bathrooms" className={input} />
      </div>

      <input name="addressLine" defaultValue={l.addressLine} placeholder="Street / building" required className={input} />
      <input name="locality" defaultValue={l.locality} placeholder="Locality / area" className={input} />
      <div className="grid grid-cols-2 gap-3">
        <input name="city" defaultValue={l.city} placeholder="City" required className={input} />
        <input name="state" defaultValue={l.state} placeholder="State" required className={input} />
      </div>
      <input name="pincode" defaultValue={l.pincode} placeholder="Pincode (6 digits)" className={input} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="rounded bg-black p-2 text-white disabled:opacity-50">
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}