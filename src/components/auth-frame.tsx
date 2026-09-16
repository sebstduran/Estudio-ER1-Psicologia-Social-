import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[#f4f3f0] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#111318] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Image src="/campus-comunidad.jpg" alt="" fill priority sizes="55vw" className="hero-cinematic-media object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,15,19,.48),rgba(13,15,19,.86)_78%,rgba(13,15,19,.96))]" />
        <div aria-hidden="true" className="hero-light-orb absolute -left-32 -top-28 h-[30rem] w-[30rem] rounded-full bg-ua/38 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-white shadow-lg">
            <Image src="/logo-ua.png" alt="" width={34} height={28} className="h-auto w-8" />
          </span>
          <span className="text-sm font-medium">Comunidades Académicas</span>
        </Link>
        <div className="liquid-glass relative max-w-xl rounded-[2rem] p-8">
          <p className="font-mono text-xs uppercase tracking-[.16em] text-white/40">Psicología · CCAA</p>
          <p className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-.055em]">Una conversación que termina en una decisión.</p>
          <div className="mt-8 flex items-center gap-3 text-sm text-white/52"><span className="h-px w-10 bg-[#e16a7e]" /> Evidencia, seguimiento y acuerdos.</div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 sm:px-10">
        <div aria-hidden="true" className="absolute -right-28 top-10 h-96 w-96 rounded-full bg-ua-tint-strong/70 blur-3xl" />
        <div className="w-full max-w-md animate-fade-in">
          <Link href="/" className="mb-12 inline-flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-white shadow-sm"><Image src="/logo-ua.png" alt="" width={30} height={24} className="h-auto w-7" /></span>
            <span className="text-sm font-semibold">Comunidades Académicas</span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-ua">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">{title}</h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">{description}</p>
          <div className="mt-9">{children}</div>
        </div>
      </section>
    </main>
  );
}
