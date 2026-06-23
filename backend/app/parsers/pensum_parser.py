"""Parser para el PDF del Pensum de la UFPSO.

El PDF tiene una tabla por semestre con columnas:
SEM | CODIGO | NOMBRE | HT | HP | CR | TIPO | REQUISITO | SIMULTANEA | CURSADO
"""
from __future__ import annotations

import re
from io import BytesIO
from pathlib import Path
from typing import BinaryIO

import pdfplumber

from app.models.schemas import MateriaPensum, Pensum


HEADER_EXPECTED = ["SEM", "CODIGO", "NOMBRE"]


def _parse_requisitos(raw: str) -> list[str]:
    """Convierte '0193203,0193204' o '-' en lista de códigos."""
    if not raw or raw.strip() == "-":
        return []
    return [c.strip() for c in raw.split(",") if c.strip() and c.strip() != "-"]


def _is_data_row(row: list) -> bool:
    """Una fila válida tiene un código de 7 dígitos en la columna CODIGO."""
    if not row or len(row) < 7:
        return False
    codigo = (row[1] or "").strip()
    return bool(re.fullmatch(r"\d{7}", codigo))


def _is_header_row(row: list) -> bool:
    if not row or len(row) < 3:
        return False
    return all(
        (row[i] or "").strip().upper() == HEADER_EXPECTED[i] for i in range(3)
    )


def _row_to_materia(row: list) -> MateriaPensum:
    semestre = int(row[0])
    codigo = row[1].strip()
    nombre = " ".join(row[2].split()).title()
    ht = int(row[3])
    hp = int(row[4])
    creditos = int(row[5])
    tipo_raw = (row[6] or "").strip()
    tipo = "ELECTIVA" if tipo_raw == "ELEC" else "OBLIGATORIA"
    prerrequisitos = _parse_requisitos(row[7] if len(row) > 7 else "")
    simultaneas = _parse_requisitos(row[8] if len(row) > 8 else "")
    return MateriaPensum(
        codigo=codigo,
        nombre=nombre,
        creditos=creditos,
        ht=ht,
        hp=hp,
        semestre=semestre,
        tipo=tipo,
        prerrequisitos=prerrequisitos,
        simultaneas=simultaneas,
    )


def _extract_carrera(pdf: pdfplumber.PDF) -> str:
    """Extrae el nombre de la carrera de la primera página."""
    if not pdf.pages:
        return "Desconocida"
    text = pdf.pages[0].extract_text() or ""
    for line in text.splitlines():
        line = line.strip()
        if line and "pensum" not in line.lower() and "fecha" not in line.lower():
            if re.search(r"ingenier|licenciatura|tecnolog|administra", line, re.I):
                return line
    return "Desconocida"


def parse_pensum(source: str | Path | BinaryIO | bytes) -> Pensum:
    """Parsea el PDF del pensum y retorna un objeto Pensum estructurado.

    Acepta una ruta, un file-like, o bytes (útil para uploads HTTP).
    """
    if isinstance(source, (bytes, bytearray)):
        source = BytesIO(source)

    materias: list[MateriaPensum] = []
    with pdfplumber.open(source) as pdf:
        carrera = _extract_carrera(pdf)
        for page in pdf.pages:
            for table in page.extract_tables() or []:
                for row in table:
                    if _is_header_row(row) or not _is_data_row(row):
                        continue
                    try:
                        materias.append(_row_to_materia(row))
                    except (ValueError, IndexError):
                        continue

    # Dedup por código (algunas tablas se repiten entre páginas)
    vistos: dict[str, MateriaPensum] = {}
    for m in materias:
        vistos.setdefault(m.codigo, m)
    return Pensum(carrera=carrera, materias=list(vistos.values()))
