"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";

async function nivelPropio(nivelId: string, coordinadorId: string) {
  const nivel = await prisma.nivel.findFirst({
    where: { id: nivelId, coordinadorId },
    include: { reuniones: true },
  });
  if (!nivel) throw new Error("Nivel no encontrado.");
  return nivel;
}

const acuerdoSchema = z.object({
  texto: z.string().trim().min(1, "Escribe en qué consiste el acuerdo."),
  responsable: z.string().trim().optional(),
  plazo: z.string().trim().optional(),
  competenciaId: z.string().trim().optional(),
});

export type FormState = { error?: string } | undefined;

export async function crearAcuerdo(
  nivelId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireCoordinador();
  const nivel = await nivelPropio(nivelId, user.id);

  const reunion = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero);
  if (!reunion) return { error: "Este nivel no tiene una reunión en curso." };

  const parsed = acuerdoSchema.safeParse({
    texto: formData.get("texto"),
    responsable: formData.get("responsable"),
    plazo: formData.get("plazo"),
    competenciaId: formData.get("competenciaId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const competenciaId = parsed.data.competenciaId || null;
  // Solo se acepta una competencia que pertenezca a este nivel.
  if (competenciaId) {
    const existe = await prisma.competencia.findFirst({
      where: { id: competenciaId, nivelId },
      select: { id: true },
    });
    if (!existe) return { error: "Esa competencia no pertenece a este nivel." };
  }

  await prisma.acuerdo.create({
    data: {
      nivelId,
      reunionId: reunion.id,
      competenciaId,
      texto: parsed.data.texto,
      responsable: parsed.data.responsable || null,
      plazo: parsed.data.plazo || null,
    },
  });

  revalidatePath(`/niveles/${nivelId}/resultados`);
}

type Estado = "PENDIENTE" | "EN_CURSO" | "CUMPLIDO" | "DESCARTADO";

export async function cambiarEstadoAcuerdo(nivelId: string, acuerdoId: string, estado: Estado) {
  const user = await requireCoordinador();
  await nivelPropio(nivelId, user.id);
  // updateMany con el nivelId evita tocar un acuerdo de otro coordinador.
  await prisma.acuerdo.updateMany({ where: { id: acuerdoId, nivelId }, data: { estado } });
  revalidatePath(`/niveles/${nivelId}/resultados`);
}

export async function eliminarAcuerdo(nivelId: string, acuerdoId: string) {
  const user = await requireCoordinador();
  await nivelPropio(nivelId, user.id);
  await prisma.acuerdo.deleteMany({ where: { id: acuerdoId, nivelId } });
  revalidatePath(`/niveles/${nivelId}/resultados`);
}

/**
 * Acuerdos del nivel, separando los que nacieron en reuniones anteriores y
 * siguen abiertos: revisarlos es el primer punto de tabla de cada reunión.
 */
export async function acuerdosDelNivel(nivelId: string, reunionActualId: string | null) {
  const acuerdos = await prisma.acuerdo.findMany({
    where: { nivelId },
    orderBy: { createdAt: "desc" },
    include: { competencia: { select: { codigo: true, nombre: true } }, reunion: { select: { numero: true } } },
  });
  return {
    deEstaReunion: acuerdos.filter((a) => a.reunionId === reunionActualId),
    arrastrados: acuerdos.filter(
      (a) => a.reunionId !== reunionActualId && (a.estado === "PENDIENTE" || a.estado === "EN_CURSO")
    ),
  };
}
