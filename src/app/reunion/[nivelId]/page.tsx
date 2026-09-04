import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCoordinador } from "@/lib/require-coordinador";
import { construirDiagnostico, type CompetenciaDiagnostico } from "@/lib/diagnostico";
import { informeVigente } from "@/lib/actions/informe";
import { acuerdosDelNivel } from "@/lib/actions/acuerdos";
import type { TipoInforme } from "@/lib/ai/informe";
import { AcuerdoForm } from "../../(app)/niveles/[id]/resultados/acuerdo-form";

/**
 * Modo reunión: el análisis conducido, para proyectar en Teams.
 *
 * Vive fuera del grupo (app) a propósito, así no arrastra la barra superior:
 * al compartir pantalla no debe verse nada que no sea el contenido.
 *
 * Decisiones tomadas por el medio, no por gusto. Teams reescala y comprime la
 * pantalla compartida: los grises suaves se vuelven barro y la letra de trabajo
 * se pierde. Por eso tipografía grande, contraste alto y fondo claro — el fondo
 * oscuro se ve mejor pero la compresión degrada justo los colores de severidad,
 * que aquí significan crítico, en riesgo y logrado.
 *
 * Una idea por pantalla. Quien mira desde su casa en una ventana de Teams no
 * puede leer un tablero; puede leer una afirmación.
 */

const ESPERADO = 70;

const PASOS = [
  "como-vamos",
  "que-falta",
  "por-donde",
  "el-equipo",
  "que-proponemos",
  "acuerdos",
] as const;
type Paso = (typeof PASOS)[number];

const TITULO: Record<Paso, string> = {
  "como-vamos": "Cómo vamos",
  "que-falta": "Qué falta",
  "por-donde": "Por dónde partir",
  "el-equipo": "Qué dice el equipo",
  "que-proponemos": "Qué proponemos",
  acuerdos: "Los acuerdos",
};

function Barra({ c }: { c: CompetenciaDiagnostico }) {
  const score = c.score ?? 0;
  const falta = Math.max(0, Math.round(ESPERADO - score));
  const pct = Math.min(100, (score / ESPERADO) * 100);
  const critica = c.severidad === "CRITICO";
  return (
    <li>
      <div className="mb-2 flex items-baseline justify-between gap-6">
        <span className="flex min-w-0 items-baseline gap-3">
          <span className="font-mono text-base text-muted-2">{c.codigo}</span>
          <span className="truncate text-2xl font-medium tracking-tight sm:text-3xl">
            {c.nombre}
          </span>
        </span>
        <span
          className={`shrink-0 font-mono text-3xl font-semibold tabular-nums sm:text-4xl ${
            critica ? "text-incipiente" : "text-proceso"
          }`}
        >
          −{falta}
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-surface-muted ring-1 ring-inset ring-border">
        <div
          className={`h-full rounded-full ${critica ? "bg-incipiente" : "bg-proceso"}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </li>
  );
}

export default async function ReunionPage({
  params,
  searchParams,
}: PageProps<"/reunion/[nivelId]">) {
  const { nivelId } = await params;
  const sp = await searchParams;
  const pedido = typeof sp.paso === "string" ? sp.paso : "";
  const paso: Paso = PASOS.includes(pedido as Paso) ? (pedido as Paso) : PASOS[0];
  const n = PASOS.indexOf(paso);

  const user = await requireCoordinador();
  const d = await construirDiagnostico(nivelId, user.id);
  if (!d) notFound();

  const informe = d.reunionActual ? await informeVigente(nivelId, d.reunionActual.id) : null;
  const contenido =
    informe?.estado === "LISTO" ? (informe.contenido as unknown as TipoInforme) : null;
  const acuerdos = await acuerdosDelNivel(nivelId, d.reunionActual?.id ?? null);

  const conDatos = d.competencias.filter((c) => c.score !== null);
  const fortalezas = conDatos.filter((c) => c.severidad === "CONSOLIDADO");
  const porTrabajar = conDatos
    .filter((c) => c.severidad !== "CONSOLIDADO")
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const atender = d.resumen.criticas + d.resumen.enRiesgo;
  const primera = porTrabajar[0] ?? null;

  const ir = (i: number) => `/reunion/${nivelId}?paso=${PASOS[i]}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Encabezado mínimo: de qué reunión estamos hablando, y la salida. */}
      <header className="flex items-center justify-between gap-6 px-8 pt-7 sm:px-14">
        <p className="text-sm text-muted-2 sm:text-base">
          {d.nivel.nombre}
          {d.reunionActual && ` · Reunión ${d.reunionActual.numero}`}
        </p>
        <Link
          href={`/niveles/${nivelId}/resultados`}
          className="text-sm text-muted-2 transition-colors hover:text-foreground"
        >
          Salir de la presentación
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-8 py-10 sm:px-14">
        <p className="mb-8 font-mono text-sm uppercase tracking-[0.18em] text-muted-2">
          {TITULO[paso]}
        </p>

        {paso === "como-vamos" && (
          <div>
            <p className="text-lg text-muted sm:text-xl">
              ¿El nivel está logrando sus competencias?
            </p>
            <p
              className={`mt-4 text-6xl font-semibold tracking-tight sm:text-8xl ${
                atender === 0
                  ? "text-logrado"
                  : d.resumen.criticas > 0
                    ? "text-incipiente"
                    : "text-proceso"
              }`}
            >
              {atender === 0 ? "Sí." : d.resumen.criticas > 0 ? "Todavía no." : "Solo en parte."}
            </p>
            <p className="mt-6 text-xl text-muted sm:text-2xl">
              {conDatos.length - atender} de {conDatos.length} competencias llegaron a lo
              esperado.
            </p>
          </div>
        )}

        {paso === "que-falta" && (
          <div>
            <ul className="flex flex-col gap-8">
              {porTrabajar.map((c) => (
                <Barra key={c.id} c={c} />
              ))}
            </ul>
            {fortalezas.length > 0 && (
              <p className="mt-10 text-lg text-muted sm:text-xl">
                Ya llegaron:{" "}
                <span className="font-medium text-logrado">
                  {fortalezas.map((c) => c.nombre).join(", ")}
                </span>
                .
              </p>
            )}
          </div>
        )}

        {paso === "por-donde" && primera && (
          <div>
            <p className="text-4xl font-semibold tracking-tight sm:text-6xl">
              {primera.codigo} {primera.nombre}
            </p>
            <p className="mt-6 text-xl leading-relaxed text-muted sm:text-2xl">
              Es la que más lejos está de lo esperado
              {primera.delta !== null && Math.abs(primera.delta) < 1
                ? " y no se ha movido desde la primera reunión"
                : ""}
              .
            </p>
            {primera.indicadorMasDebil && (
              <blockquote className="mt-10 border-l-4 border-incipiente pl-6 text-xl leading-relaxed sm:text-2xl">
                {primera.indicadorMasDebil.texto}
              </blockquote>
            )}
          </div>
        )}

        {paso === "el-equipo" && (
          <div className="flex flex-col gap-8">
            {d.percepciones.length === 0 ? (
              <p className="text-2xl text-muted">
                Nadie dejó comentarios abiertos en esta reunión.
              </p>
            ) : (
              d.percepciones.map((p, i) => (
                <div key={i}>
                  <p className="text-base text-muted-2 sm:text-lg">
                    {p.docente} · {p.asignatura}
                  </p>
                  {p.dificultad && (
                    <p className="mt-2 text-xl leading-relaxed sm:text-2xl">“{p.dificultad}”</p>
                  )}
                  {p.sugerencia && (
                    <p className="mt-3 text-lg leading-relaxed text-muted sm:text-xl">
                      Propone: {p.sugerencia}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {paso === "que-proponemos" && (
          <div>
            {contenido ? (
              <>
                <p className="text-2xl leading-relaxed sm:text-3xl">{contenido.sintesis}</p>
                {contenido.disensos?.length > 0 && (
                  <div className="mt-10 rounded-2xl border border-proceso-line bg-proceso-tint p-6">
                    <p className="font-mono text-sm uppercase tracking-[0.14em] text-proceso">
                      Criterios que el equipo no comparte
                    </p>
                    <p className="mt-3 text-lg leading-relaxed sm:text-xl">
                      {contenido.disensos[0].comoResolver}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-2xl text-muted">
                Todavía no has generado las recomendaciones. Puedes hacerlo desde el análisis.
              </p>
            )}
          </div>
        )}

        {paso === "acuerdos" && (
          <div>
            {acuerdos.deEstaReunion.length > 0 && (
              <ul className="mb-10 flex flex-col gap-5">
                {acuerdos.deEstaReunion.map((a) => (
                  <li key={a.id} className="border-l-4 border-logrado pl-6">
                    <p className="text-xl leading-relaxed sm:text-2xl">{a.texto}</p>
                    <p className="mt-1.5 text-base text-muted-2">
                      {a.responsable}
                      {a.plazo && ` · ${a.plazo}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="mb-4 text-lg text-muted sm:text-xl">
                Escríbelo ahora, con el equipo mirando.
              </p>
              <AcuerdoForm
                nivelId={nivelId}
                competencias={d.competencias.map((c) => ({
                  id: c.id,
                  codigo: c.codigo,
                  nombre: c.nombre,
                }))}
              />
            </div>
          </div>
        )}
      </main>

      {/* Avanzar. Los puntos dicen cuánto queda sin ocupar sitio. */}
      <footer className="flex items-center justify-between gap-6 border-t border-border px-8 py-5 sm:px-14">
        {n > 0 ? (
          <Link href={ir(n - 1)} className="text-base text-muted hover:text-foreground">
            ← Atrás
          </Link>
        ) : (
          <span />
        )}

        <div className="flex gap-2" aria-label={`Pantalla ${n + 1} de ${PASOS.length}`}>
          {PASOS.map((p, i) => (
            <span
              key={p}
              className={`h-2 w-2 rounded-full ${i === n ? "bg-foreground" : "bg-border-strong"}`}
            />
          ))}
        </div>

        {n < PASOS.length - 1 ? (
          <Link
            href={ir(n + 1)}
            className="rounded-xl bg-foreground px-6 py-3 text-base font-medium text-surface transition-opacity hover:opacity-90"
          >
            Siguiente →
          </Link>
        ) : (
          <Link
            href={`/niveles/${nivelId}/resultados`}
            className="rounded-xl bg-foreground px-6 py-3 text-base font-medium text-surface transition-opacity hover:opacity-90"
          >
            Terminar
          </Link>
        )}
      </footer>
    </div>
  );
}
