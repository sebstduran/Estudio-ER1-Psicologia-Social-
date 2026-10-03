"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Eyebrow, inputClass } from "@/components/ui";

type NivelLogro = "LOGRADO" | "EN_PROCESO" | "INCIPIENTE" | "NO_TRABAJADO";

export type CompetenciaParaEvaluar = {
  id: string;
  codigo: string;
  nombre: string;
  descriptor: string;
  componente: string;
  indicadores: Array<{
    id: string;
    texto: string;
    nivelLogro?: NivelLogro;
    comentario?: string;
  }>;
};

const OPCIONES = [
  {
    value: "INCIPIENTE",
    principal: "Recién comienza",
    oficial: "Incipiente",
    segmentos: 1,
    activo:
      "has-[:checked]:border-incipiente has-[:checked]:bg-incipiente-tint has-[:checked]:text-incipiente",
  },
  {
    value: "EN_PROCESO",
    principal: "Avanza con apoyo",
    oficial: "En proceso",
    segmentos: 2,
    activo:
      "has-[:checked]:border-proceso has-[:checked]:bg-proceso-tint has-[:checked]:text-proceso",
  },
  {
    value: "LOGRADO",
    principal: "Lo demuestra",
    oficial: "Logrado",
    segmentos: 3,
    activo:
      "has-[:checked]:border-logrado has-[:checked]:bg-logrado-tint has-[:checked]:text-logrado",
  },
] as const;

function EnviarEvaluacion() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? "Guardando…" : "Guardar evaluación"}
      {!pending && <span aria-hidden="true">→</span>}
    </Button>
  );
}

function ControlCompacto({
  indicadorId,
  valor,
  onChange,
}: {
  indicadorId: string;
  valor?: NivelLogro;
  onChange: (valor: NivelLogro) => void;
}) {
  const name = `logro:${indicadorId}`;

  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 gap-1.5">
        {OPCIONES.map((opcion) => (
          <label
            key={opcion.value}
            className={`flex min-h-[4.65rem] cursor-pointer select-none flex-col justify-between rounded-xl border border-border bg-surface px-2.5 py-2.5 text-left text-muted transition-all hover:border-border-strong hover:text-foreground ${opcion.activo}`}
          >
            <input
              type="radio"
              name={name}
              value={opcion.value}
              checked={valor === opcion.value}
              onChange={() => onChange(opcion.value)}
              required
              className="sr-only"
            />
            <span className="flex gap-0.5" aria-hidden="true">
              {[0, 1, 2].map((segmento) => (
                <i
                  key={segmento}
                  className={`h-3 w-1 rounded-full bg-current ${segmento >= opcion.segmentos ? "opacity-[.16]" : ""}`}
                />
              ))}
            </span>
            <span>
              <strong className="block text-[0.72rem] font-semibold leading-tight sm:text-xs">
                {opcion.principal}
              </strong>
              <small className="mt-0.5 block text-[0.6rem] opacity-60">{opcion.oficial}</small>
            </span>
          </label>
        ))}
      </div>

      <label className="mt-1.5 flex cursor-pointer select-none items-center justify-center rounded-xl border border-dashed border-border px-3 py-2 text-[0.6875rem] font-medium text-muted-2 transition-all hover:border-border-strong hover:text-muted has-[:checked]:border-solid has-[:checked]:border-muted-2 has-[:checked]:bg-surface-muted has-[:checked]:text-foreground">
        <input
          type="radio"
          name={name}
          value="NO_TRABAJADO"
          checked={valor === "NO_TRABAJADO"}
          onChange={() => onChange("NO_TRABAJADO")}
          required
          className="sr-only"
        />
        No lo trabajo en esta asignatura
      </label>
    </div>
  );
}

function ObservacionOpcional({
  indicadorId,
  comentario,
}: {
  indicadorId: string;
  comentario?: string;
}) {
  const [abierta, setAbierta] = useState(Boolean(comentario));
  const campoId = `comentario-${indicadorId}`;

  return (
    <div className="mt-2">
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={campoId}
        onClick={() => setAbierta((valor) => !valor)}
        className="py-1 text-[0.7rem] font-medium text-muted-2 transition-colors hover:text-foreground"
      >
        {abierta ? "− Ocultar observación" : "＋ Agregar una observación"}
      </button>
      <div id={campoId} hidden={!abierta}>
        <textarea
          className={`${inputClass} mt-2 min-h-16 w-full text-sm`}
          name={`comentario:${indicadorId}`}
          placeholder="Algo concreto que hayas observado (opcional)"
          defaultValue={comentario ?? ""}
        />
      </div>
    </div>
  );
}

function desplazarAlInicio(elemento: HTMLElement | null) {
  if (!elemento) return;
  const reduceMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  elemento.scrollIntoView({ behavior: reduceMovimiento ? "auto" : "smooth", block: "start" });
}

export function FormularioEvaluacion({
  action,
  competencias,
  dificultadPrevia,
  sugerenciaPrevia,
}: {
  action: (formData: FormData) => void | Promise<void>;
  competencias: CompetenciaParaEvaluar[];
  dificultadPrevia?: string;
  sugerenciaPrevia?: string;
}) {
  const inicioRef = useRef<HTMLDivElement>(null);
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, NivelLogro>>(() =>
    Object.fromEntries(
      competencias.flatMap((competencia) =>
        competencia.indicadores.flatMap((indicador) =>
          indicador.nivelLogro ? [[indicador.id, indicador.nivelLogro] as const] : []
        )
      )
    )
  );

  const pasoFinal = competencias.length;
  const totalPasos = pasoFinal + 1;
  const competenciaActual = competencias[paso];
  const totalIndicadores = competencias.reduce(
    (total, competencia) => total + competencia.indicadores.length,
    0
  );
  const totalRespondidas = Object.keys(respuestas).length;
  const pasoCompleto = competenciaActual
    ? competenciaActual.indicadores.every((indicador) => respuestas[indicador.id])
    : true;

  const irA = (destino: number) => {
    setPaso(destino);
    requestAnimationFrame(() => desplazarAlInicio(inicioRef.current));
  };

  return (
    <form
      action={action}
      className="flex flex-col gap-5"
      onInvalidCapture={(event) => {
        const control = event.target as HTMLInputElement;
        if (!control.name.startsWith("logro:")) return;
        const indicadorId = control.name.slice("logro:".length);
        const indice = competencias.findIndex((competencia) =>
          competencia.indicadores.some((indicador) => indicador.id === indicadorId)
        );
        if (indice >= 0) irA(indice);
      }}
    >
      <div ref={inicioRef} className="scroll-mt-5 rounded-[1.75rem] border border-white/70 bg-surface/88 p-3 shadow-[0_24px_70px_-44px_rgba(17,19,24,.42)] backdrop-blur-2xl sm:p-4">
        <div className="flex items-center justify-between gap-4 px-2 py-1.5">
          <div>
            <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-muted-2">
              {paso === pasoFinal ? "Último paso" : `Competencia ${paso + 1} de ${competencias.length}`}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {paso === pasoFinal ? "Tu mirada profesional" : competenciaActual?.nombre}
            </p>
          </div>
          <p className="text-right text-xs text-muted" aria-live="polite">
            <strong className="font-mono text-foreground">{totalRespondidas}/{totalIndicadores}</strong>
            <span className="block text-[0.65rem] text-muted-2">respuestas</span>
          </p>
        </div>
        <div className="mt-3 flex gap-1.5" role="progressbar" aria-label={`Paso ${paso + 1} de ${totalPasos}`} aria-valuemin={1} aria-valuemax={totalPasos} aria-valuenow={paso + 1}>
          {Array.from({ length: totalPasos }, (_, indice) => (
            <span
              key={indice}
              className={`h-1.5 flex-1 rounded-full transition-colors ${indice < paso ? "bg-logrado" : indice === paso ? "bg-ua" : "bg-border"}`}
            />
          ))}
        </div>
      </div>

      {competencias.map((competencia, competenciaIndex) => (
        <section
          key={competencia.id}
          hidden={paso !== competenciaIndex}
          className="animate-fade-in overflow-hidden rounded-[1.75rem] border border-white/70 bg-surface/84 shadow-[0_28px_80px_-52px_rgba(17,19,24,.5)] backdrop-blur-xl"
        >
          <header className="relative overflow-hidden bg-[#17191f] px-5 py-6 text-white sm:px-7 sm:py-7">
            <div aria-hidden="true" className="absolute -right-16 -top-24 size-56 rounded-full bg-ua/24 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-24 left-1/3 size-44 rounded-full bg-[#167b75]/18 blur-3xl" />
            <div className="relative">
              <Eyebrow className="!text-white/45">
                {competencia.codigo} · {competencia.componente}
              </Eyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                {competencia.nombre}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/52">
                {competencia.descriptor}
              </p>
            </div>
          </header>

          <div className="grid gap-3 p-4 sm:p-6">
            {competencia.indicadores.map((indicador, indicadorIndex) => (
              <article key={indicador.id} className="rounded-2xl border border-border bg-surface/76 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-muted font-mono text-[0.65rem] text-muted-2">
                    {indicadorIndex + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-relaxed">{indicador.texto}</p>
                    <p className="mt-1 text-[0.7rem] text-muted-2">¿Dónde está hoy la mayoría del curso?</p>
                  </div>
                </div>

                <ControlCompacto
                  indicadorId={indicador.id}
                  valor={respuestas[indicador.id]}
                  onChange={(valor) =>
                    setRespuestas((actuales) => ({ ...actuales, [indicador.id]: valor }))
                  }
                />

                <ObservacionOpcional
                  indicadorId={indicador.id}
                  comentario={indicador.comentario}
                />
              </article>
            ))}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted/45 px-4 py-4 sm:px-6">
            {competenciaIndex > 0 ? (
              <button
                type="button"
                onClick={() => irA(competenciaIndex - 1)}
                className="rounded-full px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                ← Anterior
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              {!pasoCompleto && (
                <span className="text-[0.7rem] text-muted-2">Responde las 3 para continuar</span>
              )}
              <Button
                type="button"
                size="sm"
                disabled={!pasoCompleto}
                onClick={() => irA(competenciaIndex + 1)}
              >
                {competenciaIndex + 1 === competencias.length ? "Ir a la reflexión" : "Siguiente"}
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </footer>
        </section>
      ))}

      <section
        hidden={paso !== pasoFinal}
        className="animate-fade-in overflow-hidden rounded-[1.75rem] border border-white/70 bg-surface/84 shadow-[0_28px_80px_-52px_rgba(17,19,24,.5)] backdrop-blur-xl"
      >
        <header className="relative overflow-hidden bg-[#17191f] px-5 py-6 text-white sm:px-7 sm:py-7">
          <div aria-hidden="true" className="absolute -right-16 -top-24 size-56 rounded-full bg-[#167b75]/22 blur-3xl" />
          <div className="relative">
            <Eyebrow className="!text-white/45">Tu lectura profesional</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
              Lo que los números no alcanzan a mostrar
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/52">
              Esta parte es opcional, pero es la que más ayuda a decidir qué hacer después.
            </p>
          </div>
        </header>

        <div className="grid gap-5 p-5 sm:p-7">
          <div className="flex flex-col gap-2">
            <label htmlFor="dificultad" className="text-sm font-semibold">
              ¿Qué te está costando más con este curso?
            </label>
            <p className="text-xs leading-relaxed text-muted-2">
              Lo que ves en clases y no aparece en las alternativas anteriores.
            </p>
            <textarea
              id="dificultad"
              name="dificultad"
              className={`${inputClass} min-h-24 text-sm`}
              placeholder="Ej. Llegan sin lectura previa, así que la clase se va en explicar lo básico."
              defaultValue={dificultadPrevia ?? ""}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sugerencia" className="text-sm font-semibold">
              ¿Qué crees que ayudaría?
            </label>
            <p className="text-xs leading-relaxed text-muted-2">Puede ser una idea para tu asignatura o para el equipo.</p>
            <textarea
              id="sugerencia"
              name="sugerencia"
              className={`${inputClass} min-h-24 text-sm`}
              placeholder="Ej. Un control de lectura corto al inicio, o coordinar la pauta con Metodología."
              defaultValue={sugerenciaPrevia ?? ""}
            />
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted/45 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => irA(Math.max(0, pasoFinal - 1))}
            className="rounded-full px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            ← Volver
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-[0.7rem] text-logrado sm:inline">{totalRespondidas} respuestas listas</span>
            <EnviarEvaluacion />
          </div>
        </footer>
      </section>
    </form>
  );
}
