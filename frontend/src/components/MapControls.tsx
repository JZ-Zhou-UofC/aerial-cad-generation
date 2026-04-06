"use client";

import { useState } from "react";
import { toggleMapTransparency } from "@/lib/map";
import AirportLayer from "@/lib/osm/airportLayer";
import NotificationBubble from "./NotificationBubble";

type Props = {
  map: google.maps.Map;
  airportLayer: AirportLayer;

};

export default function MapControls({
  map,
  airportLayer,

}: Props) {
  const [search, setSearch] = useState("YVR");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as "error" | "warning" | "info" | "success",
  });
  // loading states
  const [exporting, setExporting] = useState(false);
  const [fetching, setFetching] = useState(false);

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
    if (fetching) return;
    setFetching(true);

    try {
      await airportLayer.load(search);

      setNotification({
        open: true,
        message: "Airport data fetched successfully",
        severity: "success",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      setNotification({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setFetching(false);
    }
  };
  const Export = async () => {
    if (exporting) return;
    setExporting(true);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // try read error message safely
        const text = await res.text();
        let message = "Export failed";

        try {
          const json = JSON.parse(text);
          message = json?.error || json?.raw || message;
        } catch {
          message = text || message;
        }

        throw new Error(message);
      }

      const blob = await res.blob();

      const disposition = res.headers.get("Content-Disposition");
      let filename = "export.dxf";

      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      setNotification({
        open: true,
        message: "Export downloaded successfully",
        severity: "success",
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";

      setNotification({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setExporting(false);
    }
  };

  const Spinner = () => (
    <span className="inline-block w-3 h-3 ml-1.5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
  );

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

      <button onClick={fetchAirport} disabled={fetching}>
        Fetch Airport Data
        {fetching && <Spinner />}
      </button>

      <button onClick={() => toggleMapTransparency(map)}>Toggle Map</button>
      <button onClick={() => Export()} disabled={exporting}>
        Export
        {exporting && <Spinner />}
      </button>
      <NotificationBubble
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() =>
          setNotification((prev) => ({ ...prev, open: false }))
        }
      />
    </div>

  );
}
