// Seed OPCIONAL para tener algo que mostrar apenas se despliega la app.
// No se ejecuta en el build (vercel-build solo corre prisma/seed.ts vía
// postinstall + migrate deploy) — se corre a mano una vez con:
//   npm run db:seed:demo
// Crea una cuenta de coordinador de ejemplo con un nivel ya configurado
// y evaluado, para que se pueda ver la app funcionando de inmediato.

import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "@prisma/client";
import { COMPONENTES_EPG, COMPETENCIAS_CICLO_INICIAL } from "./seed-data";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@ua.cl";
const DEMO_PASSWORD = "demo1234";

async function main() {
  // Asegura el catálogo institucional (idempotente).
  for (const c of COMPONENTES_EPG) {
    await prisma.componenteEPG.upsert({
      where: { orden: c.orden },
      update: { nombre: c.nombre, descripcion: c.descripcion },
      create: c,
    });
  }
  const componentes = await prisma.componenteEPG.findMany();
  const componentePorOrden = new Map(componentes.map((c) => [c.orden, c.id]));

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const coordinador = await prisma.coordinador.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, nombre: "Coordinadora Demo", passwordHash },
  });

  const nivelExistente = await prisma.nivel.findFirst({
    where: { coordinadorId: coordinador.id, nombre: "Nivel 1 · Sede Temuco" },
  });
  if (nivelExistente) {
    console.log("El nivel de demo ya existe, no se duplica.");
    return;
  }

  const nivel = await prisma.nivel.create({
    data: {
      nombre: "Nivel 1 · Sede Temuco",
      cicloTipo: "INICIAL",
      modalidad: "DIURNO",
      trimestre: "2026-T3",
      coordinadorId: coordinador.id,
      reunionActualNumero: 4,
      reuniones: {
        create: [
          { numero: 1, fase: "BASE" },
          { numero: 2, fase: "SEGUIMIENTO" },
          { numero: 3, fase: "SEGUIMIENTO" },
          { numero: 4, fase: "CIERRE" },
        ],
      },
    },
    include: { reuniones: true },
  });

  const competencias: Prisma.CompetenciaGetPayload<{ include: { indicadores: true } }>[] = [];
  for (const [i, comp] of COMPETENCIAS_CICLO_INICIAL.entries()) {
    const componenteEpgId = componentePorOrden.get(comp.componenteOrden)!;
    const competencia = await prisma.competencia.create({
      data: {
        nivelId: nivel.id,
        codigo: comp.codigo,
        nombre: comp.nombre,
        descriptor: comp.descriptor,
        orden: i + 1,
        componenteEpgId,
        indicadores: { create: comp.indicadores.map((texto, j) => ({ texto, orden: j + 1 })) },
      },
      include: { indicadores: true },
    });
    competencias.push(competencia);
  }

  const asignaturasNombres = [
    "Psicología del Desarrollo I",
    "Metodología de la Investigación I",
    "Bases Biológicas de la Conducta",
  ];
  const asignaturas: Prisma.AsignaturaGetPayload<object>[] = [];
  for (const nombre of asignaturasNombres) {
    asignaturas.push(await prisma.asignatura.create({ data: { nivelId: nivel.id, nombre } }));
  }

  // Mapeo: cada asignatura tributa directa a una competencia y transversal a otra.
  const mapeos: Array<[number, number, "DIRECTA" | "TRANSVERSAL"]> = [
    [0, 0, "DIRECTA"], // Psicología del Desarrollo I -> 1.1 Fundamentar
    [0, 3, "DIRECTA"], // -> 4.1 Analizar
    [0, 5, "TRANSVERSAL"], // -> 6.1 Autoexplorar
    [1, 1, "DIRECTA"], // Metodología -> 2.1 Investigar
    [1, 2, "TRANSVERSAL"], // -> 3.1 Evaluar
    [2, 0, "TRANSVERSAL"], // Bases Biológicas -> 1.1 Fundamentar
    [2, 2, "DIRECTA"], // -> 3.1 Evaluar
  ];
  for (const [asigIdx, compIdx, tipo] of mapeos) {
    await prisma.mapeoAsignaturaCompetencia.create({
      data: { asignaturaId: asignaturas[asigIdx].id, competenciaId: competencias[compIdx].id, tipo },
    });
  }

  const docentesInfo = [
    { nombre: "Prof. Carla Vidal", email: "carla.vidal@ua.cl", asigIdx: 0 },
    { nombre: "Prof. Matías Herrera", email: "matias.herrera@ua.cl", asigIdx: 1 },
    { nombre: "Prof. Daniela Soto", email: "daniela.soto@ua.cl", asigIdx: 2 },
  ];
  const docentes: Prisma.DocenteGetPayload<object>[] = [];
  for (const d of docentesInfo) {
    docentes.push(
      await prisma.docente.create({
        data: {
          nivelId: nivel.id,
          nombre: d.nombre,
          email: d.email,
          asignaturas: { create: [{ asignaturaId: asignaturas[d.asigIdx].id }] },
        },
      })
    );
  }

  const reunionBase = nivel.reuniones.find((r) => r.numero === 1)!;
  const reunionCierre = nivel.reuniones.find((r) => r.numero === 4)!;

  // Comentarios de ejemplo: el dato cualitativo que explica el número y que la
  // vista de resultados y el informe usan como evidencia.
  const COMENTARIOS: Record<string, string[]> = {
    INCIPIENTE: [
      "Cuesta que distingan el fundamento teórico de la opinión personal; en el control la mayoría describió sin fundamentar.",
      "Llegan sin la lectura previa hecha, así que la clase se va en cubrir lo mínimo.",
      "Confunden los niveles de análisis. Necesitan más práctica guiada antes de trabajar solos.",
    ],
    EN_PROCESO: [
      "Avanzaron respecto del primer trabajo, pero la argumentación sigue siendo descriptiva.",
      "El grupo que asistió al taller mejoró bastante; el resto quedó atrás.",
      "Ya identifican los elementos, falta que los relacionen entre sí.",
    ],
    LOGRADO: [
      "El trabajo final mostró un manejo sólido, incluso citando autores fuera de la bibliografía obligatoria.",
      "La rúbrica compartida con la otra asignatura ayudó: llegaron con el criterio claro.",
    ],
  };

  // Evaluaciones: línea base floja (incipiente/en proceso), cierre con avance (logrado).
  let contador = 0;
  async function evaluar(
    reunionId: string,
    docenteIdx: number,
    asigIdx: number,
    nivelLogro: "LOGRADO" | "EN_PROCESO" | "INCIPIENTE"
  ) {
    const asignaturaId = asignaturas[asigIdx].id;
    const mapeosDeAsignatura = mapeos.filter(([a]) => a === asigIdx);
    for (const [, compIdx] of mapeosDeAsignatura) {
      const competencia = competencias[compIdx];
      for (const indicador of competencia.indicadores) {
        // Un comentario cada dos votos, para que la vista tenga casos con y sin.
        const pool = COMENTARIOS[nivelLogro];
        const comentario = contador % 2 === 0 ? pool[(contador / 2) % pool.length] : null;
        contador += 1;
        await prisma.evaluacion.create({
          data: {
            reunionId,
            docenteId: docentes[docenteIdx].id,
            asignaturaId,
            indicadorId: indicador.id,
            competenciaId: competencia.id,
            nivelLogro,
            comentario,
          },
        });
      }
    }
  }

  await evaluar(reunionBase.id, 0, 0, "INCIPIENTE");
  await evaluar(reunionBase.id, 1, 1, "EN_PROCESO");
  await evaluar(reunionBase.id, 2, 2, "INCIPIENTE");

  // Seguimiento intermedio, para que la trayectoria tenga más de dos puntos.
  const reunionSeguimiento = nivel.reuniones.find((r) => r.numero === 2)!;
  await evaluar(reunionSeguimiento.id, 0, 0, "EN_PROCESO");
  await evaluar(reunionSeguimiento.id, 1, 1, "EN_PROCESO");

  await evaluar(reunionCierre.id, 0, 0, "LOGRADO");
  await evaluar(reunionCierre.id, 1, 1, "EN_PROCESO");
  await evaluar(reunionCierre.id, 2, 2, "INCIPIENTE");

  // El disenso sobre 1.1 Fundamentar aparece solo: la competencia la tributan
  // Psicología del Desarrollo (directa, la da por lograda) y Bases Biológicas
  // (transversal, la califica incipiente). Es el caso que el instrumento debe
  // distinguir del bajo logro: el equipo no comparte el criterio.

  console.log("Demo lista:");
  console.log(`  Coordinador: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Nivel: ${nivel.nombre} (${nivel.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
