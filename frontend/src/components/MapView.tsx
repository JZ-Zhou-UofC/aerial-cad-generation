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
<div className="relative w-full h-screen">
  {/* Map container */}
  <div ref={mapRef} className="w-full h-full" />

  {/* Attribution */}
  <div className="absolute bottom-5 right-3 z-[1000] bg-white/80 text-gray-800 text-[11px] px-2 py-1 rounded">
    Airport data from{" "}
    <a
      href="https://www.openstreetmap.org"
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      OpenStreetMap
    </a>
  </div>
</div>

      {map && airportLayer && (
        <>
          <MapControls
            map={map}
            airportLayer={airportLayer}
  
          />
          <LayerControls airportLayer={airportLayer} />

        </>
      )}
    </>
  );
}
