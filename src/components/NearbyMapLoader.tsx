"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`, so it must be client-only.
const NearbyMap = dynamic(() => import("./NeabyMap"), {
  ssr: false,
  loading: () => <div className="h-[420px] rounded border bg-gray-100" />,
});

export default NearbyMap;