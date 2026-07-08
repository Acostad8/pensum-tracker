import { useEffect, useRef, useState } from "react";
import { exportAsPdf, exportAsPng } from "../services/exporter";

/**
 * Espera a que React aplique los cambios pendientes antes de capturar.
 * Usamos requestAnimationFrame x 2 para garantizar paint completo.
 */
function waitForRender() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export default function ExportMenu({
  targetRef,
  cardRef,
  studentName,
  onPrepareExport,
  onAfterExport,
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleExport(format) {
    setBusy(format);
    setOpen(false);
    try {
      onPrepareExport?.(format);
      await waitForRender();
      if (format === "png") {
        if (!cardRef.current) throw new Error("Export card not mounted");
        await exportAsPng(cardRef.current, studentName);
      } else {
        if (!targetRef.current) throw new Error("Export target not mounted");
        await exportAsPdf(targetRef.current, studentName);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("No fue posible exportar. Intenta de nuevo.");
    } finally {
      onAfterExport?.();
      setBusy(null);
    }
  }

  return (
    <div className="relative" ref={wrapperRef} data-export-ignore="true">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy !== null}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ufpso-500 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        {busy ? `Generando ${busy.toUpperCase()}...` : "Exportar"}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport("png")}
            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Imagen (.png)
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport("pdf")}
            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Documento (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}
