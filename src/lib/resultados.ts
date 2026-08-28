import { prisma } from "@/lib/prisma";

export type ConteoLogro = { LOGRADO: number; EN_PROCESO: number; INCIPIENTE: number };

function conteoVacio(): ConteoLogro {
  return { LOGRADO: 0, EN_PROCESO: 0, INCIPIENTE: 0 };
}

// Puntaje 0-100: Logrado pesa 1, En proceso pesa 0.5, Incipiente pesa 0.
// Es la métrica que permite comparar línea base vs. cierre en una sola cifra.
export function scoreDe(counts: ConteoLogro): number | null {
  const total = counts.LOGRADO + counts.EN_PROCESO + counts.INCIPIENTE;
  if (total === 0) return null;
  return ((counts.LOGRADO * 1 + counts.EN_PROCESO * 0.5) / total) * 100;
}

// Trae todas las evaluaciones del nivel de una sola pasada y las agrega en
// memoria por reunión×competencia y por reunión×indicador, para no repetir
// consultas por cada tarjeta de la vista de resultados.
export async function obtenerConteosPorReunion(nivelId: string) {
  const evaluaciones = await prisma.evaluacion.findMany({
    where: { reunion: { nivelId } },
    select: { reunionId: true, competenciaId: true, indicadorId: true, nivelLogro: true },
  });

  const porCompetencia = new Map<string, Map<string, ConteoLogro>>();
  const porIndicador = new Map<string, Map<string, ConteoLogro>>();

  for (const e of evaluaciones) {
    const compMap = porCompetencia.get(e.reunionId) ?? new Map<string, ConteoLogro>();
    const compCounts = compMap.get(e.competenciaId) ?? conteoVacio();
    compCounts[e.nivelLogro] += 1;
    compMap.set(e.competenciaId, compCounts);
    porCompetencia.set(e.reunionId, compMap);

    const indMap = porIndicador.get(e.reunionId) ?? new Map<string, ConteoLogro>();
    const indCounts = indMap.get(e.indicadorId) ?? conteoVacio();
    indCounts[e.nivelLogro] += 1;
    indMap.set(e.indicadorId, indCounts);
    porIndicador.set(e.reunionId, indMap);
  }

  return { porCompetencia, porIndicador };
}
