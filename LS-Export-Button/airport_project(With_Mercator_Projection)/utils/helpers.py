import math
import requests
from core.constants import OVERPASS_URL, HTTP_HEADERS

def expand_bbox_meters(min_lat, min_lon, max_lat, max_lon, margin_m: float):
    mid_lat = (min_lat + max_lat) / 2.0
    m_per_deg = 111320.0
    dlat = margin_m / m_per_deg
    dlon = margin_m / (m_per_deg * math.cos(math.radians(mid_lat)))
    return (min_lat - dlat, min_lon - dlon, max_lat + dlat, max_lon + dlon)

def get_aerodrome_bbox(icao: str):
    query = f'''
    [out:json][timeout:25];
    (
      node["aeroway"="aerodrome"]["icao"="{icao.upper()}"];
      way["aeroway"="aerodrome"]["icao"="{icao.upper()}"];
      relation["aeroway"="aerodrome"]["icao"="{icao.upper()}"];
    );
    (._; >;);
    out body;
    '''

    resp = requests.post(
        OVERPASS_URL,
        data={"data": query},
        headers=HTTP_HEADERS,
        timeout=30
    )

    print("OVERPASS_URL:", OVERPASS_URL)
    print("Status code:", resp.status_code)
    print("Content-Type:", resp.headers.get("Content-Type"))
    print("Response preview:", resp.text[:1000])

    resp.raise_for_status()

    try:
        payload = resp.json()
    except json.JSONDecodeError:
        raise ValueError(f"Response was not JSON:\n{resp.text[:1000]}")

    data = payload.get("elements", [])

    if not data:
        raise ValueError(f"No elements returned for ICAO {icao.upper()}")

    lats = [e["lat"] for e in data if "lat" in e]
    lons = [e["lon"] for e in data if "lon" in e]

    if not lats or not lons:
        raise ValueError(f"No lat/lon nodes found for ICAO {icao.upper()}")

    name = next(
        (e["tags"]["name"] for e in data if "tags" in e and "name" in e["tags"]),
        icao
    )

    return min(lats), min(lons), max(lats), max(lons), name