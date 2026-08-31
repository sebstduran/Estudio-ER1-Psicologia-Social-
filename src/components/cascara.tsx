import type { ReactNode } from "react";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ESTILO_RAIL, Rail } from "@/components/rail";

/**
 * Marco de la aplicación. Con sesión iniciada monta la barra lateral; sin
 * sesión —portada, login, registro, y el formulario que abren los docentes—
 * la página se dibuja sola, porque ahí no hay dónde navegar todavía.
 */
export async function Cascara({ children }: { children: ReactNode }) {
  const sesion = await auth();

  if (!sesion?.user) return <main className="min-h-screen">{children}</main>;

  const niveles = await prisma.nivel.findMany({
    where: { coordinadorId: sesion.user.id },
    select: { id: true, nombre: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">
      <Rail
        niveles={niveles}
        nombre={sesion.user.name ?? "Coordinación"}
        salir={
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className={ESTILO_RAIL}>
              <span className="shrink-0 opacity-75">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 17l5-5-5-5M20 12H9M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
                </svg>
              </span>
              <span className="hidden lg:inline">Salir</span>
            </button>
          </form>
        }
      />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
