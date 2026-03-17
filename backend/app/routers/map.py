from fastapi import APIRouter, Depends, HTTPException,Query
from fastapi.encoders import jsonable_encoder
import json

router = APIRouter(prefix="/map", tags=["map"])

@router.get("")

async def get_map_imagery(

):
    print("\n_implementate the get map from ")

async def get_osm_json(

):
    print("\n_implementate the get map from ")

@router.post("/save-airport-data/")
async def save_airport_data(body: dict):
    json_body = jsonable_encoder(body)
    print(json.dumps(json_body, indent=4))
    return {"status": "success", "message": "Data received"}

