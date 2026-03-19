import { OSMElement } from "./types";
import { LineStyle, PolygonStyle } from "./styles";

export function extractWayPath(
  element: OSMElement,
): google.maps.LatLngLiteral[] | null {
  if (!element.geometry) return null;
  return element.geometry.map(toLatLng);
}

export function extractRelationPaths(element: OSMElement): {
  polygons: {
    outer: google.maps.LatLngLiteral[];
    inners: google.maps.LatLngLiteral[][];
  }[];
} | null {
  if (!element.members) return null;

  const outerWays: google.maps.LatLngLiteral[][] = [];
  const innerWays: google.maps.LatLngLiteral[][] = [];

  for (const member of element.members) {
    if (member.type !== "way" || !member.geometry) continue;

    const path = member.geometry.map(toLatLng);

    if (member.role === "outer") outerWays.push(path);
    else if (member.role === "inner") innerWays.push(path);
  }

  const stitchedOuter = stitchWays(outerWays);
  const stitchedInner = stitchWays(innerWays);

  const polygons = stitchedOuter.map((outer) => ({
    outer,
    inners: [] as google.maps.LatLngLiteral[][],
  }));

  // assign each inner to correct outer
  stitchedInner.forEach((inner) => {
    const testPoint = inner[0];

    for (const poly of polygons) {
      if (pointInPolygon(testPoint, poly.outer)) {
        poly.inners.push(inner);
        return;
      }
    }

    // Debug: inner didn't match any outer
    console.warn("Unmatched inner ring:", {
      relationId: element.id,
      innerPoints: inner.length,
    });
  });

  return { polygons };
}

export function createPolyline(
  map: google.maps.Map,
  path: google.maps.LatLngLiteral[],
  style: LineStyle,
) {
  return new google.maps.Polyline({
    path,
    strokeColor: style.strokeColor,
    strokeOpacity: style.strokeOpacity,
    strokeWeight: style.strokeWeight,
    map,
  });
}

export function createPolygon(
  map: google.maps.Map,
  paths: google.maps.LatLngLiteral[] | google.maps.LatLngLiteral[][],
  style: PolygonStyle,
) {
  return new google.maps.Polygon({
    paths,
    fillColor: style.fillColor,
    fillOpacity: style.fillOpacity,
    strokeColor: style.strokeColor,
    strokeWeight: style.strokeWeight,
    map,
  });
}

// Helper functions
type OSMPoint = {
  lat: number;
  lon: number;
};

function toLatLng(p: OSMPoint): google.maps.LatLngLiteral {
  return { lat: p.lat, lng: p.lon };
}

function pointInPolygon(
  point: google.maps.LatLngLiteral,
  polygon: google.maps.LatLngLiteral[],
): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng,
      yi = polygon[i].lat;
    const xj = polygon[j].lng,
      yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + 1e-12) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function stitchWays(
  ways: google.maps.LatLngLiteral[][],
): google.maps.LatLngLiteral[][] {
  const rings: google.maps.LatLngLiteral[][] = [];
  const used = new Set<number>();

  const isSame = (a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral) =>
    a.lat === b.lat && a.lng === b.lng;

  for (let i = 0; i < ways.length; i++) {
    if (used.has(i)) continue;

    let ring = [...ways[i]];
    used.add(i);

    let extended = true;

    while (extended) {
      extended = false;

      for (let j = 0; j < ways.length; j++) {
        if (used.has(j)) continue;

        const candidate = ways[j];

        const start = ring[0];
        const end = ring[ring.length - 1];

        const cStart = candidate[0];
        const cEnd = candidate[candidate.length - 1];

        // end → start
        if (isSame(end, cStart)) {
          ring = [...ring, ...candidate.slice(1)];
          used.add(j);
          extended = true;
        }
        // end → end (reverse)
        else if (isSame(end, cEnd)) {
          ring = [...ring, ...candidate.slice(0, -1).reverse()];
          used.add(j);
          extended = true;
        }
        // start → end
        else if (isSame(start, cEnd)) {
          ring = [...candidate.slice(0, -1), ...ring];
          used.add(j);
          extended = true;
        }
        // start → start (reverse)
        else if (isSame(start, cStart)) {
          ring = [...candidate.slice(1).reverse(), ...ring];
          used.add(j);
          extended = true;
        }
      }
    }

    // ensure closed ring
    if (!isSame(ring[0], ring[ring.length - 1])) {
      ring.push(ring[0]);
    }

    rings.push(ring);
  }

  return rings;
}
