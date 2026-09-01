"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Puerta de entrada del docente que no tiene el enlace a mano. El código va en
 * el cuerpo del formulario y no en la URL, para que no quede en el historial
 * del navegador ni en los registros del servidor.
 */
export async function entrarPorCodigo(formData: FormData) {
  const crudo = formData.get("codigo");
  const codigo = typeof crudo === "string" ? crudo.trim().toUpperCase().replace(/[\s-]/g, "") : "";

  if (!codigo) {
    redirect(`/docente?error=${encodeURIComponent("Escribe el código que te dio tu coordinación.")}`);
  }

  const nivel = await prisma.nivel.findUnique({ where: { codigo }, select: { id: true } });
  if (!nivel) {
    redirect(
      `/docente?error=${encodeURIComponent(
        "No encontramos ese código. Revísalo con tu coordinación: son 6 caracteres."
      )}`
    );
  }

  redirect(`/evaluar/${nivel.id}`);
}

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

const NIVEL_LOGRO = ["LOGRADO", "EN_PROCESO", "INCIPIENTE", "NO_TRABAJADO"] as const;

/** Recorta un texto libre; devuelve null si quedó vacío. */
function textoLibre(valor: FormDataEntryValue | null, maximo = 2000): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio ? limpio.slice(0, maximo) : null;
}

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
  redirect(`/evaluar/${nivelId}?docente=${docenteId}&guardado=1`);
}
