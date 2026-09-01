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
        "rounded-[10px] border border-border bg-surface p-5",
        interactive && "transition-colors duration-150 hover:border-border-strong",
        className
      )}
      {...props}
    />
  );
}

export const CLASE_ROTULO =
  "font-mono text-[0.6875rem] font-medium uppercase tracking-[0.085em] text-muted-2";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cx(CLASE_ROTULO, "inline-flex items-center gap-1.5", className)}>{children}</span>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className={cx(CLASE_ROTULO, "mb-2.5 block")}>{children}</h2>;
}

/**
 * Panel con encabezado propio: título, una línea de apoyo y, a la derecha, la
 * acción o la leyenda. Es la unidad de la que está hecha la aplicación.
 */
export function Panel({
  titulo,
  apoyo,
  derecha,
  children,
  className,
  id,
}: {
  titulo?: React.ReactNode;
  apoyo?: React.ReactNode;
  derecha?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cx("rounded-[10px] border border-border bg-surface", className)}>
      {titulo && (
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-border px-5 py-4">
          <div className="min-w-[220px] flex-1">
            <h2 className="text-[0.9375rem] font-semibold">{titulo}</h2>
            {apoyo && <p className="mt-0.5 text-xs text-muted-2">{apoyo}</p>}
          </div>
          {derecha}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/**
 * Explicación que se pliega. Contar cómo se lee un tablero en un párrafo fijo
 * no sirve: ocupa sitio permanente y nadie lo lee dos veces.
 */
export function Ayuda({ pregunta, children }: { pregunta: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-border">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-5 py-3 text-xs text-muted-2 transition-colors hover:text-foreground group-open:text-foreground">
        <span className="grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border border-current text-[0.625rem] font-semibold">
          ?
        </span>
        {pregunta}
      </summary>
      <div className="px-5 pb-4 pl-[41px] text-xs leading-relaxed text-muted">{children}</div>
    </details>
  );
}

const LLENO = { 3: "", 2: "[&>i:nth-child(n+3)]:opacity-20", 1: "[&>i:nth-child(n+2)]:opacity-20", 0: "[&>i]:opacity-20" } as const;

/**
 * Medidor de tres segmentos. Codifica el estado con forma además de color, así
 * que sigue leyéndose en escala de grises o para quien no distingue rojo y
 * verde — que es justo el par que más se confunde en una escala de semáforo.
 */
export function Medidor({ lleno }: { lleno: 0 | 1 | 2 | 3 }) {
  return (
    <span className={cx("inline-flex shrink-0 gap-[1.5px]", LLENO[lleno])} aria-hidden="true">
      <i className="block h-2.5 w-[3px] rounded-[1px] bg-current" />
      <i className="block h-2.5 w-[3px] rounded-[1px] bg-current" />
      <i className="block h-2.5 w-[3px] rounded-[1px] bg-current" />
    </span>
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
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] border border-transparent font-medium no-underline transition-colors duration-150 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ua";
  const sizes = {
    sm: "px-2.5 py-[5px] text-xs",
    md: "px-3.5 py-[7px] text-[0.8125rem]",
  };
  const variants = {
    primary: "bg-foreground text-surface hover:opacity-90",
    secondary: "border-border-strong bg-surface text-foreground hover:border-muted-2 hover:bg-surface-muted",
    ghost: "text-muted hover:bg-surface-hover hover:text-foreground",
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
  "rounded-[7px] border border-border-strong bg-surface-muted px-3 py-[7px] text-[0.8125rem] text-foreground placeholder:text-muted-2 transition-colors focus:border-ua focus:outline-none";

export function NivelLogroBadge({
  nivel,
}: {
  nivel: "LOGRADO" | "EN_PROCESO" | "INCIPIENTE" | "NO_TRABAJADO";
}) {
  const map = {
    LOGRADO: { text: "Logrado", cls: "border-logrado-line bg-logrado-tint text-logrado", lleno: 3 },
    EN_PROCESO: { text: "En proceso", cls: "border-proceso-line bg-proceso-tint text-proceso", lleno: 2 },
    INCIPIENTE: { text: "Incipiente", cls: "border-incipiente-line bg-incipiente-tint text-incipiente", lleno: 1 },
    // Gris y con el medidor vacío: no es una severidad más, es la ausencia de
    // juicio. Si compartiera la paleta de severidad se leería como un resultado.
    NO_TRABAJADO: { text: "Aún no se trabaja", cls: "border-border-strong bg-surface-muted text-muted", lleno: 0 },
  } as const;
  const { text, cls, lleno } = map[nivel];
  return (
    <span className={cx(CLASE_DIST, cls)}>
      <Medidor lleno={lleno} />
      {text}
    </span>
  );
}

/** Forma común de los distintivos: rectángulo con borde, nunca píldora suelta. */
export const CLASE_DIST =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[5px] border px-2 py-0.5 text-[0.6875rem] font-medium";

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

// Rúbrica como radios nativos estilizados (sin JS): funciona con progressive
// enhancement y encaja con Server Actions basadas en <form>.
//
// Los tres juicios van juntos en una fila; "aún no lo trabajo" va debajo,
// separado y en gris. La jerarquía es deliberada: son tres grados de logro más
// una salida honesta, no cuatro opciones equivalentes.
export function RubricaControl({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: "LOGRADO" | "EN_PROCESO" | "INCIPIENTE" | "NO_TRABAJADO";
}) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1.5">
        {RUBRICA_OPCIONES.map((opt) => (
          <label
            key={opt.value}
            className={cx(
              "cursor-pointer select-none rounded-[7px] border border-border-strong px-2 py-2.5 text-center text-xs font-medium text-muted transition-colors hover:border-muted-2 hover:text-foreground",
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
      <label className="flex cursor-pointer select-none items-center justify-center gap-2 rounded-[7px] border border-dashed border-border-strong px-2 py-2 text-center text-[0.6875rem] font-medium text-muted-2 transition-colors hover:border-muted-2 hover:text-muted has-[:checked]:border-solid has-[:checked]:border-muted-2 has-[:checked]:bg-surface-muted has-[:checked]:text-foreground">
        <input
          type="radio"
          name={name}
          value="NO_TRABAJADO"
          defaultChecked={defaultValue === "NO_TRABAJADO"}
          required
          className="sr-only"
        />
        Aún no lo trabajo en esta asignatura
      </label>
    </div>
  );
}

// NO_TRABAJADO viaja en el conteo pero no se dibuja: la barra representa el
// reparto del juicio de logro, y "aún no se trabaja" no es un juicio.
type ConteoLogro = {
  LOGRADO: number;
  EN_PROCESO: number;
  INCIPIENTE: number;
  NO_TRABAJADO: number;
};

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
          "w-full rounded-full bg-border",
          thin ? "h-1.5" : "h-2.5"
        )}
      />
    );
  }
  return (
    <div
      className={cx(
        "flex w-full gap-0.5 overflow-hidden rounded-full bg-border",
        thin ? "h-1.5" : "h-1.5"
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
          <span className={cx("h-2 w-2 rounded-[2px]", it.cls)} />
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
    CRITICO: { texto: "Crítico", cls: "border-incipiente-line bg-incipiente-tint text-incipiente", lleno: 1 },
    EN_RIESGO: { texto: "En riesgo", cls: "border-proceso-line bg-proceso-tint text-proceso", lleno: 2 },
    CONSOLIDADO: { texto: "Logrado", cls: "border-logrado-line bg-logrado-tint text-logrado", lleno: 3 },
    SIN_DATOS: { texto: "Sin evaluar", cls: "border-border bg-surface-muted text-muted-2", lleno: 0 },
  } as const;
  const { texto, cls, lleno } = map[severidad];
  return (
    <span className={cx(CLASE_DIST, cls)}>
      <Medidor lleno={lleno} />
      {texto}
    </span>
  );
}

// Franja lateral que tiñe la tarjeta según urgencia.
export function franjaSeveridad(
  severidad: "CRITICO" | "EN_RIESGO" | "CONSOLIDADO" | "SIN_DATOS"
) {
  return {
    CRITICO: "border-l-2 border-l-incipiente",
    EN_RIESGO: "border-l-2 border-l-proceso",
    CONSOLIDADO: "border-l-2 border-l-logrado",
    SIN_DATOS: "border-l-2 border-l-border",
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
        "rounded-[10px] border border-border bg-surface p-5 transition-opacity",
        estado === "actual" && "bg-surface-muted",
        pendiente && "opacity-55"
      )}
      aria-current={estado === "actual" ? "step" : undefined}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={cx(
            "mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md font-mono text-[0.6875rem] font-medium",
            listo
              ? "border border-logrado-line bg-logrado-tint text-logrado"
              : estado === "actual"
                ? "bg-foreground text-surface"
                : "bg-surface-hover text-muted-2"
          )}
        >
          {listo ? "✓" : numero}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-[0.8125rem] font-semibold">{titulo}</h2>
            {listo && resumen && <span className="font-mono text-xs text-muted-2">{resumen}</span>}
          </div>
          {descripcion && !listo && (
            <p className="mt-1 max-w-prose text-xs leading-relaxed text-muted-2">{descripcion}</p>
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
      <path
        d={d}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-muted-2 opacity-75"
      />
      <circle
        cx={x(ultimo.numero)}
        cy={y(ultimo.score!)}
        r="3.5"
        strokeWidth="2"
        className={cx("stroke-surface", sube ? "fill-logrado" : "fill-incipiente")}
      />
    </svg>
  );
}

/** Marca la evidencia sobre la que el equipo docente no comparte criterio. */
export function DisensoBadge({ compacto }: { compacto?: boolean }) {
  return (
    <span
      title="Una misma evidencia fue calificada como lograda por un docente y como incipiente por otro"
      className={cx(CLASE_DIST, "border-proceso-line bg-proceso-tint text-proceso")}
    >
      <span aria-hidden="true">⇄</span>
      {compacto ? "Disenso" : "Criterio no compartido"}
    </span>
  );
}

export function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 1) {
    return <span className="text-xs text-muted-2">Igual que en la primera reunión</span>;
  }
  const up = delta > 0;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 text-xs font-medium",
        up ? "text-logrado" : "text-incipiente"
      )}
    >
      {up ? "+" : "−"}
      {Math.round(Math.abs(delta))} desde la primera reunión
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
    DIRECTA: "border-ua/25 bg-ua-tint text-ua",
    TRANSVERSAL: "border-border bg-surface-muted text-muted",
  } as const;
  return (
    <span className={cx(CLASE_DIST, map[tipo])}>
      {tipo === "DIRECTA" ? "Directa" : "Transversal"}
    </span>
  );
}
