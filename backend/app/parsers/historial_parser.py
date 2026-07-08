"""Parser para el PDF del historial académico (Reporte de notas acumuladas).

El PDF contiene una marca de agua diagonal "Reporte NO válido como certificado"
renderizada como caracteres individuales en Helvetica-Bold, mientras que los
datos reales están en Helvetica regular. Filtramos por fontname para
eliminar la marca de agua de forma confiable.
"""
from __future__ import annotations

import re
from io import BytesIO
from pathlib import Path
from typing import BinaryIO

import pdfplumber

from app.models.schemas import (
    EstadoMateria,
    Historial,
    InfoEstudiante,
    MateriaCursada,
)
from app.services.pdf_detector import (
    TipoPdfInesperado,
    detect_pdf_type_from_pdf,
)


DATA_FONTS = {"Helvetica", "Helvetica-Oblique"}
LINE_TOLERANCE = 3.0  # Tolerancia en píxeles para agrupar palabras en la misma línea

SEMESTER_HEADER = re.compile(r"Semestre\s+(\d{4})\s*-\s*(\d)", re.IGNORECASE)
SUBJECT_LINE = re.compile(
    r"""^
    (?P<codigo>\d{7})\s*
    (?P<nombre>.+?)\s+
    (?P<creditos>\d+)\s+
    (?P<ht>\d+)\s+
    (?P<hp>\d+)\s+
    (?P<definitiva>\d+\.\d+)
    (?:\s+(?P<habilitacion>\d+\.\d+))?
    \s+(?P<estado>APROBADA|REPROBADA|NO\s*APROBADA|PENDIENTE|CURSANDO|HABILITADA)
    \s*$
    """,
    re.IGNORECASE | re.VERBOSE,
)
NOMBRE_FIELD = re.compile(r"Nombre\s*:\s*(.+?)(?:\s+C[óo]digo|$)", re.IGNORECASE)
CODIGO_FIELD = re.compile(r"C[óo]digo\s*:\s*(\d+)", re.IGNORECASE)
PENSUM_FIELD = re.compile(r"Pens?um\s*:\s*(\S+)", re.IGNORECASE)
CREDITOS_PROMEDIO = re.compile(
    r"(?P<cursados>\d+)\s+(?P<aprobados>\d+)\s+(?P<promedio>\d+\.\d+)"
)


def _extract_data_lines(pdf: pdfplumber.PDF) -> list[str]:
    """Extrae líneas de texto agrupando palabras por coordenada Y, filtrando watermark."""
    all_lines: list[str] = []
    for page in pdf.pages:
        words = page.extract_words(extra_attrs=["fontname"]) or []
        data_words = [w for w in words if w.get("fontname") in DATA_FONTS]
        if not data_words:
            continue

        # Agrupa palabras por línea (Y similar) y ordena por X dentro de cada línea
        data_words.sort(key=lambda w: (round(w["top"] / LINE_TOLERANCE), w["x0"]))
        lines: list[list[dict]] = []
        for word in data_words:
            if lines and abs(word["top"] - lines[-1][0]["top"]) <= LINE_TOLERANCE:
                lines[-1].append(word)
            else:
                lines.append([word])

        for line in lines:
            line.sort(key=lambda w: w["x0"])
            text = " ".join(w["text"] for w in line)
            all_lines.append(text)
    return all_lines


def _normalize_estado(estado_raw: str) -> EstadoMateria:
    e = estado_raw.upper().replace(" ", "")
    if e in ("APROBADA", "HABILITADA"):
        return "APROBADA"
    if e in ("REPROBADA", "NOAPROBADA"):
        return "REPROBADA"
    if e == "CURSANDO":
        return "EN_CURSO"
    return "PENDIENTE"


def _parse_subject_line(line: str, periodo: str) -> MateriaCursada | None:
    match = SUBJECT_LINE.match(line)
    if not match:
        return None
    return MateriaCursada(
        codigo=match["codigo"],
        nombre=" ".join(match["nombre"].split()).title(),
        creditos=int(match["creditos"]),
        ht=int(match["ht"]),
        hp=int(match["hp"]),
        nota_definitiva=float(match["definitiva"]),
        nota_habilitacion=float(match["habilitacion"]) if match["habilitacion"] else None,
        estado=_normalize_estado(match["estado"]),
        periodo_cursado=periodo,
    )


def _extract_info_estudiante(full_text: str, carrera: str) -> InfoEstudiante:
    nombre_match = NOMBRE_FIELD.search(full_text)
    codigo_match = CODIGO_FIELD.search(full_text)
    pensum_match = PENSUM_FIELD.search(full_text)
    creditos_match = CREDITOS_PROMEDIO.search(full_text)

    return InfoEstudiante(
        nombre=nombre_match.group(1).strip().title() if nombre_match else "Desconocido",
        codigo=codigo_match.group(1) if codigo_match else "",
        pensum=pensum_match.group(1) if pensum_match else "",
        carrera=carrera,
        creditos_cursados=int(creditos_match.group("cursados")) if creditos_match else 0,
        creditos_aprobados=int(creditos_match.group("aprobados")) if creditos_match else 0,
        promedio_acumulado=float(creditos_match.group("promedio")) if creditos_match else 0.0,
    )


# Misma lista de familias de programas que el pensum_parser. La duplicación
# es intencional: cada parser es autocontenido para que ninguno dependa del
# otro a nivel de imports.
_CARRERA_KEYWORDS = re.compile(
    r"ingenier|licenciatura|tecnolog|administra|contadur|"
    r"derecho|zootecn|medic|comunicaci|trabajo\s+social|"
    r"arquitect|enferm|odontol|psicol|econom|biolog|"
    r"matem[áa]tic|f[íi]sic|qu[íi]mic|filosof[íi]a",
    re.I,
)


def _extract_carrera(lines: list[str]) -> str:
    for line in lines:
        if _CARRERA_KEYWORDS.search(line):
            return line.strip()
    return "Desconocida"


def parse_historial(source: str | Path | BinaryIO | bytes) -> Historial:
    """Parsea el PDF del historial académico y retorna un objeto Historial."""
    if isinstance(source, (bytes, bytearray)):
        source = BytesIO(source)

    with pdfplumber.open(source) as pdf:
        tipo = detect_pdf_type_from_pdf(pdf)
        if tipo == "pensum":
            raise TipoPdfInesperado(esperado="historial", detectado="pensum")
        lines = _extract_data_lines(pdf)

    full_text = "\n".join(lines)
    carrera = _extract_carrera(lines)
    estudiante = _extract_info_estudiante(full_text, carrera)

    materias: list[MateriaCursada] = []
    periodo_actual = "desconocido"
    for line in lines:
        sem_match = SEMESTER_HEADER.search(line)
        if sem_match:
            periodo_actual = f"{sem_match.group(1)}-{sem_match.group(2)}"
            continue
        materia = _parse_subject_line(line, periodo_actual)
        if materia:
            materias.append(materia)

    # Dedup por código (mantiene la primera ocurrencia)
    vistos: dict[str, MateriaCursada] = {}
    for m in materias:
        vistos.setdefault(m.codigo, m)

    return Historial(estudiante=estudiante, materias_cursadas=list(vistos.values()))
