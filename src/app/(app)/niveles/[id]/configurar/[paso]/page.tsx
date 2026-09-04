import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Button, Eyebrow, TipoMapeoBadge } from "@/components/ui";
import { eliminarAsignatura, ciclarMapeo } from "@/lib/actions/asignaturas";
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

const PASOS = ["competencias", "asignaturas", "docentes", "vinculos"] as const;
type PasoId = (typeof PASOS)[number];

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
    ayuda: "Haz clic en cada casilla para cambiarla. Así cada docente evalúa solo lo suyo.",
    pendiente: "Marca al menos un vínculo para terminar.",
  },
};

export default async function ConfigurarPasoPage({
  params,
}: PageProps<"/niveles/[id]/configurar/[paso]">) {
  const { id, paso } = await params;
  if (!PASOS.includes(paso as PasoId)) notFound();
  const pasoId = paso as PasoId;
  const numero = PASOS.indexOf(pasoId) + 1;

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

  const siguiente = numero < PASOS.length ? `/niveles/${id}/configurar/${PASOS[numero]}` : `/niveles/${id}`;
  const atras = numero > 1 ? `/niveles/${id}/configurar/${PASOS[numero - 2]}` : `/niveles`;

  // La tabla de vínculos necesita ancho; los formularios se leen mejor estrechos.
  const ancho = pasoId === "vinculos" ? "max-w-4xl" : "max-w-2xl";

  return (
    <div className={`mx-auto ${ancho} px-6 py-12`}>
      {/* Dónde estás, sin palabras de más */}
      <div className="mb-8 flex items-center gap-2" role="img" aria-label={`Paso ${numero} de 4`}>
        {PASOS.map((p, i) => (
          <span
            key={p}
            className={`h-1.5 flex-1 rounded-full ${
              i + 1 < numero ? "bg-logrado" : i + 1 === numero ? "bg-ua" : "bg-border"
            }`}
          />
        ))}
      </div>

      <Eyebrow>Paso {numero} de 4</Eyebrow>
      <h1 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-tight">
        {TEXTO[pasoId].titulo}
      </h1>
      <p className="mt-2 text-[0.9375rem] text-muted">{TEXTO[pasoId].ayuda}</p>

      <div className="mt-8">
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
              Necesitas al menos una asignatura y una competencia para armar esta tabla.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-surface p-3 text-left font-medium text-muted-2">
                      Asignatura
                    </th>
                    {nivel.competencias.map((c) => (
                      <th
                        key={c.id}
                        className="min-w-[110px] border-l border-border p-3 text-left font-medium text-muted-2"
                      >
                        {c.codigo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nivel.asignaturas.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="sticky left-0 bg-surface p-3 font-medium">{a.nombre}</td>
                      {nivel.competencias.map((c) => {
                        const tipo = mapeoPorPar.get(`${a.id}:${c.id}`) ?? null;
                        const action = async () => {
                          "use server";
                          await ciclarMapeo(nivel.id, a.id, c.id);
                        };
                        return (
                          <td key={c.id} className="border-l border-border p-2 text-center">
                            <form action={action}>
                              <button
                                type="submit"
                                className="w-full rounded-lg p-1.5 transition-colors hover:bg-surface-hover"
                              >
                                <TipoMapeoBadge tipo={tipo} />
                              </button>
                            </form>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <Button>{numero < PASOS.length ? "Listo, siguiente" : "Terminar"}</Button>
          </Link>
        ) : (
          <span className="text-[0.8125rem] text-muted-2">{TEXTO[pasoId].pendiente}</span>
        )}
      </div>
    </div>
  );
}
