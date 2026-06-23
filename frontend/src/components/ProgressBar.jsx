export default function ProgressBar({ aprobados, totales, porcentaje }) {
  const pct = Math.min(100, Math.max(0, porcentaje));
  return (
    <div className="card p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Avance hacia la graduación
        </h3>
        <span className="text-sm font-bold text-ufpso-600">
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-ufpso-500 to-ufpso-700 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{aprobados} créditos aprobados</span>
        <span>{totales} créditos totales</span>
      </div>
    </div>
  );
}
