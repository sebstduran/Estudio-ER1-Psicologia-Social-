import { prisma } from "@/lib/prisma";
import {
  clasificar,
  scoreDe,
  ORDEN_SEVERIDAD,
  type ConteoLogro,
  type Severidad,
} from "@/lib/diagnostico";

/** Una competencia del ciclo, tal como se dibuja en la casilla del coordinador. */
export type CompetenciaDelCiclo = {
  id: string;
  codigo: string;
  nombre: string;
  score: number | null;
  severidad: Severidad;
  /** Puntos ganados o perdidos desde la línea base. Null en la propia línea base. */
  delta: number | null;
};

export type ResumenNivel = {
  id: string;
  nombre: string;
  ciclo: string;
  modalidad: string;
  trimestre: string;
  reunionNumero: number;
  reunionFase: string | null;
  totalReuniones: number;
  /** Paso 1-4 de configuración, o 5 cuando ya está lista. */
  pasoConfiguracion: number;
  competencias: number;
  asignaturas: number;
  docentes: number;
  /** Reparto de severidad de la reunión en curso. */
  severidades: Record<Severidad, number>;
  /** Cada competencia del ciclo, ordenada por urgencia. */
  competenciasDelCiclo: CompetenciaDelCiclo[];
  docentesQueRespondieron: number;
  acuerdosAbiertos: number;
  evaluado: boolean;
};

function conteoVacio(): ConteoLogro {
  return { LOGRADO: 0, EN_PROCESO: 0, INCIPIENTE: 0, NO_TRABAJADO: 0 };
}

/**
 * Estado de todos los niveles del coordinador en una sola pasada. Es lo que se
 * ve al entrar: la pregunta que responde no es "qué niveles tengo" sino "cuál
 * necesita mi atención hoy".
 */
export async function resumenNiveles(coordinadorId: string): Promise<ResumenNivel[]> {
  const niveles = await prisma.nivel.findMany({
    where: { coordinadorId },
    orderBy: { createdAt: "desc" },
    include: {
      reuniones: { orderBy: { numero: "asc" } },
      _count: { select: { competencias: true, asignaturas: true, docentes: true } },
      asignaturas: { select: { _count: { select: { mapeos: true } } } },
    },
  });
  if (niveles.length === 0) return [];

  const reunionesActuales = niveles
    .map((n) => n.reuniones.find((r) => r.numero === n.reunionActualNumero))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  // La línea base entra en la misma consulta: sin ella no se puede decir si una
  // competencia se movió, que es la pregunta que el instrumento existe para
  // responder. Un rojo que subió 20 puntos no es lo mismo que uno plano.
  const reunionesBase = niveles
    .map((n) => n.reuniones.find((r) => r.fase === "BASE"))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const reunionesDeInteres = [
    ...new Set([...reunionesActuales, ...reunionesBase].map((r) => r.id)),
  ];

  // Dos consultas para todos los niveles, en vez de dos por nivel.
  const [evaluaciones, acuerdos] = await Promise.all([
    prisma.evaluacion.findMany({
      where: { reunionId: { in: reunionesDeInteres } },
      select: { reunionId: true, competenciaId: true, docenteId: true, nivelLogro: true },
    }),
    prisma.acuerdo.groupBy({
      by: ["nivelId"],
      where: { nivelId: { in: niveles.map((n) => n.id) }, estado: { in: ["PENDIENTE", "EN_CURSO"] } },
      _count: { _all: true },
    }),
  ]);

  const acuerdosPorNivel = new Map(acuerdos.map((a) => [a.nivelId, a._count._all]));

  const porReunionCompetencia = new Map<string, ConteoLogro>();
  const docentesPorReunion = new Map<string, Set<string>>();
  for (const e of evaluaciones) {
    const k = `${e.reunionId}:${e.competenciaId}`;
    const c = porReunionCompetencia.get(k) ?? conteoVacio();
    c[e.nivelLogro] += 1;
    porReunionCompetencia.set(k, c);

    const set = docentesPorReunion.get(e.reunionId) ?? new Set<string>();
    set.add(e.docenteId);
    docentesPorReunion.set(e.reunionId, set);
  }

  const competenciasPorNivel = await prisma.competencia.findMany({
    where: { nivelId: { in: niveles.map((n) => n.id) } },
    select: { id: true, nivelId: true, codigo: true, nombre: true, orden: true },
    orderBy: { orden: "asc" },
  });
  type CompetenciaFila = (typeof competenciasPorNivel)[number];
  const competenciasDe = new Map<string, CompetenciaFila[]>();
  for (const c of competenciasPorNivel) {
    competenciasDe.set(c.nivelId, [...(competenciasDe.get(c.nivelId) ?? []), c]);
  }

  return niveles.map((n) => {
    const reunion = n.reuniones.find((r) => r.numero === n.reunionActualNumero) ?? null;
    const base = n.reuniones.find((r) => r.fase === "BASE") ?? null;
    const enLaBase = Boolean(reunion && base && reunion.id === base.id);

    const severidades: Record<Severidad, number> = {
      CRITICO: 0,
      EN_RIESGO: 0,
      CONSOLIDADO: 0,
      SIN_DATOS: 0,
    };

    const competenciasDelCiclo: CompetenciaDelCiclo[] = (competenciasDe.get(n.id) ?? []).map(
      (comp) => {
        const conteo = reunion
          ? (porReunionCompetencia.get(`${reunion.id}:${comp.id}`) ?? conteoVacio())
          : conteoVacio();
        const score = scoreDe(conteo);
        const severidad = clasificar(score);
        severidades[severidad] += 1;

        const scoreBase =
          base && !enLaBase
            ? scoreDe(porReunionCompetencia.get(`${base.id}:${comp.id}`) ?? conteoVacio())
            : null;

        return {
          id: comp.id,
          codigo: comp.codigo,
          nombre: comp.nombre,
          score,
          severidad,
          delta: score !== null && scoreBase !== null ? score - scoreBase : null,
        };
      }
    );

    // Lo urgente primero, y dentro de cada grupo el puntaje más bajo arriba —
    // el mismo orden que la pantalla de resultados, para que la casilla y el
    // detalle no cuenten historias distintas.
    competenciasDelCiclo.sort((a, b) => {
      const d = ORDEN_SEVERIDAD[a.severidad] - ORDEN_SEVERIDAD[b.severidad];
      return d !== 0 ? d : (a.score ?? 999) - (b.score ?? 999);
    });

    const totalMapeos = n.asignaturas.reduce((s, a) => s + a._count.mapeos, 0);
    const pasoConfiguracion =
      n._count.competencias === 0
        ? 1
        : n._count.asignaturas === 0
          ? 2
          : n._count.docentes === 0
            ? 3
            : totalMapeos === 0
              ? 4
              : 5;

    return {
      id: n.id,
      nombre: n.nombre,
      ciclo: n.cicloTipo,
      modalidad: n.modalidad,
      trimestre: n.trimestre,
      reunionNumero: n.reunionActualNumero,
      reunionFase: reunion?.fase ?? null,
      totalReuniones: n.reuniones.length,
      pasoConfiguracion,
      competencias: n._count.competencias,
      asignaturas: n._count.asignaturas,
      docentes: n._count.docentes,
      severidades,
      competenciasDelCiclo,
      docentesQueRespondieron: reunion ? (docentesPorReunion.get(reunion.id)?.size ?? 0) : 0,
      acuerdosAbiertos: acuerdosPorNivel.get(n.id) ?? 0,
      evaluado: reunion ? (docentesPorReunion.get(reunion.id)?.size ?? 0) > 0 : false,
    };
  });
}
