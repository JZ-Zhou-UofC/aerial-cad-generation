import ezdxf
from core.geometry import latlon_to_meters, douglas_peucker

LAYER_CONFIG = {
    "Runway": {"color": 2},          # Yellow (Brightest for main infra)
    "Taxiway": {"color": 3},         # Green (Classic aviation chart style)
    "Apron": {"color": 6},           # Magenta (Pops against the runways)
    "Civil Buildings": {"color": 4}, # Cyan (Clean and architectural)
    "Parking": {"color": 210},       # Bright Orange (High visibility)
    "Unclassified": {"color": 1}     # Red (Alerts you to "unknown" data)
}

def export_to_cad(geo_data, output_path, ref_lat_lon):
    doc = ezdxf.new(setup=True)
    msp = doc.modelspace()
    doc.header['$INSUNITS'] = 6  # Units = Meters

    ref_lat, ref_lon = ref_lat_lon
    features = geo_data.get('elements', []) if isinstance(geo_data, dict) else geo_data

    for feature in features:
        tags = feature.get('tags', {})
        
        # 1. Identify Layer
        raw_val = tags.get('aeroway') or tags.get('building') or "Unclassified"
        layer_name = str(raw_val).strip().title()

        # 2. Get Styling (Default to Unclassified color if not in our dict)
        config = LAYER_CONFIG.get(layer_name, LAYER_CONFIG["Unclassified"])
        
        if layer_name not in doc.layers:
            # We only pass 'color' now; lineweight stays at CAD default
            doc.layers.add(name=layer_name, color=config['color'])

        geometry = feature.get('geometry', [])
        if not geometry: 
            continue

        # 3. Transform to Meters
        metric_points = []
        for pt in geometry:
            mx, my = latlon_to_meters(pt['lat'], pt['lon'], ref_lat, ref_lon)
            metric_points.append((mx, my))

        # 4. Simplify Geometry
        if len(metric_points) > 2:
            metric_points = douglas_peucker(metric_points, epsilon=0.1)

        # 5. Add to Modelspace
        if len(metric_points) > 1:
            msp.add_lwpolyline(metric_points, dxfattribs={'layer': layer_name})
            
    doc.saveas(output_path)
    print(f"📊 Research Export Successful: {output_path} (Weightless Mode)")