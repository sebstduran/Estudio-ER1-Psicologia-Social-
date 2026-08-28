// Seed de datos institucionales fijos (no dependen de ningún coordinador).
// Ejecutar con: npm run db:seed

import { PrismaClient } from '@prisma/client';
import { COMPONENTES_EPG } from './seed-data';

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
