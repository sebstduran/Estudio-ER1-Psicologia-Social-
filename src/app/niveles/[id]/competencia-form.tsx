"use client";

import { useActionState, useState } from "react";
import { crearCompetencia } from "@/lib/actions/competencias";
import { Button, Field, inputClass } from "@/components/ui";

type Componente = { id: string; orden: number; nombre: string };

export function CompetenciaForm({
  nivelId,
  componentes,
}: {
  nivelId: string;
  componentes: Componente[];
}) {
  const action = crearCompetencia.bind(null, nivelId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        + Agregar competencia
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-dashed border-border-strong bg-surface-muted p-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Código" hint="Ej. 2.1">
          <input className={inputClass} name="codigo" required />
        </Field>
        <Field label="Componente EPG">
          <select className={inputClass} name="componenteEpgId" required defaultValue="">
            <option value="" disabled>
              Selecciona…
            </option>
            {componentes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.orden}. {c.nombre}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Nombre" hint="Ej. Investigar">
        <input className={inputClass} name="nombre" required />
      </Field>
      <Field label="Descriptor">
        <textarea className={inputClass} name="descriptor" rows={2} required />
      </Field>
      <Field label="Indicador 1">
        <input className={inputClass} name="indicador1" required />
      </Field>
      <Field label="Indicador 2">
        <input className={inputClass} name="indicador2" required />
      </Field>
      <Field label="Indicador 3">
        <input className={inputClass} name="indicador3" required />
      </Field>

      {state?.error && <p className="text-sm text-incipiente">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar competencia"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
