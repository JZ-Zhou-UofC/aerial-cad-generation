from pydantic import BaseModel
from typing import Dict, List, Any

class ExportCADRequest(BaseModel):
    icao: str
    bounds: Dict[str, Any]  # LatLngBounds JSON
    features: Dict[str, bool]
    featureData: Dict[str, List[Any]]