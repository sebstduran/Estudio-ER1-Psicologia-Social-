"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export type NivelDelRail = { id: string; nombre: string };

/**
 * Barra superior. Sustituye a la barra lateral, que ocupaba una columna entera
 * para tres enlaces y se leía como un menú: un menú invita a elegir, y aquí no
 * hay nada que elegir — hay un orden que seguir.
 *
 * No contiene una segunda barra de pasos: el siguiente paso vive en la propia
 * pantalla del nivel. Repetir una ruta fija aquí parecía un menú adicional.
 */

export function BarraSuperior({
  niveles: _niveles,
  nombre,
  salir,
}: {
  niveles: NivelDelRail[];
  nombre: string;
  salir: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/6 bg-surface/88 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-4 px-6 lg:px-10">
        {/* El logotipo vuelve a la PORTADA, no al panel: es el único camino de
            regreso a la elección coordinación / docente una vez dentro. */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-white shadow-sm">
            <Image src="/logo-ua.png" alt="" width={30} height={24} className="h-auto w-7" />
          </span>
          <span className="hidden text-[0.9375rem] font-semibold tracking-tight sm:inline">Comunidades Académicas</span>
        </Link>

        <Link
          href="/niveles"
          className="rounded-full px-3.5 py-2 text-[0.8125rem] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          Mis niveles
        </Link>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <span className="hidden border-l border-border pl-3 text-[0.8125rem] text-muted md:inline">{nombre}</span>
          {salir}
        </div>
      </div>
    </header>
  );
}
