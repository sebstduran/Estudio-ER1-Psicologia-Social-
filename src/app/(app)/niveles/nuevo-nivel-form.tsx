"use client";

import { useActionState } from "react";
import { useState } from "react";
import { crearNivel } from "@/lib/actions/niveles";
import { Button, Field, inputClass } from "@/components/ui";
import { HITO_CICLO, MALLA_PSICOLOGIA, NOMBRE_CICLO, type JornadaMalla } from "@/lib/malla-psicologia";

export function NuevoNivelForm() {
  const [state, formAction, pending] = useActionState(crearNivel, undefined);
  const [jornada, setJornada] = useState<JornadaMalla>("DIURNO");
  const [nivelNumero, setNivelNumero] = useState(1);
  const niveles = MALLA_PSICOLOGIA[jornada];
  const nivel = niveles.find((item) => item.numero === nivelNumero) ?? niveles[0];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Jornada">
        <select
          className={inputClass}
          name="modalidad"
          value={jornada}
          onChange={(event) => {
            const siguiente = event.target.value as JornadaMalla;
            setJornada(siguiente);
            setNivelNumero(1);
          }}
        >
          <option value="DIURNO">Diurno · 4 reuniones</option>
          <option value="VESPERTINO_TECH">Vespertino · 3 reuniones</option>
        </select>
      </Field>

      <Field label="Nivel">
        <select
          className={inputClass}
          name="nivelNumero"
          value={nivelNumero}
          onChange={(event) => setNivelNumero(Number(event.target.value))}
          required
        >
          {niveles.map((item) => <option key={item.numero} value={item.numero}>Nivel {item.numero}</option>)}
        </select>
      </Field>

      <div className="rounded-2xl border border-border bg-surface-muted/70 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-ua">{NOMBRE_CICLO[nivel.ciclo]}</p>
        <p className="mt-1 text-sm font-medium">{nivel.asignaturas.length} asignaturas cargadas automáticamente</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{HITO_CICLO[nivel.ciclo]} · 6 competencias oficiales</p>
      </div>

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
