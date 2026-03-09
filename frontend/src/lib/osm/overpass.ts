const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function fetchAirportData(
  features: string[],
  bounds: google.maps.LatLngBounds
) {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const north = ne.lat();
  const east = ne.lng();
  const south = sw.lat();
  const west = sw.lng();

  const query = `
    [out:json][timeout:25];
    (
      ${features
        .map(
          (f) => `way["aeroway"="${f}"](${south},${west},${north},${east});`
        )
        .join("\n")}
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