import { fetchAirportData } from "./apiOverpass";
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

export default class AirportLayer {
  map: google.maps.Map;

  // Each feature has its own overlay array
  layers: Record<
    string,
    (google.maps.Polygon | google.maps.Polyline | google.maps.Marker)[]
  > = {};

  constructor(map: google.maps.Map) {
    this.map = map;
  }

  clear() {
    Object.values(this.layers).forEach((overlays) =>
      overlays.forEach((o) => o.setMap(null)),
    );

    this.layers = {};
  }

  addOverlay(
    feature: string,
    overlay: google.maps.Polygon | google.maps.Polyline | google.maps.Marker,
  ) {
    if (!this.layers[feature]) {
      this.layers[feature] = [];
    }

    this.layers[feature].push(overlay);
  }

  // Load and Render airport data within current map bounds
  async load() {
    const bounds = this.map.getBounds();
    if (!bounds) return;

    const data = await fetchAirportData(bounds);
    if (!data?.elements?.length) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.elements.forEach((el: any) => this.renderElement(el));
  }

  // Render OSM element based on its tags and geometry type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderElement(el: any) {
    if (!el?.geometry) return;

    // detect feature type
    let feature: string | undefined = el.tags?.aeroway || el.tags?.building;

    // detect if it's grass
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

    const renderStyle = style;

    const overlay = renderDefault(this.map, el, renderStyle);
    if (!overlay) return;

    this.addOverlay(feature, overlay);
  }

  setVisible(feature: string, visible: boolean) {
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
