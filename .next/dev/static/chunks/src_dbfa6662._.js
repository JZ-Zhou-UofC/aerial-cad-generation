(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/map.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initMap",
    ()=>initMap,
    "toggleMapTransparency",
    ()=>toggleMapTransparency
]);
async function initMap(container) {
    const { Map } = await google.maps.importLibrary("maps");
    return new Map(container, {
        center: {
            lat: 49.1951,
            lng: -123.1779
        },
        zoom: 14,
        minZoom: 12,
        maxZoom: 18,
        mapTypeId: "satellite",
        disableDefaultUI: true,
        gestureHandling: "greedy"
    });
}
function toggleMapTransparency(map) {
    const current = map.getMapTypeId();
    if (current === "satellite") {
        map.setMapTypeId("roadmap");
    } else {
        map.setMapTypeId("satellite");
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api/overpass.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchAirportData",
    ()=>fetchAirportData,
    "getAerodromeBBox",
    ()=>getAerodromeBBox
]);
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
async function fetchAirportData(bounds) {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const north = ne.lat();
    const east = ne.lng();
    const south = sw.lat();
    const west = sw.lng();
    // hard coded query for all airport features
    const query = `
[out:json][timeout:25];
(
  // Movement surfaces
  way["aeroway"="runway"](${south},${west},${north},${east});
  relation["aeroway"="runway"](${south},${west},${north},${east});

  way["aeroway"="taxiway"](${south},${west},${north},${east});
  relation["aeroway"="taxiway"](${south},${west},${north},${east});

  way["aeroway"="stopway"](${south},${west},${north},${east});
  relation["aeroway"="stopway"](${south},${west},${north},${east});

  way["aeroway"="apron"](${south},${west},${north},${east});
  relation["aeroway"="apron"](${south},${west},${north},${east});

  // Buildings / infrastructure (all)
  way["building"](${south},${west},${north},${east});
  relation["building"](${south},${west},${north},${east});

  // Operations (parking)
  way["aeroway"="parking_position"](${south},${west},${north},${east});
  relation["aeroway"="parking_position"](${south},${west},${north},${east});

  // Ground cover (grass)
  way["landcover"="grass"](${south},${west},${north},${east});
  relation["landcover"="grass"](${south},${west},${north},${east});

  way["landuse"="grass"](${south},${west},${north},${east});
  relation["landuse"="grass"](${south},${west},${north},${east});

  way["natural"="grassland"](${south},${west},${north},${east});
  relation["natural"="grassland"](${south},${west},${north},${east});

  way["aeroway"]["surface"="grass"](${south},${west},${north},${east});
  relation["aeroway"]["surface"="grass"](${south},${west},${north},${east});

  // Airport boundary
  way["aeroway"="aerodrome"](${south},${west},${north},${east});
  relation["aeroway"="aerodrome"](${south},${west},${north},${east});
);

// for all current result sets, fetch all child nodes/ways insided them
(._; >;);

out geom;
`;
    console.log(query);
    const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            data: query
        })
    });
    if (!res.ok) {
        throw new Error(`Overpass HTTP ${res.status}`);
    }
    return res.json();
}
async function getAerodromeBBox(icao) {
    const query = `
    [out:json][timeout:25];
    (
      node["aeroway"="aerodrome"]["icao"="${icao.toUpperCase()}"];
      way["aeroway"="aerodrome"]["icao"="${icao.toUpperCase()}"];
      relation["aeroway"="aerodrome"]["icao"="${icao.toUpperCase()}"];
    );
    (._; >;);
    out body;
  `;
    const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            data: query
        })
    });
    if (!res.ok) {
        throw new Error(`Overpass HTTP ${res.status}`);
    }
    const payload = await res.json();
    const bounds = extractBoundsFromOverpass(payload);
    return bounds;
}
function extractBoundsFromOverpass(payload) {
    const elements = payload?.elements || [];
    if (!elements.length) {
        throw new Error("No elements returned");
    }
    const lats = [];
    const lons = [];
    for (const e of elements){
        if (typeof e.lat === "number" && typeof e.lon === "number") {
            lats.push(e.lat);
            lons.push(e.lon);
        }
    }
    if (!lats.length || !lons.length) {
        throw new Error("No lat/lon nodes found");
    }
    const south = Math.min(...lats);
    const west = Math.min(...lons);
    const north = Math.max(...lats);
    const east = Math.max(...lons);
    return new google.maps.LatLngBounds({
        lat: south,
        lng: west
    }, {
        lat: north,
        lng: east
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/osm/styles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Thickness",
    ()=>Thickness,
    "aerowayStyles",
    ()=>aerowayStyles
]);
const BASE_THICKNESS = 2;
const Thickness = {
    Thin: 1,
    Base: 2,
    Thick: 4
};
const aerowayStyles = {
    // roads / areas
    runway: {
        render: "line",
        strokeColor: "#FFFF00",
        strokeWeight: 2 * BASE_THICKNESS,
        strokeOpacity: 1
    },
    taxiway: {
        render: "line",
        strokeColor: "#FFFF00",
        strokeWeight: 2 * BASE_THICKNESS,
        strokeOpacity: 1
    },
    stopway: {
        render: "line",
        strokeColor: "#ff7043",
        strokeWeight: BASE_THICKNESS,
        strokeOpacity: 1
    },
    apron: {
        render: "polygon",
        fillColor: "#FF00FF",
        fillOpacity: 0.0,
        strokeColor: "#FF00FF",
        strokeWeight: BASE_THICKNESS
    },
    // buildings
    building: {
        render: "polygon",
        fillColor: "#0000FF",
        fillOpacity: 0.1,
        strokeColor: "#0000FF",
        strokeWeight: BASE_THICKNESS
    },
    // operations (parking)
    parking_position: {
        render: "line",
        strokeColor: "#ffffff",
        strokeWeight: BASE_THICKNESS,
        strokeOpacity: 1
    },
    // Groundcover
    grass: {
        render: "polygon",
        fillColor: "#81c784",
        fillOpacity: 0.2,
        strokeColor: "#4caf50",
        strokeWeight: BASE_THICKNESS
    },
    // Airport boundary
    aerodrome: {
        render: "polygon",
        fillColor: "#ffffff",
        fillOpacity: 0.0,
        strokeColor: "#000000",
        strokeWeight: BASE_THICKNESS
    },
    // Fallback style for unknown features
    unknown: {
        render: "polygon",
        fillColor: "#ff0077",
        fillOpacity: 0.2,
        strokeColor: "#ff0077",
        strokeWeight: BASE_THICKNESS
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/osm/prepareElements.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "attachRelationLinks",
    ()=>attachRelationLinks,
    "buildElementMap",
    ()=>buildElementMap,
    "detectElementFeature",
    ()=>detectElementFeature
]);
function detectElementFeature(el, styles) {
    if (el.tags?.building) {
        return "building";
    }
    if (el.tags?.aeroway && el.tags.aeroway in styles) {
        return el.tags.aeroway;
    }
    if (el.tags?.landcover === "grass" || el.tags?.landuse === "grass" || el.tags?.natural === "grassland" || el.tags?.aeroway && el.tags?.surface === "grass") {
        return "grass";
    }
    return undefined;
}
function buildElementMap(elements) {
    const map = new Map();
    for (const el of elements){
        map.set(el.id, el);
    }
    return map;
}
function attachRelationLinks(elements, elementMap) {
    for (const el of elements){
        if (el.type !== "relation" || !el.members) continue;
        for (const member of el.members){
            const child = elementMap.get(member.ref);
            if (!child) {
                console.warn("Missing child for member:", member);
                continue;
            }
            // separate runtime metadata
            child._meta ??= {
                parents: [],
                role: undefined
            };
            child._meta.parents.push(el.id);
            if (member.role) {
                child._meta.role = member.role;
            }
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/osm/geometry.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createPolygon",
    ()=>createPolygon,
    "createPolyline",
    ()=>createPolyline,
    "extractRelationPaths",
    ()=>extractRelationPaths,
    "extractWayPath",
    ()=>extractWayPath
]);
function extractWayPath(element) {
    if (!element.geometry) return null;
    return element.geometry.map(toLatLng);
}
function extractRelationPaths(element) {
    if (!element.members) return null;
    const outerWays = [];
    const innerWays = [];
    for (const member of element.members){
        if (member.type !== "way" || !member.geometry) continue;
        const path = member.geometry.map(toLatLng);
        if (member.role === "outer") outerWays.push(path);
        else if (member.role === "inner") innerWays.push(path);
    }
    const stitchedOuter = stitchWays(outerWays);
    const stitchedInner = stitchWays(innerWays);
    const polygons = stitchedOuter.map((outer)=>({
            outer,
            inners: []
        }));
    // assign each inner to correct outer
    stitchedInner.forEach((inner)=>{
        const testPoint = inner[0];
        for (const poly of polygons){
            if (pointInPolygon(testPoint, poly.outer)) {
                poly.inners.push(inner);
                return;
            }
        }
        // Debug: inner didn't match any outer
        console.warn("Unmatched inner ring:", {
            relationId: element.id,
            innerPoints: inner.length
        });
    });
    return {
        polygons
    };
}
function createPolyline(map, path, style) {
    return new google.maps.Polyline({
        path,
        strokeColor: style.strokeColor,
        strokeOpacity: style.strokeOpacity,
        strokeWeight: style.strokeWeight,
        map
    });
}
function createPolygon(map, paths, style) {
    return new google.maps.Polygon({
        paths,
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity,
        strokeColor: style.strokeColor,
        strokeWeight: style.strokeWeight,
        map
    });
}
// Helper functions
function toLatLng(p) {
    return {
        lat: p.lat,
        lng: p.lon
    };
}
function pointInPolygon(point, polygon) {
    let inside = false;
    for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
        const xi = polygon[i].lng, yi = polygon[i].lat;
        const xj = polygon[j].lng, yj = polygon[j].lat;
        const intersect = yi > point.lat !== yj > point.lat && point.lng < (xj - xi) * (point.lat - yi) / (yj - yi + 1e-12) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}
function stitchWays(ways) {
    const rings = [];
    const used = new Set();
    const isSame = (a, b)=>a.lat === b.lat && a.lng === b.lng;
    for(let i = 0; i < ways.length; i++){
        if (used.has(i)) continue;
        let ring = [
            ...ways[i]
        ];
        used.add(i);
        let extended = true;
        while(extended){
            extended = false;
            for(let j = 0; j < ways.length; j++){
                if (used.has(j)) continue;
                const candidate = ways[j];
                const start = ring[0];
                const end = ring[ring.length - 1];
                const cStart = candidate[0];
                const cEnd = candidate[candidate.length - 1];
                // end → start
                if (isSame(end, cStart)) {
                    ring = [
                        ...ring,
                        ...candidate.slice(1)
                    ];
                    used.add(j);
                    extended = true;
                } else if (isSame(end, cEnd)) {
                    ring = [
                        ...ring,
                        ...candidate.slice(0, -1).reverse()
                    ];
                    used.add(j);
                    extended = true;
                } else if (isSame(start, cEnd)) {
                    ring = [
                        ...candidate.slice(0, -1),
                        ...ring
                    ];
                    used.add(j);
                    extended = true;
                } else if (isSame(start, cStart)) {
                    ring = [
                        ...candidate.slice(1).reverse(),
                        ...ring
                    ];
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/osm/renderers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "renderElement",
    ()=>renderElement,
    "renderElements",
    ()=>renderElements
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$styles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/osm/styles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$prepareElements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/osm/prepareElements.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$geometry$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/osm/geometry.ts [app-client] (ecmascript)");
;
;
;
// toggle rendering of unknown features (for debugging)
const RENDER_UNKNOWN = true;
function renderElements(elements, ctx) {
    const seen = new Set();
    for (const el of elements){
        if (seen.has(el.id)) continue;
        seen.add(el.id);
        renderElement(el, ctx);
    }
}
function renderElement(el, ctx) {
    if (!el) return;
    const isRelation = el.type === "relation";
    if (!isRelation && (el._meta?.parents?.length ?? 0) > 0) return;
    if (!isRelation && !el.geometry) return;
    const featureRaw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$prepareElements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectElementFeature"])(el, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$styles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["aerowayStyles"]);
    let feature;
    if (!featureRaw) {
        console.warn("Unknown feature type:", {
            id: el.id,
            type: el.type,
            tags: el.tags
        });
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        feature = "unknown";
    } else {
        feature = featureRaw;
    }
    const style = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$styles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["aerowayStyles"][feature];
    if (!style) return;
    const overlays = isRelation ? renderRelation(ctx.map, el, style) : renderWay(ctx.map, el, style);
    if (!overlays.length) return;
    overlays.forEach((o)=>ctx.addOverlay(feature, o));
}
// RENDER HELPERS
function renderWay(map, element, style) {
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$geometry$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractWayPath"])(element);
    if (!path) return [];
    if (style.render === "line") {
        return [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$geometry$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPolyline"])(map, path, style)
        ];
    }
    if (style.render === "polygon") {
        return [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$geometry$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPolygon"])(map, path, style)
        ];
    }
    return [];
}
// relations can contain multiple polygons
function renderRelation(map, element, style) {
    const paths = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$geometry$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extractRelationPaths"])(element);
    if (!paths || !paths.polygons?.length) return [];
    const overlays = [];
    if (style.render === "line") {
        // draw each outer ring as a polyline
        paths.polygons.forEach((poly)=>{
            if (!poly.outer || poly.outer.length === 0) {
                console.warn("Relation has no outer ring:", element.id);
                return;
            }
            overlays.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$geometry$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPolyline"])(map, poly.outer, style));
        });
    } else if (style.render === "polygon") {
        // draw each outer with its holes
        paths.polygons.forEach((poly)=>{
            if (!poly.outer || poly.outer.length === 0) {
                console.warn("Relation has no outer ring:", element.id);
                return;
            }
            overlays.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$geometry$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPolygon"])(map, [
                poly.outer,
                ...poly.inners || []
            ], style));
        });
    }
    return overlays;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/osm/airportLayer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AirportLayer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$overpass$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api/overpass.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$renderers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/osm/renderers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$prepareElements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/osm/prepareElements.ts [app-client] (ecmascript)");
;
;
;
class AirportLayer {
    map;
    bounds = null;
    icao = "";
    layers = {};
    elements = [];
    visibleFeatures = new Set([
        "runway",
        "taxiway",
        "stopway",
        "apron",
        "building",
        "parking_position",
        "aerodrome",
        "grass"
    ]);
    constructor(map){
        this.map = map;
        this.addOverlay = this.addOverlay.bind(this);
    }
    clear() {
        Object.values(this.layers).forEach((overlays)=>overlays.forEach((o)=>o.setMap(null)));
        this.layers = {};
        this.elements = [];
        this.bounds = null;
    }
    addOverlay(feature, overlay) {
        if (!this.layers[feature]) {
            this.layers[feature] = [];
        }
        this.layers[feature].push(overlay);
        const isVisible = this.visibleFeatures.has(feature);
        overlay.setMap(isVisible ? this.map : null);
    }
    async load(search) {
        const icao = await this.resolveIcao(search);
        this.icao = icao;
        const bounds = await this.getBounds(icao);
        this.bounds = bounds;
        const elements = await this.getAirportData(bounds);
        this.elements = elements;
        const elementMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$prepareElements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildElementMap"])(elements);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$prepareElements$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["attachRelationLinks"])(elements, elementMap);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$renderers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["renderElements"])(elements, {
            map: this.map,
            addOverlay: this.addOverlay
        });
    }
    async resolveIcao(search) {
        const res = await fetch("/api/resolve-icao", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                input: search
            })
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
    async getBounds(icao) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$overpass$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAerodromeBBox"])(icao);
            if (!result) {
                throw new Error("No bounds returned");
            }
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`Failed to fetch airport bounds: ${message}`);
        }
    }
    async getAirportData(bounds) {
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2f$overpass$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAirportData"])(bounds);
            if (!data || !Array.isArray(data.elements) || data.elements.length === 0) {
                throw new Error("No elements found");
            }
            return data.elements;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`Failed to fetch airport data: ${message}`);
        }
    }
    // Feature layer toggling functions
    setVisible(feature, visible) {
        if (visible) {
            this.visibleFeatures.add(feature);
        } else {
            this.visibleFeatures.delete(feature);
        }
        const overlays = this.layers[feature];
        if (!overlays) return;
        overlays.forEach((o)=>o.setMap(visible ? this.map : null));
    }
    toggleFeature(feature) {
        const isVisible = this.visibleFeatures.has(feature);
        this.setVisible(feature, !isVisible);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/NotificationBubble.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Snackbar$2f$Snackbar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Snackbar$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Snackbar/Snackbar.js [app-client] (ecmascript) <export default as Snackbar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Alert$2f$Alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Alert$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/Alert/Alert.js [app-client] (ecmascript) <export default as Alert>");
"use client";
;
;
;
const NotificationBubble = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(11);
    if ($[0] !== "b4adcec664fa6697128a676a30f48db05382f388f055af5c482a54c78aa599d2") {
        for(let $i = 0; $i < 11; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "b4adcec664fa6697128a676a30f48db05382f388f055af5c482a54c78aa599d2";
    }
    const { open, message, severity, onClose } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            vertical: "bottom",
            horizontal: "center"
        };
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {
            padding: "20px",
            fontSize: "1.5rem"
        };
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    let t3;
    if ($[3] !== message || $[4] !== onClose || $[5] !== severity) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Alert$2f$Alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Alert$3e$__["Alert"], {
            onClose: onClose,
            severity: severity,
            sx: t2,
            children: message
        }, void 0, false, {
            fileName: "[project]/src/components/NotificationBubble.tsx",
            lineNumber: 48,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = message;
        $[4] = onClose;
        $[5] = severity;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== onClose || $[8] !== open || $[9] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$Snackbar$2f$Snackbar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Snackbar$3e$__["Snackbar"], {
            open: open,
            autoHideDuration: 5000,
            onClose: onClose,
            anchorOrigin: t1,
            children: t3
        }, void 0, false, {
            fileName: "[project]/src/components/NotificationBubble.tsx",
            lineNumber: 58,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[7] = onClose;
        $[8] = open;
        $[9] = t3;
        $[10] = t4;
    } else {
        t4 = $[10];
    }
    return t4;
};
_c = NotificationBubble;
const __TURBOPACK__default__export__ = NotificationBubble;
var _c;
__turbopack_context__.k.register(_c, "NotificationBubble");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MapControls.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapControls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$map$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/map.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$NotificationBubble$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/NotificationBubble.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function MapControls({ map, airportLayer }) {
    _s();
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("YVR");
    const [notification, setNotification] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        open: false,
        message: "",
        severity: "info"
    });
    // loading states
    const [exporting, setExporting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fetching, setFetching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const doSearch = ()=>{
        if (!search) return;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            address: search
        }, (results, status)=>{
            if (status === "OK" && results?.[0]) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(14);
            } else {
                setNotification({
                    open: true,
                    message: "Location not found",
                    severity: "error"
                });
            }
        });
        airportLayer.clear();
    };
    const fetchAirport = async ()=>{
        if (fetching) return;
        setFetching(true);
        try {
            await airportLayer.load(search);
            setNotification({
                open: true,
                message: "Airport data fetched successfully",
                severity: "success"
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setNotification({
                open: true,
                message,
                severity: "error"
            });
        } finally{
            setFetching(false);
        }
    };
    const Export = async ()=>{
        if (exporting) return;
        setExporting(true);
        const data = {
            bounds: airportLayer.bounds ? {
                north: airportLayer.bounds.getNorthEast().lat(),
                east: airportLayer.bounds.getNorthEast().lng(),
                south: airportLayer.bounds.getSouthWest().lat(),
                west: airportLayer.bounds.getSouthWest().lng()
            } : null,
            elements: airportLayer.elements,
            visibleFeatures: Array.from(airportLayer.visibleFeatures),
            airportName: search,
            icao: airportLayer.icao
        };
        try {
            const res = await fetch("/api/export", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const result = await res.json().catch(()=>null);
            if (!res.ok) {
                throw new Error(result?.error || result?.raw || "Export failed");
            }
            setNotification({
                open: true,
                message: "Export file saved to outputs folder successfully",
                severity: "success"
            });
        } catch (err_0) {
            const message_0 = err_0 instanceof Error ? err_0.message : "Export failed";
            setNotification({
                open: true,
                message: message_0,
                severity: "error"
            });
        } finally{
            setExporting(false);
        }
    };
    const Spinner = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "inline-block w-3 h-3 ml-1.5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"
        }, void 0, false, {
            fileName: "[project]/src/components/MapControls.tsx",
            lineNumber: 107,
            columnNumber: 25
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "absolute",
            top: 10,
            left: 10,
            background: "white",
            padding: 10,
            display: "flex",
            gap: 8
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                placeholder: "Search airport",
                value: search,
                onChange: (e)=>setSearch(e.target.value),
                onKeyDown: (e_0)=>e_0.key === "Enter" && doSearch()
            }, void 0, false, {
                fileName: "[project]/src/components/MapControls.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: doSearch,
                children: "Go"
            }, void 0, false, {
                fileName: "[project]/src/components/MapControls.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: fetchAirport,
                disabled: fetching,
                children: [
                    "Fetch Airport Data",
                    fetching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Spinner, {}, void 0, false, {
                        fileName: "[project]/src/components/MapControls.tsx",
                        lineNumber: 123,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MapControls.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$map$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toggleMapTransparency"])(map),
                children: "Toggle Map"
            }, void 0, false, {
                fileName: "[project]/src/components/MapControls.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>Export(),
                disabled: exporting,
                children: [
                    "Export",
                    exporting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Spinner, {}, void 0, false, {
                        fileName: "[project]/src/components/MapControls.tsx",
                        lineNumber: 129,
                        columnNumber: 23
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MapControls.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$NotificationBubble$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: notification.open,
                message: notification.message,
                severity: notification.severity,
                onClose: ()=>setNotification((prev)=>({
                            ...prev,
                            open: false
                        }))
            }, void 0, false, {
                fileName: "[project]/src/components/MapControls.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/MapControls.tsx",
        lineNumber: 108,
        columnNumber: 10
    }, this);
}
_s(MapControls, "uREjaBD5cjSJsvrLZxennNhIXIg=");
_c = MapControls;
var _c;
__turbopack_context__.k.register(_c, "MapControls");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/LayerControls.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LayerControls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const initialLayersVisibilityState = {
    runway: true,
    taxiway: true,
    stopway: true,
    apron: true,
    building: true,
    parking_position: true,
    aerodrome: true,
    grass: true
};
// purely for UI layout
const featureGroups = [
    {
        title: "Roads/Areas",
        features: [
            "runway",
            "taxiway",
            "stopway",
            "apron"
        ]
    },
    {
        title: "Buildings",
        features: [
            "building"
        ]
    },
    {
        title: "Operations",
        features: [
            "parking_position"
        ]
    },
    {
        title: "Groundcover",
        features: [
            "grass"
        ]
    },
    {
        title: "Boundary",
        features: [
            "aerodrome"
        ]
    }
];
function LayerControls(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(9);
    if ($[0] !== "cd00069d9e6d075d1f7f49aa795cd2f11d35d9f77488fcdbee46388f3d15f801") {
        for(let $i = 0; $i < 9; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "cd00069d9e6d075d1f7f49aa795cd2f11d35d9f77488fcdbee46388f3d15f801";
    }
    const { airportLayer } = t0;
    const [layersVisibilityState, setLayersVisibilityState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialLayersVisibilityState);
    let t1;
    if ($[1] !== airportLayer) {
        t1 = ({
            "LayerControls[toggleFeature]": (feature, visible)=>{
                setLayersVisibilityState({
                    "LayerControls[toggleFeature > setLayersVisibilityState()]": (prev)=>({
                            ...prev,
                            [feature]: visible
                        })
                }["LayerControls[toggleFeature > setLayersVisibilityState()]"]);
                airportLayer.toggleFeature(feature);
            }
        })["LayerControls[toggleFeature]"];
        $[1] = airportLayer;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const toggleFeature = t1;
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {
            position: "absolute",
            top: 70,
            left: 10,
            background: "white",
            padding: 12,
            zIndex: 10,
            width: 180
        };
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] !== layersVisibilityState || $[5] !== toggleFeature) {
        t3 = featureGroups.map({
            "LayerControls[featureGroups.map()]": (group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: 10
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontWeight: "bold",
                                marginBottom: 4
                            },
                            children: group.title
                        }, void 0, false, {
                            fileName: "[project]/src/components/LayerControls.tsx",
                            lineNumber: 92,
                            columnNumber: 10
                        }, this),
                        group.features.map({
                            "LayerControls[featureGroups.map() > group.features.map()]": (feature_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        display: "block",
                                        paddingLeft: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: layersVisibilityState[feature_0],
                                            onChange: {
                                                "LayerControls[featureGroups.map() > group.features.map() > <input>.onChange]": (e)=>toggleFeature(feature_0, e.target.checked)
                                            }["LayerControls[featureGroups.map() > group.features.map() > <input>.onChange]"]
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/LayerControls.tsx",
                                            lineNumber: 99,
                                            columnNumber: 14
                                        }, this),
                                        " ",
                                        feature_0.replace("_", " ")
                                    ]
                                }, feature_0, true, {
                                    fileName: "[project]/src/components/LayerControls.tsx",
                                    lineNumber: 96,
                                    columnNumber: 85
                                }, this)
                        }["LayerControls[featureGroups.map() > group.features.map()]"])
                    ]
                }, group.title, true, {
                    fileName: "[project]/src/components/LayerControls.tsx",
                    lineNumber: 90,
                    columnNumber: 54
                }, this)
        }["LayerControls[featureGroups.map()]"]);
        $[4] = layersVisibilityState;
        $[5] = toggleFeature;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t2,
            children: t3
        }, void 0, false, {
            fileName: "[project]/src/components/LayerControls.tsx",
            lineNumber: 112,
            columnNumber: 10
        }, this);
        $[7] = t3;
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    return t4;
}
_s(LayerControls, "dymmKtFBmMwvjzLkcTBsVIOKxJw=");
_c = LayerControls;
var _c;
__turbopack_context__.k.register(_c, "LayerControls");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MapView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$map$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/map.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$airportLayer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/osm/airportLayer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MapControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MapControls.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$LayerControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/LayerControls.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function MapView() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(10);
    if ($[0] !== "4e5c2bd4d3239005b26a2b78d0bb4caf7cd0d6135171575d2a2cf5c21e31c725") {
        for(let $i = 0; $i < 10; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "4e5c2bd4d3239005b26a2b78d0bb4caf7cd0d6135171575d2a2cf5c21e31c725";
    }
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [map, setMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [airportLayer, setAirportLayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ({
            "MapView[useEffect()]": ()=>{
                const start = async function start() {
                    if (!mapRef.current) {
                        return;
                    }
                    const m = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$map$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initMap"])(mapRef.current);
                    setMap(m);
                    setAirportLayer(new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$osm$2f$airportLayer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](m));
                };
                start();
            }
        })["MapView[useEffect()]"];
        t1 = [];
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t0, t1);
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: mapRef,
            className: "w-full h-full"
        }, void 0, false, {
            fileName: "[project]/src/components/MapView.tsx",
            lineNumber: 46,
            columnNumber: 10
        }, this);
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full h-screen",
            children: [
                t2,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute bottom-5 right-3 z-[1000] bg-white/80 text-gray-800 text-[11px] px-2 py-1 rounded",
                    children: [
                        "Airport data from",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "https://www.openstreetmap.org",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "underline",
                            children: "OpenStreetMap"
                        }, void 0, false, {
                            fileName: "[project]/src/components/MapView.tsx",
                            lineNumber: 53,
                            columnNumber: 186
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/MapView.tsx",
                    lineNumber: 53,
                    columnNumber: 56
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/MapView.tsx",
            lineNumber: 53,
            columnNumber: 10
        }, this);
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    let t4;
    if ($[5] !== airportLayer || $[6] !== map) {
        t4 = map && airportLayer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MapControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    map: map,
                    airportLayer: airportLayer
                }, void 0, false, {
                    fileName: "[project]/src/components/MapView.tsx",
                    lineNumber: 60,
                    columnNumber: 35
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$LayerControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    airportLayer: airportLayer
                }, void 0, false, {
                    fileName: "[project]/src/components/MapView.tsx",
                    lineNumber: 60,
                    columnNumber: 88
                }, this)
            ]
        }, void 0, true);
        $[5] = airportLayer;
        $[6] = map;
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    let t5;
    if ($[8] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                t3,
                t4
            ]
        }, void 0, true);
        $[8] = t4;
        $[9] = t5;
    } else {
        t5 = $[9];
    }
    return t5;
}
_s(MapView, "HG5Nr+D3SkK+cSM5FyPn5sGpmeg=");
_c = MapView;
var _c;
__turbopack_context__.k.register(_c, "MapView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_dbfa6662._.js.map