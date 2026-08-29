"use client";

import { useActionState } from "react";
import { generarInformeDelNivel } from "@/lib/actions/informe";
import { Button } from "@/components/ui";

export function InformeBoton({
  nivelId,
  yaExiste,
}: {
  nivelId: string;
  yaExiste: boolean;
}) {
  const action = generarInformeDelNivel.bind(null, nivelId);
  const [estado, formAction, pendiente] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col items-start gap-3">
      <Button type="submit" disabled={pendiente}>
        {pendiente
          ? "Analizando el nivel…"
          : yaExiste
            ? "Volver a generar"
            : "Generar recomendaciones"}
      </Button>
      {pendiente && (
        <p className="text-xs text-muted">
          Puede tomar cerca de un minuto: el modelo revisa cada indicador y los comentarios
          de los docentes.
        </p>
      )}
      {estado?.error && (
        <p className="max-w-prose rounded-xl border border-incipiente/30 bg-incipiente-tint px-4 py-2.5 text-sm text-incipiente">
          {estado.error}
        </p>
      )}
    </form>
  );
}
