"""Modelos Pydantic compartidos entre parsers, servicios y API."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


TipoMateria = Literal["OBLIGATORIA", "ELECTIVA"]
EstadoMateria = Literal["APROBADA", "PENDIENTE", "EN_CURSO", "REPROBADA"]


class MateriaPensum(BaseModel):
    codigo: str
    nombre: str
    creditos: int
    ht: int = Field(description="Horas teóricas")
    hp: int = Field(description="Horas prácticas")
    semestre: int = Field(ge=1, le=10)
    tipo: TipoMateria
    prerrequisitos: list[str] = Field(default_factory=list)
    simultaneas: list[str] = Field(default_factory=list)


class MateriaCursada(BaseModel):
    codigo: str
    nombre: str
    creditos: int
    ht: int
    hp: int
    nota_definitiva: float
    nota_habilitacion: float | None = None
    estado: EstadoMateria
    periodo_cursado: str = Field(description="Ej. '2023-2'")


class InfoEstudiante(BaseModel):
    nombre: str
    codigo: str
    pensum: str
    carrera: str
    creditos_cursados: int
    creditos_aprobados: int
    promedio_acumulado: float


class Pensum(BaseModel):
    carrera: str
    materias: list[MateriaPensum]

    @property
    def total_creditos(self) -> int:
        return sum(m.creditos for m in self.materias)

    @property
    def total_creditos_obligatorios(self) -> int:
        return sum(m.creditos for m in self.materias if m.tipo == "OBLIGATORIA")


class Historial(BaseModel):
    estudiante: InfoEstudiante
    materias_cursadas: list[MateriaCursada]


class MateriaEstado(BaseModel):
    """Una materia del pensum enriquecida con su estado para el estudiante."""
    codigo: str
    nombre: str
    creditos: int
    semestre: int
    tipo: TipoMateria
    prerrequisitos: list[str]
    estado: EstadoMateria
    nota: float | None = None
    periodo_cursado: str | None = None
    puede_cursar: bool = Field(
        description="True si el estudiante ya cumple los prerrequisitos"
    )


class EstadisticasEstudiante(BaseModel):
    estudiante: InfoEstudiante
    creditos_totales_pensum: int
    creditos_aprobados: int
    creditos_restantes: int
    porcentaje_avance: float
    promedio_acumulado: float
    semestres_cursados: int
    promedio_creditos_por_semestre: float
    semestres_restantes_estimados: int
    materias_aprobadas_count: int
    materias_pendientes_count: int


class AnalisisCompleto(BaseModel):
    """Respuesta principal del endpoint de análisis."""
    pensum_carrera: str
    estadisticas: EstadisticasEstudiante
    materias_por_semestre: dict[int, list[MateriaEstado]]
