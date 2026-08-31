"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export type NivelDelRail = { id: string; nombre: string };

/**
 * Barra lateral de la aplicación. Muestra el flujo real del instrumento —
 * configurar, evaluar, qué fortalecer — sólo cuando estás dentro de un nivel,
 * porque fuera de él esos enlaces no llevan a ninguna parte.
 *
 * Es cliente porque la sección activa se deduce de la ruta, y `usePathname`
 * evita tener que pasar el estado de navegación por cada página.
 */
export function Rail({
  niveles,
  nombre,
  salir,
}: {
  niveles: NivelDelRail[];
  nombre: string;
  salir: ReactNode;
}) {
  const ruta = usePathname();
  const enNivel = ruta.match(/^\/niveles\/([^/]+)/)?.[1];
  const nivel = niveles.find((n) => n.id === enNivel);

  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="sticky top-0 z-40 flex h-auto shrink-0 lg:self-start flex-row items-center gap-3 overflow-x-auto border-b border-border bg-surface px-3.5 py-2.5 lg:h-screen lg:w-[236px] lg:flex-col lg:items-stretch lg:gap-6 lg:overflow-visible lg:border-b-0 lg:border-r lg:px-3 lg:py-4 print:hidden">
      <Link href="/niveles" className="flex shrink-0 items-center gap-2.5 px-2 lg:pt-1">
        <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-lg bg-ua font-mono text-[0.6rem] font-medium text-white dark:text-[#1a0d10]">
          UA
        </span>
        <span className="hidden leading-tight lg:block">
          <span className="block text-[0.8125rem] font-semibold tracking-tight">
            Instrumento CCAA
          </span>
          <span className="block text-[0.6875rem] text-muted-2">Psicología · EPG</span>
        </span>
      </Link>

      <nav className="flex shrink-0 flex-row gap-0.5 lg:flex-col" aria-label="General">
        <Enlace href="/niveles" activo={ruta === "/niveles"} icono={<IconoPanel />}>
          Mis niveles
        </Enlace>
      </nav>

      {nivel && (
        <nav
          className="flex shrink-0 flex-row gap-0.5 lg:flex-col"
          aria-label={`Nivel ${nivel.nombre}`}
        >
          <p className="hidden truncate px-2 pb-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.085em] text-muted-2 lg:block">
            {nivel.nombre}
          </p>
          <Enlace
            href={`/niveles/${nivel.id}`}
            activo={ruta === `/niveles/${nivel.id}`}
            icono={<IconoLista />}
          >
            Configurar
          </Enlace>
          <Enlace
            href={`/evaluar/${nivel.id}`}
            activo={ruta.startsWith("/evaluar/")}
            icono={<IconoCheck />}
          >
            Evaluar
          </Enlace>
          <Enlace
            href={`/niveles/${nivel.id}/resultados`}
            activo={ruta.endsWith("/resultados")}
            icono={<IconoBarras />}
          >
            Qué fortalecer
          </Enlace>
        </nav>
      )}

      <div className="ml-auto flex shrink-0 flex-row items-center gap-1 lg:ml-0 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-0.5">
        <ThemeToggle className={ESTILO_RAIL}>
          <span className="hidden lg:inline">Tema</span>
        </ThemeToggle>
        <div className="flex items-center gap-2.5 px-2 py-2 lg:mt-1.5 lg:border-t lg:border-border lg:px-2.5 lg:pt-3">
          <span
            className="grid h-[25px] w-[25px] shrink-0 place-items-center rounded-md bg-ua font-mono text-[0.625rem] font-medium text-white dark:text-[#1a0d10]"
            aria-hidden="true"
          >
            {iniciales}
          </span>
          <span className="hidden flex-1 truncate text-[0.8125rem] text-muted lg:block">
            {nombre}
          </span>
        </div>
        {salir}
      </div>
    </aside>
  );
}

/** Un ítem del rail. Se exporta el estilo para que ThemeToggle y Salir calcen. */
export const ESTILO_RAIL =
  "flex w-full items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 py-[7px] text-left text-[0.8125rem] text-muted transition-colors hover:bg-surface-hover hover:text-foreground";

function Enlace({
  href,
  activo,
  icono,
  children,
}: {
  href: string;
  activo: boolean;
  icono: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`${ESTILO_RAIL} ${activo ? "bg-surface-hover font-medium text-foreground" : ""}`}
    >
      <span className="shrink-0 opacity-75">{icono}</span>
      {children}
    </Link>
  );
}

const svg = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconoPanel() {
  return (
    <svg {...svg}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconoLista() {
  return (
    <svg {...svg}>
      <path d="M4 6h16M4 12h16M4 18h9" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg {...svg}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H16l4 4v10.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M8.5 13.5l2 2 4-4.5" />
    </svg>
  );
}

function IconoBarras() {
  return (
    <svg {...svg}>
      <path d="M5 19V11M12 19V5M19 19v-6" />
    </svg>
  );
}
