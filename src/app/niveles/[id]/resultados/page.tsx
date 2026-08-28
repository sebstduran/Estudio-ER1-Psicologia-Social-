import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { obtenerConteosPorReunion, scoreDe } from "@/lib/resultados";
import {
  Button,
  Card,
  DeltaBadge,
  Eyebrow,
  LogroLegend,
  LogroStackedBar,
  SectionLabel,
} from "@/components/ui";

const FASE_LABEL = {
  BASE: "línea base",
  SEGUIMIENTO: "seguimiento",
  CIERRE: "cierre comparativo",
} as const;

export default async function ResultadosPage({
  params,
}: PageProps<"/niveles/[id]/resultados">) {
  const { id } = await params;
  const user = await requireCoordinador();

  const nivel = await prisma.nivel.findFirst({
    where: { id, coordinadorId: user.id },
    include: {
      competencias: {
        orderBy: { orden: "asc" },
        include: { componenteEpg: true, indicadores: { orderBy: { orden: "asc" } } },
      },
      reuniones: { orderBy: { numero: "asc" } },
    },
  });
  if (!nivel) notFound();

  const { porCompetencia, porIndicador } = await obtenerConteosPorReunion(nivel.id);

  const reunionActual = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero);
  const reunionBase = nivel.reuniones.find((r) => r.fase === "BASE");
  const reunionCierre = nivel.reuniones.find((r) => r.fase === "CIERRE");

  const conteosActual = reunionActual ? porCompetencia.get(reunionActual.id) : undefined;
  const conteosBase = reunionBase ? porCompetencia.get(reunionBase.id) : undefined;
  const conteosCierre = reunionCierre ? porCompetencia.get(reunionCierre.id) : undefined;

  const hayComparacion =
    reunionBase && reunionCierre && reunionBase.id !== reunionCierre.id;
  const hayDatosCierre = conteosCierre && conteosCierre.size > 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Sintetizar</Eyebrow>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight">
            Resultados
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {nivel.nombre} · distribución de logro por evidencia y por competencia.
          </p>
        </div>
        <Link href={`/niveles/${nivel.id}`}>
          <Button variant="secondary">← Volver a configurar</Button>
        </Link>
      </div>

      {/* Reunión en curso */}
      <section className="mb-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionLabel>
            {reunionActual
              ? `Reunión ${reunionActual.numero} en curso · ${FASE_LABEL[reunionActual.fase]}`
              : "Sin reunión activa"}
          </SectionLabel>
          <LogroLegend />
        </div>

        {nivel.competencias.length === 0 ? (
          <Card className="text-sm text-muted">Aún no hay competencias configuradas.</Card>
        ) : (
          <div className="flex flex-col gap-4">
            {nivel.competencias.map((c) => {
              const counts = conteosActual?.get(c.id);
              const score = counts ? scoreDe(counts) : null;
              return (
                <Card key={c.id} className="animate-fade-in">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Eyebrow>
                        {c.codigo} · {c.componenteEpg.nombre}
                      </Eyebrow>
                      <h3 className="mt-1 font-serif text-base font-medium">{c.nombre}</h3>
                    </div>
                    <span className="tabular-nums text-sm font-medium text-muted">
                      {score === null ? "Sin evaluaciones" : `${Math.round(score)}% de logro`}
                    </span>
                  </div>

                  <LogroStackedBar
                    counts={counts ?? { LOGRADO: 0, EN_PROCESO: 0, INCIPIENTE: 0 }}
                  />

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {c.indicadores.map((ind) => {
                      const indCounts = reunionActual
                        ? porIndicador.get(reunionActual.id)?.get(ind.id)
                        : undefined;
                      return (
                        <div key={ind.id}>
                          <p className="mb-1.5 line-clamp-2 text-xs text-muted" title={ind.texto}>
                            {ind.texto}
                          </p>
                          <LogroStackedBar
                            thin
                            counts={indCounts ?? { LOGRADO: 0, EN_PROCESO: 0, INCIPIENTE: 0 }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Comparación línea base vs. cierre */}
      {hayComparacion && (
        <section>
          <SectionLabel>
            Comparación · línea base (R{reunionBase.numero}) vs. cierre (R{reunionCierre.numero})
          </SectionLabel>

          {!hayDatosCierre ? (
            <Card className="text-sm text-muted">
              Todavía no hay evaluaciones registradas en la reunión de cierre (R
              {reunionCierre.numero}). La comparación aparece automáticamente en cuanto los
              docentes evalúen ahí.
            </Card>
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-muted-2">
                    <th className="p-3 font-medium">Competencia</th>
                    <th className="p-3 font-medium">Línea base</th>
                    <th className="p-3 font-medium">Cierre</th>
                    <th className="p-3 font-medium">Avance</th>
                  </tr>
                </thead>
                <tbody>
                  {nivel.competencias.map((c) => {
                    const base = conteosBase?.get(c.id);
                    const cierre = conteosCierre?.get(c.id);
                    const baseScore = base ? scoreDe(base) : null;
                    const cierreScore = cierre ? scoreDe(cierre) : null;
                    const delta =
                      baseScore !== null && cierreScore !== null ? cierreScore - baseScore : null;
                    return (
                      <tr key={c.id} className="border-t border-border">
                        <td className="p-3">
                          <span className="font-medium text-ua">{c.codigo}</span> {c.nombre}
                        </td>
                        <td className="p-3 tabular-nums text-muted">
                          {baseScore === null ? "—" : `${Math.round(baseScore)}%`}
                        </td>
                        <td className="p-3 tabular-nums text-muted">
                          {cierreScore === null ? "—" : `${Math.round(cierreScore)}%`}
                        </td>
                        <td className="p-3">
                          {delta === null ? (
                            <span className="text-xs text-muted-2">Sin datos suficientes</span>
                          ) : (
                            <DeltaBadge delta={delta} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
