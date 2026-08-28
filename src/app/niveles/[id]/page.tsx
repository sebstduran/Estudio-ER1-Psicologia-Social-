import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Button, Card, Eyebrow, SectionLabel, TipoMapeoBadge } from "@/components/ui";
import { eliminarAsignatura, ciclarMapeo } from "@/lib/actions/asignaturas";
import { eliminarCompetencia } from "@/lib/actions/competencias";
import { eliminarDocente } from "@/lib/actions/docentes";
import { actualizarReunionActual } from "@/lib/actions/niveles";
import { AsignaturaForm } from "./asignatura-form";
import { CompetenciaForm } from "./competencia-form";
import { DocenteForm } from "./docente-form";

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
      docentes: {
        orderBy: { nombre: "asc" },
        include: { asignaturas: { include: { asignatura: true } } },
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

  const reunionActual = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-5">
        <div>
          <Eyebrow>{CICLO_LABEL[nivel.cicloTipo]}</Eyebrow>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight">{nivel.nombre}</h1>
          <p className="mt-1.5 text-sm text-muted">
            {MODALIDAD_LABEL[nivel.modalidad]} · {nivel.trimestre}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/niveles/${nivel.id}/resultados`}>
            <Button variant="secondary">Ver resultados</Button>
          </Link>
          <Link href={`/evaluar/${nivel.id}`} target="_blank">
            <Button variant="secondary">Abrir enlace para docentes ↗</Button>
          </Link>

          <Card className="flex items-center gap-3 !rounded-full !border-border !py-2 !pl-4 !pr-2 !shadow-none">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-2">
              Reunión
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
                      className={`h-8 w-8 rounded-full text-sm font-medium transition-all ${
                        activa
                          ? "bg-ua text-white shadow-[0_2px_8px_-2px_rgba(138,21,21,0.5)]"
                          : "text-muted hover:bg-surface-hover hover:text-foreground"
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
      </div>

      {reunionActual && (
        <p className="-mt-6 mb-10 text-xs text-muted-2">
          Reunión en curso: <span className="text-muted">{FASE_LABEL[reunionActual.fase]}</span> ·
          las evaluaciones que registren los docentes ahora quedan guardadas bajo R{reunionActual.numero}.
        </p>
      )}

      <div className="grid gap-10">
        {/* Asignaturas */}
        <section>
          <SectionLabel>Asignaturas</SectionLabel>
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
                    <li key={a.id} className="flex items-center justify-between py-2.5">
                      <span className="text-sm">{a.nombre}</span>
                      <form action={action}>
                        <button className="text-xs text-muted-2 transition-colors hover:text-incipiente">
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

        {/* Docentes */}
        <section>
          <SectionLabel>Docentes</SectionLabel>
          <Card className="flex flex-col gap-5">
            <DocenteForm
              nivelId={nivel.id}
              asignaturas={nivel.asignaturas.map((a) => ({ id: a.id, nombre: a.nombre }))}
            />
            {nivel.docentes.length > 0 && (
              <ul className="divide-y divide-border">
                {nivel.docentes.map((d) => {
                  const action = async () => {
                    "use server";
                    await eliminarDocente(nivel.id, d.id);
                  };
                  return (
                    <li key={d.id} className="flex items-center justify-between gap-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{d.nombre}</p>
                        <p className="text-xs text-muted-2">
                          {d.asignaturas.map((da) => da.asignatura.nombre).join(" · ") || "Sin asignaturas"}
                        </p>
                      </div>
                      <form action={action}>
                        <button className="shrink-0 text-xs text-muted-2 transition-colors hover:text-incipiente">
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
          <SectionLabel>Competencias de ciclo</SectionLabel>
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
                      <Eyebrow>
                        {c.codigo} · {c.componenteEpg.nombre}
                      </Eyebrow>
                      <h3 className="mt-1.5 font-serif text-lg font-medium">{c.nombre}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{c.descriptor}</p>
                      <ul className="mt-3 space-y-1.5 text-sm text-muted">
                        {c.indicadores.map((i) => (
                          <li key={i.id} className="flex gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-2" />
                            {i.texto}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <form action={action}>
                      <button className="shrink-0 text-xs text-muted-2 transition-colors hover:text-incipiente">
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
          <SectionLabel>Mapeo asignatura × competencia</SectionLabel>
          <p className="-mt-2 mb-4 text-sm text-muted">
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
                    <th className="sticky left-0 bg-surface p-3 text-left font-medium text-muted-2">
                      Asignatura
                    </th>
                    {nivel.competencias.map((c) => (
                      <th key={c.id} className="min-w-[120px] border-l border-border p-3 text-left font-medium text-muted-2">
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
                              <button type="submit" className="w-full rounded-lg p-1.5 transition-colors hover:bg-surface-hover">
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
