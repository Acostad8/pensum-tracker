/**
 * Tarjeta compacta que se renderiza fuera de pantalla solo durante la
 * exportación a PNG. Resume el avance del estudiante sin capturar
 * toda la página.
 */
export default function ExportCard({ stats, carrera }) {
  const pct = Math.min(100, Math.max(0, stats.porcentaje_avance));
  const fecha = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const items = [
    {
      label: "Créditos aprobados",
      value: `${stats.creditos_aprobados}`,
      subtitle: `de ${stats.creditos_totales_pensum}`,
      accent: "text-state-approved",
    },
    {
      label: "Materias aprobadas",
      value: `${stats.materias_aprobadas_count}`,
      subtitle: `${stats.semestres_cursados} semestres cursados`,
      accent: "text-slate-800 dark:text-slate-200",
    },
    {
      label: "Promedio acumulado",
      value: stats.promedio_acumulado.toFixed(2),
      subtitle: "escala 0.0 – 5.0",
      accent: "text-slate-800 dark:text-slate-200",
    },
    {
      label: "Semestres restantes",
      value: `≈ ${stats.semestres_restantes_estimados}`,
      subtitle: `${stats.creditos_restantes} créditos por aprobar`,
      accent: "text-state-available",
    },
  ];

  return (
    <div className="w-[720px] rounded-2xl bg-white p-8 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-ufpso-600 text-xl font-bold text-white"
          aria-hidden="true"
        >
          U
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900 dark:text-slate-100">
            {stats.estudiante.nombre}
          </h1>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            Código {stats.estudiante.codigo} · {carrera} · Pensum{" "}
            {stats.estudiante.pensum}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-end justify-between">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Avance de carrera
          </p>
          <p className="text-4xl font-bold text-ufpso-600 dark:text-ufpso-400">
            {pct.toFixed(1)}%
          </p>
        </div>
        <div
          className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
          role="presentation"
        >
          <div
            className="h-full rounded-full bg-ufpso-600"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {it.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${it.accent}`}>{it.value}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {it.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
        <span>Pensum Tracker</span>
        <span>{fecha}</span>
      </div>
    </div>
  );
}
