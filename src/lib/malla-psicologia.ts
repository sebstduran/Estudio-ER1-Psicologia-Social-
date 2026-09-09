export type JornadaMalla = "DIURNO" | "VESPERTINO_TECH";
export type CicloMalla = "INICIAL" | "INTERMEDIO" | "FINAL";

export type NivelMalla = {
  numero: number;
  ciclo: CicloMalla;
  asignaturas: readonly string[];
};

/**
 * Mallas curriculares oficiales de Psicología 2025 entregadas por el usuario.
 * En diurno cada nivel corresponde a un semestre; en vespertino, a un trimestre.
 * El nombre FINAL se conserva internamente por compatibilidad con la base de
 * datos, pero en la interfaz siempre se presenta como Ciclo Avanzado.
 */
export const MALLA_PSICOLOGIA: Record<JornadaMalla, readonly NivelMalla[]> = {
  DIURNO: [
    { numero: 1, ciclo: "INICIAL", asignaturas: ["Fundamentos Neuroanatómicos y Funcionales del Sistema Nervioso", "Fundamentos Socioculturales de la Psicología", "Procesos Psicológicos I", "Taller de Habilidades Profesionales I", "Introducción a la Psicología", "Electivo de Comunicación"] },
    { numero: 2, ciclo: "INICIAL", asignaturas: ["Epistemología Aplicada a la Psicología", "Introducción a la Neurociencia", "Procesos Psicológicos II", "Taller de Habilidades Profesionales II", "Electivo de Comunicación"] },
    { numero: 3, ciclo: "INICIAL", asignaturas: ["Neuropsicología", "Psicología de la Personalidad", "Psicología Social", "Psicología del Desarrollo I: Primera y Segunda Infancia", "Teorías Psicológicas I", "Electivo de Desarrollo del Pensamiento"] },
    { numero: 4, ciclo: "INICIAL", asignaturas: ["Evaluación Psicométrica", "Intervención Psicosocial con Grupos", "Introducción a la Investigación en Psicología", "Psicología del Desarrollo II: Adolescencia y Adultez", "Teorías Psicológicas II"] },
    { numero: 5, ciclo: "INTERMEDIO", asignaturas: ["Evaluación Proyectiva", "Intervención Sociocomunitaria", "Metodología y Análisis de Datos Cuantitativos", "Psicología Organizacional", "Teorías Psicológicas III", "Electivo de Desarrollo Personal"] },
    { numero: 6, ciclo: "INTERMEDIO", asignaturas: ["Psicodiagnóstico Infanto Juvenil", "Intervención en Organizaciones", "Metodología y Análisis de Datos Cualitativos", "Psicopatología y Psicofarmacología Infanto Juvenil", "Teorías Psicológicas IV", "Electivo de Responsabilidad Social"] },
    { numero: 7, ciclo: "INTERMEDIO", asignaturas: ["Psicodiagnóstico Adulto", "Intervención Clínica Infanto Juvenil", "Proyecto de Tesis", "Psicología de la Educación", "Psicopatología y Psicofarmacología Adulto", "Electivo de Ética"] },
    { numero: 8, ciclo: "INTERMEDIO", asignaturas: ["Desempeño Ético del Psicólogo", "Intervención Clínica Adulto", "Seminario de Tesis", "Intervención Psicoeducativa en Contextos Escolares", "Psicología Jurídica", "Psicología de la Salud"] },
    { numero: 9, ciclo: "FINAL", asignaturas: ["Práctica Avanzada I", "Optativo de Especialidad I", "Optativo de Especialidad II"] },
    { numero: 10, ciclo: "FINAL", asignaturas: ["Práctica Avanzada II", "Optativo de Especialidad III", "Optativo de Especialidad IV"] },
  ],
  VESPERTINO_TECH: [
    { numero: 1, ciclo: "INICIAL", asignaturas: ["Procesos Psicológicos I", "Taller de Habilidades Profesionales I", "Introducción a la Psicología", "Electivo de Comunicación"] },
    { numero: 2, ciclo: "INICIAL", asignaturas: ["Fundamentos Neuroanatómicos y Funcionales del Sistema Nervioso", "Fundamentos Socioculturales de la Psicología", "Procesos Psicológicos II", "Electivo de Comunicación"] },
    { numero: 3, ciclo: "INICIAL", asignaturas: ["Epistemología Aplicada a la Psicología", "Introducción a la Neurociencia", "Taller de Habilidades Profesionales II"] },
    { numero: 4, ciclo: "INICIAL", asignaturas: ["Psicología de la Personalidad", "Psicología Social", "Psicología del Desarrollo I: Primera y Segunda Infancia", "Electivo de Desarrollo del Pensamiento"] },
    { numero: 5, ciclo: "INICIAL", asignaturas: ["Neuropsicología", "Psicología del Desarrollo II: Adolescencia y Adultez", "Teorías Psicológicas I"] },
    { numero: 6, ciclo: "INICIAL", asignaturas: ["Evaluación Psicométrica", "Intervención Psicosocial con Grupos", "Introducción a la Investigación en Psicología", "Teorías Psicológicas II"] },
    { numero: 7, ciclo: "INTERMEDIO", asignaturas: ["Intervención Sociocomunitaria", "Psicología Organizacional", "Teorías Psicológicas III", "Electivo de Desarrollo Personal"] },
    { numero: 8, ciclo: "INTERMEDIO", asignaturas: ["Evaluación Proyectiva", "Intervención en Organizaciones", "Metodología y Análisis de Datos Cuantitativos", "Electivo de Responsabilidad Social"] },
    { numero: 9, ciclo: "INTERMEDIO", asignaturas: ["Psicodiagnóstico Infanto Juvenil", "Metodología y Análisis de Datos Cualitativos", "Psicopatología y Psicofarmacología Infanto Juvenil", "Teorías Psicológicas IV"] },
    { numero: 10, ciclo: "INTERMEDIO", asignaturas: ["Psicodiagnóstico Adulto", "Intervención Clínica Infanto Juvenil", "Psicopatología y Psicofarmacología Adulto", "Electivo de Ética"] },
    { numero: 11, ciclo: "INTERMEDIO", asignaturas: ["Desempeño Ético del Psicólogo", "Intervención Clínica Adulto", "Proyecto de Tesis", "Psicología de la Educación"] },
    { numero: 12, ciclo: "INTERMEDIO", asignaturas: ["Seminario de Tesis", "Psicología Jurídica", "Intervención Psicoeducativa en Contextos Escolares", "Psicología de la Salud"] },
    { numero: 13, ciclo: "FINAL", asignaturas: ["Optativo de Especialidad I", "Optativo de Especialidad II", "Optativo de Especialidad III", "Optativo de Especialidad IV"] },
    { numero: 14, ciclo: "FINAL", asignaturas: ["Práctica Avanzada I"] },
    { numero: 15, ciclo: "FINAL", asignaturas: ["Práctica Avanzada II"] },
  ],
};

export const NOMBRE_CICLO: Record<CicloMalla, string> = {
  INICIAL: "Ciclo Inicial",
  INTERMEDIO: "Ciclo Intermedio",
  FINAL: "Ciclo Avanzado",
};

export function nivelDeMalla(jornada: JornadaMalla, numero: number) {
  return MALLA_PSICOLOGIA[jornada].find((nivel) => nivel.numero === numero) ?? null;
}
