import Link from "next/link";
import Image from "next/image";
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
    <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 overflow-hidden px-6 py-16">
      <div aria-hidden="true" className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-ua/10 blur-3xl" />
      <div className="relative">
        <Link href="/" className="mb-12 inline-flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-white shadow-sm"><Image src="/logo-ua.png" alt="" width={30} height={24} className="h-auto w-7" /></span><span className="text-sm font-semibold">Comunidades Académicas</span></Link>
        <p className="font-mono text-[0.68rem] font-medium tracking-[.14em] text-ua">ENTRADA DOCENTE</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Tu mirada importa.</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">Abre el enlace que te envió la coordinación. Si no lo tienes, escribe aquí el código recibido.</p>
      </div>

      <Card className="relative animate-fade-in !rounded-[2rem] !p-6 sm:!p-9">
        <form action={entrarPorCodigo} className="flex flex-col gap-5">
          <Field label="Código de acceso">
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

          <p id="ayuda-codigo" className="-mt-2 text-xs leading-relaxed text-muted-2">
            Con este código abriremos directamente el nivel correcto. No tienes que configurarlo.
          </p>

          {error && <p className="text-sm text-incipiente">{error}</p>}

          <Button type="submit" className="mt-1 w-full">
            Comenzar a responder <span aria-hidden="true">→</span>
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-muted">
        <Link href="/" className="font-medium text-ua hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
