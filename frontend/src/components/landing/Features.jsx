const FEATURES = [
  {
    title: "Pénsum visual",
    description:
      "Los 10 semestres con código de colores. Verde aprobadas, azul disponibles, gris bloqueadas. Vista grid o grafo de prerrequisitos.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    ),
    accent: "from-blue-500/10 to-blue-600/5",
  },
  {
    title: "Simulador qué pasa si",
    description:
      'Marca materias hipotéticas como aprobadas y ve cómo cambia tu porcentaje de avance al instante. Descubre qué se desbloquea.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
    ),
    accent: "from-purple-500/10 to-purple-600/5",
  },
  {
    title: "Calculadora de PAPA",
    description:
      "¿Qué promedio necesitas en lo que falta para alcanzar tu meta? Cálculo instantáneo con código de viabilidad.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75 18 18m-1.5-4.875a4.125 4.125 0 1 1-8.25 0 4.125 4.125 0 0 1 8.25 0Z" />
    ),
    accent: "from-amber-500/10 to-amber-600/5",
  },
  {
    title: "Recomendador inteligente",
    description:
      "Sugerencia del próximo semestre con score por desbloqueo de materias. Carga ligera, normal o pesada.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    ),
    accent: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    title: "Detección de homologaciones",
    description:
      "Si aprobaste una materia con código distinto al del pénsum (otra facultad), la reconocemos por similitud de nombre.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    ),
    accent: "from-rose-500/10 to-rose-600/5",
  },
  {
    title: "Exporta y comparte",
    description:
      "Descarga tu dashboard como PDF o imagen para mostrarlo a tu asesor académico, padres o amigos. Modo oscuro incluido.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    ),
    accent: "from-cyan-500/10 to-cyan-600/5",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-ufpso-600 dark:text-ufpso-400">
            Funcionalidades
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Todo lo que necesitas para planear tu carrera
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Más que un visualizador. Un copiloto académico que te ayuda a tomar decisiones.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 transition-opacity group-hover:opacity-100`}
                aria-hidden="true"
              />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ufpso-50 to-ufpso-100 text-ufpso-700 dark:from-ufpso-900/40 dark:to-ufpso-900/20 dark:text-ufpso-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {f.icon}
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
