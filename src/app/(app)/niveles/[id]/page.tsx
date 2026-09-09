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
  const hayRespuestas = totalEvaluaciones > 0;
  const hayActa = actas.length > 0;
  const etapaActual = !hayRespuestas ? 2 : !hayActa ? 3 : 4;

  const etapas = [
    { numero: 1, titulo: "Preparar", apoyo: "Nivel y equipo" },
    { numero: 2, titulo: "Responder", apoyo: "Voz docente" },
    { numero: 3, titulo: "Subir acta", apoyo: `Reunión ${reunionActual?.numero ?? ""}` },
    { numero: 4, titulo: "Resultados", apoyo: "Análisis y acciones" },
  ];

  return (
    <div className="product-page !max-w-6xl">
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

      <nav aria-label="Proceso de la comunidad académica" className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {etapas.map((etapa) => {
          const completa = etapa.numero < etapaActual;
          const activa = etapa.numero === etapaActual;
          return (
            <div
              key={etapa.numero}
              aria-current={activa ? "step" : undefined}
              className={`rounded-2xl border p-4 transition-colors ${
                activa
                  ? "border-transparent bg-[#111318] text-white shadow-lg"
                  : completa
                    ? "border-logrado-line bg-logrado-tint text-foreground"
                    : "border-border bg-surface text-muted-2"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold">{completa ? "✓" : `0${etapa.numero}`}</span>
                {activa && <span className="h-2 w-2 rounded-full bg-ua" />}
              </div>
              <p className="mt-5 text-sm font-semibold">{etapa.titulo}</p>
              <p className={`mt-0.5 text-xs ${activa ? "text-white/50" : "text-muted-2"}`}>{etapa.apoyo}</p>
            </div>
          );
        })}
      </nav>

      <section className="mb-6 rounded-[2rem] border border-border bg-surface p-6 shadow-[0_24px_70px_-52px_rgba(17,19,24,.42)] sm:p-8">
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

      {!hayRespuestas && (
        <section className="rounded-[2rem] border border-border bg-surface p-6 shadow-[0_24px_70px_-52px_rgba(17,19,24,.42)] sm:p-9">
          <Eyebrow>Paso 2 de 4</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Envía el enlace al equipo docente</h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">Cada persona entra, elige su nombre y responde únicamente las preguntas de sus asignaturas. Sin cuenta ni correo.</p>
          <div className="mt-7"><EnlaceDocentes nivelId={nivel.id} codigo={nivel.codigo} /></div>
          <p className="mt-6 rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted">Aún no hay respuestas. Cuando llegue la primera, se habilitará el paso del acta.</p>
        </section>
      )}

      {hayRespuestas && !hayActa && reunionActual && (
        <section className="rounded-[2rem] border border-border bg-surface p-6 shadow-[0_24px_70px_-52px_rgba(17,19,24,.42)] sm:p-9">
          <Eyebrow>Paso 3 de 4</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Sube el acta de la reunión</h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">Ya recibimos {plural(totalEvaluaciones, "respuesta", "respuestas")}. Ahora agrega el acta para completar la evidencia de esta reunión.</p>
          <form action={subirActaCoordinador.bind(null, nivel.id, reunionActual.id, user.name ?? "Coordinación")} className="mt-7 flex flex-col gap-4 rounded-2xl border border-dashed border-border-strong bg-surface-muted p-5 sm:flex-row sm:items-center">
            <input type="file" name="archivo" accept=".pdf,.txt,.png,.jpg,.jpeg,.webp" required className="min-w-0 flex-1 text-[0.8125rem] text-muted file:mr-3 file:rounded-full file:border file:border-border-strong file:bg-surface file:px-3.5 file:py-2 file:text-xs file:font-medium file:text-foreground" />
            <Button type="submit">Subir acta de R{reunionActual.numero}</Button>
          </form>
        </section>
      )}

      {hayRespuestas && hayActa && (
        <section className="product-hero">
          <div className="relative z-10">
            <p className="font-mono text-xs tracking-[.14em] text-white/45">PASO 4 DE 4 · TODO LISTO</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Ya puedes conocer cómo está el nivel</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/55">El análisis cruza las respuestas docentes con el acta de la reunión para mostrar fortalezas, brechas y acciones recomendadas.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/niveles/${nivel.id}/resultados`}><Button className="!bg-white !text-[#111318] hover:!bg-white/90">{esCierre ? "Ver cierre del período" : "Ver resultados"}</Button></Link>
              <Link href={`/niveles/${nivel.id}/configurar/asignaturas`}><Button variant="secondary" className="!border-white/20 !bg-white/8 !text-white">Revisar configuración</Button></Link>
            </div>
            <p className="mt-6 text-xs text-white/40">Acta incorporada: {actas[0]?.nombreArchivo}</p>
          </div>
        </section>
      )}

    </div>
  );
}
