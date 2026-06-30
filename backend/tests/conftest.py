"""Fixtures compartidos para los tests del backend.

Construimos objetos Pensum / Historial directamente en Python, evitando
depender de PDFs reales para los tests de lógica de negocio (calculator).
Los parsers se prueban aparte con datos minimalistas o mocks de pdfplumber.
"""
from __future__ import annotations

from typing import Any

import pytest

from app.models.schemas import (
    Historial,
    InfoEstudiante,
    MateriaCursada,
    MateriaPensum,
    Pensum,
)


def make_materia_pensum(
    codigo: str,
    nombre: str = "Materia",
    creditos: int = 3,
    semestre: int = 1,
    tipo: str = "OBLIGATORIA",
    prerrequisitos: list[str] | None = None,
    simultaneas: list[str] | None = None,
    ht: int = 2,
    hp: int = 2,
) -> MateriaPensum:
    return MateriaPensum(
        codigo=codigo,
        nombre=nombre,
        creditos=creditos,
        ht=ht,
        hp=hp,
        semestre=semestre,
        tipo=tipo,
        prerrequisitos=prerrequisitos or [],
        simultaneas=simultaneas or [],
    )


def make_materia_cursada(
    codigo: str,
    nombre: str = "Materia",
    creditos: int = 3,
    estado: str = "APROBADA",
    nota: float = 4.0,
    periodo: str = "2023-1",
    ht: int = 2,
    hp: int = 2,
) -> MateriaCursada:
    return MateriaCursada(
        codigo=codigo,
        nombre=nombre,
        creditos=creditos,
        ht=ht,
        hp=hp,
        nota_definitiva=nota,
        estado=estado,
        periodo_cursado=periodo,
    )


def make_estudiante(**overrides: Any) -> InfoEstudiante:
    defaults = {
        "nombre": "Juan Perez",
        "codigo": "1900001",
        "pensum": "F",
        "carrera": "Ingeniería de Sistemas",
        "creditos_cursados": 0,
        "creditos_aprobados": 0,
        "promedio_acumulado": 0.0,
    }
    defaults.update(overrides)
    return InfoEstudiante(**defaults)


def make_pensum(
    materias: list[MateriaPensum],
    carrera: str = "Ingeniería de Sistemas",
) -> Pensum:
    return Pensum(carrera=carrera, materias=materias)


def make_historial(
    materias: list[MateriaCursada],
    estudiante: InfoEstudiante | None = None,
) -> Historial:
    if estudiante is None:
        estudiante = make_estudiante(
            creditos_aprobados=sum(m.creditos for m in materias if m.estado == "APROBADA"),
        )
    return Historial(estudiante=estudiante, materias_cursadas=materias)


@pytest.fixture
def small_pensum() -> Pensum:
    """Pensum pequeño con cadena de prerrequisitos y una electiva con slot.

    Semestre 1: Matemáticas I (M1)
    Semestre 2: Matemáticas II (M2, requiere M1)
    Semestre 3: Matemáticas III (M3, requiere M2)
    Semestre 5: Electiva Técnica I (slot obligatorio)
    """
    return make_pensum([
        make_materia_pensum("1000001", "Matemáticas I", semestre=1),
        make_materia_pensum(
            "1000002", "Matemáticas II", semestre=2, prerrequisitos=["1000001"]
        ),
        make_materia_pensum(
            "1000003", "Matemáticas III", semestre=3, prerrequisitos=["1000002"]
        ),
        make_materia_pensum(
            "1000010", "Electiva Técnica I", semestre=5, tipo="OBLIGATORIA"
        ),
        make_materia_pensum(
            "1000011", "Programación Web", semestre=5, tipo="ELECTIVA"
        ),
        make_materia_pensum(
            "1000012", "Inteligencia Artificial", semestre=5, tipo="ELECTIVA"
        ),
    ])
