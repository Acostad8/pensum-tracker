"""Tests de las funciones puras del historial_parser."""
from __future__ import annotations

from app.parsers.historial_parser import (
    _extract_info_estudiante,
    _normalize_estado,
    _parse_subject_line,
)


class TestNormalizeEstado:
    def test_aprobada(self):
        assert _normalize_estado("APROBADA") == "APROBADA"

    def test_habilitada_cuenta_como_aprobada(self):
        assert _normalize_estado("HABILITADA") == "APROBADA"

    def test_reprobada(self):
        assert _normalize_estado("REPROBADA") == "REPROBADA"

    def test_no_aprobada_con_espacio(self):
        assert _normalize_estado("NO APROBADA") == "REPROBADA"

    def test_cursando(self):
        assert _normalize_estado("CURSANDO") == "EN_CURSO"

    def test_desconocido_es_pendiente(self):
        assert _normalize_estado("LO_QUE_SEA") == "PENDIENTE"


class TestParseSubjectLine:
    def test_linea_aprobada_simple(self):
        line = "0193101 Cálculo Diferencial 5 4 2 4.20 APROBADA"
        m = _parse_subject_line(line, "2023-1")
        assert m is not None
        assert m.codigo == "0193101"
        assert m.nombre == "Cálculo Diferencial"
        assert m.creditos == 5
        assert m.ht == 4
        assert m.hp == 2
        assert m.nota_definitiva == 4.20
        assert m.estado == "APROBADA"
        assert m.periodo_cursado == "2023-1"
        assert m.nota_habilitacion is None

    def test_linea_con_habilitacion(self):
        line = "0193101 Cálculo 5 4 2 2.50 3.10 HABILITADA"
        m = _parse_subject_line(line, "2023-2")
        assert m is not None
        assert m.nota_definitiva == 2.50
        assert m.nota_habilitacion == 3.10
        assert m.estado == "APROBADA"  # HABILITADA normaliza a APROBADA

    def test_linea_reprobada(self):
        line = "0193101 Cálculo 5 4 2 2.10 REPROBADA"
        m = _parse_subject_line(line, "2022-1")
        assert m is not None
        assert m.estado == "REPROBADA"

    def test_linea_no_aprobada(self):
        line = "0193101 Cálculo 5 4 2 1.50 NO APROBADA"
        m = _parse_subject_line(line, "2022-1")
        assert m is not None
        assert m.estado == "REPROBADA"

    def test_nombre_con_varias_palabras(self):
        line = "0193205 Programación Orientada A Objetos 4 2 2 3.80 APROBADA"
        m = _parse_subject_line(line, "2023-1")
        assert m is not None
        assert m.nombre == "Programación Orientada A Objetos"

    def test_linea_sin_match_retorna_none(self):
        assert _parse_subject_line("Linea cualquiera sin estructura", "2023-1") is None
        assert _parse_subject_line("Pie de página página 1 de 3", "2023-1") is None
        assert _parse_subject_line("", "2023-1") is None


class TestExtractInfoEstudiante:
    def test_extrae_todos_los_campos(self):
        texto = (
            "Nombre: Juan Perez Rodriguez Código: 1900001 Pensum: F\n"
            "180 145 4.25"
        )
        info = _extract_info_estudiante(texto, "Ingeniería de Sistemas")
        assert info.nombre == "Juan Perez Rodriguez"
        assert info.codigo == "1900001"
        assert info.pensum == "F"
        assert info.creditos_cursados == 180
        assert info.creditos_aprobados == 145
        assert info.promedio_acumulado == 4.25
        assert info.carrera == "Ingeniería de Sistemas"

    def test_campos_faltantes_usan_defaults(self):
        info = _extract_info_estudiante("texto vacio", "Carrera X")
        assert info.nombre == "Desconocido"
        assert info.codigo == ""
        assert info.creditos_aprobados == 0
        assert info.promedio_acumulado == 0.0

    def test_codigo_sin_acento_tambien_funciona(self):
        info = _extract_info_estudiante(
            "Nombre: Maria Lopez Codigo: 2000002 Pensum: G", "X"
        )
        assert info.codigo == "2000002"
        assert info.pensum == "G"
