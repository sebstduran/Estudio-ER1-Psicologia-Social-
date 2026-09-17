import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui";

/**
 * Puerta del docente que llegó al sitio sin el enlace. El enlace sigue siendo
 * el camino normal —quien lo tiene nunca ve esta pantalla—; esto existe para
 * quien borró el mensaje y hoy se quedaba fuera y tenía que escribirle a su
 * coordinación.
 */
export default function DocentePage() {
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
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/62">Abre tu enlace y responde sobre las asignaturas que realizas. No necesitas cuenta, correo ni contraseña.</p>
          </div>
        </section>

        <section className="flex items-center bg-[#f7f6f3] p-6 sm:p-10 lg:p-12">
          <div className="w-full animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-[.15em] text-ua">ACCESO DOCENTE</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Abre el enlace que recibiste.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">Es personal para esta reunión y te lleva directamente a tus asignaturas.</p>
            <Card className="mt-7 !rounded-[1.6rem] !p-5 sm:!p-7">
              <p className="text-sm font-semibold">¿No encuentras el mensaje?</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">Pide a quien coordina que vuelva a enviarte tu enlace. No tendrás que registrarte ni recordar una clave.</p>
            </Card>
            <p className="mt-7 text-center text-sm text-muted"><Link href="/" className="font-medium text-ua hover:underline">Volver al inicio</Link></p>
          </div>
        </section>
      </main>
    </div>
  );
}
