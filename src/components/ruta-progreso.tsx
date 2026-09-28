type Etapa = {
  numero: number;
  titulo: string;
  apoyo: string;
};

export function RutaProgreso({
  etapas,
  actual,
  className = "",
}: {
  etapas: readonly Etapa[];
  actual: number;
  className?: string;
}) {
  return (
    <nav
      aria-label="Proceso de la comunidad académica"
      className={`rounded-[1.35rem] border border-white/70 bg-surface/70 p-1.5 shadow-[0_18px_48px_-40px_rgba(17,19,24,.42)] backdrop-blur-xl ${className}`}
    >
      <ol className="grid grid-cols-4 gap-1">
        {etapas.map((etapa) => {
          const completa = etapa.numero < actual;
          const activa = etapa.numero === actual;

          return (
            <li
              key={etapa.numero}
              aria-current={activa ? "step" : undefined}
              aria-label={`${etapa.titulo}: ${completa ? "completado" : activa ? "paso actual" : "pendiente"}`}
              className={`min-w-0 rounded-[1rem] px-1.5 py-2.5 transition-colors sm:px-3.5 sm:py-3 ${
                activa
                  ? "bg-[#111318] text-white shadow-md"
                  : completa
                    ? "bg-logrado-tint text-foreground"
                    : "text-muted-2"
              }`}
            >
              <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[0.6rem] font-semibold ${
                    activa
                      ? "border-white/15 bg-white/10 text-white"
                      : completa
                        ? "border-logrado-line bg-logrado text-white"
                        : "border-border-strong bg-surface text-muted-2"
                  }`}
                >
                  {completa ? "✓" : `0${etapa.numero}`}
                </span>
                <span className="text-center text-[0.6rem] font-semibold leading-tight sm:truncate sm:text-left sm:text-sm">{etapa.titulo}</span>
              </div>
              <span className={`mt-1.5 hidden truncate pl-8 text-[0.65rem] lg:block ${activa ? "text-white/48" : "text-muted-2"}`}>
                {etapa.apoyo}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
