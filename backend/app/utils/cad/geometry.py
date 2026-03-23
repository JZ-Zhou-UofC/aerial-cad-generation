import math
import numpy as np
from typing import Tuple, List
# app/cad/geometry.py

TILE_SIZE = 256

def latlon_to_pixel_xy(lat: float, lon: float, zoom: int) -> Tuple[float, float]:
    lat = max(min(lat, 85.05112878), -85.05112878)
    sin_lat = math.sin(math.radians(lat))
    n = 2.0 ** zoom
    x = (lon + 180.0) / 360.0 * n * TILE_SIZE
    y = (0.5 - math.log((1 + sin_lat) / (1 - sin_lat)) / (4 * math.pi)) * n * TILE_SIZE
    return x, y

def latlon_to_meters(lat: float, lon: float, ref_lat: float, ref_lon: float) -> Tuple[float, float]:
    """Metric projection for real-world scaling."""
    R = 6378137.0 
    d_lat = math.radians(lat - ref_lat)
    d_lon = math.radians(lon - ref_lon)
    y = d_lat * R
    x = d_lon * R * math.cos(math.radians(ref_lat))
    return x, y

def latlon_to_tile_xy(lat: float, lon: float, zoom: int) -> Tuple[int, int]:
    lat = max(min(lat, 85.05112878), -85.05112878)
    n = 2.0 ** zoom
    x = int((lon + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return x, y

def douglas_peucker(points: List[Tuple[float, float]], epsilon: float) -> List[Tuple[float, float]]:
    if len(points) < 3:
        return points
    p1, p2 = np.array(points[0]), np.array(points[-1])
    dists = [np.abs(np.cross(p2-p1, p1-np.array(p))) / np.linalg.norm(p2-p1) 
             if not np.array_equal(p1, p2) else np.linalg.norm(np.array(p)-p1) 
             for p in points]
    dmax = max(dists)
    index = dists.index(dmax)
    if dmax > epsilon:
        left = douglas_peucker(points[:index+1], epsilon)
        right = douglas_peucker(points[index:], epsilon)
        return left[:-1] + right
    return [points[0], points[-1]]




def convert_to_pixels(coords, origin_x, origin_y, zoom):
    """
    Converts [(lat, lon)] → [(x, y)] in pixel space
    Uses existing latlon_to_pixel_xy
    """
    pixel_points = []

    for lat, lon in coords:
        px, py = latlon_to_pixel_xy(lat, lon, zoom)
        pixel_points.append((px - origin_x, -(py - origin_y)))

    return pixel_points


def simplify(points):
    """
    Wrapper around your Douglas-Peucker
    """
    if len(points) > 2:
        return douglas_peucker(points, epsilon=0.5)
    return points