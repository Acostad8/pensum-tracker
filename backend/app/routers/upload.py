"""Router con los endpoints de subida y análisis de PDFs."""
import asyncio
import logging

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status
from fastapi.concurrency import run_in_threadpool

from app.models.schemas import AnalisisCompleto
from app.parsers.historial_parser import parse_historial
from app.parsers.pensum_parser import parse_pensum
from app.rate_limit import ANALYZE_RATE_LIMIT, limiter
from app.services.calculator import analizar
from app.services.pdf_detector import TipoPdfInesperado
from app.services.timing import timed


router = APIRouter(prefix="/api", tags=["analysis"])
logger = logging.getLogger("pensum.upload")

# Límite de tamaño por archivo: 10 MB. Un PDF académico real pesa <2 MB,
# márgen de seguridad x5 contra abuso/DoS.
MAX_PDF_SIZE = 10 * 1024 * 1024
READ_CHUNK_SIZE = 64 * 1024  # 64 KB por chunk


def _validate_pdf(file: UploadFile) -> None:
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"El archivo '{file.filename}' no es un PDF.",
        )


async def _read_with_limit(file: UploadFile, label: str) -> bytes:
    """Lee el upload en chunks abortando si excede MAX_PDF_SIZE.

    Esto evita cargar 1 GB en RAM si un cliente malicioso envía un payload
    enorme — la versión anterior leía todo con `await file.read()` y
    validaba después, demasiado tarde.
    """
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await file.read(READ_CHUNK_SIZE)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_PDF_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=(
                    f"El archivo '{label}' excede el tamaño máximo permitido de "
                    f"{MAX_PDF_SIZE // (1024 * 1024)} MB."
                ),
            )
        chunks.append(chunk)
    return b"".join(chunks)


def _raise_tipo_error(pensum_err: bool, historial_err: bool) -> None:
    """Mapea errores de tipo a HTTPException con mensajes amigables."""
    if pensum_err and historial_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Parece que invertiste los archivos: subiste el reporte de "
                "notas como pénsum y viceversa. Intercámbialos."
            ),
        )
    if pensum_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "El archivo subido como pénsum parece ser un reporte de notas. "
                "Sube el pénsum de tu carrera en esa zona."
            ),
        )
    if historial_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "El archivo subido como historial parece ser un pénsum. "
                "Sube el reporte de notas acumuladas en esa zona."
            ),
        )


@router.post("/analyze", response_model=AnalisisCompleto)
@limiter.limit(ANALYZE_RATE_LIMIT)
async def analyze(
    request: Request,
    pensum: UploadFile = File(..., description="PDF del pénsum de la carrera"),
    historial: UploadFile = File(..., description="PDF del reporte de notas acumuladas"),
) -> AnalisisCompleto:
    """Recibe los dos PDFs, los parsea en paralelo y devuelve el análisis completo."""
    _validate_pdf(pensum)
    _validate_pdf(historial)

    with timed("total") as total:
        with timed("read_uploads"):
            pensum_bytes, historial_bytes = await asyncio.gather(
                _read_with_limit(pensum, pensum.filename or "pensum"),
                _read_with_limit(historial, historial.filename or "historial"),
            )

        # Parseo en paralelo desde el thread pool: pdfplumber es CPU-bound y
        # síncrono. Sin esto bloqueaba el event loop y los dos PDFs corrían en
        # serie. Cada parser detecta internamente su tipo y lanza
        # TipoPdfInesperado si el contenido no corresponde a su zona.
        with timed("parse_pdfs_parallel"):
            results = await asyncio.gather(
                run_in_threadpool(parse_pensum, pensum_bytes),
                run_in_threadpool(parse_historial, historial_bytes),
                return_exceptions=True,
            )
        pensum_result, historial_result = results

        pensum_tipo_err = isinstance(pensum_result, TipoPdfInesperado)
        historial_tipo_err = isinstance(historial_result, TipoPdfInesperado)
        if pensum_tipo_err or historial_tipo_err:
            _raise_tipo_error(pensum_tipo_err, historial_tipo_err)

        if isinstance(pensum_result, Exception):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Error al parsear el pénsum: {pensum_result}",
            ) from pensum_result
        if isinstance(historial_result, Exception):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Error al parsear el historial: {historial_result}",
            ) from historial_result

        pensum_data = pensum_result
        historial_data = historial_result

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

        with timed("analizar"):
            analisis = analizar(pensum_data, historial_data)

    logger.info(
        "analyze ok | pensum=%d materias | historial=%d materias | total=%.1f ms",
        len(pensum_data.materias),
        len(historial_data.materias_cursadas),
        total["elapsed_ms"],
    )
    return analisis


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
