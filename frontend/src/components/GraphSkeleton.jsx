/**
 * Placeholder mostrado mientras se descarga el chunk de React Flow
 * la primera vez que el usuario abre la vista de grafo.
 */
export default function GraphSkeleton() {
  return (
    <div
      className="card flex flex-col items-center justify-center gap-3"
      style={{ height: "70vh", minHeight: "500px" }}
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-ufpso-600 dark:border-slate-700 dark:border-t-ufpso-400" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        Cargando vista de grafo...
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Solo la primera vez. Después se carga al instante.
      </p>
    </div>
  );
}
