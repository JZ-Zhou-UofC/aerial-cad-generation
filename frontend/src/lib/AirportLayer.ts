export default class AirportLayer {
  private map: google.maps.Map;

  constructor(map: google.maps.Map) {
    this.map = map;
  }

  addMarker(position: google.maps.LatLngLiteral) {
    new google.maps.Marker({
      map: this.map,
      position,
    });
  }
}