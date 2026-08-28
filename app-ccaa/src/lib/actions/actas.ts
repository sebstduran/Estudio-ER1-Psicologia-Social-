"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Guarda el archivo en /public/uploads (simplificación para el prototipo).
// En producción esto debería subir a un blob store (Vercel Blob, S3, etc.)
// ya que el disco local no persiste entre despliegues serverless.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "actas");

export async function subirActa(
  nivelId: string,
  reunionId: string,
  subidoPor: string,
  docenteId: string,
  formData: FormData
) {
  const volver = `/evaluar/${nivelId}?docente=${docenteId}`;

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    redirect(`${volver}&error=${encodeURIComponent("Selecciona un archivo.")}`);
  }
  if (archivo.size > 15 * 1024 * 1024) {
    redirect(`${volver}&error=${encodeURIComponent("El archivo no puede superar 15 MB.")}`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = path.extname(archivo.name) || "";
  const nombreSeguro = `${reunionId}-${Date.now()}${extension}`;
  const bytes = Buffer.from(await archivo.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, nombreSeguro), bytes);

  await prisma.acta.create({
    data: {
      reunionId,
      nombreArchivo: archivo.name,
      url: `/uploads/actas/${nombreSeguro}`,
      subidoPor,
    },
  });

  revalidatePath(`/evaluar/${nivelId}`);
  redirect(`${volver}&acta=1`);
}
