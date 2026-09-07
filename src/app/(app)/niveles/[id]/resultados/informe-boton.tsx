"use client";

import { useActionState } from "react";
import { generarInformeDelNivel } from "@/lib/actions/informe";
import { Button } from "@/components/ui";

// Lo que el modelo va haciendo mientras espera. Un minuto en blanco se siente
// roto; nombrar el paso en curso lo vuelve una espera comprensible.
const ETAPAS = [
  "Reuniendo acta y respuestas docentes…",
  "Cruzando los comentarios con los indicadores…",
  "Contrastando con el marco de la EPG…",
  "Eligiendo las técnicas que corresponden…",
  "Redactando las recomendaciones…",
];

function Progreso() {
  return (
    <div className="w-full max-w-md rounded-[10px] border border-border bg-surface p-5">
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full w-1/3 animate-[avance_2.4s_ease-in-out_infinite] rounded-full bg-ua" />
      </div>
      <ul className="flex flex-col gap-2">
        {ETAPAS.map((e, i) => (
          <li
            key={e}
            className="flex items-center gap-2.5 text-sm text-muted opacity-0 animate-[aparecer_0.5s_ease-out_forwards]"
            style={{ animationDelay: `${i * 2.2}s` }}
          >
            <span className="h-1 w-1 shrink-0 rounded-full bg-ua" />
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InformeBoton({
  nivelId,
  yaExiste,
  errorPrevio,
  hayActa = false,
}: {
  nivelId: string;
  yaExiste: boolean;
  /** Error del último intento, guardado en la base. Se muestra al volver a
   *  entrar; el del intento en curso lo reemplaza en cuanto llega. */
  errorPrevio?: string | null;
  hayActa?: boolean;
}) {
  const action = generarInformeDelNivel.bind(null, nivelId);
  const [estado, formAction, pendiente] = useActionState(action, undefined);
  const error = estado?.error ?? (pendiente ? null : errorPrevio);

  return (
    <form action={formAction} className="flex w-full flex-col items-start gap-4">
      {hayActa && (
        <label className="flex max-w-xl cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-muted/70 p-3.5 text-sm">
          <input type="checkbox" name="incluirActa" value="si" defaultChecked className="mt-0.5 accent-ua" />
          <span>
            <b className="block font-medium">Incluir el acta de esta reunión</b>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted">
              Gemini combinará el acta con las respuestas. El archivo se enviará a Google para generar este informe.
            </span>
          </span>
        </label>
      )}
      <Button type="submit" disabled={pendiente}>
        {pendiente
          ? "Analizando el nivel…"
          : yaExiste
            ? "Volver a generar"
            : "Generar recomendaciones"}
      </Button>

      {pendiente && <Progreso />}

      {error && (
        <p className="max-w-prose rounded-[7px] border border-incipiente-line bg-incipiente-tint px-3.5 py-2.5 text-[0.8125rem] text-incipiente">
          {error}
        </p>
      )}
    </form>
  );
}
