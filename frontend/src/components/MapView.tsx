"use client";

import { useEffect, useRef, useState } from "react";
import { initMap } from "@/lib/map";
import AirportLayer from "@/lib/osm/airportLayer";
import MapControls from "./MapControls";
import LayerControls from "./LayerControls";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [airportLayer, setAirportLayer] = useState<AirportLayer | null>(null);

  useEffect(() => {
    async function start() {
      if (!mapRef.current) return;

      const m = await initMap(mapRef.current);

      setMap(m);
      setAirportLayer(new AirportLayer(m));
    }

    start();
  }, []);

  return (
    <>
      <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />

      {map && airportLayer && (
        <>
          <MapControls map={map} airportLayer={airportLayer} />
          <LayerControls airportLayer={airportLayer} />
        </>
      )}
    </>
  );
}