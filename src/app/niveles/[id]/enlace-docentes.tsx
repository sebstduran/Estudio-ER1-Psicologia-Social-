"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";

// El host solo existe en el navegador. useSyncExternalStore lo lee sin efectos
// y da una instantánea vacía al servidor, así la hidratación no se desajusta.
const sinSuscripcion = () => () => {};
const enCliente = () => window.location.origin;
const enServidor = () => "";

export function EnlaceDocentes({ nivelId }: { nivelId: string }) {
  const origen = useSyncExternalStore(sinSuscripcion, enCliente, enServidor);
  const url = origen ? `${origen}/evaluar/${nivelId}` : "";
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el campo es seleccionable a mano.
    }
  }

  return (
    <div className="border-t border-border pt-5">
      <p className="mb-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
        Enlace para docentes
      </p>
      <p className="mb-3 max-w-prose text-sm leading-relaxed text-muted">
        Compártelo en la reunión o por correo. Cada docente se identifica con su nombre y
        correo, elige su asignatura y evalúa solo las competencias que esa asignatura tributa.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Enlace para docentes"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-xs text-muted"
        />
        <Button type="button" variant="secondary" size="sm" onClick={copiar}>
          {copiado ? "Copiado" : "Copiar"}
        </Button>
        <a href={`/evaluar/${nivelId}`} target="_blank" rel="noreferrer">
          <Button type="button" variant="ghost" size="sm">
            Abrir ↗
          </Button>
        </a>
      </div>
    </div>
  );
}
