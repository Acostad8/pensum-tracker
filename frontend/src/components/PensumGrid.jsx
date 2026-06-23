import SubjectCard from "./SubjectCard";

export default function PensumGrid({ materiasPorSemestre }) {
  const semestres = Object.keys(materiasPorSemestre)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex min-w-full gap-3">
        {semestres.map((sem) => {
          const materias = materiasPorSemestre[sem];
          const aprobadas = materias.filter((m) => m.estado === "APROBADA").length;
          const creditosSem = materias
            .filter((m) => m.tipo === "OBLIGATORIA")
            .reduce((acc, m) => acc + m.creditos, 0);

          return (
            <div
              key={sem}
              className="flex w-64 flex-shrink-0 flex-col rounded-xl bg-white shadow-sm ring-1 ring-slate-200"
            >
              <div className="rounded-t-xl border-b border-slate-200 bg-gradient-to-r from-ufpso-600 to-ufpso-700 px-3 py-2 text-white">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold">Semestre {sem}</h3>
                  <span className="text-[10px] opacity-90">
                    {aprobadas}/{materias.length}
                  </span>
                </div>
                <p className="text-[10px] opacity-80">{creditosSem} créditos</p>
              </div>
              <div className="flex flex-col gap-2 p-2">
                {materias.map((m) => (
                  <SubjectCard key={m.codigo} materia={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
