"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";

async function nivelDelCoordinador(nivelId: string, coordinadorId: string) {
  const nivel = await prisma.nivel.findFirst({
    where: { id: nivelId, coordinadorId },
  });
  if (!nivel) throw new Error("Nivel no encontrado.");
  return nivel;
}

const competenciaSchema = z.object({
  codigo: z.string().trim().min(1, "Ingresa un código (ej. 2.1)."),
  nombre: z.string().trim().min(1, "Ingresa un nombre."),
  descriptor: z.string().trim().min(1, "Ingresa el descriptor de la competencia."),
  componenteEpgId: z.string().min(1, "Selecciona un componente EPG."),
  indicador1: z.string().trim().min(1, "Ingresa el indicador 1."),
  indicador2: z.string().trim().min(1, "Ingresa el indicador 2."),
  indicador3: z.string().trim().min(1, "Ingresa el indicador 3."),
});

export type FormState = { error?: string } | undefined;

export async function crearCompetencia(
  nivelId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireCoordinador();
  await nivelDelCoordinador(nivelId, user.id);

  const parsed = competenciaSchema.safeParse({
    codigo: formData.get("codigo"),
    nombre: formData.get("nombre"),
    descriptor: formData.get("descriptor"),
    componenteEpgId: formData.get("componenteEpgId"),
    indicador1: formData.get("indicador1"),
    indicador2: formData.get("indicador2"),
    indicador3: formData.get("indicador3"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const existente = await prisma.competencia.findUnique({
    where: { nivelId_codigo: { nivelId, codigo: parsed.data.codigo } },
  });
  if (existente) {
    return { error: `Ya existe una competencia con código ${parsed.data.codigo}.` };
  }

  const count = await prisma.competencia.count({ where: { nivelId } });

  await prisma.competencia.create({
    data: {
      nivelId,
      codigo: parsed.data.codigo,
      nombre: parsed.data.nombre,
      descriptor: parsed.data.descriptor,
      componenteEpgId: parsed.data.componenteEpgId,
      orden: count + 1,
      indicadores: {
        create: [
          { texto: parsed.data.indicador1, orden: 1 },
          { texto: parsed.data.indicador2, orden: 2 },
          { texto: parsed.data.indicador3, orden: 3 },
        ],
      },
    },
  });

  revalidatePath(`/niveles/${nivelId}`);
}

export async function eliminarCompetencia(nivelId: string, competenciaId: string) {
  const user = await requireCoordinador();
  await nivelDelCoordinador(nivelId, user.id);
  await prisma.competencia.delete({ where: { id: competenciaId } });
  revalidatePath(`/niveles/${nivelId}`);
}
