import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, Card, Eyebrow, RubricaControl, TipoMapeoBadge, inputClass } from "@/components/ui";
import { identificarDocente, guardarEvaluacion } from "@/lib/actions/evaluar";

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
  const steps = ["Tus datos", "Tu asignatura", "Tu mirada"];
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
    ? await prisma.docente.findFirst({
        where: { id: docenteId, nivelId },
        include: { asignaturas: { include: { asignatura: true } } },
      })
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
          <h2 className="text-xl font-semibold tracking-tight">Confirma quién eres y qué haces</h2>
          <p className="mb-5 mt-2 text-sm leading-relaxed text-muted">
            Elige una o más asignaturas. No necesitas crear una cuenta.
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
            <fieldset>
              <legend className="text-sm font-medium">Asignaturas en las que haces clases</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {nivel.asignaturas.map((a) => (
                  <label key={a.id} className="cursor-pointer rounded-xl border border-border-strong px-3.5 py-3 text-sm text-muted transition-all hover:border-muted-2 has-[:checked]:border-ua has-[:checked]:bg-ua-tint has-[:checked]:font-medium has-[:checked]:text-ua">
                    <input type="checkbox" name="asignaturaIds" value={a.id} className="mr-2 accent-ua" />
                    {a.nombre}
                  </label>
                ))}
              </div>
            </fieldset>
            <ErrorBanner error={error} />
            <Button type="submit" className="mt-1 w-full">
              Continuar a mis preguntas <span aria-hidden="true">→</span>
            </Button>
          </form>
        </Card>
      </div>
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
          {asignaturasDelDocente.map((a) => (
            <Link
              key={a.id}
              href={`/evaluar/${nivel.id}?docente=${docente.id}&asignatura=${a.id}`}
            >
              <Card interactive className="!p-4 text-sm font-medium">
                {a.nombre}
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
