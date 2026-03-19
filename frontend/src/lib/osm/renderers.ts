import { OSMElement } from "./types";
import { AerowayStyle, aerowayStyles } from "./styles";
import { detectElementFeature } from "./prepareElements";
import {
  extractWayPath,
  extractRelationPaths,
  createPolyline,
  createPolygon,
} from "./geometry";

// toggle rendering of unknown features (for debugging)
const RENDER_UNKNOWN = true;

export function renderElements(
  elements: OSMElement[],
  ctx: {
    map: google.maps.Map;
    addOverlay: (
      feature: string,
      overlay: google.maps.Polygon | google.maps.Polyline | google.maps.Marker,
    ) => void;
  },
) {
  const seen = new Set<number>();

  for (const el of elements) {
    if (seen.has(el.id)) continue;
    seen.add(el.id);

    renderElement(el, ctx);
  }
}

export function renderElement(
  el: OSMElement,
  ctx: {
    map: google.maps.Map;
    addOverlay: (
      feature: string,
      overlay: google.maps.Polygon | google.maps.Polyline | google.maps.Marker,
    ) => void;
  },
) {
  if (!el) return;

  const isRelation = el.type === "relation";

  if (!isRelation && (el._meta?.parents?.length ?? 0) > 0) return;
  if (!isRelation && !el.geometry) return;

  const featureRaw = detectElementFeature(el, aerowayStyles);

  let feature: keyof typeof aerowayStyles;

  if (!featureRaw) {
    console.warn("Unknown feature type:", {
      id: el.id,
      type: el.type,
      tags: el.tags,
    });

    if (!RENDER_UNKNOWN) return;
    feature = "unknown";
  } else {
    feature = featureRaw;
  }

  const style = aerowayStyles[feature];
  if (!style) return;

  const overlays = isRelation
    ? renderRelation(ctx.map, el, style)
    : renderWay(ctx.map, el, style);

  if (!overlays.length) return;

  overlays.forEach((o) => ctx.addOverlay(feature, o));
}

// RENDER HELPERS
function renderWay(
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

// relations can contain multiple polygons
function renderRelation(
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
