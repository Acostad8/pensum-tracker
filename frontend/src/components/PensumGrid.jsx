import { useEffect, useState } from "react";
import SubjectCard from "./SubjectCard";

export default function PensumGrid({
  materiasPorSemestre,
  hasFilters = false,
  forceDesktop = false,
  simulatedCodes,
  canSimulate = false,
  onToggleSimulation,
}) {
  const semestres = Object.keys(materiasPorSemestre)
    .map(Number)
    .sort((a, b) => a - b);

  const visibles = semestres.filter(
    (sem) => materiasPorSemestre[sem].length > 0,
  );

  if (visibles.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center p-12 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Sin materias para mostrar
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Ajusta los filtros o la búsqueda para ver resultados.
        </p>
      </div>
    );
  }

  const sharedProps = { simulatedCodes, canSimulate, onToggleSimulation };

  if (forceDesktop) {
    return (
      <DesktopGrid
        semestres={visibles}
        materiasPorSemestre={materiasPorSemestre}
        alwaysVisible
        {...sharedProps}
      />
    );
  }

  return (
    <>
      <DesktopGrid
        semestres={visibles}
        materiasPorSemestre={materiasPorSemestre}
        {...sharedProps}
      />
      <MobileAccordion
        semestres={visibles}
        materiasPorSemestre={materiasPorSemestre}
        forceOpen={hasFilters}
        {...sharedProps}
      />
    </>
  );
}

function renderSubject(m, { simulatedCodes, canSimulate, onToggleSimulation }) {
  return (
    <SubjectCard
      key={m.codigo}
      materia={m}
      isSimulated={simulatedCodes?.has(m.codigo) ?? false}
      canSimulate={canSimulate}
      onToggleSimulation={onToggleSimulation}
    />
  );
}

function DesktopGrid({
  semestres,
  materiasPorSemestre,
  alwaysVisible = false,
  simulatedCodes,
  canSimulate,
  onToggleSimulation,
}) {
  return (
    <div
      className={`overflow-x-auto pb-4 ${alwaysVisible ? "" : "hidden md:block"}`}
    >
      <div className="inline-flex min-w-full gap-3">
        {semestres.map((sem) => {
          const materias = materiasPorSemestre[sem];
          const aprobadas = materias.filter(
            (m) => m.estado === "APROBADA",
          ).length;
          const creditosSem = materias
            .filter((m) => m.tipo === "OBLIGATORIA")
            .reduce((acc, m) => acc + m.creditos, 0);

          return (
            <div
              key={sem}
              className="flex w-64 flex-shrink-0 flex-col rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
            >
              <SemesterHeader
                sem={sem}
                aprobadas={aprobadas}
                total={materias.length}
                creditos={creditosSem}
              />
              <div className="flex flex-col gap-2 p-2">
                {materias.map((m) =>
                  renderSubject(m, { simulatedCodes, canSimulate, onToggleSimulation }),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileAccordion({
  semestres,
  materiasPorSemestre,
  forceOpen,
  simulatedCodes,
  canSimulate,
  onToggleSimulation,
}) {
  const [openSemester, setOpenSemester] = useState(semestres[0] ?? null);

  useEffect(() => {
    if (forceOpen) setOpenSemester("all");
  }, [forceOpen]);

  return (
    <div className="space-y-2 md:hidden">
      {semestres.map((sem) => {
        const materias = materiasPorSemestre[sem];
        const aprobadas = materias.filter((m) => m.estado === "APROBADA").length;
        const creditosSem = materias
          .filter((m) => m.tipo === "OBLIGATORIA")
          .reduce((acc, m) => acc + m.creditos, 0);
        const isOpen = openSemester === sem || openSemester === "all";

        return (
          <div
            key={sem}
            className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
          >
            <button
              type="button"
              onClick={() =>
                setOpenSemester((prev) =>
                  prev === "all" ? sem : prev === sem ? null : sem,
                )
              }
              className="w-full text-left"
            >
              <SemesterHeader
                sem={sem}
                aprobadas={aprobadas}
                total={materias.length}
                creditos={creditosSem}
                showChevron
                expanded={isOpen}
              />
            </button>
            {isOpen && (
              <div className="flex flex-col gap-2 p-2">
                {materias.map((m) =>
                  renderSubject(m, { simulatedCodes, canSimulate, onToggleSimulation }),
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SemesterHeader({
  sem,
  aprobadas,
  total,
  creditos,
  showChevron,
  expanded,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-t-xl bg-gradient-to-r from-ufpso-600 to-ufpso-700 px-3 py-2 text-white">
      <div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-bold">Semestre {sem}</h3>
          <span className="text-[10px] opacity-90">
            {aprobadas}/{total}
          </span>
        </div>
        <p className="text-[10px] opacity-80">{creditos} créditos</p>
      </div>
      {showChevron && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      )}
    </div>
  );
}
