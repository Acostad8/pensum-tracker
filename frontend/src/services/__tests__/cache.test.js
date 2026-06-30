import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveAnalysis,
  loadAnalysis,
  clearAnalysis,
  formatRelativeTime,
} from "../cache";

function validData() {
  return {
    estadisticas: {
      creditos_totales_pensum: 100,
      creditos_aprobados: 50,
    },
    materias_por_semestre: { 1: [] },
  };
}

describe("cache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("guarda y recupera análisis", () => {
    const data = validData();
    saveAnalysis(data);
    const loaded = loadAnalysis();
    expect(loaded).not.toBeNull();
    expect(loaded.data.estadisticas.creditos_aprobados).toBe(50);
    expect(typeof loaded.timestamp).toBe("number");
  });

  it("retorna null si no hay nada en cache", () => {
    expect(loadAnalysis()).toBeNull();
  });

  it("limpia el cache", () => {
    saveAnalysis(validData());
    clearAnalysis();
    expect(loadAnalysis()).toBeNull();
  });

  it("invalida cache con shape inválido", () => {
    // Forzamos un valor corrupto con la versión correcta
    localStorage.setItem("pensum-tracker:analysis", JSON.stringify({ foo: "bar" }));
    localStorage.setItem("pensum-tracker:timestamp", String(Date.now()));
    localStorage.setItem("pensum-tracker:version", "2");
    expect(loadAnalysis()).toBeNull();
  });

  it("invalida cache de versión vieja", () => {
    const data = validData();
    localStorage.setItem("pensum-tracker:analysis", JSON.stringify(data));
    localStorage.setItem("pensum-tracker:timestamp", String(Date.now()));
    localStorage.setItem("pensum-tracker:version", "1");  // versión vieja
    expect(loadAnalysis()).toBeNull();
  });

  it("invalida cache expirado (>30 días)", () => {
    const data = validData();
    const oldTs = Date.now() - 1000 * 60 * 60 * 24 * 31;
    localStorage.setItem("pensum-tracker:analysis", JSON.stringify(data));
    localStorage.setItem("pensum-tracker:timestamp", String(oldTs));
    localStorage.setItem("pensum-tracker:version", "2");
    expect(loadAnalysis()).toBeNull();
  });

  it("retorna null si JSON corrupto en localStorage", () => {
    localStorage.setItem("pensum-tracker:analysis", "{not valid json");
    localStorage.setItem("pensum-tracker:timestamp", String(Date.now()));
    localStorage.setItem("pensum-tracker:version", "2");
    expect(loadAnalysis()).toBeNull();
  });
});

describe("formatRelativeTime", () => {
  it("hace un momento", () => {
    expect(formatRelativeTime(Date.now())).toBe("hace un momento");
  });

  it("minutos", () => {
    expect(formatRelativeTime(Date.now() - 5 * 60 * 1000)).toBe("hace 5 min");
  });

  it("horas", () => {
    expect(formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000)).toBe("hace 3 h");
  });

  it("un día", () => {
    expect(formatRelativeTime(Date.now() - 25 * 60 * 60 * 1000)).toBe("hace 1 día");
  });

  it("varios días", () => {
    expect(formatRelativeTime(Date.now() - 5 * 24 * 60 * 60 * 1000)).toBe(
      "hace 5 días",
    );
  });
});
