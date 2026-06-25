const FAQS = [
  {
    q: "¿Es seguro subir mis PDFs académicos?",
    a: "Sí. Los archivos se procesan en memoria del servidor y se descartan al terminar el análisis. No se almacenan en disco ni en base de datos. El resultado se guarda únicamente en el localStorage de tu navegador (puedes borrarlo cuando quieras).",
  },
  {
    q: "¿Funciona para mi carrera?",
    a: "Por ahora está optimizado para los pénsums de UFPSO, especialmente Ingeniería de Sistemas. Si tu carrera usa el mismo formato de PDF que entrega el portal SIA (con tabla de materias, código, créditos y prerrequisitos), debería funcionar. Si encuentras algo raro, ¡cuéntanos!",
  },
  {
    q: "¿Necesito crear una cuenta?",
    a: "No. Cero registros, cero contraseñas. Solo subes tus 2 PDFs y listo. Esto significa que si limpias el caché de tu navegador, perderás el análisis (puedes volver a subir los PDFs en cualquier momento).",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Es completamente gratis. No hay planes Pro, ni anuncios, ni venta de datos. Es un proyecto personal hecho para la comunidad estudiantil de UFPSO.",
  },
  {
    q: "¿Qué pasa si me equivoco subiendo los archivos?",
    a: "El sistema detecta si subiste el pénsum como historial o viceversa y te avisa con un error claro. Solo tienes que intercambiarlos.",
  },
  {
    q: "¿El primer análisis tarda un poco?",
    a: "Si llevas mucho tiempo sin usar la app, el servidor podría tomar ~30 segundos en despertar (es el costo de tener hosting gratis). Después, los análisis tardan menos de 2 segundos.",
  },
  {
    q: "¿Por qué hay materias en gris?",
    a: 'Las materias en gris son las "bloqueadas": no tienes los prerrequisitos aprobados todavía. Una vez que apruebes las que faltan, se desbloquearán automáticamente y se pintarán de azul ("disponibles").',
  },
  {
    q: "¿Puedo planear hasta mi graduación?",
    a: "Con el simulador puedes marcar materias futuras como aprobadas hipotéticamente y ver cómo cambia tu avance. El recomendador te sugiere el próximo semestre. Para planear varios semestres, simula uno y luego usa el recomendador con la nueva proyección.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-ufpso-600 dark:text-ufpso-400">
            Preguntas frecuentes
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Lo que probablemente te preguntas
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-slate-200 bg-white open:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform group-open:rotate-180 dark:bg-slate-800 dark:text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
