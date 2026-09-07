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
      reuniones: {
        orderBy: { numero: "asc" },
        include: { _count: { select: { evaluaciones: true, actas: true, informes: true } } },
      },
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
  const totalEvaluaciones = reunionActual?._count.evaluaciones ?? 0;
  const esCierre = reunionActual?.fase === "CIERRE";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
        <Eyebrow>Comunidad académica</Eyebrow>
        <h1 className="mt-1.5 text-[2.125rem] font-semibold tracking-tight">{nivel.nombre}</h1>
        <p className="mt-1.5 text-sm text-muted">
          {MODALIDAD_LABEL[nivel.modalidad]} · {nivel.trimestre} ·{" "}
          {plural(nivel.reuniones.length, "reunión", "reuniones")}
        </p>
        </div>
        <Link href={`/niveles/${nivel.id}/configurar/asignaturas`} className="text-sm font-medium text-ua hover:underline">
          Editar nivel
        </Link>
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

      <section className="mb-6 rounded-[1.75rem] border border-border bg-surface/90 p-5 shadow-[0_20px_60px_-48px_rgba(31,20,25,.45)] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className={CLASE_ROTULO}>RECORRIDO DEL PERÍODO</p><h2 className="mt-1 text-xl font-semibold">Elige la reunión de hoy</h2></div>
          <p className="text-xs text-muted">{nivel.modalidad === "DIURNO" ? "4 reuniones · cierre en R4" : "3 reuniones · cierre en R3"}</p>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {nivel.reuniones.map((r) => {
            const activa = r.numero === nivel.reunionActualNumero;
            const tieneDatos = r._count.evaluaciones > 0;
            const tieneActa = r._count.actas > 0;
            const action = async () => {
              "use server";
              await actualizarReunionActual(nivel.id, r.numero);
            };
            return (
              <form action={action} key={r.id}>
                <button
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    activa
                      ? "border-transparent bg-[#12141b] text-white shadow-lg"
                      : "border-border bg-surface-muted/55 text-foreground hover:-translate-y-0.5 hover:border-border-strong"
                  }`}
                >
                  <span className="flex items-center justify-between"><b className="font-mono text-lg">R{r.numero}</b><i className={`h-2 w-2 rounded-full ${tieneActa ? "bg-logrado" : tieneDatos ? "bg-proceso" : "bg-border-strong"}`} /></span>
                  <span className="mt-1 block text-xs opacity-65">{FASE_LABEL[r.fase]}</span>
                  <span className="mt-3 block text-[0.68rem] opacity-55">{tieneDatos ? `${r._count.evaluaciones} respuestas` : "Sin respuestas"} · {tieneActa ? "Acta lista" : "Sin acta"}</span>
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ua-tint font-mono text-xs font-semibold text-ua">01</span>
          <h2 className="mt-4 font-semibold">Recibe respuestas</h2>
          <p className="mb-4 mt-1 text-sm leading-relaxed text-muted">Comparte el enlace. Cada docente verá solo sus asignaturas.</p>
          <EnlaceDocentes nivelId={nivel.id} codigo={nivel.codigo} />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-proceso-tint font-mono text-xs font-semibold text-proceso">02</span>
          <h2 className="mt-4 font-semibold">Revisa y decide</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
          {totalEvaluaciones === 0
            ? "Aún no hay respuestas en esta reunión."
            : `${plural(totalEvaluaciones, "respuesta recibida", "respuestas recibidas")}.`}
          </p>
        {totalEvaluaciones > 0 ? (
          <Link className="mt-4 inline-block" href={`/niveles/${nivel.id}/resultados`}>
            <Button>{esCierre ? "Ver cierre del período" : "Ver resultados"}</Button>
          </Link>
        ) : null}
        </div>

      {reunionActual && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-logrado-tint font-mono text-xs font-semibold text-logrado">03</span>
          <h2 className="mt-4 font-semibold">Guarda el acta de R{reunionActual.numero}</h2>
          <p className="mb-4 mt-1 text-sm leading-relaxed text-muted">
            Queda unida a las respuestas de esta reunión.
          </p>
          <form
            action={subirActaCoordinador.bind(null, nivel.id, reunionActual.id, user.name ?? "Coordinación")}
            className="flex flex-col items-stretch gap-3"
          >
            <input type="file" name="archivo" required className="flex-1 text-[0.8125rem] text-muted file:mr-3 file:rounded-[7px] file:border file:border-border-strong file:bg-surface file:px-2.5 file:py-[5px] file:text-xs file:font-medium file:text-foreground" />
            <Button type="submit" size="sm" variant="secondary">Subir acta de R{reunionActual.numero}</Button>
          </form>
          {actas.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {actas.map((a) => <li key={a.id}><a href={a.url} target="_blank" className="text-ua hover:underline">{a.nombreArchivo}</a><span className="ml-2 text-xs text-muted-2">· {a.subidoPor}</span></li>)}
            </ul>
          )}
        </div>
      )}
      </section>

      {esCierre && totalEvaluaciones > 0 && (
        <section className="mt-6 overflow-hidden rounded-[1.75rem] bg-[#12141b] p-6 text-white sm:p-7">
          <p className="font-mono text-[0.68rem] tracking-[.14em] text-[#75d9ca]">CIERRE DEL PERÍODO</p>
          <h2 className="mt-2 text-2xl font-semibold">Convierte el recorrido en un punto de partida</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">El cierre reúne la evolución, la voz docente y los acuerdos para dejar prioridades claras al próximo período académico.</p>
          <Link className="mt-5 inline-block" href={`/niveles/${nivel.id}/resultados?vista=decisiones`}><Button>Preparar conclusiones finales</Button></Link>
        </section>
      )}

    </div>
  );
}
