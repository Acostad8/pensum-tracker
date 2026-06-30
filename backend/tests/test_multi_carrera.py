"""Tests de soporte multi-carrera.

Verifica que:
- El detector de carrera reconoce los programas conocidos de UFPSO.
- El modelo MateriaPensum admite semestres > 10 (medicina ~12).
- El calculator y recommender funcionan con pensums de 6 o 12 semestres.
"""
from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from app.models.schemas import MateriaPensum
from app.parsers.historial_parser import _extract_carrera as extraer_carrera_hist
from app.parsers.pensum_parser import _extract_carrera as extraer_carrera_pens
from app.services.calculator import analizar

from tests.conftest import (
    make_historial,
    make_materia_cursada,
    make_materia_pensum,
    make_pensum,
)


def _pdf_con_primera_pagina(texto: str) -> MagicMock:
    pdf = MagicMock()
    page = MagicMock()
    page.extract_text.return_value = texto
    pdf.pages = [page]
    return pdf


class TestDeteccionCarrera:
    @pytest.mark.parametrize(
        "linea_pdf",
        [
            "Ingeniería de Sistemas",
            "Ingeniería Civil",
            "Ingeniería Electrónica",
            "Licenciatura en Matemáticas",
            "Tecnología en Desarrollo de Software",
            "Administración de Empresas",
            "Contaduría Pública",
            "Derecho",
            "Zootecnia",
            "Comunicación Social",
            "Trabajo Social",
            "Arquitectura",
            "Enfermería",
        ],
    )
    def test_detecta_programas_ufpso_en_pensum(self, linea_pdf):
        pdf = _pdf_con_primera_pagina(f"Pensum\nFecha: 2026\n{linea_pdf}")
        assert extraer_carrera_pens(pdf) == linea_pdf

    def test_detecta_programa_en_historial(self):
        lineas = [
            "Reporte de notas",
            "Estudiante: Juan Perez",
            "Ingeniería Civil",
        ]
        assert extraer_carrera_hist(lineas) == "Ingeniería Civil"

    def test_desconocida_si_no_hay_keyword(self):
        pdf = _pdf_con_primera_pagina("Documento institucional sin programa")
        assert extraer_carrera_pens(pdf) == "Desconocida"


class TestSemestresFlexibles:
    def test_admite_semestre_12_medicina(self):
        m = MateriaPensum(
            codigo="1234567",
            nombre="Internado Rotativo",
            creditos=10,
            ht=0,
            hp=40,
            semestre=12,
            tipo="OBLIGATORIA",
        )
        assert m.semestre == 12

    def test_rechaza_semestre_15(self):
        with pytest.raises(Exception):
            MateriaPensum(
                codigo="1234567",
                nombre="X",
                creditos=3,
                ht=2,
                hp=2,
                semestre=15,
                tipo="OBLIGATORIA",
            )

    def test_rechaza_semestre_cero(self):
        with pytest.raises(Exception):
            MateriaPensum(
                codigo="1234567",
                nombre="X",
                creditos=3,
                ht=2,
                hp=2,
                semestre=0,
                tipo="OBLIGATORIA",
            )


class TestCalculatorMultiCarrera:
    def test_tecnologia_6_semestres(self):
        """Pensum corto típico de una tecnología."""
        pensum = make_pensum(
            [
                make_materia_pensum(f"100000{i}", f"Materia {i}", semestre=i)
                for i in range(1, 7)
            ],
            carrera="Tecnología en Desarrollo de Software",
        )
        historial = make_historial([
            make_materia_cursada("1000001", "Materia 1"),
        ])
        analisis = analizar(pensum, historial)
        assert analisis.pensum_carrera.startswith("Tecnología")
        # Materias agrupadas en 6 semestres
        assert max(analisis.materias_por_semestre.keys()) == 6
        assert min(analisis.materias_por_semestre.keys()) == 1

    def test_pregrado_12_semestres(self):
        """Pensum largo tipo medicina."""
        pensum = make_pensum(
            [
                make_materia_pensum(f"200000{i:02}", f"Materia {i}", semestre=i)
                for i in range(1, 13)
            ],
            carrera="Medicina",
        )
        analisis = analizar(pensum, make_historial([]))
        assert max(analisis.materias_por_semestre.keys()) == 12
        assert analisis.estadisticas.materias_pendientes_count == 12
