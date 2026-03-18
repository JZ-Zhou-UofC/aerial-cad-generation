"use client";

import { useState } from "react";
import { toggleMapTransparency } from "@/lib/map";
import AirportLayer from "@/lib/osm/airportLayer";
import { exportCAD } from "@/lib/api/backend";


type Props = {
  map: google.maps.Map;
  airportLayer: AirportLayer;
};

export default function MapControls({ map, airportLayer }: Props) {



  const [search, setSearch] = useState("yvr");

  const doSearch = () => {
    if (!search) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: search }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(14);
      }
    });
    airportLayer.clear();
    const bounds = map.getBounds();
    if (bounds) {
      airportLayer.setBounds(bounds);
    }

  };

  const fetchAirport = async () => {
    await airportLayer.load();
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
      airportName:search
    };

    try {
      const result = await exportCAD(data);
      console.log("Export success:", result);
    } catch (err) {
      console.error("Export error:", err);
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
     
      <button>placeholder_for_boundary</button>
      <button onClick={() => Export()}>Export</button>
    </div>
  );
}
