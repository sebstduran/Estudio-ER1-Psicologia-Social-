"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { construirDiagnostico } from "@/lib/diagnostico";
import { generarInforme, FaltaApiKey, MODELO } from "@/lib/ai/informe";

export type EstadoGeneracion = { error?: string } | undefined;

export async function generarInformeDelNivel(
  nivelId: string,
  _prev: EstadoGeneracion,
  _formData: FormData
): Promise<EstadoGeneracion> {
  const user = await requireCoordinador();

  const diagnostico = await construirDiagnostico(nivelId, user.id);
  if (!diagnostico) return { error: "No encontramos ese nivel." };
  if (!diagnostico.reunionActual) {
    return { error: "Este nivel no tiene una reunión en curso." };
  }
  if (diagnostico.totalVotos === 0) {
    return {
      error:
        "Todavía no hay evaluaciones en esta reunión. Comparte el enlace con los docentes y vuelve cuando hayan respondido.",
    };
  }

  const registro = await prisma.informe.create({
    data: { nivelId, reunionId: diagnostico.reunionActual.id, modelo: MODELO },
  });

  try {
    const contenido = await generarInforme(diagnostico);
    await prisma.informe.update({
      where: { id: registro.id },
      data: { estado: "LISTO", contenido },
    });
  } catch (e) {
    const mensaje =
      e instanceof FaltaApiKey
        ? "Falta configurar la clave de la API en las variables de entorno (ANTHROPIC_API_KEY)."
        : e instanceof Error
          ? e.message
          : "Error inesperado al generar el informe.";
    await prisma.informe.update({
      where: { id: registro.id },
      data: { estado: "ERROR", error: mensaje },
    });
    revalidatePath(`/niveles/${nivelId}/resultados`);
    return { error: mensaje };
  }

  revalidatePath(`/niveles/${nivelId}/resultados`);
}

/** Último informe generado para la reunión en curso del nivel. */
export async function informeVigente(nivelId: string, reunionId: string) {
  return prisma.informe.findFirst({
    where: { nivelId, reunionId },
    orderBy: { createdAt: "desc" },
  });
}
