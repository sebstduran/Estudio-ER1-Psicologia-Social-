"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

// En Vercel el disco es de solo lectura (salvo /tmp, que no es servible), así
// que ahí subimos a Vercel Blob. En desarrollo local, sin BLOB_READ_WRITE_TOKEN,
// caemos a /public/uploads para no depender de una cuenta de Vercel.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "actas");

async function guardarArchivo(nombreSeguro: string, bytes: Buffer): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`actas/${nombreSeguro}`, bytes, { access: "public" });
    return blob.url;
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, nombreSeguro), bytes);
  return `/uploads/actas/${nombreSeguro}`;
}

/** Subida desde la pantalla de configuración del coordinador. */
export async function subirActaCoordinador(
  nivelId: string,
  reunionId: string,
  subidoPor: string,
  formData: FormData
) {
  const volver = `/niveles/${nivelId}`;

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    redirect(`${volver}?error=${encodeURIComponent("Selecciona un archivo.")}`);
  }
  if (archivo.size > 15 * 1024 * 1024) {
    redirect(`${volver}?error=${encodeURIComponent("El archivo no puede superar 15 MB.")}`);
  }

  const extension = path.extname(archivo.name) || "";
  const nombreSeguro = `${reunionId}-${Date.now()}${extension}`;
  const url = await guardarArchivo(nombreSeguro, Buffer.from(await archivo.arrayBuffer()));

  await prisma.acta.create({
    data: { reunionId, nombreArchivo: archivo.name, url, subidoPor },
  });

  revalidatePath(volver);
  redirect(`${volver}?acta=1`);
}

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

  const extension = path.extname(archivo.name) || "";
  const nombreSeguro = `${reunionId}-${Date.now()}${extension}`;
  const bytes = Buffer.from(await archivo.arrayBuffer());
  const url = await guardarArchivo(nombreSeguro, bytes);

  await prisma.acta.create({
    data: { reunionId, nombreArchivo: archivo.name, url, subidoPor },
  });

  revalidatePath(`/evaluar/${nivelId}`);
  redirect(`${volver}&acta=1`);
}
