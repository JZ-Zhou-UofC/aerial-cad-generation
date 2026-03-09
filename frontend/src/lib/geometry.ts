import * as turf from "@turf/turf";

export function buildBufferedPolygon(
  geometry: any[],
  width: number
) {
  const line = turf.lineString(
    geometry.map((p) => [p.lon, p.lat])
  );

  const left = turf.lineOffset(line, width / 2, { units: "meters" });
  const right = turf.lineOffset(line, -width / 2, { units: "meters" });

  return [
    ...left.geometry.coordinates,
    ...right.geometry.coordinates.reverse(),
  ].map(([lon, lat]) => ({
    lat,
    lng: lon,
  }));
}