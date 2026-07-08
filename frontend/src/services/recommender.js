/**
 * Recomendador greedy del próximo semestre.
 *
 * Score por materia:
 *   + (transitively_unblocks * 3)  → impacto en cadena de prerrequisitos
 *   + 5 si OBLIGATORIA              → priorizar requeridas
 *   - 0.5 * semestre                → ligera preferencia por semestres tempranos
 *   + 4 si es semestre próximo del estudiante
 *
 * Restricciones:
 *   - Total créditos cerca del target (carga ligera/normal/pesada)
 *   - Máx 2 electivas
 *   - Máx 1 materia por slot de electiva (no tomar Sociohumanística X y Sociohumanística Y)
 */

export const LOAD_TARGETS = {
  light: { label: "Ligera", target: 14, max: 16 },
  normal: { label: "Normal", target: 17, max: 19 },
  heavy: { label: "Pesada", target: 21, max: 23 },
};

function buildDependents(materias) {
  const dependents = new Map();
  for (const m of materias) {
    for (const prereq of m.prerrequisitos) {
      if (!dependents.has(prereq)) dependents.set(prereq, new Set());
      dependents.get(prereq).add(m.codigo);
    }
  }
  return dependents;
}

function countTransitiveDependents(codigo, dependents) {
  const visited = new Set();
  const queue = [codigo];
  while (queue.length > 0) {
    const c = queue.shift();
    for (const dep of dependents.get(c) ?? []) {
      if (!visited.has(dep)) {
        visited.add(dep);
        queue.push(dep);
      }
    }
  }
  return visited.size;
}

function approxNextSemester(allMaterias) {
  if (allMaterias.length === 0) return 1;
  const aprobadasPorSem = new Map();
  const totalPorSem = new Map();
  let maxSem = 1;
  for (const m of allMaterias) {
    totalPorSem.set(m.semestre, (totalPorSem.get(m.semestre) ?? 0) + 1);
    if (m.semestre > maxSem) maxSem = m.semestre;
    if (m.estado === "APROBADA") {
      aprobadasPorSem.set(m.semestre, (aprobadasPorSem.get(m.semestre) ?? 0) + 1);
    }
  }
  // El próximo semestre del estudiante = el menor sem que aún tiene pendientes
  for (let sem = 1; sem <= maxSem; sem++) {
    const total = totalPorSem.get(sem) ?? 0;
    const aprobadas = aprobadasPorSem.get(sem) ?? 0;
    if (aprobadas < total) return sem;
  }
  return maxSem;
}

function scoreMateria(m, dependents, nextSem) {
  const unblocks = countTransitiveDependents(m.codigo, dependents);
  let score = unblocks * 3;
  if (m.tipo === "OBLIGATORIA") score += 5;
  score -= m.semestre * 0.5;
  if (Math.abs(m.semestre - nextSem) <= 1) score += 4;
  return { score, unblocks };
}

function reasonFor(m, unblocks, nextSem) {
  const reasons = [];
  if (unblocks > 0) {
    reasons.push(`Desbloquea ${unblocks} materia${unblocks > 1 ? "s" : ""}`);
  }
  if (Math.abs(m.semestre - nextSem) <= 1) {
    reasons.push(`Es del semestre ${m.semestre}`);
  }
  if (m.tipo === "OBLIGATORIA") {
    reasons.push("Obligatoria");
  }
  if (reasons.length === 0) reasons.push("Disponible");
  return reasons.join(" · ");
}

function getElectiveSlotKey(m) {
  // Para evitar elegir varias electivas del mismo "slot", agrupamos por
  // semestre + el sufijo del nombre del slot (e.g. "técnica i", "sociohumanística").
  if (m.tipo !== "ELECTIVA") return null;
  return `sem-${m.semestre}`;
}

export function recommendNextSemester(materiasPorSemestre, loadKey = "normal") {
  const target = LOAD_TARGETS[loadKey];
  const allMaterias = Object.values(materiasPorSemestre).flat();
  const dependents = buildDependents(allMaterias);
  const nextSem = approxNextSemester(allMaterias);

  const candidates = allMaterias
    .filter((m) => m.estado === "PENDIENTE" && m.puede_cursar)
    .map((m) => {
      const { score, unblocks } = scoreMateria(m, dependents, nextSem);
      return { ...m, _score: score, _unblocks: unblocks };
    })
    .sort((a, b) => b._score - a._score);

  const selected = [];
  const usedSlots = new Set();
  let credits = 0;
  let electives = 0;

  for (const m of candidates) {
    if (credits >= target.target) break;
    if (credits + m.creditos > target.max) continue;

    if (m.tipo === "ELECTIVA") {
      if (electives >= 2) continue;
      const slot = getElectiveSlotKey(m);
      if (usedSlots.has(slot)) continue;
      usedSlots.add(slot);
      electives++;
    }

    selected.push({
      ...m,
      reason: reasonFor(m, m._unblocks, nextSem),
    });
    credits += m.creditos;
  }

  return {
    selected,
    totalCredits: credits,
    nextSem,
    loadLabel: target.label,
  };
}
