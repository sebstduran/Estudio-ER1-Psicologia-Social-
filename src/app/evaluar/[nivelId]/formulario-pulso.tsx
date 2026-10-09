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
  nivelLogro?: NivelLogro;
  indicadores: Array<{ id: string; texto: string; esFoco?: boolean }>;
};

const OPCIONES = [
  {
    value: "INCIPIENTE",
    principal: "Recién comienza",
    oficial: "Incipiente",
    apoyo: "La mayoría todavía necesita guía constante.",
    segmentos: 1,
    activo:
      "has-[:checked]:border-incipiente has-[:checked]:bg-incipiente-tint has-[:checked]:text-incipiente",
  },
  {
    value: "EN_PROCESO",
    principal: "Avanza con apoyo",
    oficial: "En proceso",
    apoyo: "Lo demuestra de forma parcial o con ayuda.",
    segmentos: 2,
    activo:
      "has-[:checked]:border-proceso has-[:checked]:bg-proceso-tint has-[:checked]:text-proceso",
  },
  {
    value: "LOGRADO",
    principal: "Lo demuestra",
    oficial: "Logrado",
    apoyo: "La mayoría lo evidencia con autonomía.",
    segmentos: 3,
    activo:
      "has-[:checked]:border-logrado has-[:checked]:bg-logrado-tint has-[:checked]:text-logrado",
  },
] as const;

const NECESITA_FOCO = new Set<NivelLogro>(["INCIPIENTE", "EN_PROCESO"]);

function EnviarEvaluacion({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending || disabled}>
      {pending ? "Guardando…" : "Guardar evaluación"}
      {!pending && <span aria-hidden="true">→</span>}
    </Button>
  );
}

function ControlPulso({
  competenciaId,
  valor,
  onChange,
}: {
  competenciaId: string;
  valor?: NivelLogro;
  onChange: (valor: NivelLogro) => void;
}) {
  const name = `pulso:${competenciaId}`;

  return (
    <fieldset>
      <legend className="sr-only">Estado de la competencia</legend>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {OPCIONES.map((opcion) => (
          <label
            key={opcion.value}
            className={`group flex min-h-36 cursor-pointer select-none flex-col rounded-2xl border border-border bg-surface/72 p-4 text-left text-muted transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface ${opcion.activo}`}
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
            <span className="flex items-center justify-between gap-3">
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((segmento) => (
                  <i
                    key={segmento}
                    className={`h-4 w-1.5 rounded-full bg-current ${segmento >= opcion.segmentos ? "opacity-[.14]" : ""}`}
                  />
                ))}
              </span>
              <span className="grid size-5 place-items-center rounded-full border border-current/25 text-[0.65rem] opacity-45 group-has-[:checked]:border-foreground group-has-[:checked]:bg-foreground group-has-[:checked]:text-surface group-has-[:checked]:opacity-100">
                ✓
              </span>
            </span>
            <span className="mt-auto pt-5">
              <strong className="block text-sm font-semibold text-current">{opcion.principal}</strong>
              <small className="mt-1 block text-[0.68rem] font-medium uppercase tracking-[.08em] opacity-55">
                {opcion.oficial}
              </small>
              <span className="mt-2 block text-xs leading-relaxed opacity-70">{opcion.apoyo}</span>
            </span>
          </label>
        ))}
      </div>

      <label className="mt-2.5 flex cursor-pointer select-none items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-surface/55 px-4 py-3 text-xs font-medium text-muted transition-all hover:border-border-strong hover:text-foreground has-[:checked]:border-solid has-[:checked]:border-muted-2 has-[:checked]:bg-surface-muted has-[:checked]:text-foreground">
        <span>
          No la trabajo en esta asignatura
          <span className="mt-0.5 block font-normal text-muted-2">No cuenta como bajo logro.</span>
        </span>
        <input
          type="radio"
          name={name}
          value="NO_TRABAJADO"
          checked={valor === "NO_TRABAJADO"}
          onChange={() => onChange("NO_TRABAJADO")}
          required
          className="size-4 accent-foreground"
        />
      </label>
    </fieldset>
  );
}

function SelectorFocos({
  competencia,
  seleccionados,
  onChange,
}: {
  competencia: CompetenciaParaEvaluar;
  seleccionados: string[];
  onChange: (ids: string[]) => void;
}) {
  const limiteAlcanzado = seleccionados.length >= 2;

  return (
    <div className="animate-fade-in rounded-[1.35rem] border border-proceso-line bg-proceso-tint/45 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">¿Dónde conviene mirar con más atención?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Elige uno o dos elementos. No tienes que calificarlos.
          </p>
        </div>
        <span className="rounded-full border border-proceso-line bg-surface/70 px-3 py-1 font-mono text-[0.64rem] text-proceso">
          {seleccionados.length}/2 focos
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {competencia.indicadores.map((indicador, indice) => {
          const marcado = seleccionados.includes(indicador.id);
          const deshabilitado = limiteAlcanzado && !marcado;
          return (
            <label
              key={indicador.id}
              className={`flex select-none items-start gap-3 rounded-xl border px-3.5 py-3 text-sm leading-relaxed transition-all ${
                marcado
                  ? "cursor-pointer border-proceso bg-surface text-foreground shadow-sm"
                  : deshabilitado
                    ? "cursor-not-allowed border-transparent bg-surface/38 text-muted-2 opacity-55"
                    : "cursor-pointer border-border bg-surface/68 text-muted hover:border-proceso/50 hover:text-foreground"
              }`}
            >
              <input
                type="checkbox"
                name={`foco:${competencia.id}`}
                value={indicador.id}
                checked={marcado}
                disabled={deshabilitado}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...seleccionados, indicador.id]
                      : seleccionados.filter((id) => id !== indicador.id)
                  )
                }
                className="mt-0.5 size-4 shrink-0 accent-[#b23a4a]"
              />
              <span>
                <span className="mr-2 font-mono text-[0.65rem] font-medium text-muted-2">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                {indicador.texto}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function desplazarAlInicio(elemento: HTMLElement | null) {
  if (!elemento) return;
  const reduceMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  elemento.scrollIntoView({ behavior: reduceMovimiento ? "auto" : "smooth", block: "start" });
}

export function FormularioPulso({
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
        competencia.nivelLogro ? [[competencia.id, competencia.nivelLogro] as const] : []
      )
    )
  );
  const [focos, setFocos] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      competencias.map((competencia) => [
        competencia.id,
        competencia.indicadores.filter((indicador) => indicador.esFoco).map((indicador) => indicador.id),
      ])
    )
  );

  const pasoFinal = competencias.length;
  const totalPasos = pasoFinal + 1;
  const competenciaActual = competencias[paso];
  const estaCompleta = (competencia: CompetenciaParaEvaluar) => {
    const respuesta = respuestas[competencia.id];
    if (!respuesta) return false;
    if (!NECESITA_FOCO.has(respuesta)) return true;
    const cantidad = focos[competencia.id]?.length ?? 0;
    return cantidad >= 1 && cantidad <= 2;
  };
  const totalRespondidas = competencias.filter(estaCompleta).length;
  const todoCompleto = totalRespondidas === competencias.length;
  const pasoCompleto = competenciaActual ? estaCompleta(competenciaActual) : todoCompleto;

  const irA = (destino: number) => {
    setPaso(destino);
    requestAnimationFrame(() => desplazarAlInicio(inicioRef.current));
  };

  const cambiarRespuesta = (competenciaId: string, valor: NivelLogro) => {
    setRespuestas((actuales) => ({ ...actuales, [competenciaId]: valor }));
    if (!NECESITA_FOCO.has(valor)) {
      setFocos((actuales) => ({ ...actuales, [competenciaId]: [] }));
    }
  };

  return (
    <form
      action={action}
      className="flex flex-col gap-5"
      onInvalidCapture={(event) => {
        const control = event.target as HTMLInputElement;
        if (!control.name.startsWith("pulso:")) return;
        const competenciaId = control.name.slice("pulso:".length);
        const indice = competencias.findIndex((competencia) => competencia.id === competenciaId);
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
            <strong className="font-mono text-foreground">{totalRespondidas}/{competencias.length}</strong>
            <span className="block text-[0.65rem] text-muted-2">competencias listas</span>
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

      {competencias.map((competencia, competenciaIndex) => {
        const respuesta = respuestas[competencia.id];
        const seleccionados = focos[competencia.id] ?? [];
        const necesitaFoco = respuesta ? NECESITA_FOCO.has(respuesta) : false;

        return (
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

            <div className="grid gap-5 p-4 sm:p-6">
              <div>
                <p className="mb-1 text-base font-semibold">Pensando en la mayoría del curso…</p>
                <p className="mb-4 text-sm text-muted">¿Cómo está esta competencia hoy?</p>
                <ControlPulso
                  competenciaId={competencia.id}
                  valor={respuesta}
                  onChange={(valor) => cambiarRespuesta(competencia.id, valor)}
                />
              </div>

              {necesitaFoco && (
                <SelectorFocos
                  competencia={competencia}
                  seleccionados={seleccionados}
                  onChange={(ids) => setFocos((actuales) => ({ ...actuales, [competencia.id]: ids }))}
                />
              )}
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
                  <span className="text-[0.7rem] text-muted-2">
                    {necesitaFoco && seleccionados.length === 0
                      ? "Elige al menos un foco"
                      : "Elige cómo está el curso"}
                  </span>
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
        );
      })}

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
              Es opcional, pero ayuda mucho a decidir qué hacer después.
            </p>
          </div>
        </header>

        <div className="grid gap-5 p-5 sm:p-7">
          <div className="flex flex-col gap-2">
            <label htmlFor="dificultad" className="text-sm font-semibold">
              ¿Qué te está costando más con este curso?
            </label>
            <textarea
              id="dificultad"
              name="dificultad"
              className={`${inputClass} min-h-24 text-sm`}
              placeholder="Ej. Llegan sin lectura previa y cuesta aplicar los conceptos."
              defaultValue={dificultadPrevia ?? ""}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sugerencia" className="text-sm font-semibold">
              ¿Qué crees que ayudaría?
            </label>
            <textarea
              id="sugerencia"
              name="sugerencia"
              className={`${inputClass} min-h-24 text-sm`}
              placeholder="Ej. Trabajar un caso breve común entre asignaturas."
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
            <span className="hidden text-[0.7rem] text-logrado sm:inline">
              {totalRespondidas} competencias listas
            </span>
            <EnviarEvaluacion disabled={!todoCompleto} />
          </div>
        </footer>
      </section>
    </form>
  );
}
