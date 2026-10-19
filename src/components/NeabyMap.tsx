"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

type Pin = { id: string; slug: string; title: string; latitude: number; longitude: number; price: number };

export default function NearbyMap({ center, pins }: { center: [number, number]; pins: Pin[] }) {
  return (
    <MapContainer center={center} zoom={12} className="h-[420px] w-full rounded border">
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <CircleMarker center={center} radius={8} pathOptions={{ color: "#000", fillColor: "#fff", fillOpacity: 1 }}>
        <Popup>Search location</Popup>
      </CircleMarker>
      {pins.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.latitude, p.longitude]}
          radius={9}
          pathOptions={{ color: "#000", fillColor: "#000", fillOpacity: 0.85 }}
        >
          <Popup>
            <a href={`/listings/${p.slug}`}>{p.title}</a>
            <br />₹{p.price.toLocaleString("en-IN")}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}