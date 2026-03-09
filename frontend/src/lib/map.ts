export async function initMap(
  container: HTMLDivElement
): Promise<google.maps.Map> {

  const { Map } =
    (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;

  return new Map(container, {
    center: { lat: 49.1951, lng: -123.1779 },
    zoom: 14,
    minZoom: 12,
    maxZoom: 18,
    mapTypeId: "satellite",
    disableDefaultUI: true,
    gestureHandling: "greedy",
  });
}

export function toggleMapTransparency(map: google.maps.Map) {
  const current = map.getMapTypeId();

  if (current === "satellite") {
    map.setMapTypeId("roadmap");
  } else {
    map.setMapTypeId("satellite");
  }
}