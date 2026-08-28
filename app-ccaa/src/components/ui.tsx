import { type ButtonHTMLAttributes, type HTMLAttributes } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-xl border border-border bg-surface p-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-ua text-white hover:bg-ua-strong",
    secondary:
      "bg-surface-muted text-foreground border border-border hover:border-ua",
    ghost: "text-muted hover:text-foreground",
    danger: "bg-incipiente text-white hover:opacity-90",
  };
  return <button className={cx(base, variants[variant], className)} {...props} />;
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
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ua/40 focus:border-ua";

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
    <span className={cx("rounded-full px-2.5 py-1 text-xs font-medium", cls)}>
      {text}
    </span>
  );
}

export function TipoMapeoBadge({
  tipo,
}: {
  tipo: "DIRECTA" | "TRANSVERSAL" | null;
}) {
  if (!tipo) {
    return <span className="text-xs text-muted">Sin relación</span>;
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
