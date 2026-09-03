import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, Card, CLASE_ROTULO, Eyebrow, RubricaControl, TipoMapeoBadge, inputClass } from "@/components/ui";
import { identificarDocente, guardarEvaluacion } from "@/lib/actions/evaluar";
import { subirActa } from "@/lib/actions/actas";

const CICLO_LABEL = {
  INICIAL: "Ciclo Inicial",
  INTERMEDIO: "Ciclo Intermedio",
  FINAL: "Ciclo Final",
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
  const steps = ["Quién eres", "Qué asignatura", "Cómo ves al curso"];
  return (
    <div className="mb-8 flex items-center gap-2 text-xs text-muted-2">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`grid h-[18px] w-[18px] place-items-center rounded-md font-mono text-[0.625rem] font-medium ${
                active
                  ? "bg-foreground text-surface"
                  : done
                    ? "border border-logrado-line bg-logrado-tint text-logrado"
                    : "bg-surface-hover text-muted-2"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={active ? "font-medium text-foreground" : ""}>{label}</span>
            {i < steps.length - 1 && <span className="mx-1 text-border-strong">—</span>}
          </div>
        );
      })}
    </div>
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
  const actaSubida = get("acta") === "1";

  const nivel = await prisma.nivel.findUnique({
    where: { id: nivelId },
    include: {
      asignaturas: { orderBy: { nombre: "asc" } },
      reuniones: { orderBy: { numero: "asc" } },
    },
  });
  if (!nivel) notFound();

  const reunionActual = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero);

  const docente = docenteId
    ? await prisma.docente.findFirst({ where: { id: docenteId, nivelId } })
    : null;

  const shellHeader = (
    <div className="mb-8">
      <Eyebrow>
        {CICLO_LABEL[nivel.cicloTipo]} · {nivel.trimestre}
      </Eyebrow>
      <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-[2.125rem]">
        {nivel.nombre}
      </h1>
      {reunionActual && (
        <p className="mt-1.5 text-sm text-muted">
          Reunión {reunionActual.numero} · {FASE_LABEL[reunionActual.fase]}
        </p>
      )}
    </div>
  );

  // ── Paso 1: identificación ─────────────────────────────────────
  if (!docente) {
    const action = identificarDocente.bind(null, nivel.id);
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        {shellHeader}
        <Stepper step={1} />
        <Card className="animate-fade-in">
          {/* Tres pasos, tres frases. Quien abre un enlace que le llegó por
              WhatsApp necesita saber en qué se mete, no leer un instructivo. */}
          <ol className="mb-5 flex flex-col gap-2.5">
            {[
              "Dices quién eres",
              "Eliges tu asignatura",
              "Cuentas cómo ves al curso",
            ].map((paso, i) => (
              <li key={paso} className="flex items-center gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ua-tint font-mono text-[0.625rem] font-medium text-ua">
                  {i + 1}
                </span>
                <span className="text-[0.875rem]">{paso}</span>
              </li>
            ))}
          </ol>

          <p className="mb-5 text-xs text-muted-2">
            Unos 5 minutos. Sin cuenta ni contraseña, y puedes volver a cambiar tus
            respuestas.
          </p>
          <form action={action} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Nombre completo</span>
              <input className={inputClass} name="nombre" required autoComplete="name" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Correo institucional</span>
              <input className={inputClass} type="email" name="email" required autoComplete="email" />
            </label>
            <ErrorBanner error={error} />
            <Button type="submit" className="mt-1 w-full">
              Continuar
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // ── Paso 2: elegir asignatura + actas ──────────────────────────
  const asignatura = asignaturaId
    ? nivel.asignaturas.find((a) => a.id === asignaturaId)
    : undefined;

  if (!asignatura) {
    const actas = reunionActual
      ? await prisma.acta.findMany({ where: { reunionId: reunionActual.id }, orderBy: { createdAt: "desc" } })
      : [];
    const actaAction = reunionActual
      ? subirActa.bind(null, nivel.id, reunionActual.id, docente.nombre, docente.id)
      : undefined;

    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        {shellHeader}
        <Stepper step={2} />

        <p className="mb-4 text-sm text-muted">
          Hola <span className="font-medium text-foreground">{docente.nombre}</span>, elige la
          asignatura que vas a evaluar.
        </p>

        <ErrorBanner error={error} />
        {guardado && (
          <p className="mb-4 rounded-xl border border-logrado/30 bg-logrado-tint px-4 py-2.5 text-sm text-logrado">
            Evaluación guardada. Puedes evaluar otra asignatura si dictas más de una.
          </p>
        )}

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {nivel.asignaturas.map((a) => (
            <Link
              key={a.id}
              href={`/evaluar/${nivel.id}?docente=${docente.id}&asignatura=${a.id}`}
            >
              <Card interactive className="!p-4 text-sm font-medium">
                {a.nombre}
              </Card>
            </Link>
          ))}
          {nivel.asignaturas.length === 0 && (
            <Card className="text-sm text-muted sm:col-span-2">
              El coordinador aún no ha configurado asignaturas en este nivel.
            </Card>
          )}
        </div>

        {reunionActual && actaAction && (
          <div className="mt-10 border-t border-border pt-8">
            <h2 className={`${CLASE_ROTULO} mb-3 block`}>
              Acta de la reunión {reunionActual.numero}
            </h2>
            {actaSubida && (
              <p className="mb-3 text-sm text-logrado">Acta subida correctamente.</p>
            )}
            <Card className="flex flex-col gap-3">
              <form action={actaAction} className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  name="archivo"
                  required
                  className="flex-1 text-[0.8125rem] text-muted file:mr-3 file:rounded-[7px] file:border file:border-border-strong file:bg-surface file:px-2.5 file:py-[5px] file:text-xs file:font-medium file:text-foreground"
                />
                <Button type="submit" size="sm" variant="secondary">
                  Subir acta
                </Button>
              </form>
              {actas.length > 0 && (
                <ul className="flex flex-col gap-1.5 text-sm">
                  {actas.map((a) => (
                    <li key={a.id}>
                      <a href={a.url} target="_blank" className="text-ua hover:underline">
                        {a.nombreArchivo}
                      </a>
                      <span className="ml-2 text-xs text-muted-2">· {a.subidoPor}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </div>
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
    <div className="mx-auto max-w-3xl px-6 py-16">
      {shellHeader}
      <Stepper step={3} />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-[0.8125rem] text-muted">
          Estás evaluando <span className="font-medium text-foreground">{asignatura.nombre}</span>{" "}
          como {docente.nombre}.
        </p>
        <Link
          href={`/evaluar/${nivel.id}?docente=${docente.id}`}
          className="text-xs text-muted-2 hover:text-foreground"
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
        <form action={guardarAction} className="flex flex-col gap-6">
          {competenciasTributadas.map(({ competencia, tipo }) => (
            <Card key={competencia.id} className="animate-fade-in">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <Eyebrow>
                  {competencia.codigo} · {competencia.componenteEpg.nombre}
                </Eyebrow>
                <TipoMapeoBadge tipo={tipo} />
              </div>
              <h3 className="text-lg font-medium">{competencia.nombre}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{competencia.descriptor}</p>

              <div className="mt-5 flex flex-col divide-y divide-border">
                {competencia.indicadores.map((ind) => {
                  const previa = previaPorIndicador.get(ind.id);
                  return (
                    <div key={ind.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                      <p className="text-sm">{ind.texto}</p>
                      <RubricaControl name={`logro:${ind.id}`} defaultValue={previa?.nivelLogro} />
                      <textarea
                        className={`${inputClass} min-h-16 text-sm`}
                        name={`comentario:${ind.id}`}
                        placeholder="¿Algo que quieras agregar? (opcional)"
                        defaultValue={previa?.comentario ?? ""}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}

          {/* Dos preguntas dirigidas, no una caja en blanco: una caja en blanco
              se devuelve en blanco. Esto es lo que antes se decía en la reunión
              y se perdía en el acta, así que va aquí, mientras la persona
              todavía tiene el curso en la cabeza. */}
          <Card className="animate-fade-in">
            <Eyebrow>Lo que no cabe en la rúbrica</Eyebrow>
            <h3 className="mt-3 text-lg font-medium">Cuéntanos cómo lo ves tú</h3>
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

          <Button type="submit" size="md" className="self-start">
            Guardar evaluación
          </Button>
        </form>
      )}
    </div>
  );
}
