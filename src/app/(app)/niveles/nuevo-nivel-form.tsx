"use client";

import { useActionState } from "react";
import { useState } from "react";
import { crearNivel } from "@/lib/actions/niveles";
import { Button, Field, inputClass } from "@/components/ui";
import { HITO_CICLO, MALLA_PSICOLOGIA, NOMBRE_CICLO, type JornadaMalla } from "@/lib/malla-psicologia";

type PeriodoOption = {
  value: string;
  label: string;
};

function periodosAcademicos(jornada: JornadaMalla, anioActual: number): PeriodoOption[] {
  const anios = [anioActual - 1, anioActual, anioActual + 1];

  return anios.flatMap((anio) => {
    if (jornada === "DIURNO") {
      return [
        { value: `1.er semestre de ${anio}`, label: `1.er semestre de ${anio}` },
        { value: `2.º semestre de ${anio}`, label: `2.º semestre de ${anio}` },
      ];
    }

    return [
      { value: `1.er trimestre de ${anio}`, label: `1.er trimestre de ${anio}` },
      { value: `2.º trimestre de ${anio}`, label: `2.º trimestre de ${anio}` },
      { value: `3.er trimestre de ${anio}`, label: `3.er trimestre de ${anio}` },
    ];
  });
}

function periodoActual(jornada: JornadaMalla, fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();

  if (jornada === "DIURNO") {
    return mes < 7 ? `1.er semestre de ${anio}` : `2.º semestre de ${anio}`;
  }

  if (mes < 4) return `1.er trimestre de ${anio}`;
  if (mes < 8) return `2.º trimestre de ${anio}`;
  return `3.er trimestre de ${anio}`;
}

export function NuevoNivelForm() {
  const [state, formAction, pending] = useActionState(crearNivel, undefined);
  const [jornada, setJornada] = useState<JornadaMalla>("DIURNO");
  const [nivelNumero, setNivelNumero] = useState(1);
  const [anioActual] = useState(() => new Date().getFullYear());
  const [periodo, setPeriodo] = useState(() => periodoActual("DIURNO"));
  const niveles = MALLA_PSICOLOGIA[jornada];
  const nivel = niveles.find((item) => item.numero === nivelNumero) ?? niveles[0];
  const periodos = periodosAcademicos(jornada, anioActual);
  const totalReuniones = jornada === "DIURNO" ? 4 : 3;

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
            setPeriodo(periodoActual(siguiente));
          }}
        >
          <option value="DIURNO">Diurno</option>
          <option value="VESPERTINO_TECH">Vespertino</option>
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

      <div className="rounded-2xl border border-border bg-surface-muted/70 p-4" aria-live="polite">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-logrado/12 text-xs font-semibold text-logrado" aria-hidden="true">✓</span>
          <p className="text-sm font-semibold">La configuración curricular está lista</p>
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-ua">{NOMBRE_CICLO[nivel.ciclo]} · {HITO_CICLO[nivel.ciclo]}</p>
        <p className="mt-1 text-sm text-muted">{nivel.asignaturas.length} asignaturas · 6 competencias · {totalReuniones} reuniones</p>
      </div>

      <Field label="Período académico">
        <select
          className={inputClass}
          name="trimestre"
          value={periodo}
          onChange={(event) => setPeriodo(event.target.value)}
          required
        >
          {periodos.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
          ))}
        </select>
      </Field>

      {state?.error && <p className="text-sm text-incipiente">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creando…" : "Crear nivel"}
      </Button>
    </form>
  );
}
