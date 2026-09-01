import Link from "next/link";
import { requireCoordinador } from "@/lib/require-coordinador";
import { resumenNiveles, type ResumenNivel } from "@/lib/panel";
import { Button, Card } from "@/components/ui";
import { NuevoNivelPanel } from "./nuevo-nivel-panel";

const CICLO_LABEL = {
  INICIAL: "Ciclo Inicial",
  INTERMEDIO: "Ciclo Intermedio",
  FINAL: "Ciclo Final",
} as const;

const MODALIDAD_LABEL = { DIURNO: "Diurno", VESPERTINO_TECH: "Vespertino/TECH" } as const;

const FASE_LABEL = {
  BASE: "línea base",
  SEGUIMIENTO: "seguimiento",
  CIERRE: "cierre",
} as const;

/** Reparto de severidad como una sola barra: la salud del nivel de un vistazo. */
function BarraSalud({ s }: { s: ResumenNivel["severidades"] }) {
  const total = s.CRITICO + s.EN_RIESGO + s.CONSOLIDADO + s.SIN_DATOS;
  if (total === 0) return null;
  const tramos = [
    { n: s.CRITICO, cls: "bg-incipiente", label: "críticas" },
    { n: s.EN_RIESGO, cls: "bg-proceso", label: "en riesgo" },
    { n: s.CONSOLIDADO, cls: "bg-logrado", label: "consolidadas" },
    { n: s.SIN_DATOS, cls: "bg-surface-muted", label: "sin evaluar" },
  ].filter((t) => t.n > 0);

  return (
    <div
      className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
      role="img"
      aria-label={tramos.map((t) => `${t.n} ${t.label}`).join(", ")}
    >
      {tramos.map((t) => (
        <div
          key={t.label}
          className={`h-full first:rounded-l-full last:rounded-r-full ${t.cls}`}
          style={{ width: `${(t.n / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

function TarjetaNivel({ n }: { n: ResumenNivel }) {
  const enConfiguracion = n.pasoConfiguracion < 5;
  const necesitanTrabajo = n.severidades.CRITICO + n.severidades.EN_RIESGO;

  // El titular de la tarjeta responde "¿qué tengo que hacer con este nivel?".
  const titular = enConfiguracion
    ? { texto: `Configuración a medio camino · paso ${n.pasoConfiguracion} de 4`, tono: "text-muted" }
    : !n.evaluado
      ? { texto: "Esperando que los docentes evalúen", tono: "text-muted" }
      : necesitanTrabajo > 0
        ? {
            texto: `${necesitanTrabajo} ${necesitanTrabajo === 1 ? "competencia necesita" : "competencias necesitan"} trabajo`,
            tono: n.severidades.CRITICO > 0 ? "text-incipiente" : "text-proceso",
          }
        : { texto: "Todas las competencias evaluadas alcanzan el estándar", tono: "text-logrado" };

  return (
      <Card
        className={`flex h-full flex-col transition-colors hover:border-border-strong ${n.severidades.CRITICO > 0 && n.evaluado ? "border-l-[3px] border-l-incipiente" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-2">
              {CICLO_LABEL[n.ciclo as keyof typeof CICLO_LABEL]} ·{" "}
              {MODALIDAD_LABEL[n.modalidad as keyof typeof MODALIDAD_LABEL]} · {n.trimestre}
            </p>
            <h2 className="mt-1 truncate text-xl font-medium">
              <Link
                href={`/niveles/${n.id}`}
                className="transition-colors hover:text-ua focus-visible:text-ua"
              >
                {n.nombre}
              </Link>
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-ua-tint px-2.5 py-1 font-mono text-[0.68rem] font-medium text-ua">
            R{n.reunionNumero}
            {n.reunionFase && (
              <span className="ml-1 font-sans opacity-80">
                {FASE_LABEL[n.reunionFase as keyof typeof FASE_LABEL]}
              </span>
            )}
          </span>
        </div>

        <p className={`mt-3 text-sm font-medium ${titular.tono}`}>{titular.texto}</p>

        <div className="mt-4">
          {enConfiguracion ? (
            <div className="flex gap-1.5" aria-label={`Paso ${n.pasoConfiguracion} de 4`}>
              {[1, 2, 3, 4].map((p) => (
                <span
                  key={p}
                  className={`h-2 flex-1 rounded-full ${p < n.pasoConfiguracion ? "bg-ua" : "bg-surface-muted"}`}
                />
              ))}
            </div>
          ) : (
            <BarraSalud s={n.severidades} />
          )}
        </div>

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-xs">
          <div>
            <dt className="text-muted-2">Docentes</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {n.evaluado ? `${n.docentesQueRespondieron} de ${n.docentes}` : n.docentes}
              {n.evaluado && <span className="ml-1 font-normal text-muted-2">respondieron</span>}
            </dd>
          </div>
          <div>
            <dt className="text-muted-2">Asignaturas</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{n.asignaturas}</dd>
          </div>
          {n.acuerdosAbiertos > 0 && (
            <div>
              <dt className="text-muted-2">Acuerdos abiertos</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-proceso">{n.acuerdosAbiertos}</dd>
            </div>
          )}
        </dl>

        {/* Accesos directos: desde el panel se llega en un clic a lo que toca. */}
        <div className="mt-5 flex flex-wrap gap-2 pt-1">
          {enConfiguracion ? (
            <Link href={`/niveles/${n.id}`}>
              <Button size="sm">Continuar configuración</Button>
            </Link>
          ) : (
            <>
              <Link href={`/niveles/${n.id}/resultados`}>
                <Button size="sm" variant={n.evaluado ? "primary" : "secondary"}>
                  {n.evaluado ? "Ver qué fortalecer" : "Ver estado"}
                </Button>
              </Link>
              <Link href={`/niveles/${n.id}`}>
                <Button size="sm" variant="ghost">
                  Configurar
                </Button>
              </Link>
            </>
          )}
        </div>
      </Card>
  );
}

/**
 * Los tres pasos del instrumento, siempre a la vista. Quien coordina entra unas
 * pocas veces por trimestre: entre una reunión y la siguiente pasan semanas y
 * no tiene por qué recordar el orden. Se queda fijo y compacto en vez de
 * esconderse tras un "¿cómo funciona?", que nadie abre.
 */
const PASOS = [
  {
    titulo: "Configura el nivel",
    cuando: "Una vez por trimestre",
    texto:
      "Declara el ciclo y la modalidad, agrega las asignaturas y quién hace clases en cada una, y marca qué competencia trabaja cada asignatura.",
  },
  {
    titulo: "Pide a tus docentes que respondan",
    cuando: "Antes de cada reunión",
    texto:
      "Mándales el enlace o dicta el código del nivel. Cada docente califica solo lo que le toca, en unos 5 minutos y sin crear cuenta.",
  },
  {
    titulo: "Mira qué fortalecer y anota los acuerdos",
    cuando: "En la reunión",
    texto:
      "Ves qué competencias están abajo y por qué, pides las recomendaciones, y dejas cada acuerdo con responsable y plazo.",
  },
] as const;

function ComoFunciona() {
  return (
    <section aria-labelledby="como-funciona" className="mb-10">
      <h2
        id="como-funciona"
        className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-2"
      >
        Cómo funciona
      </h2>
      <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        {PASOS.map((p, i) => (
          <li key={p.titulo} className="flex flex-col bg-surface p-5">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ua-tint font-mono text-[0.7rem] font-medium text-ua">
                {i + 1}
              </span>
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-muted-2">
                {p.cuando}
              </span>
            </div>
            <h3 className="text-[0.95rem] font-medium leading-snug">{p.titulo}</h3>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">{p.texto}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-2">
        Los pasos 2 y 3 se repiten en cada reunión del trimestre. La primera queda como
        línea base y todo se compara contra ella, así se ve si algo se movió.
      </p>
    </section>
  );
}

export default async function NivelesPage() {
  const user = await requireCoordinador();
  const niveles = await resumenNiveles(user.id);

  const conAtencion = niveles.filter(
    (n) => n.pasoConfiguracion === 5 && n.evaluado && n.severidades.CRITICO > 0
  ).length;
  const acuerdosAbiertos = niveles.reduce((s, n) => s + n.acuerdosAbiertos, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {niveles.length === 0 ? `Hola, ${user.name?.split(" ")[0] ?? ""}` : "Mis niveles"}
          </h1>
          <p className="mt-1.5 text-[0.95rem] text-muted">
            {niveles.length === 0
              ? "Un nivel es una instancia del instrumento: un ciclo, una modalidad, un trimestre."
              : conAtencion > 0
                ? `${conAtencion} ${conAtencion === 1 ? "nivel tiene" : "niveles tienen"} competencias en estado crítico.`
                : acuerdosAbiertos > 0
                  ? `${acuerdosAbiertos} ${acuerdosAbiertos === 1 ? "acuerdo abierto" : "acuerdos abiertos"} en tus niveles.`
                  : "Sin alertas activas."}
          </p>
        </div>
        {niveles.length > 0 && <NuevoNivelPanel />}
      </div>

      <ComoFunciona />

      {niveles.length === 0 ? (
        <Card className="flex flex-col items-start gap-5 p-8">
          <div className="max-w-prose">
            <h2 className="text-xl font-medium">Crea tu primer nivel</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Declara el ciclo y la modalidad, y el instrumento arma solo las reuniones del
              trimestre: la primera queda como línea base y la última como cierre comparativo.
              Si es Ciclo Inicial, además carga sus seis competencias con sus indicadores.
            </p>
          </div>
          <NuevoNivelPanel abiertoPorDefecto />
        </Card>
      ) : (
        <div className={`grid gap-4 ${niveles.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {niveles.map((n) => (
            <TarjetaNivel key={n.id} n={n} />
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
