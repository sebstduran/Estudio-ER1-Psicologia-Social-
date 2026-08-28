// Datos institucionales fijos: los 7 componentes de la EPG y la plantilla
// de competencias del Ciclo Inicial de Psicología. Se usan tanto en el
// seed de la base de datos como al crear un Nivel nuevo.

export const COMPONENTES_EPG = [
  {
    orden: 1,
    nombre: 'Elementos curriculares',
    descripcion: 'Tributación de los RA con el perfil de ciclo y egreso.',
  },
  {
    orden: 2,
    nombre: 'Balance de carga evaluativo',
    descripcion: 'Distribución de evaluaciones en el trimestre.',
  },
  {
    orden: 3,
    nombre: 'Estrategias metodológicas',
    descripcion: 'Metodologías activo-participativas y sus momentos.',
  },
  {
    orden: 4,
    nombre: 'Instrumentos de evaluación',
    descripcion: 'Diseño, validación e implementación colaborativa con formatos institucionales.',
  },
  {
    orden: 5,
    nombre: 'Planificación integrada',
    descripcion: 'Planificación conjunta intra e inter-asignatura.',
  },
  {
    orden: 6,
    nombre: 'Derivación al SAAC',
    descripcion: 'Derivación, seguimiento y evaluación de estudiantes derivados.',
  },
  {
    orden: 7,
    nombre: 'Seguimiento de resultados',
    descripcion: 'Seguimiento, evaluación y análisis de resultados académicos.',
  },
] as const;

// Plantilla precargada del Ciclo Inicial: 6 competencias, cada una con 3
// indicadores observables y su componente EPG asociado (por orden).
export const COMPETENCIAS_CICLO_INICIAL = [
  {
    codigo: '1.1',
    nombre: 'Fundamentar',
    descriptor:
      'Relaciona fundamentos psicobiológicos, socioculturales y epistemológicos para generar propuestas de investigación en la disciplina.',
    componenteOrden: 1,
    indicadores: [
      'Identifica fundamentos psicobiológicos, socioculturales y epistemológicos pertinentes a un problema disciplinar.',
      'Relaciona esos fundamentos entre sí para construir una explicación coherente del fenómeno psicosocial en estudio.',
      'Traduce la fundamentación teórica en una propuesta de investigación con preguntas y objetivos claros.',
    ],
  },
  {
    codigo: '2.1',
    nombre: 'Investigar',
    descriptor:
      'Propone temas de investigación desde el análisis de problemas psicosociales, siguiendo el método científico.',
    componenteOrden: 3,
    indicadores: [
      'Analiza problemas psicosociales relevantes para delimitar un tema de investigación.',
      'Aplica las etapas del método científico al diseño de su propuesta.',
      'Argumenta la pertinencia y viabilidad del tema propuesto.',
    ],
  },
  {
    codigo: '3.1',
    nombre: 'Evaluar',
    descriptor:
      'Relaciona enfoques teóricos de evaluación cognitivo-conductual para comprender integralmente la conducta humana.',
    componenteOrden: 4,
    indicadores: [
      'Reconoce los principales enfoques teóricos de evaluación cognitivo-conductual.',
      'Compara enfoques de evaluación según el fenómeno conductual a comprender.',
      'Integra los enfoques revisados en una comprensión global de un caso o situación.',
    ],
  },
  {
    codigo: '4.1',
    nombre: 'Analizar',
    descriptor:
      'Construye análisis críticos de la conducta humana desde aproximaciones paradigmáticas biopsicosociales.',
    componenteOrden: 3,
    indicadores: [
      'Describe la conducta humana en estudio desde más de un paradigma biopsicosocial.',
      'Contrasta críticamente las aproximaciones paradigmáticas utilizadas.',
      'Elabora conclusiones fundamentadas a partir del análisis realizado.',
    ],
  },
  {
    codigo: '5.1',
    nombre: 'Intervenir',
    descriptor:
      'Formula proyectos de intervención ante necesidades psicosociales, analizando críticamente la información.',
    componenteOrden: 6,
    indicadores: [
      'Analiza críticamente la información disponible sobre una necesidad psicosocial.',
      'Formula objetivos y acciones de un proyecto de intervención pertinente.',
      'Justifica la propuesta de intervención en función de la necesidad detectada.',
    ],
  },
  {
    codigo: '6.1',
    nombre: 'Autoexplorar',
    descriptor:
      'Emplea técnicas de autoexploración y valoración profesional para el crecimiento personal y profesional.',
    componenteOrden: 7,
    indicadores: [
      'Aplica técnicas de autoexploración a su propio desempeño académico y profesional.',
      'Valora fortalezas y áreas de mejora identificadas en el proceso de autoexploración.',
      'Define acciones concretas de crecimiento personal y profesional a partir de esa valoración.',
    ],
  },
] as const;
