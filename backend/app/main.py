from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import map
import logging

app = FastAPI(title="Aerial CAD Generation API")

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(map.router)

logger = logging.getLogger("uvicorn")

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/health")
async def health():
    return {"status": "ok"}