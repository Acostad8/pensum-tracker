import { describe, it, expect } from "vitest";
import { friendlyError } from "../errorMessages";

describe("friendlyError", () => {
  it("detecta archivos invertidos", () => {
    const res = friendlyError("invertiste los archivos: subiste...");
    expect(res.title).toBe("Archivos invertidos");
  });

  it("detecta no es un PDF", () => {
    const res = friendlyError("El archivo 'x' no es un PDF");
    expect(res.title).toBe("Formato no válido");
  });

  it("detecta failed to fetch", () => {
    const res = friendlyError("Failed to fetch");
    expect(res.title).toBe("Sin conexión con el servidor");
  });

  it("detecta pénsum vacío", () => {
    const res = friendlyError("No se pudieron extraer materias del pénsum.");
    expect(res.title).toBe("Pénsum vacío o no reconocido");
  });

  it("fallback con mensaje genérico", () => {
    const res = friendlyError("Algún error raro");
    expect(res.title).toBe("Error al procesar los PDFs");
    expect(res.message).toBe("Algún error raro");
  });

  it("fallback con null/undefined", () => {
    const res = friendlyError(null);
    expect(res.title).toBe("Error al procesar los PDFs");
    expect(res.message).toContain("inesperado");
  });

  it("siempre retorna title y message", () => {
    const cases = ["", "x", "y", "Failed to fetch"];
    for (const c of cases) {
      const r = friendlyError(c);
      expect(r.title).toBeTruthy();
      expect(r.message).toBeTruthy();
    }
  });
});
