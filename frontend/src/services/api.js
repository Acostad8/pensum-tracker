const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function analyzePdfs(pensumFile, historialFile) {
  const formData = new FormData();
  formData.append("pensum", pensumFile);
  formData.append("historial", historialFile);

  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = `Error ${response.status}`;
    try {
      const data = await response.json();
      detail = data.detail || detail;
    } catch {
      /* swallow JSON parse errors */
    }
    throw new Error(detail);
  }

  return response.json();
}
