"""Servicio que cruza el pensum con el historial para producir el análisis completo.

Reglas principales:
- Cada materia del pensum se enriquece con su estado del historial (por código).
- Las electivas tomadas marcan automáticamente su slot obligatorio
  correspondiente (e.g., 0193207 satisface el slot 0193206 "Electiva técnica I").
- Una materia "puede cursarse" si todos sus prerrequisitos están aprobados.
- Las estadísticas se calculan sobre créditos obligatorios + 1 elección por slot.
"""
from __future__ import annotations

import math
import re
from typing import Iterable

from app.models.schemas import (
    AnalisisCompleto,
    EstadisticasEstudiante,
    EstadoMateria,
    Historial,
    MateriaCursada,
    MateriaEstado,
    MateriaPensum,
    Pensum,
)


PAREN_HINT = re.compile(r"\(([^)]+)\)")
ELECTIVA_RE = re.compile(r"electiva", re.IGNORECASE)


def _normalize(text: str) -> str:
    """Quita tildes y baja a minúsculas para comparaciones flexibles."""
    replacements = str.maketrans("áéíóúÁÉÍÓÚñÑ", "aeiouAEIOUnN")
    return text.translate(replacements).lower().strip()


def _slot_name(materia: MateriaPensum) -> str | None:
    """Si la materia es un slot obligatorio de electiva, devuelve su nombre normalizado."""
    if materia.tipo == "OBLIGATORIA" and ELECTIVA_RE.search(materia.nombre):
        return _normalize(materia.nombre)
    return None


def _elective_hint(materia: MateriaCursada) -> str | None:
    """Extrae el hint entre paréntesis (ej. 'ELECTIVA TÉCNICA I')."""
    match = PAREN_HINT.search(materia.nombre)
    if match:
        return _normalize(match.group(1))
    return None


def _build_slot_satisfactions(
    pensum: Pensum,
    aprobadas: dict[str, MateriaCursada],
) -> dict[str, MateriaCursada]:
    """Mapea código de slot obligatorio → la electiva aprobada que lo satisface."""
    slots_por_sem: dict[int, list[MateriaPensum]] = {}
    for m in pensum.materias:
        if _slot_name(m):
            slots_por_sem.setdefault(m.semestre, []).append(m)

    satisfecho: dict[str, MateriaCursada] = {}
    pensum_codigos = {m.codigo for m in pensum.materias}

    for cursada in aprobadas.values():
        if cursada.estado != "APROBADA":
            continue
        # Caso 1: la materia aprobada ES el slot (raro pero posible)
        if cursada.codigo in {m.codigo for sl in slots_por_sem.values() for m in sl}:
            satisfecho[cursada.codigo] = cursada
            continue

        # Caso 2: es una ELECTIVA del pensum → satisface el slot de su mismo semestre
        materia_pensum = next(
            (m for m in pensum.materias if m.codigo == cursada.codigo),
            None,
        )
        if materia_pensum and materia_pensum.tipo == "ELECTIVA":
            slots_sem = slots_por_sem.get(materia_pensum.semestre, [])
            slot_match = _match_slot_by_hint(cursada, slots_sem)
            if slot_match and slot_match.codigo not in satisfecho:
                satisfecho[slot_match.codigo] = cursada
            continue

        # Caso 3: materia en historial que no está en el pensum (homologada)
        # Buscar slot por hint del paréntesis en cualquier semestre
        if cursada.codigo not in pensum_codigos:
            all_slots = [m for sl in slots_por_sem.values() for m in sl]
            slot_match = _match_slot_by_hint(cursada, all_slots)
            if slot_match and slot_match.codigo not in satisfecho:
                satisfecho[slot_match.codigo] = cursada

    return satisfecho


def _match_slot_by_hint(
    cursada: MateriaCursada,
    slots: Iterable[MateriaPensum],
) -> MateriaPensum | None:
    """Empareja una electiva con su slot por:
    1. hint del paréntesis en el nombre de la cursada.
    2. si hay un único slot disponible en el semestre, lo usa.
    """
    slots_list = list(slots)
    if not slots_list:
        return None

    hint = _elective_hint(cursada)
    if hint:
        for slot in slots_list:
            slot_name = _slot_name(slot)
            if slot_name and (slot_name in hint or hint in slot_name):
                return slot

    if len(slots_list) == 1:
        return slots_list[0]
    return None


def _build_materia_estado(
    materia: MateriaPensum,
    cursada: MateriaCursada | None,
    slot_satisfactor: MateriaCursada | None,
    aprobadas_codes: set[str],
) -> MateriaEstado:
    if cursada and cursada.estado == "APROBADA":
        estado: EstadoMateria = "APROBADA"
        nota = cursada.nota_definitiva
        periodo = cursada.periodo_cursado
    elif slot_satisfactor:
        estado = "APROBADA"
        nota = slot_satisfactor.nota_definitiva
        periodo = slot_satisfactor.periodo_cursado
    elif cursada and cursada.estado == "REPROBADA":
        estado = "REPROBADA"
        nota = cursada.nota_definitiva
        periodo = cursada.periodo_cursado
    else:
        estado = "PENDIENTE"
        nota = None
        periodo = None

    puede_cursar = all(prereq in aprobadas_codes for prereq in materia.prerrequisitos)

    return MateriaEstado(
        codigo=materia.codigo,
        nombre=materia.nombre,
        creditos=materia.creditos,
        semestre=materia.semestre,
        tipo=materia.tipo,
        prerrequisitos=materia.prerrequisitos,
        estado=estado,
        nota=nota,
        periodo_cursado=periodo,
        puede_cursar=puede_cursar,
    )


def _calcular_creditos_requeridos(pensum: Pensum) -> int:
    """Suma créditos obligatorios. Los slots de electiva ya están incluidos
    como OBLIGATORIA en el pensum, así que no hay doble conteo."""
    return sum(m.creditos for m in pensum.materias if m.tipo == "OBLIGATORIA")


def analizar(pensum: Pensum, historial: Historial) -> AnalisisCompleto:
    aprobadas_by_code = {m.codigo: m for m in historial.materias_cursadas}
    aprobadas_codes = {
        m.codigo for m in historial.materias_cursadas if m.estado == "APROBADA"
    }

    slot_satisfactions = _build_slot_satisfactions(pensum, aprobadas_by_code)
    # Las electivas que satisfacen un slot también deben considerarse aprobadas
    # para que el slot quede en verde y los prerrequisitos basados en él funcionen.
    aprobadas_codes_extendido = set(aprobadas_codes) | set(slot_satisfactions.keys())

    estados: list[MateriaEstado] = []
    for materia in pensum.materias:
        cursada = aprobadas_by_code.get(materia.codigo)
        slot_satisfactor = slot_satisfactions.get(materia.codigo)
        estados.append(
            _build_materia_estado(
                materia, cursada, slot_satisfactor, aprobadas_codes_extendido
            )
        )

    materias_por_semestre: dict[int, list[MateriaEstado]] = {}
    for est in estados:
        materias_por_semestre.setdefault(est.semestre, []).append(est)

    creditos_totales = _calcular_creditos_requeridos(pensum)
    creditos_aprobados = historial.estudiante.creditos_aprobados or sum(
        m.creditos for m in historial.materias_cursadas if m.estado == "APROBADA"
    )
    creditos_restantes = max(0, creditos_totales - creditos_aprobados)
    porcentaje = (
        (creditos_aprobados / creditos_totales) * 100 if creditos_totales else 0.0
    )

    periodos = {
        m.periodo_cursado
        for m in historial.materias_cursadas
        if m.periodo_cursado and m.periodo_cursado != "desconocido"
    }
    semestres_cursados = len(periodos)
    promedio_cr_sem = (
        creditos_aprobados / semestres_cursados if semestres_cursados else 0.0
    )
    semestres_restantes = (
        math.ceil(creditos_restantes / promedio_cr_sem) if promedio_cr_sem > 0 else 0
    )

    aprobadas_count = sum(1 for e in estados if e.estado == "APROBADA")
    pendientes_count = sum(1 for e in estados if e.estado == "PENDIENTE")

    estadisticas = EstadisticasEstudiante(
        estudiante=historial.estudiante,
        creditos_totales_pensum=creditos_totales,
        creditos_aprobados=creditos_aprobados,
        creditos_restantes=creditos_restantes,
        porcentaje_avance=round(porcentaje, 2),
        promedio_acumulado=historial.estudiante.promedio_acumulado,
        semestres_cursados=semestres_cursados,
        promedio_creditos_por_semestre=round(promedio_cr_sem, 2),
        semestres_restantes_estimados=semestres_restantes,
        materias_aprobadas_count=aprobadas_count,
        materias_pendientes_count=pendientes_count,
    )

    return AnalisisCompleto(
        pensum_carrera=pensum.carrera,
        estadisticas=estadisticas,
        materias_por_semestre=materias_por_semestre,
    )
