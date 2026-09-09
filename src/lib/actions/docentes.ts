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

const docenteSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa el nombre del docente."),
  asignaturaIds: z.array(z.string()).min(1, "Selecciona al menos una asignatura."),
});

export type FormState = { error?: string } | undefined;

export async function crearDocente(
  nivelId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireCoordinador();
  await nivelDelCoordinador(nivelId, user.id);

  const parsed = docenteSchema.safeParse({
    nombre: formData.get("nombre"),
    asignaturaIds: formData.getAll("asignaturaIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const existente = await prisma.docente.findFirst({
    where: { nivelId, nombre: { equals: parsed.data.nombre, mode: "insensitive" } },
  });
  if (existente) {
    return { error: "Ese docente ya está agregado en este nivel." };
  }

  await prisma.docente.create({
    data: {
      nivelId,
      nombre: parsed.data.nombre,
      asignaturas: {
        create: parsed.data.asignaturaIds.map((asignaturaId) => ({ asignaturaId })),
      },
    },
  });

  revalidatePath(`/niveles/${nivelId}`);
}

export async function eliminarDocente(nivelId: string, docenteId: string) {
  const user = await requireCoordinador();
  await nivelDelCoordinador(nivelId, user.id);
  await prisma.docente.delete({ where: { id: docenteId } });
  revalidatePath(`/niveles/${nivelId}`);
}
