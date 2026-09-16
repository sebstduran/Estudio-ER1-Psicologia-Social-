import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { clasificar, type CompetenciaDiagnostico, type ConteoLogro } from "@/lib/diagnostico";
import { Button, Card, Eyebrow } from "@/components/ui";
import { ResumenSimple } from "../resumen-simple";

const VISTAS = [
  { id: "como-vamos", texto: "Cómo vamos" },
  { id: "docentes", texto: "Qué dice el equipo" },
  { id: "decisiones", texto: "Qué hacemos" },
] as const;
type Vista = (typeof VISTAS)[number]["id"];

const PUNTAJES = [82, 74, 64, 58, 46, 68];

function conteoDe(score: number): ConteoLogro {
  if (score >= 70) return { LOGRADO: 5, EN_PROCESO: 2, INCIPIENTE: 0, NO_TRABAJADO: 0 };
  if (score >= 55) return { LOGRADO: 2, EN_PROCESO: 4, INCIPIENTE: 1, NO_TRABAJADO: 0 };
  return { LOGRADO: 1, EN_PROCESO: 3, INCIPIENTE: 3, NO_TRABAJADO: 0 };
}

function competenciaSimulada(
  competencia: { id: string; codigo: string; nombre: string; descriptor: string; indicadores: { id: string; texto: string }[] },
  index: number
): CompetenciaDiagnostico {
  const score = PUNTAJES[index % PUNTAJES.length];
  const conteo = conteoDe(score);
  const indicadorBase = competencia.indicadores[0] ?? { id: `${competencia.id}-muestra`, texto: competencia.descriptor };
  const indicador = {
    id: indicadorBase.id,
    texto: indicadorBase.texto,
    conteo,
    score,
    severidad: clasificar(score),
    disenso: false,
    comentarios: [],
  };
  return {
    id: competencia.id,
    codigo: competencia.codigo,
    nombre: competencia.nombre,
    descriptor: competencia.descriptor,
    componenteEpg: "Componente institucional",
    conteo,
    score,
    severidad: clasificar(score),
    scoreBase: Math.max(0, score - 8),
    delta: 8,
    trayectoria: [
      { numero: 1, fase: "BASE", score: Math.max(0, score - 8) },
      { numero: 2, fase: "SEGUIMIENTO", score },
    ],
    indicadores: [indicador],
    indicadorMasDebil: indicador,
    indicadoresConDisenso: 0,
    asignaturas: [],
    docentesQueEvaluaron: 3,
  };
}

function VistaDocentes() {
  return <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#12141b] p-7 text-white shadow-[0_30px_80px_-38px_rgba(14,16,20,.7)]">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(49,172,159,.26),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(178,58,74,.28),transparent_36%)]" />
      <div className="relative"><p className="font-mono text-[.68rem] tracking-[.14em] text-[#75d9ca]">PARTICIPACIÓN</p><div className="mt-6 grid h-40 w-40 place-items-center rounded-full p-3" style={{ background: "conic-gradient(#32b39f 288deg, rgba(255,255,255,.1) 0deg)" }}><div className="grid h-full w-full place-items-center rounded-full bg-[#171a22] text-center"><div><b className="font-mono text-4xl">80%</b><span className="mt-1 block text-xs text-white/50">4 de 5 docentes</span></div></div></div><h2 className="mt-6 text-2xl font-semibold">La mirada del equipo ya es consistente</h2><p className="mt-2 text-sm leading-relaxed text-white/55">Falta una respuesta para cerrar la lectura del nivel.</p></div>
    </section>
    <section className="rounded-[2rem] border border-border bg-surface/90 p-6 sm:p-7"><Eyebrow>PERCEPCIONES</Eyebrow><h2 className="mt-1 text-2xl font-semibold">Lo que aparece en clases</h2><div className="mt-5 grid gap-3">
      {[{ inicial:"PC", nombre:"Pablo Castro", asignatura:"Intervención Psicosocial con Grupos", dificultad:"Cuesta transferir la teoría a situaciones nuevas.", propuesta:"Trabajar un caso breve común entre asignaturas." },{ inicial:"CM", nombre:"Carolina Muñoz", asignatura:"Evaluación Psicométrica", dificultad:"Los fundamentos se reconocen, pero aún se conectan de forma parcial.", propuesta:"Usar ejemplos resueltos y retirar el apoyo gradualmente." }].map((voz) => <article key={voz.nombre} className="rounded-2xl border border-border bg-surface-muted/60 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground font-mono text-xs text-surface">{voz.inicial}</span><div><b className="text-sm">{voz.nombre}</b><p className="text-xs text-muted">{voz.asignatura}</p></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><p className="rounded-xl bg-incipiente-tint p-3 text-sm leading-relaxed"><span className="mb-1 block font-mono text-[.62rem] text-incipiente">DIFICULTAD</span>{voz.dificultad}</p><p className="rounded-xl bg-logrado-tint p-3 text-sm leading-relaxed"><span className="mb-1 block font-mono text-[.62rem] text-logrado">IDEA</span>{voz.propuesta}</p></div></article>)}
    </div></section>
  </div>;
}

function VistaDecisiones() {
  const acciones = [
    { numero: "01", tecnica: "Ejemplos resueltos", accion: "Modelar cómo se conectan fundamentos y decisiones antes de pedir trabajo autónomo.", razon: "El equipo observa comprensión aislada, pero dificultad para integrar." },
    { numero: "02", tecnica: "Práctica de recuperación", accion: "Abrir cada clase con tres preguntas breves sobre conceptos esenciales.", razon: "Permite detectar vacíos temprano y recuperar conocimiento previo." },
    { numero: "03", tecnica: "Instrucción entre pares", accion: "Comparar respuestas y justificar por qué una evidencia demuestra logro.", razon: "Ayuda a compartir criterios y resolver diferencias de interpretación." },
  ];
  return <div className="space-y-5"><section className="relative overflow-hidden rounded-[2rem] bg-[#12141b] p-7 text-white sm:p-9"><div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_86%_10%,rgba(178,58,74,.34),transparent_32%),radial-gradient(circle_at_10%_95%,rgba(51,179,159,.22),transparent_36%)]" /><div className="relative"><p className="font-mono text-[.68rem] tracking-[.14em] text-[#f0a4b2]">DECISIÓN DE LA REUNIÓN</p><h2 className="mt-2 text-3xl font-semibold">El nivel avanza, pero necesita integrar lo aprendido</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">La prioridad no es agregar más contenidos: es ayudar a que las y los estudiantes relacionen fundamentos, evidencia y decisiones.</p></div></section><section className="grid gap-4 lg:grid-cols-3">{acciones.map((a) => <Card key={a.numero} className="!p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#75d9ca] to-[#4f83d1] font-mono text-xs font-semibold text-[#10131a]">{a.numero}</span><p className="mt-5 font-mono text-[.65rem] font-medium uppercase tracking-[.12em] text-ua">{a.tecnica}</p><h3 className="mt-2 text-base font-semibold leading-relaxed">{a.accion}</h3><p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted">Por qué: {a.razon}</p></Card>)}</section><section className="rounded-[1.75rem] border border-logrado-line bg-logrado-tint/45 p-6"><p className="font-mono text-[.68rem] tracking-[.14em] text-logrado">ACUERDO SUGERIDO</p><div className="mt-3 flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-lg font-semibold">Aplicar un caso común durante las próximas dos semanas</h3><p className="mt-1 text-sm text-muted">Responsable: equipo docente · revisión: próxima CCAA</p></div><span className="rounded-full bg-logrado px-4 py-2 text-xs font-medium text-white">Listo para acordar</span></div></section></div>;
}

export default async function VistaPreviaResultados({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const pedida = typeof sp.vista === "string" ? sp.vista : "";
  const vista: Vista = VISTAS.some((v) => v.id === pedida) ? pedida as Vista : "como-vamos";
  const user = await requireCoordinador();
  const nivel = await prisma.nivel.findFirst({ where: { id, coordinadorId: user.id }, include: { competencias: { orderBy: { orden: "asc" }, include: { indicadores: { orderBy: { orden: "asc" } } } } } });
  if (!nivel) notFound();
  const competencias = nivel.competencias.map(competenciaSimulada);

  return <main className="product-page">
    <section className="product-hero mb-5 flex flex-wrap items-start justify-between gap-6"><div className="relative"><Eyebrow className="!text-white/45">Vista previa de resultados</Eyebrow><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Así se verá el análisis</h1><p className="mt-3 text-sm text-white/55">{nivel.nombre} · ejemplo para revisión</p></div><Link href={`/niveles/${id}`} className="relative"><Button className="!bg-white !text-[#111318] hover:!bg-white/90">Volver al nivel</Button></Link></section>
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-proceso-line bg-proceso-tint px-4 py-3.5"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-proceso font-mono text-xs font-semibold text-white">i</span><p className="text-sm leading-relaxed"><b>Esta es una demostración.</b> Usa datos simulados para que puedas revisar todo el diseño. No guarda ni cambia información del nivel.</p></div>
    <nav aria-label="Secciones de la vista previa" className="surface-glass mb-8 grid grid-cols-3 gap-1.5 rounded-2xl p-2">{VISTAS.map((item) => <Link key={item.id} href={`/niveles/${id}/resultados/vista-previa?vista=${item.id}`} aria-current={item.id === vista ? "page" : undefined} className={`rounded-xl px-3.5 py-3 text-center text-sm transition-all ${item.id === vista ? "bg-foreground font-medium text-surface shadow-sm" : "text-muted hover:bg-surface/70 hover:text-foreground"}`}>{item.texto}</Link>)}</nav>
    {vista === "como-vamos" && <ResumenSimple competencias={competencias} />}
    {vista === "docentes" && <VistaDocentes />}
    {vista === "decisiones" && <VistaDecisiones />}
  </main>;
}

export const dynamic = "force-dynamic";
