"""Tests del detector de tipo de PDF. Mockeamos pdfplumber.PDF para no
depender de archivos reales — el detector solo inspecciona texto."""
from __future__ import annotations

from unittest.mock import MagicMock

from app.services.pdf_detector import detect_pdf_type_from_pdf


def _fake_pdf(first_page_text: str | None) -> MagicMock:
    pdf = MagicMock()
    if first_page_text is None:
        pdf.pages = []
        return pdf
    page = MagicMock()
    page.extract_text.return_value = first_page_text
    pdf.pages = [page]
    return pdf


def test_detecta_historial_por_reporte_de_notas():
    pdf = _fake_pdf("Reporte de notas acumuladas\nEstudiante: Juan")
    assert detect_pdf_type_from_pdf(pdf) == "historial"


def test_detecta_historial_por_promedio_acumulado():
    pdf = _fake_pdf("Promedio acumulado: 4.20")
    assert detect_pdf_type_from_pdf(pdf) == "historial"


def test_detecta_pensum_con_acento():
    pdf = _fake_pdf("Pénsum de Ingeniería de Sistemas\nRequisito: ...")
    assert detect_pdf_type_from_pdf(pdf) == "pensum"


def test_detecta_pensum_sin_acento():
    pdf = _fake_pdf("Pensum carrera X\nSimultanea con: ...")
    assert detect_pdf_type_from_pdf(pdf) == "pensum"


def test_unknown_si_pensum_sin_keyword_secundaria():
    pdf = _fake_pdf("Pénsum solo, sin nada más")
    assert detect_pdf_type_from_pdf(pdf) == "unknown"


def test_unknown_si_texto_irrelevante():
    pdf = _fake_pdf("Documento cualquiera de la universidad")
    assert detect_pdf_type_from_pdf(pdf) == "unknown"


def test_unknown_si_pdf_sin_paginas():
    pdf = _fake_pdf(None)
    assert detect_pdf_type_from_pdf(pdf) == "unknown"


def test_es_case_insensitive():
    pdf = _fake_pdf("REPORTE DE NOTAS DEL ESTUDIANTE")
    assert detect_pdf_type_from_pdf(pdf) == "historial"
