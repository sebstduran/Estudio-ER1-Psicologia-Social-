import Link from "next/link";
import { requireCoordinador } from "@/lib/require-coordinador";
import { resumenNiveles, type ResumenNivel } from "@/lib/panel";
import { Button, Card } from "@/components/ui";
import { NuevoNivelPanel } from "./nuevo-nivel-panel";
import { EnlaceDocentes } from "./[id]/enlace-docentes";

const FASE_LABEL = { BASE: "línea base", SEGUIMIENTO: "seguimiento", CIERRE: "cierre" } as const;
const ETAPAS = [
  { numero: 1, titulo: "Preparar", apoyo: "Nivel y equipo" },
  { numero: 2, titulo: "Responder", apoyo: "Enlace docente" },
  { numero: 3, titulo: "Subir acta", apoyo: "Evidencia de reunión" },
  { numero: 4, titulo: "Resultados", apoyo: "Análisis y acciones" },
] as const;

function siguientePaso(nivel: ResumenNivel) {
  if (nivel.pasoConfiguracion < 5) return { numero: "01", titulo: "Prepara la comunidad", ayuda: "Define nivel, asignaturas, docentes y competencias.", boton: "Continuar preparando", href: `/niveles/${nivel.id}` };
  if (!nivel.evaluado) return { numero: "02", titulo: "Recibe las respuestas", ayuda: "Comparte el enlace. El equipo docente solo tendrá que responder.", boton: "Ver enlace para docentes", href: `/niveles/${nivel.id}` };
  if (!nivel.actaSubida) return { numero: "03", titulo: "Sube el acta", ayuda: "Une el registro de la reunión con las respuestas del equipo.", boton: "Subir acta de la reunión", href: `/niveles/${nivel.id}` };
  return { numero: "04", titulo: "Revisa los resultados", ayuda: "Ya está todo listo: conoce cómo está el nivel y qué conviene reforzar.", boton: "Ver análisis del nivel", href: `/niveles/${nivel.id}/resultados` };
}

function prioridad(niveles: ResumenNivel[]) {
  return [...niveles].sort((a, b) => {
    const estado = (n: ResumenNivel) => n.pasoConfiguracion < 5 ? 0 : !n.evaluado ? 1 : !n.actaSubida ? 2 : 3;
    return estado(a) - estado(b);
  })[0];
}

function NivelPrincipal({ nivel }: { nivel: ResumenNivel }) {
  const paso = siguientePaso(nivel);
  const etapaActual = nivel.pasoConfiguracion < 5 ? 1 : !nivel.evaluado ? 2 : !nivel.actaSubida ? 3 : 4;
  const criticas = nivel.severidades.CRITICO;
  const enRiesgo = nivel.severidades.EN_RIESGO;
  return (
    <>
      <nav aria-label="Proceso de coordinación" className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ETAPAS.map((etapa) => {
          const completa = etapa.numero < etapaActual;
          const activa = etapa.numero === etapaActual;
          return <div key={etapa.numero} aria-current={activa ? "step" : undefined} className={`rounded-2xl border p-4 ${activa ? "border-transparent bg-[#111318] text-white shadow-lg" : completa ? "border-logrado-line bg-logrado-tint" : "border-border bg-surface text-muted-2"}`}><div className="flex items-center justify-between"><span className="font-mono text-xs font-semibold">{completa ? "✓" : `0${etapa.numero}`}</span>{activa && <span className="h-2 w-2 rounded-full bg-ua" />}</div><p className="mt-5 text-sm font-semibold">{etapa.titulo}</p><p className={`mt-0.5 text-xs ${activa ? "text-white/50" : "text-muted-2"}`}>{etapa.apoyo}</p></div>;
        })}
      </nav>

      <section aria-labelledby="siguiente-paso" className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-6 shadow-[0_24px_70px_-42px_rgba(31,20,25,0.38)] sm:p-9">
        <div aria-hidden="true" className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-ua-tint blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-end">
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.16em] text-ua">TU SIGUIENTE PASO</p>
          <div className="mt-5 flex items-start gap-4"><span className="font-mono text-5xl font-semibold tracking-[-0.08em] text-ua/30 sm:text-6xl">{paso.numero}</span><div><p className="text-sm text-muted">{nivel.nombre} · R{nivel.reunionNumero} · {FASE_LABEL[nivel.reunionFase as keyof typeof FASE_LABEL]}</p><h1 id="siguiente-paso" className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{paso.titulo}</h1><p className="mt-3 max-w-lg text-[0.975rem] leading-relaxed text-muted">{paso.ayuda}</p></div></div>
          {etapaActual !== 2 && <Link href={paso.href} className="mt-7 inline-block"><Button size="md">{paso.boton} <span aria-hidden="true">→</span></Button></Link>}
        </div>
        {etapaActual === 2 ? (
          <div className="rounded-2xl border border-border bg-background/75 p-5 backdrop-blur-sm"><EnlaceDocentes nivelId={nivel.id} codigo={nivel.codigo} compacto /><p className="mt-3 text-xs leading-relaxed text-muted-2">Cópialo y envíalo por correo o WhatsApp. El docente entra directamente a responder.</p></div>
        ) : (
          <div className="rounded-2xl border border-border bg-background/75 p-5 backdrop-blur-sm"><p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-2">En esta reunión</p>{nivel.evaluado ? <><p className="mt-3 text-3xl font-semibold tracking-tight">{criticas + enRiesgo}<span className="ml-1 text-base font-normal text-muted">por fortalecer</span></p><div className="mt-4 flex gap-5 text-sm"><span><b className="font-mono text-incipiente">{criticas}</b> crítico</span><span><b className="font-mono text-proceso">{enRiesgo}</b> en riesgo</span></div></> : <><p className="mt-3 text-3xl font-semibold tracking-tight">{nivel.docentesQueRespondieron} de {nivel.docentes}</p><p className="mt-1 text-sm text-muted">docentes han respondido</p></>}</div>
        )}
      </div>
      </section>
    </>
  );
}

function NivelCompacto({ nivel }: { nivel: ResumenNivel }) {
  const paso = siguientePaso(nivel);
  return <Link href={paso.href} className="group block"><Card interactive className="flex flex-wrap items-center justify-between gap-4 !p-5"><div><p className="text-xs text-muted-2">R{nivel.reunionNumero} · {FASE_LABEL[nivel.reunionFase as keyof typeof FASE_LABEL]}</p><h2 className="mt-1 text-lg font-medium">{nivel.nombre}</h2><p className="mt-1 text-sm text-muted">{paso.titulo}</p></div><span className="text-sm font-medium text-ua transition-transform group-hover:translate-x-0.5">Continuar →</span></Card></Link>;
}

export default async function NivelesPage() {
  const user = await requireCoordinador();
  const niveles = await resumenNiveles(user.id);
  const principal = niveles.length > 0 ? prioridad(niveles) : null;
  const restantes = niveles.filter((n) => n.id !== principal?.id);
  return <main className="product-page"><header className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ua">Hola, {user.name?.split(" ")[0] ?? ""}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Tu comunidad académica</h1><p className="mt-3 text-base text-muted">Aquí siempre verás una sola prioridad: lo siguiente que debes hacer.</p></div>{niveles.length > 0 && <NuevoNivelPanel />}</header>{principal ? <><NivelPrincipal nivel={principal} />{restantes.length > 0 && <section className="mt-12" aria-labelledby="otros-niveles"><div className="mb-5 flex items-center justify-between"><h2 id="otros-niveles" className="text-xl font-semibold">Otros niveles</h2><span className="font-mono text-xs text-muted">{restantes.length}</span></div><div className="grid gap-4 md:grid-cols-2">{restantes.map((n) => <NivelCompacto key={n.id} nivel={n} />)}</div></section>}</> : <Card className="flex flex-col items-start gap-6 !rounded-[2rem] !p-8 sm:!p-12"><p className="font-mono text-xs font-medium tracking-[0.16em] text-ua">PRIMER PASO</p><div><h2 className="text-3xl font-semibold tracking-[-0.04em]">Crea el nivel que vas a acompañar</h2><p className="mt-3 max-w-xl text-base leading-relaxed text-muted">Elige la jornada y el nivel. Las asignaturas, competencias y reuniones se cargarán automáticamente.</p></div><NuevoNivelPanel abiertoPorDefecto /></Card>}</main>;
}

export const dynamic = "force-dynamic";
