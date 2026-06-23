import { useEffect, useState } from "react";

/**
 * useState que sincroniza el valor con localStorage automáticamente.
 *
 * - El valor inicial se lee de localStorage (si existe), si no usa defaultValue.
 * - Cada cambio se persiste con JSON.stringify.
 * - Si JSON.parse falla, se usa defaultValue (cache corrupto se descarta).
 */
export default function usePersistentState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded o storage no disponible */
    }
  }, [key, value]);

  return [value, setValue];
}
