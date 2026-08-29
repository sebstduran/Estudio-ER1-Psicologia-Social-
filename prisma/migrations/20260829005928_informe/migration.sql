-- CreateEnum
CREATE TYPE "EstadoInforme" AS ENUM ('GENERANDO', 'LISTO', 'ERROR');

-- CreateTable
CREATE TABLE "Informe" (
    "id" TEXT NOT NULL,
    "estado" "EstadoInforme" NOT NULL DEFAULT 'GENERANDO',
    "contenido" JSONB,
    "error" TEXT,
    "modelo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivelId" TEXT NOT NULL,
    "reunionId" TEXT NOT NULL,

    CONSTRAINT "Informe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Informe_nivelId_idx" ON "Informe"("nivelId");

-- CreateIndex
CREATE INDEX "Informe_reunionId_idx" ON "Informe"("reunionId");

-- AddForeignKey
ALTER TABLE "Informe" ADD CONSTRAINT "Informe_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Informe" ADD CONSTRAINT "Informe_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "Reunion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
