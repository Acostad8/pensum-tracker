/**
 * Mockup visual estático del dashboard, hecho con HTML/CSS puro.
 * Usado en el hero de la landing para mostrar a qué llega el usuario.
 */
export default function DashboardMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="ml-3 flex-1 rounded bg-white px-2 py-0.5 text-[9px] font-mono text-slate-400 dark:bg-slate-700/50 dark:text-slate-500">
          pensum-tracker.app
        </div>
      </div>

      {/* Dashboard interior */}
      <div className="space-y-2.5 bg-slate-50 p-3 dark:bg-slate-950">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-1.5">
          <StatMini label="Aprobados" value="85" sub="de 167" color="text-state-approved" />
          <StatMini label="Avance" value="50.9%" sub="32 materias" color="text-ufpso-600" />
          <StatMini label="PAPA" value="3.89" sub="5 cursados" color="text-slate-800 dark:text-slate-200" />
          <StatMini label="Restantes" value="≈ 5" sub="82 créditos" color="text-state-available" />
        </div>

        {/* Progress bar */}
        <div className="rounded-md bg-white p-2 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[8px] font-semibold text-slate-600 dark:text-slate-400">Avance hacia la graduación</span>
            <span className="text-[8px] font-bold text-ufpso-600 dark:text-ufpso-400">50.9%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full w-[51%] bg-gradient-to-r from-ufpso-500 to-ufpso-700" />
          </div>
        </div>

        {/* Pensum grid mini */}
        <div className="grid grid-cols-5 gap-1">
          {[
            { sem: 1, total: 6, approved: 6 },
            { sem: 2, total: 8, approved: 7 },
            { sem: 3, total: 8, approved: 6 },
            { sem: 4, total: 11, approved: 7 },
            { sem: 5, total: 10, approved: 3 },
          ].map((s) => (
            <SemesterMini key={s.sem} {...s} />
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="rounded-full bg-ufpso-600 px-1.5 py-0.5 text-[7px] font-medium text-white">Todas 95</span>
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[7px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">Aprobadas 32</span>
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[7px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">Disponibles 18</span>
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[7px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">Bloqueadas 45</span>
        </div>
      </div>

      {/* Floating tags */}
      <div className="absolute -right-3 -top-3 hidden rotate-3 rounded-lg bg-gradient-to-br from-ufpso-600 to-ufpso-700 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg sm:block animate-float">
        Tiempo real
      </div>
      <div className="absolute -bottom-3 -left-3 hidden -rotate-3 rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-slate-700 shadow-lg ring-1 ring-slate-200 sm:block animate-float dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700" style={{ animationDelay: "1.5s" }}>
        100% privado
      </div>
    </div>
  );
}

function StatMini({ label, value, sub, color }) {
  return (
    <div className="rounded-md bg-white p-1.5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <p className="text-[7px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-0.5 text-base font-bold leading-none ${color}`}>{value}</p>
      <p className="text-[7px] text-slate-500 dark:text-slate-400">{sub}</p>
    </div>
  );
}

function SemesterMini({ sem, total, approved }) {
  return (
    <div className="overflow-hidden rounded-md bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className="bg-gradient-to-r from-ufpso-600 to-ufpso-700 px-1.5 py-0.5">
        <p className="text-[7px] font-bold text-white">Sem {sem}</p>
        <p className="text-[6px] text-white/80">{approved}/{total}</p>
      </div>
      <div className="space-y-0.5 p-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded ${
              i < approved
                ? "bg-state-approved/30"
                : i === approved
                ? "bg-state-available/30"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
