const ESTADO_STYLES = {
  APROBADA: {
    bg: "bg-state-approvedBg",
    border: "border-state-approved/40",
    text: "text-green-900",
    badge: "bg-state-approved text-white",
    label: "Aprobada",
  },
  PENDIENTE_DISPONIBLE: {
    bg: "bg-white",
    border: "border-state-available/40",
    text: "text-slate-800",
    badge: "bg-state-availableBg text-state-available",
    label: "Disponible",
  },
  PENDIENTE_BLOQUEADA: {
    bg: "bg-state-pendingBg",
    border: "border-slate-200",
    text: "text-slate-600",
    badge: "bg-slate-200 text-slate-600",
    label: "Bloqueada",
  },
  REPROBADA: {
    bg: "bg-state-failedBg",
    border: "border-state-failed/40",
    text: "text-orange-900",
    badge: "bg-state-failed text-white",
    label: "Reprobada",
  },
  EN_CURSO: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-900",
    badge: "bg-amber-500 text-white",
    label: "En curso",
  },
};

function getStateKey(materia) {
  if (materia.estado === "APROBADA") return "APROBADA";
  if (materia.estado === "REPROBADA") return "REPROBADA";
  if (materia.estado === "EN_CURSO") return "EN_CURSO";
  return materia.puede_cursar ? "PENDIENTE_DISPONIBLE" : "PENDIENTE_BLOQUEADA";
}

export default function SubjectCard({ materia }) {
  const stateKey = getStateKey(materia);
  const style = ESTADO_STYLES[stateKey];
  const isElectiva = materia.tipo === "ELECTIVA";

  return (
    <div
      className={`group relative rounded-lg border ${style.border} ${style.bg} p-3 transition hover:shadow-md`}
      title={`${materia.codigo} - ${materia.nombre}${
        materia.prerrequisitos.length
          ? `\nPrerrequisitos: ${materia.prerrequisitos.join(", ")}`
          : ""
      }${materia.nota ? `\nNota: ${materia.nota}` : ""}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-slate-500">
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
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>{materia.creditos} créditos</span>
        {isElectiva && (
          <span className="rounded bg-slate-200 px-1.5 py-0.5 font-medium text-slate-700">
            Electiva
          </span>
        )}
        {materia.nota != null && (
          <span className="font-mono font-bold text-state-approved">
            {materia.nota.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}
