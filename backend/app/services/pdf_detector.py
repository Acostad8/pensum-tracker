"""Detecta el tipo de un PDF (pensum vs historial) leyendo la primera página.

Se opera sobre un `pdfplumber.PDF` ya abierto para evitar reabrir el documento
(cada `pdfplumber.open` reparsea XRef y estructura de páginas). El detector
se invoca desde dentro de cada parser, reutilizando el handle abierto.
"""
from __future__ import annotations

from typing import Literal

import pdfplumber


PdfType = Literal["pensum", "historial", "unknown"]


class TipoPdfInesperado(ValueError):
    """Se subió un PDF cuyo contenido no corresponde a la zona esperada."""

    def __init__(self, esperado: PdfType, detectado: PdfType) -> None:
        self.esperado = esperado
        self.detectado = detectado
        super().__init__(
            f"PDF inesperado: se esperaba '{esperado}', se detectó '{detectado}'"
        )


def detect_pdf_type_from_pdf(pdf: pdfplumber.PDF) -> PdfType:
    """Detecta el tipo del PDF inspeccionando palabras clave de la primera página."""
    if not pdf.pages:
        return "unknown"
    text = (pdf.pages[0].extract_text() or "").lower()

    if "reporte de notas" in text or "promedio acumulado" in text:
        return "historial"
    if ("pénsum" in text or "pensum" in text) and (
        "requisito" in text or "simultanea" in text
    ):
        return "pensum"
    return "unknown"
