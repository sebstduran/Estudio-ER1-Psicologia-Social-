import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Button, Card, TipoMapeoBadge } from "@/components/ui";
import { eliminarAsignatura, ciclarMapeo } from "@/lib/actions/asignaturas";
import { eliminarCompetencia } from "@/lib/actions/competencias";
import { actualizarReunionActual } from "@/lib/actions/niveles";
import { AsignaturaForm } from "./asignatura-form";
import { CompetenciaForm } from "./competencia-form";

const CICLO_LABEL = {
  INICIAL: "Ciclo Inicial",
  INTERMEDIO: "Ciclo Intermedio",
  FINAL: "Ciclo Final",
} as const;

const MODALIDAD_LABEL = {
  DIURNO: "Diurno",
  VESPERTINO_TECH: "Vespertino/TECH",
} as const;

const FASE_LABEL = {
  BASE: "Línea base",
  SEGUIMIENTO: "Seguimiento",
  CIERRE: "Cierre comparativo",
} as const;

export default async function NivelDetallePage({
  params,
}: PageProps<"/niveles/[id]">) {
  const { id } = await params;
  const user = await requireCoordinador();

  const nivel = await prisma.nivel.findFirst({
    where: { id, coordinadorId: user.id },
    include: {
      asignaturas: {
        orderBy: { nombre: "asc" },
        include: { mapeos: true },
      },
      competencias: {
        orderBy: { orden: "asc" },
        include: { componenteEpg: true, indicadores: { orderBy: { orden: "asc" } } },
      },
      reuniones: { orderBy: { numero: "asc" } },
    },
  });

  if (!nivel) notFound();

  const componentes = await prisma.componenteEPG.findMany({ orderBy: { orden: "asc" } });

  const mapeoPorPar = new Map(
    nivel.asignaturas.flatMap((a) =>
      a.mapeos.map((m) => [`${a.id}:${m.competenciaId}`, m.tipo] as const)
    )
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{nivel.nombre}</h1>
          <p className="mt-1 text-sm text-muted">
            {CICLO_LABEL[nivel.cicloTipo]} · {MODALIDAD_LABEL[nivel.modalidad]} ·{" "}
            {nivel.trimestre}
          </p>
        </div>

        <Card className="flex items-center gap-3 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Reunión en curso
          </span>
          <div className="flex gap-1">
            {nivel.reuniones.map((r) => {
              const activa = r.numero === nivel.reunionActualNumero;
              const action = async () => {
                "use server";
                await actualizarReunionActual(nivel.id, r.numero);
              };
              return (
                <form action={action} key={r.id}>
                  <button
                    title={FASE_LABEL[r.fase]}
                    className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                      activa
                        ? "bg-ua text-white"
                        : "border border-border text-muted hover:border-ua"
                    }`}
                  >
                    R{r.numero}
                  </button>
                </form>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-8">
        {/* Asignaturas */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Asignaturas
          </h2>
          <Card className="flex flex-col gap-4">
            <AsignaturaForm nivelId={nivel.id} />
            {nivel.asignaturas.length === 0 ? (
              <p className="text-sm text-muted">Aún no agregas asignaturas.</p>
            ) : (
              <ul className="divide-y divide-border">
                {nivel.asignaturas.map((a) => {
                  const action = async () => {
                    "use server";
                    await eliminarAsignatura(nivel.id, a.id);
                  };
                  return (
                    <li key={a.id} className="flex items-center justify-between py-2">
                      <span className="text-sm">{a.nombre}</span>
                      <form action={action}>
                        <button className="text-xs text-muted hover:text-incipiente">
                          Eliminar
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>

        {/* Competencias */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Competencias de ciclo
          </h2>
          <div className="flex flex-col gap-4">
            {nivel.competencias.map((c) => {
              const action = async () => {
                "use server";
                await eliminarCompetencia(nivel.id, c.id);
              };
              return (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-ua">
                        {c.codigo} · {c.componenteEpg.nombre}
                      </p>
                      <h3 className="mt-1 font-medium">{c.nombre}</h3>
                      <p className="mt-1 text-sm text-muted">{c.descriptor}</p>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                        {c.indicadores.map((i) => (
                          <li key={i.id}>{i.texto}</li>
                        ))}
                      </ul>
                    </div>
                    <form action={action}>
                      <button className="shrink-0 text-xs text-muted hover:text-incipiente">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </Card>
              );
            })}
            <CompetenciaForm nivelId={nivel.id} componentes={componentes} />
          </div>
        </section>

        {/* Matriz de mapeo */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Mapeo asignatura × competencia
          </h2>
          <p className="mb-3 text-sm text-muted">
            Haz clic en una celda para ciclar: sin relación → directa → transversal.
          </p>
          {nivel.asignaturas.length === 0 || nivel.competencias.length === 0 ? (
            <Card className="text-sm text-muted">
              Agrega al menos una asignatura y una competencia para construir el mapeo.
            </Card>
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-surface p-3 text-left font-medium text-muted">
                      Asignatura
                    </th>
                    {nivel.competencias.map((c) => (
                      <th key={c.id} className="min-w-[120px] border-l border-border p-3 text-left font-medium text-muted">
                        {c.codigo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nivel.asignaturas.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="sticky left-0 bg-surface p-3 font-medium">{a.nombre}</td>
                      {nivel.competencias.map((c) => {
                        const tipo = mapeoPorPar.get(`${a.id}:${c.id}`) ?? null;
                        const action = async () => {
                          "use server";
                          await ciclarMapeo(nivel.id, a.id, c.id);
                        };
                        return (
                          <td key={c.id} className="border-l border-border p-2 text-center">
                            <form action={action}>
                              <button type="submit" className="w-full rounded-md p-1 hover:bg-surface-muted">
                                <TipoMapeoBadge tipo={tipo} />
                              </button>
                            </form>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
