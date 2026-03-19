import { OSMElement } from "./types";
import { AerowayStyle } from "./styles";
import {
  extractWayPath,
  extractRelationPaths,
  createPolyline,
  createPolygon,
} from "./geometry";

// RENDER FUNCTIONS
export function renderWay(
  map: google.maps.Map,
  element: OSMElement,
  style: AerowayStyle,
): (google.maps.Polygon | google.maps.Polyline)[] {
  const path = extractWayPath(element);
  if (!path) return [];

  if (style.render === "line") {
    return [createPolyline(map, path, style)];
  }

  if (style.render === "polygon") {
    return [createPolygon(map, path, style)];
  }

  return [];
}

export function renderRelation(
  map: google.maps.Map,
  element: OSMElement,
  style: AerowayStyle,
): (google.maps.Polygon | google.maps.Polyline)[] {
  const paths = extractRelationPaths(element);
  if (!paths || !paths.polygons?.length) return [];

  const overlays: (google.maps.Polygon | google.maps.Polyline)[] = [];

  if (style.render === "line") {
    // draw each outer ring as a polyline
    paths.polygons.forEach((poly) => {
      if (!poly.outer || poly.outer.length === 0) {
        console.warn("Relation has no outer ring:", element.id);
        return;
      }
      overlays.push(createPolyline(map, poly.outer, style));
    });
  } else if (style.render === "polygon") {
    // draw each outer with its holes
    paths.polygons.forEach((poly) => {
      if (!poly.outer || poly.outer.length === 0) {
        console.warn("Relation has no outer ring:", element.id);
        return;
      }
      overlays.push(
        createPolygon(map, [poly.outer, ...(poly.inners || [])], style),
      );
    });
  }

  return overlays;
}
