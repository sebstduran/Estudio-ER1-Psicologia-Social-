import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Button, CLASE_ROTULO, Eyebrow } from "@/components/ui";
import { RutaProgreso } from "@/components/ruta-progreso";
import { actualizarReunionActual } from "@/lib/actions/niveles";
import { subirActaCoordinador } from "@/lib/actions/actas";
import { EnlaceDocentes } from "./enlace-docentes";
import { crearAccesoDocente } from "@/lib/acceso-docente";

const MODALIDAD_LABEL = { DIURNO: "Diurno", VESPERTINO_TECH: "Vespertino" } as const;

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
  const revisarActa = sp.revision === "acta";

  const user = await requireCoordinador();

  const nivel = await prisma.nivel.findFirst({
    where: { id, coordinadorId: user.id },
    include: {
      asignaturas: { select: { id: true, _count: { select: { mapeos: true } } } },
      competencias: { select: { id: true } },
      docentes: {
        orderBy: { nombre: "asc" },
        select: {
          id: true,
          nombre: true,
          asignaturas: { select: { asignatura: { select: { nombre: true } } } },
        },
      },
      reuniones: {
        orderBy: { numero: "asc" },
        include: {
          evaluaciones: { select: { docenteId: true } },
          _count: { select: { evaluaciones: true, actas: true, informes: true } },
        },
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
  const docentesQueRespondieron = new Set(
    reunionActual?.evaluaciones.map((evaluacion) => evaluacion.docenteId) ?? []
  ).size;
  const esCierre = reunionActual?.fase === "CIERRE";
  const hayRespuestas = docentesQueRespondieron > 0;
  const hayActa = actas.length > 0;
  const etapaActual = !hayRespuestas ? 2 : !hayActa ? 3 : 4;
  const enlacesDocentes = reunionActual
    ? nivel.docentes.map((docente) => ({
        id: docente.id,
        nombre: docente.nombre,
        asignaturas: docente.asignaturas.map((item) => item.asignatura.nombre),
        token: crearAccesoDocente({
          nivelId: nivel.id,
          docenteId: docente.id,
          reunionId: reunionActual.id,
        }),
      }))
    : [];

  const etapas = [
    { numero: 1, titulo: "Preparar", apoyo: "Nivel y equipo" },
    { numero: 2, titulo: "Responder", apoyo: "Voz docente" },
    { numero: 3, titulo: "Subir acta", apoyo: `Reunión ${reunionActual?.numero ?? ""}` },
    { numero: 4, titulo: "Resultados", apoyo: "Análisis y acciones" },
  ];

  return (
    <div className="product-page !max-w-6xl">
      <section className="product-hero mb-5 flex flex-wrap items-end justify-between gap-7">
        <div className="relative z-10">
        <Eyebrow className="!text-white/45">Comunidad académica</Eyebrow>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">{nivel.nombre}</h1>
        <p className="mt-3 text-sm text-white/52">
          {MODALIDAD_LABEL[nivel.modalidad]} · {nivel.trimestre} ·{" "}
          {plural(nivel.reuniones.length, "reunión", "reuniones")}
        </p>
        </div>
        {reunionActual && <span className="relative z-10 rounded-full border border-white/16 bg-white/[.07] px-4 py-2.5 text-xs font-medium text-white/72">R{reunionActual.numero} · {FASE_LABEL[reunionActual.fase]}</span>}
      </section>

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

      <RutaProgreso etapas={etapas} actual={etapaActual} className="mb-4" />

      <details className="group mb-5 rounded-[1.35rem] border border-border bg-surface/72 backdrop-blur-xl">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className={CLASE_ROTULO}>REUNIÓN ACTUAL</p>
            <p className="mt-1 truncate text-sm font-semibold">R{reunionActual?.numero} · {reunionActual ? FASE_LABEL[reunionActual.fase] : ""}</p>
            <p className="mt-0.5 text-xs text-muted">{docentesQueRespondieron} de {plural(nivel.docentes.length, "docente", "docentes")} · {hayActa ? "acta lista" : "acta pendiente"}</p>
          </div>
          <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted">Cambiar reunión <i className="not-italic transition-transform group-open:rotate-180" aria-hidden="true">⌄</i></span>
        </summary>
        <div className="grid gap-2 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          {nivel.reuniones.map((r) => {
            const activa = r.numero === nivel.reunionActualNumero;
            const respondieron = new Set(r.evaluaciones.map((evaluacion) => evaluacion.docenteId)).size;
            const tieneDatos = respondieron > 0;
            const tieneActa = r._count.actas > 0;
            const action = async () => {
              "use server";
              await actualizarReunionActual(nivel.id, r.numero);
            };
            return (
              <form action={action} key={r.id}>
                <button
                  disabled={activa}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    activa
                      ? "border-transparent bg-[#12141b] text-white shadow-lg"
                      : "border-border bg-surface-muted/55 text-foreground hover:-translate-y-0.5 hover:border-border-strong"
                  }`}
                >
                  <span className="flex items-center justify-between"><b className="font-mono text-lg">R{r.numero}</b><i className={`h-2 w-2 rounded-full ${tieneActa ? "bg-logrado" : tieneDatos ? "bg-proceso" : "bg-border-strong"}`} /></span>
                  <span className="mt-1 block text-xs opacity-65">{FASE_LABEL[r.fase]}</span>
                  <span className="mt-3 block text-[0.68rem] opacity-55">{tieneDatos ? `${respondieron}/${nivel.docentes.length} docentes` : "Sin respuestas"} · {tieneActa ? "Acta lista" : "Sin acta"}</span>
                </button>
              </form>
            );
          })}
        </div>
      </details>

      {!hayRespuestas && (
        <section className="mb-5 rounded-[2rem] border border-border bg-surface p-6 shadow-[0_24px_70px_-52px_rgba(17,19,24,.42)] sm:p-9">
          <Eyebrow>Paso 2 de 4</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Envía el enlace al equipo docente</h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">Cada persona recibe su acceso directo y responde únicamente las preguntas de sus asignaturas. Sin cuenta, correo ni contraseña.</p>
          <div className="mt-7"><EnlaceDocentes nivelId={nivel.id} enlaces={enlacesDocentes} /></div>
          <p className="mt-6 rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted">Esperando respuestas · cuando llegue la primera, podrás incorporar el acta.</p>
        </section>
      )}

      {!hayActa && reunionActual && (hayRespuestas || revisarActa) && (
        <section id="cargar-acta" className="mb-5 scroll-mt-24 rounded-[2rem] border border-border bg-surface p-6 shadow-[0_24px_70px_-52px_rgba(17,19,24,.42)] sm:p-9">
          <Eyebrow>Paso 3 de 4</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Sube el acta de la reunión</h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{hayRespuestas ? `${docentesQueRespondieron === 1 ? "Ya respondió" : "Ya respondieron"} ${docentesQueRespondieron} de ${plural(nivel.docentes.length, "docente", "docentes")}. Ahora agrega el acta para completar la evidencia de esta reunión.` : "Puedes revisar o utilizar la carga desde ahora. Los resultados reales se habilitarán cuando también exista al menos una respuesta docente."}</p>
          <form action={subirActaCoordinador.bind(null, nivel.id, reunionActual.id)} className="mt-7 flex flex-col gap-4 rounded-2xl border border-dashed border-border-strong bg-surface-muted p-5 sm:flex-row sm:items-center">
            <input type="file" name="archivo" accept=".pdf,.txt,.png,.jpg,.jpeg,.webp" required className="min-w-0 flex-1 text-[0.8125rem] text-muted file:mr-3 file:rounded-full file:border file:border-border-strong file:bg-surface file:px-3.5 file:py-2 file:text-xs file:font-medium file:text-foreground" />
            <Button type="submit">Subir acta de R{reunionActual.numero}</Button>
          </form>
        </section>
      )}

      {hayRespuestas && hayActa && (
        <section className="product-hero mb-5">
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

      <details className="group rounded-[1.35rem] border border-border bg-surface/68 backdrop-blur-xl">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div><p className={CLASE_ROTULO}>OPCIONAL</p><h2 id="accesos-revision" className="mt-0.5 text-base font-semibold">Revisar otra parte</h2></div>
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
        </summary>
        <div className="grid gap-2 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href={`/niveles/${nivel.id}/configurar/asignaturas`} className="rounded-2xl border border-border bg-surface-muted/60 p-4 transition-colors hover:border-border-strong hover:bg-surface"><span className="font-mono text-[0.65rem] text-ua">01</span><b className="mt-3 block text-sm">Configuración</b><span className="mt-1 block text-xs text-muted">Nivel, equipo y competencias</span></Link>
          <Link href={`/evaluar/${nivel.id}`} className="rounded-2xl border border-border bg-surface-muted/60 p-4 transition-colors hover:border-border-strong hover:bg-surface"><span className="font-mono text-[0.65rem] text-ua">02</span><b className="mt-3 block text-sm">Formulario docente</b><span className="mt-1 block text-xs text-muted">Ver lo que responderán</span></Link>
          <Link href={`/niveles/${nivel.id}?revision=acta#cargar-acta`} className="rounded-2xl border border-border bg-surface-muted/60 p-4 transition-colors hover:border-border-strong hover:bg-surface"><span className="font-mono text-[0.65rem] text-ua">03</span><b className="mt-3 block text-sm">Carga de acta</b><span className="mt-1 block text-xs text-muted">Abrir la carga de esta reunión</span></Link>
          <Link href={`/niveles/${nivel.id}/resultados/vista-previa`} className="rounded-2xl border border-border bg-surface-muted/60 p-4 transition-colors hover:border-border-strong hover:bg-surface"><span className="font-mono text-[0.65rem] text-ua">04</span><b className="mt-3 block text-sm">Resultados</b><span className="mt-1 block text-xs text-muted">Ver una demostración completa</span></Link>
        </div>
      </details>

    </div>
  );
}
