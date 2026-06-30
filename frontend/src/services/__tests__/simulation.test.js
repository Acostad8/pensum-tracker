import { describe, it, expect } from "vitest";
import { buildSimulatedData, isSimulated } from "../simulation";

function baseData() {
  return {
    pensum_carrera: "Ingeniería de Sistemas",
    estadisticas: {
      creditos_totales_pensum: 30,
      creditos_aprobados: 9,
      creditos_restantes: 21,
      porcentaje_avance: 30,
      promedio_creditos_por_semestre: 9,
      semestres_restantes_estimados: 3,
      materias_aprobadas_count: 3,
      materias_pendientes_count: 7,
    },
    materias_por_semestre: {
      1: [
        {
          codigo: "A", nombre: "A", creditos: 3, semestre: 1,
          tipo: "OBLIGATORIA", estado: "APROBADA", prerrequisitos: [],
          puede_cursar: true,
        },
      ],
      2: [
        {
          codigo: "B", nombre: "B", creditos: 3, semestre: 2,
          tipo: "OBLIGATORIA", estado: "PENDIENTE", prerrequisitos: ["A"],
          puede_cursar: true,
        },
        {
          codigo: "C", nombre: "C", creditos: 3, semestre: 2,
          tipo: "OBLIGATORIA", estado: "PENDIENTE", prerrequisitos: ["A"],
          puede_cursar: true,
        },
      ],
      3: [
        {
          codigo: "D", nombre: "D", creditos: 3, semestre: 3,
          tipo: "OBLIGATORIA", estado: "PENDIENTE", prerrequisitos: ["B"],
          puede_cursar: false,
        },
      ],
    },
  };
}

describe("isSimulated", () => {
  it("retorna true si el código está en el set", () => {
    const set = new Set(["A", "B"]);
    expect(isSimulated({ codigo: "A" }, set)).toBe(true);
    expect(isSimulated({ codigo: "C" }, set)).toBe(false);
  });
});

describe("buildSimulatedData", () => {
  it("retorna datos originales si no hay simulaciones", () => {
    const data = baseData();
    const res = buildSimulatedData(data, new Set());
    expect(res.hasSimulation).toBe(false);
    expect(res.data).toBe(data);
    expect(res.extraCredits).toBe(0);
  });

  it("marca materia simulada como APROBADA", () => {
    const data = baseData();
    const res = buildSimulatedData(data, new Set(["B"]));
    expect(res.hasSimulation).toBe(true);
    const b = res.data.materias_por_semestre[2].find((m) => m.codigo === "B");
    expect(b.estado).toBe("APROBADA");
    expect(b._simulated).toBe(true);
    expect(b.periodo_cursado).toBe("simulado");
  });

  it("desbloquea materias dependientes al simular el prerrequisito", () => {
    const data = baseData();
    const res = buildSimulatedData(data, new Set(["B"]));
    const d = res.data.materias_por_semestre[3].find((m) => m.codigo === "D");
    expect(d.puede_cursar).toBe(true);
  });

  it("acumula extraCredits solo de materias no aprobadas", () => {
    const data = baseData();
    // A ya está aprobada → no debería sumar; B sí
    const res = buildSimulatedData(data, new Set(["A", "B"]));
    expect(res.extraCredits).toBe(3);
  });

  it("recalcula estadísticas al simular", () => {
    const data = baseData();
    const res = buildSimulatedData(data, new Set(["B", "C"]));
    const est = res.data.estadisticas;
    expect(est.creditos_aprobados).toBe(15);  // 9 + 6
    expect(est.creditos_restantes).toBe(15);
    expect(est.porcentaje_avance).toBe(50);
    expect(est.materias_aprobadas_count).toBe(5);
    expect(est.materias_pendientes_count).toBe(5);
  });

  it("expone originalStats para comparación", () => {
    const data = baseData();
    const res = buildSimulatedData(data, new Set(["B"]));
    expect(res.originalStats.creditos_aprobados).toBe(9);
  });

  it("no muta el objeto original", () => {
    const data = baseData();
    const before = JSON.stringify(data);
    buildSimulatedData(data, new Set(["B", "C"]));
    expect(JSON.stringify(data)).toBe(before);
  });

  it("semestres restantes usa el promedio_creditos_por_semestre", () => {
    const data = baseData();
    // promedio = 9 cr/sem, restantes = 15 → ceil(15/9) = 2
    const res = buildSimulatedData(data, new Set(["B", "C"]));
    expect(res.data.estadisticas.semestres_restantes_estimados).toBe(2);
  });
});
