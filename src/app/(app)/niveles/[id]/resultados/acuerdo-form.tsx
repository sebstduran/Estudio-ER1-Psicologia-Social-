"use client";

import { useActionState, useState } from "react";
import { crearAcuerdo } from "@/lib/actions/acuerdos";
import { Button, inputClass } from "@/components/ui";

type Opcion = { id: string; codigo: string; nombre: string };

export function AcuerdoForm({
  nivelId,
  competencias,
  textoSugerido,
  competenciaSugerida,
  compacto,
}: {
  nivelId: string;
  competencias: Opcion[];
  /** Cuando el acuerdo nace de una recomendación, llega ya redactado. */
  textoSugerido?: string;
  competenciaSugerida?: string;
  compacto?: boolean;
}) {
  const action = crearAcuerdo.bind(null, nivelId);
  const [estado, formAction, pendiente] = useActionState(action, undefined);
  const [abierto, setAbierto] = useState(!compacto);

  if (!abierto) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setAbierto(true)}>
        Convertir en acuerdo
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">En qué consiste el acuerdo</span>
        <textarea
          name="texto"
          rows={compacto ? 3 : 2}
          required
          defaultValue={textoSugerido}
          placeholder="Ej. Calibrar la pauta de la unidad 2 con tres trabajos de muestra."
          className={`${inputClass} resize-y`}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Responsable</span>
          <input name="responsable" placeholder="Ej. Equipo de Metodología" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Plazo</span>
          <input name="plazo" placeholder="Ej. Antes de R3" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Competencia</span>
          <select name="competenciaId" defaultValue={competenciaSugerida ?? ""} className={inputClass}>
            <option value="">Sin asociar</option>
            {competencias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} {c.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {estado?.error && <p className="text-sm text-incipiente">{estado.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Registrar acuerdo"}
        </Button>
        {compacto && (
          <Button type="button" size="sm" variant="ghost" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
