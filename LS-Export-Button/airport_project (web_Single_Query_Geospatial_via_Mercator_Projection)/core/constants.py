# API Endpoints
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
SAT_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

# Rendering Settings
TILE_SIZE = 256
HTTP_HEADERS = {"User-Agent": "airport_segmentation_project/1.0"}
TILE_DELAY_S = 0.05 

# Semantic Classes for U-Net
SEMANTIC_MAP = {
    "apron": 1,
    "terminal": 2,
    "taxiway": 3,
    "runway": 4,
    "building": 5
}
