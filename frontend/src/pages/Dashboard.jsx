import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import ExportCard from "../components/ExportCard";
import ExportMenu from "../components/ExportMenu";
import FiltersBar from "../components/FiltersBar";
import GpaCalculator from "../components/GpaCalculator";
import GraphSkeleton from "../components/GraphSkeleton";
import HelpHint from "../components/HelpHint";
import MobileGraphNotice from "../components/MobileGraphNotice";
import PensumGrid from "../components/PensumGrid";
import ProgressBar from "../components/ProgressBar";
import Recommender from "../components/Recommender";
import SimulationBanner from "../components/SimulationBanner";
import StatsCards from "../components/StatsCards";
import ThemeToggle from "../components/ThemeToggle";
import ViewSwitcher from "../components/ViewSwitcher";
import WelcomeNotice from "../components/WelcomeNotice";
import usePersistentState from "../hooks/usePersistentState";
import { formatRelativeTime } from "../services/cache";
import { buildSimulatedData } from "../services/simulation";

// React Flow pesa ~200 KB. Solo se descarga si el usuario abre el grafo.
const PrerequisitesGraph = lazy(() =>
  import("../components/PrerequisitesGraph"),
);

function isAvailable(m) {
  return m.estado === "PENDIENTE" && m.puede_cursar;
}
function isBlocked(m) {
  return m.estado === "PENDIENTE" && !m.puede_cursar;
}

function matchesFilter(materia, filter) {
  switch (filter) {
    case "approved":
      return materia.estado === "APROBADA";
    case "available":
      return isAvailable(materia);
    case "blocked":
      return isBlocked(materia);
    case "electives":
      return materia.tipo === "ELECTIVA";
    default:
      return true;
  }
}

function matchesSearch(materia, search) {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    materia.codigo.toLowerCase().includes(q) ||
    materia.nombre.toLowerCase().includes(q)
  );
}

export default function Dashboard({
  data,
  onReset,
  loadedFromCache,
  theme,
  onToggleTheme,
}) {
  const [filter, setFilter] = usePersistentState(
    "pensum-tracker:filter",
    "all",
  );
  const [search, setSearch] = usePersistentState("pensum-tracker:search", "");
  const [view, setView] = usePersistentState("pensum-tracker:view", "grid");
  const [simulatedCodes, setSimulatedCodes] = useState(() => new Set());
  const [exportingFormat, setExportingFormat] = useState(null);
  const exportRef = useRef(null);
  const exportCardRef = useRef(null);

  const simulation = useMemo(
    () => buildSimulatedData(data, simulatedCodes),
    [data, simulatedCodes],
  );
  const effectiveData = simulation.data;
  const { estadisticas, pensum_carrera, materias_por_semestre } = effectiveData;
  const est = estadisticas;

  const toggleSimulation = useCallback((codigo) => {
    setSimulatedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  }, []);

  const addManyToSimulation = useCallback((codigos) => {
    setSimulatedCodes((prev) => {
      const next = new Set(prev);
      for (const c of codigos) next.add(c);
      return next;
    });
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulatedCodes(new Set());
  }, []);

  const allMaterias = useMemo(
    () => Object.values(materias_por_semestre).flat(),
    [materias_por_semestre],
  );

  const counts = useMemo(
    () => ({
      all: allMaterias.length,
      approved: allMaterias.filter((m) => m.estado === "APROBADA").length,
      available: allMaterias.filter(isAvailable).length,
      blocked: allMaterias.filter(isBlocked).length,
      electives: allMaterias.filter((m) => m.tipo === "ELECTIVA").length,
    }),
    [allMaterias],
  );

  const materiasFiltradas = useMemo(() => {
    const out = {};
    for (const [sem, materias] of Object.entries(materias_por_semestre)) {
      out[sem] = materias.filter(
        (m) => matchesFilter(m, filter) && matchesSearch(m, search),
      );
    }
    return out;
  }, [materias_por_semestre, filter, search]);

  const hasActiveFilters = filter !== "all" || search.length > 0;
  const isNewStudent =
    !simulation.hasSimulation && est.materias_aprobadas_count === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-ufpso-600 text-white font-bold"
              aria-hidden="true"
            >
              U
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
                {est.estudiante.nombre}
              </h1>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Código {est.estudiante.codigo} · {pensum_carrera} · Pensum{" "}
                {est.estudiante.pensum}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <ExportMenu
              targetRef={exportRef}
              cardRef={exportCardRef}
              studentName={est.estudiante.nombre}
              onPrepareExport={(format) => setExportingFormat(format)}
              onAfterExport={() => setExportingFormat(null)}
            />
            <button type="button" onClick={onReset} className="btn-ghost">
              ← Subir otros PDFs
            </button>
          </div>
        </div>
      </header>

      {loadedFromCache && (
        <div className="border-b border-ufpso-100 bg-ufpso-50 dark:border-ufpso-900/50 dark:bg-ufpso-900/20">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs text-ufpso-700 dark:text-ufpso-300 sm:px-6">
            <span>
              Mostrando análisis guardado {formatRelativeTime(loadedFromCache)}
            </span>
            <button
              type="button"
              onClick={onReset}
              className="font-medium underline hover:text-ufpso-900 dark:hover:text-ufpso-100"
            >
              Limpiar caché
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div
          ref={exportRef}
          className="space-y-6 bg-slate-50 p-1 dark:bg-slate-950"
        >
          {isNewStudent && (
            <WelcomeNotice studentName={est.estudiante.nombre} />
          )}

          {simulation.hasSimulation && (
            <div data-export-ignore="true">
              <SimulationBanner
                simulatedCount={simulatedCodes.size}
                extraCredits={simulation.extraCredits}
                originalStats={simulation.originalStats}
                simulatedStats={est}
                onReset={resetSimulation}
              />
            </div>
          )}

          <StatsCards stats={est} />

          <ProgressBar
            aprobados={est.creditos_aprobados}
            totales={est.creditos_totales_pensum}
            porcentaje={est.porcentaje_avance}
          />

          <div className="grid gap-4 lg:grid-cols-2" data-export-ignore="true">
            <GpaCalculator stats={est} simulation={simulation} />
            <Recommender
              materiasPorSemestre={materias_por_semestre}
              onSimulateAll={addManyToSimulation}
            />
          </div>

          <section
            aria-labelledby="pensum-heading"
            className="space-y-4 scroll-mt-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2
                  id="pensum-heading"
                  className="text-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  Tu pénsum {view === "grid" ? "por semestre" : "como grafo"}
                </h2>
                <HelpHint label="Significado de los estados">
                  <strong>Aprobada</strong>: ya cursaste y pasaste.{" "}
                  <strong>Disponible</strong>: tienes los prerrequisitos.{" "}
                  <strong>Bloqueada</strong>: te falta aprobar prerrequisitos.{" "}
                  <strong>Simulada</strong>: marcada por ti como hipotética.
                </HelpHint>
              </div>
              <div className="flex items-center gap-3">
                <Legend />
                <div data-export-ignore="true">
                  <ViewSwitcher view={view} onChange={setView} />
                </div>
              </div>
            </div>

            {view === "grid" && (
              <>
                <div data-export-ignore="true">
                  <FiltersBar
                    filter={filter}
                    onFilterChange={setFilter}
                    search={search}
                    onSearchChange={setSearch}
                    counts={counts}
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Tip: pasa el cursor sobre las materias disponibles para
                    simularlas como aprobadas.
                  </p>
                </div>

                <PensumGrid
                  materiasPorSemestre={materiasFiltradas}
                  hasFilters={hasActiveFilters}
                  forceDesktop={exportingFormat === "pdf"}
                  simulatedCodes={simulatedCodes}
                  canSimulate
                  onToggleSimulation={toggleSimulation}
                />
              </>
            )}

            {view === "graph" && (
              <>
                <MobileGraphNotice />
                <Suspense fallback={<GraphSkeleton />}>
                  <PrerequisitesGraph
                    materiasPorSemestre={materias_por_semestre}
                    theme={theme}
                  />
                </Suspense>
              </>
            )}
          </section>
        </div>
      </main>

      {exportingFormat === "png" && (
        <div
          style={{ position: "fixed", left: "-10000px", top: 0 }}
          aria-hidden="true"
        >
          <div ref={exportCardRef}>
            <ExportCard stats={est} carrera={pensum_carrera} />
          </div>
        </div>
      )}
    </div>
  );
}

function Legend() {
  const items = [
    { color: "bg-state-approved", label: "Aprobadaa" },
    { color: "bg-state-available", label: "Disponible" },
    { color: "bg-slate-300 dark:bg-slate-600", label: "Bloqueada" },
    { color: "bg-purple-500", label: "Simulada" },
  ];
  return (
    <div
      className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400"
      aria-label="Leyenda de colores"
    >
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span
            className={`h-3 w-3 rounded-full ${it.color}`}
            aria-hidden="true"
          />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
