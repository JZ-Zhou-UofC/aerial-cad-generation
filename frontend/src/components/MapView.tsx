"use client";

import { useEffect, useRef, useState } from "react";
import { initMap } from "@/lib/map";
import AirportLayer, { FeatureName } from "@/lib/osm/airportLayer";
import MapControls from "./MapControls";
import LayerControls from "./LayerControls";

const initialLayersVisibilityState: Record<FeatureName, boolean> = {
  runway: true,
  taxiway: true,
  stopway: true,
  apron: true,
  terminal: true,
  hangar: true,
  parking_position: true,
  aerodrome: true,
  grass: true,
};

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [airportLayer, setAirportLayer] = useState<AirportLayer | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<string>("");
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [activeFeatures, setActiveFeatures] = useState<Record<FeatureName, boolean>>(initialLayersVisibilityState);
  const [airportFeatureData, setAirportFeatureData] = useState<Partial<Record<FeatureName, any[]>>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string>("");

  useEffect(() => {
    async function start() {
      if (!mapRef.current) return;

      const m = await initMap(mapRef.current);

      setMap(m);
      setAirportLayer(new AirportLayer(m));

      // Listen for bounds changes
      m.addListener("bounds_changed", () => {
        const bounds = m.getBounds();
        if (bounds) setMapBounds(bounds);
      });
    }

    start();
  }, []);

  const fetchAirport = async () => {
    if (!airportLayer) return;
    await airportLayer.load();
    setAirportFeatureData(airportLayer.getFeatureData());
  };

  const handleExportCAD = async () => {
    if (!selectedAirport || !mapBounds || !Object.keys(airportFeatureData).length) {
      setExportError("Please select an airport, load data, and ensure map is ready.");
      return;
    }

    setIsExporting(true);
    setExportError("");

    // Filter feature data based on active features
    const filteredData = Object.fromEntries(
      Object.entries(airportFeatureData).filter(([k]) => activeFeatures[k as FeatureName])
    );

    try {
      const response = await fetch("http://localhost:8000/map/export-cad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icao: selectedAirport,
          bounds: mapBounds.toJSON(),
          features: activeFeatures,
          featureData: filteredData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Assuming backend returns a file, trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedAirport}_layout.dxf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />

      {map && airportLayer && (
        <>
          <MapControls
            map={map}
            airportLayer={airportLayer}
            selectedAirport={selectedAirport}
            onAirportSelect={setSelectedAirport}
            onExportCAD={handleExportCAD}
            isExporting={isExporting}
            exportError={exportError}
            airportFeatureData={airportFeatureData}
            onFetchAirport={fetchAirport}
          />
          <LayerControls
            airportLayer={airportLayer}
            activeFeatures={activeFeatures}
            onFeaturesChange={setActiveFeatures}
          />
        </>
      )}
    </>
  );
}
