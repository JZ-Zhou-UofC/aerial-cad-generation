import AirportLayer from "./airportLayer";

export function initControls(
  map: google.maps.Map,
  airportLayer: AirportLayer
) {
  map.addListener("click", (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    airportLayer.addMarker({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  });
}