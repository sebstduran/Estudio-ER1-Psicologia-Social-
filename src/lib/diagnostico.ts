import { prisma } from "@/lib/prisma";

export type ConteoLogro = {
  LOGRADO: number;
  EN_PROCESO: number;
  INCIPIENTE: number;
  NO_TRABAJADO: number;
};
export type Severidad = "CRITICO" | "EN_RIESGO" | "CONSOLIDADO" | "SIN_DATOS";

function conteoVacio(): ConteoLogro {
  return { LOGRADO: 0, EN_PROCESO: 0, INCIPIENTE: 0, NO_TRABAJADO: 0 };
}

/**
 * Denominador del puntaje: SOLO los juicios de logro. "Aún no lo trabajo" no es
 * un juicio —es la ausencia de uno— así que no entra ni arriba ni abajo. Si
 * entrara, una asignatura que va en la semana 4 hundiría una competencia por
 * contenido que todavía no le tocaba, y el diagnóstico dejaría de ser creíble.
 */
export function totalDe(c: ConteoLogro) {
  return c.LOGRADO + c.EN_PROCESO + c.INCIPIENTE;
}

/** Cuántas personas respondieron, hayan emitido juicio o no. */
export function totalRespuestas(c: ConteoLogro) {
  return totalDe(c) + c.NO_TRABAJADO;
}

// Puntaje 0-100: Logrado pesa 1, En proceso 0.5, Incipiente 0.
export function scoreDe(c: ConteoLogro): number | null {
  const total = totalDe(c);
  if (total === 0) return null;
  return ((c.LOGRADO + c.EN_PROCESO * 0.5) / total) * 100;
}

// Los cortes traducen el puntaje a una decisión de gestión:
//   < 40  predominan los incipientes -> intervención inmediata
//   < 70  predomina "en proceso" -> hay avance pero no alcanza el estándar
//   >= 70 la mayoría alcanzó el logro -> sostener, no intervenir
export function clasificar(score: number | null): Severidad {
  if (score === null) return "SIN_DATOS";
  if (score < 40) return "CRITICO";
  if (score < 70) return "EN_RIESGO";
  return "CONSOLIDADO";
}

/**
 * Hay disenso cuando la MISMA evidencia fue calificada como lograda por alguien
 * y como incipiente por otra persona. No es ruido estadístico: significa que el
 * equipo no comparte el criterio de logro, que es justamente lo que una
 * comunidad académica existe para construir. Se distingue del bajo desempeño:
 * una competencia puede estar "en proceso" con criterio compartido, o "lograda"
 * con criterios incompatibles — y son problemas distintos.
 */
export function hayDisenso(c: ConteoLogro): boolean {
  return c.LOGRADO > 0 && c.INCIPIENTE > 0;
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
  disenso: boolean;
  comentarios: { docente: string; asignatura: string; nivelLogro: string; texto: string }[];
};

export type AsignaturaDiagnostico = {
  id: string;
  nombre: string;
  tipo: "DIRECTA" | "TRANSVERSAL";
  conteo: ConteoLogro;
  score: number | null;
};

export type PuntoTrayectoria = { numero: number; fase: string; score: number | null };

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
  trayectoria: PuntoTrayectoria[];
  indicadores: IndicadorDiagnostico[];
  indicadorMasDebil: IndicadorDiagnostico | null;
  indicadoresConDisenso: number;
  asignaturas: AsignaturaDiagnostico[];
  docentesQueEvaluaron: number;
};

export type ParticipacionDocente = {
  id: string;
  nombre: string;
  email: string;
  asignaturas: string[];
  esperadas: number;
  respondidas: number;
  completo: boolean;
};

/** Lo que el docente escribió fuera de la rúbrica, en la reunión en curso. */
export type PercepcionDocente = {
  docente: string;
  asignatura: string;
  dificultad: string | null;
  sugerencia: string | null;
};

export type Diagnostico = {
  nivel: { id: string; nombre: string; ciclo: string; modalidad: string; trimestre: string };
  reunionActual: { id: string; numero: number; fase: string } | null;
  reunionBase: { id: string; numero: number } | null;
  competencias: CompetenciaDiagnostico[];
  participacion: ParticipacionDocente[];
  percepciones: PercepcionDocente[];
  totalVotos: number;
  resumen: {
    criticas: number;
    enRiesgo: number;
    consolidadas: number;
    sinDatos: number;
    conDisenso: number;
  };
};

/**
 * Lectura completa de un nivel para la reunión en curso. Es la única fuente de
 * verdad: alimenta la pantalla de resultados y el prompt del modelo, de modo
 * que ambos no puedan contar historias distintas.
 */
export async function construirDiagnostico(
  nivelId: string,
  coordinadorId: string
): Promise<Diagnostico | null> {
  const nivel = await prisma.nivel.findFirst({
    where: { id: nivelId, coordinadorId },
    include: {
      reuniones: { orderBy: { numero: "asc" } },
      docentes: {
        orderBy: { nombre: "asc" },
        include: { asignaturas: { include: { asignatura: true } } },
      },
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

  // Una sola consulta para todo el nivel: de aquí salen la reunión en curso,
  // la línea base y la trayectoria completa.
  const evaluaciones = await prisma.evaluacion.findMany({
    where: { reunion: { nivelId } },
    include: { docente: true, asignatura: true },
  });

  const deLaReunion = reunionActual ? evaluaciones.filter((e) => e.reunionId === reunionActual.id) : [];

  // Las percepciones de la reunión en curso: solo las que traen texto, para no
  // llenar la pantalla del coordinador con filas vacías.
  const percepciones: PercepcionDocente[] = reunionActual
    ? (
        await prisma.percepcion.findMany({
          where: {
            reunionId: reunionActual.id,
            OR: [{ dificultad: { not: null } }, { sugerencia: { not: null } }],
          },
          include: { docente: true, asignatura: true },
          orderBy: { createdAt: "asc" },
        })
      ).map((p) => ({
        docente: p.docente.nombre,
        asignatura: p.asignatura.nombre,
        dificultad: p.dificultad,
        sugerencia: p.sugerencia,
      }))
    : [];

  // Agregaciones de la reunión en curso.
  const porCompetencia = new Map<string, ConteoLogro>();
  const porIndicador = new Map<string, ConteoLogro>();
  const porCompAsig = new Map<string, ConteoLogro>();
  const comentariosPorIndicador = new Map<string, IndicadorDiagnostico["comentarios"]>();
  const docentesPorCompetencia = new Map<string, Set<string>>();
  const respondidasPorDocente = new Map<string, number>();

  for (const e of deLaReunion) {
    const c = porCompetencia.get(e.competenciaId) ?? conteoVacio();
    c[e.nivelLogro] += 1;
    porCompetencia.set(e.competenciaId, c);

    const i = porIndicador.get(e.indicadorId) ?? conteoVacio();
    i[e.nivelLogro] += 1;
    porIndicador.set(e.indicadorId, i);

    const ca = porCompAsig.get(`${e.competenciaId}:${e.asignaturaId}`) ?? conteoVacio();
    ca[e.nivelLogro] += 1;
    porCompAsig.set(`${e.competenciaId}:${e.asignaturaId}`, ca);

    const set = docentesPorCompetencia.get(e.competenciaId) ?? new Set<string>();
    set.add(e.docenteId);
    docentesPorCompetencia.set(e.competenciaId, set);

    respondidasPorDocente.set(e.docenteId, (respondidasPorDocente.get(e.docenteId) ?? 0) + 1);

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

  // Trayectoria: puntaje de cada competencia en cada reunión.
  const porReunionCompetencia = new Map<string, ConteoLogro>();
  for (const e of evaluaciones) {
    const k = `${e.reunionId}:${e.competenciaId}`;
    const c = porReunionCompetencia.get(k) ?? conteoVacio();
    c[e.nivelLogro] += 1;
    porReunionCompetencia.set(k, c);
  }

  // Cuántos indicadores debería responder cada docente: los de las competencias
  // que tributan las asignaturas que dicta.
  const indicadoresPorAsignatura = new Map<string, number>();
  for (const comp of nivel.competencias) {
    for (const m of comp.mapeos) {
      indicadoresPorAsignatura.set(
        m.asignaturaId,
        (indicadoresPorAsignatura.get(m.asignaturaId) ?? 0) + comp.indicadores.length
      );
    }
  }

  const participacion: ParticipacionDocente[] = nivel.docentes.map((d) => {
    const esperadas = d.asignaturas.reduce(
      (n, da) => n + (indicadoresPorAsignatura.get(da.asignaturaId) ?? 0),
      0
    );
    const respondidas = respondidasPorDocente.get(d.id) ?? 0;
    return {
      id: d.id,
      nombre: d.nombre,
      email: d.email,
      asignaturas: d.asignaturas.map((da) => da.asignatura.nombre),
      esperadas,
      respondidas,
      completo: esperadas > 0 && respondidas >= esperadas,
    };
  });

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
        disenso: hayDisenso(ic),
        comentarios: comentariosPorIndicador.get(ind.id) ?? [],
      };
    });

    const conDatos = indicadores.filter((i) => i.score !== null);
    const indicadorMasDebil =
      conDatos.length > 0 ? conDatos.reduce((a, b) => (a.score! <= b.score! ? a : b)) : null;

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

    const trayectoria: PuntoTrayectoria[] = nivel.reuniones.map((r) => ({
      numero: r.numero,
      fase: r.fase,
      score: scoreDe(porReunionCompetencia.get(`${r.id}:${comp.id}`) ?? conteoVacio()),
    }));

    const scoreBase = reunionBase
      ? scoreDe(porReunionCompetencia.get(`${reunionBase.id}:${comp.id}`) ?? conteoVacio())
      : null;
    const esLaBase = reunionActual?.id === reunionBase?.id;

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
      delta: !esLaBase && score !== null && scoreBase !== null ? score - scoreBase : null,
      trayectoria,
      indicadores,
      indicadorMasDebil,
      indicadoresConDisenso: indicadores.filter((i) => i.disenso).length,
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
    participacion,
    percepciones,
    totalVotos: deLaReunion.length,
    resumen: {
      criticas: competencias.filter((c) => c.severidad === "CRITICO").length,
      enRiesgo: competencias.filter((c) => c.severidad === "EN_RIESGO").length,
      consolidadas: competencias.filter((c) => c.severidad === "CONSOLIDADO").length,
      sinDatos: competencias.filter((c) => c.severidad === "SIN_DATOS").length,
      conDisenso: competencias.filter((c) => c.indicadoresConDisenso > 0).length,
    },
  };
}
