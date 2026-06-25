export default function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-ufpso-600 via-ufpso-700 to-ufpso-800 px-6 py-14 text-center shadow-2xl shadow-ufpso-900/20 sm:px-12 sm:py-20">
        <div
          className="absolute inset-0 bg-grid-pattern-dark"
          style={{ backgroundSize: "32px 32px" }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            ¿Listo para ver tu avance?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Solo necesitas los 2 PDFs de tu portal SIA. En 2 segundos tendrás tu
            análisis completo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#empezar"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-bold text-ufpso-700 shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
            >
              Analizar mi pénsum
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="#guia"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-base font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
            >
              ¿Cómo descargar los PDFs?
            </a>
          </div>
          <p className="mt-6 text-xs text-white/70">
            Gratis · Sin registro · Sin instalar nada
          </p>
        </div>
      </div>
    </section>
  );
}
