import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 70;
const COL_GAP = 80;
const ROW_GAP = 20;

const STATE_NODE_STYLES = {
  APROBADA:
    "bg-state-approvedBg border-state-approved/60 text-green-900 dark:bg-green-900/40 dark:text-green-100",
  AVAILABLE:
    "bg-white border-state-available/60 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  BLOCKED:
    "bg-state-pendingBg border-slate-300 text-slate-500 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-400",
  REPROBADA:
    "bg-state-failedBg border-state-failed/60 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100",
  SIMULATED:
    "bg-purple-50 border-purple-500 border-dashed text-purple-900 dark:bg-purple-900/40 dark:text-purple-100",
};

function stateKey(m) {
  if (m._simulated) return "SIMULATED";
  if (m.estado === "APROBADA") return "APROBADA";
  if (m.estado === "REPROBADA") return "REPROBADA";
  return m.puede_cursar ? "AVAILABLE" : "BLOCKED";
}

function SubjectNode({ data }) {
  const m = data.materia;
  const key = stateKey(m);
  const styles = STATE_NODE_STYLES[key];
  return (
    <div
      className={`rounded-lg border-2 px-3 py-2 text-xs shadow-sm transition ${styles}`}
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
      title={`${m.codigo} — ${m.nombre}${
        m.prerrequisitos.length
          ? `\nPrerrequisitos: ${m.prerrequisitos.join(", ")}`
          : ""
      }${m.nota != null ? `\nNota: ${m.nota}` : ""}${
        m._simulated ? "\n(Simulada como aprobada)" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-slate-400"
      />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] opacity-70">{m.codigo}</span>
        <span className="text-[10px] font-bold">{m.creditos} cr</span>
      </div>
      <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-tight">
        {m.nombre}
      </p>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-slate-400"
      />
    </div>
  );
}

const nodeTypes = { subject: SubjectNode };

function edgeColor(sourceKey, isDark) {
  if (sourceKey === "APROBADA" || sourceKey === "SIMULATED") {
    return sourceKey === "SIMULATED"
      ? isDark
        ? "#c084fc"
        : "#9333ea"
      : isDark
      ? "#22c55e"
      : "#16a34a";
  }
  if (sourceKey === "BLOCKED") return isDark ? "#475569" : "#cbd5e1";
  return isDark ? "#64748b" : "#94a3b8";
}

export default function PrerequisitesGraph({ materiasPorSemestre, theme }) {
  const [isInteractive, setIsInteractive] = useState(true);

  const { nodes, edges } = useMemo(() => {
    const allMaterias = Object.values(materiasPorSemestre).flat();
    const byCode = new Map(allMaterias.map((m) => [m.codigo, m]));
    const isDark = theme === "dark";

    const nodesArr = [];
    const semestres = Object.keys(materiasPorSemestre)
      .map(Number)
      .sort((a, b) => a - b);

    for (const sem of semestres) {
      const materias = materiasPorSemestre[sem];
      materias.forEach((m, idx) => {
        nodesArr.push({
          id: m.codigo,
          type: "subject",
          position: {
            x: (sem - 1) * (NODE_WIDTH + COL_GAP),
            y: idx * (NODE_HEIGHT + ROW_GAP),
          },
          data: { materia: m },
        });
      });
    }

    const edgesArr = [];
    for (const m of allMaterias) {
      for (const prereq of m.prerrequisitos) {
        if (!byCode.has(prereq)) continue;
        const source = byCode.get(prereq);
        const sKey = stateKey(source);
        const isActive = sKey === "APROBADA" || sKey === "SIMULATED";
        edgesArr.push({
          id: `${prereq}-${m.codigo}`,
          source: prereq,
          target: m.codigo,
          type: "smoothstep",
          animated: isActive,
          style: {
            stroke: edgeColor(sKey, isDark),
            strokeWidth: isActive ? 2 : 1.5,
            strokeDasharray: sKey === "SIMULATED" ? "4 4" : undefined,
          },
        });
      }
    }

    return { nodes: nodesArr, edges: edgesArr };
  }, [materiasPorSemestre, theme]);

  return (
    <div
      className={`card overflow-hidden ${theme === "dark" ? "[&_.react-flow__attribution]:!bg-slate-900 [&_.react-flow__attribution_a]:!text-slate-400" : ""}`}
      style={{ height: "70vh", minHeight: "500px" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: false }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{ type: "smoothstep" }}
        nodesDraggable={isInteractive}
        nodesConnectable={isInteractive}
        elementsSelectable={isInteractive}
        panOnDrag={isInteractive}
        zoomOnScroll={isInteractive}
        zoomOnPinch={isInteractive}
        zoomOnDoubleClick={isInteractive}
      >
        <Background
          color={theme === "dark" ? "#334155" : "#e2e8f0"}
          gap={20}
        />
        <Controls
          showInteractive
          onInteractiveChange={(next) => setIsInteractive(next)}
          className={
            theme === "dark"
              ? "[&_button]:!bg-slate-800 [&_button]:!border-slate-700 [&_button:hover]:!bg-slate-700 [&_button_svg]:!fill-slate-300"
              : ""
          }
        />
        <MiniMap
          nodeColor={(node) => {
            const m = node.data?.materia;
            if (!m) return "#94a3b8";
            const s = stateKey(m);
            if (s === "SIMULATED") return "#9333ea";
            if (s === "APROBADA") return "#16a34a";
            if (s === "AVAILABLE") return "#0ea5e9";
            if (s === "REPROBADA") return "#ea580c";
            return theme === "dark" ? "#475569" : "#cbd5e1";
          }}
          maskColor={
            theme === "dark" ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.7)"
          }
          style={{
            backgroundColor: theme === "dark" ? "#1e293b" : "#f8fafc",
          }}
        />
      </ReactFlow>
    </div>
  );
}
