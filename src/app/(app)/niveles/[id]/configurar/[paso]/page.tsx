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
    ayuda: "Las que se dictan este trimestre.",
    pendiente: "Agrega al menos una asignatura para continuar.",
  },
  docentes: {
    titulo: "Quién hace clases en cada una",
    ayuda: "No crean cuenta: entran por un enlace que tú les mandas.",
    pendiente: "Agrega al menos un docente para continuar.",
  },
  vinculos: {
    titulo: "Qué competencia trabaja cada asignatura",
    ayuda: "Ya cargamos lo declarado en cada programa. Abre una asignatura solo si quieres revisarla.",
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
  const vinculosDeclarados = nivel.asignaturas.reduce(
    (total, asignatura) => total + (tributacionDePrograma(asignatura.nombre)?.lineas.length ?? 0),
    0
  );

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
    <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      {/* Dónde estás, sin palabras de más */}
      <div className="mb-8 flex items-center gap-2" role="img" aria-label={`Paso ${numero} de ${total}`}>
        {PASOS.map((p, i) => (
          <span
            key={p}
            className={`h-1.5 flex-1 rounded-full ${
              i + 1 < numero ? "bg-logrado" : i + 1 === numero ? "bg-ua" : "bg-border"
            }`}
          />
        ))}
      </div>

      <Eyebrow>Paso {numero} de {total}</Eyebrow>
      <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
        {TEXTO[pasoId].titulo}
      </h1>
      <p className="mt-2 text-[0.9375rem] text-muted">{TEXTO[pasoId].ayuda}</p>

      <div className="mt-10 rounded-[2rem] border border-border bg-surface p-5 shadow-[0_28px_80px_-58px_rgba(17,19,24,.48)] sm:p-8">
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
              <div className="rounded-2xl border border-logrado-line bg-logrado-tint/60 p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-logrado text-sm font-semibold text-white" aria-hidden="true">✓</span>
                  <div>
                    <h2 className="text-base font-semibold">Cruce curricular preparado</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {programasEncontrados} de {nivel.asignaturas.length} programas identificados · {vinculosDeclarados} relaciones declaradas.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-2">
                      “Del programa” significa que la competencia aparece expresamente en el programa de la asignatura. “Transversal” sirve para un refuerzo adicional acordado por el equipo.
                    </p>
                  </div>
                </div>
              </div>

              {nivel.asignaturas.map((a, asignaturaIndex) => {
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
                  ? "Solo declara competencia genérica"
                  : coincideConPrograma
                    ? "Cargada desde el programa"
                    : programa
                      ? "Ajustada por el equipo"
                      : "Revisión manual";
                const estadoListo = coincideConPrograma;

                return (
                  <details
                    key={a.id}
                    open={asignaturaIndex === 0 || !programa}
                    className="group overflow-hidden rounded-2xl border border-border bg-surface open:shadow-[0_22px_55px_-42px_rgba(17,19,24,.45)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:content-none">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-[1.0625rem] font-semibold">{a.nombre}</h2>
                          <span className={`rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold ${estadoListo ? "bg-logrado-tint text-logrado" : "bg-proceso-tint text-proceso"}`}>
                            {estado}
                          </span>
                        </div>
                        {competenciasMarcadas.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {competenciasMarcadas.map((competencia) => (
                              <span key={competencia.id} className="rounded-md border border-border bg-surface-muted px-2 py-1 text-xs text-muted">
                                {competencia.codigo} {competencia.nombre}
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
                      <span className="shrink-0 text-lg text-muted-2 transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
                    </summary>

                    <form action={guardar} className="border-t border-border bg-surface-muted/35 px-5 pb-5">
                      <ul className="flex flex-col divide-y divide-border">
                        {nivel.competencias.map((c) => {
                          const actual = tipoDe(c.id);
                          return (
                            <li
                              key={c.id}
                              className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 py-4"
                            >
                              <div className="min-w-0 flex-1 sm:max-w-[25rem]">
                                <div className="flex items-baseline gap-2.5">
                                  <span className="font-mono text-[0.6875rem] font-medium text-muted-2">
                                    {c.codigo}
                                  </span>
                                  <span className="text-[0.9375rem] font-medium">{c.nombre}</span>
                                </div>
                                <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
                                  {c.descriptor}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                {(
                                  [
                                    ["NADA", "No corresponde"],
                                    ["DIRECTA", "Del programa"],
                                    ["TRANSVERSAL", "Transversal"],
                                  ] as const
                                ).map(([valor, etiqueta]) => (
                                  <label
                                    key={valor}
                                    className="cursor-pointer select-none rounded-[7px] border border-border-strong px-2.5 py-1 text-xs text-muted transition-colors hover:border-muted-2 hover:text-foreground has-[:checked]:border-ua has-[:checked]:bg-ua-tint has-[:checked]:font-medium has-[:checked]:text-ua"
                                  >
                                    <input
                                      type="radio"
                                      name={`tipo:${c.id}`}
                                      value={valor}
                                      defaultChecked={actual === valor}
                                      className="sr-only"
                                    />
                                    {etiqueta}
                                  </label>
                                ))}
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <Button type="submit" size="sm" variant="secondary" className="mt-4">
                        Guardar cambios
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
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
        <Link href={atras} className="text-[0.8125rem] text-muted hover:text-foreground">
          ← Atrás
        </Link>
        {resuelto[pasoId] ? (
          <Link href={siguiente}>
            <Button>{numero < total ? "Listo, siguiente" : "Terminar"}</Button>
          </Link>
        ) : (
          <span className="text-[0.8125rem] text-muted-2">{TEXTO[pasoId].pendiente}</span>
        )}
      </div>
    </div>
  );
}
