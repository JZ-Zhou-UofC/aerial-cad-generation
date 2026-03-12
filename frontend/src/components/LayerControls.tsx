"use client";

import AirportLayer, { FeatureName } from "@/lib/osm/airportLayer";
import { useState } from "react";

type Props = {
  airportLayer: AirportLayer;
};

const initialLayersToggleState: Record<FeatureName, boolean> = {
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

// purely for UI layout
const featureGroups: { title: string; features: FeatureName[] }[] = [
  { title: "Movement", features: ["runway", "taxiway", "stopway", "apron"] },
  { title: "Infrastructure", features: ["terminal", "hangar"] },
  { title: "Operations", features: ["parking_position"] },
  { title: "Groundcover", features: ["grass"] },
  { title: "Boundary", features: ["aerodrome"] },
];

export default function LayerControls({ airportLayer }: Props) {
  const [layersState, setLayersState] = useState(initialLayersToggleState);

  const toggleFeature = (feature: FeatureName, visible: boolean) => {
    setState((prev) => ({
      ...prev,
      [feature]: visible,
    }));

    airportLayer.toggleFeature(feature);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 10,
        background: "white",
        padding: 12,
        zIndex: 10,
        width: 180,
      }}
    >
      {featureGroups.map((group) => (
        <div key={group.title} style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
            {group.title}
          </div>

          {group.features.map((feature) => (
            <label key={feature} style={{ display: "block", paddingLeft: 8 }}>
              <input
                type="checkbox"
                checked={state[feature]}
                onChange={(e) => toggleFeature(feature, e.target.checked)}
              />{" "}
              {feature.replace("_", " ")}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}
