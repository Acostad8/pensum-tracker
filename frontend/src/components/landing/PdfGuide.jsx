const STEPS = [
  {
    n: 1,
    title: "Ingresa al portal SIA",
    description: (
      <>
        Abre <span className="font-mono text-xs">siaweb.ufpso.edu.co</span> y entra
        con tu código y contraseña.
      </>
    ),
  },
  {
    n: 2,
    title: "Descarga el pénsum",
    description:
      'En el menú académico busca "Pénsum" y descárgalo en PDF. Es el plan de estudios completo de tu carrera.',
  },
  {
    n: 3,
    title: "Descarga el reporte de notas",
    description:
      'En el mismo menú busca "Reporte de notas acumuladas". Es el listado de todas las materias que has cursado.',
  },
  {
    n: 4,
    title: "Sube ambos aquí",
    description:
      "Vuelve a esta página, arrastra los dos PDFs y listo. El análisis tarda 2 segundos.",
  },
];

export default function PdfGuide() {
  return (
    <section
      id="guia"
      className="border-y border-slate-200 bg-gradient-to-br from-slate-50 via-white to-ufpso-50/30 py-20 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-ufpso-950/20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-ufpso-600 dark:text-ufpso-400">
            Guía
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            ¿Cómo descargar los PDFs del SIA?
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            La fricción real está en descargar los archivos. Te lo dejamos clarito.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ufpso-600 to-ufpso-700 text-base font-extrabold text-white shadow-sm">
                {step.n}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="font-semibold">¿No encuentras dónde están?</p>
              <p className="mt-0.5 text-xs">
                Los nombres exactos del menú varían entre carreras. Busca opciones como
                <em> "Plan de estudios"</em>, <em>"Kardex"</em>, <em>"Record académico"</em> o pregunta a Bienestar Universitario si no aparecen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
