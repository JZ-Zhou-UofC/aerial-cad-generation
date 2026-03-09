import time
import io
import requests
from PIL import Image
from core.constants import SAT_URL, TILE_SIZE, HTTP_HEADERS, TILE_DELAY_S
from core.geometry import latlon_to_tile_xy, latlon_to_pixel_xy

def _fetch_tile(url: str) -> Image.Image:
    for _ in range(3):
        try:
            r = requests.get(url, headers=HTTP_HEADERS, timeout=10)
            r.raise_for_status()
            return Image.open(io.BytesIO(r.content)).convert("RGB")
        except:
            time.sleep(1)
    return Image.new("RGB", (TILE_SIZE, TILE_SIZE), (255, 255, 255))

def dual_stitch_and_crop(bbox: tuple, zoom: int) -> Image.Image:
    min_lat, min_lon, max_lat, max_lon = bbox
    left_tx, top_ty = latlon_to_tile_xy(max_lat, min_lon, zoom)
    right_tx, bottom_ty = latlon_to_tile_xy(min_lat, max_lon, zoom)
    
    tw, th = right_tx - left_tx + 1, bottom_ty - top_ty + 1
    mosaic = Image.new("RGB", (tw * TILE_SIZE, th * TILE_SIZE))
    
    for ty in range(top_ty, bottom_ty + 1):
        for tx in range(left_tx, right_tx + 1):
            tile = _fetch_tile(SAT_URL.format(z=zoom, x=tx, y=ty))
            mosaic.paste(tile, ((tx - left_tx) * TILE_SIZE, (ty - top_ty) * TILE_SIZE))
            time.sleep(TILE_DELAY_S)

    tl_px, tl_py = latlon_to_pixel_xy(max_lat, min_lon, zoom)
    br_px, br_py = latlon_to_pixel_xy(min_lat, max_lon, zoom)
    origin_x, origin_y = left_tx * TILE_SIZE, top_ty * TILE_SIZE
    
    crop_box = (int(round(tl_px - origin_x)), int(round(tl_py - origin_y)),
                int(round(br_px - origin_x)), int(round(br_py - origin_y)))
    
    return mosaic.crop(crop_box)
