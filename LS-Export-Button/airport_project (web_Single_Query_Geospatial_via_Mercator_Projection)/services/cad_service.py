import ezdxf
import os
from core.geometry import latlon_to_pixel_xy, douglas_peucker

# Vibrant Palette for Web/Satellite Overlays
LAYER_CONFIG = {
    "Runway": {"color": 2},          # Yellow
    "Taxiway": {"color": 3},         # Green
    "Apron": {"color": 6},           # Magenta
    "Building": {"color": 4},        # Cyan
    "Terminal": {"color": 4},        # Cyan
    "Hangar": {"color": 4},          # Cyan
    "Parking": {"color": 210},       # Orange
    "Unclassified": {"color": 1}     # Red
}

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
            doc.layers.add(name=layer_name, color=config['color'])

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