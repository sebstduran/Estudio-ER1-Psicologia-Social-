import Link from "next/link";
import { entrarPorCodigo } from "@/lib/actions/evaluar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button, Card, Field, inputClass } from "@/components/ui";

/**
 * Puerta del docente que llegó al sitio sin el enlace. El enlace sigue siendo
 * el camino normal —quien lo tiene nunca ve esta pantalla—; esto existe para
 * quien borró el mensaje y hoy se quedaba fuera y tenía que escribirle a su
 * coordinación.
 */
export default async function DocentePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // Quien coordina no tiene por qué andar buscando su propio código para mirar
  // lo que verán sus docentes. Son sus niveles: ya los puede ver enteros desde
  // su casilla, así que enseñárselos aquí no revela nada que no fuera suyo.
  const sesion = await auth();
  const misNiveles = sesion?.user?.id
    ? await prisma.nivel.findMany({
        where: { coordinadorId: sesion.user.id },
        select: { id: true, nombre: true, codigo: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-7 px-6 py-20 sm:py-28">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar como docente</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Vas a contar cómo ves a tu curso en las competencias que trabaja tu asignatura.
          Toma unos 5 minutos y no necesitas cuenta ni contraseña.
        </p>
      </div>

      <Card className="animate-fade-in">
        <form action={entrarPorCodigo} className="flex flex-col gap-4">
          <Field label="Código del nivel">
            <input
              className={`${inputClass} text-center font-mono text-lg tracking-[0.35em] uppercase`}
              type="text"
              name="codigo"
              required
              autoFocus
              maxLength={9}
              placeholder="A3F91C"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-describedby="ayuda-codigo"
            />
          </Field>

          <p id="ayuda-codigo" className="-mt-1 text-xs leading-relaxed text-muted-2">
            Son 6 caracteres. Te lo da quien coordina tu CCAA, junto al enlace.
          </p>

          {error && <p className="text-sm text-incipiente">{error}</p>}

          <Button type="submit" className="mt-1 w-full">
            Continuar
          </Button>
        </form>
      </Card>

      {misNiveles.length > 0 && (
        <Card className="border-dashed">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
            Porque estás coordinando
          </p>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
            Entra directo a ver lo que verán tus docentes, sin escribir el código.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {misNiveles.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/evaluar/${n.id}`}
                  className="flex items-center justify-between gap-3 rounded-[9px] border border-border px-3.5 py-2.5 transition-colors hover:border-ua"
                >
                  <span className="min-w-0 truncate text-[0.8125rem] font-medium">{n.nombre}</span>
                  <span className="shrink-0 font-mono text-[0.7rem] tracking-[0.12em] text-muted-2">
                    {n.codigo}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-center text-sm text-muted">
        ¿Tienes el enlace que te mandaron? Ábrelo y entras directo.
        <br />
        <Link href="/" className="font-medium text-ua hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
