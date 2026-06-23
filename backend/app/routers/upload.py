"""Router con los endpoints de subida y análisis de PDFs."""
from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.models.schemas import AnalisisCompleto
from app.parsers.historial_parser import parse_historial
from app.parsers.pensum_parser import parse_pensum
from app.services.calculator import analizar


router = APIRouter(prefix="/api", tags=["analysis"])


def _validate_pdf(file: UploadFile) -> None:
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"El archivo '{file.filename}' no es un PDF.",
        )


@router.post("/analyze", response_model=AnalisisCompleto)
async def analyze(
    pensum: UploadFile = File(..., description="PDF del pénsum de la carrera"),
    historial: UploadFile = File(..., description="PDF del reporte de notas acumuladas"),
) -> AnalisisCompleto:
    """Recibe los dos PDFs, los parsea y devuelve el análisis completo."""
    _validate_pdf(pensum)
    _validate_pdf(historial)

    pensum_bytes = await pensum.read()
    historial_bytes = await historial.read()

    try:
        pensum_data = parse_pensum(pensum_bytes)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error al parsear el pénsum: {exc}",
        ) from exc

    try:
        historial_data = parse_historial(historial_bytes)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error al parsear el historial: {exc}",
        ) from exc

    if not pensum_data.materias:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se pudieron extraer materias del pénsum.",
        )
    if not historial_data.materias_cursadas:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se pudieron extraer materias del historial.",
        )

    return analizar(pensum_data, historial_data)


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
