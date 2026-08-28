import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCoordinador } from "@/lib/require-coordinador";
import { Card } from "@/components/ui";
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis niveles</h1>
          <p className="mt-1 text-sm text-muted">
            Cada nivel es una instancia del instrumento: un ciclo, una modalidad, un trimestre.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {niveles.length === 0 && (
            <Card className="text-sm text-muted">
              Todavía no tienes niveles configurados. Crea el primero con el formulario.
            </Card>
          )}
          {niveles.map((nivel) => (
            <Link key={nivel.id} href={`/niveles/${nivel.id}`}>
              <Card className="transition-colors hover:border-ua">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium">{nivel.nombre}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {CICLO_LABEL[nivel.cicloTipo]} · {MODALIDAD_LABEL[nivel.modalidad]} ·{" "}
                      {nivel.trimestre}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <p>{nivel._count.asignaturas} asignaturas</p>
                    <p>{nivel._count.competencias} competencias</p>
                    <p className="mt-1 text-ua">Reunión {nivel.reunionActualNumero}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="h-fit">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Nuevo nivel
          </h2>
          <NuevoNivelForm />
        </Card>
      </div>
    </div>
  );
}
