"""Configuración compartida del rate limiter.

Usamos slowapi (basado en limits) con backend en memoria. Para múltiples
instancias en producción, configurar `RATELIMIT_STORAGE_URI` con Redis.

Límites por defecto:
- /api/analyze: 10 req/min por IP (parsing de PDF es CPU-intenso)
- otros endpoints: sin límite explícito

Se puede sobrescribir con la variable de entorno ANALYZE_RATE_LIMIT.
"""
from __future__ import annotations

import os

from slowapi import Limiter
from slowapi.util import get_remote_address


ANALYZE_RATE_LIMIT = os.getenv("ANALYZE_RATE_LIMIT", "10/minute")

# storage_uri se puede setear como redis://... en producción multi-instancia.
_storage_uri = os.getenv("RATELIMIT_STORAGE_URI", "memory://")

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=_storage_uri,
    default_limits=[],
)
