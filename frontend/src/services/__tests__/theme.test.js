import { describe, it, expect, beforeEach, vi } from "vitest";
import { applyTheme, persistTheme, getInitialTheme } from "../theme";

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  describe("applyTheme", () => {
    it("añade la clase dark al root", () => {
      applyTheme("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("quita la clase dark con light", () => {
      document.documentElement.classList.add("dark");
      applyTheme("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("persistTheme", () => {
    it("guarda en localStorage", () => {
      persistTheme("dark");
      expect(localStorage.getItem("pensum-tracker:theme")).toBe("dark");
    });
  });

  describe("getInitialTheme", () => {
    it("usa el tema guardado en localStorage", () => {
      localStorage.setItem("pensum-tracker:theme", "dark");
      expect(getInitialTheme()).toBe("dark");
    });

    it("ignora valores inválidos en localStorage", () => {
      localStorage.setItem("pensum-tracker:theme", "purple");
      // Sin preferencia del SO mockeada → fallback a light
      vi.stubGlobal("matchMedia", undefined);
      expect(getInitialTheme()).toBe("light");
      vi.unstubAllGlobals();
    });

    it("usa preferencia del SO si no hay valor guardado", () => {
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      expect(getInitialTheme()).toBe("dark");
      vi.unstubAllGlobals();
    });

    it("fallback a light si el SO prefiere claro", () => {
      vi.stubGlobal("matchMedia", () => ({ matches: false }));
      expect(getInitialTheme()).toBe("light");
      vi.unstubAllGlobals();
    });
  });
});
