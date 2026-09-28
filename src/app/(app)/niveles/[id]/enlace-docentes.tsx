"use client";

import { useState, useSyncExternalStore } from "react";
import { Button, CLASE_ROTULO } from "@/components/ui";

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
  const [fallo, setFallo] = useState<string | null>(null);

  function urlDe(token: string) {
    return origen ? `${origen}/evaluar/${nivelId}?acceso=${encodeURIComponent(token)}` : "";
  }

  async function copiar(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setFallo(null);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      setFallo(id);
    }
  }

  return (
    <div className="border-t border-border pt-5">
      <p className={`${CLASE_ROTULO} mb-2.5 block`}>Listos para enviar</p>
      <p className="mb-4 max-w-2xl text-xs leading-relaxed text-muted-2">
        Copia el acceso junto al nombre y envíalo por WhatsApp o correo. Cada persona entra directamente a sus asignaturas.
      </p>

      <ul className="grid gap-3">
        {enlaces.map((enlace) => {
          const url = urlDe(enlace.token);
          return (
            <li key={enlace.id} className="grid min-w-0 gap-4 rounded-2xl border border-border bg-surface-muted/55 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{enlace.nombre}</p>
                <p className="mt-1 truncate text-xs text-muted-2">
                  {enlace.asignaturas.join(" · ") || "Sin asignatura asignada"}
                </p>
                {fallo === enlace.id && <p className="mt-2 text-xs text-incipiente">No se pudo copiar. Ábrelo y copia la dirección del navegador.</p>}
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button type="button" size="sm" className="flex-1 sm:flex-none" onClick={() => copiar(enlace.id, url)}>
                  {copiado === enlace.id ? "Enlace copiado ✓" : "Copiar enlace"}
                </Button>
                <a href={url} target="_blank" rel="noreferrer" className="shrink-0 rounded-full border border-border-strong bg-surface px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-foreground/30 hover:text-foreground">
                  Abrir
                </a>
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
