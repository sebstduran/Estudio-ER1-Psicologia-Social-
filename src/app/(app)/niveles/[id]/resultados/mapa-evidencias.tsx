import type { CompetenciaDiagnostico, IndicadorDiagnostico, Severidad } from "@/lib/diagnostico";
import { Ayuda, Medidor, Panel, Trayectoria } from "@/components/ui";

const CELDA: Record<Severidad, string> = {
  CRITICO: "border-incipiente-line bg-incipiente-tint text-incipiente",
  EN_RIESGO: "border-proceso-line bg-proceso-tint text-proceso",
  CONSOLIDADO: "border-logrado-line bg-logrado-tint text-logrado",
  SIN_DATOS: "border-dashed border-border text-muted-2",
};

const LLENO: Record<Severidad, 0 | 1 | 2 | 3> = {
  CRITICO: 1,
  EN_RIESGO: 2,
  CONSOLIDADO: 3,
  SIN_DATOS: 0,
};

const NOMBRE: Record<Severidad, string> = {
  CRITICO: "crítico",
  EN_RIESGO: "en riesgo",
  CONSOLIDADO: "logrado",
  SIN_DATOS: "sin evaluar",
};

function Celda({ i }: { i: IndicadorDiagnostico }) {
  const tieneFoco = i.focosMarcados > 0;
  const descripcion =
    `${i.texto} — ` +
    (i.score === null
      ? tieneFoco
        ? `${i.focosMarcados} ${i.focosMarcados === 1 ? "mención" : "menciones"} como foco`
        : "sin evaluar"
      : `${Math.round(i.score)} de 100, ${NOMBRE[i.severidad]}`) +
    (i.disenso ? ". Criterio no compartido entre docentes" : "");
  const tono = i.score === null && tieneFoco
    ? "border-proceso-line bg-proceso-tint text-proceso"
    : CELDA[i.severidad];

  return (
    <div
      role="img"
      aria-label={descripcion}
      title={descripcion}
      tabIndex={0}
      className={`flex items-center justify-between gap-2 rounded-[7px] border px-2.5 py-2.5 ${tono}`}
    >
      {/* El signo antes del medidor: se ve en blanco y negro y se nombra. */}
      {i.disenso && (
        <span className="-mr-0.5 text-xs font-semibold text-muted" aria-hidden="true">
          ⇄
        </span>
      )}
      {i.score === null && tieneFoco ? (
        <span className="text-xs font-semibold" aria-hidden="true">◆</span>
      ) : (
        <Medidor lleno={LLENO[i.severidad]} />
      )}
      <span className="font-mono text-[0.8125rem] font-medium tabular-nums">
        {i.score === null ? (tieneFoco ? `${i.focosMarcados}×` : "—") : Math.round(i.score)}
      </span>
    </div>
  );
}

/**
 * Competencias en filas, evidencias en columnas. Es la vista que responde de
 * un vistazo la única pregunta con la que se entra a la reunión: dónde está el
 * problema. Cada celda lleva su puntaje y un medidor de tres segmentos, así
 * que la severidad no depende del color.
 */
export function MapaEvidencias({ competencias }: { competencias: CompetenciaDiagnostico[] }) {
  // La rejilla asume tres evidencias por competencia, que es la forma del
  // instrumento. Si alguna trajera otra cantidad, la tabla mentiría.
  const columnas = Math.max(...competencias.map((c) => c.indicadores.length), 3);

  return (
    <Panel
      titulo="Dónde está el problema"
      apoyo="Cada cuadro es una evidencia que evaluaron tus docentes."
      derecha={
        <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[0.6875rem] text-muted-2">
          <Leyenda cls="border-incipiente-line bg-incipiente-tint">Crítico</Leyenda>
          <Leyenda cls="border-proceso-line bg-proceso-tint">En riesgo</Leyenda>
          <Leyenda cls="border-logrado-line bg-logrado-tint">Logrado</Leyenda>
          <Leyenda cls="border-proceso-line bg-proceso-tint">Foco docente</Leyenda>
        </div>
      }
      className="!p-0 [&>div:last-child]:p-0"
    >
      <div className="overflow-x-auto p-5">
        <div
          className="grid min-w-[700px] gap-1"
          style={{
            gridTemplateColumns: `minmax(168px,1.4fr) repeat(${columnas}, minmax(100px,1fr)) 148px`,
          }}
        >
          <Cabecera />
          {Array.from({ length: columnas }, (_, k) => (
            <Cabecera key={k}>Evidencia {k + 1}</Cabecera>
          ))}
          <Cabecera derecha>R1 → hoy</Cabecera>

          {competencias.map((c) => (
            <div key={c.id} className="group contents">
              <div className="flex min-w-0 items-center gap-2.5 py-2.5 pl-0.5 pr-2.5">
                <b className="shrink-0 font-mono text-xs font-medium text-muted-2">{c.codigo}</b>
                <span className="truncate text-[0.8125rem] font-medium">{c.nombre}</span>
              </div>

              {c.indicadores.map((i) => (
                <Celda key={i.id} i={i} />
              ))}

              <div className="flex items-center justify-end gap-2.5 py-2 pl-2.5 pr-0.5">
                <Trayectoria puntos={c.trayectoria} />
                <b
                  className={`font-mono text-[1.0625rem] font-medium tabular-nums tracking-tight ${
                    c.score === null ? "text-muted-2" : ""
                  }`}
                >
                  {c.score === null ? "—" : Math.round(c.score)}
                </b>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Ayuda pregunta="¿Cómo se lee esta tabla?">
        El puntaje de la competencia resume cómo ve el equipo al curso. En los elementos
        curriculares, ◆ indica cuántas veces fueron elegidos como foco para reforzar; no es un
        puntaje inventado. Cuando existe una evaluación detallada anterior, aparece su valor de
        0 a 100. La línea de la derecha muestra el cambio desde la primera reunión y ⇄ señala
        criterios no compartidos entre docentes.
      </Ayuda>
    </Panel>
  );
}

function Cabecera({ children, derecha }: { children?: React.ReactNode; derecha?: boolean }) {
  return (
    <div
      className={`px-1 pb-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.085em] text-muted-2 ${
        derecha ? "text-right" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Leyenda({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-[9px] w-[9px] shrink-0 rounded-[2px] border ${cls}`} />
      {children}
    </span>
  );
}
