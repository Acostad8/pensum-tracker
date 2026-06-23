import { useState } from "react";
import FileDropzone from "../components/FileDropzone";
import { analyzePdfs } from "../services/api";

export default function Home({ onAnalysisComplete }) {
  const [pensumFile, setPensumFile] = useState(null);
  const [historialFile, setHistorialFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = pensumFile && historialFile && !loading;

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzePdfs(pensumFile, historialFile);
      onAnalysisComplete(data);
    } catch (err) {
      setError(err.message || "Error al procesar los PDFs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-ufpso-50/30">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ufpso-600 text-white font-bold">
            U
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Pensum Tracker</h1>
            <p className="text-xs text-slate-500">
              Universidad Francisco de Paula Santander Ocaña
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Visualiza tu avance académico
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-600">
            Sube los dos PDFs de tu portal SIA y obtén un análisis completo de
            tu pénsum, créditos aprobados y semestres restantes.
          </p>
        </div>

        <div className="card p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <FileDropzone
              label="1. Pénsum de tu carrera"
              file={pensumFile}
              onFileSelected={setPensumFile}
            />
            <FileDropzone
              label="2. Reporte de notas acumuladas"
              file={historialFile}
              onFileSelected={setHistorialFile}
            />
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-state-failed/30 bg-state-failedBg p-4 text-sm text-state-failed">
              <strong className="font-semibold">Error:</strong> {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Tus archivos se procesan en memoria y nunca se almacenan.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="btn-primary"
            >
              {loading ? "Analizando..." : "Analizar mi pénsum"}
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Pénsum visual"
            description="Mira los 10 semestres con código de colores según el estado de cada materia."
          />
          <FeatureCard
            title="Cálculo automático"
            description="Créditos aprobados, restantes y estimación de cuántos semestres te faltan."
          />
          <FeatureCard
            title="100% privado"
            description="Todo se procesa localmente. No guardamos tus datos académicos."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-600">{description}</p>
    </div>
  );
}
