import { OSMElement, FeatureName } from "./types";

export function detectElementFeature(
  el: OSMElement,
  styles: Record<string, unknown>,
): FeatureName | "unknown" | undefined {
  if (el.tags?.building) {
    return "building";
  }

  if (el.tags?.aeroway && el.tags.aeroway in styles) {
    return el.tags.aeroway as FeatureName;
  }

  if (
    el.tags?.landcover === "grass" ||
    el.tags?.landuse === "grass" ||
    el.tags?.natural === "grassland" ||
    (el.tags?.aeroway && el.tags?.surface === "grass")
  ) {
    return "grass";
  }

  return undefined;
}

export function buildElementMap(elements: OSMElement[]) {
  const map = new Map<number, OSMElement>();
  for (const el of elements) {
    map.set(el.id, el);
  }
  return map;
}

export function attachRelationLinks(
  elements: OSMElement[],
  elementMap: Map<number, OSMElement>,
) {
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
