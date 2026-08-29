"use client";

import { useEffect, useState } from "react";

type Seccion = { id: string; texto: string; cantidad?: number };

/**
 * Índice de la página, fijo en pantallas anchas. La vista de resultados es
 * larga por naturaleza (participación, recomendaciones, acuerdos y evidencia):
 * sin un índice, revisar un punto en medio de la reunión obliga a rodar a ciegas.
 */
export function Indice({ secciones }: { secciones: Seccion[] }) {
  const [activa, setActiva] = useState(secciones[0]?.id);

  useEffect(() => {
    const nodos = secciones
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (nodos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    nodos.forEach((n) => observador.observe(n));
    return () => observador.disconnect();
  }, [secciones]);

  return (
    <nav aria-label="Secciones de la página" className="sticky top-24 hidden lg:block print:hidden">
      <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
        En esta página
      </p>
      <ul className="flex flex-col gap-0.5 border-l border-border">
        {secciones.map((s) => {
          const esta = activa === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={esta ? "true" : undefined}
                className={`-ml-px flex items-center justify-between gap-2 border-l-2 py-1.5 pl-3.5 pr-2 text-sm transition-colors ${
                  esta
                    ? "border-l-ua font-medium text-foreground"
                    : "border-l-transparent text-muted hover:border-l-border-strong hover:text-foreground"
                }`}
              >
                {s.texto}
                {s.cantidad !== undefined && s.cantidad > 0 && (
                  <span className="font-mono text-[0.68rem] tabular-nums text-muted-2">
                    {s.cantidad}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
