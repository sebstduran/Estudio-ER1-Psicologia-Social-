import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
  SeveridadBadge,
  Trayectoria,
  franjaSeveridad,
} from "@/components/ui";
import { InformeBoton } from "./informe-boton";
import { AcuerdoForm } from "./acuerdo-form";
import { ResumenSimple } from "./resumen-simple";
import { MapaEvidencias } from "./mapa-evidencias";
import { HITO_CICLO, NOMBRE_CICLO, type CicloMalla } from "@/lib/malla-psicologia";

const FASE_LABEL = {
  BASE: "línea base",
  SEGUIMIENTO: "seguimiento",
  CIERRE: "cierre comparativo",
} as const;

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
  const habilitados = gente.filter((p) => p.esperadas > 0);
  const sinAsignatura = gente.filter((p) => p.esperadas === 0);
  const faltan = habilitados.filter((p) => !p.completo);
  const completos = habilitados.length - faltan.length;
  const porcentaje = habilitados.length > 0 ? Math.round((completos / habilitados.length) * 100) : 0;

  return (
    <section className="relative mb-10 overflow-hidden rounded-[2rem] bg-[#12141b] p-6 text-white shadow-[0_30px_80px_-38px_rgba(14,16,20,0.7)] sm:p-8">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(49,172,159,0.24),transparent_32%),radial-gradient(circle_at_92%_90%,rgba(178,58,74,0.3),transparent_34%)]" />
      <div className="relative grid gap-7 lg:grid-cols-[0.55fr_1.45fr] lg:items-center">
        <div className="flex items-center gap-5 lg:flex-col lg:items-start">
          <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full p-2" style={{ background: `conic-gradient(#32b39f ${porcentaje * 3.6}deg, rgba(255,255,255,.11) 0deg)` }}>
            <div className="grid h-full w-full place-items-center rounded-full bg-[#171a22] text-center"><span className="font-mono text-3xl font-semibold">{porcentaje}%</span></div>
          </div>
          <div><p className="font-mono text-[0.68rem] tracking-[0.14em] text-[#75d9ca]">VOZ DEL EQUIPO</p><h2 className="mt-1 text-2xl font-semibold">{completos} de {habilitados.length} respondieron</h2><p className="mt-1 text-xs leading-relaxed text-white/55">Solo cuenta a quienes tienen preguntas asignadas.</p></div>
        </div>

        <ul className="grid gap-2.5 sm:grid-cols-2">
        {habilitados.map((p) => {
          const pct = p.esperadas > 0 ? Math.min(100, (p.respondidas / p.esperadas) * 100) : 0;
          return (
            <li key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-mono text-xs font-semibold ${p.completo ? "bg-[#32b39f] text-[#081511]" : "bg-white/10 text-white/60"}`} aria-hidden="true">{p.completo ? "✓" : "·"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.nombre}</p><p className="truncate text-xs text-white/45">{p.asignaturas.join(" · ")}</p>
              </div>
              <span className="font-mono text-xs text-white/60">{p.respondidas}/{p.esperadas}</span></div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${p.completo ? "bg-[#32b39f]" : "bg-[#d6a439]"}`} style={{ width: `${pct}%` }} /></div>
            </li>
          );
        })}
      </ul>
      </div>

      {faltan.length > 0 && (
        <p className="relative mt-5 border-t border-white/10 pt-4 text-sm text-white/65">
          Falta la respuesta de <span className="font-medium text-white">{faltan.map((p) => p.nombre).join(", ")}</span>.
        </p>
      )}
      {sinAsignatura.length > 0 && <p className="relative mt-2 text-xs text-white/45">Sin asignatura configurada: {sinAsignatura.map((p) => p.nombre).join(", ")}.</p>}
    </section>
  );
}

/* ── Informe generado con IA ── */
function VistaInforme({ informe, esCierre = false }: { informe: TipoInforme; esCierre?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden !border-white/10 !bg-[#12141b] !p-6 text-white sm:!p-8">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(178,58,74,0.32),transparent_32%),radial-gradient(circle_at_10%_95%,rgba(51,179,159,0.2),transparent_35%)]" />
        <div className="relative">
        {informe.veredicto && (
          <div className="mb-5 border-b border-white/10 pb-5">
            <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#f0a4b2]">{esCierre ? "CONCLUSIÓN DEL PERÍODO" : "DECISIÓN DE LA REUNIÓN"}</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                informe.veredicto.cumple === "SI"
                  ? "text-[#75d9ca]"
                  : informe.veredicto.cumple === "NO"
                    ? "text-[#f0a4b2]"
                    : "text-[#e3bc62]"
              }`}
            >
              {informe.veredicto.cumple === "SI"
                ? "Sí, en lo evaluado."
                : informe.veredicto.cumple === "NO"
                  ? "No todavía."
                  : "Parcialmente."}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
              {informe.veredicto.fundamento}
            </p>
          </div>
        )}
        <p className="font-mono text-[0.68rem] tracking-[0.14em] text-white/45">{esCierre ? "BALANCE FINAL" : "LECTURA DEL EQUIPO"}</p>
        <p className="mt-2.5 max-w-3xl text-lg font-medium leading-[1.65] text-white/85">{informe.sintesis}</p>

        {informe.prioridades.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/45">{esCierre ? "PRIORIDADES PARA EL PRÓXIMO PERÍODO" : "TRES MOVIMIENTOS"}</p>
            <ol className="grid gap-3 lg:grid-cols-3">
              {informe.prioridades.map((p, i) => (
                <li key={i} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm leading-relaxed text-white/80 backdrop-blur-sm">
                  <span className="mb-3 grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#75d9ca] to-[#4f83d1] font-mono text-xs font-semibold text-[#10131a]">0{i + 1}</span><p className="leading-[1.65]">{p}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
        </div>
      </Card>

      {informe.competencias.map((c) => (
        <Card key={c.codigo} className={franjaSeveridad(c.severidad)}>
          <div className="flex flex-wrap items-center gap-2.5">
            <Eyebrow>{c.codigo}</Eyebrow>
            <SeveridadBadge severidad={c.severidad} />
          </div>
          <h3 className="mt-1.5 text-xl font-medium">{c.nombre}</h3>

          <div className="mt-5 rounded-2xl border border-ua/10 bg-gradient-to-br from-ua-tint to-surface p-4 sm:p-5">
            <p className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.13em] text-ua">ACCIÓN PRINCIPAL · {c.decisionEpg.componente}</p>
            <p className="mt-2 text-base font-semibold leading-[1.65]">{c.decisionEpg.decision}</p>
          </div>

          <details className="group mt-4">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-muted"><span>Ver cómo aplicarlo</span><span className="text-muted-2 transition-transform group-open:rotate-180">▾</span></summary>
            <div className="mt-4 border-t border-border pt-4">
          <div className="rounded-xl bg-surface-muted/70 p-4"><p className="font-mono text-[0.64rem] font-medium uppercase tracking-[.12em] text-muted-2">QUÉ NOS DICE LA EVIDENCIA</p><p className="mt-2 text-sm leading-[1.7] text-muted">{c.diagnostico}</p></div>

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
                    <p className="mt-2.5 text-sm font-medium leading-[1.65]">{a.accion}</p>
                    <p className="mt-3 border-t border-border pt-3 text-xs leading-[1.65] text-muted-2">
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
            </div>
          </details>
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

  const [acuerdos, informe, totalActas] = await Promise.all([
    acuerdosDelNivel(id, d.reunionActual?.id ?? null),
    d.reunionActual ? informeVigente(id, d.reunionActual.id) : Promise.resolve(null),
    d.reunionActual
      ? prisma.acta.count({ where: { reunionId: d.reunionActual.id } })
      : Promise.resolve(0),
  ]);
  const hayActa = totalActas > 0;
  if (d.totalVotos === 0 || !hayActa) {
    const mensaje = d.totalVotos === 0
      ? "Primero necesitas recibir respuestas del equipo docente."
      : "Sube el acta de la reunión para habilitar los resultados.";
    redirect(`/niveles/${id}?error=${encodeURIComponent(mensaje)}`);
  }
  const contenido = informe?.estado === "LISTO" ? (informe.contenido as TipoInforme) : null;

  const conDatos = d.competencias.filter((c) => c.severidad !== "SIN_DATOS");
  const atencion = conDatos.filter((c) => c.severidad !== "CONSOLIDADO");
  const consolidadas = conDatos.filter((c) => c.severidad === "CONSOLIDADO");
  const sinDatos = d.competencias.filter((c) => c.severidad === "SIN_DATOS");

  return (
    <div className="product-page">
      <div className="product-hero mb-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <Eyebrow className="!text-white/45">Diagnóstico del nivel</Eyebrow>
          <h1 className="relative mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">
            Qué fortalecer
          </h1>
          <p className="relative mt-3 text-sm text-white/55">
            {d.nivel.nombre}
            {d.reunionActual &&
              ` · Reunión ${d.reunionActual.numero}, ${
                FASE_LABEL[d.reunionActual.fase as keyof typeof FASE_LABEL]
              }`}
          </p>
          <div className="relative mt-5 flex flex-wrap gap-2 text-[0.7rem]">
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-white/60"><b className="text-white">{NOMBRE_CICLO[d.nivel.ciclo as CicloMalla]}</b> · {HITO_CICLO[d.nivel.ciclo as CicloMalla]}</span>
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-white/60"><b className="font-mono text-white">{d.participacion.filter((p) => p.completo).length}</b> docentes</span>
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-white/60"><b className="font-mono text-white">{d.totalVotos}</b> respuestas</span>
            <span className={`rounded-full border px-3 py-1.5 ${hayActa ? "border-logrado/30 bg-logrado/15 text-white" : "border-white/12 bg-white/6 text-white/60"}`}><b className="font-mono">{totalActas}</b> {totalActas === 1 ? "acta" : "actas"}</span>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-2">
          {d.totalVotos > 0 && (
            <Link href={`/reunion/${id}`}>
              <Button className="!bg-white !text-[#111318] hover:!bg-white/90">Presentar la reunión</Button>
            </Link>
          )}
          <Link href={`/niveles/${id}`}>
            <Button variant="secondary" className="!border-white/20 !bg-white/8 !text-white hover:!bg-white/14">Configurar</Button>
          </Link>
        </div>
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
              <div className="mb-5"><p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ua">PERCEPCIONES</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Lo que está viendo el equipo</h2></div>
              <div className="grid gap-4 lg:grid-cols-3">
                {d.percepciones.map((p, i) => (
                  <Card key={`${p.docente}-${p.asignatura}-${i}`} className="relative overflow-hidden !p-0">
                    <div className="border-b border-border bg-gradient-to-br from-surface-muted to-ua-tint/50 p-4"><span aria-hidden="true" className="absolute right-4 top-1 font-serif text-6xl leading-none text-ua/10">“</span><p className="text-sm font-semibold">{p.docente}</p><p className="mt-0.5 truncate text-xs text-muted-2">{p.asignatura}</p></div>
                    <div className="flex flex-col gap-4 p-4">
                      {p.dificultad && (
                        <div className="rounded-xl border border-incipiente-line bg-incipiente-tint/50 p-3.5">
                          <p className="font-mono text-[0.64rem] font-medium uppercase tracking-[0.1em] text-incipiente">DIFICULTAD</p><p className="mt-2 text-sm leading-relaxed">{p.dificultad}</p>
                        </div>
                      )}
                      {p.sugerencia && (
                        <div className="rounded-xl border border-logrado-line bg-logrado-tint/50 p-3.5">
                          <p className="font-mono text-[0.64rem] font-medium uppercase tracking-[0.1em] text-logrado">PROPUESTA</p><p className="mt-2 text-sm leading-relaxed">{p.sugerencia}</p>
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
              <VistaInforme informe={contenido} esCierre={d.reunionActual?.fase === "CIERRE"} />
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
                {hayActa ? (
                  <InformeBoton
                    nivelId={id}
                    yaExiste={false}
                    hayActa
                    errorPrevio={informe?.estado === "ERROR" ? informe.error : null}
                  />
                ) : (
                  <Link href={`/niveles/${id}`}><Button>Subir el acta para completar el análisis</Button></Link>
                )}
              </Card>
            )}

            {contenido && hayActa && (
              <div className="mt-6">
                <InformeBoton nivelId={id} yaExiste hayActa={hayActa} />
              </div>
            )}
          </section>

          {/* Acuerdos de esta reunión */}
          <section id="acuerdos" className="mb-12 scroll-mt-24">
            <SectionLabel>{d.reunionActual?.fase === "CIERRE" ? "Acuerdos para el próximo período" : "Compromisos"}</SectionLabel>
            <p className="-mt-2 mb-4 max-w-prose text-sm leading-relaxed text-muted">
              {d.reunionActual?.fase === "CIERRE"
                ? "Deja responsables y plazos para que el próximo período no empiece desde cero."
                : "Elige qué harán, quién se hará cargo y cuándo lo revisarán."}
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
