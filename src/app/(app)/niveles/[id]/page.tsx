import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Button, Card, CLASE_ROTULO, Eyebrow, Paso, TipoMapeoBadge } from "@/components/ui";
import { eliminarAsignatura, ciclarMapeo } from "@/lib/actions/asignaturas";
import { eliminarCompetencia } from "@/lib/actions/competencias";
import { eliminarDocente } from "@/lib/actions/docentes";
import { actualizarReunionActual } from "@/lib/actions/niveles";
import { subirActaCoordinador } from "@/lib/actions/actas";
import { AsignaturaForm } from "./asignatura-form";
import { CompetenciaForm } from "./competencia-form";
import { DocenteForm } from "./docente-form";
import { EnlaceDocentes } from "./enlace-docentes";

const CICLO_LABEL = {
  INICIAL: "Ciclo Inicial",
  INTERMEDIO: "Ciclo Intermedio",
  FINAL: "Ciclo Final",
} as const;

const MODALIDAD_LABEL = { DIURNO: "Diurno", VESPERTINO_TECH: "Vespertino/TECH" } as const;

/** "1 docente" / "3 docentes": el singular importa en una pantalla de trabajo. */
function plural(n: number, singular: string, plural_: string) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

const FASE_LABEL = {
  BASE: "Línea base",
  SEGUIMIENTO: "Seguimiento",
  CIERRE: "Cierre comparativo",
} as const;

export default async function NivelDetallePage({
  params,
  searchParams,
}: PageProps<"/niveles/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const aviso = typeof sp.error === "string" ? sp.error : undefined;
  const actaSubida = sp.acta === "1";

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
      reuniones: { orderBy: { numero: "asc" } },
    },
  });
  if (!nivel) notFound();

  const componentes = await prisma.componenteEPG.findMany({ orderBy: { orden: "asc" } });
  const reunionActual = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero);
  const actas = reunionActual
    ? await prisma.acta.findMany({ where: { reunionId: reunionActual.id }, orderBy: { createdAt: "desc" } })
    : [];

  const totalMapeos = nivel.asignaturas.reduce((n, a) => n + a.mapeos.length, 0);
  const totalEvaluaciones = reunionActual
    ? await prisma.evaluacion.count({ where: { reunionId: reunionActual.id } })
    : 0;

  const mapeoPorPar = new Map(
    nivel.asignaturas.flatMap((a) => a.mapeos.map((m) => [`${a.id}:${m.competenciaId}`, m.tipo] as const))
  );

  // El paso en curso lo define el estado de los datos, no una navegación aparte.
  const hecho = {
    competencias: nivel.competencias.length > 0,
    asignaturas: nivel.asignaturas.length > 0,
    docentes: nivel.docentes.length > 0,
    mapeo: totalMapeos > 0,
  };
  const pasoActual = !hecho.competencias
    ? 1
    : !hecho.asignaturas
      ? 2
      : !hecho.docentes
        ? 3
        : !hecho.mapeo
          ? 4
          : 5;

  const estadoDe = (n: number) => (n < pasoActual ? "listo" : n === pasoActual ? "actual" : "pendiente");
  const completados = [hecho.competencias, hecho.asignaturas, hecho.docentes, hecho.mapeo].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Encabezado */}
      <div className="mb-8">
        <Eyebrow>{CICLO_LABEL[nivel.cicloTipo]}</Eyebrow>
        <h1 className="mt-1.5 text-[2.125rem] font-semibold tracking-tight">{nivel.nombre}</h1>
        <p className="mt-1.5 text-sm text-muted">
          {MODALIDAD_LABEL[nivel.modalidad]} · {nivel.trimestre}
        </p>
      </div>

      {/* Progreso */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={CLASE_ROTULO}>Configuración</p>
            <p className="mt-1 text-base font-semibold">
              {pasoActual === 5 ? "Todo listo" : `Paso ${pasoActual} de 4`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" role="img" aria-label={`${completados} de 4 pasos completados`}>
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={`h-1 w-9 rounded-full ${n <= completados ? "bg-logrado" : "bg-border"}`}
                />
              ))}
            </div>
            {pasoActual === 5 && (
              <Link href={`/niveles/${nivel.id}/resultados`}>
                <Button>Ver qué fortalecer</Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {aviso && (
        <p className="mb-5 rounded-[7px] border border-incipiente-line bg-incipiente-tint px-3.5 py-2.5 text-[0.8125rem] text-incipiente">
          {aviso}
        </p>
      )}
      {actaSubida && (
        <p className="mb-5 rounded-[7px] border border-logrado-line bg-logrado-tint px-3.5 py-2.5 text-[0.8125rem] text-logrado">
          Acta subida correctamente.
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {/* ── 1. Competencias ── */}
        <Paso
          numero={1}
          titulo="Las competencias del ciclo"
          descripcion={
            nivel.cicloTipo === "INICIAL"
              ? "El Ciclo Inicial viene con sus seis competencias e indicadores ya cargados."
              : "Agrega las competencias de este ciclo con su código, descriptor, tres indicadores observables y el componente EPG al que se vinculan."
          }
          estado={estadoDe(1)}
          colapsar={pasoActual === 5}
          resumen={plural(nivel.competencias.length, "competencia", "competencias")}
        >
          <div className="flex flex-col gap-3">
            {nivel.competencias.map((c) => {
              const action = async () => {
                "use server";
                await eliminarCompetencia(nivel.id, c.id);
              };
              return (
                <div key={c.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Eyebrow>
                        {c.codigo} · {c.componenteEpg.nombre}
                      </Eyebrow>
                      <h3 className="mt-1 text-base font-medium">{c.nombre}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{c.descriptor}</p>
                      <ul className="mt-2.5 space-y-1 text-sm text-muted">
                        {c.indicadores.map((i) => (
                          <li key={i.id} className="flex gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-2" />
                            {i.texto}
                          </li>
                        ))}
                      </ul>
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
        </Paso>

        {/* ── 2. Asignaturas ── */}
        <Paso
          numero={2}
          titulo="Las asignaturas del nivel"
          descripcion="Las que se dictan en este nivel durante el trimestre."
          estado={estadoDe(2)}
          colapsar={pasoActual === 5}
          resumen={plural(nivel.asignaturas.length, "asignatura", "asignaturas")}
        >
          <div className="flex flex-col gap-4">
            <AsignaturaForm nivelId={nivel.id} />
            {nivel.asignaturas.length > 0 && (
              <ul className="divide-y divide-border">
                {nivel.asignaturas.map((a) => {
                  const action = async () => {
                    "use server";
                    await eliminarAsignatura(nivel.id, a.id);
                  };
                  return (
                    <li key={a.id} className="flex items-center justify-between py-2.5">
                      <span className="text-sm">{a.nombre}</span>
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
        </Paso>

        {/* ── 3. Docentes ── */}
        <Paso
          numero={3}
          titulo="Quién hace clases en cada una"
          descripcion="No necesitan crear una cuenta: entran por un enlace que tú les mandas."
          estado={estadoDe(3)}
          colapsar={pasoActual === 5}
          resumen={plural(nivel.docentes.length, "docente", "docentes")}
        >
          <div className="flex flex-col gap-5">
            <DocenteForm
              nivelId={nivel.id}
              asignaturas={nivel.asignaturas.map((a) => ({ id: a.id, nombre: a.nombre }))}
            />
            {nivel.docentes.length > 0 && (
              <ul className="divide-y divide-border">
                {nivel.docentes.map((d) => {
                  const action = async () => {
                    "use server";
                    await eliminarDocente(nivel.id, d.id);
                  };
                  return (
                    <li key={d.id} className="flex items-center justify-between gap-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{d.nombre}</p>
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
        </Paso>

        {/* ── 4. Mapeo ── */}
        <Paso
          numero={4}
          titulo="Qué competencia trabaja cada asignatura"
          descripcion="Haz clic en cada celda para cambiarla: sin relación, directa o transversal. Así cada docente evalúa solo lo que le toca."
          estado={estadoDe(4)}
          colapsar={pasoActual === 5}
          resumen={plural(totalMapeos, "vínculo", "vínculos")}
        >
          {nivel.asignaturas.length === 0 || nivel.competencias.length === 0 ? (
            <p className="text-sm text-muted">
              Necesitas al menos una asignatura y una competencia para construir el mapeo.
            </p>
          ) : (
            <div className="-mx-2 overflow-x-auto">
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
          )}
        </Paso>

        {/* ── 5. Evaluar ── */}
        <Paso
          numero={5}
          titulo="Ahora: pídeles que evalúen"
          descripcion="Marca en qué reunión vas, manda el enlace y sube el acta cuando terminen."
          estado={pasoActual === 5 ? "actual" : "pendiente"}
          colapsar={pasoActual === 5}
        >
          <div className="flex flex-col gap-6">
            {/* Reunión en curso */}
            <div>
              <p className={`${CLASE_ROTULO} mb-2.5 block`}>1 · Marca en qué reunión vas</p>
              <div className="flex flex-wrap items-center gap-2">
                {nivel.reuniones.map((r) => {
                  const activa = r.numero === nivel.reunionActualNumero;
                  const action = async () => {
                    "use server";
                    await actualizarReunionActual(nivel.id, r.numero);
                  };
                  return (
                    <form action={action} key={r.id}>
                      <button
                        className={`inline-flex items-center gap-1.5 rounded-[7px] border px-2.5 py-[5px] text-xs font-medium transition-colors ${
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
            </div>

            {pasoActual === 5 && (
              <>
                <EnlaceDocentes nivelId={nivel.id} codigo={nivel.codigo} />

                {/* Actas */}
                {reunionActual && (
                  <div className="border-t border-border pt-5">
                    <p className={`${CLASE_ROTULO} mb-2.5 block`}>
                      3 · Sube el acta de la reunión {reunionActual.numero}
                    </p>
                    <form
                      action={subirActaCoordinador.bind(
                        null,
                        nivel.id,
                        reunionActual.id,
                        user.name ?? "Coordinación"
                      )}
                      className="flex flex-wrap items-center gap-3"
                    >
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
                      <ul className="mt-3 flex flex-col gap-1.5 text-sm">
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
                  </div>
                )}

                <div className="border-t border-border pt-5">
                  <p className="text-sm text-muted">
                    {totalEvaluaciones === 0
                      ? "Todavía nadie ha respondido en esta reunión."
                      : `${plural(totalEvaluaciones, "respuesta recibida", "respuestas recibidas")} en esta reunión.`}
                  </p>
                  {totalEvaluaciones > 0 && (
                    <Link href={`/niveles/${nivel.id}/resultados`} className="mt-3 inline-block">
                      <Button>Ver qué fortalecer</Button>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </Paso>
      </div>
    </div>
  );
}
