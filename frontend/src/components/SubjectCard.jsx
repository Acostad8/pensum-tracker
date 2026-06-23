const ESTADO_STYLES = {
  APROBADA: {
    bg: "bg-state-approvedBg dark:bg-green-900/30",
    border: "border-state-approved/40 dark:border-state-approved/60",
    text: "text-green-900 dark:text-green-200",
    badge: "bg-state-approved text-white",
    label: "Aprobada",
  },
  PENDIENTE_DISPONIBLE: {
    bg: "bg-white dark:bg-slate-800",
    border: "border-state-available/40 dark:border-state-available/60",
    text: "text-slate-800 dark:text-slate-200",
    badge: "bg-state-availableBg text-state-available dark:bg-sky-900/40 dark:text-sky-300",
    label: "Disponible",
  },
  PENDIENTE_BLOQUEADA: {
    bg: "bg-state-pendingBg dark:bg-slate-800/60",
    border: "border-slate-200 dark:border-slate-700",
    text: "text-slate-600 dark:text-slate-400",
    badge: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    label: "Bloqueada",
  },
  REPROBADA: {
    bg: "bg-state-failedBg dark:bg-orange-900/30",
    border: "border-state-failed/40 dark:border-state-failed/60",
    text: "text-orange-900 dark:text-orange-200",
    badge: "bg-state-failed text-white",
    label: "Reprobada",
  },
  EN_CURSO: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-900 dark:text-amber-200",
    badge: "bg-amber-500 text-white",
    label: "En curso",
  },
};

const SIMULATED_STYLE = {
  bg: "bg-purple-50 dark:bg-purple-900/30",
  border: "border-purple-400 dark:border-purple-600 border-dashed",
  text: "text-purple-900 dark:text-purple-200",
  badge: "bg-purple-600 text-white",
  label: "Simulada",
};

function getStateKey(materia) {
  if (materia.estado === "APROBADA") return "APROBADA";
  if (materia.estado === "REPROBADA") return "REPROBADA";
  if (materia.estado === "EN_CURSO") return "EN_CURSO";
  return materia.puede_cursar ? "PENDIENTE_DISPONIBLE" : "PENDIENTE_BLOQUEADA";
}

export default function SubjectCard({
  materia,
  isSimulated = false,
  canSimulate = false,
  onToggleSimulation,
}) {
  const style = isSimulated ? SIMULATED_STYLE : ESTADO_STYLES[getStateKey(materia)];
  const isElectiva = materia.tipo === "ELECTIVA";
  const isPendienteDisp =
    !isSimulated && materia.estado === "PENDIENTE" && materia.puede_cursar;
  const showSimAddButton = canSimulate && isPendienteDisp;
  const showSimRemoveButton = canSimulate && isSimulated;

  return (
    <div
      className={`group relative rounded-lg border-2 ${style.border} ${style.bg} p-3 transition hover:shadow-md`}
      title={`${materia.codigo} - ${materia.nombre}${
        materia.prerrequisitos.length
          ? `\nPrerrequisitos: ${materia.prerrequisitos.join(", ")}`
          : ""
      }${materia.nota ? `\nNota: ${materia.nota}` : ""}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
          {materia.codigo}
        </span>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${style.badge}`}
        >
          {style.label}
        </span>
      </div>
      <p className={`text-xs font-semibold leading-tight ${style.text}`}>
        {materia.nombre}
      </p>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <span>{materia.creditos} créditos</span>
        {isElectiva && (
          <span className="rounded bg-slate-200 px-1.5 py-0.5 font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            Electiva
          </span>
        )}
        {materia.nota != null && (
          <span className="font-mono font-bold text-state-approved">
            {materia.nota.toFixed(1)}
          </span>
        )}
      </div>

      {(showSimAddButton || showSimRemoveButton) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSimulation?.(materia.codigo);
          }}
          aria-label={showSimAddButton ? "Simular como aprobada" : "Quitar de la simulación"}
          className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md transition ${
            showSimAddButton
              ? "bg-purple-600 opacity-0 group-hover:opacity-100 hover:bg-purple-700"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {showSimAddButton ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
