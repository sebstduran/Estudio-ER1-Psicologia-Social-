"use client";

import { useActionState } from "react";
import { crearNivel } from "@/lib/actions/niveles";
import { Button, Field, inputClass } from "@/components/ui";

export function NuevoNivelForm() {
  const [state, formAction, pending] = useActionState(crearNivel, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nivel">
        <select className={inputClass} name="nombre" defaultValue="Nivel 1" required>
          {Array.from({ length: 14 }, (_, i) => <option key={i + 1} value={`Nivel ${i + 1}`}>Nivel {i + 1}</option>)}
        </select>
      </Field>

      <Field label="Ciclo formativo">
        <select className={inputClass} name="cicloTipo" defaultValue="INICIAL">
          <option value="INICIAL">Inicial · 1.º y 2.º año</option>
          <option value="INTERMEDIO">Intermedio · 3.º y 4.º año</option>
          <option value="FINAL">Avanzado · 5.º año</option>
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

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creando…" : "Crear nivel"}
      </Button>
    </form>
  );
}
