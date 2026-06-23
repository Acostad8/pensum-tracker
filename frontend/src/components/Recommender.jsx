import { useMemo, useState } from "react";
import {
  LOAD_TARGETS,
  recommendNextSemester,
} from "../services/recommender";

const LOAD_OPTIONS = [
  { key: "light", label: "Ligera" },
  { key: "normal", label: "Normal" },
  { key: "heavy", label: "Pesada" },
];

export default function Recommender({ materiasPorSemestre, onSimulateAll }) {
  const [load, setLoad] = useState("normal");

  const result = useMemo(
    () => recommendNextSemester(materiasPorSemestre, load),
    [materiasPorSemestre, load],
  );

  const target = LOAD_TARGETS[load];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ufpso-100 text-ufpso-600 dark:bg-ufpso-900/40 dark:text-ufpso-300">
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
              d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Plan para el próximo semestre
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sugerencia basada en lo que tienes habilitado para cursar
          </p>
        </div>
      </div>

      <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {LOAD_OPTIONS.map((o) => {
          const active = load === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => setLoad(o.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                active
                  ? "bg-white text-ufpso-700 shadow-sm dark:bg-slate-700 dark:text-ufpso-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {result.selected.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            No hay materias listas para cursar
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Aprueba materias con prerrequisitos pendientes para desbloquear más
            opciones.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {result.selected.map((m) => (
              <li
                key={m.codigo}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {m.codigo}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {m.nombre}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                    {m.reason}
                  </p>
                </div>
                <span className="rounded-full bg-ufpso-100 px-2 py-0.5 text-[10px] font-bold text-ufpso-700 dark:bg-ufpso-900/40 dark:text-ufpso-300">
                  {m.creditos} cr
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs dark:border-slate-700">
            <div>
              <span className="text-slate-500 dark:text-slate-400">
                Total créditos:
              </span>{" "}
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {result.totalCredits}
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                {" "}
                / objetivo {target.target}
              </span>
            </div>
            {onSimulateAll && (
              <button
                type="button"
                onClick={() =>
                  onSimulateAll(result.selected.map((m) => m.codigo))
                }
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700"
              >
                Simular este plan
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
