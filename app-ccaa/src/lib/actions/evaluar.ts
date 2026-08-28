"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const identificarDocenteSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresa tu nombre."),
  email: z.string().trim().toLowerCase().email("Correo inválido."),
});

// El docente no tiene cuenta: se identifica por correo dentro del nivel.
// Si es la primera vez que participa, se crea su registro en el acto.
// Flujo 100% server-rendered vía redirects con query params (sin JS).
export async function identificarDocente(nivelId: string, formData: FormData) {
  const parsed = identificarDocenteSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect(`/evaluar/${nivelId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos inválidos.")}`);
  }

  const { nombre, email } = parsed.data;

  const nivel = await prisma.nivel.findUnique({ where: { id: nivelId } });
  if (!nivel) redirect(`/evaluar/${nivelId}?error=Nivel no encontrado.`);

  const docente = await prisma.docente.upsert({
    where: { nivelId_email: { nivelId, email } },
    update: { nombre },
    create: { nivelId, nombre, email },
  });

  redirect(`/evaluar/${nivelId}?docente=${docente.id}`);
}

const NIVEL_LOGRO = ["LOGRADO", "EN_PROCESO", "INCIPIENTE"] as const;

export async function guardarEvaluacion(
  nivelId: string,
  docenteId: string,
  asignaturaId: string,
  formData: FormData
) {
  const nivel = await prisma.nivel.findUnique({
    where: { id: nivelId },
    include: { reuniones: true },
  });
  if (!nivel) redirect(`/evaluar/${nivelId}?docente=${docenteId}&error=Nivel no encontrado.`);

  const reunion = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero);
  if (!reunion) {
    redirect(`/evaluar/${nivelId}?docente=${docenteId}&error=No hay una reunión activa.`);
  }

  const docente = await prisma.docente.findFirst({ where: { id: docenteId, nivelId } });
  if (!docente) redirect(`/evaluar/${nivelId}?error=Docente no válido para este nivel.`);

  const indicadorIds = Array.from(
    new Set(
      Array.from(formData.keys())
        .filter((k) => k.startsWith("logro:"))
        .map((k) => k.slice("logro:".length))
    )
  );

  if (indicadorIds.length === 0) {
    redirect(`/evaluar/${nivelId}?docente=${docenteId}&asignatura=${asignaturaId}&error=No hay indicadores para evaluar.`);
  }

  const indicadores = await prisma.indicador.findMany({
    where: { id: { in: indicadorIds } },
    select: { id: true, competenciaId: true },
  });
  const competenciaPorIndicador = new Map(indicadores.map((i) => [i.id, i.competenciaId]));

  const operaciones = [];
  for (const indicadorId of indicadorIds) {
    const logroRaw = formData.get(`logro:${indicadorId}`);
    const competenciaId = competenciaPorIndicador.get(indicadorId);
    if (!competenciaId) continue;
    if (typeof logroRaw !== "string" || !NIVEL_LOGRO.includes(logroRaw as never)) continue;

    const comentarioRaw = formData.get(`comentario:${indicadorId}`);
    const comentario = typeof comentarioRaw === "string" && comentarioRaw.trim() ? comentarioRaw.trim() : null;

    operaciones.push(
      prisma.evaluacion.upsert({
        where: {
          reunionId_docenteId_asignaturaId_indicadorId: {
            reunionId: reunion.id,
            docenteId,
            asignaturaId,
            indicadorId,
          },
        },
        update: { nivelLogro: logroRaw as (typeof NIVEL_LOGRO)[number], comentario },
        create: {
          reunionId: reunion.id,
          docenteId,
          asignaturaId,
          indicadorId,
          competenciaId,
          nivelLogro: logroRaw as (typeof NIVEL_LOGRO)[number],
          comentario,
        },
      })
    );
  }

  if (operaciones.length === 0) {
    redirect(`/evaluar/${nivelId}?docente=${docenteId}&asignatura=${asignaturaId}&error=Completa la rúbrica de al menos un indicador.`);
  }

  await prisma.$transaction(operaciones);
  revalidatePath(`/niveles/${nivelId}`);
  redirect(`/evaluar/${nivelId}?docente=${docenteId}&guardado=1`);
}
