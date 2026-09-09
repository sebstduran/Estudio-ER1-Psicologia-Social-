/**
 * Tributación declarada en los programas de asignatura del Plan 4 SCT.
 *
 * Los números identifican las seis líneas de competencia que progresan por
 * ciclo (1.x Fundamentar, 2.x Investigar, etc.). El sufijo cambia según el
 * ciclo del nivel, por eso aquí guardamos la línea y no un código específico.
 *
 * Fuente: programas oficiales entregados por el usuario el 9 de septiembre
 * de 2026. Solo se incluyen competencias disciplinares y profesionales; las
 * competencias genéricas no se fuerzan dentro de la matriz de ciclo.
 */

export type LineaCompetencia = 1 | 2 | 3 | 4 | 5 | 6;

export type TributacionPrograma = {
  lineas: readonly LineaCompetencia[];
  /** El programa fue revisado, pero solo declara competencias genéricas. */
  soloGenericas?: boolean;
};

function normalizar(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\(a\+s\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const MATRIZ = new Map<string, TributacionPrograma>();

function registrar(
  nombres: readonly string[],
  lineas: readonly LineaCompetencia[],
  soloGenericas = false
) {
  for (const nombre of nombres) {
    MATRIZ.set(normalizar(nombre), { lineas, soloGenericas });
  }
}

// Ciclo Inicial · Nivel de Bachiller
registrar(["Fundamentos Neuroanatómicos y Funcionales del Sistema Nervioso", "Fundamentos Neuroanatómicos y Funcionales"], [1, 3]);
registrar(["Fundamentos Socioculturales de la Psicología"], [1, 3, 4]);
registrar(["Procesos Psicológicos I"], [3]);
registrar(["Taller de Habilidades Profesionales I"], [2, 6]);
registrar(["Introducción a la Psicología"], [3, 4]);
registrar(["Electivo de Comunicación", "Electivo de Comunicación I - Comunicación en Contexto"], [], true);

registrar(["Psicología de la Personalidad"], [1, 3, 4, 5]);
registrar(["Psicología Social"], [1, 3, 4]);
registrar(["Psicología del Desarrollo I: Primera y Segunda Infancia"], [1, 2, 3, 4]);
registrar(["Teorías Psicológicas I"], [1, 3, 4]);

registrar(["Evaluación Psicométrica"], [1, 3, 4]);
registrar(["Intervención Psicosocial con Grupos", "Intervención con Grupos"], [1, 2, 3, 4, 5, 6]);
registrar(["Introducción a la Investigación en Psicología", "Introducción a la Investigación Psicológica"], [1, 2, 3, 4, 5]);
registrar(["Psicología del Desarrollo II: Adolescencia y Adultez"], [1, 3, 4]);
registrar(["Teorías Psicológicas II"], [1, 2, 3, 4, 5]);

// Ciclo Intermedio · Nivel de Licenciado
registrar(["Evaluación Proyectiva"], [3, 4]);
registrar(["Intervención Sociocomunitaria"], [5]);
registrar(["Metodología y Análisis de Datos Cuantitativos"], [2, 4]);
registrar(["Psicología Organizacional"], [3, 4]);
registrar(["Teorías Psicológicas III"], [4, 6]);
registrar(["Electivo de Desarrollo Personal"], [], true);

registrar(["Psicodiagnóstico Infanto Juvenil"], [3, 6]);
registrar(["Intervención en Organizaciones"], [3, 4, 5, 6]);
registrar(["Metodología y Análisis de Datos Cualitativos", "Metodologías y Análisis de Datos Cualitativos"], [2, 5, 6]);
registrar(["Psicopatología y Psicofarmacología Infanto Juvenil"], [3, 4]);
registrar(["Teorías Psicológicas IV"], [3, 4, 5]);
registrar(["Electivo de Responsabilidad Social"], [], true);

registrar(["Psicodiagnóstico Adulto"], [3, 4, 6]);
registrar(["Intervención Clínica Infanto Juvenil"], [3, 4, 5, 6]);
registrar(["Proyecto de Tesis"], [2, 4]);
registrar(["Psicología de la Educación"], [1, 3, 6]);
registrar(["Psicopatología y Psicofarmacología Adulto"], [4, 6]);
registrar(["Electivo de Ética", "Electivo de Ética: Ética y Diversidad"], [], true);

registrar(["Desempeño Ético del Psicólogo"], [1, 2, 6]);
registrar(["Intervención Clínica Adulto"], [4]);
registrar(["Seminario de Tesis"], [1, 2, 3, 4, 5, 6]);
registrar(["Intervención Psicoeducativa en Contextos Escolares"], [4, 5, 6]);
registrar(["Psicología Jurídica"], [3, 4]);
registrar(["Psicología de la Salud"], [3, 4, 5]);

// Ciclo Avanzado · Perfil de Egreso Profesional
registrar(["Práctica Avanzada I"], [1, 3, 4, 5]);
registrar(["Práctica Avanzada II"], [1, 3, 4, 5, 6]);

// Optativos con programa individual. Los nombres genéricos “Optativo de
// Especialidad I–IV” no se asignan automáticamente porque dependen del
// optativo concreto que se dicte.
registrar(["Convivencia Escolar", "Optativo de Especialidad: Convivencia Escolar"], [1, 4, 5]);
registrar(["Entrevista por Competencias", "Optativo de Especialidad: Entrevista por Competencias"], [1, 3]);
registrar(["Técnicas Psicoterapéuticas Infantojuveniles", "Optativo de Especialidad: Técnicas Psicoterapéuticas Infanto-Juveniles"], [1, 3, 4, 5]);
registrar(["Diseño de Programas Sociales", "Evaluación de Programas Sociales", "Diseño y Evaluación de Programas Sociales y Sanitarios en Psicología"], [2, 3]);

export function tributacionDePrograma(nombreAsignatura: string): TributacionPrograma | null {
  return MATRIZ.get(normalizar(nombreAsignatura)) ?? null;
}

export function lineaDeCodigo(codigo: string): LineaCompetencia | null {
  const linea = Number.parseInt(codigo.split(".")[0] ?? "", 10);
  return linea >= 1 && linea <= 6 ? (linea as LineaCompetencia) : null;
}
