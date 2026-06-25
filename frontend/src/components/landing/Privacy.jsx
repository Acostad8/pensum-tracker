const PROMISES = [
  {
    title: "Procesamiento en memoria",
    description:
      "Tus PDFs viajan al servidor solo para analizarse y se descartan al instante. Nada se guarda en disco.",
  },
  {
    title: "Sin tracking ni cookies",
    description:
      "No usamos Google Analytics, ni Hotjar, ni cookies de terceros. Tu navegación es solo tuya.",
  },
  {
    title: "Caché local en tu navegador",
    description:
      "El resultado se guarda solo en tu navegador (localStorage). Puedes borrarlo cuando quieras.",
  },
  {
    title: "Sin registro requerido",
    description:
      "No te pedimos email, contraseña ni datos personales. Solo necesitas tus 2 PDFs.",
  },
];

export default function Privacy() {
  return (
    <section className="border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/50 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-ufpso-600 dark:text-ufpso-400">
              Privacidad
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Tus datos académicos son tuyos. Punto.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Construido pensando en privacidad desde el día uno. Sin BD de
              usuarios, sin trackers, sin sorpresas escritas en letras chiquitas.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-state-approved/30 bg-state-approvedBg/50 px-4 py-3 dark:border-state-approved/40 dark:bg-green-900/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-state-approved text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 4.97-3.582 9-8.5 9S4 16.97 4 12c0-1.93.516-3.74 1.418-5.275C6.916 4.32 9.295 3 12 3c2.704 0 5.083 1.32 6.582 3.725A8.964 8.964 0 0 1 20 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Verificable
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  El código es auditable. Si quieres revisarlo, está disponible.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PROMISES.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-ufpso-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-ufpso-900/60"
              >
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-state-approved"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {p.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
