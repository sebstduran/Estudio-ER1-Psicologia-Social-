import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Button, CLASE_ROTULO, Eyebrow } from "@/components/ui";
import { actualizarReunionActual } from "@/lib/actions/niveles";
import { subirActaCoordinador } from "@/lib/actions/actas";
import { EnlaceDocentes } from "./enlace-docentes";

const MODALIDAD_LABEL = { DIURNO: "Diurno", VESPERTINO_TECH: "Vespertino/TECH" } as const;

const FASE_LABEL = {
  BASE: "Línea base",
  SEGUIMIENTO: "Seguimiento",
  CIERRE: "Cierre comparativo",
} as const;

function plural(n: number, singular: string, plural_: string) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

/**
 * La pantalla del nivel ya configurado: en qué reunión vamos, el enlace para
 * los docentes y el acta.
 *
 * Si la configuración está a medias, esta pantalla no se muestra: manda al paso
 * que falta. Antes ofrecía los cuatro pasos a la vez y quien entraba se quedaba
 * parado sin saber por dónde empezar.
 */
export default async function NivelPage({ params, searchParams }: PageProps<"/niveles/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const aviso = typeof sp.error === "string" ? sp.error : undefined;
  const actaSubida = sp.acta === "1";

  const user = await requireCoordinador();

  const nivel = await prisma.nivel.findFirst({
    where: { id, coordinadorId: user.id },
    include: {
      asignaturas: { select: { id: true, _count: { select: { mapeos: true } } } },
      competencias: { select: { id: true } },
      docentes: { select: { id: true } },
      reuniones: { orderBy: { numero: "asc" } },
    },
  });
  if (!nivel) notFound();

  const totalMapeos = nivel.asignaturas.reduce((n, a) => n + a._count.mapeos, 0);

  if (nivel.competencias.length === 0) redirect(`/niveles/${id}/configurar/competencias`);
  if (nivel.asignaturas.length === 0) redirect(`/niveles/${id}/configurar/asignaturas`);
  if (nivel.docentes.length === 0) redirect(`/niveles/${id}/configurar/docentes`);
  if (totalMapeos === 0) redirect(`/niveles/${id}/configurar/vinculos`);

  const reunionActual = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero);
  const actas = reunionActual
    ? await prisma.acta.findMany({
        where: { reunionId: reunionActual.id },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const totalEvaluaciones = reunionActual
    ? await prisma.evaluacion.count({ where: { reunionId: reunionActual.id } })
    : 0;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <Eyebrow>Tu reunión de hoy</Eyebrow>
        <h1 className="mt-1.5 text-[2.125rem] font-semibold tracking-tight">{nivel.nombre}</h1>
        <p className="mt-1.5 text-sm text-muted">
          {MODALIDAD_LABEL[nivel.modalidad]} · {nivel.trimestre} ·{" "}
          {plural(nivel.reuniones.length, "reunión", "reuniones")}
        </p>
      </div>

      {aviso && (
        <p className="mb-5 rounded-[7px] border border-incipiente-line bg-incipiente-tint px-3.5 py-2.5 text-[0.8125rem] text-incipiente">
          {aviso}
        </p>
      )}
      {actaSubida && (
        <p className="mb-5 rounded-[7px] border border-logrado-line bg-logrado-tint px-3.5 py-2.5 text-[0.8125rem] text-logrado">
          Acta subida.
        </p>
      )}

      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className={CLASE_ROTULO}>1 · Prepara la reunión</p>
        <p className="mt-1 text-sm text-muted">Elige la reunión que vas a trabajar hoy.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {nivel.reuniones.map((r) => {
            const activa = r.numero === nivel.reunionActualNumero;
            const action = async () => {
              "use server";
              await actualizarReunionActual(nivel.id, r.numero);
            };
            return (
              <form action={action} key={r.id}>
                <button
                  className={`inline-flex items-center gap-1.5 rounded-[7px] border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                    activa
                      ? "border-transparent bg-foreground text-surface"
                      : "border-border-strong text-muted hover:border-muted-2 hover:text-foreground"
                  }`}
                >
                  <b className="font-mono">R{r.numero}</b>
                  <span className="font-normal opacity-70">{FASE_LABEL[r.fase]}</span>
                </button>
              </form>
            );
          })}
        </div>

        <div className="mt-7 border-t border-border pt-5">
          <p className={CLASE_ROTULO}>2 · Pide las respuestas</p>
          <p className="mb-3 mt-1 text-sm text-muted">Comparte este enlace con el equipo docente.</p>
          <EnlaceDocentes nivelId={nivel.id} codigo={nivel.codigo} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <p className={CLASE_ROTULO}>3 · Conversa y decide</p>
        <p className="text-[0.9375rem] text-muted">
          {totalEvaluaciones === 0
            ? "Todavía nadie ha respondido en esta reunión."
            : `${plural(totalEvaluaciones, "respuesta recibida", "respuestas recibidas")}.`}
        </p>
        {totalEvaluaciones > 0 ? (
          <Link className="mt-4 inline-block" href={`/niveles/${nivel.id}/resultados`}>
            <Button>Ver y conducir la reunión</Button>
          </Link>
        ) : null}
      </div>

      {reunionActual && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <p className={CLASE_ROTULO}>4 · Cierra la reunión</p>
          <p className="mb-4 mt-1 text-sm text-muted">
            Cuando terminen, guarda el acta como respaldo. No necesitas subirla para ver el análisis.
          </p>
          <form
            action={subirActaCoordinador.bind(null, nivel.id, reunionActual.id, user.name ?? "Coordinación")}
            className="flex flex-wrap items-center gap-3"
          >
            <input type="file" name="archivo" required className="flex-1 text-[0.8125rem] text-muted file:mr-3 file:rounded-[7px] file:border file:border-border-strong file:bg-surface file:px-2.5 file:py-[5px] file:text-xs file:font-medium file:text-foreground" />
            <Button type="submit" size="sm" variant="secondary">Subir acta</Button>
          </form>
          {actas.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {actas.map((a) => <li key={a.id}><a href={a.url} target="_blank" className="text-ua hover:underline">{a.nombreArchivo}</a><span className="ml-2 text-xs text-muted-2">· {a.subidoPor}</span></li>)}
            </ul>
          )}
        </div>
      )}

      <p className="mt-8 text-[0.8125rem] text-muted-2">
        ¿Cambió algo del nivel?{" "}
        <Link
          href={`/niveles/${nivel.id}/configurar/competencias`}
          className="text-ua hover:underline"
        >
          Volver a la configuración
        </Link>
      </p>
    </div>
  );
}
