import Link from "next/link";
import Image from "next/image";
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
    <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 overflow-hidden px-6 py-16">
      <div aria-hidden="true" className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-ua/10 blur-3xl" />
      <div className="relative">
        <Link href="/" className="mb-12 inline-flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-white shadow-sm"><Image src="/logo-ua.png" alt="" width={30} height={24} className="h-auto w-7" /></span><span className="text-sm font-semibold">Comunidades Académicas</span></Link>
        <p className="font-mono text-[0.68rem] font-medium tracking-[.14em] text-ua">ENTRADA DOCENTE</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Tu mirada importa.</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">Ingresa al nivel con el código que recibiste. No necesitas contraseña y responder toma unos minutos.</p>
      </div>

      <Card className="relative animate-fade-in !rounded-[2rem] !p-6 sm:!p-9">
        <form action={entrarPorCodigo} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nivel">
              <select className={inputClass} name="numero" defaultValue="1" required>
                {Array.from({ length: 14 }, (_, i) => <option key={i + 1} value={i + 1}>Nivel {i + 1}</option>)}
              </select>
            </Field>
            <Field label="Modalidad">
              <select className={inputClass} name="modalidad" defaultValue="DIURNO" required>
                <option value="DIURNO">Diurno</option>
                <option value="VESPERTINO_TECH">Vespertino</option>
              </select>
            </Field>
          </div>
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

          <p id="ayuda-codigo" className="-mt-2 text-xs leading-relaxed text-muted-2">
            Te lo entrega quien coordina. Sirve para abrir el curso correcto sin contraseña.
          </p>

          {error && <p className="text-sm text-incipiente">{error}</p>}

          <Button type="submit" className="mt-1 w-full">
            Ver mis asignaturas <span aria-hidden="true">→</span>
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
        <Link href="/" className="font-medium text-ua hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
