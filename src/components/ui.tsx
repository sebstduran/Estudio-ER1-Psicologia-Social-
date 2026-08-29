import { type ButtonHTMLAttributes, type HTMLAttributes } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  className,
  interactive,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(var(--shadow-color)/0.04),0_8px_24px_-12px_rgba(var(--shadow-color)/0.08)]",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_1px_2px_rgba(var(--shadow-color)/0.05),0_16px_32px_-12px_rgba(var(--shadow-color)/0.14)]",
        className
      )}
      {...props}
    />
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ua",
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-2">
      {children}
    </h2>
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ua/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
  };
  const variants = {
    primary:
      "bg-ua text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_6px_16px_-4px_rgba(138,21,21,0.35)] hover:bg-ua-strong hover:shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_-4px_rgba(138,21,21,0.45)]",
    secondary:
      "bg-surface text-foreground border border-border hover:border-border-strong hover:bg-surface-hover",
    ghost: "text-muted hover:text-foreground hover:bg-surface-hover",
    danger: "bg-incipiente text-white hover:opacity-90",
  };
  return (
    <button
      className={cx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ua/25 focus:border-ua";

export function NivelLogroBadge({
  nivel,
}: {
  nivel: "LOGRADO" | "EN_PROCESO" | "INCIPIENTE";
}) {
  const map = {
    LOGRADO: { text: "Logrado", cls: "bg-logrado-tint text-logrado" },
    EN_PROCESO: { text: "En proceso", cls: "bg-proceso-tint text-proceso" },
    INCIPIENTE: { text: "Incipiente", cls: "bg-incipiente-tint text-incipiente" },
  } as const;
  const { text, cls } = map[nivel];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {text}
    </span>
  );
}

const RUBRICA_OPCIONES = [
  {
    value: "INCIPIENTE",
    label: "Incipiente",
    active: "has-[:checked]:border-incipiente has-[:checked]:bg-incipiente-tint has-[:checked]:text-incipiente",
  },
  {
    value: "EN_PROCESO",
    label: "En proceso",
    active: "has-[:checked]:border-proceso has-[:checked]:bg-proceso-tint has-[:checked]:text-proceso",
  },
  {
    value: "LOGRADO",
    label: "Logrado",
    active: "has-[:checked]:border-logrado has-[:checked]:bg-logrado-tint has-[:checked]:text-logrado",
  },
] as const;

// Rúbrica de 3 niveles como radios nativos estilizados (sin JS): funciona
// con progressive enhancement y encaja con Server Actions basadas en <form>.
export function RubricaControl({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: "LOGRADO" | "EN_PROCESO" | "INCIPIENTE";
}) {
  return (
    <div className="inline-flex flex-wrap gap-2">
      {RUBRICA_OPCIONES.map((opt) => (
        <label
          key={opt.value}
          className={cx(
            "cursor-pointer select-none rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-border-strong",
            opt.active
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            defaultChecked={defaultValue === opt.value}
            required
            className="sr-only"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

type ConteoLogro = { LOGRADO: number; EN_PROCESO: number; INCIPIENTE: number };

// Orden de lectura izquierda→derecha: incipiente → en proceso → logrado,
// como una barra de progreso que "se llena" hacia el logro.
const SEGMENTOS_LOGRO = [
  { key: "INCIPIENTE", cls: "bg-incipiente" },
  { key: "EN_PROCESO", cls: "bg-proceso" },
  { key: "LOGRADO", cls: "bg-logrado" },
] as const;

export function LogroStackedBar({
  counts,
  thin,
}: {
  counts: ConteoLogro;
  thin?: boolean;
}) {
  const total = counts.LOGRADO + counts.EN_PROCESO + counts.INCIPIENTE;
  if (total === 0) {
    return (
      <div
        className={cx(
          "w-full rounded-full bg-surface-muted",
          thin ? "h-1.5" : "h-2.5"
        )}
      />
    );
  }
  return (
    <div
      className={cx(
        "flex w-full gap-0.5 overflow-hidden rounded-full",
        thin ? "h-1.5" : "h-2.5"
      )}
      role="img"
      aria-label={`Logrado ${counts.LOGRADO}, en proceso ${counts.EN_PROCESO}, incipiente ${counts.INCIPIENTE}`}
    >
      {SEGMENTOS_LOGRO.filter((s) => counts[s.key] > 0).map((s) => (
        <div
          key={s.key}
          title={`${s.key.replace("_", " ").toLowerCase()}: ${counts[s.key]}`}
          className={cx("h-full first:rounded-l-full last:rounded-r-full", s.cls)}
          style={{ width: `${(counts[s.key] / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

export function LogroLegend() {
  const items = [
    { cls: "bg-incipiente", label: "Incipiente" },
    { cls: "bg-proceso", label: "En proceso" },
    { cls: "bg-logrado", label: "Logrado" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span className={cx("h-2 w-2 rounded-full", it.cls)} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

// Severidad: la forma (punto lleno / anillo / línea) acompaña al color, para que
// el estado se distinga sin depender sólo del matiz.
export function SeveridadBadge({
  severidad,
}: {
  severidad: "CRITICO" | "EN_RIESGO" | "CONSOLIDADO" | "SIN_DATOS";
}) {
  const map = {
    CRITICO: { texto: "Crítico", cls: "bg-incipiente-tint text-incipiente", marca: "●" },
    EN_RIESGO: { texto: "En riesgo", cls: "bg-proceso-tint text-proceso", marca: "◐" },
    CONSOLIDADO: { texto: "Consolidado", cls: "bg-logrado-tint text-logrado", marca: "○" },
    SIN_DATOS: { texto: "Sin evaluar", cls: "bg-surface-muted text-muted-2", marca: "—" },
  } as const;
  const { texto, cls, marca } = map[severidad];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        cls
      )}
    >
      <span aria-hidden="true">{marca}</span>
      {texto}
    </span>
  );
}

// Franja lateral que tiñe la tarjeta según urgencia.
export function franjaSeveridad(
  severidad: "CRITICO" | "EN_RIESGO" | "CONSOLIDADO" | "SIN_DATOS"
) {
  return {
    CRITICO: "border-l-[3px] border-l-incipiente",
    EN_RIESGO: "border-l-[3px] border-l-proceso",
    CONSOLIDADO: "border-l-[3px] border-l-logrado",
    SIN_DATOS: "border-l-[3px] border-l-border",
  }[severidad];
}

/**
 * Un paso del flujo de configuración. El estado lo decide el dato, no el
 * usuario: lo ya resuelto se pliega, lo que toca ahora queda abierto y lo que
 * viene después se muestra atenuado para que se sepa qué falta.
 */
export function Paso({
  numero,
  titulo,
  descripcion,
  estado,
  resumen,
  colapsar = false,
  children,
}: {
  numero: number;
  titulo: string;
  descripcion?: string;
  estado: "listo" | "actual" | "pendiente";
  resumen?: React.ReactNode;
  /**
   * Un paso ya resuelto solo se pliega cuando toda la configuración está lista.
   * Mientras se configura conviene dejarlo abierto: quien agrega una asignatura
   * casi siempre va a agregar la siguiente, y plegarlo obligaría a reabrirlo.
   */
  colapsar?: boolean;
  children?: React.ReactNode;
}) {
  const listo = estado === "listo";
  const pendiente = estado === "pendiente";
  const plegado = listo && colapsar;

  return (
    <section
      className={cx(
        "rounded-2xl border bg-surface p-6 transition-opacity",
        estado === "actual"
          ? "border-ua/40 shadow-[0_1px_2px_rgba(var(--shadow-color)/0.05),0_16px_32px_-16px_rgba(var(--shadow-color)/0.16)]"
          : "border-border",
        pendiente && "opacity-55"
      )}
      aria-current={estado === "actual" ? "step" : undefined}
    >
      <div className="flex items-start gap-4">
        <span
          className={cx(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-medium",
            listo
              ? "bg-logrado-tint text-logrado"
              : estado === "actual"
                ? "bg-ua text-white"
                : "bg-surface-muted text-muted-2"
          )}
        >
          {listo ? "✓" : numero}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-serif text-xl font-medium">{titulo}</h2>
            {listo && resumen && <span className="text-sm text-muted">{resumen}</span>}
          </div>
          {descripcion && !listo && (
            <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">{descripcion}</p>
          )}

          {children && (
            <div className={cx(plegado ? "mt-4" : "mt-5")}>
              {plegado ? (
                <details className="group">
                  <summary className="cursor-pointer list-none text-xs text-muted-2 transition-colors hover:text-foreground">
                    <span className="group-open:hidden">Editar ▾</span>
                    <span className="hidden group-open:inline">Ocultar ▴</span>
                  </summary>
                  <div className="mt-4">{children}</div>
                </details>
              ) : (
                children
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Trayectoria del puntaje a lo largo de las reuniones. Serie única: no lleva
 * leyenda (el título la nombra) y se enfatiza el último punto, que es el estado
 * actual. Los tramos sin datos se saltan en vez de dibujarse como cero.
 */
export function Trayectoria({
  puntos,
}: {
  puntos: { numero: number; score: number | null }[];
}) {
  const conDatos = puntos.filter((p) => p.score !== null);
  if (conDatos.length < 2) return null;

  const W = 96;
  const H = 28;
  const P = 3;
  const maxN = Math.max(...puntos.map((p) => p.numero));
  const minN = Math.min(...puntos.map((p) => p.numero));
  const x = (n: number) => P + ((n - minN) / Math.max(maxN - minN, 1)) * (W - P * 2);
  const y = (s: number) => H - P - (s / 100) * (H - P * 2);

  const d = conDatos.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.numero)} ${y(p.score!)}`).join(" ");
  const ultimo = conDatos[conDatos.length - 1];
  const sube = ultimo.score! >= conDatos[0].score!;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
      role="img"
      aria-label={`Trayectoria: ${conDatos.map((p) => `reunión ${p.numero}, ${Math.round(p.score!)} de 100`).join("; ")}`}
    >
      <line x1={P} y1={y(70)} x2={W - P} y2={y(70)} className="stroke-border" strokeDasharray="2 3" strokeWidth="1" />
      <path d={d} fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
        className={sube ? "stroke-logrado" : "stroke-incipiente"} />
      <circle cx={x(ultimo.numero)} cy={y(ultimo.score!)} r="3"
        className={sube ? "fill-logrado" : "fill-incipiente"} />
    </svg>
  );
}

/** Marca la evidencia sobre la que el equipo docente no comparte criterio. */
export function DisensoBadge({ compacto }: { compacto?: boolean }) {
  return (
    <span
      title="Una misma evidencia fue calificada como lograda por un docente y como incipiente por otro"
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full bg-proceso-tint font-medium text-proceso",
        compacto ? "px-2 py-0.5 text-[0.65rem]" : "px-2.5 py-1 text-xs"
      )}
    >
      <span aria-hidden="true">⇄</span>
      {compacto ? "Disenso" : "Criterio no compartido"}
    </span>
  );
}

export function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 1) {
    return <span className="inline-flex items-center gap-1 text-xs text-muted">→ Sin cambio</span>;
  }
  const up = delta > 0;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 text-xs font-medium",
        up ? "text-logrado" : "text-incipiente"
      )}
    >
      {up ? "↑" : "↓"} {Math.round(Math.abs(delta))} pts · {up ? "avance" : "retroceso"}
    </span>
  );
}

export function TipoMapeoBadge({
  tipo,
}: {
  tipo: "DIRECTA" | "TRANSVERSAL" | null;
}) {
  if (!tipo) {
    return <span className="text-xs text-muted-2">Sin relación</span>;
  }
  const map = {
    DIRECTA: "bg-ua-tint text-ua",
    TRANSVERSAL: "bg-surface-muted text-muted border border-border",
  } as const;
  return (
    <span className={cx("rounded-full px-2.5 py-1 text-xs font-medium", map[tipo])}>
      {tipo === "DIRECTA" ? "Directa" : "Transversal"}
    </span>
  );
}
