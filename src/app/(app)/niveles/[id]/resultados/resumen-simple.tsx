import type { CompetenciaDiagnostico } from "@/lib/diagnostico";

/**
 * La apertura del análisis: qué va bien, qué falta, y cuánto falta.
 *
 * Mide contra LO ESPERADO (70) y no contra 100. Un coordinador no necesita
 * saber que una competencia tiene 25 sobre 100: necesita saber que le faltan 45
 * para lo que el nivel debería alcanzar. La barra llena significa «llegó», y
 * eso se lee sin leyenda.
 *
 * Sobre el aspecto: la referencia pedida era de render 3D con neón cian y
 * magenta. Lo que se toma de ahí es la geometría precisa, la profundidad y el
 * aire — no los colores. Rojo, ámbar y verde aquí SIGNIFICAN crítico, en riesgo
 * y logrado, están validados para daltonismo, y un acento neón encima montaría
 * un segundo idioma de color compitiendo con el que sostiene el instrumento.
 */

const ESPERADO = 70;

function Fortaleza({ c }: { c: CompetenciaDiagnostico }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-logrado-line bg-logrado-tint px-4 py-3">
      <span className="font-mono text-[0.6875rem] font-medium text-logrado">{c.codigo}</span>
      <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">{c.nombre}</span>
      <span className="font-mono text-lg font-semibold tabular-nums text-logrado">
        {Math.round(c.score ?? 0)}
      </span>
    </li>
  );
}

function Brecha({ c }: { c: CompetenciaDiagnostico }) {
  const score = c.score ?? 0;
  const falta = Math.max(0, Math.round(ESPERADO - score));
  const pct = Math.min(100, (score / ESPERADO) * 100);
  const critica = c.severidad === "CRITICO";

  return (
    <li className="py-4 first:pt-1 last:pb-1">
      <div className="mb-2.5 flex items-baseline justify-between gap-4">
        <span className="flex min-w-0 items-baseline gap-2.5">
          <span className="font-mono text-[0.6875rem] font-medium text-muted-2">{c.codigo}</span>
          <span className="truncate text-[1.0625rem] font-medium tracking-tight">{c.nombre}</span>
        </span>
        <span className="shrink-0">
          <span
            className={`font-mono text-[1.375rem] font-semibold tabular-nums ${
              critica ? "text-incipiente" : "text-proceso"
            }`}
          >
            {falta}
          </span>
          <span className="ml-1.5 text-[0.8125rem] text-muted">para lo esperado</span>
        </span>
      </div>

      <div
        className="h-3 overflow-hidden rounded-full bg-surface-muted ring-1 ring-inset ring-border"
        role="img"
        aria-label={`${c.nombre}: ${Math.round(score)} de ${ESPERADO}. Faltan ${falta} puntos.`}
        title={`${Math.round(score)} de ${ESPERADO} · faltan ${falta}`}
      >
        <div
          className={`h-full rounded-full ${critica ? "bg-incipiente" : "bg-proceso"}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </li>
  );
}

export function ResumenSimple({ competencias }: { competencias: CompetenciaDiagnostico[] }) {
  const conDatos = competencias.filter((c) => c.score !== null);
  const fortalezas = conDatos.filter((c) => c.severidad === "CONSOLIDADO");
  const porTrabajar = conDatos
    .filter((c) => c.severidad !== "CONSOLIDADO")
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const sinEvaluar = competencias.filter((c) => c.score === null);

  return (
    <div className="mb-10 flex flex-col gap-4">
      {fortalezas.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Fortalezas del nivel</h2>
            <p className="text-[0.8125rem] text-muted">
              {fortalezas.length === 1 ? "Ya alcanzó" : "Ya alcanzaron"} lo esperado
            </p>
          </div>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {fortalezas.map((c) => (
              <Fortaleza key={c.id} c={c} />
            ))}
          </ul>
        </section>
      )}

      {porTrabajar.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Qué seguir trabajando</h2>
            <p className="text-[0.8125rem] text-muted">
              La barra llena es lo esperado en el nivel
            </p>
          </div>

          <ul className="mt-5 divide-y divide-border">
            {porTrabajar.map((c) => (
              <Brecha key={c.id} c={c} />
            ))}
          </ul>
        </section>
      )}

      {sinEvaluar.length > 0 && (
        <p className="px-1 text-[0.8125rem] text-muted-2">
          Sin evaluar: {sinEvaluar.map((c) => `${c.codigo} ${c.nombre}`).join(", ")}.
        </p>
      )}
    </div>
  );
}
