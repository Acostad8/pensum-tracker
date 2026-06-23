/**
 * Banner para estudiantes nuevos (sin materias aprobadas todavía).
 */
export default function WelcomeNotice({ studentName }) {
  return (
    <div className="rounded-xl border border-ufpso-200 bg-gradient-to-r from-ufpso-50 to-white p-5 dark:border-ufpso-900/50 dark:from-ufpso-900/20 dark:to-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ufpso-100 text-ufpso-600 dark:bg-ufpso-900/40 dark:text-ufpso-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              ¡Bienvenido, {studentName.split(" ")[0]}!
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Aún no tienes materias aprobadas. Explora tu pénsum debajo para
              ver qué materias puedes cursar primero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
