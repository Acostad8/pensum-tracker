"""Detecta el tipo de un PDF (pensum vs historial) leyendo la primera página."""
from __future__ import annotations

from io import BytesIO
from typing import Literal

import pdfplumber


PdfType = Literal["pensum", "historial", "unknown"]


def detect_pdf_type(pdf_bytes: bytes) -> PdfType:
    """Detecta el tipo del PDF por palabras clave en la primera página."""
    try:
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            if not pdf.pages:
                return "unknown"
            text = (pdf.pages[0].extract_text() or "").lower()
    except Exception:  # noqa: BLE001
        return "unknown"

    if "reporte de notas" in text or "promedio acumulado" in text:
        return "historial"
    if "pénsum" in text or "pensum" in text:
        if "requisito" in text or "simultanea" in text:
            return "pensum"
    return "unknown"
