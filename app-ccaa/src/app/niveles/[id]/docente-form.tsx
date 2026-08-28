"use client";

import { useActionState } from "react";
import { crearDocente } from "@/lib/actions/docentes";
import { Button, Field, inputClass } from "@/components/ui";

type Asignatura = { id: string; nombre: string };

export function DocenteForm({
  nivelId,
  asignaturas,
}: {
  nivelId: string;
  asignaturas: Asignatura[];
}) {
  const action = crearDocente.bind(null, nivelId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del docente">
          <input className={inputClass} name="nombre" required />
        </Field>
        <Field label="Correo">
          <input className={inputClass} type="email" name="email" required />
        </Field>
      </div>

      <div>
        <span className="text-sm font-medium text-foreground">Asignaturas que dicta</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {asignaturas.length === 0 && (
            <p className="text-xs text-muted">Agrega primero una asignatura.</p>
          )}
          {asignaturas.map((a) => (
            <label
              key={a.id}
              className="cursor-pointer select-none rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors has-[:checked]:border-ua has-[:checked]:bg-ua-tint has-[:checked]:text-ua hover:border-border-strong"
            >
              <input type="checkbox" name="asignaturaIds" value={a.id} className="sr-only" />
              {a.nombre}
            </label>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-incipiente">{state.error}</p>}

      <Button type="submit" variant="secondary" disabled={pending || asignaturas.length === 0} className="self-start">
        {pending ? "Agregando…" : "Agregar docente"}
      </Button>
    </form>
  );
}
