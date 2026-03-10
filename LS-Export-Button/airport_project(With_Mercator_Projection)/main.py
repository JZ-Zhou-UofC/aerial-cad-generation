import os
from services.osm_services import fetch_semantic_geometry
from services.tile_service import dual_stitch_and_crop
from services.cad_service import export_to_cad
from utils.renderer import render_adaptive_mask
from utils.helpers import expand_bbox_meters, get_aerodrome_bbox
from core.geometry import latlon_to_pixel_xy

def process_airport_request(icao: str, zoom=16):
    # Phase 1: Context (Get the real-world bounds)
    min_lat, min_lon, max_lat, max_lon, name = get_aerodrome_bbox(icao) 
    bbox_ex = expand_bbox_meters(min_lat, min_lon, max_lat, max_lon, margin_m=250)
    
    # Define our Geospatial Reference Point (Center of the BBox)
    ref_lat = (bbox_ex[0] + bbox_ex[2]) / 2
    ref_lon = (bbox_ex[1] + bbox_ex[3]) / 2

    # Phase 2: Downloads (Satellite & OSM)
    sat_img = dual_stitch_and_crop(bbox_ex, zoom)
    geo_data = fetch_semantic_geometry(bbox_ex)
    
    # Phase 3: Outputs
    mask = render_adaptive_mask(geo_data, bbox_ex, zoom, sat_img.size)
    
    save_dir = "/Users/letiansong/Desktop/ENSF_609:610/CAD-gen-reasearch/airport_project(With_Mercator_Projection)/outputs"
    os.makedirs(save_dir, exist_ok=True)
    dxf_path = os.path.join(save_dir, f"{icao}_geospatial.dxf")

    # CALLING THE GEOSPATIAL EXPORTER
    # Instead of 'origin' in pixels, we pass 'ref_lat_lon' in degrees
    export_to_cad(
        geo_data=geo_data, 
        output_path=dxf_path, 
        ref_lat_lon=(ref_lat, ref_lon), 
    )
    
    sat_img.save(os.path.join(save_dir, f"{icao}_sat.png"))
    mask.save(os.path.join(save_dir, f"{icao}_mask.png"))
    
    return {"cad_path": dxf_path}

if __name__ == "__main__":
    icao_to_test = "CYVR" 
    try:
        print(f"--- Starting Process for {icao_to_test} ---")
        results = process_airport_request(icao_to_test)
        print(f"--- Success! Files saved in: {os.path.dirname(results['cad_path'])} ---")
    except Exception as e:
        # This will now catch and print the specific line if it fails again
        import traceback
        traceback.print_exc() 
        print(f"--- Process Failed: {e} ---")