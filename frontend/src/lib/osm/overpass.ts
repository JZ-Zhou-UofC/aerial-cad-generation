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
  way["aeroway"="taxiway"](${south},${west},${north},${east});
  way["aeroway"="stopway"](${south},${west},${north},${east});
  way["aeroway"="apron"](${south},${west},${north},${east});

  // Buildings / infrastructure
  way["aeroway"="terminal"](${south},${west},${north},${east});
  way["aeroway"="hangar"](${south},${west},${north},${east});
  way["building"="terminal"](${south},${west},${north},${east});
  way["building"="hangar"](${south},${west},${north},${east});

  // Operations (parking)
  way["aeroway"="parking_position"](${south},${west},${north},${east});

  // Ground cover (grass)
  way["landcover"="grass"](${south},${west},${north},${east});
  way["landuse"="grass"](${south},${west},${north},${east});
  way["natural"="grassland"](${south},${west},${north},${east});
  way["aeroway"]["surface"="grass"](${south},${west},${north},${east});

  // Airport boundary
  way["aerodrome"](${south},${west},${north},${east});
);
out geom;
`;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: query,
  });

  if (!res.ok) {
    throw new Error(`Overpass HTTP ${res.status}`);
  }

  return res.json();
}
