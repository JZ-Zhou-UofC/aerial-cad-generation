import { fetchAirportData, getAerodromeBBox } from "../api/overpass";
import { FeatureName, OSMElement } from "./types";
import { renderElements } from "./renderers";
import { attachRelationLinks, buildElementMap } from "./prepareElements";

const DEFAULT_AIRPORT_BOUNDS = {
  south: 53.28409862700042,
  west: -60.48035665924071,
  north: 53.34332482894499,
  east: -60.34465834075927,
} as const;

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

  async load(airportCode:string) {

    const bounds= await getAerodromeBBox(airportCode)
    if (!bounds) return;

    this.bounds = bounds;

    const data = await fetchAirportData(bounds);
    if (!data?.elements?.length) return;
    // save elements
    this.elements = data.elements;

    // augmenting child elements with _meta (added parent relation ids and member role)
    const elementMap = buildElementMap(data.elements);
    attachRelationLinks(data.elements, elementMap);



    // this.renderElements(data.elements);
    renderElements(this.elements, {
      map: this.map,
      addOverlay: this.addOverlay.bind(this),
    });
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
    const isVisible = this.visibleFeatures.has(feature as FeatureName);
    this.setVisible(feature, !isVisible);
  }
}
