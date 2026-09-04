import type { ReactNode } from "react";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BarraSuperior } from "@/components/barra-superior";

/**
 * Marco de las pantallas del coordinador.
 *
 * La navegación va arriba y no en una columna lateral: la lateral gastaba una
 * columna entera en tres enlaces y se leía como un menú, cuando aquí no hay
 * nada que elegir — hay un orden que seguir. Arriba cabe como ruta numerada y
 * deja todo el ancho a lo único que importa, que es el contenido.
 */
export async function Cascara({ children }: { children: ReactNode }) {
  const sesion = await auth();

  if (!sesion?.user) return <>{children}</>;

  const niveles = await prisma.nivel.findMany({
    where: { coordinadorId: sesion.user.id },
    select: { id: true, nombre: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <BarraSuperior
        niveles={niveles}
        nombre={sesion.user.name ?? "Coordinación"}
        salir={
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="rounded-lg px-2.5 py-1.5 text-[0.8125rem] text-muted transition-colors hover:bg-surface-hover hover:text-foreground">
              Salir
            </button>
          </form>
        }
      />
      <main className="min-w-0">{children}</main>
    </>
  );
}
