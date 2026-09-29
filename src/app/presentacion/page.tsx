import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Presentación | Comunidades Académicas",
  description: "Demostración de solo lectura del instrumento de Comunidades Académicas.",
  robots: { index: false, follow: false },
};

const pasos = [
  {
    numero: "01",
    titulo: "Preparar el nivel",
    texto: "Jornada, nivel, asignaturas y competencias oficiales.",
    dato: "Nivel 4 · Diurno",
  },
  {
    numero: "02",
    titulo: "Escuchar al equipo",
    texto: "Cada docente responde desde un enlace, sin crear una cuenta.",
    dato: "3 de 3 respuestas",
  },
  {
    numero: "03",
    titulo: "Sumar la reunión",
    texto: "El acta aporta acuerdos, tensiones y contexto del curso.",
    dato: "Acta R2 incorporada",
  },
  {
    numero: "04",
    titulo: "Decidir qué hacer",
    texto: "El sistema ordena fortalezas, brechas y próximos pasos.",
    dato: "3 focos priorizados",
  },
] as const;

const competencias = [
  { codigo: "1.1", nombre: "Fundamentar", valor: 82, estado: "Logrado", color: "#61d4ad" },
  { codigo: "2.1", nombre: "Investigar", valor: 74, estado: "Logrado", color: "#61d4ad" },
  { codigo: "3.1", nombre: "Evaluar", valor: 64, estado: "En riesgo", color: "#efc75e" },
  { codigo: "4.1", nombre: "Analizar", valor: 58, estado: "En riesgo", color: "#efc75e" },
  { codigo: "5.1", nombre: "Intervenir", valor: 46, estado: "En riesgo", color: "#e77a8c" },
  { codigo: "6.1", nombre: "Autoexplorar", valor: 68, estado: "En riesgo", color: "#efc75e" },
] as const;

const lecturas = [
  {
    etiqueta: "FORTALEZA",
    titulo: "Fundamentar con evidencia",
    texto: "El equipo observa argumentos más claros y mejor uso de conceptos disciplinares.",
    dato: "82 / 100",
    color: "#16815d",
    fondo: "#eefaf4",
  },
  {
    etiqueta: "PRIORIDAD",
    titulo: "Diseñar intervenciones",
    texto: "Falta traducir el análisis en objetivos, acciones y criterios de evaluación coherentes.",
    dato: "−24 a la meta",
    color: "#a3182c",
    fondo: "#fdf0f2",
  },
  {
    etiqueta: "ATENCIÓN",
    titulo: "Compartir el criterio",
    texto: "Hay diferencias entre docentes al reconocer qué cuenta como un desempeño logrado.",
    dato: "Disenso visible",
    color: "#8b650b",
    fondo: "#fdf7e9",
  },
] as const;

const voces = [
  {
    origen: "Docente · Asignatura A",
    frase: "Comprenden los conceptos, pero aún les cuesta convertirlos en una propuesta aplicable.",
    clave: "Del análisis a la acción",
    color: "#5be0cb",
  },
  {
    origen: "Docente · Asignatura B",
    frase: "Cuando comparan casos entre pares, justifican mejor sus decisiones.",
    clave: "Aprendizaje entre pares",
    color: "#efc75e",
  },
  {
    origen: "Acta · Reunión 2",
    frase: "El equipo acuerda usar un mismo ejemplo y una pauta común durante el próximo mes.",
    clave: "Criterio compartido",
    color: "#e77a8c",
  },
] as const;

const acciones = [
  {
    numero: "01",
    titulo: "Modelar un caso completo",
    tecnica: "Ejemplo resuelto",
    porQue: "Hace visible cómo se pasa del diagnóstico a una intervención coherente.",
    tiempo: "Próxima clase",
    color: "#25bfa8",
  },
  {
    numero: "02",
    titulo: "Comparar decisiones",
    tecnica: "Instrucción entre pares",
    porQue: "Obliga a justificar una elección y permite contrastar criterios profesionales.",
    tiempo: "Durante 3 semanas",
    color: "#efc75e",
  },
  {
    numero: "03",
    titulo: "Comprobar el avance",
    tecnica: "Práctica de recuperación",
    porQue: "Entrega evidencia breve y frecuente para saber si la dificultad realmente disminuyó.",
    tiempo: "Revisar en R3",
    color: "#e77a8c",
  },
] as const;

export default function PresentacionPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f3f0] text-[#111318]">
      <header className="sticky top-0 z-50 border-b border-black/[.06] bg-[#f4f3f0]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3" aria-label="Volver al inicio">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-black/[.07] bg-white shadow-[0_12px_32px_-20px_rgba(17,19,24,.4)]">
              <Image src="/logo-ua.png" alt="" width={34} height={27} className="h-auto w-8" priority />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[-.02em]">Comunidades Académicas</span>
              <span className="mt-0.5 hidden text-[.65rem] text-black/45 sm:block">Carrera de Psicología</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs text-black/48 lg:flex" aria-label="Contenido de la presentación">
            <a href="#recorrido" className="transition hover:text-black">El recorrido</a>
            <a href="#resultado" className="transition hover:text-black">El resultado</a>
            <a href="#acciones" className="transition hover:text-black">Las decisiones</a>
          </nav>

          <span className="rounded-full border border-[#9e1b32]/15 bg-[#9e1b32]/[.06] px-3 py-1.5 font-mono text-[.58rem] font-semibold uppercase tracking-[.13em] text-[#8d172c] sm:px-4 sm:text-[.62rem]">
            Solo lectura · Demo
          </span>
        </div>
      </header>

      <main>
        <section className="px-3 pt-3 sm:px-5 lg:px-7">
          <div className="relative mx-auto min-h-[46rem] max-w-[90rem] overflow-hidden rounded-[2rem] bg-[#121419] text-white sm:rounded-[2.7rem] lg:min-h-[calc(100svh-6.5rem)]">
            <Image
              src="/campus-comunidad.jpg"
              alt="Comunidad universitaria dialogando en un espacio de aprendizaje"
              fill
              priority
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover object-[58%_center] opacity-45"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,15,20,.98)_0%,rgba(13,15,20,.84)_43%,rgba(13,15,20,.28)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(13,15,20,.92)_0%,transparent_55%)]" />
            <div aria-hidden="true" className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#9e1b32]/30 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-40 right-[8%] h-96 w-96 rounded-full bg-[#16a790]/18 blur-3xl" />

            <div className="relative z-10 grid min-h-[46rem] items-center gap-12 px-6 py-14 sm:px-10 lg:min-h-[calc(100svh-6.5rem)] lg:grid-cols-[1.02fr_.98fr] lg:px-14 xl:px-20">
              <div className="max-w-3xl">
                <p className="flex items-center gap-3 text-[.67rem] font-semibold uppercase tracking-[.2em] text-white/55">
                  <span className="h-px w-8 bg-[#e77a8c]" /> Presentación del avance
                </p>
                <h1 className="mt-7 text-[clamp(3.1rem,6.4vw,6.7rem)] font-semibold leading-[.91] tracking-[-.065em]">
                  Saber qué pasa.<br />
                  <span className="text-white/42">Decidir qué hacer.</span>
                </h1>
                <p className="mt-7 max-w-xl text-base leading-relaxed text-white/66 sm:text-lg">
                  La voz docente, las actas y las competencias del ciclo se encuentran en una lectura simple del nivel: fortalezas, brechas y una ruta concreta para avanzar.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <a href="#recorrido" className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#111318] transition hover:-translate-y-0.5">
                    Ver cómo funciona <span aria-hidden="true">↓</span>
                  </a>
                  <span className="inline-flex items-center rounded-full border border-white/14 bg-white/[.07] px-4 py-3 text-xs text-white/55 backdrop-blur-xl">
                    Datos simulados · Ninguna edición
                  </span>
                </div>
              </div>

              <div className="justify-self-end lg:w-full lg:max-w-[31rem]">
                <div className="liquid-glass rounded-[2rem] p-5 shadow-[0_36px_100px_-38px_rgba(0,0,0,.8)] sm:p-7">
                  <div className="flex items-start justify-between gap-5 border-b border-white/12 pb-5">
                    <div>
                      <p className="font-mono text-[.6rem] uppercase tracking-[.16em] text-white/40">Nivel 4 · Diurno · Reunión 2 de 4</p>
                      <h2 className="mt-2 text-xl font-medium">Panorama del nivel</h2>
                    </div>
                    <span className="rounded-full border border-[#efc75e]/25 bg-[#efc75e]/10 px-3 py-1.5 text-[.65rem] font-medium text-[#f5d77f]">En riesgo</span>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-5">
                    <div>
                      <p className="font-mono text-6xl font-semibold tracking-[-.09em] tabular-nums">65</p>
                      <p className="mt-1 text-xs text-white/42">promedio general · meta 70</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-right">
                      <p className="font-mono text-xl font-semibold text-[#efc75e]">−5</p>
                      <p className="text-[.62rem] text-white/38">para la meta</p>
                    </div>
                  </div>

                  <div className="mt-7 space-y-3.5">
                    {competencias.slice(0, 4).map((competencia) => (
                      <div key={competencia.codigo} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3">
                        <span className="truncate text-xs text-white/67">{competencia.nombre}</span>
                        <span className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
                          <i className="block h-full rounded-full" style={{ width: `${competencia.valor}%`, background: competencia.color }} />
                        </span>
                        <span className="text-right font-mono text-xs font-semibold" style={{ color: competencia.color }}>{competencia.valor}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-[#e77a8c]/20 bg-[#e77a8c]/[.08] p-4">
                    <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#e77a8c] shadow-[0_0_18px_rgba(231,122,140,.65)]" />
                    <div>
                      <p className="font-mono text-[.58rem] uppercase tracking-[.14em] text-[#f1a1af]">Prioridad sugerida</p>
                      <p className="mt-1.5 text-sm text-white/82">Pasar del análisis a una intervención coherente.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recorrido" className="scroll-mt-24 mx-auto w-full max-w-[82rem] px-6 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-[.68fr_1.32fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#9e1b32]">Una ruta guiada</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-.055em] sm:text-6xl">Cuatro pasos.<br /><span className="text-black/28">Una decisión.</span></h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-black/50">El coordinador ve solo lo que corresponde hacer ahora. Los resultados aparecen cuando la evidencia está completa.</p>
            </div>

            <ol className="grid gap-3 sm:grid-cols-2">
              {pasos.map((paso, indice) => (
                <li key={paso.numero} className="surface-glass min-h-64 rounded-[1.8rem] p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs font-semibold text-[#9e1b32]">{paso.numero}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[.6rem] font-semibold ${indice < 3 ? "bg-[#eefaf4] text-[#10714f]" : "bg-[#fdf7e9] text-[#8b650b]"}`}>
                      {indice < 3 ? "Listo" : "Resultado"}
                    </span>
                  </div>
                  <h3 className="mt-10 text-2xl font-semibold tracking-[-.04em]">{paso.titulo}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/48">{paso.texto}</p>
                  <div className="mt-7 border-t border-black/[.07] pt-4">
                    <p className="font-mono text-[.63rem] uppercase tracking-[.12em] text-black/36">{paso.dato}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="resultado" className="scroll-mt-24 px-3 pb-3 sm:px-5 lg:px-7">
          <div className="relative mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] bg-[#121419] px-6 py-16 text-white sm:rounded-[2.7rem] sm:px-10 lg:px-16 lg:py-24 xl:px-20">
            <div aria-hidden="true" className="absolute -right-32 -top-48 h-[36rem] w-[36rem] rounded-full bg-[#9e1b32]/26 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-56 left-[24%] h-[34rem] w-[34rem] rounded-full bg-[#15b89f]/15 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                <div>
                  <p className="font-mono text-[.65rem] uppercase tracking-[.18em] text-white/40">Resultado de demostración</p>
                  <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-.055em] sm:text-6xl">Cómo está el curso frente a lo esperado.</h2>
                </div>
                <div className="flex gap-5 text-[.65rem] text-white/44">
                  <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#61d4ad]" /> Logrado</span>
                  <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#efc75e]" /> En riesgo</span>
                </div>
              </div>

              <div className="mt-12 grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="liquid-glass rounded-2xl p-5">
                    <p className="text-xs text-white/40">Promedio del nivel</p>
                    <div className="mt-3 flex items-end justify-between"><strong className="font-mono text-5xl tracking-[-.08em]">65</strong><span className="mb-1 text-xs text-[#efc75e]">En riesgo</span></div>
                  </div>
                  <div className="liquid-glass rounded-2xl p-5">
                    <p className="text-xs text-white/40">Competencias logradas</p>
                    <div className="mt-3 flex items-end justify-between"><strong className="font-mono text-5xl tracking-[-.08em]">2<span className="text-2xl text-white/28">/6</span></strong><span className="mb-1 text-xs text-[#61d4ad]">Fortalezas</span></div>
                  </div>
                  <div className="liquid-glass rounded-2xl p-5">
                    <p className="text-xs text-white/40">Foco principal</p>
                    <p className="mt-4 text-xl font-medium">Intervenir</p>
                    <p className="mt-1 text-xs text-[#f1a1af]">Faltan 24 puntos</p>
                  </div>
                </div>

                <div className="liquid-glass rounded-[2rem] p-5 sm:p-8">
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div><p className="text-sm font-medium">Competencias del ciclo</p><p className="mt-1 text-xs text-white/38">La línea marca la meta de 70 puntos</p></div>
                    <span className="rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 font-mono text-[.6rem] text-white/48">META 70</span>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-6 sm:gap-5" role="img" aria-label="Gráfico de avance de seis competencias frente a una meta de 70 puntos">
                    {competencias.map((competencia) => (
                      <div key={competencia.codigo} className="text-center">
                        <span className="mb-3 block font-mono text-xl font-semibold tabular-nums" style={{ color: competencia.color }}>{competencia.valor}</span>
                        <div className="relative mx-auto flex h-48 w-11 items-end overflow-hidden rounded-t-[1.4rem] border border-white/14 bg-white/[.07] p-1 sm:h-60 sm:w-12">
                          <span className="absolute left-0 right-0 z-10 border-t border-dashed border-white/55" style={{ bottom: "70%" }} />
                          <i className="block w-full rounded-t-[1rem]" style={{ height: `${competencia.valor}%`, background: `linear-gradient(180deg, ${competencia.color}, ${competencia.color}9a)`, boxShadow: `0 0 25px ${competencia.color}40` }} />
                        </div>
                        <p className="mt-3 truncate text-[.68rem] font-medium text-white/72">{competencia.nombre}</p>
                        <p className="mt-1 text-[.57rem]" style={{ color: competencia.color }}>{competencia.estado}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-3 md:grid-cols-3">
                {lecturas.map((lectura) => (
                  <article key={lectura.etiqueta} className="rounded-[1.6rem] border border-white/10 bg-white/[.055] p-5 backdrop-blur-xl sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-[.58rem] font-semibold tracking-[.14em]" style={{ color: lectura.color }}>{lectura.etiqueta}</span>
                      <span className="rounded-full px-2.5 py-1 text-[.58rem] font-semibold" style={{ background: lectura.fondo, color: lectura.color }}>{lectura.dato}</span>
                    </div>
                    <h3 className="mt-6 text-xl font-medium">{lectura.titulo}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/48">{lectura.texto}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[82rem] px-6 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[.64fr_1.36fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#9e1b32]">Qué dice el equipo</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">La evidencia también tiene voz.</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-black/48">El sistema conecta patrones de las respuestas y del acta. En esta presentación, las voces son anónimas y simuladas.</p>
            </div>

            <div className="space-y-3">
              {voces.map((voz, indice) => (
                <article key={voz.origen} className="surface-glass grid gap-5 rounded-[1.7rem] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl font-mono text-xs font-semibold text-white" style={{ background: voz.color, color: indice === 1 ? "#4c3500" : "#fff" }}>0{indice + 1}</span>
                  <div>
                    <p className="font-mono text-[.6rem] uppercase tracking-[.13em] text-black/36">{voz.origen}</p>
                    <p className="mt-2 max-w-2xl text-base leading-relaxed text-black/72">“{voz.frase}”</p>
                  </div>
                  <span className="w-fit rounded-full border border-black/[.07] bg-white/70 px-3 py-1.5 text-[.65rem] font-medium text-black/52">{voz.clave}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="acciones" className="scroll-mt-24 px-3 pb-3 sm:px-5 lg:px-7">
          <div className="mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] bg-white px-6 py-16 shadow-[0_36px_100px_-70px_rgba(17,19,24,.5)] sm:rounded-[2.7rem] sm:px-10 lg:px-16 lg:py-24 xl:px-20">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#9e1b32]">Qué hacemos ahora</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-.055em] sm:text-6xl">Una recomendación que llega hasta el aula.</h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-black/46">Cada técnica responde a una dificultad observada. No es una lista genérica: explica por qué puede ayudar y cuándo comprobar el avance.</p>
            </div>

            <div className="mt-12 grid gap-3 lg:grid-cols-3">
              {acciones.map((accion) => (
                <article key={accion.numero} className="relative overflow-hidden rounded-[1.8rem] border border-black/[.07] bg-[#f6f5f3] p-6 sm:p-7">
                  <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-15 blur-2xl" style={{ background: accion.color }} />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-4"><span className="font-mono text-xs font-semibold" style={{ color: accion.color }}>{accion.numero}</span><span className="rounded-full bg-white px-3 py-1.5 text-[.62rem] text-black/48">{accion.tiempo}</span></div>
                    <p className="mt-10 font-mono text-[.58rem] font-semibold uppercase tracking-[.14em]" style={{ color: accion.color }}>{accion.tecnica}</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-.04em]">{accion.titulo}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-black/48">{accion.porQue}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 grid gap-5 rounded-[1.8rem] bg-[#121419] p-6 text-white sm:p-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
              <div>
                <p className="font-mono text-[.6rem] uppercase tracking-[.15em] text-[#efc75e]">Acuerdo sugerido</p>
                <h3 className="mt-3 text-2xl font-medium">Una decisión con responsable y fecha.</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[.06] p-4"><p className="text-[.6rem] uppercase tracking-[.12em] text-white/32">Acción</p><p className="mt-2 text-sm text-white/76">Aplicar pauta común</p></div>
                <div className="rounded-xl border border-white/10 bg-white/[.06] p-4"><p className="text-[.6rem] uppercase tracking-[.12em] text-white/32">Responsable</p><p className="mt-2 text-sm text-white/76">Equipo del nivel</p></div>
                <div className="rounded-xl border border-white/10 bg-white/[.06] p-4"><p className="text-[.6rem] uppercase tracking-[.12em] text-white/32">Seguimiento</p><p className="mt-2 text-sm text-white/76">Reunión 3</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[82rem] px-6 py-24 text-center sm:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#9e1b32]">El propósito</p>
          <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold tracking-[-.055em] sm:text-6xl">Que cada reunión termine sabiendo qué hacer el lunes en clases.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-black/48">Esta vista contiene datos simulados, no permite editar información y no expone nombres, actas ni respuestas reales.</p>
          <Link href="/" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#111318] px-6 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#9e1b32]">Volver al inicio <span aria-hidden="true">→</span></Link>
        </section>
      </main>

      <footer className="px-3 pb-3 sm:px-5 lg:px-7">
        <div className="mx-auto flex max-w-[90rem] flex-col justify-between gap-6 rounded-[2rem] bg-[#17181d] px-7 py-8 text-white/46 sm:flex-row sm:items-center sm:px-10">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white"><Image src="/logo-ua.png" alt="" width={30} height={24} className="h-auto w-7" /></span>
            <div><p className="text-sm font-semibold text-white">Comunidades Académicas</p><p className="mt-0.5 text-xs">Presentación de solo lectura</p></div>
          </div>
          <p className="max-w-md text-xs leading-relaxed sm:text-right">Universidad Autónoma de Chile · Carrera de Psicología</p>
        </div>
      </footer>
    </div>
  );
}
