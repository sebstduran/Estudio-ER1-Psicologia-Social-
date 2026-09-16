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
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center overflow-hidden px-4 py-6 sm:px-6 sm:py-10">
      <div aria-hidden="true" className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-ua/10 blur-3xl" />
      <Link href="/" className="relative mb-6 inline-flex w-fit items-center gap-3 px-2"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/80 bg-white shadow-sm"><Image src="/logo-ua.png" alt="" width={30} height={24} className="h-auto w-7" /></span><span className="text-sm font-semibold">Comunidades Académicas</span></Link>

      <main className="relative grid overflow-hidden rounded-[2rem] bg-[#15171c] shadow-[0_38px_100px_-56px_rgba(17,19,24,.72)] lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative min-h-[18rem] overflow-hidden p-7 text-white sm:p-10 lg:min-h-[38rem] lg:p-12">
          <Image src="/campus-comunidad.jpg" alt="" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="hero-cinematic-media object-cover object-[62%_center]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,14,18,.2),rgba(12,14,18,.9))]" />
          <div className="relative flex h-full min-h-[14rem] flex-col justify-end lg:min-h-[32rem]">
            <p className="font-mono text-[0.68rem] font-medium tracking-[.14em] text-white/54">ENTRADA DOCENTE</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Tu mirada importa.</h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/62">Entra, elige tu nombre y responde sobre las asignaturas que realizas. No necesitas cuenta ni correo.</p>
          </div>
        </section>

        <section className="flex items-center bg-[#f7f6f3] p-6 sm:p-10 lg:p-12">
          <div className="w-full animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-[.15em] text-ua">Comenzar</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Usa el enlace o código recibido.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">Si abriste el enlace enviado por la coordinación, llegarás directamente al nivel. Si no, escribe el código aquí.</p>
            <Card className="mt-7 !rounded-[1.6rem] !p-5 sm:!p-7">
              <form action={entrarPorCodigo} className="flex flex-col gap-5">
                <Field label="Código de acceso">
                  <input className={`${inputClass} text-center font-mono text-lg tracking-[0.35em] uppercase`} type="text" name="codigo" required autoFocus maxLength={9} placeholder="A3F91C" autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-describedby="ayuda-codigo" />
                </Field>
                <p id="ayuda-codigo" className="-mt-2 text-xs leading-relaxed text-muted-2">Abriremos el nivel correcto. No tendrás que configurar nada.</p>
                {error && <p className="text-sm text-incipiente">{error}</p>}
                <Button type="submit" className="mt-1 w-full">Comenzar a responder <span aria-hidden="true">→</span></Button>
              </form>
            </Card>
            <p className="mt-7 text-center text-sm text-muted"><Link href="/" className="font-medium text-ua hover:underline">Volver al inicio</Link></p>
          </div>
        </section>
      </main>
    </div>
  );
}
