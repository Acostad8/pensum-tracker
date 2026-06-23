import { useMemo, useState } from "react";
import HelpHint from "./HelpHint";

const MIN_NOTA = 3.0;
const MAX_NOTA = 5.0;

function requiredAverage(target, papaActual, credAprob, credRest) {
  if (credRest <= 0) return papaActual;
  const totalCred = credAprob + credRest;
  return (target * totalCred - papaActual * credAprob) / credRest;
}

function projectedFinal(papaActual, credAprob, promedioRestante, credRest) {
  const totalCred = credAprob + credRest;
  if (totalCred <= 0) return papaActual;
  return (papaActual * credAprob + promedioRestante * credRest) / totalCred;
}

function statusOf(required) {
  if (required > MAX_NOTA) return "impossible";
  if (required >= 4.5) return "hard";
  if (required >= 3.5) return "challenging";
  if (required >= MIN_NOTA) return "feasible";
  return "easy";
}

const STATUS_META = {
  easy: {
    label: "Muy alcanzable",
    color: "text-state-approved",
    bg: "bg-state-approvedBg dark:bg-green-900/30",
    note: "Solo necesitas aprobar las materias restantes.",
  },
  feasible: {
    label: "Alcanzable",
    color: "text-state-approved",
    bg: "bg-state-approvedBg dark:bg-green-900/30",
    note: "Está dentro de tu rango actual.",
  },
  challenging: {
    label: "Exigente",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    note: "Requiere mantener notas por encima de tu promedio actual.",
  },
  hard: {
    label: "Muy exigente",
    color: "text-state-failed",
    bg: "bg-state-failedBg dark:bg-orange-900/30",
    note: "Necesitarías notas casi perfectas.",
  },
  impossible: {
    label: "Matemáticamente imposible",
    color: "text-state-failed",
    bg: "bg-state-failedBg dark:bg-orange-900/30",
    note: "La nota máxima es 5.0; el objetivo está fuera de alcance.",
  },
};

export default function GpaCalculator({ stats, simulation }) {
  const [target, setTarget] = useState(
    Math.max(stats.promedio_acumulado, 4.0).toFixed(1),
  );

  // Cuando hay simulación activa, usamos las stats REALES para calcular
  // (las simuladas no tienen nota). Mostramos un aviso explícito.
  const baseStats = simulation?.hasSimulation
    ? simulation.originalStats
    : stats;

  const targetNum = Number(target);
  const valid = !Number.isNaN(targetNum) && targetNum >= 0 && targetNum <= 5;

  const required = useMemo(() => {
    if (!valid) return null;
    return requiredAverage(
      targetNum,
      baseStats.promedio_acumulado,
      baseStats.creditos_aprobados,
      baseStats.creditos_restantes,
    );
  }, [targetNum, valid, baseStats]);

  const projected = useMemo(
    () =>
      projectedFinal(
        baseStats.promedio_acumulado,
        baseStats.creditos_aprobados,
        baseStats.promedio_acumulado,
        baseStats.creditos_restantes,
      ),
    [baseStats],
  );

  const status = required != null ? statusOf(required) : null;
  const meta = status ? STATUS_META[status] : null;
  const noRemaining = baseStats.creditos_restantes <= 0;

  return (
    <div className="card p-5 transition-colors duration-300">
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
              d="M15.75 15.75 18 18m-1.5-4.875a4.125 4.125 0 1 1-8.25 0 4.125 4.125 0 0 1 8.25 0Z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Calculadora de PAPA
            </h3>
            <HelpHint label="Acerca del PAPA">
              PAPA = Promedio Acumulado Ponderado Académico. Se calcula
              promediando las notas de todas las materias, ponderando por sus
              créditos. Escala 0.0–5.0.
            </HelpHint>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ¿Qué promedio necesitas en lo que falta?
          </p>
        </div>
      </div>

      {simulation?.hasSimulation && (
        <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-800 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
          La simulación no incluye notas. El cálculo usa solo tus materias
          aprobadas reales.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Promedio objetivo al graduarte
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              aria-label="Promedio objetivo"
              className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-mono outline-none transition focus:border-ufpso-500 focus:ring-2 focus:ring-ufpso-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-ufpso-900/40"
            />
            <input
              type="range"
              min="3"
              max="5"
              step="0.05"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              aria-label="Promedio objetivo (slider)"
              className="flex-1 accent-ufpso-600"
            />
          </div>
        </div>

        {noRemaining ? (
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Ya completaste todos los créditos. Tu PAPA final es{" "}
            <span className="font-bold">
              {baseStats.promedio_acumulado.toFixed(2)}
            </span>
            .
          </p>
        ) : (
          required != null &&
          meta && (
            <div className={`rounded-lg p-4 transition-colors ${meta.bg}`}>
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Necesitas mantener
                </p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide ${meta.color}`}
                >
                  {meta.label}
                </span>
              </div>
              <p className={`mt-1 text-3xl font-bold ${meta.color}`}>
                {required > MAX_NOTA
                  ? "—"
                  : required < 0
                  ? "0.00"
                  : required.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {meta.note}
              </p>
            </div>
          )
        )}

        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs dark:border-slate-700">
          <div>
            <p className="text-slate-500 dark:text-slate-400">
              Si mantienes tu promedio actual
            </p>
            <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {projected.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 dark:text-slate-400">PAPA actual</p>
            <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {baseStats.promedio_acumulado.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
