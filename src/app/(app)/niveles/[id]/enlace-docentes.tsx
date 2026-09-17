"use client";

import { useState, useSyncExternalStore } from "react";
import { Button, CLASE_ROTULO, inputClass } from "@/components/ui";

const sinSuscripcion = () => () => {};
const enCliente = () => window.location.origin;
const enServidor = () => "";

export type EnlaceDocente = {
  id: string;
  nombre: string;
  token: string;
  asignaturas: string[];
};

export function EnlaceDocentes({ nivelId, enlaces }: { nivelId: string; enlaces: EnlaceDocente[] }) {
  const origen = useSyncExternalStore(sinSuscripcion, enCliente, enServidor);
  const [copiado, setCopiado] = useState<string | null>(null);

  function urlDe(token: string) {
    return origen ? `${origen}/evaluar/${nivelId}?acceso=${encodeURIComponent(token)}` : "";
  }

  async function copiar(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // El campo queda seleccionable si el navegador no permite usar el portapapeles.
    }
  }

  return (
    <div className="border-t border-border pt-5">
      <p className={`${CLASE_ROTULO} mb-2.5 block`}>Un enlace para cada docente</p>
      <p className="mb-4 max-w-2xl text-xs leading-relaxed text-muted-2">
        Copia el enlace junto al nombre y envíalo por WhatsApp o correo. La persona entra
        directamente a sus asignaturas: no crea cuenta, no usa contraseña y no ve nombres ajenos.
      </p>

      <ul className="grid gap-3">
        {enlaces.map((enlace) => {
          const url = urlDe(enlace.token);
          return (
            <li key={enlace.id} className="rounded-2xl border border-border bg-surface-muted/55 p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{enlace.nombre}</p>
                  <p className="mt-0.5 text-xs text-muted-2">
                    {enlace.asignaturas.join(" · ") || "Sin asignatura asignada"}
                  </p>
                </div>
                <span className="rounded-full border border-logrado-line bg-logrado-tint px-2.5 py-1 text-[0.65rem] font-medium text-logrado">
                  Acceso personal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={url}
                  onFocus={(event) => event.currentTarget.select()}
                  aria-label={`Enlace de ${enlace.nombre}`}
                  className={`${inputClass} min-w-0 flex-1 font-mono !text-xs`}
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => copiar(enlace.id, url)}>
                  {copiado === enlace.id ? "Copiado" : "Copiar"}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {enlaces.length === 0 && (
        <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted">
          Agrega al menos un docente para crear los enlaces.
        </p>
      )}
    </div>
  );
}
