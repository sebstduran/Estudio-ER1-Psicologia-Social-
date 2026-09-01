import Link from "next/link";
import { entrarPorCodigo } from "@/lib/actions/evaluar";
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

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-7 px-6 py-20 sm:py-28">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar como docente</h1>
        <p className="mt-1.5 text-sm text-muted">
          No necesitas cuenta ni contraseña. Toma unos 5 minutos.
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
