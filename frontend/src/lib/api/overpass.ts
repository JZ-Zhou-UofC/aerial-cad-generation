

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// OSM airport data documentation:
// https://wiki.openstreetmap.org/wiki/Aeroways
export async function fetchAirportData(bounds: google.maps.LatLngBounds) {
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
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ data: query }),
  });

  if (!res.ok) {
    throw new Error(`Overpass HTTP ${res.status}`);
  }

  return res.json();
}


export async function getAerodromeBBox(icao: string): Promise<google.maps.LatLngBounds | null> {

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
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ data: query }),
  });
  const payload = await res.json();
  const bounds = extractBoundsFromOverpass(payload);
  return bounds
}

function extractBoundsFromOverpass(
  payload: any
): google.maps.LatLngBounds {
  const elements = payload?.elements || [];

  if (!elements.length) {
    throw new Error("No elements returned");
  }

  const lats: number[] = [];
  const lons: number[] = [];

  for (const e of elements) {
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

  return new google.maps.LatLngBounds(
    { lat: south, lng: west },
    { lat: north, lng: east }
  );
}