"use client";

import { useActionState } from "react";
import { crearNivel } from "@/lib/actions/niveles";
import { Button, Field, inputClass } from "@/components/ui";

export function NuevoNivelForm() {
  const [state, formAction, pending] = useActionState(crearNivel, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nombre del nivel" hint="Ej. Nivel 1 · Sede Providencia">
        <input className={inputClass} name="nombre" required />
      </Field>

      <Field label="Ciclo formativo">
        <select className={inputClass} name="cicloTipo" defaultValue="INICIAL">
          <option value="INICIAL">Inicial (6 competencias precargadas)</option>
          <option value="INTERMEDIO">Intermedio</option>
          <option value="FINAL">Final</option>
        </select>
      </Field>

      <Field label="Modalidad">
        <select className={inputClass} name="modalidad" defaultValue="DIURNO">
          <option value="DIURNO">Diurno (4 reuniones CCAA)</option>
          <option value="VESPERTINO_TECH">Vespertino/TECH (3 reuniones CCAA)</option>
        </select>
      </Field>

      <Field label="Trimestre" hint="Ej. 2026-T3">
        <input className={inputClass} name="trimestre" required />
      </Field>

      {state?.error && <p className="text-sm text-incipiente">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Creando…" : "Crear nivel"}
      </Button>
    </form>
  );
}
