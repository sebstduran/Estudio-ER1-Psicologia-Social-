"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { NuevoNivelForm } from "./nuevo-nivel-form";

/**
 * El formulario de creación ya no ocupa una columna permanente: aparece cuando
 * se pide. Así el panel muestra el estado de los niveles, que es a lo que se
 * entra, y no un formulario que se usa unas pocas veces al año.
 */
export function NuevoNivelPanel({ abiertoPorDefecto }: { abiertoPorDefecto?: boolean }) {
  const [abierto, setAbierto] = useState(Boolean(abiertoPorDefecto));

  if (!abierto) {
    return <Button onClick={() => setAbierto(true)}>Nuevo nivel</Button>;
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(var(--shadow-color)/0.04),0_16px_32px_-16px_rgba(var(--shadow-color)/0.12)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-lg font-medium">Nuevo nivel</h2>
        {!abiertoPorDefecto && (
          <button
            onClick={() => setAbierto(false)}
            className="text-xs text-muted-2 transition-colors hover:text-foreground"
          >
            Cancelar
          </button>
        )}
      </div>
      <NuevoNivelForm />
    </div>
  );
}
