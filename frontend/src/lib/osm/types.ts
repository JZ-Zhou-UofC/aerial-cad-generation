export type OSMPoint = {
  lat: number;
  lon: number;
};

export type OSMElement = {
  id: number;
  type: "node" | "way" | "relation";
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];

  members?: {
    geometry?: { lat: number; lon: number }[]; // for ways that are members of relations, we include their geometry directly for easier rendering
    ref: number;
    role?: string;
    type: string;
  }[];

  _meta?: {
    parents: number[];
    role?: string;
  };
};
export type FeatureName =
  | "runway"
  | "taxiway"
  | "stopway"
  | "apron"
  | "building"
  | "parking_position"
  | "aerodrome"
  | "grass";
