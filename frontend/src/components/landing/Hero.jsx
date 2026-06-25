import DashboardMockup from "./DashboardMockup";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32"
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-radial-fade dark:opacity-50" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-grid-pattern dark:bg-grid-pattern-dark"
        style={{ backgroundSize: "32px 32px" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-ufpso-400 to-ufpso-700 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Texto */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-ufpso-200 bg-white/60 px-3 py-1 text-xs font-medium text-ufpso-700 backdrop-blur dark:border-ufpso-900/60 dark:bg-slate-900/40 dark:text-ufpso-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ufpso-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ufpso-500" />
              </span>
              Hecho para estudiantes UFPSO
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
              Visualiza tu avance académico{" "}
              <span className="bg-gradient-to-r from-ufpso-600 to-ufpso-800 bg-clip-text text-transparent dark:from-ufpso-400 dark:to-ufpso-600">
                en segundos
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
              Sube los 2 PDFs de tu portal SIA y obtén un análisis visual de tu pénsum,
              cuántos semestres te faltan, un simulador de escenarios y recomendaciones
              inteligentes del próximo semestre.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#empezar"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ufpso-600 to-ufpso-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-ufpso-600/20 transition hover:shadow-xl hover:shadow-ufpso-600/30 hover:from-ufpso-700 hover:to-ufpso-800"
              >
                Analizar mi pénsum
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800 dark:hover:bg-slate-800"
              >
                Ver cómo funciona
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              <TrustBadge icon="check">Sin registro</TrustBadge>
              <TrustBadge icon="shield">100% privado</TrustBadge>
              <TrustBadge icon="bolt">Resultado en 2 segundos</TrustBadge>
            </ul>
          </div>

          {/* Mockup del dashboard */}
          <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div
              className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-ufpso-100 via-transparent to-ufpso-200 opacity-50 blur-2xl dark:from-ufpso-900/40 dark:to-ufpso-700/30"
              aria-hidden="true"
            />
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon, children }) {
  const ICONS = {
    check: (
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    ),
    shield: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 4.97-3.582 9-8.5 9S4 16.97 4 12c0-1.93.516-3.74 1.418-5.275C6.916 4.32 9.295 3 12 3c2.704 0 5.083 1.32 6.582 3.725A8.964 8.964 0 0 1 20 12" />
    ),
    bolt: (
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    ),
  };
  return (
    <li className="flex items-center gap-1.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-ufpso-600 dark:text-ufpso-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        {ICONS[icon]}
      </svg>
      {children}
    </li>
  );
}
