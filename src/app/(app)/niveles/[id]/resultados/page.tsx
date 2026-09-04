import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCoordinador } from "@/lib/require-coordinador";
import {
  construirDiagnostico,
  type CompetenciaDiagnostico,
  type ParticipacionDocente,
} from "@/lib/diagnostico";
import { informeVigente } from "@/lib/actions/informe";
import { acuerdosDelNivel, cambiarEstadoAcuerdo, eliminarAcuerdo } from "@/lib/actions/acuerdos";
import type { TipoInforme } from "@/lib/ai/informe";
import {
  Button,
  Card,
  DeltaBadge,
  DisensoBadge,
  Eyebrow,
  LogroLegend,
  LogroStackedBar,
  SectionLabel,
  CLASE_ROTULO,
  SeveridadBadge,
  Trayectoria,
  franjaSeveridad,
} from "@/components/ui";
import { InformeBoton } from "./informe-boton";
import { AcuerdoForm } from "./acuerdo-form";
import { ResumenSimple } from "./resumen-simple";
import { MapaEvidencias } from "./mapa-evidencias";

const FASE_LABEL = {
  BASE: "línea base",
  SEGUIMIENTO: "seguimiento",
  CIERRE: "cierre comparativo",
} as const;

function Cifra({
  rotulo,
  valor,
  apoyo,
  tono,
}: {
  rotulo: string;
  valor: number;
  apoyo: string;
  tono: string;
}) {
  return (
    <div className="min-w-[88px]">
      <dt className={`${CLASE_ROTULO} ${tono}`}>{rotulo}</dt>
      <dd className={`mt-1.5 font-mono text-[1.75rem] font-medium leading-none tabular-nums tracking-tight ${tono}`}>
        {valor}
      </dd>
      <dd className="mt-1.5 text-xs text-muted-2">{apoyo}</dd>
    </div>
  );
}

function Puntaje({ score }: { score: number | null }) {
  if (score === null) return <span className="text-sm text-muted-2">Sin evaluar</span>;
  return (
    <span className="text-3xl font-semibold tabular-nums">
      {Math.round(score)}
      <span className="ml-0.5 text-base font-normal text-muted-2">/100</span>
    </span>
  );
}

/* ── Tarjeta de competencia, ordenada por urgencia ── */
function TarjetaCompetencia({ c }: { c: CompetenciaDiagnostico }) {
  // El peso visual sigue a la urgencia: una competencia crítica no puede verse
  // igual que una consolidada con solo 3px de diferencia.
  const enfasis =
    c.severidad === "CRITICO"
      ? "!bg-incipiente-tint/40 !border-incipiente/25 shadow-[0_1px_2px_rgba(var(--shadow-color)/0.04),0_16px_40px_-20px_rgba(var(--shadow-color)/0.20)]"
      : c.severidad === "EN_RIESGO"
        ? "!border-proceso/25"
        : "";

  return (
    <Card className={`${franjaSeveridad(c.severidad)} ${enfasis} animate-fade-in`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Eyebrow>{c.codigo}</Eyebrow>
            <SeveridadBadge severidad={c.severidad} />
            {c.delta !== null && <DeltaBadge delta={c.delta} />}
            {c.indicadoresConDisenso > 0 && <DisensoBadge compacto />}
          </div>
          <h3 className="mt-1.5 text-xl font-medium">{c.nombre}</h3>
          <p className="mt-1 text-xs text-muted-2">
            {c.componenteEpg}
            {c.docentesQueEvaluaron > 0 && ` · ${c.docentesQueEvaluaron} ${c.docentesQueEvaluaron === 1 ? "docente" : "docentes"}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Trayectoria puntos={c.trayectoria} />
          <Puntaje score={c.score} />
        </div>
      </div>

      <div className="mt-4">
        <LogroStackedBar counts={c.conteo} thin />
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
                <p className="text-sm leading-relaxed">
                  {ind.texto}
                  {ind.disenso && (
                    <span className="ml-2 align-middle">
                      <DisensoBadge compacto />
                    </span>
                  )}
                </p>
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

/* ── Quién ya evaluó y quién falta: lo primero que necesita el coordinador
      antes de la reunión, para poder ir a buscar a quien no ha respondido. ── */
function PanelParticipacion({ gente }: { gente: ParticipacionDocente[] }) {
  if (gente.length === 0) return null;
  const faltan = gente.filter((p) => !p.completo);

  return (
    <Card className="mb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
          Participación
        </p>
        <p className="text-sm text-muted">
          {gente.length - faltan.length} de {gente.length} respondieron completo
        </p>
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-border">
        {gente.map((p) => {
          const pct = p.esperadas > 0 ? Math.min(100, (p.respondidas / p.esperadas) * 100) : 0;
          return (
            <li key={p.id} className="flex items-center gap-4 py-2.5">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${p.completo ? "bg-logrado" : p.respondidas > 0 ? "bg-proceso" : "bg-border-strong"}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.nombre}</p>
                <p className="truncate text-xs text-muted-2">{p.asignaturas.join(" · ")}</p>
              </div>
              <div className="hidden w-28 sm:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={`h-full rounded-full ${p.completo ? "bg-logrado" : "bg-proceso"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-muted">
                {p.respondidas}/{p.esperadas}
              </span>
            </li>
          );
        })}
      </ul>

      {faltan.length > 0 && (
        <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted">
          Antes de cerrar la reunión conviene recordarle el enlace a{" "}
          <span className="text-foreground">{faltan.map((p) => p.nombre).join(", ")}</span>: las
          cifras de abajo se calculan solo con lo respondido.
        </p>
      )}
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
              className={`mt-2 text-2xl font-semibold ${
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
          <h3 className="mt-1.5 text-xl font-medium">{c.nombre}</h3>

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

      {informe.disensos?.length > 0 && (
        <Card className="border-l-[3px] border-l-proceso">
          <Eyebrow className="!text-proceso">Criterios que el equipo no comparte</Eyebrow>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            En estas evidencias hubo docentes que calificaron logrado y docentes que
            calificaron incipiente. Antes de intervenir con las y los estudiantes, conviene
            acordar qué cuenta como logro.
          </p>
          <div className="mt-5 flex flex-col gap-5">
            {informe.disensos.map((d, i) => (
              <div key={i} className="border-t border-border pt-4 first:border-0 first:pt-0">
                <p className="text-sm font-medium leading-relaxed">{d.evidencia}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d.lectura}</p>
                <p className="mt-2 text-sm leading-relaxed">
                  <span className="font-medium">Cómo resolverlo: </span>
                  {d.comoResolver}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

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

const ESTADO_ACUERDO = {
  PENDIENTE: { texto: "Pendiente", cls: "bg-surface-muted text-muted" },
  EN_CURSO: { texto: "En curso", cls: "bg-proceso-tint text-proceso" },
  CUMPLIDO: { texto: "Cumplido", cls: "bg-logrado-tint text-logrado" },
  DESCARTADO: { texto: "Descartado", cls: "bg-surface-muted text-muted-2" },
} as const;

type AcuerdoFila = {
  id: string;
  texto: string;
  responsable: string | null;
  plazo: string | null;
  estado: keyof typeof ESTADO_ACUERDO;
  competencia: { codigo: string; nombre: string } | null;
  reunion: { numero: number };
};

function FilaAcuerdo({ a, nivelId }: { a: AcuerdoFila; nivelId: string }) {
  const { texto, cls } = ESTADO_ACUERDO[a.estado];
  const siguiente =
    a.estado === "PENDIENTE" ? "EN_CURSO" : a.estado === "EN_CURSO" ? "CUMPLIDO" : "PENDIENTE";
  const etiquetaSiguiente = ESTADO_ACUERDO[siguiente].texto;

  const avanzar = async () => {
    "use server";
    await cambiarEstadoAcuerdo(nivelId, a.id, siguiente);
  };
  const borrar = async () => {
    "use server";
    await eliminarAcuerdo(nivelId, a.id);
  };

  return (
    <Card className="!p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{texto}</span>
            {a.competencia && (
              <span className="font-mono text-xs text-ua">{a.competencia.codigo}</span>
            )}
            <span className="font-mono text-[0.68rem] text-muted-2">R{a.reunion.numero}</span>
          </div>
          <p className="text-sm leading-relaxed">{a.texto}</p>
          {(a.responsable || a.plazo) && (
            <p className="mt-2 text-xs text-muted-2">
              {a.responsable && <>Responsable: {a.responsable}</>}
              {a.responsable && a.plazo && " · "}
              {a.plazo && <>Plazo: {a.plazo}</>}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <form action={avanzar}>
            <Button type="submit" size="sm" variant="secondary">
              Marcar {etiquetaSiguiente.toLowerCase()}
            </Button>
          </form>
          <form action={borrar}>
            <button className="text-xs text-muted-2 transition-colors hover:text-incipiente">
              Eliminar
            </button>
          </form>
        </div>
      </div>
    </Card>
  );
}

/**
 * El análisis, partido en los tres momentos de una reunión de CCAA.
 *
 * Medido antes de tocarlo: una sola pantalla con 1.859 palabras, 9.179 píxeles
 * de alto —doce pantallas de scroll— y quince encabezados. Veinticinco veces el
 * texto del resto de la aplicación junta, y es la que se proyecta en la
 * reunión. El problema no era «hay mucho texto»: era que una pantalla intentaba
 * ser toda la reunión.
 *
 * Los tres momentos son los del instrumento: cómo vamos (el diagnóstico), qué
 * dice el equipo (la voz docente), y qué hacemos (recomendaciones y acuerdos).
 * Cada uno cabe en una pantalla. El índice lateral desaparece: navegar por
 * anclas dentro de un documento de doce pantallas era un parche a este mismo
 * problema.
 */
const VISTAS = [
  { id: "como-vamos", texto: "Cómo vamos" },
  { id: "docentes", texto: "Qué dice el equipo" },
  { id: "decisiones", texto: "Qué hacemos" },
] as const;
type Vista = (typeof VISTAS)[number]["id"];

export default async function ResultadosPage({
  params,
  searchParams,
}: PageProps<"/niveles/[id]/resultados">) {
  const { id } = await params;
  const sp = await searchParams;
  const pedida = typeof sp.vista === "string" ? sp.vista : "";
  const vista: Vista = VISTAS.some((v) => v.id === pedida) ? (pedida as Vista) : "como-vamos";
  const user = await requireCoordinador();

  const d = await construirDiagnostico(id, user.id);
  if (!d) notFound();

  const acuerdos = await acuerdosDelNivel(id, d.reunionActual?.id ?? null);
  const informe = d.reunionActual ? await informeVigente(id, d.reunionActual.id) : null;
  const contenido = informe?.estado === "LISTO" ? (informe.contenido as TipoInforme) : null;

  const conDatos = d.competencias.filter((c) => c.severidad !== "SIN_DATOS");
  const atencion = conDatos.filter((c) => c.severidad !== "CONSOLIDADO");
  const consolidadas = conDatos.filter((c) => c.severidad === "CONSOLIDADO");
  const sinDatos = d.competencias.filter((c) => c.severidad === "SIN_DATOS");
  const atender = d.resumen.criticas + d.resumen.enRiesgo;
  const primera = atencion[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Reunión de cierre</Eyebrow>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight">
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
          <Button variant="secondary">Configurar</Button>
        </Link>
      </div>

      {d.totalVotos > 0 && (
        <nav
          aria-label="Momentos de la reunión"
          className="mb-8 flex gap-1 border-b border-border"
        >
          {VISTAS.map((v) => (
            <Link
              key={v.id}
              href={`/niveles/${id}/resultados?vista=${v.id}`}
              aria-current={v.id === vista ? "page" : undefined}
              className={`-mb-px border-b-2 px-3.5 py-2.5 text-[0.9375rem] transition-colors ${
                v.id === vista
                  ? "border-ua font-medium text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {v.texto}
            </Link>
          ))}
        </nav>
      )}

      <div>
        <div className="min-w-0">
      {d.totalVotos === 0 ? (
        <Card className="text-sm leading-relaxed text-muted">
          Tus docentes todavía no han respondido. Manda el enlace desde «Configurar» y vuelve cuando hayan evaluado.
        </Card>
      ) : (
        <>
          {vista === "como-vamos" && (<>
          {/* Titular: el veredicto y, sobre todo, por dónde partir */}
          <Card className="mb-4 !p-0">
            <div className="flex flex-wrap items-start justify-between gap-6 p-6">
              <div className="max-w-md">
                <p className={CLASE_ROTULO}>¿El nivel está logrando sus competencias?</p>
                <p
                  className={`mt-2 text-[1.625rem] font-semibold tracking-tight ${
                    atender === 0 ? "text-logrado" : d.resumen.criticas > 0 ? "text-incipiente" : "text-proceso"
                  }`}
                >
                  {atender === 0 ? "Sí." : d.resumen.criticas > 0 ? "Todavía no." : "Solo en parte."}
                </p>
                <p className="mt-2 text-[0.8125rem] text-muted">
                  {atender === 0
                    ? `Las ${conDatos.length} competencias evaluadas llegaron a lo esperado.`
                    : `${conDatos.length - atender} de ${conDatos.length} llegaron a lo esperado.`}
                </p>
              </div>
              <dl className="flex gap-8">
                <Cifra rotulo="Crítico" valor={d.resumen.criticas} apoyo="hay que actuar ya" tono="text-incipiente" />
                <Cifra rotulo="En riesgo" valor={d.resumen.enRiesgo} apoyo="van lento" tono="text-proceso" />
                <Cifra rotulo="Logrado" valor={d.resumen.consolidadas} apoyo="al día" tono="text-logrado" />
              </dl>
            </div>

            {/* Un tablero que obliga a deducir el siguiente paso está a medio hacer. */}
            {primera && (
              <div className="border-t border-border bg-surface-muted p-6">
                <p className={`${CLASE_ROTULO} !text-ua`}>Empieza por aquí</p>
                <p className="mt-2 text-base font-medium">
                  Competencia {primera.codigo} {primera.nombre}.
                </p>
                <p className="mt-1 text-[0.8125rem] text-muted">
                  {primera.severidad === "CRITICO"
                    ? "Es la más lejos del estándar"
                    : "Es la que más lejos está del estándar"}
                  {primera.delta !== null && Math.abs(primera.delta) < 1
                    ? " y no se ha movido desde la primera reunión."
                    : "."}{" "}
                  {primera.indicadorMasDebil &&
                    `Su evidencia más débil: «${primera.indicadorMasDebil.texto}»`}
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <a href={`/niveles/${id}/resultados?vista=decisiones#recomendaciones`}>
                    <Button size="sm">Ver qué hacer en clases</Button>
                  </a>
                  <a href={`/niveles/${id}/resultados?vista=decisiones#acuerdos`}>
                    <Button size="sm" variant="secondary">
                      Anotar un compromiso
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </Card>

          {/* Lo que el coordinador necesita ver primero: qué va bien, qué falta,
              y cuánto falta. El mapa de evidencias queda debajo, para quien
              quiera entrar al detalle indicador por indicador. */}
          <ResumenSimple competencias={d.competencias} />

          {/* El mapa de evidencias sigue completo, pero plegado: es la pieza que
              permite ver QUÉ evidencia concreta falla, no sólo qué competencia.
              Abierto por defecto convertía la pantalla en una hoja de cálculo. */}
          <details className="group mb-10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-border-strong">
              <span>
                <span className="block text-[0.9375rem] font-medium">Ver el detalle por evidencia</span>
                <span className="mt-0.5 block text-[0.8125rem] text-muted">
                  Cada competencia abierta en sus tres evidencias, con su trayectoria
                </span>
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 text-muted-2 transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <div className="mt-4">
              <MapaEvidencias competencias={d.competencias} />
            </div>
          </details>

          </>)}

          {vista === "docentes" && (<>
          <div id="participacion" className="scroll-mt-24">
            <PanelParticipacion gente={d.participacion} />
          </div>

          {/* La voz de los docentes, con nombre y asignatura. Va ANTES de las
              recomendaciones a propósito: primero lo que dijo el equipo, y
              recién después lo que propone la máquina a partir de eso. */}
          {d.percepciones.length > 0 && (
            <section id="voces" className="mb-12 scroll-mt-24">
              <SectionLabel>Lo que dicen tus docentes</SectionLabel>
              <p className="mb-4 max-w-prose text-[0.8125rem] leading-relaxed text-muted">
                Lo que ven en clases y no cabe en la rúbrica. Es la materia prima de la
                reunión: léelo antes de decidir.
              </p>
              <div className="flex flex-col gap-3">
                {d.percepciones.map((p, i) => (
                  <Card key={`${p.docente}-${p.asignatura}-${i}`}>
                    <p className="text-sm font-medium">{p.docente}</p>
                    <p className="text-xs text-muted-2">{p.asignatura}</p>
                    <div className="mt-3 flex flex-col gap-3">
                      {p.dificultad && (
                        <div>
                          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-2">
                            Qué le está costando
                          </p>
                          <p className="mt-1 text-sm leading-relaxed">{p.dificultad}</p>
                        </div>
                      )}
                      {p.sugerencia && (
                        <div>
                          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-2">
                            Qué cree que ayudaría
                          </p>
                          <p className="mt-1 text-sm leading-relaxed">{p.sugerencia}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Acuerdos arrastrados: primer punto de tabla de la reunión */}
          </>)}

          {vista === "decisiones" && (<>
          {acuerdos.arrastrados.length > 0 && (
            <section className="mb-12">
              <SectionLabel>Viene de la reunión anterior</SectionLabel>
              <div className="flex flex-col gap-3">
                {acuerdos.arrastrados.map((a) => (
                  <FilaAcuerdo key={a.id} a={a} nivelId={id} />
                ))}
              </div>
            </section>
          )}

          {/* Recomendaciones */}
          <section id="recomendaciones" className="mb-12 scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <SectionLabel>Qué hacer en clases</SectionLabel>
            </div>

            {contenido ? (
              <VistaInforme informe={contenido} />
            ) : (
              <Card className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-medium">
                    Pídele a la IA que proponga qué hacer
                  </h2>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                    Cruza el juicio de tus docentes, los comentarios que dejaron y el marco de
                    la EPG para proponerte, competencia por competencia, qué decisión activar y
                    qué hacer en cada asignatura para que las y los estudiantes alcancen el
                    estándar del nivel.
                  </p>
                </div>
                <InformeBoton
                  nivelId={id}
                  yaExiste={false}
                  errorPrevio={informe?.estado === "ERROR" ? informe.error : null}
                />
              </Card>
            )}

            {contenido && (
              <div className="mt-6">
                <InformeBoton nivelId={id} yaExiste />
              </div>
            )}
          </section>

          {/* Acuerdos de esta reunión */}
          <section id="acuerdos" className="mb-12 scroll-mt-24">
            <SectionLabel>Compromisos</SectionLabel>
            <p className="-mt-2 mb-4 max-w-prose text-sm leading-relaxed text-muted">
              Una recomendación solo sirve si alguien se hace cargo. Lo que anotes aquí abre la
              próxima reunión.
            </p>
            <div className="flex flex-col gap-4">
              {acuerdos.deEstaReunion.map((a) => (
                <FilaAcuerdo key={a.id} a={a} nivelId={id} />
              ))}
              <AcuerdoForm
                nivelId={id}
                competencias={d.competencias.map((c) => ({
                  id: c.id,
                  codigo: c.codigo,
                  nombre: c.nombre,
                }))}
                compacto={acuerdos.deEstaReunion.length > 0}
              />
            </div>
          </section>

          {/* Evidencia */}
          </>)}

          {/* El detalle competencia por competencia pertenece al diagnóstico,
              así que se pinta en «Cómo vamos» aunque en el código venga al
              final: el orden de la fuente no manda sobre el de la pantalla. */}
          {vista === "como-vamos" && (<>
          <section id="evidencia" className="scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <SectionLabel>Competencia por competencia</SectionLabel>
              <LogroLegend />
            </div>
            <div className="flex flex-col gap-4">
              {atencion.map((c) => (
                <TarjetaCompetencia key={c.id} c={c} />
              ))}

              {/* Lo que ya alcanza el estándar no necesita ocupar media pantalla:
                  se resume y queda disponible si se quiere revisar. */}
              {consolidadas.length > 0 && (
                <details className="group rounded-2xl border border-border bg-surface p-5">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 text-sm">
                      <span className="h-2 w-2 rounded-full bg-logrado" aria-hidden="true" />
                      <span className="font-medium">
                        {consolidadas.length}{" "}
                        {consolidadas.length === 1
                          ? "competencia alcanza el estándar"
                          : "competencias alcanzan el estándar"}
                      </span>
                      <span className="text-muted-2">
                        {consolidadas.map((c) => c.codigo).join(" · ")}
                      </span>
                    </span>
                    <span className="text-xs text-muted-2">
                      <span className="group-open:hidden">Ver ▾</span>
                      <span className="hidden group-open:inline">Ocultar ▴</span>
                    </span>
                  </summary>
                  <div className="mt-5 flex flex-col gap-4">
                    {consolidadas.map((c) => (
                      <TarjetaCompetencia key={c.id} c={c} />
                    ))}
                  </div>
                </details>
              )}
            </div>

            {sinDatos.length > 0 && (
              <Card className="mt-4 text-sm text-muted">
                <span className="font-medium text-foreground">Sin evaluar en esta reunión:</span>{" "}
                {sinDatos.map((c) => `${c.codigo} ${c.nombre}`).join(" · ")}. Ninguna asignatura
                que las tribute ha registrado su rúbrica todavía.
              </Card>
            )}
          </section>
          </>)}
        </>
      )}
        </div>
      </div>
    </div>
  );
}
