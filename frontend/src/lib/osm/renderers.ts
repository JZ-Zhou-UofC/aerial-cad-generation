import { buildBufferedPolygon } from "./geometry";

export function renderRunway(
  map: google.maps.Map,
  element: any,
  style: any
) {
  const width = parseFloat(element.tags.width);

  const path = buildBufferedPolygon(
    element.geometry,
    width
  );

  return new google.maps.Polygon({
    paths: path,
    fillColor: style.fillColor,
    fillOpacity: style.fillOpacity,
    strokeColor: style.strokeColor,
    strokeWeight: style.strokeWeight,
    strokeOpacity: style.strokeOpacity,
    map,
  });
}

export function renderDefault(
  map: google.maps.Map,
  element: any,
  style: any
) {
  const path = element.geometry.map((p: any) => ({
    lat: p.lat,
    lng: p.lon,
  }));

  if (style.render === "line") {
    return new google.maps.Polyline({
      path,
      strokeColor: style.strokeColor,
      strokeOpacity: style.strokeOpacity,
      strokeWeight: style.strokeWeight,
      map,
    });
  }

  if (style.render === "polygon") {
    return new google.maps.Polygon({
      paths: path,
      fillColor: style.fillColor,
      fillOpacity: style.fillOpacity,
      strokeColor: style.strokeColor,
      strokeWeight: style.strokeWeight,
      map,
    });
  }

  return null;
}