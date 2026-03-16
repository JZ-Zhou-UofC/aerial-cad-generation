"use client";

import { useState } from "react";
import { toggleMapTransparency } from "@/lib/map";
import AirportLayer, { FeatureName } from "@/lib/osm/airportLayer";

type Props = {
  map: google.maps.Map;
  airportLayer: AirportLayer;
  selectedAirport: string;
  onAirportSelect: (icao: string) => void;
  onExportCAD: () => void;
  isExporting: boolean;
  exportError: string;
  airportFeatureData: Partial<Record<FeatureName, any[]>>;
  onFetchAirport: () => void;
};

export default function MapControls({
  map,
  airportLayer,
  selectedAirport,
  onAirportSelect,
  onExportCAD,
  isExporting,
  exportError,
  airportFeatureData,
  onFetchAirport,
}: Props) {
  const [search, setSearch] = useState("");

  const doSearch = () => {
    if (!search) return;

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: search }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(14);
        // Assume search is ICAO for simplicity; in real app, parse or confirm
        onAirportSelect(search.toUpperCase());
      }
    });
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
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
      }}
    >
      <input
        placeholder="Search airport (ICAO)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && doSearch()}
      />
      <button onClick={doSearch}>Go</button>
      <button onClick={onFetchAirport}>Fetch Airport Data</button>
      <button onClick={() => toggleMapTransparency(map)}>Toggle Map</button>
      <button onClick={onExportCAD} disabled={isExporting}>
        {isExporting ? "Exporting..." : "Export CAD"}
      </button>
      {selectedAirport && <div>Selected: {selectedAirport}</div>}
      {Object.keys(airportFeatureData).length > 0 && (
        <div>
          Features: {Object.entries(airportFeatureData).map(([feat, data]) => `${feat}:${data.length}`).join(', ')}
        </div>
      )}
      {exportError && <div style={{ color: "red" }}>Error: {exportError}</div>}
      <button>Boundary</button>
      <button>Details</button>
    </div>
  );
}
