"""Router con los endpoints de subida y análisis de PDFs."""
from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.models.schemas import AnalisisCompleto
from app.parsers.historial_parser import parse_historial
from app.parsers.pensum_parser import parse_pensum
from app.services.calculator import analizar
from app.services.pdf_detector import detect_pdf_type


router = APIRouter(prefix="/api", tags=["analysis"])

# Límite de tamaño por archivo: 10 MB. Un PDF académico real pesa <2 MB,
# márgen de seguridad x5 contra abuso/DoS.
MAX_PDF_SIZE = 10 * 1024 * 1024


def _validate_pdf(file: UploadFile) -> None:
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"El archivo '{file.filename}' no es un PDF.",
        )


def _validate_size(data: bytes, label: str) -> None:
    if len(data) > MAX_PDF_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"El archivo '{label}' excede el tamaño máximo permitido de "
                f"{MAX_PDF_SIZE // (1024 * 1024)} MB."
            ),
        )


def _validate_pdf_types(pensum_bytes: bytes, historial_bytes: bytes) -> None:
    pensum_type = detect_pdf_type(pensum_bytes)
    historial_type = detect_pdf_type(historial_bytes)

    if pensum_type == "historial" and historial_type == "pensum":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Parece que invertiste los archivos: subiste el reporte de "
                "notas como pénsum y viceversa. Intercámbialos."
            ),
        )
    if pensum_type == "historial":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "El archivo subido como pénsum parece ser un reporte de notas. "
                "Sube el pénsum de tu carrera en esa zona."
            ),
        )
    if historial_type == "pensum":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "El archivo subido como historial parece ser un pénsum. "
                "Sube el reporte de notas acumuladas en esa zona."
            ),
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

    _validate_size(pensum_bytes, pensum.filename or "pensum")
    _validate_size(historial_bytes, historial.filename or "historial")

    _validate_pdf_types(pensum_bytes, historial_bytes)

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
