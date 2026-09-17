import { createHmac, timingSafeEqual } from "node:crypto";

export type AccesoDocente = {
  v: 1;
  nivelId: string;
  docenteId: string;
  reunionId: string;
};

function secreto(): string {
  const valor = process.env.AUTH_SECRET;
  if (!valor) throw new Error("Falta configurar AUTH_SECRET.");
  return valor;
}

function firma(cuerpo: string): Buffer {
  return createHmac("sha256", secreto()).update(cuerpo).digest();
}

/**
 * Enlace personal sin cuenta ni contraseña. No guarda datos nuevos: la firma
 * prueba que el enlace fue emitido por la aplicación para esta reunión.
 */
export function crearAccesoDocente(datos: Omit<AccesoDocente, "v">): string {
  const cuerpo = Buffer.from(JSON.stringify({ v: 1, ...datos } satisfies AccesoDocente)).toString(
    "base64url"
  );
  return `${cuerpo}.${firma(cuerpo).toString("base64url")}`;
}

export function verificarAccesoDocente(token: string | undefined): AccesoDocente | null {
  if (!token) return null;
  const [cuerpo, firmaRecibida, resto] = token.split(".");
  if (!cuerpo || !firmaRecibida || resto) return null;

  try {
    const esperada = firma(cuerpo);
    const recibida = Buffer.from(firmaRecibida, "base64url");
    if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;

    const datos = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8")) as Partial<AccesoDocente>;
    if (
      datos.v !== 1 ||
      typeof datos.nivelId !== "string" ||
      typeof datos.docenteId !== "string" ||
      typeof datos.reunionId !== "string"
    ) {
      return null;
    }
    return datos as AccesoDocente;
  } catch {
    return null;
  }
}
