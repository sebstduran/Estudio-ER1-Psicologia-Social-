import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Card, SectionLabel } from "@/components/ui";
import { NuevoNivelForm } from "./nuevo-nivel-form";

const CICLO_LABEL = {
  INICIAL: "Ciclo Inicial",
  INTERMEDIO: "Ciclo Intermedio",
  FINAL: "Ciclo Final",
} as const;

const MODALIDAD_LABEL = {
  DIURNO: "Diurno · 4 reuniones",
  VESPERTINO_TECH: "Vespertino/TECH · 3 reuniones",
} as const;

export default async function NivelesPage() {
  const user = await requireCoordinador();

  const niveles = await prisma.nivel.findMany({
    where: { coordinadorId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { asignaturas: true, competencias: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Mis niveles</h1>
        <p className="mt-1.5 text-[0.95rem] text-muted">
          Cada nivel es una instancia del instrumento: un ciclo, una modalidad, un trimestre.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          {niveles.length === 0 && (
            <Card className="text-sm text-muted">
              Todavía no tienes niveles configurados. Crea el primero con el formulario.
            </Card>
          )}
          {niveles.map((nivel, i) => (
            <Link key={nivel.id} href={`/niveles/${nivel.id}`} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <Card interactive>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-lg font-medium">{nivel.nombre}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {CICLO_LABEL[nivel.cicloTipo]} · {MODALIDAD_LABEL[nivel.modalidad]} ·{" "}
                      {nivel.trimestre}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-2">
                    <p>{nivel._count.asignaturas} asignaturas</p>
                    <p>{nivel._count.competencias} competencias</p>
                    <p className="mt-1.5 inline-block rounded-full bg-ua-tint px-2 py-0.5 font-medium text-ua">
                      Reunión {nivel.reunionActualNumero}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="h-fit">
          <SectionLabel>Nuevo nivel</SectionLabel>
          <NuevoNivelForm />
        </Card>
      </div>
    </div>
  );
}
