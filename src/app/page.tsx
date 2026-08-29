import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui";

const ETAPAS = [
  ["Configurar", "Declaras el nivel, sus asignaturas y qué competencia tributa cada una."],
  ["Evaluar", "Cada docente califica, por un enlace y sin crear cuenta, las evidencias de su asignatura."],
  ["Fortalecer", "Ves qué competencias están en riesgo y recibes cómo reforzarlas."],
] as const;

export default async function PortadaPage() {
  const session = await auth();
  if (session?.user) redirect("/niveles");

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

        <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Instrumento de Competencias <span className="text-ua">CCAA</span>
        </h1>

        <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-muted">
          Diagnostica el logro de las competencias del nivel a partir del juicio de tus
          docentes, y convierte cada hallazgo en una decisión de Estrategia Pedagógica Global.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/registro">
            <Button className="px-7 py-3">Comenzar</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="px-5 py-3">
              Ya tengo una cuenta
            </Button>
          </Link>
        </div>

        {/* Las tres etapas, para que se sepa qué viene antes de registrarse */}
        <ol className="mt-16 grid w-full gap-px overflow-hidden rounded-2xl border border-border bg-border text-left sm:grid-cols-3">
          {ETAPAS.map(([titulo, texto], i) => (
            <li key={titulo} className="bg-surface p-5">
              <span className="mb-3 grid h-7 w-7 place-items-center rounded-full bg-ua-tint font-mono text-xs font-medium text-ua">
                {i + 1}
              </span>
              <h2 className="font-serif text-base font-medium">{titulo}</h2>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">{texto}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
