import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button, Eyebrow } from "@/components/ui";

const COMPONENTES = [
  "Elementos curriculares",
  "Balance de carga evaluativo",
  "Estrategias metodológicas",
  "Instrumentos de evaluación",
  "Planificación integrada",
  "Derivación al SAAC",
  "Seguimiento de resultados",
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/niveles");

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-ua-tint blur-3xl" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-start gap-7 px-6 pb-20 pt-24 sm:pt-32">
        <Eyebrow>Comunidad Académica · Psicología UA</Eyebrow>

        <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Diagnostica el logro de las competencias de ciclo,{" "}
          <span className="italic text-ua">reunión a reunión</span>.
        </h1>

        <p className="max-w-xl text-[1.05rem] leading-relaxed text-muted">
          El instrumento CCAA reúne el juicio docente por indicador, compara
          automáticamente línea base y cierre, y traduce cada hallazgo en una
          decisión concreta de Estrategia Pedagógica Global.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login">
            <Button>Ingresar</Button>
          </Link>
          <Link href="/registro">
            <Button variant="secondary">Crear cuenta de coordinador</Button>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {COMPONENTES.map((c, i) => (
            <span
              key={c}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-muted"
            >
              <span className="mr-1.5 text-ua">{i + 1}</span>
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
