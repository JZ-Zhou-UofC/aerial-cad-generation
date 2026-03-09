from fastapi import APIRouter, Depends, HTTPException,Query


router = APIRouter(prefix="/map", tags=["map"])

@router.get("")

async def get_map_imagery(

):
    print("\n_implementate the get map from ")

async def get_osm_json(

):
    print("\n_implementate the get map from ")

