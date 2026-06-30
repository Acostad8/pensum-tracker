"""Tests del router /api/analyze.

Mockeamos los parsers para verificar el contrato HTTP (status codes,
mensajes de error) sin necesidad de PDFs reales.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.rate_limit import limiter
from app.services.pdf_detector import TipoPdfInesperado

from tests.conftest import (
    make_estudiante,
    make_historial,
    make_materia_cursada,
    make_materia_pensum,
    make_pensum,
)


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Cada test arranca con el limiter limpio para no contaminar tests vecinos."""
    limiter.reset()
    yield
    limiter.reset()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def fake_pensum_obj():
    return make_pensum([
        make_materia_pensum("1000001", "Matemáticas I", semestre=1),
        make_materia_pensum(
            "1000002", "Matemáticas II", semestre=2, prerrequisitos=["1000001"]
        ),
    ])


@pytest.fixture
def fake_historial_obj():
    return make_historial(
        [make_materia_cursada("1000001", "Matemáticas I")],
        estudiante=make_estudiante(creditos_aprobados=3),
    )


@pytest.fixture
def mock_parsers(monkeypatch, fake_pensum_obj, fake_historial_obj):
    """Reemplaza parse_pensum y parse_historial en el módulo del router."""
    from app.routers import upload

    monkeypatch.setattr(upload, "parse_pensum", lambda data: fake_pensum_obj)
    monkeypatch.setattr(upload, "parse_historial", lambda data: fake_historial_obj)


def _pdf_file(name: str = "doc.pdf"):
    # No necesita ser un PDF real porque los parsers están mockeados; pero el
    # content-type sí se valida en el router antes de invocarlos.
    return (name, b"%PDF-1.4 fake content", "application/pdf")


class TestHealth:
    def test_health_responde_ok(self, client):
        r = client.get("/api/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}


class TestValidacionContentType:
    def test_rechaza_archivo_no_pdf(self, client):
        files = {
            "pensum": ("p.txt", b"hola", "text/plain"),
            "historial": _pdf_file(),
        }
        r = client.post("/api/analyze", files=files)
        assert r.status_code == 415
        assert "no es un PDF" in r.json()["detail"]

    def test_rechaza_si_falta_un_archivo(self, client):
        files = {"pensum": _pdf_file()}
        r = client.post("/api/analyze", files=files)
        # FastAPI valida campos requeridos antes
        assert r.status_code == 422


class TestFlujoExitoso:
    def test_analiza_correctamente_con_parsers_mockeados(
        self, client, mock_parsers
    ):
        files = {
            "pensum": _pdf_file("pensum.pdf"),
            "historial": _pdf_file("historial.pdf"),
        }
        r = client.post("/api/analyze", files=files)
        assert r.status_code == 200
        body = r.json()
        assert "estadisticas" in body
        assert "materias_por_semestre" in body
        assert body["pensum_carrera"] == "Ingeniería de Sistemas"


class TestErroresDeTipo:
    def test_archivos_invertidos_devuelve_400_amigable(
        self, client, monkeypatch
    ):
        from app.routers import upload

        def _bad_pensum(data):
            raise TipoPdfInesperado(esperado="pensum", detectado="historial")

        def _bad_historial(data):
            raise TipoPdfInesperado(esperado="historial", detectado="pensum")

        monkeypatch.setattr(upload, "parse_pensum", _bad_pensum)
        monkeypatch.setattr(upload, "parse_historial", _bad_historial)

        files = {
            "pensum": _pdf_file("p.pdf"),
            "historial": _pdf_file("h.pdf"),
        }
        r = client.post("/api/analyze", files=files)
        assert r.status_code == 400
        assert "invertiste" in r.json()["detail"].lower()

    def test_solo_pensum_invertido(self, client, monkeypatch, fake_historial_obj):
        from app.routers import upload

        def _bad_pensum(data):
            raise TipoPdfInesperado(esperado="pensum", detectado="historial")

        monkeypatch.setattr(upload, "parse_pensum", _bad_pensum)
        monkeypatch.setattr(
            upload, "parse_historial", lambda data: fake_historial_obj
        )

        files = {
            "pensum": _pdf_file("p.pdf"),
            "historial": _pdf_file("h.pdf"),
        }
        r = client.post("/api/analyze", files=files)
        assert r.status_code == 400
        detail = r.json()["detail"].lower()
        assert "pénsum" in detail or "pensum" in detail


class TestPensumVacio:
    def test_devuelve_422_si_no_hay_materias(
        self, client, monkeypatch, fake_historial_obj
    ):
        from app.routers import upload

        empty_pensum = make_pensum([])
        monkeypatch.setattr(upload, "parse_pensum", lambda data: empty_pensum)
        monkeypatch.setattr(
            upload, "parse_historial", lambda data: fake_historial_obj
        )

        files = {
            "pensum": _pdf_file("p.pdf"),
            "historial": _pdf_file("h.pdf"),
        }
        r = client.post("/api/analyze", files=files)
        assert r.status_code == 422
        assert "pénsum" in r.json()["detail"].lower()

    def test_devuelve_422_si_historial_vacio(
        self, client, monkeypatch, fake_pensum_obj
    ):
        from app.routers import upload

        empty_historial = make_historial([])
        monkeypatch.setattr(upload, "parse_pensum", lambda data: fake_pensum_obj)
        monkeypatch.setattr(upload, "parse_historial", lambda data: empty_historial)

        files = {
            "pensum": _pdf_file("p.pdf"),
            "historial": _pdf_file("h.pdf"),
        }
        r = client.post("/api/analyze", files=files)
        assert r.status_code == 422
        assert "historial" in r.json()["detail"].lower()


class TestSizeLimit:
    def test_rechaza_pdf_demasiado_grande(self, client, monkeypatch):
        # Forzamos un límite minúsculo para no tener que crear un archivo enorme
        from app.routers import upload

        monkeypatch.setattr(upload, "MAX_PDF_SIZE", 100)
        # Parser nunca debería invocarse — la validación corta antes
        monkeypatch.setattr(upload, "parse_pensum", lambda data: pytest.fail(
            "parse_pensum no debió invocarse"
        ))

        files = {
            "pensum": ("p.pdf", b"X" * 500, "application/pdf"),
            "historial": _pdf_file(),
        }
        r = client.post("/api/analyze", files=files)
        assert r.status_code == 413
        assert "excede" in r.json()["detail"].lower()


class TestRateLimit:
    def test_devuelve_429_al_exceder_limite(
        self, client, mock_parsers, monkeypatch
    ):
        # Forzamos un límite de 2/minute por test para no esperar 1 minuto real
        from app.routers import upload as upload_mod

        # Re-aplicar el decorador con el nuevo límite es invasivo; en su lugar
        # disparamos varias requests con el límite default (10/minute) y
        # verificamos que la 11.ª falla.
        files = {
            "pensum": _pdf_file("p.pdf"),
            "historial": _pdf_file("h.pdf"),
        }
        # Disparamos 10 OK
        for i in range(10):
            r = client.post("/api/analyze", files=files)
            assert r.status_code == 200, f"fallo en request #{i + 1}"
        # La 11.ª debería ser rechazada
        r = client.post("/api/analyze", files=files)
        assert r.status_code == 429
