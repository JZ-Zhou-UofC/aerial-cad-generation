from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import io

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

    # Return everything back to frontend
    return JSONResponse(content=data.model_dump())