// Seed de datos institucionales fijos (no dependen de ningún coordinador).
// Ejecutar con: npm run db:seed

import { PrismaClient } from '@prisma/client';
import { COMPONENTES_EPG } from './seed-data';
import { lineaDeCodigo, tributacionDePrograma } from '../src/lib/tributacion-programas';

const prisma = new PrismaClient();

async function main() {
  for (const c of COMPONENTES_EPG) {
    await prisma.componenteEPG.upsert({
      where: { orden: c.orden },
      update: { nombre: c.nombre, descripcion: c.descripcion },
      create: c,
    });
  }
  console.log(`Componentes EPG listos (${COMPONENTES_EPG.length}).`);

  // Completa niveles creados antes de incorporar los programas oficiales.
  // Solo actúa sobre asignaturas sin ningún vínculo para respetar cualquier
  // ajuste que el coordinador ya haya realizado.
  const niveles = await prisma.nivel.findMany({
    select: {
      id: true,
      competencias: { select: { id: true, codigo: true } },
      asignaturas: {
        select: { id: true, nombre: true, mapeos: { select: { id: true }, take: 1 } },
      },
    },
  });

  let mapeosCreados = 0;
  for (const nivel of niveles) {
    const competenciaPorLinea = new Map(
      nivel.competencias.flatMap((competencia) => {
        const linea = lineaDeCodigo(competencia.codigo);
        return linea ? [[linea, competencia.id] as const] : [];
      })
    );

    const mapeos = nivel.asignaturas.flatMap((asignatura) => {
      if (asignatura.mapeos.length > 0) return [];
      const programa = tributacionDePrograma(asignatura.nombre);
      if (!programa) return [];
      return programa.lineas.flatMap((linea) => {
        const competenciaId = competenciaPorLinea.get(linea);
        return competenciaId
          ? [{ asignaturaId: asignatura.id, competenciaId, tipo: 'DIRECTA' as const }]
          : [];
      });
    });

    if (mapeos.length > 0) {
      const resultado = await prisma.mapeoAsignaturaCompetencia.createMany({
        data: mapeos,
        skipDuplicates: true,
      });
      mapeosCreados += resultado.count;
    }
  }
  console.log(`Tributación de programas lista (${mapeosCreados} vínculos nuevos).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
