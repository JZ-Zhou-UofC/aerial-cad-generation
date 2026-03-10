import requests
import time
from core.constants import OVERPASS_URL, HTTP_HEADERS

def fetch_semantic_geometry(bbox: tuple):
    """
    Hardened query for high-density geometry.
    Adds server-side timeout and retry logic for robust webapp performance.
    """
    min_lat, min_lon, max_lat, max_lon = bbox
    
    query = f"""
    [out:json][timeout:180];
    (
      way["aeroway"~"apron|taxiway|runway|terminal"]({min_lat},{min_lon},{max_lat},{max_lon});
      relation["aeroway"~"apron|taxiway|runway|terminal"]({min_lat},{min_lon},{max_lat},{max_lon});
      way["building"]({min_lat},{min_lon},{max_lat},{max_lon});
      relation["building"]({min_lat},{min_lon},{max_lat},{max_lon});
    );
    (._; >;);
    out geom;
    """
    
    for attempt in range(3):
        try:
            resp = requests.post(
                OVERPASS_URL, 
                data={"data": query}, 
                headers=HTTP_HEADERS, 
                timeout=200
            )
            
            if resp.status_code == 200:
                return resp.json().get("elements", [])
            elif resp.status_code == 429:
                print(f"⚠️ Overpass throttled. Waiting 15s... (Attempt {attempt+1})")
                time.sleep(15)
            else:
                print(f"⚠️ Server error {resp.status_code}. Retrying in 5s...")
                time.sleep(5)
                
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Connection error: {e}. Retrying...")
            time.sleep(5)
            
    raise RuntimeError("Overpass API failed to return data after multiple retries.")