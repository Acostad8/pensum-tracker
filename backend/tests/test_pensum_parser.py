"""Tests de las funciones puras del pensum_parser."""
from __future__ import annotations

import pytest

from app.parsers.pensum_parser import (
    _is_data_row,
    _is_header_row,
    _parse_requisitos,
    _row_to_materia,
)


class TestParseRequisitos:
    def test_lista_csv(self):
        assert _parse_requisitos("0193203,0193204") == ["0193203", "0193204"]

    def test_un_solo_codigo(self):
        assert _parse_requisitos("0193203") == ["0193203"]

    def test_string_vacio(self):
        assert _parse_requisitos("") == []

    def test_guion_solo(self):
        assert _parse_requisitos("-") == []

    def test_espacios_alrededor(self):
        assert _parse_requisitos("  0193203 , 0193204 ") == ["0193203", "0193204"]

    def test_guiones_entre_codigos_se_filtran(self):
        assert _parse_requisitos("0193203,-,0193204") == ["0193203", "0193204"]


class TestIsDataRow:
    def test_fila_valida(self):
        row = ["1", "0193101", "Cálculo I", "4", "2", "5", "OBLI", "-", "-"]
        assert _is_data_row(row) is True

    def test_codigo_invalido_letras(self):
        row = ["1", "abc1234", "Cálculo", "4", "2", "5", "OBLI", "-", "-"]
        assert _is_data_row(row) is False

    def test_codigo_pocos_digitos(self):
        row = ["1", "123", "Cálculo", "4", "2", "5", "OBLI", "-", "-"]
        assert _is_data_row(row) is False

    def test_fila_corta(self):
        assert _is_data_row(["1", "0193101"]) is False

    def test_fila_vacia(self):
        assert _is_data_row([]) is False

    def test_fila_none(self):
        assert _is_data_row(None) is False


class TestIsHeaderRow:
    def test_header_estandar(self):
        row = ["SEM", "CODIGO", "NOMBRE", "HT", "HP", "CR", "TIPO"]
        assert _is_header_row(row) is True

    def test_header_minuscula(self):
        row = ["sem", "codigo", "nombre", "ht", "hp", "cr", "tipo"]
        assert _is_header_row(row) is True

    def test_no_header_si_es_data(self):
        row = ["1", "0193101", "Cálculo", "4", "2", "5"]
        assert _is_header_row(row) is False


class TestRowToMateria:
    def test_obligatoria_basica(self):
        row = ["1", "0193101", "Cálculo I", "4", "2", "5", "OBLI", "-", "-"]
        m = _row_to_materia(row)
        assert m.codigo == "0193101"
        assert m.nombre == "Cálculo I"
        assert m.creditos == 5
        assert m.ht == 4
        assert m.hp == 2
        assert m.semestre == 1
        assert m.tipo == "OBLIGATORIA"
        assert m.prerrequisitos == []

    def test_electiva_se_detecta_por_tipo_elec(self):
        row = [
            "5", "0193500", "Programación Web", "3", "2", "4",
            "ELEC", "-", "-",
        ]
        m = _row_to_materia(row)
        assert m.tipo == "ELECTIVA"

    def test_prerrequisitos_csv(self):
        row = [
            "3", "0193303", "Cálculo III", "4", "2", "5",
            "OBLI", "0193202,0193203", "-",
        ]
        m = _row_to_materia(row)
        assert m.prerrequisitos == ["0193202", "0193203"]

    def test_simultaneas_csv(self):
        row = [
            "3", "0193303", "Cálculo III", "4", "2", "5",
            "OBLI", "-", "0193304,0193305",
        ]
        m = _row_to_materia(row)
        assert m.simultaneas == ["0193304", "0193305"]

    def test_nombre_se_normaliza_a_title_case(self):
        row = ["1", "0193101", "CÁLCULO  DIFERENCIAL", "4", "2", "5", "OBLI"]
        m = _row_to_materia(row)
        assert m.nombre == "Cálculo Diferencial"

    def test_semestre_fuera_de_rango_falla(self):
        # El rango admitido es 1-14 (cubre tecnologías y medicina).
        row = ["20", "0193101", "X", "4", "2", "5", "OBLI"]
        with pytest.raises(Exception):
            _row_to_materia(row)
