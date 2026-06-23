const VIEWS = [
  {
    key: "grid",
    label: "Grid",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
        />
      </svg>
    ),
  },
  {
    key: "graph",
    label: "Grafo",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <circle cx="6" cy="6" r="2.25" />
        <circle cx="18" cy="6" r="2.25" />
        <circle cx="6" cy="18" r="2.25" />
        <circle cx="18" cy="18" r="2.25" />
        <path
          strokeLinecap="round"
          d="M8.25 6h7.5M8.25 18h7.5M6 8.25v7.5M18 8.25v7.5"
        />
      </svg>
    ),
  },
];

export default function ViewSwitcher({ view, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Modo de visualización del pénsum"
      className="inline-flex rounded-lg bg-white p-1 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
    >
      {VIEWS.map((v) => {
        const active = view === v.key;
        return (
          <button
            key={v.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`Vista ${v.label}`}
            onClick={() => onChange(v.key)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-ufpso-500 ${
              active
                ? "bg-ufpso-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {v.icon}
            <span>{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
