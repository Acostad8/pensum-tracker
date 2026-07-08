import { describe, it, expect } from "vitest";
import { recommendNextSemester, LOAD_TARGETS } from "../recommender";

function materia(overrides) {
  return {
    codigo: "1000001",
    nombre: "Test",
    creditos: 3,
    semestre: 1,
    tipo: "OBLIGATORIA",
    estado: "PENDIENTE",
    prerrequisitos: [],
    puede_cursar: true,
    ...overrides,
  };
}

function porSemestre(materias) {
  const out = {};
  for (const m of materias) {
    (out[m.semestre] ||= []).push(m);
  }
  return out;
}

describe("recommendNextSemester", () => {
  it("retorna estructura básica con vacío", () => {
    const res = recommendNextSemester({}, "normal");
    expect(res.selected).toEqual([]);
    expect(res.totalCredits).toBe(0);
    expect(res.loadLabel).toBe("Normal");
  });

  it("solo considera materias PENDIENTE con puede_cursar=true", () => {
    const data = porSemestre([
      materia({ codigo: "A", semestre: 1, estado: "APROBADA" }),
      materia({ codigo: "B", semestre: 2, puede_cursar: false }),
      materia({ codigo: "C", semestre: 3 }),
    ]);
    const res = recommendNextSemester(data, "light");
    const codigos = res.selected.map((m) => m.codigo);
    expect(codigos).toContain("C");
    expect(codigos).not.toContain("A");
    expect(codigos).not.toContain("B");
  });

  it("respeta el target de créditos según la carga", () => {
    // 10 materias disponibles de 3 créditos cada una = 30 créditos posibles
    const materias = Array.from({ length: 10 }, (_, i) =>
      materia({ codigo: `1000${i.toString().padStart(3, "0")}`, semestre: 1 }),
    );
    const data = porSemestre(materias);

    const light = recommendNextSemester(data, "light");
    const normal = recommendNextSemester(data, "normal");
    const heavy = recommendNextSemester(data, "heavy");

    expect(light.totalCredits).toBeLessThanOrEqual(LOAD_TARGETS.light.max);
    expect(normal.totalCredits).toBeLessThanOrEqual(LOAD_TARGETS.normal.max);
    expect(heavy.totalCredits).toBeLessThanOrEqual(LOAD_TARGETS.heavy.max);
    expect(light.totalCredits).toBeLessThan(normal.totalCredits);
    expect(normal.totalCredits).toBeLessThan(heavy.totalCredits);
  });

  it("prioriza materias que desbloquean cadenas largas", () => {
    // A desbloquea B → C → D (3 dependientes transitivos)
    // X es una hoja sin dependientes
    const data = porSemestre([
      materia({ codigo: "A", semestre: 1, creditos: 3 }),
      materia({ codigo: "B", semestre: 2, prerrequisitos: ["A"], puede_cursar: false }),
      materia({ codigo: "C", semestre: 3, prerrequisitos: ["B"], puede_cursar: false }),
      materia({ codigo: "D", semestre: 4, prerrequisitos: ["C"], puede_cursar: false }),
      materia({ codigo: "X", semestre: 1, creditos: 3 }),
    ]);
    const res = recommendNextSemester(data, "light");
    expect(res.selected[0].codigo).toBe("A");
  });

  it("limita electivas a máximo 2", () => {
    const electivas = Array.from({ length: 5 }, (_, i) =>
      materia({
        codigo: `ELEC${i}`,
        semestre: i + 1,  // semestres distintos para no chocar por slot
        tipo: "ELECTIVA",
      }),
    );
    const data = porSemestre(electivas);
    const res = recommendNextSemester(data, "heavy");
    const electivasSeleccionadas = res.selected.filter(
      (m) => m.tipo === "ELECTIVA",
    );
    expect(electivasSeleccionadas.length).toBeLessThanOrEqual(2);
  });

  it("no incluye dos electivas del mismo semestre (slot)", () => {
    const data = porSemestre([
      materia({ codigo: "ELEC1", semestre: 5, tipo: "ELECTIVA" }),
      materia({ codigo: "ELEC2", semestre: 5, tipo: "ELECTIVA" }),
      materia({ codigo: "ELEC3", semestre: 6, tipo: "ELECTIVA" }),
    ]);
    const res = recommendNextSemester(data, "heavy");
    const semestres = res.selected
      .filter((m) => m.tipo === "ELECTIVA")
      .map((m) => m.semestre);
    expect(new Set(semestres).size).toBe(semestres.length);
  });

  it("incluye razón humana en cada selección", () => {
    const data = porSemestre([
      materia({ codigo: "A", semestre: 1 }),
    ]);
    const res = recommendNextSemester(data, "light");
    expect(res.selected[0].reason).toBeTruthy();
    expect(typeof res.selected[0].reason).toBe("string");
  });

  it("calcula nextSem como el primer semestre con pendientes", () => {
    const data = porSemestre([
      materia({ codigo: "A", semestre: 1, estado: "APROBADA" }),
      materia({ codigo: "B", semestre: 2, estado: "APROBADA" }),
      materia({ codigo: "C", semestre: 3 }),
    ]);
    const res = recommendNextSemester(data, "normal");
    expect(res.nextSem).toBe(3);
  });

  it("no excede target.max al sumar la siguiente materia", () => {
    const data = porSemestre([
      materia({ codigo: "A", semestre: 1, creditos: 10 }),
      materia({ codigo: "B", semestre: 1, creditos: 10 }),
    ]);
    const res = recommendNextSemester(data, "light");  // max=16
    expect(res.totalCredits).toBeLessThanOrEqual(LOAD_TARGETS.light.max);
  });
});
