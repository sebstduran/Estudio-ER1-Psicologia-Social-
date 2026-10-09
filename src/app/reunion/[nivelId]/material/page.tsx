import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { construirDiagnostico, type CompetenciaDiagnostico, type Severidad } from "@/lib/diagnostico";
import { informeVigente } from "@/lib/actions/informe";
import type { TipoInforme } from "@/lib/ai/informe";
import { HITO_CICLO, NOMBRE_CICLO, type CicloMalla } from "@/lib/malla-psicologia";
import { AccionesMaterial, type CompetenciaParaExportar } from "./acciones-material";

const META = 70;

const ESTADO: Record<Severidad, string> = {
  CRITICO: "Crítico",
  EN_RIESGO: "En riesgo",
  CONSOLIDADO: "Logrado",
  SIN_DATOS: "Sin evaluar",
};

const COLOR: Record<Severidad, string> = {
  CRITICO: "#d64a63",
  EN_RIESGO: "#d7a536",
  CONSOLIDADO: "#35a77d",
  SIN_DATOS: "#777f8b",
};

function BrechaVisual({ competencia }: { competencia: CompetenciaDiagnostico }) {
  const score = Math.round(competencia.score ?? 0);
  const color = COLOR[competencia.severidad];
  return (
    <li className="grid grid-cols-[minmax(6rem,1fr)_minmax(7rem,1.4fr)_3rem] items-center gap-2 sm:grid-cols-[minmax(9rem,1.15fr)_minmax(13rem,2fr)_4rem] sm:gap-4">
      <div className="min-w-0">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/42">{competencia.codigo}</p>
        <p className="truncate text-sm font-semibold text-white/82">{competencia.nombre}</p>
      </div>
      <div className="relative h-3 rounded-full bg-white/10">
        <span className="absolute -top-1.5 h-6 border-l border-dashed border-white/45" style={{ left: `${META}%` }} aria-hidden="true" />
        <span className="block h-full rounded-full" style={{ width: `${Math.max(score, 2)}%`, backgroundColor: color }} />
      </div>
      <span className="text-right font-mono text-xl font-semibold tabular-nums" style={{ color }}>{competencia.score === null ? "—" : score}</span>
    </li>
  );
}

function TablaCompetencias({ competencias }: { competencias: CompetenciaDiagnostico[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#dfe1e8] bg-white">
      <div className="hidden grid-cols-[minmax(8rem,.9fr)_5rem_6rem_minmax(14rem,2fr)] gap-3 border-b border-[#dfe1e8] bg-[#f5f6f8] px-5 py-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-[#6d7480] sm:grid">
        <span>Competencia</span><span>Puntaje</span><span>Estado</span><span>Lectura principal</span>
      </div>
      {competencias.map((competencia) => {
        const score = competencia.score === null ? null : Math.round(competencia.score);
        const foco = competencia.indicadorMasDebil?.texto ?? "Aún no hay evidencia suficiente para precisar el foco.";
        return (
          <div key={competencia.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-b border-[#eceef2] px-5 py-3.5 last:border-b-0 sm:grid-cols-[minmax(8rem,.9fr)_5rem_6rem_minmax(14rem,2fr)] sm:gap-3">
            <div className="min-w-0"><span className="font-mono text-[0.64rem] font-semibold text-[#777e89]">{competencia.codigo}</span><p className="truncate text-sm font-semibold text-[#17191f]">{competencia.nombre}</p></div>
            <span className="font-mono text-xl font-semibold tabular-nums text-[#17191f]">{score ?? "—"}</span>
            <span className="col-start-2 row-start-2 text-right text-xs font-semibold sm:col-start-auto sm:row-start-auto sm:text-left" style={{ color: COLOR[competencia.severidad] }}>{ESTADO[competencia.severidad]}</span>
            <p className="col-span-2 row-start-3 mt-2 line-clamp-2 text-xs leading-relaxed text-[#5f6671] sm:col-span-1 sm:row-start-auto sm:mt-0">{foco}</p>
          </div>
        );
      })}
    </div>
  );
}

export default async function MaterialReunionPage({
  params,
}: {
  params: Promise<{ nivelId: string }>;
}) {
  const { nivelId } = await params;
  const user = await requireCoordinador();
  const diagnostico = await construirDiagnostico(nivelId, user.id);
  if (!diagnostico) notFound();
  if (!diagnostico.reunionActual || diagnostico.totalVotos === 0) redirect(`/niveles/${nivelId}`);

  const [informe, totalActas] = await Promise.all([
    informeVigente(nivelId, diagnostico.reunionActual.id),
    prisma.acta.count({ where: { reunionId: diagnostico.reunionActual.id } }),
  ]);
  const contenido = informe?.estado === "LISTO" ? (informe.contenido as TipoInforme) : null;
  const conDatos = diagnostico.competencias.filter((c) => c.score !== null);
  const promedio = conDatos.length > 0
    ? Math.round(conDatos.reduce((total, competencia) => total + (competencia.score ?? 0), 0) / conDatos.length)
    : 0;
  const logradas = conDatos.filter((c) => c.severidad === "CONSOLIDADO").length;
  const porTrabajar = conDatos
    .filter((c) => c.severidad !== "CONSOLIDADO")
    .toSorted((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const veredicto = porTrabajar.length === 0
    ? "El nivel alcanzó lo esperado"
    : diagnostico.resumen.criticas > 0
      ? "El nivel todavía no alcanza lo esperado"
      : "El nivel avanza, pero aún falta";
  const ciclo = NOMBRE_CICLO[diagnostico.nivel.ciclo as CicloMalla];
  const reunion = `Reunión ${diagnostico.reunionActual.numero}`;
  const competenciasExportables: CompetenciaParaExportar[] = diagnostico.competencias.map((competencia) => ({
    codigo: competencia.codigo,
    nombre: competencia.nombre,
    score: competencia.score,
    estado: ESTADO[competencia.severidad],
    brecha: competencia.score === null ? null : Math.max(0, META - Math.round(competencia.score)),
    cambio: competencia.delta,
    foco: competencia.indicadorMasDebil?.texto ?? "Sin evidencia suficiente",
    docentesQueEvaluaron: competencia.docentesQueEvaluaron,
    docentesEsperados: competencia.docentesEsperados,
    indicadores: competencia.indicadores.map((indicador) => ({
      texto: indicador.texto,
      score: indicador.score,
      estado: ESTADO[indicador.severidad],
      disenso: indicador.disenso,
    })),
  }));
  const decisiones = contenido?.competencias
    .filter((competencia) => competencia.decisionEpg?.decision)
    .slice(0, 3) ?? [];

  return (
    <div className="min-h-screen bg-[#e9ebf0] text-[#111318]">
      <style>{`
        @page { size: 13.333in 7.5in; margin: 0; }
        @media print {
          html, body { background: white !important; }
          .report-toolbar, .report-back { display: none !important; }
          .report-deck { display: block !important; padding: 0 !important; }
          .report-slide { width: 13.333in !important; height: 7.5in !important; min-height: 7.5in !important; margin: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; break-after: page; page-break-after: always; }
          .report-slide:last-child { break-after: auto; page-break-after: auto; }
        }
      `}</style>
      <AccionesMaterial
        nombreNivel={diagnostico.nivel.nombre}
        reunion={reunion}
        ciclo={ciclo}
        promedio={promedio}
        meta={META}
        logradas={logradas}
        veredicto={veredicto}
        competencias={competenciasExportables}
      />

      <div className="report-back mx-auto flex max-w-7xl px-5 pt-5 sm:px-8">
        <Link href={`/niveles/${nivelId}/resultados`} className="text-sm font-medium text-[#606773] hover:text-[#111318]">← Volver a los resultados</Link>
      </div>

      <main className="report-deck mx-auto flex max-w-7xl flex-col gap-8 p-5 sm:p-8">
        <section className="report-slide relative overflow-hidden rounded-[2.25rem] bg-[#11131a] p-6 text-white shadow-[0_36px_100px_-56px_rgba(17,19,26,.85)] sm:p-10 lg:aspect-video lg:p-14">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(178,58,74,.46),transparent_34%),radial-gradient(circle_at_8%_92%,rgba(49,92,146,.44),transparent_38%)]" />
          <div className="relative flex h-full flex-col">
            <header className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex items-center gap-4"><span className="grid h-20 w-28 place-items-center rounded-2xl bg-white p-2"><Image src="/logo-ua.png" width={96} height={74} alt="Universidad Autónoma de Chile" className="max-h-16 w-auto object-contain" priority /></span><span className="h-10 border-l border-white/16" /><div><p className="font-mono text-[0.66rem] font-semibold tracking-[0.15em] text-[#f0a4b2]">COMUNIDADES ACADÉMICAS</p><p className="mt-1 text-xs text-white/48">Psicología</p></div></div>
              <p className="text-left text-sm text-white/50 sm:text-right">{diagnostico.nivel.nombre}<br />{reunion} · {diagnostico.nivel.modalidad}</p>
            </header>

            <div className="mt-10 grid flex-1 gap-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-12">
              <div className="flex flex-col justify-center">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#f0a4b2]">RESULTADO DEL NIVEL</p>
                <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-.045em] sm:text-5xl">{veredicto}</h1>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/62">{contenido?.sintesis ?? `${logradas} de ${conDatos.length} competencias evaluadas alcanzaron la referencia del ciclo. El foco debe ponerse en las competencias con mayor brecha.`}</p>
                <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/12 bg-white/[.07] p-4"><span className="block font-mono text-3xl font-semibold">{promedio}</span><span className="mt-1 block text-xs text-white/48">promedio</span></div>
                  <div className="rounded-2xl border border-white/12 bg-white/[.07] p-4"><span className="block font-mono text-3xl font-semibold">{META}</span><span className="mt-1 block text-xs text-white/48">meta del ciclo</span></div>
                  <div className="rounded-2xl border border-white/12 bg-white/[.07] p-4"><span className="block font-mono text-3xl font-semibold">{logradas}/{conDatos.length}</span><span className="mt-1 block text-xs text-white/48">logradas</span></div>
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-[2rem] border border-white/10 bg-white/[.055] p-7 backdrop-blur-sm">
                <div className="flex items-end justify-between"><div><p className="font-mono text-[0.65rem] font-semibold tracking-[.13em] text-white/42">COMPETENCIAS</p><h2 className="mt-1 text-2xl font-semibold">Distancia a la meta</h2></div><span className="text-xs text-white/42">Línea = 70</span></div>
                <ol className="mt-7 flex flex-col gap-5">
                  {conDatos.map((competencia) => <BrechaVisual key={competencia.id} competencia={competencia} />)}
                </ol>
              </div>
            </div>
            <footer className="mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/38"><span>{ciclo} · {HITO_CICLO[diagnostico.nivel.ciclo as CicloMalla]}</span><span>{diagnostico.totalVotos} respuestas docentes · {totalActas} {totalActas === 1 ? "acta" : "actas"}</span></footer>
          </div>
        </section>

        <section className="report-slide overflow-hidden rounded-[2.25rem] bg-[#f9f9fb] p-6 shadow-[0_36px_100px_-62px_rgba(17,19,26,.55)] sm:p-10 lg:aspect-video lg:p-14">
          <div className="flex h-full flex-col">
            <header><p className="font-mono text-xs font-semibold tracking-[.15em] text-[#b23a4a]">LOS DATOS</p><div className="mt-2 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end sm:gap-8"><h2 className="text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Competencia por competencia</h2><p className="max-w-sm text-left text-sm leading-relaxed text-[#6a717c] sm:text-right">El puntaje va de 0 a 100. La meta institucional está en 70.</p></div></header>
            <div className="mt-8 flex-1"><TablaCompetencias competencias={diagnostico.competencias} /></div>
            <footer className="mt-5 flex justify-between text-xs text-[#7a818c]"><span>{diagnostico.nivel.nombre} · {reunion}</span><span>Los colores siempre se acompañan de puntaje y palabra.</span></footer>
          </div>
        </section>

        <section className="report-slide overflow-hidden rounded-[2.25rem] bg-white p-6 shadow-[0_36px_100px_-62px_rgba(17,19,26,.55)] sm:p-10 lg:aspect-video lg:p-14">
          <div className="flex h-full flex-col">
            <header><p className="font-mono text-xs font-semibold tracking-[.15em] text-[#b23a4a]">QUÉ SIGNIFICA</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Dónde conviene concentrar el trabajo</h2></header>
            <div className="mt-8 grid flex-1 gap-8 lg:grid-cols-[.72fr_1.28fr]">
              <aside className="rounded-[2rem] bg-[#11131a] p-7 text-white"><p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[.14em] text-[#75d9ca]">CÓMO LEERLO</p><p className="mt-4 text-xl font-semibold leading-snug">La brecha no indica cuánto contenido falta.</p><p className="mt-4 text-sm leading-[1.75] text-white/58">Muestra la distancia entre el juicio actual del equipo docente y el logro esperado del ciclo. Una brecha grande orienta la conversación hacia la evidencia más débil.</p><div className="mt-7 border-t border-white/10 pt-5"><p className="text-xs leading-relaxed text-white/48">Si aparece disenso, primero hay que acordar el criterio entre docentes antes de cambiar la enseñanza.</p></div></aside>
              <ol className="grid gap-4">
                {porTrabajar.slice(0, 3).map((competencia, indice) => (
                  <li key={competencia.id} className="grid grid-cols-[3.2rem_1fr_auto] items-start gap-4 rounded-3xl border border-[#e1e3e8] bg-[#fafafd] p-5">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl font-mono text-sm font-semibold text-white" style={{ backgroundColor: COLOR[competencia.severidad] }}>0{indice + 1}</span>
                    <div><p className="font-mono text-[0.64rem] font-semibold text-[#777e89]">{competencia.codigo} · {ESTADO[competencia.severidad]}</p><h3 className="mt-1 text-lg font-semibold">{competencia.nombre}</h3><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#656c77]">{competencia.indicadorMasDebil?.texto ?? "Aún falta evidencia para definir un foco preciso."}</p></div>
                    <div className="text-right"><span className="font-mono text-2xl font-semibold" style={{ color: COLOR[competencia.severidad] }}>−{Math.max(0, META - Math.round(competencia.score ?? 0))}</span><span className="block text-[0.62rem] uppercase tracking-wider text-[#868c95]">puntos</span></div>
                  </li>
                ))}
                {porTrabajar.length === 0 && <li className="rounded-3xl border border-[#b8ded2] bg-[#edf8f4] p-6 text-lg font-semibold text-[#147354]">Todas las competencias evaluadas alcanzaron la referencia. El desafío es sostener y transferir estos logros.</li>}
              </ol>
            </div>
          </div>
        </section>

        <section className="report-slide relative overflow-hidden rounded-[2.25rem] bg-[#11131a] p-6 text-white shadow-[0_36px_100px_-56px_rgba(17,19,26,.85)] sm:p-10 lg:aspect-video lg:p-14">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_90%_5%,rgba(49,172,159,.24),transparent_32%),radial-gradient(circle_at_10%_95%,rgba(178,58,74,.3),transparent_38%)]" />
          <div className="relative flex h-full flex-col">
            <header><p className="font-mono text-xs font-semibold tracking-[.15em] text-[#75d9ca]">QUÉ HACER</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Decisiones para llevar a la reunión</h2></header>
            {contenido ? (
              <div className="mt-8 grid flex-1 gap-8 lg:grid-cols-[.72fr_1.28fr]">
                <div className="rounded-[2rem] border border-white/10 bg-white/[.055] p-7"><p className="font-mono text-[0.65rem] font-semibold tracking-[.13em] text-white/42">LECTURA DEL EQUIPO</p><p className="mt-4 text-xl font-medium leading-[1.6] text-white/88">{contenido.sintesis}</p></div>
                <ol className="grid gap-4">
                  {(decisiones.length > 0 ? decisiones : contenido.prioridades.slice(0, 3).map((prioridad, indice) => ({ codigo: `0${indice + 1}`, nombre: "Prioridad", decisionEpg: { componente: "Acuerdo del equipo", decision: prioridad } }))).map((decision, indice) => (
                    <li key={`${decision.codigo}-${indice}`} className="grid grid-cols-[3rem_1fr] gap-4 rounded-3xl border border-white/10 bg-white/[.065] p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#75d9ca] to-[#4f83d1] font-mono text-xs font-semibold text-[#11131a]">0{indice + 1}</span><div><p className="font-mono text-[0.63rem] font-semibold uppercase tracking-[.11em] text-[#75d9ca]">{decision.decisionEpg.componente}</p><p className="mt-2 text-base font-medium leading-relaxed text-white/88">{decision.decisionEpg.decision}</p></div></li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="mt-10 flex flex-1 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[.055] p-10 text-center"><div><p className="text-3xl font-semibold">El diagnóstico ya está listo.</p><p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/58">Genera las recomendaciones desde “Qué hacemos” para sumar a este material las acciones pedagógicas específicas basadas en las respuestas docentes y el acta.</p></div></div>
            )}
            <footer className="mt-6 border-t border-white/10 pt-4 text-xs text-white/38">Estas propuestas orientan la conversación. El acuerdo final debe quedar con responsable, plazo y evidencia para revisar.</footer>
          </div>
        </section>
      </main>
    </div>
  );
}

export const dynamic = "force-dynamic";
