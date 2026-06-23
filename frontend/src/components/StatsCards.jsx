export default function StatsCards({ stats }) {
  const items = [
    {
      label: "Créditos aprobados",
      value: `${stats.creditos_aprobados}`,
      subtitle: `de ${stats.creditos_totales_pensum}`,
      accent: "text-state-approved",
    },
    {
      label: "Avance",
      value: `${stats.porcentaje_avance.toFixed(1)}%`,
      subtitle: `${stats.materias_aprobadas_count} materias aprobadas`,
      accent: "text-ufpso-600",
    },
    {
      label: "Promedio acumulado",
      value: stats.promedio_acumulado.toFixed(2),
      subtitle: `${stats.semestres_cursados} semestres cursados`,
      accent: "text-slate-800",
    },
    {
      label: "Semestres restantes",
      value: `≈ ${stats.semestres_restantes_estimados}`,
      subtitle: `${stats.creditos_restantes} créditos por aprobar`,
      accent: "text-state-available",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {it.label}
          </p>
          <p className={`mt-2 text-3xl font-bold ${it.accent}`}>{it.value}</p>
          <p className="mt-1 text-xs text-slate-500">{it.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
