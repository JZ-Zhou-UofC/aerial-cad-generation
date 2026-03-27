"use client";

import { useState } from "react";
import { toggleMapTransparency } from "@/lib/map";
import AirportLayer from "@/lib/osm/airportLayer";

type Props = {
  map: google.maps.Map;
  airportLayer: AirportLayer;
  setNotification: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
      severity: "error";
    }>
  >;
};

export default function MapControls({
  map,
  airportLayer,
  setNotification,
}: Props) {
  const [search, setSearch] = useState("YVR");

  const doSearch = () => {
    if (!search) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: search }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(14);
      } else {
        setNotification({
          open: true,
          message: "Location not found",
          severity: "error",
        });
      }
    });
    airportLayer.clear();
  };

  const fetchAirport = async () => {
    try {
      await airportLayer.load(search);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      setNotification({
        open: true,
        message,
        severity: "error",
      });
    }
  };

  const Export = async () => {
    const data = {
      bounds: airportLayer.bounds
        ? {
            north: airportLayer.bounds.getNorthEast().lat(),
            east: airportLayer.bounds.getNorthEast().lng(),
            south: airportLayer.bounds.getSouthWest().lat(),
            west: airportLayer.bounds.getSouthWest().lng(),
          }
        : null,
      elements: airportLayer.elements,
      visibleFeatures: Array.from(airportLayer.visibleFeatures),
      airportName: search,
      icao: airportLayer.icao,
    };

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.error || result?.raw || "Export failed");
      }

      console.log("Export success:", result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";

      setNotification({
        open: true,
        message,
        severity: "error",
      });
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: "white",
        padding: 10,
        display: "flex",
        gap: 8,
      }}
    >
      <input
        placeholder="Search airport"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && doSearch()}
      />

      <button onClick={doSearch}>Go</button>

      <button onClick={fetchAirport}>Fetch Airport Data</button>

      <button onClick={() => toggleMapTransparency(map)}>Toggle Map</button>
      <button onClick={() => Export()}>Export</button>
    </div>
  );
}
