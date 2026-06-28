"""Helpers para medir tiempos por etapa en el pipeline de análisis."""
from __future__ import annotations

import logging
import time
from contextlib import contextmanager
from typing import Iterator


logger = logging.getLogger("pensum.timing")


@contextmanager
def timed(label: str) -> Iterator[dict[str, float]]:
    """Context manager que loggea el tiempo transcurrido en ms.

    El dict expuesto al `as` se llena con `elapsed_ms` al salir, útil para
    agregar al total sin volver a medir.
    """
    bucket: dict[str, float] = {"elapsed_ms": 0.0}
    start = time.perf_counter()
    try:
        yield bucket
    finally:
        elapsed_ms = (time.perf_counter() - start) * 1000
        bucket["elapsed_ms"] = elapsed_ms
        logger.info("[%s] %.1f ms", label, elapsed_ms)
