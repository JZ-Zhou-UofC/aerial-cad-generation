export async function initMap(
  container: HTMLDivElement
): Promise<google.maps.Map> {
  const { Map } = await google.maps.importLibrary(
    "maps"
  ) as google.maps.MapsLibrary;

  const map = new Map(container, {
    center: { lat: 49.1951, lng: -123.1779 },
    zoom: 14,
    minZoom: 12,
    maxZoom: 18,
    mapTypeId: "satellite",
    disableDefaultUI: true,
    gestureHandling: "greedy",
  });

  return map;
}

export function moveMapTo(
  map: google.maps.Map,
  center: google.maps.LatLng | google.maps.LatLngLiteral
) {
  const lat =
    typeof center.lat === "function" ? center.lat() : center.lat;

  const lng =
    typeof center.lng === "function" ? center.lng() : center.lng;

  const plainCenter = { lat, lng };

  console.log("moveMapTo center:", plainCenter);

  map.setCenter(plainCenter);
  map.setZoom(14);
}