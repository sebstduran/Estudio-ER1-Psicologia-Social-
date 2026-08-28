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
