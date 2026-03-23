import os
import re

def get_next_dxf_filename(base_dir: str, icao: str) -> str:
    """
    Returns a full path like:
    ../outputs/CYYC/CYYC.dxf
    ../outputs/CYYC/CYYC1.dxf
    ../outputs/CYYC/CYYC2.dxf
    """
    airport_dir = os.path.join(base_dir, icao)
    os.makedirs(airport_dir, exist_ok=True)

    pattern = re.compile(rf"^{icao}(\d*)\.dxf$", re.IGNORECASE)

    existing_indices = []

    for filename in os.listdir(airport_dir):
        match = pattern.match(filename)
        if match:
            suffix = match.group(1)
            if suffix == "":
                existing_indices.append(0)
            else:
                existing_indices.append(int(suffix))

    if not existing_indices:
        next_index = 0
    else:
        next_index = max(existing_indices) + 1

    if next_index == 0:
        filename = f"{icao}.dxf"
    else:
        filename = f"{icao}{next_index}.dxf"

    return os.path.join(airport_dir, filename)