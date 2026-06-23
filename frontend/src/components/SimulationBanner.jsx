export default function SimulationBanner({
  simulatedCount,
  extraCredits,
  originalStats,
  simulatedStats,
  onReset,
}) {
  if (simulatedCount === 0) return null;

  const deltaPct = (
    simulatedStats.porcentaje_avance - originalStats.porcentaje_avance
  ).toFixed(1);
  const deltaSem =
    originalStats.semestres_restantes_estimados -
    simulatedStats.semestres_restantes_estimados;

  return (
    <div className="rounded-xl border border-purple-300 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple-200 text-purple-700 dark:bg-purple-800 dark:text-purple-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              Simulación activa
            </h3>
            <p className="mt-0.5 text-xs text-purple-700 dark:text-purple-300">
              {simulatedCount} materia(s) simulada(s) · +{extraCredits} créditos ·
              +{deltaPct}% de avance
              {deltaSem > 0 && ` · ${deltaSem} semestre(s) menos`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="self-start rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-purple-700 ring-1 ring-purple-200 transition hover:bg-purple-100 dark:bg-purple-900/40 dark:text-purple-200 dark:ring-purple-700 dark:hover:bg-purple-900/60 sm:self-auto"
        >
          Limpiar simulación
        </button>
      </div>
    </div>
  );
}
