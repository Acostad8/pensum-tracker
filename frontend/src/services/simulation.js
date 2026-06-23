/**
 * Lógica del simulador "¿qué pasa si...?".
 *
 * Toma el análisis original + un Set de códigos marcados como
 * "simulados como aprobados" y devuelve un análisis enriquecido
 * con stats recalculados y materias actualizadas.
 */

export function isSimulated(materia, simulatedCodes) {
  return simulatedCodes.has(materia.codigo);
}

export function buildSimulatedData(originalData, simulatedCodes) {
  if (simulatedCodes.size === 0) {
    return { data: originalData, hasSimulation: false, extraCredits: 0 };
  }

  const allMaterias = Object.values(originalData.materias_por_semestre).flat();
  const realAprobadasCodes = new Set(
    allMaterias.filter((m) => m.estado === "APROBADA").map((m) => m.codigo),
  );
  const aprobadasExtendido = new Set([...realAprobadasCodes, ...simulatedCodes]);

  let extraCredits = 0;
  const materiasSim = {};
  for (const [sem, materias] of Object.entries(originalData.materias_por_semestre)) {
    materiasSim[sem] = materias.map((m) => {
      if (simulatedCodes.has(m.codigo) && m.estado !== "APROBADA") {
        extraCredits += m.creditos;
        return {
          ...m,
          estado: "APROBADA",
          nota: null,
          periodo_cursado: "simulado",
          puede_cursar: true,
          _simulated: true,
        };
      }
      // Recomputar puede_cursar para que las materias bloqueadas se desbloqueen
      const puedeCursar = m.prerrequisitos.every((p) => aprobadasExtendido.has(p));
      return { ...m, puede_cursar: puedeCursar };
    });
  }

  const estReal = originalData.estadisticas;
  const newCredAprobados = estReal.creditos_aprobados + extraCredits;
  const newCredRestantes = Math.max(0, estReal.creditos_totales_pensum - newCredAprobados);
  const newPorcentaje =
    estReal.creditos_totales_pensum > 0
      ? (newCredAprobados / estReal.creditos_totales_pensum) * 100
      : 0;
  const newSemRestantes =
    estReal.promedio_creditos_por_semestre > 0
      ? Math.ceil(newCredRestantes / estReal.promedio_creditos_por_semestre)
      : 0;
  const newAprobCount = estReal.materias_aprobadas_count + simulatedCodes.size;
  const newPendCount = Math.max(0, estReal.materias_pendientes_count - simulatedCodes.size);

  return {
    data: {
      ...originalData,
      estadisticas: {
        ...estReal,
        creditos_aprobados: newCredAprobados,
        creditos_restantes: newCredRestantes,
        porcentaje_avance: Math.round(newPorcentaje * 100) / 100,
        semestres_restantes_estimados: newSemRestantes,
        materias_aprobadas_count: newAprobCount,
        materias_pendientes_count: newPendCount,
      },
      materias_por_semestre: materiasSim,
    },
    hasSimulation: true,
    extraCredits,
    originalStats: estReal,
  };
}
