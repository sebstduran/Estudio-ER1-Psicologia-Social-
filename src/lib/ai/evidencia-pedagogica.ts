export const VERSION_EVIDENCIA = "2026-09";

export const EVIDENCIAS_PEDAGOGICAS = [
  {
    id: "RECUPERACION_ESPACIADA",
    tecnica: "Práctica de recuperación y espaciado",
    sirveCuando: "El estudiantado reconoce conceptos, pero no logra recuperarlos o aplicarlos sin apoyo.",
    mecanismo: "Evocar repetidamente y distribuir la práctica fortalece la retención y la transferencia.",
    aplicacion: "Preguntas breves acumulativas al inicio de clase, con retroalimentación inmediata y sin nota punitiva.",
    cuidado: "No convertirla en repetición mecánica ni usarla como castigo por no estudiar.",
    fuente: "IES · Organizing Instruction and Study to Improve Student Learning",
    url: "https://ies.ed.gov/ncee/wwc/PracticeGuide/1",
  },
  {
    id: "EJEMPLOS_ANDAMIAJE",
    tecnica: "Ejemplos resueltos y andamiaje con desvanecimiento",
    sirveCuando: "La tarea es compleja y el estudiantado se pierde antes de poder practicar el razonamiento completo.",
    mecanismo: "Reduce carga innecesaria al modelar el proceso y retira apoyos a medida que aumenta la autonomía.",
    aplicacion: "Comparar un caso resuelto con otro incompleto; retirar pasos y pedir que expliquen cada decisión.",
    cuidado: "El apoyo debe retirarse; mantenerlo indefinidamente impide comprobar autonomía.",
    fuente: "National Academies · How People Learn II",
    url: "https://www.nationalacademies.org/read/24783/chapter/7",
  },
  {
    id: "INSTRUCCION_PARES",
    tecnica: "Instrucción entre pares",
    sirveCuando: "Existen concepciones erróneas persistentes o respuestas distintas ante un mismo caso.",
    mecanismo: "Obliga a recuperar, justificar y contrastar el razonamiento antes de recibir la respuesta docente.",
    aplicacion: "Respuesta individual, discusión breve en pares, nueva respuesta y cierre basado en las razones.",
    cuidado: "La pregunta debe discriminar razonamientos; una pregunta solo memorística aporta poco.",
    fuente: "PNAS · Active learning increases student performance in STEM",
    url: "https://doi.org/10.1073/pnas.1319030111",
  },
  {
    id: "ACTIVIDAD_GENERATIVA",
    tecnica: "Autoexplicación y actividad generativa",
    sirveCuando: "El estudiantado repite una respuesta correcta, pero no explicita relaciones ni justifica decisiones.",
    mecanismo: "Generar una explicación y vincular ideas produce un compromiso cognitivo más profundo que observar.",
    aplicacion: "Pedir que expliquen por qué una evidencia sostiene una conclusión y qué alternativa descartaron.",
    cuidado: "La consigna debe exigir razonamiento verificable, no solo opinión o participación superficial.",
    fuente: "ICAP Framework · Chi & Wylie",
    url: "https://doi.org/10.1080/00461520.2014.965823",
  },
  {
    id: "CASOS_AUTENTICOS",
    tecnica: "Método de casos y problemas auténticos",
    sirveCuando: "La dificultad está en integrar fundamentos, evidencia y decisiones en situaciones profesionales.",
    mecanismo: "Una situación auténtica permite practicar la transferencia y comparar cursos de acción fundamentados.",
    aplicacion: "Resolver un caso común entre asignaturas con criterios compartidos y una decisión justificable.",
    cuidado: "El caso necesita conocimientos previos y criterios explícitos; abrirlo demasiado puede ocultar la dificultad.",
    fuente: "APA · Guidelines for the Undergraduate Psychology Major",
    url: "https://www.apa.org/about/policy/undergraduate-psychology-major",
  },
  {
    id: "EVALUACION_FORMATIVA",
    tecnica: "Evaluación formativa con criterios de éxito",
    sirveCuando: "El desempeño es dispar porque no está claro qué cuenta como logro o el equipo usa estándares distintos.",
    mecanismo: "Hacer visible el estándar permite comparar el desempeño actual con una meta concreta y ajustar a tiempo.",
    aplicacion: "Analizar muestras, acordar criterios y dar retroalimentación antes de la evaluación calificativa.",
    cuidado: "Una rúbrica sin muestras ni oportunidad de mejora no resuelve por sí sola el problema.",
    fuente: "National Academies · How People Learn II",
    url: "https://www.nationalacademies.org/read/24783/chapter/7",
  },
] as const;

export type EvidenciaId = (typeof EVIDENCIAS_PEDAGOGICAS)[number]["id"];

export function evidenciaPorId(id: string) {
  return EVIDENCIAS_PEDAGOGICAS.find((evidencia) => evidencia.id === id) ?? null;
}
