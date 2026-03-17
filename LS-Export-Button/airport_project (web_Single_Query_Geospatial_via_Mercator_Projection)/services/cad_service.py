import ezdxf
import os
from core.geometry import latlon_to_pixel_xy, douglas_peucker

# Default colours to match transoft output

LAYER_CONFIG = {
    "Runway": {"color": 2, "lineweight": 50},            # Yellow
    "Taxiway": {"color": 2, "lineweight": 50},           # Yellow
    "Stopway": {"color": 30, "lineweight": 25},          # Orange-ish (closest match)
    "Apron": {"color": 6, "lineweight": 25},             # Magenta
    "Terminal": {"color": 7, "lineweight": 25},          # White/Black (depends on background)
    "Hangar": {"color": 8, "lineweight": 25},            # Gray
    "Parking_Position": {"color": 7, "lineweight": 25},  # White
    "Grass": {"color": 3, "lineweight": 25},             # Green
    "Aerodrome": {"color": 7, "lineweight": 25},         # White/Black boundary
    "Unclassified": {"color": 1, "lineweight": 25},      # Red (Alerts you to "unknown" data)
}

# Contrast colours for better comparison visibility:

# LAYER_CONFIG = {
#     "Runway": {"color": 1, "lineweight": 50},            # Red
#     "Taxiway": {"color": 5, "lineweight": 50},           # Blue
#     "Stopway": {"color": 30, "lineweight": 25},          # Orange
#     "Apron": {"color": 6, "lineweight": 25},             # Magenta
#     "Terminal": {"color": 4, "lineweight": 25},          # Cyan
#     "Hangar": {"color": 8, "lineweight": 25},            # Gray
#     "Parking_Position": {"color": 7, "lineweight": 25},  # White
#     "Grass": {"color": 3, "lineweight": 25},             # Green
#     "Aerodrome": {"color": 2, "lineweight": 25},         # Yellow
#     "Unclassified": {"color": 9, "lineweight": 25},      # Light Gray
# }

def export_to_cad(geo_data, output_path, origin, zoom, active_layers=None):
    doc = ezdxf.new(setup=True)
    msp = doc.modelspace()
    doc.header['$INSUNITS'] = 0 # Web Mode uses Pixel units

    features = geo_data.get('elements', []) if isinstance(geo_data, dict) else geo_data
    processed_count = 0

    for feature in features:
        tags = feature.get('tags', {})
        
        # 1. Identify Layer
        raw_val = tags.get('aeroway') or tags.get('building') or "Unclassified"
        layer_name = str(raw_val).strip().title()
        
        # 2. Styling
        config = LAYER_CONFIG.get(layer_name, LAYER_CONFIG["Unclassified"])
        if layer_name not in doc.layers:
            doc.layers.add(name=layer_name, color=config['color'], lineweight=config.get('lineweight'))

        geometry = feature.get('geometry', [])
        if not geometry: continue

        # 3. Coordinate Conversion (Pixel Space)
        pixel_points = []
        for pt in geometry:
            px, py = latlon_to_pixel_xy(pt['lat'], pt['lon'], zoom)
            pixel_points.append((px - origin[0], -(py - origin[1])))

        # 4. Simplification (0.5 pixel tolerance)
        if len(pixel_points) > 2:
            pixel_points = douglas_peucker(pixel_points, epsilon=0.5)

        # 5. Drawing Logic
        if len(pixel_points) > 1:
            polyline = msp.add_lwpolyline(pixel_points, dxfattribs={'layer': layer_name})
            
            # --- THE "APRON" FIX ---
            # Only auto-close if it's a structural element (Building/Terminal/Hangar)
            # AND the data actually starts and ends at the same point.
            is_structural = any(k in layer_name for k in ["Building", "Terminal", "Hangar"])
            points_match = (pixel_points[0] == pixel_points[-1])
            
            if is_structural and points_match:
                polyline.closed = True
            else:
                # Aprons and Taxiways remain open paths to prevent "slicing"
                polyline.closed = False
            
            processed_count += 1
            
    try:
        doc.saveas(output_path)
        print(f"🌐 Web CAD Export (Safe-Closure): {processed_count} features")
    except Exception as e:
        print(f"❌ Save Failed: {e}")