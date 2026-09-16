import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";

const pasos = [
  { numero: "01", titulo: "Prepara", texto: "Elige el nivel. La malla carga asignaturas y competencias." },
  { numero: "02", titulo: "Escucha", texto: "Comparte el enlace y suma el acta de la reunión." },
  { numero: "03", titulo: "Decide", texto: "Ve fortalezas, brechas y una acción concreta para avanzar." },
] as const;

const competenciasVista = [
  { codigo: "1.1", nombre: "Fundamentar", valor: 58 },
  { codigo: "2.1", nombre: "Investigar", valor: 76 },
  { codigo: "3.1", nombre: "Evaluar", valor: 43 },
  { codigo: "4.1", nombre: "Analizar", valor: 68 },
  { codigo: "5.1", nombre: "Intervenir", valor: 84 },
  { codigo: "6.1", nombre: "Autoexplorar", valor: 51 },
] as const;

const resultados = [
  { rotulo: "Cómo está", texto: "Una lectura del nivel frente a las competencias de su ciclo.", marca: "63/100" },
  { rotulo: "Qué reforzar", texto: "La evidencia más débil, ordenada para decidir por dónde comenzar.", marca: "3 focos" },
  { rotulo: "Cómo avanzar", texto: "Ideas pedagógicas justificadas y acuerdos con seguimiento.", marca: "1 ruta" },
] as const;

export default async function PortadaPage() {
  const session = await auth();
  const nombre = session?.user?.name?.split(" ")[0] ?? null;
  const rutaCoordinacion = nombre ? "/niveles" : "/login";

  return (
    <div className="landing-premium min-h-screen overflow-x-hidden bg-[#f4f3f0] text-[#111318]">
      <header className="relative z-30 mx-auto flex h-20 w-full max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Inicio" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-black/8 bg-white shadow-[0_10px_30px_-18px_rgba(17,19,24,.35)]">
            <Image src="/logo-ua.png" alt="" width={38} height={30} className="h-auto w-8" priority />
          </span>
          <span className="text-sm font-semibold tracking-[-.02em] sm:text-[.95rem]">Comunidades Académicas</span>
        </Link>
        <span className="hidden font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-black/42 md:block">
          Psicología · Universidad Autónoma de Chile
        </span>
      </header>

      <main>
        <section className="px-3 sm:px-5 lg:px-7">
          <div className="hero-cinematic relative mx-auto min-h-[calc(100svh-6rem)] max-w-[90rem] overflow-hidden rounded-[2rem] bg-[#17181d] text-white sm:rounded-[2.6rem]">
            <Image
              src="/campus-comunidad.jpg"
              alt="Grupo universitario dialogando en un espacio de aprendizaje"
              fill
              priority
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="hero-cinematic-media object-cover object-[58%_center]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,14,18,.94)_0%,rgba(12,14,18,.78)_35%,rgba(12,14,18,.24)_70%,rgba(12,14,18,.1)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(12,14,18,.78)_0%,transparent_45%)]" />
            <div aria-hidden="true" className="hero-light-orb absolute -left-20 top-12 h-80 w-80 rounded-full bg-[#9e1b32]/28 blur-3xl" />

            <div className="relative z-10 grid min-h-[calc(100svh-6rem)] items-end gap-10 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.06fr_.94fr] lg:items-center lg:px-14 lg:py-14 xl:px-20">
              <div className="max-w-3xl animate-fade-in">
                <p className="mb-6 flex items-center gap-3 text-[.68rem] font-semibold uppercase tracking-[0.18em] text-white/65">
                  <span className="h-px w-8 bg-[#e16a7e]" /> Evidencia para decidir mejor
                </p>
                <h1 className="max-w-3xl text-[clamp(3.2rem,6.8vw,7rem)] font-semibold leading-[.9] tracking-[-.065em]">
                  Escuchar al nivel.<br /><span className="text-white/46">Mover el aprendizaje.</span>
                </h1>
                <p className="mt-7 max-w-xl text-base leading-relaxed text-white/68 sm:text-lg">
                  Competencias, voz docente y actas convertidas en una respuesta clara: qué fortalecer y qué hacer ahora.
                </p>

                <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
                  <Link href={rutaCoordinacion} className="group rounded-2xl bg-white px-5 py-4 text-[#111318] shadow-[0_18px_50px_-25px_rgba(0,0,0,.6)] transition duration-300 hover:-translate-y-1 hover:bg-[#fffafa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                    <span className="flex items-center justify-between gap-4 text-sm font-semibold">
                      Soy coordinador/a <span className="text-xl text-[#9e1b32] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </span>
                    <span className="mt-1 block text-xs text-black/48">{nombre ? `Continuar como ${nombre}` : "Preparar y analizar mi nivel"}</span>
                  </Link>
                  <Link href="/docente" className="liquid-glass group rounded-2xl px-5 py-4 transition duration-300 hover:-translate-y-1 hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                    <span className="flex items-center justify-between gap-4 text-sm font-semibold text-white">
                      Soy docente <span className="text-xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </span>
                    <span className="mt-1 block text-xs text-white/50">Entrar con el enlace o código</span>
                  </Link>
                </div>
              </div>

              <div className="hidden justify-self-end lg:block">
                <div className="liquid-glass data-float w-[23rem] rounded-[2rem] p-5 text-white shadow-[0_34px_90px_-40px_rgba(0,0,0,.75)] xl:w-[25rem]">
                  <div className="flex items-start justify-between gap-4 border-b border-white/12 pb-4">
                    <div><p className="font-mono text-[.6rem] uppercase tracking-[.15em] text-white/48">Reunión 3 · Seguimiento</p><p className="mt-1.5 text-base font-medium">Panorama del nivel</p></div>
                    <span className="rounded-full border border-[#f1cf7a]/25 bg-[#f1cf7a]/12 px-2.5 py-1 text-[.62rem] text-[#f1cf7a]">En riesgo</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-5">
                    <div><p className="font-mono text-5xl font-semibold tracking-[-.08em]">63</p><p className="mt-1 text-xs text-white/45">promedio · meta 70</p></div>
                    <div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-right"><p className="font-mono text-lg font-semibold text-[#f1cf7a]">−7</p><p className="text-[.6rem] text-white/40">para la meta</p></div>
                  </div>
                  <div className="mt-6 space-y-3">
                    {competenciasVista.slice(0, 4).map((competencia) => {
                      const lograda = competencia.valor >= 70;
                      const color = lograda ? "#6fd1ad" : "#f1cf7a";
                      return (
                        <div key={competencia.codigo} className="grid grid-cols-[5.8rem_1fr_1.8rem] items-center gap-3">
                          <span className="truncate text-[.7rem] text-white/74">{competencia.nombre}</span>
                          <span className="h-1.5 overflow-hidden rounded-full bg-white/10"><i className="block h-full rounded-full" style={{ width: `${competencia.valor}%`, background: color }} /></span>
                          <span className="text-right font-mono text-[.68rem] font-semibold" style={{ color }}>{competencia.valor}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/12 px-3.5 py-3"><p className="font-mono text-[.58rem] uppercase tracking-[.13em] text-[#f1cf7a]">Prioridad</p><p className="mt-1 text-sm">Evaluar · faltan 27 puntos</p></div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 hidden border-t border-white/10 bg-black/14 px-14 py-5 backdrop-blur-md lg:flex lg:items-center lg:justify-between xl:px-20">
              <span className="text-xs text-white/48">Malla y competencias oficiales</span><span className="h-1 w-1 rounded-full bg-[#e16a7e]" />
              <span className="text-xs text-white/48">Respuestas del equipo docente</span><span className="h-1 w-1 rounded-full bg-[#e16a7e]" />
              <span className="text-xs text-white/48">Actas de cada reunión</span><span className="h-1 w-1 rounded-full bg-[#e16a7e]" />
              <span className="text-xs font-medium text-white">Una decisión con seguimiento</span>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[82rem] px-6 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#9e1b32]">Una sola ruta</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">De conversar a actuar.</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-black/52">Cada pantalla muestra únicamente lo que corresponde hacer en ese momento.</p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-3">
              {pasos.map((paso) => (
                <li key={paso.numero} className="surface-glass group min-h-64 rounded-[1.7rem] p-6 transition duration-300 hover:-translate-y-1 sm:p-7">
                  <div className="flex items-center justify-between"><span className="font-mono text-xs font-semibold text-[#9e1b32]">{paso.numero}</span><span className="h-2 w-2 rounded-full bg-[#9e1b32]/18 transition-colors group-hover:bg-[#9e1b32]" /></div>
                  <h3 className="mt-16 text-2xl font-semibold tracking-[-.04em]">{paso.titulo}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/50">{paso.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-3 pb-3 sm:px-5 lg:px-7">
          <div className="relative mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] bg-[#111318] px-6 py-16 text-white sm:rounded-[2.6rem] sm:px-10 lg:px-16 lg:py-24 xl:px-20">
            <div aria-hidden="true" className="absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#9e1b32]/28 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-44 left-[28%] h-[28rem] w-[28rem] rounded-full bg-[#1b8f86]/16 blur-3xl" />
            <div className="relative grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <p className="font-mono text-[.65rem] uppercase tracking-[.16em] text-white/42">Cuando la evidencia está completa</p>
                <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-.05em] sm:text-5xl">El resultado tiene que ayudar a decidir.</h2>
                <div className="mt-10 space-y-3">
                  {resultados.map((resultado) => (
                    <div key={resultado.rotulo} className="liquid-glass grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl px-4 py-4 sm:px-5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#e16a7e] shadow-[0_0_16px_rgba(225,106,126,.65)]" />
                      <div><p className="text-sm font-semibold">{resultado.rotulo}</p><p className="mt-1 text-xs leading-relaxed text-white/48">{resultado.texto}</p></div>
                      <span className="font-mono text-xs text-white/54">{resultado.marca}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="liquid-glass rounded-[2rem] p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div><p className="font-mono text-[.62rem] uppercase tracking-[.15em] text-white/40">Competencias del nivel</p><p className="mt-2 text-xl font-medium">Avance frente a la meta</p></div>
                  <span className="text-xs text-white/42">Referencia del ciclo · 70</span>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-5">
                  {competenciasVista.map((competencia) => {
                    const lograda = competencia.valor >= 70;
                    const color = lograda ? "#54c7a0" : competencia.valor < 50 ? "#e16a7e" : "#e2bd59";
                    return (
                      <div key={competencia.codigo} className="text-center">
                        <span className="mb-3 block font-mono text-lg font-semibold tabular-nums" style={{ color }}>{competencia.valor}</span>
                        <div className="relative mx-auto flex h-40 w-10 items-end overflow-hidden rounded-t-[1.25rem] border border-white/14 bg-white/[.07] p-1 sm:h-48 sm:w-12">
                          <span className="absolute left-0 right-0 z-10 border-t border-dashed border-white/55" style={{ bottom: "70%" }} />
                          <i className="block w-full rounded-t-[.9rem]" style={{ height: `${competencia.valor}%`, background: `linear-gradient(180deg, ${color}, ${color}99)`, boxShadow: `0 0 22px ${color}35` }} />
                        </div>
                        <p className="mt-3 truncate text-[.68rem] font-medium text-white/74">{competencia.nombre}</p>
                        <p className="mt-0.5 font-mono text-[.55rem] text-white/30">{competencia.codigo}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[82rem] px-6 py-24 text-center sm:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#9e1b32]">La próxima decisión comienza aquí</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-.055em] sm:text-6xl">Una comunidad académica que recuerda, aprende y avanza.</h2>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={rutaCoordinacion} className="inline-flex items-center justify-center gap-3 rounded-full bg-[#111318] px-6 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#9e1b32]">Entrar como coordinación <span aria-hidden="true">→</span></Link>
            <Link href="/docente" className="inline-flex items-center justify-center gap-3 rounded-full border border-black/14 bg-white px-6 py-3.5 text-sm font-medium transition hover:-translate-y-0.5 hover:border-black/28">Responder como docente <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>

      <footer className="px-3 pb-3 sm:px-5 lg:px-7">
        <div className="mx-auto flex max-w-[90rem] flex-col justify-between gap-6 rounded-[2rem] bg-[#17181d] px-7 py-8 text-white/50 sm:flex-row sm:items-center sm:px-10">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white"><Image src="/logo-ua.png" alt="" width={30} height={24} className="h-auto w-7" /></span><div><p className="text-sm font-semibold text-white">Comunidades Académicas</p><p className="mt-0.5 text-xs">Carrera de Psicología</p></div></div>
          <p className="max-w-md text-xs leading-relaxed sm:text-right">Universidad Autónoma de Chile · Competencias de ciclo, evidencia docente y acuerdos con seguimiento.</p>
        </div>
      </footer>
    </div>
  );
}
