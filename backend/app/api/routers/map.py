from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.api.schemas.export import ExportCADRequest
import os
from app.services.cad_export import process_airport_request

router = APIRouter(prefix="/map", tags=["map"])

@router.post("/export-cad")
async def export_cad(request: ExportCADRequest):
    try:
        # Validate ICAO
        if not request.icao or len(request.icao) != 4:
            raise HTTPException(status_code=400, detail="Invalid ICAO code")

        # For now, use the provided featureData instead of fetching
        # In a full implementation, you might process featureData here
        active_layers = [k for k, v in request.features.items() if v]

        dxf_path = process_airport_request(request.icao, active_layers=active_layers)

        if not os.path.exists(dxf_path):
            raise HTTPException(status_code=500, detail="CAD file generation failed")

        return FileResponse(dxf_path, media_type='application/octet-stream', filename=f'{request.icao}_layout.dxf')

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))