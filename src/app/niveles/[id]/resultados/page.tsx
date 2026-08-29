import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCoordinador } from "@/lib/require-coordinador";
import { construirDiagnostico, type CompetenciaDiagnostico } from "@/lib/diagnostico";
import { informeVigente } from "@/lib/actions/informe";
import type { TipoInforme } from "@/lib/ai/informe";
import {
  Button,
  Card,
  DeltaBadge,
  Eyebrow,
  LogroLegend,
  LogroStackedBar,
  SectionLabel,
  SeveridadBadge,
  franjaSeveridad,
} from "@/components/ui";
import { InformeBoton } from "./informe-boton";

const FASE_LABEL = {
  BASE: "línea base",
  SEGUIMIENTO: "seguimiento",
  CIERRE: "cierre comparativo",
} as const;

function Puntaje({ score }: { score: number | null }) {
  if (score === null) return <span className="text-sm text-muted-2">Sin evaluar</span>;
  return (
    <span className="font-serif text-3xl font-semibold tabular-nums">
      {Math.round(score)}
      <span className="ml-0.5 text-base font-normal text-muted-2">/100</span>
    </span>
  );
}

/* ── Tarjeta de competencia, ordenada por urgencia ── */
function TarjetaCompetencia({ c }: { c: CompetenciaDiagnostico }) {
  return (
    <Card className={`${franjaSeveridad(c.severidad)} animate-fade-in`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Eyebrow>{c.codigo}</Eyebrow>
            <SeveridadBadge severidad={c.severidad} />
            {c.delta !== null && <DeltaBadge delta={c.delta} />}
          </div>
          <h3 className="mt-1.5 font-serif text-xl font-medium">{c.nombre}</h3>
          <p className="mt-1 text-xs text-muted-2">
            Componente EPG · {c.componenteEpg}
            {c.docentesQueEvaluaron > 0 && ` · ${c.docentesQueEvaluaron} docente(s)`}
          </p>
        </div>
        <div className="text-right">
          <Puntaje score={c.score} />
        </div>
      </div>

      <div className="mt-4">
        <LogroStackedBar counts={c.conteo} />
      </div>

      {/* La evidencia más débil: el dato con el que se toma la decisión */}
      {c.indicadorMasDebil && c.severidad !== "CONSOLIDADO" && (
        <div className="mt-5 rounded-xl bg-surface-muted p-4">
          <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
            Evidencia más débil
          </p>
          <p className="text-sm leading-relaxed">{c.indicadorMasDebil.texto}</p>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="max-w-[220px] flex-1">
              <LogroStackedBar thin counts={c.indicadorMasDebil.conteo} />
            </div>
            <span className="font-mono text-xs tabular-nums text-muted">
              {Math.round(c.indicadorMasDebil.score ?? 0)}/100
            </span>
          </div>
        </div>
      )}

      {/* Detalle completo, plegado para no saturar la vista */}
      <details className="group mt-4">
        <summary className="cursor-pointer list-none text-xs text-muted transition-colors hover:text-foreground">
          <span className="group-open:hidden">Ver los tres indicadores y los comentarios ▾</span>
          <span className="hidden group-open:inline">Ocultar detalle ▴</span>
        </summary>

        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
          {c.indicadores.map((ind) => (
            <div key={ind.id}>
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm leading-relaxed">{ind.texto}</p>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-2">
                  {ind.score === null ? "—" : `${Math.round(ind.score)}`}
                </span>
              </div>
              <div className="mt-2">
                <LogroStackedBar thin counts={ind.conteo} />
              </div>
              {ind.comentarios.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2 border-l-2 border-border pl-3.5">
                  {ind.comentarios.map((com, i) => (
                    <li key={i} className="text-sm leading-relaxed text-muted">
                      <span className="italic">“{com.texto}”</span>
                      <span className="mt-0.5 block text-xs text-muted-2">
                        {com.docente} · {com.asignatura}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {c.asignaturas.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="mb-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
                Por asignatura
              </p>
              <ul className="flex flex-col gap-2">
                {c.asignaturas.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 text-sm">
                    <span>
                      {a.nombre}
                      <span className="ml-2 text-xs text-muted-2">{a.tipo.toLowerCase()}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted">
                      {a.score === null ? "—" : `${Math.round(a.score)}/100`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>
    </Card>
  );
}

/* ── Informe generado con IA ── */
function VistaInforme({ informe }: { informe: TipoInforme }) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-l-[3px] border-l-ua">
        {informe.veredicto && (
          <div className="mb-5 border-b border-border pb-5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
              ¿El nivel está cumpliendo con sus competencias?
            </p>
            <p
              className={`mt-2 font-serif text-2xl font-semibold ${
                informe.veredicto.cumple === "SI"
                  ? "text-logrado"
                  : informe.veredicto.cumple === "NO"
                    ? "text-incipiente"
                    : "text-proceso"
              }`}
            >
              {informe.veredicto.cumple === "SI"
                ? "Sí, en lo evaluado."
                : informe.veredicto.cumple === "NO"
                  ? "No todavía."
                  : "Parcialmente."}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {informe.veredicto.fundamento}
            </p>
          </div>
        )}
        <Eyebrow>Síntesis</Eyebrow>
        <p className="mt-2.5 text-[1.05rem] leading-relaxed">{informe.sintesis}</p>

        {informe.prioridades.length > 0 && (
          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
              Focos para el resto del trimestre
            </p>
            <ol className="flex flex-col gap-2.5">
              {informe.prioridades.map((p, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ua-tint font-mono text-[0.65rem] font-medium text-ua">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
          </div>
        )}
      </Card>

      {informe.competencias.map((c) => (
        <Card key={c.codigo} className={franjaSeveridad(c.severidad)}>
          <div className="flex flex-wrap items-center gap-2.5">
            <Eyebrow>{c.codigo}</Eyebrow>
            <SeveridadBadge severidad={c.severidad} />
          </div>
          <h3 className="mt-1.5 font-serif text-xl font-medium">{c.nombre}</h3>

          <p className="mt-3 text-sm leading-relaxed text-muted">{c.diagnostico}</p>

          <div className="mt-5 rounded-xl bg-surface-muted p-4">
            <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
              Decisión EPG · {c.decisionEpg.componente}
            </p>
            <p className="text-sm leading-relaxed">{c.decisionEpg.decision}</p>
          </div>

          {c.accionesParaEstudiantes.length > 0 && (
            <div className="mt-5">
              <p className="mb-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
                Para que las y los estudiantes logren la competencia
              </p>
              <ul className="flex flex-col gap-4">
                {c.accionesParaEstudiantes.map((a, i) => (
                  <li key={i} className="rounded-xl border border-border p-4">
                    <span className="inline-block rounded-full bg-ua-tint px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-wide text-ua">
                      {a.tecnica}
                    </span>
                    <p className="mt-2.5 text-sm leading-relaxed">{a.accion}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-2">
                      Por qué: {a.porQue}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {c.recomendacionesPorAsignatura.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
                Por asignatura
              </p>
              <ul className="flex flex-col gap-3">
                {c.recomendacionesPorAsignatura.map((r, i) => (
                  <li key={i} className="text-sm leading-relaxed">
                    <span className="font-medium">{r.asignatura}</span>
                    <span className="mt-0.5 block text-muted">{r.accion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}

      {informe.alertasHito.length > 0 && (
        <Card className="border-l-[3px] border-l-proceso">
          <Eyebrow className="!text-proceso">Alertas · Hito de Evaluación de Ciclo</Eyebrow>
          <ul className="mt-3 flex flex-col gap-2.5">
            {informe.alertasHito.map((a, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-proceso" />
                {a}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-xs leading-relaxed text-muted-2">
        Recomendaciones generadas por IA a partir del juicio de tus docentes. Revísalas con la
        CCAA antes de acordarlas: son un punto de partida para la conversación, no un
        reemplazo del criterio del equipo.
      </p>
    </div>
  );
}

export default async function ResultadosPage({
  params,
}: PageProps<"/niveles/[id]/resultados">) {
  const { id } = await params;
  const user = await requireCoordinador();

  const d = await construirDiagnostico(id, user.id);
  if (!d) notFound();

  const informe = d.reunionActual ? await informeVigente(id, d.reunionActual.id) : null;
  const contenido = informe?.estado === "LISTO" ? (informe.contenido as TipoInforme) : null;

  const conDatos = d.competencias.filter((c) => c.severidad !== "SIN_DATOS");
  const sinDatos = d.competencias.filter((c) => c.severidad === "SIN_DATOS");
  const atender = d.resumen.criticas + d.resumen.enRiesgo;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Sintetizar</Eyebrow>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight">
            Qué fortalecer
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {d.nivel.nombre}
            {d.reunionActual &&
              ` · Reunión ${d.reunionActual.numero}, ${
                FASE_LABEL[d.reunionActual.fase as keyof typeof FASE_LABEL]
              }`}
          </p>
        </div>
        <Link href={`/niveles/${id}`}>
          <Button variant="secondary">← Volver a configurar</Button>
        </Link>
      </div>

      {d.totalVotos === 0 ? (
        <Card className="text-sm leading-relaxed text-muted">
          Todavía no hay evaluaciones registradas en esta reunión. Comparte el enlace para
          docentes desde la pantalla de configuración y vuelve cuando hayan respondido.
        </Card>
      ) : (
        <>
          {/* Titular: cuántas competencias piden atención */}
          <Card className="mb-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="font-serif text-2xl font-semibold leading-snug">
                  {atender === 0
                    ? "Ninguna competencia requiere intervención."
                    : `${atender} de ${conDatos.length} competencias necesitan trabajo.`}
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  {atender === 0
                    ? "Todas las competencias evaluadas alcanzan el estándar. Sostener lo que está funcionando."
                    : "Ordenadas de la más urgente a la menos urgente."}
                </p>
              </div>
              <dl className="flex gap-6">
                <div>
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-incipiente">
                    Crítico
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums">
                    {d.resumen.criticas}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-proceso">
                    En riesgo
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums">
                    {d.resumen.enRiesgo}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-logrado">
                    Consolidado
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums">
                    {d.resumen.consolidadas}
                  </dd>
                </div>
              </dl>
            </div>
          </Card>

          {/* Recomendaciones */}
          <section className="mb-12">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <SectionLabel>Recomendaciones</SectionLabel>
            </div>

            {contenido ? (
              <VistaInforme informe={contenido} />
            ) : (
              <Card className="flex flex-col gap-4">
                <div>
                  <h2 className="font-serif text-xl font-medium">
                    Convierte estos datos en un plan de trabajo
                  </h2>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                    Cruza el juicio de tus docentes, los comentarios que dejaron y el marco de
                    la EPG para proponerte, competencia por competencia, qué decisión activar y
                    qué hacer en cada asignatura para que las y los estudiantes alcancen el
                    estándar del nivel.
                  </p>
                </div>
                {informe?.estado === "ERROR" && informe.error && (
                  <p className="rounded-xl border border-incipiente/30 bg-incipiente-tint px-4 py-2.5 text-sm text-incipiente">
                    {informe.error}
                  </p>
                )}
                <InformeBoton nivelId={id} yaExiste={false} />
              </Card>
            )}

            {contenido && (
              <div className="mt-6">
                <InformeBoton nivelId={id} yaExiste />
              </div>
            )}
          </section>

          {/* Evidencia */}
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <SectionLabel>La evidencia</SectionLabel>
              <LogroLegend />
            </div>
            <div className="flex flex-col gap-4">
              {conDatos.map((c) => (
                <TarjetaCompetencia key={c.id} c={c} />
              ))}
            </div>

            {sinDatos.length > 0 && (
              <Card className="mt-4 text-sm text-muted">
                <span className="font-medium text-foreground">Sin evaluar en esta reunión:</span>{" "}
                {sinDatos.map((c) => `${c.codigo} ${c.nombre}`).join(" · ")}. Ninguna asignatura
                que las tribute ha registrado su rúbrica todavía.
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
