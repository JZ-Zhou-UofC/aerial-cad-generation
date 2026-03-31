import { fetchAirportData, getAerodromeBBox } from "../api/overpass";
import { FeatureName, OSMElement } from "./types";
import { renderElements } from "./renderers";
import { attachRelationLinks, buildElementMap } from "./prepareElements";

export default class AirportLayer {
  map: google.maps.Map;
  bounds: google.maps.LatLngBounds | null = null;
  icao: string = "";
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
    this.addOverlay = this.addOverlay.bind(this);
  }

  clear() {
    Object.values(this.layers).forEach((overlays) =>
      overlays.forEach((o) => o.setMap(null)),
    );

    this.layers = {};
    this.elements = [];
    this.bounds = null;
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

  async load(search: string) {
    const icao = await this.resolveIcao(search);
    this.icao = icao;

    const bounds = await this.getBounds(icao);
    this.bounds = bounds;

    const elements = await this.getAirportData(bounds);
    this.elements = elements;

    const elementMap = buildElementMap(elements);
    attachRelationLinks(elements, elementMap);

    renderElements(elements, {
      map: this.map,
      addOverlay: this.addOverlay,
    });
  }

  private async resolveIcao(search: string): Promise<string> {
    const res = await fetch("/api/resolve-icao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: search }),
    });

    if (!res.ok) {
      throw new Error("Network / server error resolving ICAO");
    }

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Failed to resolve ICAO");
    }

    if (!json.icao) {
      throw new Error(json.error || "No ICAO found");
    }

    return json.icao;
  }

  private async getBounds(icao: string) {
    try {
      const result = await getAerodromeBBox(icao);

      if (!result) {
        throw new Error("No bounds returned");
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to fetch airport bounds: ${message}`);
    }
  }

  private async getAirportData(bounds: google.maps.LatLngBounds) {
    try {
      const data = await fetchAirportData(bounds);

      if (
        !data ||
        !Array.isArray(data.elements) ||
        data.elements.length === 0
      ) {
        throw new Error("No elements found");
      }

      return data.elements;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to fetch airport data: ${message}`);
    }
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
