import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";

const pasos = [
  { numero: "01", titulo: "Prepara el nivel", texto: "Registra asignaturas, docentes y las competencias que observarán." },
  { numero: "02", titulo: "Escucha al equipo", texto: "Cada docente responde desde su teléfono y aporta su mirada del curso." },
  { numero: "03", titulo: "Decide qué hacer", texto: "Las respuestas y las actas se convierten en prioridades y acuerdos concretos." },
] as const;

const barras = [58, 76, 43, 68, 84, 51] as const;

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
        <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.16em] text-black/40">Psicología · CCAA</span>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.02fr_.98fr] lg:px-10 lg:py-24">
          <div className="max-w-2xl animate-fade-in">
            <p className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#9e1b32]">
              <span className="h-px w-8 bg-current" /> Comunidad Académica
            </p>
            <h1 className="text-[clamp(3.4rem,7.2vw,7rem)] font-semibold leading-[0.91] tracking-[-0.065em]">
              Saber cómo están.<br /><span className="text-black/28">Decidir qué hacer.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-black/58 sm:text-xl">
              Una visión clara del nivel para convertir la experiencia docente en mejoras concretas para el aula.
            </p>
            <a href="#como-funciona" className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#111318] px-6 py-3.5 text-sm font-medium text-white shadow-[0_12px_32px_-14px_rgba(17,19,24,.6)] transition hover:-translate-y-0.5 hover:bg-[#9e1b32] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9e1b32]">
              Ver cómo funciona <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]" aria-label="Ejemplo visual del avance de seis competencias">
            <div aria-hidden="true" className="absolute -inset-12 rounded-full bg-[#9e1b32]/8 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#111318] p-7 text-white shadow-[0_38px_90px_-42px_rgba(17,19,24,.72)] sm:p-9">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/42">Vista del nivel</p>
                  <p className="mt-2 text-xl font-medium">Avance hacia el ciclo</p>
                </div>
                <span className="rounded-full border border-white/12 px-3 py-1 text-[0.65rem] text-white/55">Reunión actual</span>
              </div>
              <div className="mt-12 flex h-56 items-end gap-3 sm:gap-4">
                {barras.map((valor, index) => (
                  <div key={index} className="flex h-full flex-1 flex-col justify-end gap-3">
                    <span className="text-center font-mono text-[0.62rem] text-white/48">{valor}</span>
                    <div className="relative h-full overflow-hidden rounded-full bg-white/10 ring-1 ring-inset ring-white/10">
                      <span className="absolute inset-x-0 bottom-0 rounded-full bg-[#9e1b32] shadow-[0_0_28px_rgba(158,27,50,.75)]" style={{ height: `${valor}%` }} />
                    </div>
                    <span className="text-center font-mono text-[0.58rem] text-white/36">C{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
                <div><p className="text-[0.65rem] text-white/42">Fortaleza</p><p className="mt-1 text-sm font-medium">Competencia 5</p></div>
                <div><p className="text-[0.65rem] text-white/42">Próximo foco</p><p className="mt-1 text-sm font-medium">Competencia 3</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/8 bg-[#f6f5f3] px-6 py-7">
          <p className="mx-auto max-w-7xl text-center text-xs font-medium uppercase tracking-[0.17em] text-black/38">
            Competencias de ciclo <span className="mx-3 text-[#9e1b32]">·</span> Voz docente <span className="mx-3 text-[#9e1b32]">·</span> Actas de CCAA <span className="mx-3 text-[#9e1b32]">·</span> Acuerdos con seguimiento
          </p>
        </section>

        <section id="como-funciona" className="mx-auto w-full max-w-7xl scroll-mt-8 px-6 py-24 lg:px-10 lg:py-32">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9e1b32]">Un camino, tres momentos</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">De la conversación a la acción.</h2>
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
                <p className="mt-5 max-w-md text-base leading-relaxed text-white/52">La coordinación organiza y analiza. El equipo docente responde sin crear una cuenta.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href={nombre ? "/niveles" : "/login"} className="group rounded-2xl bg-white p-6 text-[#111318] transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  <span className="text-lg font-semibold">Coordinación</span>
                  <span className="mt-8 flex items-end justify-between gap-3 text-sm text-black/50">{nombre ? `Continuar como ${nombre}` : "Ingresar con mi cuenta"}<span className="text-xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></span>
                </Link>
                <Link href="/docente" className="group rounded-2xl border border-white/16 bg-white/[.06] p-6 transition hover:-translate-y-1 hover:bg-white/[.1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  <span className="text-lg font-semibold">Docente</span>
                  <span className="mt-8 flex items-end justify-between gap-3 text-sm text-white/48">Entrar con el código<span className="text-xl text-white transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></span>
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
