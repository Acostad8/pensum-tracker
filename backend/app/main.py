"""Entry point de la API FastAPI."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import upload


app = FastAPI(
    title="Pensum Tracker API",
    description="API para analizar el avance académico de estudiantes UFPSO",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "name": "Pensum Tracker API",
        "version": "0.1.0",
        "docs": "/docs",
    }
