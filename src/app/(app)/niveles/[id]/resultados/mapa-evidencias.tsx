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
  const descripcion =
    `${i.texto} — ` +
    (i.score === null ? "sin evaluar" : `${Math.round(i.score)} de 100, ${NOMBRE[i.severidad]}`) +
    (i.disenso ? ". Criterio no compartido entre docentes" : "");

  return (
    <div
      role="img"
      aria-label={descripcion}
      title={descripcion}
      tabIndex={0}
      className={`flex items-center justify-between gap-2 rounded-[7px] border px-2.5 py-2.5 ${CELDA[i.severidad]}`}
    >
      {/* El signo antes del medidor: se ve en blanco y negro y se nombra. */}
      {i.disenso && (
        <span className="-mr-0.5 text-xs font-semibold text-muted" aria-hidden="true">
          ⇄
        </span>
      )}
      <Medidor lleno={LLENO[i.severidad]} />
      <span className="font-mono text-[0.8125rem] font-medium tabular-nums">
        {i.score === null ? "—" : Math.round(i.score)}
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
        El número va de 0 a 100 y resume cómo evaluaron tus docentes esa evidencia: 100 es que
        todos la dieron por lograda, 0 que ninguno. Las barritas de la izquierda repiten lo mismo
        sin depender del color. La línea de la derecha muestra si la competencia subió, bajó o
        quedó igual desde la primera reunión del trimestre. El signo ⇄ marca las evidencias donde
        tus docentes no coincidieron: ahí el puntaje está midiendo dos cosas distintas.
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
