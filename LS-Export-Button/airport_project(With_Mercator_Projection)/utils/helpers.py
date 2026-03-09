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
    query = f'[out:json];(node["aeroway"="aerodrome"]["icao"="{icao.upper()}"];way["aeroway"="aerodrome"]["icao"="{icao.upper()}"];relation["aeroway"="aerodrome"]["icao"="{icao.upper()}"];);(._; >;);out body;'
    resp = requests.post(OVERPASS_URL, data={"data": query}, headers=HTTP_HEADERS, timeout=30)
    data = resp.json().get("elements", [])
    
    lats = [e["lat"] for e in data if "lat" in e]
    lons = [e["lon"] for e in data if "lon" in e]
    
    # NEW: Extract the airport name to satisfy the 5-way unpack in main.py
    # This looks for the "name" tag; if not found, it uses the ICAO code as a fallback.
    name = next((e["tags"]["name"] for e in data if "tags" in e and "name" in e["tags"]), icao)
    
    # Now returning exactly 5 values: min_lat, min_lon, max_lat, max_lon, name
    return min(lats), min(lons), max(lats), max(lons), name