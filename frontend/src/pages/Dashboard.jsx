import PensumGrid from "../components/PensumGrid";
import ProgressBar from "../components/ProgressBar";
import StatsCards from "../components/StatsCards";

export default function Dashboard({ data, onReset }) {
  const { estadisticas, pensum_carrera, materias_por_semestre } = data;
  const est = estadisticas;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ufpso-600 text-white font-bold">
              U
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {est.estudiante.nombre}
              </h1>
              <p className="text-xs text-slate-500">
                Código {est.estudiante.codigo} · {pensum_carrera} · Pensum{" "}
                {est.estudiante.pensum}
              </p>
            </div>
          </div>
          <button type="button" onClick={onReset} className="btn-ghost">
            ← Subir otros PDFs
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          <StatsCards stats={est} />

          <ProgressBar
            aprobados={est.creditos_aprobados}
            totales={est.creditos_totales_pensum}
            porcentaje={est.porcentaje_avance}
          />

          <div>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Tu pénsum por semestre
              </h2>
              <Legend />
            </div>
            <PensumGrid materiasPorSemestre={materias_por_semestre} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Legend() {
  const items = [
    { color: "bg-state-approved", label: "Aprobada" },
    { color: "bg-state-available", label: "Disponible" },
    { color: "bg-slate-300", label: "Bloqueada" },
    { color: "bg-state-failed", label: "Reprobada" },
  ];
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-full ${it.color}`} />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
