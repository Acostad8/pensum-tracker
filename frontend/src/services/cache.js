const CACHE_KEY = "pensum-tracker:analysis";
const CACHE_TIMESTAMP_KEY = "pensum-tracker:timestamp";
const CACHE_VERSION_KEY = "pensum-tracker:version";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

/**
 * Bumpear cuando cambie el shape del JSON de /api/analyze.
 * Si el cache guardado no coincide, se descarta silenciosamente.
 */
const CACHE_SCHEMA_VERSION = 2;

function isShapeValid(data) {
  return (
    data &&
    typeof data === "object" &&
    data.estadisticas &&
    typeof data.estadisticas === "object" &&
    data.materias_por_semestre &&
    typeof data.materias_por_semestre === "object" &&
    Number.isFinite(data.estadisticas.creditos_totales_pensum)
  );
}

export function saveAnalysis(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_VERSION_KEY, String(CACHE_SCHEMA_VERSION));
  } catch {
    /* localStorage lleno o deshabilitado */
  }
}

export function loadAnalysis() {
  try {
    const version = Number(localStorage.getItem(CACHE_VERSION_KEY));
    if (version !== CACHE_SCHEMA_VERSION) {
      clearAnalysis();
      return null;
    }
    const raw = localStorage.getItem(CACHE_KEY);
    const ts = Number(localStorage.getItem(CACHE_TIMESTAMP_KEY));
    if (!raw || !ts) return null;
    if (Date.now() - ts > CACHE_TTL_MS) {
      clearAnalysis();
      return null;
    }
    const data = JSON.parse(raw);
    if (!isShapeValid(data)) {
      clearAnalysis();
      return null;
    }
    return { data, timestamp: ts };
  } catch {
    clearAnalysis();
    return null;
  }
}

export function clearAnalysis() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
}

export function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
}
