"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verificarAccesoDocente } from "@/lib/acceso-docente";

const NIVEL_LOGRO = ["LOGRADO", "EN_PROCESO", "INCIPIENTE", "NO_TRABAJADO"] as const;

/** Recorta un texto libre; devuelve null si quedó vacío. */
function textoLibre(valor: FormDataEntryValue | null, maximo = 2000): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio ? limpio.slice(0, maximo) : null;
}

export async function guardarEvaluacion(
  nivelId: string,
  tokenAcceso: string,
  asignaturaId: string,
  formData: FormData
) {
  const acceso = verificarAccesoDocente(tokenAcceso);
  const volver = `/evaluar/${nivelId}?acceso=${encodeURIComponent(tokenAcceso)}`;
  if (!acceso || acceso.nivelId !== nivelId) {
    redirect(`/evaluar/${nivelId}?error=${encodeURIComponent("El enlace no es válido. Pide uno nuevo a quien coordina.")}`);
  }
  const docenteId = acceso.docenteId;

  const nivel = await prisma.nivel.findUnique({
    where: { id: nivelId },
    include: { reuniones: true },
  });
  if (!nivel) redirect(`${volver}&error=Nivel no encontrado.`);

  const reunion = nivel.reuniones.find((r) => r.numero === nivel.reunionActualNumero);
  if (!reunion || acceso.reunionId !== reunion.id) {
    redirect(`${volver}&error=${encodeURIComponent("Este enlace corresponde a otra reunión. Pide el enlace actualizado.")}`);
  }

  const docente = await prisma.docente.findFirst({ where: { id: docenteId, nivelId } });
  if (!docente) redirect(`${volver}&error=Docente no válido para este nivel.`);

  const asignacion = await prisma.docenteAsignatura.findUnique({
    where: { docenteId_asignaturaId: { docenteId, asignaturaId } },
    select: { id: true },
  });
  if (!asignacion) {
    redirect(`${volver}&error=${encodeURIComponent("Esa asignatura no está vinculada a tu nombre.")}`);
  }

  const indicadorIds = Array.from(
    new Set(
      Array.from(formData.keys())
        .filter((k) => k.startsWith("logro:"))
        .map((k) => k.slice("logro:".length))
    )
  );

  if (indicadorIds.length === 0) {
    redirect(`${volver}&asignatura=${asignaturaId}&error=No hay indicadores para evaluar.`);
  }

  const indicadores = await prisma.indicador.findMany({
    where: {
      id: { in: indicadorIds },
      competencia: { mapeos: { some: { asignaturaId } } },
    },
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
    redirect(`${volver}&asignatura=${asignaturaId}&error=Completa la rúbrica de al menos un indicador.`);
  }

  // Las dos preguntas abiertas del final. Se guardan junto con la rúbrica y no
  // en un paso aparte: si fueran otra pantalla, casi nadie llegaría.
  const dificultad = textoLibre(formData.get("dificultad"));
  const sugerencia = textoLibre(formData.get("sugerencia"));
  operaciones.push(
    prisma.percepcion.upsert({
      where: {
        reunionId_docenteId_asignaturaId: { reunionId: reunion.id, docenteId, asignaturaId },
      },
      update: { dificultad, sugerencia },
      create: { reunionId: reunion.id, docenteId, asignaturaId, dificultad, sugerencia },
    })
  );

  await prisma.$transaction(operaciones);
  revalidatePath(`/niveles/${nivelId}`);
  redirect(`${volver}&guardado=1`);
}
