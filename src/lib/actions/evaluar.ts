"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verificarAccesoDocente } from "@/lib/acceso-docente";

const NIVEL_LOGRO = ["LOGRADO", "EN_PROCESO", "INCIPIENTE", "NO_TRABAJADO"] as const;
const REQUIERE_FOCO = new Set<(typeof NIVEL_LOGRO)[number]>(["INCIPIENTE", "EN_PROCESO"]);

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

  const mapeos = await prisma.mapeoAsignaturaCompetencia.findMany({
    where: {
      asignaturaId,
      competencia: { nivelId },
    },
    include: {
      competencia: { include: { indicadores: { orderBy: { orden: "asc" } } } },
    },
  });

  const operaciones = [];
  for (const { competencia } of mapeos) {
    const logroRaw = formData.get(`pulso:${competencia.id}`);
    if (typeof logroRaw !== "string" || !NIVEL_LOGRO.includes(logroRaw as never)) {
      redirect(
        `${volver}&asignatura=${asignaturaId}&error=${encodeURIComponent("Indica cómo está el curso en cada competencia.")}`
      );
    }
    if (competencia.indicadores.length === 0) {
      redirect(
        `${volver}&asignatura=${asignaturaId}&error=${encodeURIComponent("Esta competencia aún no tiene elementos curriculares configurados.")}`
      );
    }

    const indicadorIdsValidos = new Set(competencia.indicadores.map((indicador) => indicador.id));
    const focos = Array.from(
      new Set(
        formData
          .getAll(`foco:${competencia.id}`)
          .filter((valor): valor is string => typeof valor === "string" && indicadorIdsValidos.has(valor))
      )
    );
    const nivelLogro = logroRaw as (typeof NIVEL_LOGRO)[number];
    if (REQUIERE_FOCO.has(nivelLogro) && (focos.length === 0 || focos.length > 2)) {
      redirect(
        `${volver}&asignatura=${asignaturaId}&error=${encodeURIComponent("Cuando hay una dificultad, elige uno o dos focos para reforzar.")}`
      );
    }
    const focosGuardados = new Set(REQUIERE_FOCO.has(nivelLogro) ? focos : []);

    for (const indicador of competencia.indicadores) {
      operaciones.push(
        prisma.evaluacion.upsert({
          where: {
            reunionId_docenteId_asignaturaId_indicadorId: {
              reunionId: reunion.id,
              docenteId,
              asignaturaId,
              indicadorId: indicador.id,
            },
          },
          // No se borra comentario: una edición con el formulario breve no
          // debe eliminar observaciones guardadas con la rúbrica anterior.
          update: {
            nivelLogro,
            esPulso: true,
            esFoco: focosGuardados.has(indicador.id),
          },
          create: {
            reunionId: reunion.id,
            docenteId,
            asignaturaId,
            indicadorId: indicador.id,
            competenciaId: competencia.id,
            nivelLogro,
            esPulso: true,
            esFoco: focosGuardados.has(indicador.id),
          },
        })
      );
    }
  }

  if (operaciones.length === 0) {
    redirect(
      `${volver}&asignatura=${asignaturaId}&error=${encodeURIComponent("Esta asignatura todavía no tiene competencias para evaluar.")}`
    );
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
