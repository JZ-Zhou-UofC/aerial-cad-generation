import { fetchAirportData } from "./overpass";
import { aerowayStyles } from "./styles";
import { renderWay, renderRelation } from "./renderers";

export type FeatureName =
  | "runway"
  | "taxiway"
  | "stopway"
  | "apron"
  | "building"
  | "parking_position"
  | "aerodrome"
  | "grass";

export default class AirportLayer {
  // toggle rendering of unknown features (for debugging)
  RENDER_UNKNOWN = true;

  map: google.maps.Map;

  // Each feature has its own layer of overlays for easy toggling
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

    const elementMap = this.buildElementMap(data.elements);
    this.attachRelationLinks(data.elements, elementMap);
    this.renderElements(data.elements);
  }

  buildElementMap(elements: any[]) {
    const map = new Map<number, any>();
    for (const el of elements) {
      map.set(el.id, el);
    }
    return map;
  }

  attachRelationLinks(elements: any[], elementMap: Map<number, any>) {
    for (const el of elements) {
      if (el.type !== "relation" || !el.members) continue;

      for (const member of el.members) {
        const child = elementMap.get(member.ref);
        if (!child) {
          console.warn("Missing child for member:", member);
          continue;
        }
        // separate runtime metadata
        child._meta ??= {
          parents: [],
          role: undefined,
        };

        child._meta.parents.push(el.id);

        if (member.role) {
          child._meta.role = member.role;
        }
      }
    }
  }

  renderElements(elements: any[]) {
    // avoid duplicate elements
    const seen = new Set<number>();

    for (const el of elements) {
      if (seen.has(el.id)) continue;
      seen.add(el.id);

      this.renderElement(el);
    }
  }

  renderElement(el: any) {
    if (!el) return;

    const isRelation = el.type === "relation";

    // Skip relation members (will be handled by relation rendering)
    if (!isRelation && el._meta?.parents?.length > 0) return;
    // if it's not a relation and has no geometry, skip
    if (!isRelation && !el.geometry) return;

    // detect feature type
    let feature: string | undefined;

    // detect if building/grass
    if (el.tags?.building) {
      feature = "building";
    } else if (el.tags?.aeroway) {
      feature = el.tags.aeroway;
    } else if (
      el.tags?.landcover === "grass" ||
      el.tags?.landuse === "grass" ||
      el.tags?.natural === "grassland" ||
      (el.tags?.aeroway && el.tags?.surface === "grass")
    ) {
      feature = "grass";
    }

    // fallback for unknown features
    if (!feature || !aerowayStyles[feature as keyof typeof aerowayStyles]) {
      console.warn("Unknown feature type:", {
        id: el.id,
        type: el.type,
        tags: el.tags,
      });
      if (!this.RENDER_UNKNOWN) return;
      feature = "unknown";
    }

    // get style for feature
    const style = aerowayStyles[feature as keyof typeof aerowayStyles];
    if (!style) return;

    let overlays: (google.maps.Polygon | google.maps.Polyline)[] = [];

    // render
    if (isRelation) {
      overlays = renderRelation(this.map, el, style);
    } else {
      overlays = renderWay(this.map, el, style);
    }

    if (!overlays?.length) return;

    // Add each overlay individually
    overlays.forEach((o) => this.addOverlay(feature, o));
  }

  // Feature layer toggling functions
  toggleFeature(feature: string) {
    const overlays = this.layers[feature];
    if (!overlays?.length) return;

    const visible = overlays[0].getMap() !== null;
    this.setVisible(feature, !visible);
  }

  setVisible(feature: string, visible: boolean) {
    const overlays = this.layers[feature];
    if (!overlays) return;

    overlays.forEach((o) => o.setMap(visible ? this.map : null));
  }
}
