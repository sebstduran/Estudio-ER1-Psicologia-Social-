"use server";

import { revalidatePath } from "next/cache";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { construirDiagnostico } from "@/lib/diagnostico";
import { construirPrompt, generarInforme, FaltaApiKey, MODELO, VERSION_PROMPT } from "@/lib/ai/informe";
import { VERSION_EVIDENCIA } from "@/lib/ai/evidencia-pedagogica";

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

  const incluirActa = _formData.get("incluirActa") === "si";
  if (!incluirActa) {
    return { error: "Confirma que quieres incluir el acta para combinarla con las respuestas docentes." };
  }
  const actas = await prisma.acta.findMany({
    where: { reunionId: diagnostico.reunionActual.id },
    select: { nombreArchivo: true, url: true },
    orderBy: { createdAt: "desc" },
  });
  if (actas.length === 0) {
    return { error: "Sube el acta de esta reunión antes de generar el análisis." };
  }

  const actasParaAnalisis = actas.map((a) => ({ nombre: a.nombreArchivo, url: a.url }));
  const huellaEntrada = createHash("sha256")
    .update(construirPrompt(diagnostico, actasParaAnalisis))
    .digest("hex");
  const registro = await prisma.informe.create({
    data: {
      nivelId,
      reunionId: diagnostico.reunionActual.id,
      modelo: MODELO,
      versionPrompt: VERSION_PROMPT,
      versionEvidencia: VERSION_EVIDENCIA,
      huellaEntrada,
    },
  });

  try {
    const contenido = await generarInforme(
      diagnostico,
      actasParaAnalisis
    );
    await prisma.informe.update({
      where: { id: registro.id },
      data: { estado: "LISTO", contenido },
    });
  } catch (e) {
    const mensaje =
      e instanceof FaltaApiKey
        ? "Falta configurar GEMINI_API_KEY en las variables de entorno."
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
