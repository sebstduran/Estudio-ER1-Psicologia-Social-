"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { COMPETENCIAS_CICLO_INICIAL } from "../../../prisma/seed-data";

const REUNIONES_POR_MODALIDAD = {
  DIURNO: 4,
  VESPERTINO_TECH: 3,
} as const;

// Deriva la fase de cada reunión: R1 siempre es línea base, la última
// reunión de la modalidad es el cierre comparativo, el resto es seguimiento.
function faseDeReunion(numero: number, totalReuniones: number) {
  if (numero === 1) return "BASE" as const;
  if (numero === totalReuniones) return "CIERRE" as const;
  return "SEGUIMIENTO" as const;
}

const nivelSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa un nombre para el nivel."),
  cicloTipo: z.enum(["INICIAL", "INTERMEDIO", "FINAL"]),
  modalidad: z.enum(["DIURNO", "VESPERTINO_TECH"]),
  trimestre: z.string().trim().min(1, "Ingresa el trimestre."),
});

export type FormState = { error?: string } | undefined;

export async function crearNivel(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireCoordinador();

  const parsed = nivelSchema.safeParse({
    nombre: formData.get("nombre"),
    cicloTipo: formData.get("cicloTipo"),
    modalidad: formData.get("modalidad"),
    trimestre: formData.get("trimestre"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { nombre, cicloTipo, modalidad, trimestre } = parsed.data;
  const totalReuniones = REUNIONES_POR_MODALIDAD[modalidad];

  const nivel = await prisma.nivel.create({
    data: {
      nombre,
      cicloTipo,
      modalidad,
      trimestre,
      coordinadorId: user.id,
      reuniones: {
        create: Array.from({ length: totalReuniones }, (_, i) => ({
          numero: i + 1,
          fase: faseDeReunion(i + 1, totalReuniones),
        })),
      },
    },
  });

  // El Ciclo Inicial viene precargado con 6 competencias institucionales;
  // Intermedio y Final los define el coordinador desde cero.
  if (cicloTipo === "INICIAL") {
    const componentes = await prisma.componenteEPG.findMany();
    const componentePorOrden = new Map(componentes.map((c) => [c.orden, c.id]));

    for (const [i, comp] of COMPETENCIAS_CICLO_INICIAL.entries()) {
      const componenteEpgId = componentePorOrden.get(comp.componenteOrden);
      if (!componenteEpgId) continue;
      await prisma.competencia.create({
        data: {
          nivelId: nivel.id,
          codigo: comp.codigo,
          nombre: comp.nombre,
          descriptor: comp.descriptor,
          orden: i + 1,
          componenteEpgId,
          indicadores: {
            create: comp.indicadores.map((texto, j) => ({ texto, orden: j + 1 })),
          },
        },
      });
    }
  }

  revalidatePath("/niveles");
  redirect(`/niveles/${nivel.id}`);
}

export async function actualizarReunionActual(nivelId: string, numero: number) {
  const user = await requireCoordinador();
  await prisma.nivel.updateMany({
    where: { id: nivelId, coordinadorId: user.id },
    data: { reunionActualNumero: numero },
  });
  revalidatePath(`/niveles/${nivelId}`);
}
