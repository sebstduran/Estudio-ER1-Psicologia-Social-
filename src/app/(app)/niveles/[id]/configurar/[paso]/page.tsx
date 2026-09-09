import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Button, Eyebrow } from "@/components/ui";
import { eliminarAsignatura, guardarCompetenciasDeAsignatura } from "@/lib/actions/asignaturas";
import { eliminarCompetencia } from "@/lib/actions/competencias";
import { eliminarDocente } from "@/lib/actions/docentes";
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
    ayuda: "Directa si la enseña y evalúa; transversal si la refuerza.",
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
              {nivel.asignaturas.map((a) => {
                const guardar = guardarCompetenciasDeAsignatura.bind(null, nivel.id, a.id);
                const tipoDe = (cid: string) => mapeoPorPar.get(`${a.id}:${cid}`) ?? "NADA";
                const marcadas = nivel.competencias.filter((c) => tipoDe(c.id) !== "NADA").length;

                return (
                  <form
                    key={a.id}
                    action={guardar}
                    className="rounded-xl border border-border bg-surface p-5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h2 className="text-[1.0625rem] font-medium">{a.nombre}</h2>
                      <span className="text-[0.8125rem] text-muted-2">
                        {marcadas === 0
                          ? "sin competencias marcadas"
                          : `trabaja ${marcadas} ${marcadas === 1 ? "competencia" : "competencias"}`}
                      </span>
                    </div>

                    <ul className="mt-4 flex flex-col divide-y divide-border">
                      {nivel.competencias.map((c) => {
                        const actual = tipoDe(c.id);
                        return (
                          <li
                            key={c.id}
                            className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 py-3.5"
                          >
                            <div className="min-w-0 flex-1 sm:max-w-[26rem]">
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
                                  ["NADA", "No la trabaja"],
                                  ["DIRECTA", "Directa"],
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
                      Guardar {a.nombre}
                    </Button>
                  </form>
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
