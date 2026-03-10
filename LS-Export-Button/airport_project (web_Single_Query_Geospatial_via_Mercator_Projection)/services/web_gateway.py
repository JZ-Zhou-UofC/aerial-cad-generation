import os
from services.cad_service import export_to_cad
from utils.renderer import render_adaptive_mask
from core.geometry import latlon_to_pixel_xy

def handle_viewport_export(coords, geo_data, zoom, session_id, icao, active_layers):
    """
    Revised Gateway: Now receives geo_data directly from the frontend request.
    """
    # 1. Setup paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    save_dir = os.path.join(base_dir, "outputs", "web")
    os.makedirs(save_dir, exist_ok=True)
    
    dxf_name = f"{icao}_{session_id}.dxf"
    dxf_path = os.path.join(save_dir, dxf_name)

    # 2. Calculate origin for alignment (Top-Left of viewport)
    # Using coords: {"min_lat", "min_lon", "max_lat", "max_lon"}
    origin_x, origin_y = latlon_to_pixel_xy(coords['max_lat'], coords['min_lon'], zoom)

    # 3. Export CAD (No OSM service call needed!)
    export_to_cad(
        geo_data=geo_data, 
        output_path=dxf_path, 
        origin=(origin_x, origin_y), 
        zoom=zoom, 
        active_layers=active_layers
    )

    return {
        "icao": icao,
        "dxf": dxf_path,
        "layers_processed": active_layers
    }