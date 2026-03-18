import { fetchAirportData } from "../api/overpass";
import { aerowayStyles } from "./styles";
import { renderDefault } from "./renderers";

export type FeatureName =
  | "runway"
  | "taxiway"
  | "stopway"
  | "apron"
  | "terminal"
  | "hangar"
  | "parking_position"
  | "aerodrome"
  | "grass";

const DEFAULT_AIRPORT_BOUNDS = {
  south: 53.28409862700042,
  west: -60.48035665924071,
  north: 53.34332482894499,
  east: -60.34465834075927,
} as const;

export type OSMElement = {
  id: number;
  type: string;
  tags: Record<string, string>;
  geometry: { lat: number; lon: number }[];
};

export default class AirportLayer {
  map: google.maps.Map;
  bounds: google.maps.LatLngBounds | null = null;

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
    "terminal",
    "hangar",
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

    this.elements = data.elements;

    this.elements.forEach((el: OSMElement) => this.renderElement(el));
  }

  renderElement(el: OSMElement) {
    if (!el?.geometry) return;

    let feature: string | undefined =
      el.tags?.aeroway || el.tags?.building;

    // inline grass detection (old logic)
    if (
      !feature &&
      (el.tags?.landcover === "grass" ||
        el.tags?.landuse === "grass" ||
        el.tags?.natural === "grassland" ||
        (el.tags?.aeroway && el.tags?.surface === "grass"))
    ) {
      feature = "grass";
    }

    if (!feature) return;

    const style = aerowayStyles[feature as keyof typeof aerowayStyles];
    if (!style) return;

    const overlay = renderDefault(this.map, el, style);
    if (!overlay) return;

    this.addOverlay(feature, overlay);
  }

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
    const isVisible = this.visibleFeatures.has(feature as FeatureName);
    this.setVisible(feature, !isVisible);
  }
}