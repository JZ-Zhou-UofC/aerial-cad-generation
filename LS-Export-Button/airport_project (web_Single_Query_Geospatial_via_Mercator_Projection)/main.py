import os
import traceback
from services.osm_services import fetch_semantic_geometry
from services.tile_service import dual_stitch_and_crop
from services.cad_service import export_to_cad
from utils.renderer import render_adaptive_mask
from utils.helpers import expand_bbox_meters, get_aerodrome_bbox
from core.geometry import latlon_to_pixel_xy
from services.web_gateway import handle_viewport_export

def process_airport_request(icao: str, zoom=16):
    # Phase 1: Context
    min_lat, min_lon, max_lat, max_lon, name = get_aerodrome_bbox(icao) 
    bbox_ex = expand_bbox_meters(min_lat, min_lon, max_lat, max_lon, margin_m=250)
    
    # Phase 2: Downloads
    sat_img = dual_stitch_and_crop(bbox_ex, zoom)
    geo_data = fetch_semantic_geometry(bbox_ex)
    
    # Phase 3: Outputs
    mask = render_adaptive_mask(geo_data, bbox_ex, zoom, sat_img.size)
    
    # Updated path to include (web) subdirectory as per your logic
    save_dir = "/Users/letiansong/Desktop/ENSF_609:610/CAD-gen-reasearch/airport_project (web)/outputs"
    os.makedirs(save_dir, exist_ok=True)
    dxf_path = os.path.join(save_dir, f"{icao}_layout.dxf")

    # Top-left origin: (max_lat, min_lon) -> bbox_ex[2], bbox_ex[1]
    origin_x, origin_y = latlon_to_pixel_xy(bbox_ex[2], bbox_ex[1], zoom)
    
    # Pass empty list to trigger the "All Layers" default in cad_service
    export_to_cad(
        geo_data, 
        dxf_path, 
        origin=(origin_x, origin_y), 
        zoom=zoom, 
        active_layers=[]
    )
    
    sat_img.save(os.path.join(save_dir, f"{icao}_sat.png"))
    mask.save(os.path.join(save_dir, f"{icao}_mask.png"))
    
    return {"cad_path": dxf_path}

if __name__ == "__main__":
    mode = "WEB" 
    
    try:
        if mode == "ICAO":
            icao_to_test = "CYYZ"
            print(f"--- Starting Academic Research Mode for {icao_to_test} ---")
            results = process_airport_request(icao_to_test)
            print(f"--- Success! CAD saved at: {results['cad_path']} ---")
            
        elif mode == "WEB":
            print("--- Starting Web Gateway Mode ---")
            
            # Simulated incoming data from the frontend/UI
            user_coords = {
                "min_lat": 43.666, 
                "min_lon": -79.645, 
                "max_lat": 43.692, 
                "max_lon": -79.608
            }
            on_layers = ["Runway", "Taxiway", "Civil Buildings"] 
            
            # Pre-fetched data simulated here
            mock_geo_data = { "elements": [] } # Replace [] with actual mock data for testing

            results = handle_viewport_export(
                coords=user_coords,
                geo_data=mock_geo_data,
                zoom=16, 
                session_id="user_test_01", 
                icao="CYYZ", 
                active_layers=on_layers
            )
            
            print(f"--- Export Complete! Data was processed locally without new OSM requests. ---")

    except Exception as e:
        print(f"❌ Error in {mode} mode:")
        traceback.print_exc()