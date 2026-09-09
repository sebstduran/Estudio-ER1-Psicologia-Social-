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

// Matriz institucional de progresión: las mismas seis líneas avanzan desde
// Bachiller (x.1), a Licenciado (x.2), y al Perfil de Egreso (x.3). Los
// descriptores son los oficiales; los tres indicadores descomponen cada uno en
// evidencias breves que el equipo docente sí puede observar en sus asignaturas.
export const COMPETENCIAS_POR_CICLO = {
  INICIAL: [
  {
    codigo: '1.1',
    nombre: 'Fundamentar',
    descriptor:
      'Relaciona los fundamentos psicobiológicos, socioculturales y epistemológicos para la generación de propuestas de investigación en el campo de la disciplina.',
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
      'Propone temas de investigación a partir del análisis de problemas relacionados con el campo psicosocial, siguiendo los lineamientos del método científico.',
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
      'Relaciona los distintos enfoques teóricos que fundamentan la evaluación de los aspectos cognitivos conductuales de las personas y grupos para comprender reflexivamente y de manera integral la conducta humana.',
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
      'Construye análisis críticos de la conducta humana desde distintas aproximaciones paradigmáticas de realidades biopsicosociales.',
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
      'Formula proyectos de intervención que den respuesta a la detección y definición de necesidades psicosociales, analizando críticamente la información recopilada.',
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
      'Emplea técnicas de autoexploración y valoración de sí mismo y de su profesión con el fin de reconocer fortalezas y cualidades, así como debilidades y conflictos; desarrollando habilidades de crecimiento personal y profesional.',
    componenteOrden: 7,
    indicadores: [
      'Aplica técnicas de autoexploración a su propio desempeño académico y profesional.',
      'Valora fortalezas y áreas de mejora identificadas en el proceso de autoexploración.',
      'Define acciones concretas de crecimiento personal y profesional a partir de esa valoración.',
    ],
  },
  ],
  INTERMEDIO: [
    {
      codigo: '1.2', nombre: 'Fundamentar', componenteOrden: 1,
      descriptor: 'Argumenta en base a los fundamentos psicobiológicos, socioculturales y epistemológicos los resultados obtenidos en las investigaciones desarrolladas.',
      indicadores: [
        'Selecciona fundamentos psicobiológicos, socioculturales y epistemológicos pertinentes para interpretar resultados de investigación.',
        'Relaciona los resultados obtenidos con los fundamentos teóricos que los explican.',
        'Construye una argumentación coherente y fundamentada sobre los resultados de la investigación.',
      ],
    },
    {
      codigo: '2.2', nombre: 'Investigar', componenteOrden: 3,
      descriptor: 'Elabora conclusiones pertinentes a partir de los resultados del proyecto de investigación de la realidad psicosocial, aplicando estrategias de análisis cualitativo y cuantitativo, comunicando estos resultados de manera clara y precisa.',
      indicadores: [
        'Aplica estrategias de análisis cualitativo y cuantitativo pertinentes a los resultados del proyecto.',
        'Elabora conclusiones coherentes con los resultados y con la realidad psicosocial estudiada.',
        'Comunica los resultados y conclusiones de manera clara y precisa.',
      ],
    },
    {
      codigo: '3.2', nombre: 'Evaluar', componenteOrden: 4,
      descriptor: 'Elabora planes de evaluación en base a distintas técnicas, discriminando los medios e instrumentos adecuados para ser aplicados a cada contexto, exponiendo los resultados y respetando los principios éticos de la profesión.',
      indicadores: [
        'Elabora planes de evaluación coherentes con el propósito y el contexto.',
        'Selecciona técnicas, medios e instrumentos adecuados para cada situación de evaluación.',
        'Expone los resultados respetando los principios éticos de la profesión.',
      ],
    },
    {
      codigo: '4.2', nombre: 'Analizar', componenteOrden: 3,
      descriptor: 'Planifica estrategias de intervención en distintas áreas del campo y realidad social para individuos, grupos y organizaciones; emitiendo de manera clara y precisa su juicio técnico, utilizando un pensamiento crítico para la toma de decisiones.',
      indicadores: [
        'Analiza críticamente las características del área y de la realidad social donde intervendrá.',
        'Planifica estrategias de intervención pertinentes para individuos, grupos u organizaciones.',
        'Comunica un juicio técnico claro y preciso para fundamentar la toma de decisiones.',
      ],
    },
    {
      codigo: '5.2', nombre: 'Intervenir', componenteOrden: 6,
      descriptor: 'Aplica distintos modelos de intervención en los ámbitos clínico, educacional, organizacional y social comunitario, que le permite dar respuesta a las demandas básicas de cada área, considerando las normas éticas que rigen la disciplina.',
      indicadores: [
        'Selecciona modelos de intervención pertinentes al ámbito clínico, educacional, organizacional o social comunitario.',
        'Aplica el modelo escogido para responder a las demandas básicas del área.',
        'Fundamenta su actuación en las normas éticas que rigen la disciplina.',
      ],
    },
    {
      codigo: '6.2', nombre: 'Autoexplorar', componenteOrden: 7,
      descriptor: 'Aplica sus recursos personales para la ejecución de proyectos de intervención psicosocial, de manera autónoma y responsable, lo que le permite establecer buenas relaciones interpersonales y potenciar su desarrollo profesional.',
      indicadores: [
        'Reconoce y moviliza sus recursos personales en proyectos de intervención psicosocial.',
        'Actúa con autonomía y responsabilidad durante la ejecución del proyecto.',
        'Establece relaciones interpersonales que favorecen su desarrollo profesional.',
      ],
    },
  ],
  FINAL: [
    {
      codigo: '1.3', nombre: 'Fundamentar', componenteOrden: 1,
      descriptor: 'Integra los fundamentos psicobiológicos, socioculturales y epistemológicos para la toma de decisiones en el proceso de diagnóstico, intervención y seguimiento de personas, grupos y organizaciones, favoreciendo el bienestar psicosocial.',
      indicadores: [
        'Integra fundamentos psicobiológicos, socioculturales y epistemológicos en el diagnóstico.',
        'Utiliza esa integración para tomar decisiones de intervención y seguimiento en personas, grupos u organizaciones.',
        'Orienta sus decisiones al bienestar psicosocial de las personas y comunidades involucradas.',
      ],
    },
    {
      codigo: '2.3', nombre: 'Investigar', componenteOrden: 3,
      descriptor: 'Aplica elementos teóricos y metodológicos que le permiten diseñar y realizar investigación científica básica, a partir de un análisis crítico de la realidad psicosocial, bajo un marco ético y socialmente responsable.',
      indicadores: [
        'Integra elementos teóricos y metodológicos en el diseño de una investigación científica básica.',
        'Realiza la investigación a partir de un análisis crítico de la realidad psicosocial.',
        'Desarrolla el proceso investigativo bajo un marco ético y socialmente responsable.',
      ],
    },
    {
      codigo: '3.3', nombre: 'Evaluar', componenteOrden: 4,
      descriptor: 'Aplica técnicas fundamentales para la evaluación de aspectos cognitivos, emocionales y conductuales en personas, grupos y organizaciones, respetando las normas éticas de la profesión.',
      indicadores: [
        'Aplica técnicas pertinentes para evaluar aspectos cognitivos, emocionales y conductuales.',
        'Ajusta el proceso de evaluación a personas, grupos u organizaciones según corresponda.',
        'Resguarda las normas éticas de la profesión durante todo el proceso evaluativo.',
      ],
    },
    {
      codigo: '4.3', nombre: 'Analizar', componenteOrden: 3,
      descriptor: 'Formula diagnósticos de forma integral a personas, grupos y organizaciones, emitiendo de manera clara y precisa su juicio técnico, utilizando el pensamiento crítico para la toma de decisiones.',
      indicadores: [
        'Integra información relevante para formular diagnósticos de personas, grupos u organizaciones.',
        'Emite un juicio técnico claro y preciso a partir del diagnóstico.',
        'Utiliza el pensamiento crítico para fundamentar la toma de decisiones.',
      ],
    },
    {
      codigo: '5.3', nombre: 'Intervenir', componenteOrden: 6,
      descriptor: 'Desarrolla intervenciones a nivel inicial, para la atención de personas de manera individual, grupal y en organizaciones, dando respuesta a las distintas necesidades detectadas evidenciando un comportamiento ético, respetuoso y responsable hacia las personas y la sociedad en el ejercicio de su profesión.',
      indicadores: [
        'Desarrolla intervenciones iniciales con personas, grupos u organizaciones.',
        'Ajusta la intervención a las necesidades detectadas en el diagnóstico.',
        'Actúa de manera ética, respetuosa y responsable hacia las personas y la sociedad.',
      ],
    },
    {
      codigo: '6.3', nombre: 'Autoexplorar', componenteOrden: 7,
      descriptor: 'Desarrolla estrategias que le permiten reconocer y potenciar sus recursos personales para desempeñarse en su profesión y adaptarse a diferentes contextos con autonomía, responsabilidad y potenciando las buenas relaciones interpersonales.',
      indicadores: [
        'Desarrolla estrategias para reconocer y potenciar sus recursos personales en el desempeño profesional.',
        'Se adapta a diferentes contextos con autonomía y responsabilidad.',
        'Construye buenas relaciones interpersonales en los contextos donde se desempeña.',
      ],
    },
  ],
} as const;

// Se conserva para el seed de demostración existente.
export const COMPETENCIAS_CICLO_INICIAL = COMPETENCIAS_POR_CICLO.INICIAL;
