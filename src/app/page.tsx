import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";

/**
 * La portada es un cruce de caminos, no un folleto. Quien llega aquí es una de
 * dos personas con tareas distintas, y lo único que necesita es reconocerse.
 * Por eso las dos puertas van en la misma pantalla que el escudo: una portada
 * que solo dice "pasa" añade un clic sin responder "¿qué hago ahora?".
 *
 * La elección se muestra SIEMPRE, también con la sesión iniciada. Antes se
 * saltaba directo a /niveles, y eso rompía las dos cosas que esta pantalla
 * existe para resolver: en el computador de la sala —donde la coordinación deja
 * su sesión abierta— el docente no encontraba su puerta, y peor, aterrizaba
 * dentro de la cuenta ajena viendo un análisis que no le corresponde. A quien
 * ya inició sesión no se le pregunta quién es: su puerta dice su nombre.
 */
export default async function PortadaPage() {
  const session = await auth();
  const nombre = session?.user?.name ?? null;

  const puertas = [
    nombre
      ? {
          href: "/niveles",
          titulo: "Coordinación",
          detalle: "Configuro el nivel, veo el análisis y registro los acuerdos.",
          pie: `Seguir como ${nombre}`,
        }
      : {
          href: "/login",
          titulo: "Coordinación",
          detalle: "Configuro el nivel, veo el análisis y registro los acuerdos.",
          pie: "Con tu cuenta",
        },
    {
      href: "/docente",
      titulo: "Docente",
      detalle: "Respondo cómo veo al curso en las competencias de mi asignatura.",
      pie: "Sin cuenta · unos 5 minutos",
    },
  ];

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden">
      {/* Halo cálido detrás del escudo, sin llegar a degradado decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-16 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-ua-tint blur-3xl"
      />

      <main className="relative mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-16 text-center">
        {/* El escudo va sobre una placa blanca: el logotipo institucional lleva
            texto negro y así se mantiene legible también en modo oscuro. */}
        <div className="rounded-2xl bg-white p-7 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_20px_48px_-24px_rgba(0,0,0,0.22)]">
          <Image
            src="/logo-ua.png"
            alt="Universidad Autónoma de Chile"
            width={480}
            height={371}
            priority
            className="h-auto w-40 sm:w-48"
          />
        </div>

        <p className="mt-10 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
          Carrera de Psicología · Comunidad Académica
        </p>

        <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Instrumento de Competencias <span className="text-ua">CCAA</span>
        </h1>

        <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-muted">
          Convierte la conversación de la comunidad académica en un diagnóstico con
          evidencia y en decisiones con responsable.
        </p>

        <h2 className="mt-12 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-2">
          ¿Cómo entras?
        </h2>

        <div className="mt-4 grid w-full gap-3 sm:grid-cols-2">
          {puertas.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:border-ua focus-visible:border-ua focus-visible:outline-none"
            >
              <span className="text-lg font-medium">{p.titulo}</span>
              <span className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-muted">
                {p.detalle}
              </span>
              <span className="mt-4 flex items-center gap-1.5 text-[0.75rem] font-medium text-muted-2">
                {p.pie}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>

        {!nombre && (
          <p className="mt-8 text-[0.8125rem] text-muted-2">
            ¿Coordinas y aún no tienes cuenta?{" "}
            <Link href="/registro" className="font-medium text-ua underline underline-offset-2">
              Crear una
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
