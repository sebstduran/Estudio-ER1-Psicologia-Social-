import type { CompetenciaDiagnostico } from "@/lib/diagnostico";

const ESPERADO = 70;

const ESTILO_TUBO = {
  CRITICO: { fondo: "linear-gradient(180deg, #d64a63 0%, #a3182c 100%)", texto: "Crítico", lleno: 1 },
  EN_RIESGO: { fondo: "linear-gradient(180deg, #d7a536 0%, #b3820f 100%)", texto: "En riesgo", lleno: 2 },
  CONSOLIDADO: { fondo: "linear-gradient(180deg, #35a77d 0%, #10714f 100%)", texto: "Logrado", lleno: 3 },
  SIN_DATOS: { fondo: "linear-gradient(180deg, #777f8b 0%, #505761 100%)", texto: "Sin evaluar", lleno: 0 },
} as const;

function GraficoDeResultados({ competencias }: { competencias: CompetenciaDiagnostico[] }) {
  const conDatos = competencias.filter((c) => c.score !== null);
  const relevantes = conDatos
    .toSorted((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 3);
  if (relevantes.length === 0) return null;
  const promedio = conDatos.length
    ? Math.round(conDatos.reduce((total, c) => total + (c.score ?? 0), 0) / conDatos.length)
    : 0;
  const logradas = conDatos.filter((c) => c.severidad === "CONSOLIDADO").length;
  const veredicto = promedio >= ESPERADO ? "El curso alcanzó lo esperado" : `Al curso le faltan ${ESPERADO - promedio} puntos en promedio`;
  return <section className="relative mb-5 overflow-hidden rounded-[2rem] bg-[#12141b] p-6 text-white shadow-[0_30px_80px_-38px_rgba(14,16,20,0.7)] sm:p-8"><div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(178,58,74,0.34),transparent_30%),radial-gradient(circle_at_14%_92%,rgba(65,92,146,0.28),transparent_36%)]" /><div className="relative grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-end"><div><p className="font-mono text-xs font-medium tracking-[0.16em] text-[#f0a4b2]">RESULTADO DEL NIVEL</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{veredicto}</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">{logradas} de {conDatos.length} competencias evaluadas alcanzaron la referencia del ciclo. Estas son las tres prioridades.</p><div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white/75"><span className="font-mono text-base font-semibold text-white">{promedio}</span> promedio · meta {ESPERADO}</div></div><ol className="grid grid-cols-3 gap-3 sm:gap-6">{relevantes.map((c, index) => { const score = Math.round(c.score ?? 0); const estilo = ESTILO_TUBO[c.severidad]; const falta = Math.max(0, ESPERADO - score); return <li key={c.id} className="min-w-0 text-center"><div className="mb-3 flex flex-col items-center gap-1"><span className="font-mono text-2xl font-semibold tabular-nums sm:text-3xl">{score}</span><span className="text-[0.62rem] uppercase tracking-[0.11em] text-white/50">hoy</span></div><div className="relative mx-auto flex h-44 w-12 items-end overflow-hidden rounded-t-[1.4rem] border border-white/20 bg-white/10 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] sm:h-52 sm:w-14"><span aria-label={`Meta ${ESPERADO}`} className="absolute left-0 right-0 z-10 border-t border-dashed border-white/80" style={{ bottom: `${ESPERADO}%` }} /><div className="w-full rounded-t-[1rem] shadow-[0_0_24px_rgba(255,255,255,0.14)]" style={{ height: `${Math.max(score, 3)}%`, background: estilo.fondo }} /></div><div className="mt-3"><p className="font-mono text-[0.65rem] text-white/50">{String(index + 1).padStart(2, "0")} · {c.codigo}</p><h3 className="mt-0.5 truncate text-sm font-medium">{c.nombre}</h3><p className="mt-1 text-xs text-white/60"><span className="font-semibold text-white">−{falta}</span> para la meta</p><span className="mt-2 inline-flex items-center gap-1 text-[0.64rem] font-medium uppercase tracking-[0.08em] text-white/75"><i className="inline-flex gap-px">{[1, 2, 3].map((n) => <b key={n} className={`h-2 w-[3px] rounded-sm bg-white ${n > estilo.lleno ? "opacity-25" : ""}`} />)}</i>{estilo.texto}</span></div></li>; })}</ol></div></section>;
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
  return <li className="relative overflow-hidden rounded-2xl border border-border bg-surface-muted/75 p-4 sm:p-5"><div aria-hidden="true" className={`absolute left-0 top-0 h-full w-1 ${critica ? "bg-incipiente" : "bg-proceso"}`} /><div className="flex items-start gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface font-mono text-xs font-semibold text-muted-2 shadow-sm">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><div><span className="font-mono text-[0.65rem] font-medium text-muted-2">{c.codigo}</span><h3 className="text-base font-semibold tracking-tight">{c.nombre}</h3></div><div className="text-right"><span className={`grid h-12 min-w-12 place-items-center rounded-2xl px-2 font-mono text-lg font-semibold tabular-nums ${tono}`} title={`Faltan ${falta} puntos`}>{falta}</span><span className="mt-1 block text-[0.6rem] uppercase tracking-wider text-muted-2">puntos faltan</span></div></div>{c.indicadorMasDebil ? <div className="mt-3 rounded-xl border border-border/70 bg-surface/70 px-3.5 py-3"><p className="font-mono text-[0.62rem] font-medium uppercase tracking-[.11em] text-muted-2">FOCO RECOMENDADO</p><p className="mt-1.5 text-sm font-medium leading-[1.65]">{c.indicadorMasDebil.texto}</p></div> : <p className="mt-2 text-xs text-muted">Aún falta evidencia para precisar el foco.</p>}<div className="relative mt-4 h-2.5 overflow-visible rounded-full bg-surface"><div className={`h-full rounded-full ${critica ? "bg-incipiente" : "bg-proceso"}`} style={{ width: `${Math.max(pct, 2)}%` }} /><span aria-hidden="true" className="absolute -top-1 h-4 border-l border-dashed border-foreground/40" style={{ left: "100%" }} /></div><div className="mt-2 flex justify-between font-mono text-[0.65rem] text-muted-2"><span>HOY {Math.round(score)}</span><span>META {ESPERADO}</span></div></div></div></li>;
}

export function ResumenSimple({ competencias }: { competencias: CompetenciaDiagnostico[] }) {
  const conDatos = competencias.filter((c) => c.score !== null);
  const fortalezas = conDatos.filter((c) => c.severidad === "CONSOLIDADO");
  const porTrabajar = conDatos.filter((c) => c.severidad !== "CONSOLIDADO").toSorted((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const sinEvaluar = competencias.filter((c) => c.score === null);
  return <div className="mb-10 flex flex-col gap-5"><GraficoDeResultados competencias={competencias} />{porTrabajar.length > 0 && <section className="rounded-[1.75rem] border border-border bg-surface/90 p-6 shadow-[0_18px_48px_-38px_rgba(31,20,25,0.38)] backdrop-blur-sm sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-xs font-medium tracking-[0.14em] text-proceso">POR QUÉ</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Qué necesita refuerzo</h2></div><p className="text-xs text-muted">La evidencia más débil de cada prioridad</p></div><ol className="mt-5 grid gap-3">{porTrabajar.map((c, index) => <Brecha key={c.id} c={c} index={index} />)}</ol></section>}{fortalezas.length > 0 && <section className="rounded-[1.75rem] border border-logrado-line bg-logrado-tint/35 p-6 sm:p-7"><div><p className="font-mono text-xs font-medium tracking-[0.14em] text-logrado">FORTALEZAS</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Lo que ya está logrando el nivel</h2></div><ul className="mt-5 grid gap-2.5 sm:grid-cols-2">{fortalezas.map((c) => <Fortaleza key={c.id} c={c} />)}</ul></section>}{sinEvaluar.length > 0 && <p className="px-1 text-xs text-muted-2">Sin evaluar todavía: {sinEvaluar.map((c) => `${c.codigo} ${c.nombre}`).join(", ")}.</p>}</div>;
}
