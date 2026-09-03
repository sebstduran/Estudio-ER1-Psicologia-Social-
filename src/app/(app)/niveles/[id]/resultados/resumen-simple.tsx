import { Card } from "@/components/ui";
import type { CompetenciaDiagnostico } from "@/lib/diagnostico";

/**
 * La apertura del análisis: qué va bien, qué falta, y cuánto falta.
 *
 * El gráfico mide contra el ESTÁNDAR (70) y no contra 100. Un coordinador no
 * necesita saber que una competencia tiene 25 sobre 100: necesita saber que le
 * faltan 45 puntos para el estándar del nivel. La barra llena significa
 * «llegó», y eso se lee sin explicación.
 */

const ESTANDAR = 70;

function Chip({ c }: { c: CompetenciaDiagnostico }) {
  return (
    <li className="flex items-center gap-2 rounded-[9px] border border-logrado-line bg-logrado-tint px-3 py-2">
      <span className="font-mono text-[0.7rem] font-medium text-logrado">{c.codigo}</span>
      <span className="text-[0.8125rem] font-medium">{c.nombre}</span>
      <span className="ml-auto font-mono text-[0.8125rem] font-medium tabular-nums text-logrado">
        {Math.round(c.score ?? 0)}
      </span>
    </li>
  );
}

function BarraDeBrecha({ c }: { c: CompetenciaDiagnostico }) {
  const score = c.score ?? 0;
  const falta = Math.max(0, Math.round(ESTANDAR - score));
  const pct = Math.min(100, (score / ESTANDAR) * 100);
  const critica = c.severidad === "CRITICO";
  const tono = critica ? "bg-incipiente" : "bg-proceso";
  const tinta = critica ? "text-incipiente" : "text-proceso";

  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[11rem_1fr_7rem]">
      <span className="flex items-baseline gap-2">
        <span className="font-mono text-[0.7rem] font-medium text-muted-2">{c.codigo}</span>
        <span className="truncate text-[0.9375rem] font-medium">{c.nombre}</span>
      </span>

      <div
        className="col-span-2 h-2.5 overflow-hidden rounded-full bg-surface-muted sm:col-span-1"
        role="img"
        aria-label={`${c.nombre}: ${Math.round(score)} de ${ESTANDAR}. Faltan ${falta} puntos.`}
        title={`${Math.round(score)} de ${ESTANDAR} · faltan ${falta}`}
      >
        <div className={`h-full rounded-full ${tono}`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>

      <span className={`text-right text-[0.8125rem] font-medium tabular-nums sm:text-left ${tinta}`}>
        faltan {falta}
      </span>
    </li>
  );
}

export function ResumenSimple({
  competencias,
}: {
  competencias: CompetenciaDiagnostico[];
}) {
  const conDatos = competencias.filter((c) => c.score !== null);
  const fortalezas = conDatos.filter((c) => c.severidad === "CONSOLIDADO");
  const porTrabajar = conDatos
    .filter((c) => c.severidad !== "CONSOLIDADO")
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const sinEvaluar = competencias.filter((c) => c.score === null);

  return (
    <div className="mb-10 flex flex-col gap-4">
      {fortalezas.length > 0 && (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-[1.0625rem] font-semibold tracking-tight">Fortalezas del nivel</h2>
            <p className="text-[0.8125rem] text-muted">
              {fortalezas.length === 1
                ? "1 competencia ya alcanzó lo esperado"
                : `${fortalezas.length} competencias ya alcanzaron lo esperado`}
            </p>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {fortalezas.map((c) => (
              <Chip key={c.id} c={c} />
            ))}
          </ul>
        </Card>
      )}

      {porTrabajar.length > 0 && (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-[1.0625rem] font-semibold tracking-tight">Qué seguir trabajando</h2>
            <p className="text-[0.8125rem] text-muted">
              Cuánto falta para lo esperado en el nivel
            </p>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {porTrabajar.map((c) => (
              <BarraDeBrecha key={c.id} c={c} />
            ))}
          </ul>
        </Card>
      )}

      {sinEvaluar.length > 0 && (
        <p className="text-[0.8125rem] text-muted-2">
          Sin evaluar: {sinEvaluar.map((c) => `${c.codigo} ${c.nombre}`).join(", ")}.
        </p>
      )}
    </div>
  );
}
