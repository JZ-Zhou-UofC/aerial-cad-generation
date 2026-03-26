from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
from typing import List, Optional
from app.services.cad_service import export_to_cad
from app.utils.file_naming import get_next_dxf_filename
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
    icao = data.icao
    bounds = data.bounds
    elements = data.elements
    visible = data.visibleFeatures
    geo_data = elements

    max_lat = bounds["north"]
    min_lon = bounds["west"]

    zoom = 16

    base_dir = "../outputs"

    dxf_path = get_next_dxf_filename(base_dir, icao)

    json_path = os.path.join(base_dir, f"{icao}_elements.json")

    with open(json_path, "w", encoding="utf-8") as f:
            json.dump(elements, f, indent=2, ensure_ascii=False)

    print(f"Saved elements to: {json_path}")

    export_to_cad(
        geo_data,
        dxf_path,
        max_lat,
        min_lon,
        zoom=zoom,
        active_layers=visible,
    )
    # Return everything back to frontend
    return JSONResponse(content=data.model_dump())
