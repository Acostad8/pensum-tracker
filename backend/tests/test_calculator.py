"""Tests del servicio calculator — núcleo de la lógica de negocio.

Cubre:
- match directo por código
- prerrequisitos (puede_cursar)
- satisfacción de slots por electiva del mismo semestre
- satisfacción de slot por hint entre paréntesis
- detección de homologaciones por nombre + créditos
- cálculo de estadísticas (créditos, %, semestres restantes)
- estado REPROBADA no cuenta como aprobada
"""
from __future__ import annotations

from app.services.calculator import analizar

from tests.conftest import (
    make_estudiante,
    make_historial,
    make_materia_cursada,
    make_materia_pensum,
    make_pensum,
)


def _flatten(analisis):
    return [m for sem in analisis.materias_por_semestre.values() for m in sem]


def _by_codigo(analisis, codigo):
    for m in _flatten(analisis):
        if m.codigo == codigo:
            return m
    raise AssertionError(f"materia {codigo} no encontrada")


class TestMatchDirecto:
    def test_materia_aprobada_se_refleja_en_pensum(self, small_pensum):
        historial = make_historial([
            make_materia_cursada("1000001", "Matemáticas I", nota=4.2),
        ])
        analisis = analizar(small_pensum, historial)
        m = _by_codigo(analisis, "1000001")
        assert m.estado == "APROBADA"
        assert m.nota == 4.2

    def test_materia_no_cursada_queda_pendiente(self, small_pensum):
        historial = make_historial([])
        analisis = analizar(small_pensum, historial)
        m = _by_codigo(analisis, "1000001")
        assert m.estado == "PENDIENTE"
        assert m.nota is None

    def test_materia_reprobada_no_se_marca_aprobada(self, small_pensum):
        historial = make_historial([
            make_materia_cursada(
                "1000001", "Matemáticas I", estado="REPROBADA", nota=2.5
            ),
        ])
        analisis = analizar(small_pensum, historial)
        m = _by_codigo(analisis, "1000001")
        assert m.estado == "REPROBADA"
        assert m.nota == 2.5


class TestPuedeCursar:
    def test_sin_prerrequisitos_siempre_puede(self, small_pensum):
        analisis = analizar(small_pensum, make_historial([]))
        assert _by_codigo(analisis, "1000001").puede_cursar is True

    def test_bloqueada_si_falta_prerrequisito(self, small_pensum):
        analisis = analizar(small_pensum, make_historial([]))
        assert _by_codigo(analisis, "1000002").puede_cursar is False

    def test_se_desbloquea_al_aprobar_prerrequisito(self, small_pensum):
        historial = make_historial([
            make_materia_cursada("1000001", "Matemáticas I"),
        ])
        analisis = analizar(small_pensum, historial)
        assert _by_codigo(analisis, "1000002").puede_cursar is True
        assert _by_codigo(analisis, "1000003").puede_cursar is False

    def test_reprobada_no_desbloquea(self, small_pensum):
        historial = make_historial([
            make_materia_cursada("1000001", estado="REPROBADA", nota=2.0),
        ])
        analisis = analizar(small_pensum, historial)
        assert _by_codigo(analisis, "1000002").puede_cursar is False


class TestSlotsElectiva:
    def test_electiva_del_pensum_satisface_slot_mismo_semestre(self, small_pensum):
        historial = make_historial([
            make_materia_cursada("1000011", "Programación Web"),
        ])
        analisis = analizar(small_pensum, historial)
        slot = _by_codigo(analisis, "1000010")
        assert slot.estado == "APROBADA"

    def test_sin_electiva_aprobada_el_slot_queda_pendiente(self, small_pensum):
        analisis = analizar(small_pensum, make_historial([]))
        assert _by_codigo(analisis, "1000010").estado == "PENDIENTE"

    def test_electiva_externa_con_hint_satisface_slot(self):
        """Caso típico: el código no está en el pensum pero el hint del
        paréntesis identifica el slot."""
        pensum = make_pensum([
            make_materia_pensum(
                "1000020", "Electiva Sociohumanística", semestre=4, tipo="OBLIGATORIA"
            ),
            make_materia_pensum(
                "1000021", "Filosofía Política", semestre=4, tipo="ELECTIVA"
            ),
        ])
        # El estudiante aprobó una materia cuyo nombre tiene el hint
        historial = make_historial([
            make_materia_cursada(
                "9999999",
                "Cátedra de Paz (ELECTIVA SOCIOHUMANISTICA)",
                creditos=3,
            ),
        ])
        analisis = analizar(pensum, historial)
        assert _by_codigo(analisis, "1000020").estado == "APROBADA"


class TestHomologaciones:
    def test_materia_externa_por_similitud_de_nombre(self):
        pensum = make_pensum([
            make_materia_pensum(
                "0193304", "Electromagnetismo", creditos=4, semestre=3
            ),
        ])
        # Misma materia con código distinto y nombre casi igual
        historial = make_historial([
            make_materia_cursada(
                "0181315", "Electromagnetismo", creditos=4, nota=3.8
            ),
        ])
        analisis = analizar(pensum, historial)
        m = _by_codigo(analisis, "0193304")
        assert m.estado == "APROBADA"
        assert m.nota == 3.8

    def test_no_homologa_si_creditos_distintos(self):
        pensum = make_pensum([
            make_materia_pensum("0193304", "Electromagnetismo", creditos=4),
        ])
        historial = make_historial([
            make_materia_cursada("0181315", "Electromagnetismo", creditos=3),
        ])
        analisis = analizar(pensum, historial)
        assert _by_codigo(analisis, "0193304").estado == "PENDIENTE"

    def test_no_homologa_si_nombre_muy_distinto(self):
        pensum = make_pensum([
            make_materia_pensum("0193304", "Electromagnetismo", creditos=4),
        ])
        historial = make_historial([
            make_materia_cursada(
                "0181315", "Termodinámica Aplicada", creditos=4
            ),
        ])
        analisis = analizar(pensum, historial)
        assert _by_codigo(analisis, "0193304").estado == "PENDIENTE"

    def test_homologacion_desbloquea_dependientes(self):
        pensum = make_pensum([
            make_materia_pensum("0193304", "Electromagnetismo", creditos=4),
            make_materia_pensum(
                "0193400", "Circuitos", creditos=3, prerrequisitos=["0193304"]
            ),
        ])
        historial = make_historial([
            make_materia_cursada("0181315", "Electromagnetismo", creditos=4),
        ])
        analisis = analizar(pensum, historial)
        assert _by_codigo(analisis, "0193400").puede_cursar is True


class TestEstadisticas:
    def test_porcentaje_avance(self, small_pensum):
        # small_pensum: 4 OBLIGATORIAS de 3 créditos = 12 créditos requeridos
        # Aprobamos M1 (3 créditos) → 25%
        historial = make_historial([
            make_materia_cursada("1000001", "Matemáticas I"),
        ])
        analisis = analizar(small_pensum, historial)
        est = analisis.estadisticas
        assert est.creditos_totales_pensum == 12
        assert est.creditos_aprobados == 3
        assert est.creditos_restantes == 9
        assert est.porcentaje_avance == 25.0

    def test_porcentaje_sin_aprobadas(self, small_pensum):
        analisis = analizar(small_pensum, make_historial([]))
        assert analisis.estadisticas.porcentaje_avance == 0.0
        assert analisis.estadisticas.creditos_aprobados == 0

    def test_conteos_materias(self, small_pensum):
        historial = make_historial([
            make_materia_cursada("1000001", "Matemáticas I"),
            make_materia_cursada("1000002", "Matemáticas II"),
        ])
        analisis = analizar(small_pensum, historial)
        est = analisis.estadisticas
        assert est.materias_aprobadas_count == 2
        # Total = 6 (3 obligatorias + 1 slot + 2 electivas), aprobadas = 2
        assert est.materias_pendientes_count == 4

    def test_semestres_restantes_estimados(self, small_pensum):
        # Aprobó M1 en 2023-1 → 3 créditos / 1 semestre = 3 cr/sem
        # Faltan 9 créditos → ceil(9/3) = 3 semestres
        historial = make_historial([
            make_materia_cursada(
                "1000001", "Matemáticas I", periodo="2023-1"
            ),
        ])
        analisis = analizar(small_pensum, historial)
        assert analisis.estadisticas.semestres_restantes_estimados == 3

    def test_semestres_restantes_cero_si_no_hay_periodos(self, small_pensum):
        historial = make_historial([])
        analisis = analizar(small_pensum, historial)
        assert analisis.estadisticas.semestres_restantes_estimados == 0

    def test_creditos_aprobados_usa_valor_oficial_si_existe(self, small_pensum):
        """El backend confía en el valor oficial del historial (que puede
        diferir de la suma manual por homologaciones registradas en SIA)."""
        estudiante = make_estudiante(creditos_aprobados=42)
        historial = make_historial(
            [make_materia_cursada("1000001", "Matemáticas I")],
            estudiante=estudiante,
        )
        analisis = analizar(small_pensum, historial)
        assert analisis.estadisticas.creditos_aprobados == 42
