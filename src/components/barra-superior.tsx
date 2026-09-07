"use client";

import Link from "next/link";
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
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-6">
        {/* El logotipo vuelve a la PORTADA, no al panel: es el único camino de
            regreso a la elección coordinación / docente una vez dentro. */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-ua text-[0.6875rem] font-semibold text-white">
            UA
          </span>
          <span className="text-[0.9375rem] font-medium tracking-tight">Instrumento CCAA</span>
        </Link>

        <Link
          href="/niveles"
          className="rounded-lg px-2.5 py-1.5 text-[0.8125rem] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          Mis niveles
        </Link>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <span className="hidden text-[0.8125rem] text-muted sm:inline">{nombre}</span>
          {salir}
        </div>
      </div>
    </header>
  );
}
