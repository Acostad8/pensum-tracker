"""Entry point de la API FastAPI."""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import upload


# Regex para localhost en cualquier puerto. Útil en desarrollo cuando Vite
# elige un puerto distinto al 5173 (5174, 5175, etc. si hay instancias paralelas).
LOCALHOST_REGEX = r"https?://(localhost|127\.0\.0\.1)(:\d+)?"


def _build_cors_origins() -> list[str]:
    """Dominios explícitos permitidos en producción.
    En dev cualquier localhost funciona vía `allow_origin_regex`.
    """
    extra = os.getenv("CORS_ORIGINS", "")
    return [o.strip() for o in extra.split(",") if o.strip()]


app = FastAPI(
    title="Pensum Tracker API",
    description="API para analizar el avance académico de estudiantes UFPSO",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_cors_origins(),
    allow_origin_regex=LOCALHOST_REGEX,
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
