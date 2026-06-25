const STEPS = [
  {
    n: 1,
    title: "Descarga tus 2 PDFs",
    description:
      "Entra a tu portal SIA y descarga el pénsum de tu carrera + el reporte de notas acumuladas. Sí, los que ya están en el sistema.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    ),
  },
  {
    n: 2,
    title: "Súbelos aquí",
    description:
      "Arrastra los dos archivos al área de carga. Se procesan en memoria, jamás se guardan en nuestros servidores.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9 4.5-4.5m0 0 4.5 4.5m-4.5-4.5v12" />
    ),
  },
  {
    n: 3,
    title: "Visualiza tu avance",
    description:
      "En 2 segundos verás tu pénsum completo con código de colores, créditos restantes, semestres estimados y herramientas para planificar.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/50 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Cómo funciona"
          title="Tres pasos. Cero complicaciones."
          description="No necesitas instalar nada ni crear cuenta. Tarda menos de un minuto."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {STEPS.map((step, idx) => (
            <div
              key={step.n}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-ufpso-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-ufpso-900/60"
            >
              <div className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ufpso-600 to-ufpso-700 text-sm font-bold text-white shadow-md">
                {step.n}
              </div>
              <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-ufpso-50 text-ufpso-600 transition-transform group-hover:scale-110 dark:bg-ufpso-900/30 dark:text-ufpso-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {step.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {step.description}
              </p>

              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div className="absolute -right-4 top-1/2 hidden lg:block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-slate-300 dark:text-slate-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-ufpso-600 dark:text-ufpso-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
