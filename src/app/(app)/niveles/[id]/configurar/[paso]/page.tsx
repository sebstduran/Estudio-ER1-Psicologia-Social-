import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Button, Eyebrow } from "@/components/ui";
import { eliminarAsignatura, guardarCompetenciasDeAsignatura } from "@/lib/actions/asignaturas";
import { eliminarCompetencia } from "@/lib/actions/competencias";
import { eliminarDocente } from "@/lib/actions/docentes";
import { lineaDeCodigo, tributacionDePrograma } from "@/lib/tributacion-programas";
import { AsignaturaForm } from "../../asignatura-form";
import { CompetenciaForm } from "../../competencia-form";
import { DocenteForm } from "../../docente-form";

/**
 * La configuración, un paso por página.
 *
 * Antes vivía entera en una sola pantalla: cuatro secciones abiertas a la vez,
 * con las seis competencias y sus dieciocho indicadores desplegados encima del
 * paso que tocaba. Se hacía todo y no se veía nada. Ahora cada paso ocupa su
 * página, con una sola cosa que hacer y un botón para avanzar — que sólo se
 * enciende cuando el paso está resuelto, así el avance es la señal de que está
 * hecho y no hace falta decirlo con palabras.
 */

const TODOS_LOS_PASOS = ["competencias", "asignaturas", "docentes", "vinculos"] as const;

/** Las competencias oficiales ya vienen cargadas en los tres ciclos. */
function pasosDe(): readonly PasoId[] {
  return ["asignaturas", "docentes", "vinculos"] as const;
}
type PasoId = (typeof TODOS_LOS_PASOS)[number];

const TEXTO: Record<PasoId, { titulo: string; ayuda: string; pendiente: string }> = {
  competencias: {
    titulo: "Las competencias del nivel",
    ayuda: "Lo que las y los estudiantes deberían lograr en este nivel.",
    pendiente: "Agrega al menos una competencia para continuar.",
  },
  asignaturas: {
    titulo: "Las asignaturas del nivel",
    ayuda: "Las que se dictan durante este período académico.",
    pendiente: "Agrega al menos una asignatura para continuar.",
  },
  docentes: {
    titulo: "Quién hace clases en cada una",
    ayuda: "No crean cuenta: entran por un enlace que tú les mandas.",
    pendiente: "Agrega al menos un docente para continuar.",
  },
  vinculos: {
    titulo: "Confirma el cruce de las asignaturas",
    ayuda: "Los programas ya vienen vinculados con las competencias del ciclo. Revisa solo si algo no calza.",
    pendiente: "Marca al menos un vínculo para terminar.",
  },
};

export default async function ConfigurarPasoPage({
  params,
}: PageProps<"/niveles/[id]/configurar/[paso]">) {
  const { id, paso } = await params;
  if (!TODOS_LOS_PASOS.includes(paso as PasoId)) notFound();
  const pasoId = paso as PasoId;

  const user = await requireCoordinador();

  const nivel = await prisma.nivel.findFirst({
    where: { id, coordinadorId: user.id },
    include: {
      asignaturas: { orderBy: { nombre: "asc" }, include: { mapeos: true } },
      competencias: {
        orderBy: { orden: "asc" },
        include: { componenteEpg: true, indicadores: { orderBy: { orden: "asc" } } },
      },
      docentes: {
        orderBy: { nombre: "asc" },
        include: { asignaturas: { include: { asignatura: true } } },
      },
    },
  });
  if (!nivel) notFound();

  const componentes = await prisma.componenteEPG.findMany({ orderBy: { orden: "asc" } });
  const totalMapeos = nivel.asignaturas.reduce((n, a) => n + a.mapeos.length, 0);
  const mapeoPorPar = new Map(
    nivel.asignaturas.flatMap((a) =>
      a.mapeos.map((m) => [`${a.id}:${m.competenciaId}`, m.tipo] as const)
    )
  );
  const programasEncontrados = nivel.asignaturas.filter((asignatura) =>
    tributacionDePrograma(asignatura.nombre)
  ).length;
  const asignaturasParaRevisar = nivel.asignaturas.filter(
    (asignatura) => !tributacionDePrograma(asignatura.nombre) && asignatura.mapeos.length === 0
  ).length;

  const resuelto: Record<PasoId, boolean> = {
    competencias: nivel.competencias.length > 0,
    asignaturas: nivel.asignaturas.length > 0,
    docentes: nivel.docentes.length > 0,
    vinculos: totalMapeos > 0,
  };

  // Las competencias oficiales se cargan automáticamente para los tres ciclos.
  const PASOS = pasosDe();
  const indice = PASOS.indexOf(pasoId);
  if (indice === -1) redirect(`/niveles/${id}/configurar/${PASOS[0]}`);
  const numero = indice + 1;
  const total = PASOS.length;

  const siguiente =
    numero < total ? `/niveles/${id}/configurar/${PASOS[numero]}` : `/niveles/${id}`;
  const atras = numero > 1 ? `/niveles/${id}/configurar/${PASOS[numero - 2]}` : `/niveles`;


  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="relative overflow-hidden rounded-[2rem] bg-[#12141a] px-6 pb-16 pt-7 text-white shadow-[0_32px_80px_-48px_rgba(17,19,24,.75)] sm:px-10 sm:pb-20 sm:pt-9">
      <div aria-hidden="true" className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-ua/38 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 left-[16%] h-64 w-64 rounded-full bg-[#167b75]/16 blur-3xl" />
      <div className="relative">
      {/* Dónde estás, sin palabras de más */}
      <div className="mb-10 flex items-center gap-2" role="img" aria-label={`Paso ${numero} de ${total}`}>
        {PASOS.map((p, i) => (
          <span
            key={p}
            className={`h-1.5 flex-1 rounded-full ${
              i + 1 < numero ? "bg-[#58c7a1]" : i + 1 === numero ? "bg-[#e16a7e]" : "bg-white/14"
            }`}
          />
        ))}
      </div>

      <Eyebrow className="!text-white/48">Preparar la comunidad · Paso {numero} de {total}</Eyebrow>
      <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
        {TEXTO[pasoId].titulo}
      </h1>
      <p className="mt-3 max-w-2xl text-[0.9375rem] text-white/52">{TEXTO[pasoId].ayuda}</p>
      </div>
      </header>

      <div className="surface-glass relative mx-3 -mt-7 rounded-[2rem] p-5 sm:mx-6 sm:-mt-9 sm:p-8">
        {pasoId === "competencias" && (
          <div className="flex flex-col gap-3">
            {nivel.competencias.map((c) => {
              const action = async () => {
                "use server";
                await eliminarCompetencia(nivel.id, c.id);
              };
              return (
                <div key={c.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Eyebrow>
                        {c.codigo} · {c.componenteEpg.nombre}
                      </Eyebrow>
                      <h2 className="mt-1 text-base font-medium">{c.nombre}</h2>
                      <details className="mt-1.5">
                        <summary className="cursor-pointer list-none text-xs text-muted-2 hover:text-foreground">
                          Ver sus {c.indicadores.length} evidencias ▾
                        </summary>
                        <ul className="mt-2 space-y-1 text-sm text-muted">
                          {c.indicadores.map((i) => (
                            <li key={i.id} className="flex gap-2">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-2" />
                              {i.texto}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                    <form action={action}>
                      <button className="shrink-0 text-xs text-muted-2 transition-colors hover:text-incipiente">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
            <CompetenciaForm nivelId={nivel.id} componentes={componentes} />
          </div>
        )}

        {pasoId === "asignaturas" && (
          <div className="flex flex-col gap-4">
            <AsignaturaForm nivelId={nivel.id} />
            {nivel.asignaturas.length > 0 && (
              <ul className="divide-y divide-border rounded-xl border border-border bg-surface px-4">
                {nivel.asignaturas.map((a) => {
                  const action = async () => {
                    "use server";
                    await eliminarAsignatura(nivel.id, a.id);
                  };
                  return (
                    <li key={a.id} className="flex items-center justify-between py-3">
                      <span className="text-[0.9375rem]">{a.nombre}</span>
                      <form action={action}>
                        <button className="text-xs text-muted-2 transition-colors hover:text-incipiente">
                          Eliminar
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {pasoId === "docentes" && (
          <div className="flex flex-col gap-5">
            <DocenteForm
              nivelId={nivel.id}
              asignaturas={nivel.asignaturas.map((a) => ({ id: a.id, nombre: a.nombre }))}
            />
            {nivel.docentes.length > 0 && (
              <ul className="divide-y divide-border rounded-xl border border-border bg-surface px-4">
                {nivel.docentes.map((d) => {
                  const action = async () => {
                    "use server";
                    await eliminarDocente(nivel.id, d.id);
                  };
                  return (
                    <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="text-[0.9375rem] font-medium">{d.nombre}</p>
                        <p className="text-xs text-muted-2">
                          {d.asignaturas.map((da) => da.asignatura.nombre).join(" · ") ||
                            "Sin asignaturas"}
                        </p>
                      </div>
                      <form action={action}>
                        <button className="shrink-0 text-xs text-muted-2 transition-colors hover:text-incipiente">
                          Eliminar
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {pasoId === "vinculos" &&
          (nivel.asignaturas.length === 0 || nivel.competencias.length === 0 ? (
            <p className="text-sm text-muted">
              Necesitas al menos una asignatura y una competencia.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <section className="relative overflow-hidden rounded-[1.75rem] bg-[#15171d] p-6 text-white shadow-[0_28px_70px_-48px_rgba(17,19,24,.8)] sm:p-7">
                <div aria-hidden="true" className="absolute -right-16 -top-24 size-64 rounded-full bg-[#167b75]/22 blur-3xl" />
                <div aria-hidden="true" className="absolute -bottom-24 left-[28%] size-52 rounded-full bg-ua/25 blur-3xl" />
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#58c7a1] text-sm font-bold text-[#101915]" aria-hidden="true">✓</span>
                    <div>
                      <Eyebrow className="!text-white/45">Cruce preparado</Eyebrow>
                      <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
                        {asignaturasParaRevisar === 0
                          ? "Ya puedes confirmar"
                          : `Solo ${asignaturasParaRevisar === 1 ? "falta una asignatura" : `faltan ${asignaturasParaRevisar} asignaturas`}`}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/58">
                        {asignaturasParaRevisar === 0
                          ? "Las relaciones están resumidas abajo. Abre una asignatura solo si algo no calza."
                          : "Las relaciones automáticas ya están marcadas. Abre solo las asignaturas señaladas para completar el cruce."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3.5 backdrop-blur-sm sm:p-4">
                      <strong className="block text-2xl font-semibold tracking-tight sm:text-3xl">
                        {programasEncontrados}<span className="text-sm font-normal text-white/38">/{nivel.asignaturas.length}</span>
                      </strong>
                      <span className="mt-1 block text-[0.6875rem] leading-snug text-white/48 sm:text-xs">programas reconocidos</span>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3.5 backdrop-blur-sm sm:p-4">
                      <strong className="block text-2xl font-semibold tracking-tight text-[#67d8bc] sm:text-3xl">{totalMapeos}</strong>
                      <span className="mt-1 block text-[0.6875rem] leading-snug text-white/48 sm:text-xs">relaciones activas</span>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3.5 backdrop-blur-sm sm:p-4">
                      <strong className={`block text-2xl font-semibold tracking-tight sm:text-3xl ${asignaturasParaRevisar === 0 ? "text-[#67d8bc]" : "text-[#f0bd5b]"}`}>
                        {asignaturasParaRevisar}
                      </strong>
                      <span className="mt-1 block text-[0.6875rem] leading-snug text-white/48 sm:text-xs">pendientes de revisar</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-between gap-4 px-1 pb-1 pt-2">
                <div>
                  <h2 className="text-sm font-semibold">Asignaturas del nivel</h2>
                  <p className="mt-0.5 text-xs text-muted-2">Abre “Revisar” solo para corregir o agregar una relación.</p>
                </div>
                <span className="hidden rounded-full border border-logrado-line bg-logrado-tint px-3 py-1 text-[0.6875rem] font-medium text-logrado sm:inline-flex">
                  Revisión por excepción
                </span>
              </div>

              {nivel.asignaturas.map((a) => {
                const guardar = guardarCompetenciasDeAsignatura.bind(null, nivel.id, a.id);
                const tipoDe = (cid: string) => mapeoPorPar.get(`${a.id}:${cid}`) ?? "NADA";
                const competenciasMarcadas = nivel.competencias.filter((c) => tipoDe(c.id) !== "NADA");
                const programa = tributacionDePrograma(a.nombre);
                const coincideConPrograma = programa
                  ? nivel.competencias.every((competencia) => {
                      const linea = lineaDeCodigo(competencia.codigo);
                      const declarada = linea ? programa.lineas.includes(linea) : false;
                      return declarada
                        ? tipoDe(competencia.id) === "DIRECTA"
                        : tipoDe(competencia.id) === "NADA";
                    })
                  : false;
                const estado = programa?.soloGenericas
                  ? "Programa revisado"
                  : coincideConPrograma
                    ? "Listo"
                    : programa
                      ? "Ajustada por el equipo"
                      : competenciasMarcadas.length > 0
                        ? "Definida por el equipo"
                        : "Revisar";
                const estadoListo = Boolean(programa) || competenciasMarcadas.length > 0;

                return (
                  <details
                    key={a.id}
                    open={!programa && competenciasMarcadas.length === 0}
                    className="group overflow-hidden rounded-2xl border border-border bg-surface open:shadow-[0_22px_55px_-42px_rgba(17,19,24,.45)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 transition-colors marker:content-none hover:bg-surface-muted/45 sm:px-6">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-[1.0625rem] font-semibold">{a.nombre}</h2>
                          <span className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold ${estadoListo ? "bg-logrado-tint text-logrado" : "bg-proceso-tint text-proceso"}`}>
                            {estado}
                          </span>
                        </div>
                        {competenciasMarcadas.length > 0 ? (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 text-xs text-muted-2">
                              {competenciasMarcadas.length} {competenciasMarcadas.length === 1 ? "competencia" : "competencias"}
                            </span>
                            {competenciasMarcadas.map((competencia) => (
                              <span key={competencia.id} title={competencia.nombre} className="rounded-md border border-border bg-surface-muted px-2 py-0.5 font-mono text-[0.6875rem] text-muted">
                                {competencia.codigo}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1.5 text-xs text-muted-2">
                            {programa?.soloGenericas
                              ? "El programa no declara una competencia de ciclo."
                              : "Aún no hay competencias seleccionadas."}
                          </p>
                        )}
                      </div>
                      <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted transition-colors group-hover:text-foreground">
                        Revisar
                        <i className="grid size-7 place-items-center rounded-full border border-border bg-surface text-base not-italic text-muted-2 transition-transform group-open:rotate-180" aria-hidden="true">⌄</i>
                      </span>
                    </summary>

                    <form action={guardar} className="border-t border-border bg-surface-muted/35 p-5 sm:p-6">
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold">¿Qué competencias trabaja?</h3>
                        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
                          Las que aparecen en el programa ya están marcadas. Agrega otra solo si esta asignatura también la refuerza de forma intencionada.
                        </p>
                      </div>

                      <ul className="grid gap-2">
                        {nivel.competencias.map((c) => {
                          const actual = tipoDe(c.id);
                          const linea = lineaDeCodigo(c.codigo);
                          const declaradaPorPrograma = Boolean(
                            programa && linea && programa.lineas.includes(linea)
                          );
                          const seleccionada = actual !== "NADA";
                          const valorAlGuardar = declaradaPorPrograma || !programa
                            ? "DIRECTA"
                            : "TRANSVERSAL";
                          return (
                            <li key={c.id}>
                              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-border-strong has-[:checked]:border-logrado-line has-[:checked]:bg-logrado-tint/55">
                                <input
                                  type="checkbox"
                                  name={`tipo:${c.id}`}
                                  value={valorAlGuardar}
                                  defaultChecked={seleccionada}
                                  className="mt-1 size-4 shrink-0 accent-[var(--logrado)]"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                  <span className="font-mono text-[0.6875rem] font-medium text-muted-2">
                                    {c.codigo}
                                  </span>
                                  <span className="text-[0.9375rem] font-medium">{c.nombre}</span>
                                    {declaradaPorPrograma ? (
                                      <span className="rounded-full border border-logrado-line bg-surface px-2 py-0.5 text-[0.625rem] font-medium text-logrado">
                                        Programa oficial
                                      </span>
                                    ) : seleccionada ? (
                                      <span className="rounded-full border border-ua/20 bg-ua-tint px-2 py-0.5 text-[0.625rem] font-medium text-ua">
                                        Agregada por el equipo
                                      </span>
                                    ) : null}
                                  </span>
                                  <span className="mt-1 block text-[0.8125rem] leading-relaxed text-muted">
                                    {c.descriptor}
                                  </span>
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>

                      <Button type="submit" size="sm" className="mt-5">
                        Guardar este ajuste
                      </Button>
                    </form>
                  </details>
                );
              })}
            </div>
          ))}
      </div>

      {/* Avanzar. El botón sólo se enciende cuando el paso está resuelto: el
          avance mismo confirma que está hecho, sin un aviso extra que leer. */}
      <div className="sticky bottom-4 z-20 mx-3 mt-8 flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-surface/88 px-5 py-4 shadow-[0_22px_65px_-38px_rgba(17,19,24,.5)] backdrop-blur-2xl sm:mx-6">
        <Link href={atras} className="text-[0.8125rem] text-muted hover:text-foreground">
          ← Atrás
        </Link>
        {resuelto[pasoId] ? (
          <Link href={siguiente}>
            <Button>{numero < total ? "Listo, siguiente" : pasoId === "vinculos" ? "Confirmar y terminar" : "Terminar"}</Button>
          </Link>
        ) : (
          <span className="text-[0.8125rem] text-muted-2">{TEXTO[pasoId].pendiente}</span>
        )}
      </div>
    </main>
  );
}
