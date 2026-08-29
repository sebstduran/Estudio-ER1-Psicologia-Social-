import { prisma } from "@/lib/prisma";

export type ConteoLogro = { LOGRADO: number; EN_PROCESO: number; INCIPIENTE: number };
export type Severidad = "CRITICO" | "EN_RIESGO" | "CONSOLIDADO" | "SIN_DATOS";

function conteoVacio(): ConteoLogro {
  return { LOGRADO: 0, EN_PROCESO: 0, INCIPIENTE: 0 };
}

export function totalDe(c: ConteoLogro) {
  return c.LOGRADO + c.EN_PROCESO + c.INCIPIENTE;
}

// Puntaje 0-100: Logrado pesa 1, En proceso 0.5, Incipiente 0.
// Una sola cifra comparable entre reuniones, competencias e indicadores.
export function scoreDe(c: ConteoLogro): number | null {
  const total = totalDe(c);
  if (total === 0) return null;
  return ((c.LOGRADO + c.EN_PROCESO * 0.5) / total) * 100;
}

// Los cortes traducen el puntaje a una decisión de gestión, que es lo que el
// coordinador necesita para priorizar:
//   < 40  la mayoría de los votos son incipientes -> intervención inmediata
//   < 70  predomina "en proceso" -> hay avance pero no alcanza el estándar
//   >= 70 la mayoría alcanzó el logro -> sostener, no intervenir
export function clasificar(score: number | null): Severidad {
  if (score === null) return "SIN_DATOS";
  if (score < 40) return "CRITICO";
  if (score < 70) return "EN_RIESGO";
  return "CONSOLIDADO";
}

export const ORDEN_SEVERIDAD: Record<Severidad, number> = {
  CRITICO: 0,
  EN_RIESGO: 1,
  CONSOLIDADO: 2,
  SIN_DATOS: 3,
};

export type IndicadorDiagnostico = {
  id: string;
  texto: string;
  conteo: ConteoLogro;
  score: number | null;
  severidad: Severidad;
  comentarios: { docente: string; asignatura: string; nivelLogro: string; texto: string }[];
};

export type AsignaturaDiagnostico = {
  id: string;
  nombre: string;
  tipo: "DIRECTA" | "TRANSVERSAL";
  conteo: ConteoLogro;
  score: number | null;
};

export type CompetenciaDiagnostico = {
  id: string;
  codigo: string;
  nombre: string;
  descriptor: string;
  componenteEpg: string;
  conteo: ConteoLogro;
  score: number | null;
  severidad: Severidad;
  scoreBase: number | null;
  delta: number | null;
  indicadores: IndicadorDiagnostico[];
  indicadorMasDebil: IndicadorDiagnostico | null;
  asignaturas: AsignaturaDiagnostico[];
  docentesQueEvaluaron: number;
};

export type Diagnostico = {
  nivel: {
    id: string;
    nombre: string;
    ciclo: string;
    modalidad: string;
    trimestre: string;
  };
  reunionActual: { id: string; numero: number; fase: string } | null;
  reunionBase: { id: string; numero: number } | null;
  competencias: CompetenciaDiagnostico[];
  totalVotos: number;
  resumen: { criticas: number; enRiesgo: number; consolidadas: number; sinDatos: number };
};

/**
 * Arma la lectura completa de un nivel para la reunión en curso: puntaje y
 * severidad por competencia y por indicador, comentarios de los docentes,
 * apertura por asignatura y delta contra la línea base.
 *
 * Es la única fuente de verdad: la alimenta tanto la pantalla de resultados
 * como el prompt que se le envía al modelo, de modo que ambos no puedan
 * contar historias distintas.
 */
export async function construirDiagnostico(
  nivelId: string,
  coordinadorId: string
): Promise<Diagnostico | null> {
  const nivel = await prisma.nivel.findFirst({
    where: { id: nivelId, coordinadorId },
    include: {
      reuniones: { orderBy: { numero: "asc" } },
      competencias: {
        orderBy: { orden: "asc" },
        include: {
          componenteEpg: true,
          indicadores: { orderBy: { orden: "asc" } },
          mapeos: { include: { asignatura: true } },
        },
      },
    },
  });
  if (!nivel) return null;

  const reunionActual = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero) ?? null;
  const reunionBase = nivel.reuniones.find((r) => r.fase === "BASE") ?? null;

  const evaluaciones = reunionActual
    ? await prisma.evaluacion.findMany({
        where: { reunionId: reunionActual.id },
        include: { docente: true, asignatura: true },
      })
    : [];

  const evaluacionesBase =
    reunionBase && reunionBase.id !== reunionActual?.id
      ? await prisma.evaluacion.findMany({
          where: { reunionId: reunionBase.id },
          select: { competenciaId: true, nivelLogro: true },
        })
      : [];

  // Agregaciones en una sola pasada.
  const porCompetencia = new Map<string, ConteoLogro>();
  const porIndicador = new Map<string, ConteoLogro>();
  const porCompAsig = new Map<string, ConteoLogro>();
  const comentariosPorIndicador = new Map<string, IndicadorDiagnostico["comentarios"]>();
  const docentesPorCompetencia = new Map<string, Set<string>>();

  for (const e of evaluaciones) {
    const c = porCompetencia.get(e.competenciaId) ?? conteoVacio();
    c[e.nivelLogro] += 1;
    porCompetencia.set(e.competenciaId, c);

    const i = porIndicador.get(e.indicadorId) ?? conteoVacio();
    i[e.nivelLogro] += 1;
    porIndicador.set(e.indicadorId, i);

    const claveCA = `${e.competenciaId}:${e.asignaturaId}`;
    const ca = porCompAsig.get(claveCA) ?? conteoVacio();
    ca[e.nivelLogro] += 1;
    porCompAsig.set(claveCA, ca);

    const set = docentesPorCompetencia.get(e.competenciaId) ?? new Set<string>();
    set.add(e.docenteId);
    docentesPorCompetencia.set(e.competenciaId, set);

    if (e.comentario) {
      const lista = comentariosPorIndicador.get(e.indicadorId) ?? [];
      lista.push({
        docente: e.docente.nombre,
        asignatura: e.asignatura.nombre,
        nivelLogro: e.nivelLogro,
        texto: e.comentario,
      });
      comentariosPorIndicador.set(e.indicadorId, lista);
    }
  }

  const baseporCompetencia = new Map<string, ConteoLogro>();
  for (const e of evaluacionesBase) {
    const c = baseporCompetencia.get(e.competenciaId) ?? conteoVacio();
    c[e.nivelLogro] += 1;
    baseporCompetencia.set(e.competenciaId, c);
  }

  const competencias: CompetenciaDiagnostico[] = nivel.competencias.map((comp) => {
    const conteo = porCompetencia.get(comp.id) ?? conteoVacio();
    const score = scoreDe(conteo);

    const indicadores: IndicadorDiagnostico[] = comp.indicadores.map((ind) => {
      const ic = porIndicador.get(ind.id) ?? conteoVacio();
      const iscore = scoreDe(ic);
      return {
        id: ind.id,
        texto: ind.texto,
        conteo: ic,
        score: iscore,
        severidad: clasificar(iscore),
        comentarios: comentariosPorIndicador.get(ind.id) ?? [],
      };
    });

    const conDatos = indicadores.filter((i) => i.score !== null);
    const indicadorMasDebil =
      conDatos.length > 0
        ? conDatos.reduce((a, b) => (a.score! <= b.score! ? a : b))
        : null;

    const asignaturas: AsignaturaDiagnostico[] = comp.mapeos.map((m) => {
      const ac = porCompAsig.get(`${comp.id}:${m.asignaturaId}`) ?? conteoVacio();
      return {
        id: m.asignaturaId,
        nombre: m.asignatura.nombre,
        tipo: m.tipo,
        conteo: ac,
        score: scoreDe(ac),
      };
    });

    const baseConteo = baseporCompetencia.get(comp.id);
    const scoreBase = baseConteo ? scoreDe(baseConteo) : null;

    return {
      id: comp.id,
      codigo: comp.codigo,
      nombre: comp.nombre,
      descriptor: comp.descriptor,
      componenteEpg: comp.componenteEpg.nombre,
      conteo,
      score,
      severidad: clasificar(score),
      scoreBase,
      delta: score !== null && scoreBase !== null ? score - scoreBase : null,
      indicadores,
      indicadorMasDebil,
      asignaturas,
      docentesQueEvaluaron: docentesPorCompetencia.get(comp.id)?.size ?? 0,
    };
  });

  // Lo urgente primero; dentro de cada grupo, el puntaje más bajo arriba.
  competencias.sort((a, b) => {
    const d = ORDEN_SEVERIDAD[a.severidad] - ORDEN_SEVERIDAD[b.severidad];
    if (d !== 0) return d;
    return (a.score ?? 999) - (b.score ?? 999);
  });

  return {
    nivel: {
      id: nivel.id,
      nombre: nivel.nombre,
      ciclo: nivel.cicloTipo,
      modalidad: nivel.modalidad,
      trimestre: nivel.trimestre,
    },
    reunionActual: reunionActual
      ? { id: reunionActual.id, numero: reunionActual.numero, fase: reunionActual.fase }
      : null,
    reunionBase: reunionBase ? { id: reunionBase.id, numero: reunionBase.numero } : null,
    competencias,
    totalVotos: evaluaciones.length,
    resumen: {
      criticas: competencias.filter((c) => c.severidad === "CRITICO").length,
      enRiesgo: competencias.filter((c) => c.severidad === "EN_RIESGO").length,
      consolidadas: competencias.filter((c) => c.severidad === "CONSOLIDADO").length,
      sinDatos: competencias.filter((c) => c.severidad === "SIN_DATOS").length,
    },
  };
}
