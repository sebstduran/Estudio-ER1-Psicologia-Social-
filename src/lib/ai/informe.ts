import Anthropic from "@anthropic-ai/sdk";
import type { Diagnostico } from "@/lib/diagnostico";

export const MODELO = "claude-opus-5";

// ─── Forma del informe ───────────────────────────────────────

export type RecomendacionAsignatura = {
  asignatura: string;
  accion: string;
};

export type CompetenciaInforme = {
  codigo: string;
  nombre: string;
  severidad: "CRITICO" | "EN_RIESGO" | "CONSOLIDADO";
  diagnostico: string;
  evidenciaCritica: string;
  decisionEpg: { componente: string; decision: string };
  accionesParaEstudiantes: string[];
  recomendacionesPorAsignatura: RecomendacionAsignatura[];
};

export type TipoInforme = {
  sintesis: string;
  prioridades: string[];
  competencias: CompetenciaInforme[];
  alertasHito: string[];
};

// Esquema JSON que el modelo debe respetar. Con `strict` la respuesta valida
// exactamente contra esta forma, así la interfaz nunca recibe algo inesperado.
const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: ["sintesis", "prioridades", "competencias", "alertasHito"],
  properties: {
    sintesis: {
      type: "string",
      description:
        "Dos o tres frases que un coordinador pueda leer en voz alta al abrir la reunión de CCAA.",
    },
    prioridades: {
      type: "array",
      description: "Entre 2 y 4 focos de trabajo para el resto del trimestre, en orden de urgencia.",
      items: { type: "string" },
    },
    competencias: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "codigo",
          "nombre",
          "severidad",
          "diagnostico",
          "evidenciaCritica",
          "decisionEpg",
          "accionesParaEstudiantes",
          "recomendacionesPorAsignatura",
        ],
        properties: {
          codigo: { type: "string" },
          nombre: { type: "string" },
          severidad: { type: "string", enum: ["CRITICO", "EN_RIESGO", "CONSOLIDADO"] },
          diagnostico: {
            type: "string",
            description:
              "Qué está ocurriendo con esta competencia según el juicio docente. Cita la evidencia concreta.",
          },
          evidenciaCritica: {
            type: "string",
            description: "El indicador observable más débil, citado textualmente.",
          },
          decisionEpg: {
            type: "object",
            additionalProperties: false,
            required: ["componente", "decision"],
            properties: {
              componente: {
                type: "string",
                description: "Nombre exacto del componente EPG asociado a esta competencia.",
              },
              decision: {
                type: "string",
                description: "La decisión técnico-pedagógica concreta que la CCAA debe acordar.",
              },
            },
          },
          accionesParaEstudiantes: {
            type: "array",
            description:
              "Acciones pedagógicas concretas y observables para que las y los estudiantes alcancen la competencia. Nada genérico.",
            items: { type: "string" },
          },
          recomendacionesPorAsignatura: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["asignatura", "accion"],
              properties: {
                asignatura: { type: "string" },
                accion: { type: "string" },
              },
            },
          },
        },
      },
    },
    alertasHito: {
      type: "array",
      description:
        "Alertas tempranas de cara al Hito de Evaluación de Ciclo. Vacío si no hay riesgos reales.",
      items: { type: "string" },
    },
  },
} as const;

// ─── Prompt ──────────────────────────────────────────────────

const SISTEMA = `Eres asesor pedagógico de una Comunidad Académica (CCAA) de la carrera de
Psicología de la Universidad Autónoma de Chile. Acompañas a quien coordina un nivel a
convertir el juicio de sus docentes en decisiones de Estrategia Pedagógica Global (EPG).

La EPG se sustenta en siete componentes:
1. Elementos curriculares — tributación de los RA con el perfil de ciclo y egreso
2. Balance de carga evaluativo — distribución de evaluaciones en el trimestre
3. Estrategias metodológicas — metodologías activo-participativas y sus momentos
4. Instrumentos de evaluación — diseño, validación e implementación colaborativa
5. Planificación integrada — planificación conjunta intra e inter-asignatura
6. Derivación al SAAC — derivación y seguimiento de estudiantes derivados
7. Seguimiento de resultados — seguimiento y análisis de resultados académicos

Cómo trabajas:

- Escribes para una reunión de trabajo, no para un informe de acreditación. Frases
  directas, sin relleno institucional ni adjetivos de catálogo.
- Cada afirmación se apoya en los datos que recibes. Si algo no está en los datos, no
  lo afirmas. Cuando la evidencia es escasa (pocos votos, un solo docente), lo dices en
  vez de sobreinterpretar.
- Las acciones para estudiantes son concretas y observables: qué se hace, en qué
  momento de la asignatura y cómo se verifica el avance. "Reforzar la comprensión" no
  sirve; "incorporar un taller de análisis de casos en la semana 5, con pauta de
  cotejo de los tres criterios del indicador" sí.
- Las recomendaciones por asignatura respetan la tributación: a una asignatura que
  tributa de forma transversal no le pides lo mismo que a una directa.
- No inventas nombres de asignaturas, docentes ni competencias: usas exactamente los
  que aparecen en los datos.
- Escribes en español de Chile, tratando de "tú" a quien coordina.`;

function describirConteo(c: { LOGRADO: number; EN_PROCESO: number; INCIPIENTE: number }) {
  return `logrado ${c.LOGRADO}, en proceso ${c.EN_PROCESO}, incipiente ${c.INCIPIENTE}`;
}

/** Convierte el diagnóstico en el texto que lee el modelo. */
export function construirPrompt(d: Diagnostico): string {
  const partes: string[] = [];

  partes.push(
    `NIVEL: ${d.nivel.nombre}`,
    `Ciclo: ${d.nivel.ciclo} · Modalidad: ${d.nivel.modalidad} · Trimestre: ${d.nivel.trimestre}`,
    d.reunionActual
      ? `Reunión en curso: R${d.reunionActual.numero} (${d.reunionActual.fase})`
      : "Sin reunión en curso.",
    `Votos registrados en esta reunión: ${d.totalVotos}`,
    ""
  );

  partes.push(
    "ESCALA: cada indicador se califica Logrado / En proceso / Incipiente.",
    "El puntaje va de 0 a 100 (Logrado=1, En proceso=0,5, Incipiente=0).",
    "Bajo 40 se considera crítico; entre 40 y 69, en riesgo; 70 o más, consolidado.",
    ""
  );

  for (const c of d.competencias) {
    partes.push(`── COMPETENCIA ${c.codigo} · ${c.nombre} ──`);
    partes.push(`Descriptor: ${c.descriptor}`);
    partes.push(`Componente EPG asociado: ${c.componenteEpg}`);
    if (c.score === null) {
      partes.push("Sin evaluaciones registradas en esta reunión.", "");
      continue;
    }
    partes.push(
      `Puntaje: ${Math.round(c.score)}/100 (${c.severidad}) · ${describirConteo(c.conteo)}`,
      `Docentes que la evaluaron: ${c.docentesQueEvaluaron}`
    );
    if (c.delta !== null) {
      const signo = c.delta >= 0 ? "+" : "";
      partes.push(
        `Línea base: ${Math.round(c.scoreBase!)}/100 · variación ${signo}${Math.round(c.delta)} puntos`
      );
    }

    partes.push("Indicadores observables:");
    for (const i of c.indicadores) {
      const marca = i.id === c.indicadorMasDebil?.id ? " ← el más débil" : "";
      partes.push(
        `  · "${i.texto}" — ${
          i.score === null ? "sin datos" : `${Math.round(i.score)}/100 (${describirConteo(i.conteo)})`
        }${marca}`
      );
      for (const com of i.comentarios) {
        partes.push(
          `      comentario de ${com.docente} (${com.asignatura}, votó ${com.nivelLogro}): "${com.texto}"`
        );
      }
    }

    if (c.asignaturas.length > 0) {
      partes.push("Asignaturas que la tributan:");
      for (const a of c.asignaturas) {
        partes.push(
          `  · ${a.nombre} (${a.tipo.toLowerCase()}) — ${
            a.score === null ? "sin datos" : `${Math.round(a.score)}/100`
          }`
        );
      }
    }
    partes.push("");
  }

  partes.push(
    "Entrega el informe siguiendo el esquema pedido. Ordena las competencias de la más",
    "urgente a la menos urgente. Omite del arreglo las competencias sin evaluaciones."
  );

  return partes.join("\n");
}

// ─── Llamada al modelo ───────────────────────────────────────

export class FaltaApiKey extends Error {
  constructor() {
    super("Falta configurar ANTHROPIC_API_KEY.");
    this.name = "FaltaApiKey";
  }
}

export async function generarInforme(d: Diagnostico): Promise<TipoInforme> {
  if (!process.env.ANTHROPIC_API_KEY) throw new FaltaApiKey();

  const client = new Anthropic();

  // Streaming porque el informe es largo y una petición no-streaming con este
  // max_tokens puede superar el timeout HTTP del SDK.
  const stream = client.messages.stream({
    model: MODELO,
    max_tokens: 16000,
    system: SISTEMA,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: ESQUEMA },
    },
    messages: [{ role: "user", content: construirPrompt(d) }],
  });

  const respuesta = await stream.finalMessage();

  if (respuesta.stop_reason === "refusal") {
    throw new Error("El modelo declinó generar el informe con estos datos.");
  }

  const bloque = respuesta.content.find((b) => b.type === "text");
  if (!bloque || bloque.type !== "text") {
    throw new Error("El modelo no devolvió contenido de texto.");
  }

  return JSON.parse(bloque.text) as TipoInforme;
}
