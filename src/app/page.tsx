import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";

const pasos = [
  { numero: "01", titulo: "Ubica el nivel", texto: "La malla define automáticamente sus asignaturas, ciclo y competencias esperadas." },
  { numero: "02", titulo: "Escucha al equipo", texto: "La mirada docente y el acta explican lo que los puntajes por sí solos no muestran." },
  { numero: "03", titulo: "Decide y acompaña", texto: "El análisis se convierte en acciones, responsables y seguimiento para la próxima reunión." },
] as const;

const competenciasVista = [
  { codigo: "1.1", nombre: "Fundamentar", valor: 58 },
  { codigo: "2.1", nombre: "Investigar", valor: 76 },
  { codigo: "3.1", nombre: "Evaluar", valor: 43 },
  { codigo: "4.1", nombre: "Analizar", valor: 68 },
  { codigo: "5.1", nombre: "Intervenir", valor: 84 },
  { codigo: "6.1", nombre: "Autoexplorar", valor: 51 },
] as const;

export default async function PortadaPage() {
  const session = await auth();
  const nombre = session?.user?.name?.split(" ")[0] ?? null;

  return (
    <div className="landing min-h-screen overflow-x-hidden bg-white text-[#111318]">
      <header className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" aria-label="Inicio" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-black/10 bg-white shadow-sm">
            <Image src="/logo-ua.png" alt="" width={38} height={30} className="h-auto w-8" priority />
          </span>
          <span className="hidden text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.13em] text-black/55 sm:block">
            Universidad Autónoma<br />de Chile
          </span>
        </Link>
        <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.16em] text-black/40">Psicología · Evidencia para decidir</span>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.02fr_.98fr] lg:px-10 lg:py-24">
          <div className="max-w-2xl animate-fade-in">
            <p className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#9e1b32]">
              <span className="h-px w-8 bg-current" /> Comunidades Académicas · Psicología
            </p>
            <h1 className="text-[clamp(3.4rem,7.2vw,7rem)] font-semibold leading-[0.91] tracking-[-0.065em]">
              Del nivel que tenemos<br /><span className="text-black/28">al logro que buscamos.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-black/58 sm:text-xl">
              Competencias de ciclo, voz docente y actas reunidas en una visión clara: cómo está el curso, qué reforzar y cómo hacerlo.
            </p>
            <a href="#como-funciona" className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#111318] px-6 py-3.5 text-sm font-medium text-white shadow-[0_12px_32px_-14px_rgba(17,19,24,.6)] transition hover:-translate-y-0.5 hover:bg-[#9e1b32] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9e1b32]">
              Ver cómo funciona <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]" aria-label="Ejemplo visual del avance de seis competencias">
            <div aria-hidden="true" className="absolute -inset-12 rounded-full bg-[radial-gradient(circle_at_24%_24%,rgba(158,27,50,.16),transparent_42%),radial-gradient(circle_at_80%_82%,rgba(39,167,125,.13),transparent_38%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#111318] p-7 text-white shadow-[0_38px_90px_-42px_rgba(17,19,24,.72)] sm:p-9">
              <div aria-hidden="true" className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#9e1b32]/20 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/42">Ejemplo de lectura · Ciclo Inicial</p>
                  <p className="mt-2 text-xl font-medium">El nivel aún no alcanza la meta</p>
                </div>
                <span className="shrink-0 rounded-full border border-[#d7a536]/30 bg-[#d7a536]/12 px-3 py-1 text-[0.65rem] text-[#f1cf7a]">En riesgo</span>
              </div>
              <div className="relative mt-7 grid grid-cols-[auto_1fr] items-end gap-5 border-b border-white/10 pb-6">
                <div><p className="font-mono text-5xl font-semibold tracking-[-.07em]">63<span className="text-lg font-normal text-white/35">/100</span></p><p className="mt-1 text-xs text-white/45">promedio del nivel</p></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-white/[.05] px-3 py-2.5"><p className="font-mono text-lg font-semibold text-[#70d1ac]">2 de 6</p><p className="mt-0.5 text-[.62rem] text-white/40">logradas</p></div>
                  <div className="rounded-xl border border-white/10 bg-white/[.05] px-3 py-2.5"><p className="font-mono text-lg font-semibold text-[#f1cf7a]">−7</p><p className="mt-0.5 text-[.62rem] text-white/40">para la meta</p></div>
                </div>
              </div>
              <div className="relative mt-6 space-y-3.5">
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-[.6rem] uppercase tracking-[.12em] text-white/35"><span>Competencia</span><span>Hoy · Meta 70</span></div>
                {competenciasVista.map((competencia) => {
                  const lograda = competencia.valor >= 70;
                  const color = lograda ? "#35a77d" : "#d7a536";
                  return (
                    <div key={competencia.codigo} className="grid grid-cols-[6.8rem_1fr_2rem] items-center gap-3">
                      <div className="min-w-0"><p className="truncate text-xs font-medium">{competencia.nombre}</p><p className="font-mono text-[.55rem] text-white/30">{competencia.codigo}</p></div>
                      <div className="relative h-2.5 rounded-full bg-white/[.08] ring-1 ring-inset ring-white/[.06]">
                        <span aria-hidden="true" className="absolute -top-1 bottom-[-4px] z-10 border-l border-dashed border-white/45" style={{ left: "70%" }} />
                        <span className="block h-full rounded-full" style={{ width: `${competencia.valor}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, boxShadow: `0 0 14px ${color}55` }} />
                      </div>
                      <span className="text-right font-mono text-xs font-semibold tabular-nums" style={{ color }}>{competencia.valor}</span>
                    </div>
                  );
                })}
              </div>
              <div className="relative mt-7 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.055] px-4 py-3.5">
                <div><p className="font-mono text-[.58rem] uppercase tracking-[.13em] text-[#f1cf7a]">Primera prioridad</p><p className="mt-1 text-sm font-medium">Evaluar · faltan 27 puntos</p></div>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d7a536] text-lg text-[#17130a]" aria-hidden="true">↗</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/8 bg-[#f6f5f3] px-6 py-7">
          <p className="mx-auto max-w-7xl text-center text-xs font-medium uppercase tracking-[0.17em] text-black/38">
            Malla y competencias oficiales <span className="mx-3 text-[#9e1b32]">·</span> Voz docente <span className="mx-3 text-[#9e1b32]">·</span> Actas de CCAA <span className="mx-3 text-[#9e1b32]">·</span> Decisiones con seguimiento
          </p>
        </section>

        <section id="como-funciona" className="mx-auto w-full max-w-7xl scroll-mt-8 px-6 py-24 lg:px-10 lg:py-32">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9e1b32]">Una ruta guiada</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">De la evidencia a una mejor decisión.</h2>
          </div>
          <ol className="mt-16 grid gap-px overflow-hidden rounded-[1.75rem] border border-black/10 bg-black/10 md:grid-cols-3">
            {pasos.map((paso) => (
              <li key={paso.numero} className="group min-h-72 bg-white p-8 transition-colors hover:bg-[#f6f5f3] sm:p-10">
                <span className="font-mono text-xs text-[#9e1b32]">{paso.numero}</span>
                <h3 className="mt-20 text-2xl font-semibold tracking-[-0.035em]">{paso.titulo}</h3>
                <p className="mt-4 max-w-xs leading-relaxed text-black/52">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-6 pb-24 lg:px-10 lg:pb-32">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#111318] px-7 py-14 text-white sm:px-12 lg:px-16 lg:py-20">
            <div className="grid items-end gap-12 lg:grid-cols-[1fr_1.05fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Comenzar</p>
                <h2 className="mt-4 max-w-lg text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Entra por la puerta que te corresponde.</h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-white/52">La CC.AA existe para acordar cómo enseñar, evaluar y acompañar mejor al nivel. La coordinación conduce; el equipo docente aporta su mirada sin cuenta ni correo.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href={nombre ? "/niveles" : "/login"} className="group rounded-2xl bg-white p-6 text-[#111318] transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  <span className="text-lg font-semibold">Coordinación</span>
                  <span className="mt-8 flex items-end justify-between gap-3 text-sm text-black/50">{nombre ? `Continuar como ${nombre}` : "Ingresar con mi cuenta"}<span className="text-xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></span>
                </Link>
                <Link href="/docente" className="group rounded-2xl border border-white/16 bg-white/[.06] p-6 transition hover:-translate-y-1 hover:bg-white/[.1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  <span className="text-lg font-semibold">Docente</span>
                  <span className="mt-8 flex items-end justify-between gap-3 text-sm text-white/48">Elegir mi nombre y responder<span className="text-xl text-white transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col justify-between gap-3 border-t border-black/8 px-6 py-8 text-xs text-black/38 sm:flex-row lg:px-10">
        <span>Universidad Autónoma de Chile · Carrera de Psicología</span>
        <span>Instrumento de Comunidades Académicas</span>
      </footer>
    </div>
  );
}
