"use client";

import { useActionState } from "react";
import { crearAsignatura } from "@/lib/actions/asignaturas";
import { Button, inputClass } from "@/components/ui";

export function AsignaturaForm({ nivelId }: { nivelId: string }) {
  const action = crearAsignatura.bind(null, nivelId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className={`${inputClass} flex-1`}
          name="nombre"
          placeholder="Nombre de la asignatura"
          required
        />
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Agregando…" : "Agregar"}
        </Button>
      </div>
      {state?.error && <p className="text-sm text-incipiente">{state.error}</p>}
    </form>
  );
}
