import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { Button, Card, Eyebrow, RubricaControl, TipoMapeoBadge, inputClass } from "@/components/ui";
import { guardarEvaluacion } from "@/lib/actions/evaluar";
import { FormularioEvaluacion } from "./formulario-evaluacion";

const CICLO_LABEL = {
  INICIAL: "Ciclo Inicial",
  INTERMEDIO: "Ciclo Intermedio",
  FINAL: "Ciclo Avanzado",
} as const;

const FASE_LABEL = {
  BASE: "Línea base",
  SEGUIMIENTO: "Seguimiento",
  CIERRE: "Cierre comparativo",
} as const;

function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-[7px] border border-incipiente-line bg-incipiente-tint px-3.5 py-2.5 text-[0.8125rem] text-incipiente">
      {error}
    </p>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Tu nombre", "Tu asignatura", "Responde"];
  return (
    <div className="surface-glass mb-8 grid grid-cols-3 gap-1.5 rounded-2xl p-2 text-xs text-muted-2 shadow-[0_24px_60px_-46px_rgba(17,19,24,.5)]">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className={`flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2.5 sm:px-3 ${active ? "bg-foreground text-surface shadow-sm" : ""}`}>
            <span
              className={`grid h-[18px] w-[18px] place-items-center rounded-md font-mono text-[0.625rem] font-medium ${
                active
                  ? "bg-white/14 text-current"
                  : done
                    ? "border border-logrado-line bg-logrado-tint text-logrado"
                    : "bg-surface-hover text-muted-2"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={`truncate ${active ? "font-medium text-current" : ""}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MarcoDocente({
  nivel,
  ciclo,
  trimestre,
  reunion,
  step,
  children,
}: {
  nivel: string;
  ciclo: string;
  trimestre: string;
  reunion: string | null;
  step: 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <main className="assessment-page min-h-screen pb-20">
      <header className="relative overflow-hidden bg-[#12141a] text-white">
        <div aria-hidden="true" className="absolute -right-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-ua/35 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-36 left-[18%] h-72 w-72 rounded-full bg-[#167b75]/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-7 sm:pb-24 sm:pt-9">
          <Link href="/" className="inline-flex items-center gap-2.5 text-sm font-medium text-white/78">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-lg"><Image src="/logo-ua.png" alt="" width={29} height={23} className="h-auto w-7" /></span>
            Comunidades Académicas
          </Link>
          <div className="mt-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[.65rem] font-medium uppercase tracking-[.16em] text-[#f0a4b2]">{ciclo} · {trimestre}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">{nivel}</h1>
              <p className="mt-3 text-sm text-white/48">Tu observación profesional se integra al análisis del nivel.</p>
            </div>
            {reunion && <span className="liquid-glass rounded-full px-4 py-2 text-xs text-white/72">{reunion}</span>}
          </div>
        </div>
      </header>
      <div className="relative mx-auto -mt-8 max-w-5xl px-6">
        <Stepper step={step} />
        {children}
      </div>
    </main>
  );
}

export default async function EvaluarPage({
  params,
  searchParams,
}: PageProps<"/evaluar/[nivelId]">) {
  const { nivelId } = await params;
  const sp = await searchParams;

  const get = (key: string) => {
    const v = sp[key];
    return typeof v === "string" ? v : undefined;
  };
  const error = get("error");
  const docenteId = get("docente");
  const asignaturaId = get("asignatura");
  const guardado = get("guardado") === "1";

  const nivel = await prisma.nivel.findUnique({
    where: { id: nivelId },
    include: {
      asignaturas: { orderBy: { nombre: "asc" } },
      docentes: {
        orderBy: { nombre: "asc" },
        include: { asignaturas: { include: { asignatura: true } } },
      },
      reuniones: { orderBy: { numero: "asc" } },
    },
  });
  if (!nivel) notFound();

  const reunionActual = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero);

  const docente = docenteId ? nivel.docentes.find((item) => item.id === docenteId) ?? null : null;

  const reunionTexto = reunionActual
    ? `Reunión ${reunionActual.numero} · ${FASE_LABEL[reunionActual.fase]}`
    : null;

  // ── Paso 1: identificación ─────────────────────────────────────
  if (!docente) {
    return (
      <MarcoDocente nivel={nivel.nombre} ciclo={CICLO_LABEL[nivel.cicloTipo]} trimestre={nivel.trimestre} reunion={reunionTexto} step={1}>
        <Card className="animate-fade-in !rounded-[2rem] !p-7 sm:!p-9">
          <p className="font-mono text-[.64rem] font-medium uppercase tracking-[.14em] text-ua">PASO 1 · IDENTIFICARTE</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">¿Cuál es tu nombre?</h2>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">Solo verás las asignaturas asociadas a ti. No necesitas contraseña.</p>
          <ErrorBanner error={error} />
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {nivel.docentes.map((persona) => (
              <Link
                key={persona.id}
                href={`/evaluar/${nivel.id}?docente=${persona.id}`}
              className="group rounded-2xl border border-border bg-surface/72 p-4 shadow-[0_12px_30px_-26px_rgba(17,19,24,.4)] transition-all hover:-translate-y-0.5 hover:border-ua/35 hover:bg-surface"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-medium">{persona.nombre}</span>
                  <span className="text-ua transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
                </span>
                <span className="mt-1.5 block text-xs leading-relaxed text-muted">
                  {persona.asignaturas.map((item) => item.asignatura.nombre).join(" · ") || "Sin asignatura asignada"}
                </span>
              </Link>
            ))}
            {nivel.docentes.length === 0 && (
              <p className="text-sm text-muted sm:col-span-2">La coordinación todavía no ha agregado docentes a este nivel.</p>
            )}
          </div>
        </Card>
      </MarcoDocente>
    );
  }

  // ── Paso 2: elegir asignatura ──────────────────────────────────
  const asignatura = asignaturaId
    ? nivel.asignaturas.find(
        (a) =>
          a.id === asignaturaId && docente.asignaturas.some((item) => item.asignaturaId === a.id)
      )
    : undefined;

  if (!asignatura) {
    const asignaturasDelDocente = docente.asignaturas.map((item) => item.asignatura);

    return (
      <MarcoDocente nivel={nivel.nombre} ciclo={CICLO_LABEL[nivel.cicloTipo]} trimestre={nivel.trimestre} reunion={reunionTexto} step={2}>
        <Card className="animate-fade-in !rounded-[2rem] !p-7 sm:!p-9">
          <p className="font-mono text-[.64rem] font-medium uppercase tracking-[.14em] text-ua">PASO 2 · TU ASIGNATURA</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Hola, {docente.nombre}</h2>
          <p className="mb-5 mt-2 text-sm text-muted">Elige la asignatura que vas a evaluar.</p>

        <ErrorBanner error={error} />
        {guardado && (
          <p className="mb-4 rounded-xl border border-logrado/30 bg-logrado-tint px-4 py-2.5 text-sm text-logrado">
            Evaluación guardada. Puedes evaluar otra asignatura si dictas más de una.
          </p>
        )}

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {asignaturasDelDocente.map((a) => (
            <Link
              key={a.id}
              href={`/evaluar/${nivel.id}?docente=${docente.id}&asignatura=${a.id}`}
            >
              <Card interactive className="group !p-5 text-sm font-medium">
                <span className="flex items-center justify-between gap-4">{a.nombre}<span className="text-lg text-ua transition-transform group-hover:translate-x-1">→</span></span>
              </Card>
            </Link>
          ))}
          {asignaturasDelDocente.length === 0 && (
            <Card className="text-sm text-muted sm:col-span-2">
              Aún no tienes una asignatura asignada en este nivel. Escríbele a quien coordina
              para que la agregue antes de responder.
            </Card>
          )}
        </div>
        </Card>
      </MarcoDocente>
    );
  }

  // ── Paso 3: rúbrica por competencia tributada ──────────────────
  const mapeos = await prisma.mapeoAsignaturaCompetencia.findMany({
    where: { asignaturaId: asignatura.id },
    include: {
      competencia: {
        include: { componenteEpg: true, indicadores: { orderBy: { orden: "asc" } } },
      },
    },
  });

  const competenciasTributadas = mapeos
    .slice()
    .sort((a, b) =>
      a.tipo === b.tipo ? a.competencia.orden - b.competencia.orden : a.tipo === "DIRECTA" ? -1 : 1
    );

  const evaluacionesPrevias = reunionActual
    ? await prisma.evaluacion.findMany({
        where: { reunionId: reunionActual.id, docenteId: docente.id, asignaturaId: asignatura.id },
      })
    : [];
  const previaPorIndicador = new Map(evaluacionesPrevias.map((e) => [e.indicadorId, e]));

  const percepcionPrevia = reunionActual
    ? await prisma.percepcion.findUnique({
        where: {
          reunionId_docenteId_asignaturaId: {
            reunionId: reunionActual.id,
            docenteId: docente.id,
            asignaturaId: asignatura.id,
          },
        },
      })
    : null;

  const guardarAction = guardarEvaluacion.bind(null, nivel.id, docente.id, asignatura.id);

  return (
    <MarcoDocente nivel={nivel.nombre} ciclo={CICLO_LABEL[nivel.cicloTipo]} trimestre={nivel.trimestre} reunion={reunionTexto} step={3}>
      <div className="surface-glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <div>
          <p className="font-mono text-[.6rem] font-medium uppercase tracking-[.13em] text-ua">RESPONDIENDO COMO {docente.nombre}</p>
          <p className="mt-1 text-base font-semibold">{asignatura.nombre}</p>
          <p className="mt-1 text-xs text-muted">{competenciasTributadas.length} {competenciasTributadas.length === 1 ? "competencia" : "competencias"} · alrededor de 5 minutos</p>
        </div>
        <Link
          href={`/evaluar/${nivel.id}?docente=${docente.id}`}
          className="rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          Cambiar asignatura
        </Link>
      </div>

      <ErrorBanner error={error} />

      {competenciasTributadas.length === 0 ? (
        <Card className="text-sm text-muted">
          Esta asignatura todavía no tributa a ninguna competencia. Pide al coordinador que
          complete el mapeo en la configuración del nivel.
        </Card>
      ) : (
        <FormularioEvaluacion action={guardarAction}>
          {competenciasTributadas.map(({ competencia, tipo }, competenciaIndex) => (
            <details key={competencia.id} open={competenciaIndex === 0} className="assessment-competency group animate-fade-in overflow-hidden rounded-[1.5rem] border border-white/70 bg-surface/80 shadow-[0_24px_70px_-52px_rgba(17,19,24,.52)] backdrop-blur-xl">
              <summary className="relative cursor-pointer list-none overflow-hidden bg-[#17191f] p-6 text-white marker:content-none sm:p-7">
                <div aria-hidden="true" className="absolute -right-12 -top-20 h-44 w-44 rounded-full bg-ua/24 blur-3xl" />
                <div className="relative flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/12 bg-white/[.07] font-mono text-xs text-white/70">{String(competenciaIndex + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <Eyebrow className="!text-white/48">{competencia.codigo} · {competencia.componenteEpg.nombre}</Eyebrow>
                      <span className="flex items-center gap-3"><TipoMapeoBadge tipo={tipo} /><span aria-hidden="true" className="text-white/38 transition-transform group-open:rotate-180">⌄</span></span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-[-.03em]">{competencia.nombre}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/52">{competencia.descriptor}</p>
                  </div>
                </div>
              </summary>

              <div className="flex flex-col gap-3 p-4 sm:p-6">
                {competencia.indicadores.map((ind) => {
                  const previa = previaPorIndicador.get(ind.id);
                  return (
                    <div key={ind.id} className="rounded-2xl border border-border/80 bg-surface/72 p-4 sm:p-5">
                      <p className="text-sm font-medium leading-relaxed">{ind.texto}</p>
                      <p className="mb-3 mt-1 text-xs text-muted-2">¿Dónde se encuentra hoy la mayoría del curso?</p>
                      <RubricaControl name={`logro:${ind.id}`} defaultValue={previa?.nivelLogro} />
                      <textarea
                        className={`${inputClass} mt-3 min-h-16 text-sm`}
                        name={`comentario:${ind.id}`}
                        placeholder="¿Algo que quieras agregar? (opcional)"
                        defaultValue={previa?.comentario ?? ""}
                      />
                    </div>
                  );
                })}
              </div>
            </details>
          ))}

          {/* Dos preguntas dirigidas, no una caja en blanco: una caja en blanco
              se devuelve en blanco. Esto es lo que antes se decía en la reunión
              y se perdía en el acta, así que va aquí, mientras la persona
              todavía tiene el curso en la cabeza. */}
          <Card className="animate-fade-in !rounded-[2rem] !p-6 sm:!p-8">
            <Eyebrow>Tu lectura profesional</Eyebrow>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-.035em]">Lo que los números no alcanzan a mostrar</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Opcional, pero es lo que más ayuda a decidir qué hacer. Lo lee quien coordina
              y alimenta las recomendaciones.
            </p>

            <div className="mt-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="dificultad" className="text-sm font-medium">
                  ¿Qué te está costando más con este curso?
                </label>
                <p className="text-xs leading-relaxed text-muted-2">
                  Lo que ves en clases y no aparece en la rúbrica.
                </p>
                <textarea
                  id="dificultad"
                  name="dificultad"
                  className={`${inputClass} min-h-20 text-sm`}
                  placeholder="Ej. Llegan sin lectura previa, así que la clase se va en explicar lo básico."
                  defaultValue={percepcionPrevia?.dificultad ?? ""}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="sugerencia" className="text-sm font-medium">
                  ¿Qué crees que ayudaría?
                </label>
                <p className="text-xs leading-relaxed text-muted-2">
                  Aunque no dependa de ti.
                </p>
                <textarea
                  id="sugerencia"
                  name="sugerencia"
                  className={`${inputClass} min-h-20 text-sm`}
                  placeholder="Ej. Un control de lectura corto al inicio, o coordinar la pauta con Metodología."
                  defaultValue={percepcionPrevia?.sugerencia ?? ""}
                />
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-surface/88 px-5 py-4 shadow-[0_24px_70px_-35px_rgba(17,19,24,.48)] backdrop-blur-2xl">
            <p className="text-xs text-muted">Al guardar, podrás responder otra asignatura.</p>
            <Button type="submit" size="md">Guardar evaluación <span aria-hidden="true">→</span></Button>
          </div>
        </FormularioEvaluacion>
      )}
    </MarcoDocente>
  );
}
