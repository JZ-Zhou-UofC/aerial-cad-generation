import { FeatureName } from "./types";

// Airport Data Visualization Configuration
export type LineStyle = {
  render: "line";
  strokeColor: string;
  strokeWeight: number;
  strokeOpacity: number;
};

export type PolygonStyle = {
  render: "polygon";
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
};

export type AerowayStyle = LineStyle | PolygonStyle;

const baseThickness = 2;

export const aerowayStyles = {
  // roads / areas
  runway: {
    render: "line",
    strokeColor: "#FFFF00", // AutoCAD "Yellow" (Runway Taxipath)
    strokeWeight: 2 * baseThickness,
    strokeOpacity: 1,
  },

  taxiway: {
    render: "line",
    strokeColor: "#FFFF00", // AutoCAD "Yellow" (Taxipath)
    strokeWeight: 2 * baseThickness,
    strokeOpacity: 1,
  },

  stopway: {
    render: "line",
    strokeColor: "#ff7043", // orange-ish
    strokeWeight: baseThickness,
    strokeOpacity: 1,
  },

  apron: {
    render: "polygon",
    fillColor: "#FF00FF", // AutoCAD "Magenta" (Apron-Limits)
    fillOpacity: 0.0, // transparent fill
    strokeColor: "#FF00FF",
    strokeWeight: baseThickness,
  },

  // buildings
  building: {
    render: "polygon",
    fillColor: "#0000FF", // blue buildings, example output doesn't have buildings
    fillOpacity: 0.1,
    strokeColor: "#0000FF",
    strokeWeight: baseThickness,
  },

  // operations (parking)
  parking_position: {
    render: "line",
    strokeColor: "#ffffff",
    strokeWeight: baseThickness,
    strokeOpacity: 1,
  },

  // Groundcover
  grass: {
    render: "polygon",
    fillColor: "#81c784", // soft green
    fillOpacity: 0.2, // transparent fill
    strokeColor: "#4caf50",
    strokeWeight: baseThickness,
  },

  // Airport boundary
  aerodrome: {
    render: "polygon",
    fillColor: "#ffffff", // transparent/white
    fillOpacity: 0.0,
    strokeColor: "#000000", // black outline
    strokeWeight: baseThickness,
  },

  // Fallback style for unknown features
  unknown: {
    render: "polygon",
    fillColor: "#ff0077", // red for unknown features
    fillOpacity: 0.2,
    strokeColor: "#ff0077",
    strokeWeight: baseThickness,
  },
} satisfies Record<FeatureName | "unknown", AerowayStyle>;
