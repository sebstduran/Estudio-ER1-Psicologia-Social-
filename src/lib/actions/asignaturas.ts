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

/**
 * Fija de una vez las competencias que trabaja una asignatura.
 *
 * Sustituye a recorrer una cuadrícula de competencias × asignaturas haciendo
 * clic en cada celda hasta que aparece el valor buscado. Con seis competencias
 * y cinco asignaturas eran treinta celdas de tres estados, y nada del
 * instrumento funcionaba hasta terminarla: era el peor momento de la
 * aplicación y además obligatorio.
 *
 * Ahora se declara asignatura por asignatura y se lee como una frase: «esta
 * asignatura trabaja 1.1 de forma directa y 4.1 de forma transversal».
 */
export async function guardarCompetenciasDeAsignatura(
  nivelId: string,
  asignaturaId: string,
  formData: FormData
) {
  const user = await requireCoordinador();
  await nivelDelCoordinador(nivelId, user.id);

  const asignatura = await prisma.asignatura.findFirst({
    where: { id: asignaturaId, nivelId },
    select: { id: true },
  });
  if (!asignatura) return;

  const competencias = await prisma.competencia.findMany({
    where: { nivelId },
    select: { id: true },
  });

  // Cada competencia llega como "tipo:<id>" con valor NADA | DIRECTA | TRANSVERSAL.
  const deseado = new Map<string, "DIRECTA" | "TRANSVERSAL">();
  for (const c of competencias) {
    const valor = formData.get(`tipo:${c.id}`);
    if (valor === "DIRECTA" || valor === "TRANSVERSAL") deseado.set(c.id, valor);
  }

  await prisma.$transaction([
    prisma.mapeoAsignaturaCompetencia.deleteMany({
      where: { asignaturaId, competenciaId: { notIn: [...deseado.keys()] } },
    }),
    ...[...deseado.entries()].map(([competenciaId, tipo]) =>
      prisma.mapeoAsignaturaCompetencia.upsert({
        where: { asignaturaId_competenciaId: { asignaturaId, competenciaId } },
        update: { tipo },
        create: { asignaturaId, competenciaId, tipo },
      })
    ),
  ]);

  revalidatePath(`/niveles/${nivelId}`);
}
