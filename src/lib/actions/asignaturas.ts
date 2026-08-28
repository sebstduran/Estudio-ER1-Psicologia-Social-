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

const nombreSchema = z.string().trim().min(1, "Ingresa un nombre.");

export type FormState = { error?: string } | undefined;

export async function crearAsignatura(
  nivelId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireCoordinador();
  await nivelDelCoordinador(nivelId, user.id);

  const parsed = nombreSchema.safeParse(formData.get("nombre"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  await prisma.asignatura.create({ data: { nivelId, nombre: parsed.data } });
  revalidatePath(`/niveles/${nivelId}`);
}

export async function eliminarAsignatura(nivelId: string, asignaturaId: string) {
  const user = await requireCoordinador();
  await nivelDelCoordinador(nivelId, user.id);
  await prisma.asignatura.delete({ where: { id: asignaturaId } });
  revalidatePath(`/niveles/${nivelId}`);
}

// Cicla el mapeo asignatura↔competencia: sin relación → directa → transversal → sin relación.
export async function ciclarMapeo(
  nivelId: string,
  asignaturaId: string,
  competenciaId: string
) {
  const user = await requireCoordinador();
  await nivelDelCoordinador(nivelId, user.id);

  const existente = await prisma.mapeoAsignaturaCompetencia.findUnique({
    where: { asignaturaId_competenciaId: { asignaturaId, competenciaId } },
  });

  if (!existente) {
    await prisma.mapeoAsignaturaCompetencia.create({
      data: { asignaturaId, competenciaId, tipo: "DIRECTA" },
    });
  } else if (existente.tipo === "DIRECTA") {
    await prisma.mapeoAsignaturaCompetencia.update({
      where: { id: existente.id },
      data: { tipo: "TRANSVERSAL" },
    });
  } else {
    await prisma.mapeoAsignaturaCompetencia.delete({ where: { id: existente.id } });
  }

  revalidatePath(`/niveles/${nivelId}`);
}
