"""Entry point de la API FastAPI."""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import upload


def _build_cors_origins() -> list[str]:
    """Construye la lista de orígenes permitidos.

    En desarrollo: localhost ports comunes.
    En producción: agrega los dominios listados en CORS_ORIGINS (separados por coma).
    """
    defaults = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    extra = os.getenv("CORS_ORIGINS", "")
    production = [o.strip() for o in extra.split(",") if o.strip()]
    return list({*defaults, *production})


app = FastAPI(
    title="Pensum Tracker API",
    description="API para analizar el avance académico de estudiantes UFPSO",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_cors_origins(),
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
