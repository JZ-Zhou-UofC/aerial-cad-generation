from PIL import Image, ImageDraw
from core.constants import SEMANTIC_MAP
from core.geometry import latlon_to_pixel_xy

def render_adaptive_mask(elements, bbox, zoom, size, target_layer="all"):
    min_lat, min_lon, max_lat, max_lon = bbox
    width, height = size
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    origin_x, origin_y = latlon_to_pixel_xy(max_lat, min_lon, zoom)

    for el in elements:
        if "geometry" not in el: continue
        tags = el.get("tags", {})
        aeroway = tags.get("aeroway")
        is_building = "building" in tags
        
        class_id = 0
        if target_layer == "all":
            if aeroway in SEMANTIC_MAP: class_id = SEMANTIC_MAP[aeroway]
            elif is_building: class_id = SEMANTIC_MAP["building"]
        elif (target_layer == "building" and is_building) or (aeroway == target_layer):
            class_id = 255

        if class_id == 0: continue

        points = [(latlon_to_pixel_xy(pt["lat"], pt["lon"], zoom)[0] - origin_x, 
                   latlon_to_pixel_xy(pt["lat"], pt["lon"], zoom)[1] - origin_y) 
                  for pt in el["geometry"]]
        
        if len(points) < 2: continue
        
        if el["type"] == "way" and aeroway in ["runway", "taxiway"] and "area" not in tags:
            draw.line(points, fill=class_id, width=25 if aeroway=="runway" else 8)
        else:
            draw.polygon(points, fill=class_id)
                
    return mask
