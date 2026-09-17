"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";

// En Vercel el disco es de solo lectura (salvo /tmp, que no es servible), así
// que ahí subimos a Vercel Blob. En desarrollo local, sin BLOB_READ_WRITE_TOKEN,
// caemos a /public/uploads para no depender de una cuenta de Vercel.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "actas");
const EXTENSIONES_ANALIZABLES = new Set([".pdf", ".txt", ".png", ".jpg", ".jpeg", ".webp"]);

function validarActa(archivo: File, volver: string) {
  if (archivo.size > 15 * 1024 * 1024) {
    redirect(`${volver}${volver.includes("?") ? "&" : "?"}error=${encodeURIComponent("El archivo no puede superar 15 MB.")}`);
  }
  if (!EXTENSIONES_ANALIZABLES.has(path.extname(archivo.name).toLowerCase())) {
    redirect(`${volver}${volver.includes("?") ? "&" : "?"}error=${encodeURIComponent("Sube el acta como PDF, texto o imagen para poder analizarla.")}`);
  }
}

async function guardarArchivo(nombreSeguro: string, bytes: Buffer): Promise<string> {
  if (process.env.ACTAS_BLOB_STORE_ID) {
    const blob = await put(`actas/${nombreSeguro}`, bytes, {
      access: "private",
      storeId: process.env.ACTAS_BLOB_STORE_ID,
      oidcToken: process.env.VERCEL_OIDC_TOKEN,
    });
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
  formData: FormData
) {
  const volver = `/niveles/${nivelId}`;
  const user = await requireCoordinador();
  const reunion = await prisma.reunion.findFirst({
    where: { id: reunionId, nivel: { id: nivelId, coordinadorId: user.id } },
    select: { id: true },
  });
  if (!reunion) redirect(`${volver}?error=${encodeURIComponent("No encontramos esa reunión en tu comunidad académica.")}`);

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    redirect(`${volver}?error=${encodeURIComponent("Selecciona un archivo.")}`);
  }
  validarActa(archivo, volver);

  const extension = path.extname(archivo.name) || "";
  const nombreSeguro = `${reunionId}-${Date.now()}${extension}`;
  const url = await guardarArchivo(nombreSeguro, Buffer.from(await archivo.arrayBuffer()));

  await prisma.acta.create({
    data: { reunionId, nombreArchivo: archivo.name, url, subidoPor: user.name ?? "Coordinación" },
  });

  revalidatePath(volver);
  redirect(`${volver}?acta=1`);
}
