import { useState } from "react";
import ErrorBanner from "../ErrorBanner";
import FileDropzone from "../FileDropzone";
import { analyzePdfs } from "../../services/api";
import { friendlyError } from "../../services/errorMessages";

export default function UploadSection({ onAnalysisComplete, onLoadingChange }) {
  const [pensumFile, setPensumFile] = useState(null);
  const [historialFile, setHistorialFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = pensumFile && historialFile && !loading;

  async function handleSubmit() {
    setLoading(true);
    onLoadingChange?.(true);
    setError(null);
    try {
      const data = await analyzePdfs(pensumFile, historialFile);
      onAnalysisComplete(data);
    } catch (err) {
      setError(friendlyError(err.message));
      onLoadingChange?.(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="empezar" className="py-20 sm:py-28 scroll-mt-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-ufpso-600 dark:text-ufpso-400">
            Empezar
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Sube tus 2 PDFs y empieza
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Procesamiento en memoria. Sin servidores guardando tu información.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-ufpso-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
          <div className="border-b border-slate-200 bg-gradient-to-br from-ufpso-50 via-white to-ufpso-50/30 px-6 py-4 dark:border-slate-800 dark:from-ufpso-950/40 dark:via-slate-900 dark:to-ufpso-950/20">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Servidor en línea · listo para analizar
            </div>
          </div>
          <div className="p-6 sm:p-8">
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

            <ErrorBanner error={error} onDismiss={() => setError(null)} />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-state-approved" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 4.97-3.582 9-8.5 9S4 16.97 4 12c0-1.93.516-3.74 1.418-5.275C6.916 4.32 9.295 3 12 3c2.704 0 5.083 1.32 6.582 3.725A8.964 8.964 0 0 1 20 12" />
                </svg>
                Procesamos en memoria, jamás guardamos tus PDFs
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ufpso-600 to-ufpso-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-ufpso-600/20 transition hover:shadow-xl hover:shadow-ufpso-600/30 hover:from-ufpso-700 hover:to-ufpso-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analizando...
                  </>
                ) : (
                  <>
                    Analizar mi pénsum
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
