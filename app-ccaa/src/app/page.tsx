import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/niveles");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-6 py-24">
      <span className="rounded-full bg-ua-tint px-3 py-1 text-xs font-medium uppercase tracking-wide text-ua">
        Comunidad Académica · Psicología UA
      </span>
      <h1 className="text-4xl font-semibold tracking-tight">
        Instrumento CCAA para la Estrategia Pedagógica Global
      </h1>
      <p className="text-base leading-relaxed text-muted">
        Diagnostica el logro de las competencias de ciclo a partir del juicio
        docente, compara línea base y cierre trimestre a trimestre, y traduce
        cada hallazgo en una decisión concreta de EPG.
      </p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button>Ingresar</Button>
        </Link>
        <Link href="/registro">
          <Button variant="secondary">Crear cuenta de coordinador</Button>
        </Link>
      </div>
    </div>
  );
}
