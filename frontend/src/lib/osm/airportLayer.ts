import { fetchAirportData } from "../api/overpass";
import { FeatureName, OSMElement } from "./types";
import { aerowayStyles } from "./styles";
import { renderWay, renderRelation } from "./renderers";
import {
  attachRelationLinks,
  buildElementMap,
  detectElementFeature,
} from "./prepareElements";

const DEFAULT_AIRPORT_BOUNDS = {
  south: 53.28409862700042,
  west: -60.48035665924071,
  north: 53.34332482894499,
  east: -60.34465834075927,
} as const;

export default class AirportLayer {
  // toggle rendering of unknown features (for debugging)
  RENDER_UNKNOWN = true;

  map: google.maps.Map;

  bounds: google.maps.LatLngBounds | null = null;

  // Each feature has its own layer of overlays for easy toggling
  layers: Record<
    string,
    (google.maps.Polygon | google.maps.Polyline | google.maps.Marker)[]
  > = {};

  elements: OSMElement[] = [];

  visibleFeatures: Set<FeatureName> = new Set([
    "runway",
    "taxiway",
    "stopway",
    "apron",
    "building",
    "parking_position",
    "aerodrome",
    "grass",
  ]);

  constructor(map: google.maps.Map) {
    this.map = map;
    this.bounds = new google.maps.LatLngBounds(
      { lat: DEFAULT_AIRPORT_BOUNDS.south, lng: DEFAULT_AIRPORT_BOUNDS.west },
      { lat: DEFAULT_AIRPORT_BOUNDS.north, lng: DEFAULT_AIRPORT_BOUNDS.east },
    );
  }

  clear() {
    Object.values(this.layers).forEach((overlays) =>
      overlays.forEach((o) => o.setMap(null)),
    );

    this.layers = {};
    this.elements = [];
    this.bounds = null;
  }

  setBounds(bounds: google.maps.LatLngBounds) {
    console.log(bounds);
    this.bounds = bounds;
  }

  addOverlay(
    feature: string,
    overlay: google.maps.Polygon | google.maps.Polyline | google.maps.Marker,
  ) {
    if (!this.layers[feature]) {
      this.layers[feature] = [];
    }

    this.layers[feature].push(overlay);
    const isVisible = this.visibleFeatures.has(feature as FeatureName);
    overlay.setMap(isVisible ? this.map : null);
  }

  async load() {
    const bounds = this.map.getBounds();
    if (!bounds) return;

    this.bounds = bounds;

    const data = await fetchAirportData(bounds);
    if (!data?.elements?.length) return;

    const elementMap = buildElementMap(data.elements);
    attachRelationLinks(data.elements, elementMap);
    this.renderElements(data.elements);
  }

  renderElements(elements: OSMElement[]) {
    // avoid duplicate elements
    const seen = new Set<number>();

    for (const el of elements) {
      if (seen.has(el.id)) continue;
      seen.add(el.id);

      this.renderElement(el);
    }
  }

  renderElement(el: OSMElement) {
    if (!el) return;

    const isRelation = el.type === "relation";

    if (!isRelation && (el._meta?.parents?.length ?? 0) > 0) return;
    if (!isRelation && !el.geometry) return;

    const featureRaw = detectElementFeature(el, aerowayStyles);

    let feature: keyof typeof aerowayStyles;

    if (!featureRaw) {
      // debug: log unknown features to console
      console.warn("Unknown feature type:", {
        id: el.id,
        type: el.type,
        tags: el.tags,
      });

      if (!this.RENDER_UNKNOWN) return;
      feature = "unknown";
    } else {
      feature = featureRaw;
    }

    const style = aerowayStyles[feature];
    if (!style) return;

    const overlays = isRelation
      ? renderRelation(this.map, el, style)
      : renderWay(this.map, el, style);

    if (!overlays.length) return;

    overlays.forEach((o) => this.addOverlay(feature, o));
  }

  // Feature layer toggling functions
  setVisible(feature: string, visible: boolean) {
    if (visible) {
      this.visibleFeatures.add(feature as FeatureName);
    } else {
      this.visibleFeatures.delete(feature as FeatureName);
    }
    const overlays = this.layers[feature];
    if (!overlays) return;
    overlays.forEach((o) => o.setMap(visible ? this.map : null));
  }

  toggleFeature(feature: string) {
    const overlays = this.layers[feature];
    if (!overlays?.length) return;

    const visible = overlays[0].getMap() !== null;
    this.setVisible(feature, !visible);
  }
}
