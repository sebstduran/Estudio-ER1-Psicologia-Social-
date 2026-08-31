import { GoogleGenAI } from "@google/genai";
import type { Diagnostico } from "@/lib/diagnostico";

/**
 * Gemini tiene una capa de uso gratuita, que es lo que hace viable este botón
 * sin presupuesto. El modelo se puede cambiar por variable de entorno sin tocar
 * código: la lista vigente está en https://ai.google.dev/gemini-api/docs/models
 */
export const MODELO = process.env.GEMINI_MODELO ?? "gemini-2.5-flash";

// ─── Forma del informe ───────────────────────────────────────

export type RecomendacionAsignatura = {
  asignatura: string;
  accion: string;
};

export type AccionPedagogica = {
  tecnica: string;
  accion: string;
  porQue: string;
};

export type Veredicto = {
  cumple: "SI" | "PARCIAL" | "NO";
  fundamento: string;
};

export type Disenso = {
  evidencia: string;
  lectura: string;
  comoResolver: string;
};

export type CompetenciaInforme = {
  codigo: string;
  nombre: string;
  severidad: "CRITICO" | "EN_RIESGO" | "CONSOLIDADO";
  diagnostico: string;
  evidenciaCritica: string;
  decisionEpg: { componente: string; decision: string };
  accionesParaEstudiantes: AccionPedagogica[];
  recomendacionesPorAsignatura: RecomendacionAsignatura[];
};

export type TipoInforme = {
  veredicto: Veredicto;
  sintesis: string;
  prioridades: string[];
  competencias: CompetenciaInforme[];
  disensos: Disenso[];
  alertasHito: string[];
};

// Esquema JSON que el modelo debe respetar. Con `strict` la respuesta valida
// exactamente contra esta forma, así la interfaz nunca recibe algo inesperado.
const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: ["veredicto", "sintesis", "prioridades", "competencias", "disensos", "alertasHito"],
  properties: {
    veredicto: {
      type: "object",
      additionalProperties: false,
      required: ["cumple", "fundamento"],
      description:
        "Dictamen sobre si el nivel está cumpliendo con las competencias que le corresponden.",
      properties: {
        cumple: {
          type: "string",
          enum: ["SI", "PARCIAL", "NO"],
          description:
            "SI cuando prácticamente todas las competencias evaluadas están consolidadas; NO cuando hay competencias críticas; PARCIAL en el resto.",
        },
        fundamento: {
          type: "string",
          description:
            "Una o dos frases que justifiquen el dictamen con las cifras concretas del nivel.",
        },
      },
    },
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
              "Entre 2 y 4 acciones pedagógicas fundadas en evidencia para que las y los estudiantes alcancen la competencia.",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["tecnica", "accion", "porQue"],
              properties: {
                tecnica: {
                  type: "string",
                  description:
                    "Nombre de la técnica o metodología empleada, por ejemplo: aula invertida, práctica de recuperación, instrucción entre pares, ejemplos resueltos, práctica espaciada e intercalada, aprendizaje basado en problemas, evaluación formativa con criterios de éxito, andamiaje con desvanecimiento progresivo, autoexplicación metacognitiva.",
                },
                accion: {
                  type: "string",
                  description:
                    "Cómo se implementa en esta asignatura y en este nivel: qué hace el docente, qué hacen las y los estudiantes, en qué momento y cómo se verifica el avance.",
                },
                porQue: {
                  type: "string",
                  description:
                    "Por qué esta técnica ataca precisamente la evidencia que está fallando. Una frase.",
                },
              },
            },
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
    disensos: {
      type: "array",
      description:
        "Evidencias donde el equipo docente no comparte el criterio de logro. Vacío si no las hay.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["evidencia", "lectura", "comoResolver"],
        properties: {
          evidencia: { type: "string", description: "El indicador en disputa, citado textualmente." },
          lectura: {
            type: "string",
            description:
              "Qué explica la discrepancia: distinto nivel de exigencia, distinta interpretación del indicador, o condiciones distintas entre asignaturas.",
          },
          comoResolver: {
            type: "string",
            description:
              "Acción concreta para construir criterio compartido, por ejemplo una calibración con muestras de trabajos reales.",
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
responder dos preguntas: si el nivel está cumpliendo con las competencias que le
corresponden, y qué hacer para que las y los estudiantes las alcancen.

Tu especialidad es el diseño instruccional fundado en evidencia. Conoces y aplicas:

- Aula invertida: el primer contacto con el contenido ocurre fuera de clase y el tiempo
  presencial se usa para práctica con retroalimentación. Sirve cuando la clase se está
  yendo en cubrir contenido y no queda tiempo para que practiquen.
- Práctica de recuperación: recordar activamente en vez de releer. Sirve cuando
  reconocen el contenido pero no logran usarlo sin apoyo.
- Práctica espaciada e intercalada: distribuir en el tiempo y mezclar tipos de
  problema. Sirve cuando rinden bien en la unidad y lo pierden después.
- Instrucción entre pares: votación individual, discusión en pares, revotación. Sirve
  cuando hay concepciones erróneas persistentes y compartidas.
- Ejemplos resueltos y gestión de la carga cognitiva: modelar el procedimiento completo
  antes de exigir producción autónoma. Sirve cuando la tarea es compleja y se pierden.
- Andamiaje con desvanecimiento progresivo: apoyos que se retiran a medida que avanzan.
- Aprendizaje basado en problemas y método de casos: pertinente para competencias de
  análisis, evaluación e intervención.
- Evaluación formativa con criterios de éxito explícitos y rúbricas compartidas de
  antemano. Sirve cuando el desempeño es dispar porque no saben qué se espera.
- Autoexplicación y metacognición: pedir que expliquen su razonamiento.
- Alineamiento constructivo: resultado de aprendizaje, actividad y evaluación apuntando
  a lo mismo. Sirve cuando se enseña una cosa y se evalúa otra.

Cómo trabajas:

- Empiezas por dictaminar si el nivel está cumpliendo con sus competencias, fundado en
  las cifras concretas. No suavizas un resultado malo.
- Eliges la técnica en función de la evidencia que está fallando, no por moda. Cada
  acción nombra la técnica, dice cómo se implementa en esa asignatura concreta y explica
  en una frase por qué ataca ese problema en particular. Una técnica mal elegida para el
  problema es peor que ninguna: si los datos no justifican una metodología nueva, propón
  ajustar la que ya existe.
- Distingues dos problemas que se confunden: el bajo desempeño de las y los estudiantes,
  y la falta de criterio compartido entre docentes. Cuando una misma evidencia recibe
  "logrado" de una persona e "incipiente" de otra, el problema no es (solo) el
  estudiantado: el equipo no comparte el estándar. Eso se resuelve calibrando criterios
  con muestras reales de trabajos, no con más contenido ni más ejercitación. Repórtalo en
  "disensos" y no lo disfraces de bajo logro.
- Los comentarios que los docentes escribieron en la rúbrica son tu mejor pista sobre la
  causa. Úsalos: si un docente dice que llegan sin la lectura hecha, eso apunta a aula
  invertida o a control de lectura, no a más contenido en clase.
- Escribes para una reunión de trabajo, no para un informe de acreditación. Frases
  directas, sin relleno institucional.
- Cada afirmación se apoya en los datos que recibes. Cuando la evidencia es escasa
  (pocos votos, un solo docente), lo dices en vez de sobreinterpretar.
- Las recomendaciones por asignatura respetan la tributación: a una que tributa de forma
  transversal no le pides lo mismo que a una directa.
- No inventas nombres de asignaturas, docentes ni competencias: usas exactamente los que
  aparecen en los datos.
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

  const faltantes = d.participacion.filter((p) => !p.completo);
  if (d.participacion.length > 0) {
    partes.push(
      `PARTICIPACIÓN: respondieron completo ${d.participacion.length - faltantes.length} de ${d.participacion.length} docentes.`,
      faltantes.length > 0
        ? `Falta o está incompleto: ${faltantes.map((p) => p.nombre).join(", ")}. Considera esto al calibrar cuánta confianza depositas en las cifras.`
        : "La cobertura está completa.",
      ""
    );
  }

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

    const serie = c.trayectoria.filter((t) => t.score !== null);
    if (serie.length > 1) {
      partes.push(
        "Trayectoria: " + serie.map((t) => `R${t.numero} ${Math.round(t.score!)}`).join(" → ")
      );
    }
    partes.push("Indicadores observables:");
    for (const i of c.indicadores) {
      const marcas = [
        i.id === c.indicadorMasDebil?.id ? "← el más débil" : "",
        i.disenso ? "← DISENSO: alguien lo calificó logrado y alguien incipiente" : "",
      ]
        .filter(Boolean)
        .join(" ");
      partes.push(
        `  · "${i.texto}" — ${
          i.score === null ? "sin datos" : `${Math.round(i.score)}/100 (${describirConteo(i.conteo)})`
        }${marcas ? " " + marcas : ""}`
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
    super("Falta configurar GEMINI_API_KEY.");
    this.name = "FaltaApiKey";
  }
}

/**
 * Gemini no acepta `additionalProperties` en el esquema de respuesta y rechaza
 * la petición entera si lo encuentra. Se quita al vuelo en vez de sacarlo del
 * esquema, porque ahí documenta la forma exacta que espera la interfaz.
 */
function paraGemini(nodo: unknown): unknown {
  if (Array.isArray(nodo)) return nodo.map(paraGemini);
  if (nodo === null || typeof nodo !== "object") return nodo;
  return Object.fromEntries(
    Object.entries(nodo as Record<string, unknown>)
      .filter(([clave]) => clave !== "additionalProperties")
      .map(([clave, valor]) => [clave, paraGemini(valor)])
  );
}

/**
 * El esquema guía al modelo pero no lo obliga: si falta un campo, la pantalla
 * de resultados reventaría al pintarlo. Se revisa antes de darlo por bueno.
 */
function pareceInforme(x: unknown): x is TipoInforme {
  if (x === null || typeof x !== "object") return false;
  const i = x as Record<string, unknown>;
  return (
    typeof i.sintesis === "string" &&
    typeof i.veredicto === "object" &&
    i.veredicto !== null &&
    Array.isArray(i.prioridades) &&
    Array.isArray(i.competencias) &&
    Array.isArray(i.disensos) &&
    Array.isArray(i.alertasHito)
  );
}

export async function generarInforme(d: Diagnostico): Promise<TipoInforme> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new FaltaApiKey();

  const ai = new GoogleGenAI({ apiKey });

  let respuesta;
  try {
    respuesta = await ai.models.generateContent({
      model: MODELO,
      contents: construirPrompt(d),
      config: {
        systemInstruction: SISTEMA,
        responseMimeType: "application/json",
        responseJsonSchema: paraGemini(ESQUEMA),
        // Holgado a propósito: el modelo razona antes de responder y ese
        // razonamiento también consume del tope. Si se queda corto, la
        // respuesta llega cortada y sin texto.
        maxOutputTokens: 32000,
        temperature: 0.4,
      },
    });
  } catch (error) {
    // La capa gratuita tiene un límite de peticiones por minuto. Vale la pena
    // decirlo con esas palabras: el problema se resuelve esperando, no tocando
    // la configuración.
    const mensaje = error instanceof Error ? error.message : String(error);
    if (/429|RESOURCE_EXHAUSTED|quota/i.test(mensaje)) {
      throw new Error(
        "Se alcanzó el límite gratuito de Gemini por ahora. Espera unos minutos y vuelve a intentarlo."
      );
    }
    if (/API_KEY_INVALID|API key not valid/i.test(mensaje)) {
      throw new Error(
        "La clave de Gemini no es válida. Genera una nueva en aistudio.google.com/apikey y actualiza GEMINI_API_KEY."
      );
    }
    if (/404|not found|NOT_FOUND/i.test(mensaje)) {
      throw new Error(
        `El modelo «${MODELO}» no está disponible para tu clave. Revisa la lista vigente en ai.google.dev y ajusta GEMINI_MODELO.`
      );
    }
    throw error;
  }

  const razon = respuesta.candidates?.[0]?.finishReason;
  if (razon && razon !== "STOP") {
    throw new Error(
      razon === "MAX_TOKENS"
        ? "El informe salió más largo de lo que cabe en una respuesta. Vuelve a intentarlo."
        : `El modelo no completó el informe (${razon}).`
    );
  }

  const texto = respuesta.text;
  if (!texto) throw new Error("El modelo no devolvió contenido.");

  let contenido: unknown;
  try {
    contenido = JSON.parse(texto);
  } catch {
    throw new Error("El modelo devolvió una respuesta que no se pudo leer como informe.");
  }

  if (!pareceInforme(contenido)) {
    throw new Error("El informe llegó incompleto. Vuelve a intentarlo.");
  }

  return contenido;
}
