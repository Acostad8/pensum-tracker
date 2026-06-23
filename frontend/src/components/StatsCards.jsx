import HelpHint from "./HelpHint";

export default function StatsCards({ stats }) {
  const items = [
    {
      label: "Créditos aprobados",
      value: `${stats.creditos_aprobados}`,
      subtitle: `de ${stats.creditos_totales_pensum}`,
      accent: "text-state-approved",
      hint: "Suma de los créditos de todas las materias aprobadas, incluyendo materias homologadas y electivas que satisfacen un slot del pénsum.",
    },
    {
      label: "Avance",
      value: `${stats.porcentaje_avance.toFixed(1)}%`,
      subtitle: `${stats.materias_aprobadas_count} materias aprobadas`,
      accent: "text-ufpso-600 dark:text-ufpso-400",
      hint: "Porcentaje de créditos completados respecto al total obligatorio del pénsum.",
    },
    {
      label: "Promedio acumulado",
      value: stats.promedio_acumulado.toFixed(2),
      subtitle: `${stats.semestres_cursados} semestres cursados`,
      accent: "text-slate-800 dark:text-slate-200",
      hint: "PAPA (Promedio Acumulado Ponderado Académico) según el reporte oficial de notas. Escala 0.0–5.0.",
    },
    {
      label: "Semestres restantes",
      value: `≈ ${stats.semestres_restantes_estimados}`,
      subtitle: `${stats.creditos_restantes} créditos por aprobar`,
      accent: "text-state-available",
      hint: `Estimación basada en tu ritmo actual (${stats.promedio_creditos_por_semestre.toFixed(1)} créditos por semestre). No considera bloqueos por prerrequisitos.`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="card p-5 transition-colors duration-300">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {it.label}
            </p>
            <HelpHint label={`Acerca de ${it.label}`}>{it.hint}</HelpHint>
          </div>
          <p className={`mt-2 text-3xl font-bold ${it.accent}`}>{it.value}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {it.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}
