"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export type NivelDelRail = { id: string; nombre: string };

/**
 * Barra superior. Sustituye a la barra lateral, que ocupaba una columna entera
 * para tres enlaces y se leía como un menú: un menú invita a elegir, y aquí no
 * hay nada que elegir — hay un orden que seguir.
 *
 * Dentro de un nivel, la segunda fila es la ruta del instrumento numerada:
 * 1 Configurar · 2 Responden · 3 El análisis. Los pasos ya recorridos quedan
 * marcados, así que la pantalla dice siempre dónde estás y qué viene.
 */

const PASOS = [
  { n: 1, texto: "Configurar", ruta: (id: string) => `/niveles/${id}` },
  { n: 2, texto: "Responden", ruta: (id: string) => `/evaluar/${id}` },
  { n: 3, texto: "El análisis", ruta: (id: string) => `/niveles/${id}/resultados` },
] as const;

export function BarraSuperior({
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

  const pasoActivo = !nivel
    ? 0
    : ruta.endsWith("/resultados")
      ? 3
      : ruta.startsWith("/evaluar/")
        ? 2
        : 1;

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
          className={`rounded-lg px-2.5 py-1.5 text-[0.8125rem] transition-colors hover:bg-surface-hover ${
            ruta === "/niveles" ? "font-medium text-foreground" : "text-muted"
          }`}
        >
          Mis niveles
        </Link>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <span className="hidden text-[0.8125rem] text-muted sm:inline">{nombre}</span>
          {salir}
        </div>
      </div>

      {nivel && (
        <div className="border-t border-border">
          <nav
            aria-label="Pasos del nivel"
            className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-6"
          >
            {PASOS.map((p) => {
              const activo = p.n === pasoActivo;
              const recorrido = p.n < pasoActivo;
              return (
                <Link
                  key={p.n}
                  href={p.ruta(nivel.id)}
                  aria-current={activo ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[0.8125rem] transition-colors ${
                    activo
                      ? "border-ua font-medium text-foreground"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[0.625rem] font-medium ${
                      activo
                        ? "bg-ua text-white"
                        : recorrido
                          ? "bg-logrado-tint text-logrado"
                          : "bg-surface-muted text-muted-2"
                    }`}
                  >
                    {recorrido ? "✓" : p.n}
                  </span>
                  {p.texto}
                </Link>
              );
            })}
            <span className="ml-auto hidden truncate py-2.5 text-[0.8125rem] text-muted-2 sm:block">
              {nivel.nombre}
            </span>
          </nav>
        </div>
      )}
    </header>
  );
}
