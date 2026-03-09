import * as turf from "@turf/turf";

type OsmPoint = {
  lat: number;
  lon: number;
};

export function buildBufferedPolygon(
  geometry: OsmPoint[],
  width: number
) {
  if (!geometry || geometry.length < 2) {
    return [];
  }

  const runwayWidth = Number(width) || 30; // fallback width

  const line = turf.lineString(
    geometry.map((p) => [p.lon, p.lat])
  );

  const left = turf.lineOffset(line, runwayWidth / 2, { units: "meters" });
  const right = turf.lineOffset(line, -runwayWidth / 2, { units: "meters" });

  const coords = [
    ...left.geometry.coordinates,
    ...right.geometry.coordinates.reverse(),
    left.geometry.coordinates[0], // close polygon
  ];

  return coords.map(([lon, lat]) => ({
    lat,
    lng: lon,
  }));
}