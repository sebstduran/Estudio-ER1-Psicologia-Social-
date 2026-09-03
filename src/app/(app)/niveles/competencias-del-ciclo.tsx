import { Medidor } from "@/components/ui";
import type { CompetenciaDelCiclo } from "@/lib/panel";
import type { Severidad } from "@/lib/diagnostico";

/**
 * Las competencias del ciclo, una barra por competencia y ordenadas por
 * urgencia. Responde de un vistazo la primera pregunta del instrumento —¿el
 * nivel está logrando sus competencias?— sin entrar al detalle.
 *
 * Barras horizontales y no un radar: el radar se ve vistoso pero no se pueden
 * comparar magnitudes en él, y esto se proyecta en la reunión para decidir. Las
 * barras además dejan sitio para nombres largos («Autoexplorar») sin rotar
 * texto.
 *
 * Sobre el color: la paleta de severidad pasa las seis comprobaciones en claro
 * y en oscuro, pero en oscuro el par ámbar↔rojo queda en ΔE 8.2 para visión
 * deutan, justo sobre el mínimo. Eso obliga a codificación secundaria: por eso
 * cada barra lleva SIEMPRE su puntaje y su medidor de tres segmentos. No son
 * adorno — son lo que hace legible el gráfico para quien no distingue esos dos
 * colores.
 */

const TONO: Record<Severidad, { barra: string; texto: string; palabra: string; lleno: 0 | 1 | 2 | 3 }> = {
  CRITICO: { barra: "bg-incipiente", texto: "text-incipiente", palabra: "Crítico", lleno: 1 },
  EN_RIESGO: { barra: "bg-proceso", texto: "text-proceso", palabra: "En riesgo", lleno: 2 },
  CONSOLIDADO: { barra: "bg-logrado", texto: "text-logrado", palabra: "Logrado", lleno: 3 },
  SIN_DATOS: { barra: "bg-border-strong", texto: "text-muted-2", palabra: "Sin evaluar", lleno: 0 },
};

/** El estándar del nivel. Marcarlo convierte la barra en una respuesta. */
const ESTANDAR = 70;

/**
 * Avance desde la línea base. La flecha lleva la dirección y el color se queda
 * en tinta neutra a propósito: verde y ámbar están reservados para el estado de
 * logro, y pintar de verde un «+56» que sigue estando en riesgo diría lo
 * contrario de lo que pasa. Mejorar y haber llegado son cosas distintas.
 */
function Delta({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-2">—</span>;
  const n = Math.round(delta);
  if (n === 0) return <span className="text-muted-2">sin cambio</span>;
  const sube = n > 0;
  return (
    <span className="text-muted" title={sube ? "Subió desde la primera reunión" : "Bajó desde la primera reunión"}>
      {sube ? "▲" : "▼"} {sube ? "+" : "−"}
      {Math.abs(n)}
    </span>
  );
}

function Fila({ c, hayLineaBase }: { c: CompetenciaDelCiclo; hayLineaBase: boolean }) {
  const t = TONO[c.severidad];
  const pct = c.score ?? 0;
  const titulo =
    c.score === null
      ? `${c.codigo} ${c.nombre}: sin evaluar en esta reunión`
      : `${c.codigo} ${c.nombre}: ${Math.round(c.score)} de 100 · ${t.palabra}`;

  return (
    <li className="grid grid-cols-[2.6rem_1fr] items-center gap-x-3 gap-y-1.5 py-2.5 sm:grid-cols-[2.6rem_8.5rem_1fr_2.6rem_5.5rem]">
      <span className="font-mono text-[0.7rem] font-medium text-muted-2">{c.codigo}</span>
      <span className="truncate text-[0.8125rem] font-medium">{c.nombre}</span>

      {/* La barra. Pista recesiva, relleno con extremo redondeado, y una marca
          fina en 70 que es donde está el estándar del nivel. */}
      <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1">
        <div
          className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-muted"
          role="img"
          aria-label={titulo}
          title={titulo}
        >
          {c.score !== null && (
            <div
              className={`h-full rounded-full ${t.barra}`}
              style={{ width: `${Math.max(pct, 1.5)}%` }}
            />
          )}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-px bg-foreground/25"
            style={{ left: `${ESTANDAR}%` }}
          />
        </div>
        <span className="sm:hidden">
          <span className={`font-mono text-[0.8125rem] font-medium tabular-nums ${t.texto}`}>
            {c.score === null ? "—" : Math.round(c.score)}
          </span>
        </span>
      </div>

      <span
        className={`hidden text-right font-mono text-[0.8125rem] font-medium tabular-nums sm:block ${t.texto}`}
      >
        {c.score === null ? "—" : Math.round(c.score)}
      </span>

      <span className="col-span-2 flex items-center gap-1.5 text-[0.7rem] sm:col-span-1 sm:justify-end">
        <span className={t.texto}>
          <Medidor lleno={t.lleno} />
        </span>
        {hayLineaBase ? (
          <Delta delta={c.delta} />
        ) : (
          <span className={t.texto}>{t.palabra}</span>
        )}
      </span>
    </li>
  );
}

export function CompetenciasDelCiclo({
  competencias,
  hayLineaBase,
}: {
  competencias: CompetenciaDelCiclo[];
  hayLineaBase: boolean;
}) {
  if (competencias.length === 0) return null;

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
          Las competencias del ciclo
        </h3>
        <p className="text-[0.68rem] text-muted-2">
          {hayLineaBase ? (
            <>La marca fina es el estándar (70). A la derecha, el avance desde R1.</>
          ) : (
            <>La marca fina es el estándar (70).</>
          )}
        </p>
      </div>

      <ul className="divide-y divide-border">
        {competencias.map((c) => (
          <Fila key={c.id} c={c} hayLineaBase={hayLineaBase} />
        ))}
      </ul>
    </div>
  );
}
