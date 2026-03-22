from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from app.core.geometry import latlon_to_pixel_xy
from app.services.cad_service import export_to_cad
import io
import os

router = APIRouter(prefix="/export", tags=["export"])


# --- Request model (match your frontend payload) ---
class ExportRequest(BaseModel):
    bounds: Optional[dict]
    elements: List[dict]
    visibleFeatures: List[str]
    airportName: str
    icao: Optional[str]


@router.post("/cad")
async def export_cad(data: ExportRequest):
    # Console logs
    print("airportName:", data.airportName)
    print("icao:", data.icao)
    print("bounds:", data.bounds)
    print("visibleFeatures:", data.visibleFeatures)
    print("elements count:", len(data.elements))
    airport_name = data.airportName
    icao = data.icao or "airport"
    bounds = data.bounds
    elements = data.elements
    visible = data.visibleFeatures
    geo_data = elements

    min_lat = bounds["south"]
    max_lat = bounds["north"]
    min_lon = bounds["west"]
    max_lon = bounds["east"]
    zoom = 16
    origin_x, origin_y = latlon_to_pixel_xy(max_lat, min_lon, zoom)

    save_dir = "./outputs"
    os.makedirs(save_dir, exist_ok=True)

    dxf_path = os.path.join(save_dir, f"{icao}_layout.dxf")

    export_to_cad(
        geo_data,
        dxf_path,
        origin=(origin_x, origin_y),
        zoom=zoom,
        active_layers=visible,  # now controlled by frontend
    )
    # Return everything back to frontend
    return JSONResponse(content=data.model_dump())
