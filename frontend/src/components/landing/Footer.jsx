export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ufpso-500 to-ufpso-700 text-white font-extrabold">
                P
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pensum Tracker
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Universidad Francisco de Paula Santander Ocaña
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-slate-600 dark:text-slate-400">
              Hecho por un estudiante UFPSO para la comunidad estudiantil UFPSO.
              Gratis y para siempre.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Navegación
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <FooterLink href="#como-funciona">Cómo funciona</FooterLink>
              <FooterLink href="#features">Funcionalidades</FooterLink>
              <FooterLink href="#guia">Guía PDFs</FooterLink>
              <FooterLink href="#faq">FAQ</FooterLink>
              <FooterLink href="#empezar">Empezar</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recursos
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <FooterLink href="https://siaweb.ufpso.edu.co" external>
                Portal SIA UFPSO
              </FooterLink>
              <FooterLink href="https://www.ufpso.edu.co" external>
                Sitio oficial UFPSO
              </FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Pensum Tracker. Proyecto independiente
            sin afiliación oficial con UFPSO.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hecho con cariño en Ocaña, Colombia
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, external, children }) {
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="inline-flex items-center gap-1 text-slate-600 transition hover:text-ufpso-600 dark:text-slate-400 dark:hover:text-ufpso-400"
      >
        {children}
        {external && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        )}
      </a>
    </li>
  );
}
