-- CreateEnum
CREATE TYPE "EstadoAcuerdo" AS ENUM ('PENDIENTE', 'EN_CURSO', 'CUMPLIDO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "Acuerdo" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "responsable" TEXT,
    "plazo" TEXT,
    "estado" "EstadoAcuerdo" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nivelId" TEXT NOT NULL,
    "reunionId" TEXT NOT NULL,
    "competenciaId" TEXT,

    CONSTRAINT "Acuerdo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Acuerdo_nivelId_idx" ON "Acuerdo"("nivelId");

-- CreateIndex
CREATE INDEX "Acuerdo_reunionId_idx" ON "Acuerdo"("reunionId");

-- AddForeignKey
ALTER TABLE "Acuerdo" ADD CONSTRAINT "Acuerdo_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acuerdo" ADD CONSTRAINT "Acuerdo_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "Reunion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acuerdo" ADD CONSTRAINT "Acuerdo_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "Competencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
