"use client";

import { useState, useSyncExternalStore } from "react";
import { Button, CLASE_ROTULO, inputClass } from "@/components/ui";

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
      <p className={`${CLASE_ROTULO} mb-2.5 block`}>2 · Mándales este enlace</p>
      <p className="mb-3 max-w-prose text-xs leading-relaxed text-muted-2">
        Por correo o WhatsApp. Cada docente pone su nombre, elige su asignatura y evalúa solo
        lo que le toca. No tiene que crear cuenta ni recordar contraseña.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Enlace para docentes"
          className={`${inputClass} min-w-0 flex-1 font-mono !text-xs`}
        />
        <Button type="button" variant="secondary" size="sm" onClick={copiar}>
          {copiado ? "Copiado" : "Copiar"}
        </Button>
        <a href={`/evaluar/${nivelId}`} target="_blank" rel="noreferrer">
          <Button type="button" variant="ghost" size="sm">
            Ver lo que verán
          </Button>
        </a>
      </div>
    </div>
  );
}
