import type { CompetenciaDiagnostico } from "@/lib/diagnostico";

const ESPERADO = 70;

function PulsoDelNivel({ competencias }: { competencias: CompetenciaDiagnostico[] }) {
  const conDatos = competencias.filter((c) => c.score !== null);
  const promedio = conDatos.length
    ? Math.round(conDatos.reduce((total, c) => total + (c.score ?? 0), 0) / conDatos.length)
    : 0;
  const avance = Math.min(100, (promedio / ESPERADO) * 100);
  const radio = 54;
  const largo = Math.PI * radio;
  const progreso = (avance / 100) * largo;
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface/90 p-6 shadow-[0_24px_60px_-42px_rgba(31,20,25,0.42)] backdrop-blur-sm sm:p-7">
      <div aria-hidden="true" className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-ua-tint-strong/70 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-36 w-[174px] shrink-0">
          <svg viewBox="0 0 180 132" className="h-full w-full" role="img" aria-label={`Promedio del nivel: ${promedio} de 100. Meta: ${ESPERADO}.`}>
            <defs><linearGradient id="pulso" x1="0" x2="1"><stop stopColor="var(--ua-soft)" /><stop offset="1" stopColor="var(--ua)" /></linearGradient></defs>
            <path d="M 36 108 A 54 54 0 0 1 144 108" fill="none" stroke="var(--surface-muted)" strokeWidth="16" strokeLinecap="round" />
            <path d="M 36 108 A 54 54 0 0 1 144 108" fill="none" stroke="url(#pulso)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${progreso} ${largo}`} />
            <line x1="122" y1="47" x2="128" y2="41" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
            <text x="132" y="42" fill="var(--muted-2)" fontSize="9" fontFamily="var(--font-geist-mono)">META 70</text>
            <text x="90" y="93" textAnchor="middle" fill="var(--foreground)" fontSize="31" fontWeight="650" fontFamily="var(--font-geist-mono)">{promedio}</text>
            <text x="90" y="112" textAnchor="middle" fill="var(--muted-2)" fontSize="9" letterSpacing="1.2">PROMEDIO</text>
          </svg>
        </div>
        <div className="min-w-0"><p className="font-mono text-xs font-medium tracking-[0.14em] text-ua">PULSO DEL NIVEL</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{promedio >= ESPERADO ? "El nivel alcanzó lo esperado" : `Faltan ${ESPERADO - promedio} puntos para lo esperado`}</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">El anillo muestra el promedio de las competencias evaluadas. La meta del ciclo es {ESPERADO} puntos.</p></div>
      </div>
    </section>
  );
}

function Fortaleza({ c }: { c: CompetenciaDiagnostico }) {
  return <li className="flex items-center gap-3 rounded-2xl border border-logrado-line bg-logrado-tint/70 px-4 py-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-logrado text-xs font-semibold text-white">✓</span><span className="min-w-0 flex-1"><span className="block font-mono text-[0.65rem] font-medium text-logrado">{c.codigo}</span><span className="block truncate text-sm font-medium">{c.nombre}</span></span><span className="font-mono text-xl font-semibold tabular-nums text-logrado">{Math.round(c.score ?? 0)}</span></li>;
}

function Brecha({ c, index }: { c: CompetenciaDiagnostico; index: number }) {
  const score = c.score ?? 0;
  const falta = Math.max(0, Math.round(ESPERADO - score));
  const pct = Math.min(100, (score / ESPERADO) * 100);
  const critica = c.severidad === "CRITICO";
  const tono = critica ? "bg-incipiente text-white" : "bg-proceso text-white";
  return <li className="relative overflow-hidden rounded-2xl border border-border bg-surface-muted/75 p-4 sm:p-5"><div aria-hidden="true" className={`absolute left-0 top-0 h-full w-1 ${critica ? "bg-incipiente" : "bg-proceso"}`} /><div className="flex items-start gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface font-mono text-xs font-semibold text-muted-2 shadow-sm">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><div><span className="font-mono text-[0.65rem] font-medium text-muted-2">{c.codigo}</span><h3 className="text-base font-semibold tracking-tight">{c.nombre}</h3></div><span className={`grid h-12 min-w-12 place-items-center rounded-2xl px-2 font-mono text-lg font-semibold tabular-nums ${tono}`} title={`Faltan ${falta} puntos`}><span>{falta}</span></span></div><p className="mt-1 text-xs text-muted">Puntos que faltan para alcanzar la meta del ciclo.</p><div className="relative mt-4 h-2.5 overflow-visible rounded-full bg-surface"><div className={`h-full rounded-full ${critica ? "bg-incipiente" : "bg-proceso"}`} style={{ width: `${Math.max(pct, 2)}%` }} /><span aria-hidden="true" className="absolute -top-1 h-4 border-l border-dashed border-foreground/40" style={{ left: "100%" }} /></div><div className="mt-2 flex justify-between font-mono text-[0.65rem] text-muted-2"><span>HOY {Math.round(score)}</span><span>META {ESPERADO}</span></div></div></div></li>;
}

export function ResumenSimple({ competencias }: { competencias: CompetenciaDiagnostico[] }) {
  const conDatos = competencias.filter((c) => c.score !== null);
  const fortalezas = conDatos.filter((c) => c.severidad === "CONSOLIDADO");
  const porTrabajar = conDatos.filter((c) => c.severidad !== "CONSOLIDADO").toSorted((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const sinEvaluar = competencias.filter((c) => c.score === null);
  return <div className="mb-10 flex flex-col gap-5"><PulsoDelNivel competencias={competencias} />{porTrabajar.length > 0 && <section className="rounded-[1.75rem] border border-border bg-surface/90 p-6 shadow-[0_18px_48px_-38px_rgba(31,20,25,0.38)] backdrop-blur-sm sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-xs font-medium tracking-[0.14em] text-proceso">PRIORIDADES</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Qué reforzar ahora</h2></div><p className="text-xs text-muted">Ordenadas desde la mayor brecha</p></div><ol className="mt-5 grid gap-3">{porTrabajar.map((c, index) => <Brecha key={c.id} c={c} index={index} />)}</ol></section>}{fortalezas.length > 0 && <section className="rounded-[1.75rem] border border-logrado-line bg-logrado-tint/35 p-6 sm:p-7"><div><p className="font-mono text-xs font-medium tracking-[0.14em] text-logrado">FORTALEZAS</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Lo que ya está logrando el nivel</h2></div><ul className="mt-5 grid gap-2.5 sm:grid-cols-2">{fortalezas.map((c) => <Fortaleza key={c.id} c={c} />)}</ul></section>}{sinEvaluar.length > 0 && <p className="px-1 text-xs text-muted-2">Sin evaluar todavía: {sinEvaluar.map((c) => `${c.codigo} ${c.nombre}`).join(", ")}.</p>}</div>;
}
