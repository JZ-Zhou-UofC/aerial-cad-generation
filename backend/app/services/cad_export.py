import os
import traceback
# Assuming the modules are available; in full setup, copy from LS-Export-Button
# from services.osm_services import fetch_semantic_geometry
# etc.

def process_airport_request(icao: str, zoom=16, active_layers=None):
    if active_layers is None:
        active_layers = []
    # Placeholder: In real implementation, integrate with CAD generation
    # For now, create a dummy DXF file
    save_dir = os.path.join(os.getcwd(), "outputs")
    os.makedirs(save_dir, exist_ok=True)
    dxf_path = os.path.join(save_dir, f"{icao}_layout.dxf")

    # Dummy content
    with open(dxf_path, 'w') as f:
        f.write("Dummy DXF content for " + icao)

    return dxf_path