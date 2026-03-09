"use client";

import { useEffect, useRef } from "react";
import { initMap } from "../../lib/map";

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function start() {
      if (!mapRef.current) return;

      await initMap(mapRef.current);
    }

    start();
  }, []);

  return <div ref={mapRef} style={{ height: "100vh" }} />;
}