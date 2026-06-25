import { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#features", label: "Funcionalidades" },
  { href: "#guia", label: "Guía" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ufpso-500 to-ufpso-700 text-white font-extrabold shadow-sm transition-transform group-hover:scale-105">
            P
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Pensum Tracker
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              UFPSO
            </p>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <a
            href="#empezar"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-ufpso-600 to-ufpso-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:from-ufpso-700 hover:to-ufpso-800"
          >
            Empezar
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 ring-1 ring-slate-200 dark:text-slate-300 dark:ring-slate-700"
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18 18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"} />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#empezar"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-ufpso-600 px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Empezar →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
