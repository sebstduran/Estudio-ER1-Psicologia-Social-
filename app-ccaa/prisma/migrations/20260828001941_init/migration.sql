-- CreateTable
CREATE TABLE "Coordinador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ComponenteEPG" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orden" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Nivel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "cicloTipo" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "trimestre" TEXT NOT NULL,
    "reunionActualNumero" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "coordinadorId" TEXT NOT NULL,
    CONSTRAINT "Nivel_coordinadorId_fkey" FOREIGN KEY ("coordinadorId") REFERENCES "Coordinador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Competencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descriptor" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "nivelId" TEXT NOT NULL,
    "componenteEpgId" TEXT NOT NULL,
    CONSTRAINT "Competencia_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Competencia_componenteEpgId_fkey" FOREIGN KEY ("componenteEpgId") REFERENCES "ComponenteEPG" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Indicador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "competenciaId" TEXT NOT NULL,
    CONSTRAINT "Indicador_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "Competencia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asignatura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "nivelId" TEXT NOT NULL,
    CONSTRAINT "Asignatura_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MapeoAsignaturaCompetencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,
    "competenciaId" TEXT NOT NULL,
    CONSTRAINT "MapeoAsignaturaCompetencia_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MapeoAsignaturaCompetencia_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "Competencia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Docente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nivelId" TEXT NOT NULL,
    CONSTRAINT "Docente_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocenteAsignatura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docenteId" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,
    CONSTRAINT "DocenteAsignatura_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocenteAsignatura_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reunion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "fase" TEXT NOT NULL,
    "fecha" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'PLANIFICADA',
    "nivelId" TEXT NOT NULL,
    CONSTRAINT "Reunion_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nivelLogro" TEXT NOT NULL,
    "comentario" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reunionId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,
    "indicadorId" TEXT NOT NULL,
    "competenciaId" TEXT NOT NULL,
    CONSTRAINT "Evaluacion_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "Reunion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evaluacion_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evaluacion_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evaluacion_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "Indicador" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evaluacion_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "Competencia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Acta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreArchivo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "subidoPor" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reunionId" TEXT NOT NULL,
    CONSTRAINT "Acta_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "Reunion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Coordinador_email_key" ON "Coordinador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ComponenteEPG_orden_key" ON "ComponenteEPG"("orden");

-- CreateIndex
CREATE INDEX "Nivel_coordinadorId_idx" ON "Nivel"("coordinadorId");

-- CreateIndex
CREATE INDEX "Competencia_nivelId_idx" ON "Competencia"("nivelId");

-- CreateIndex
CREATE UNIQUE INDEX "Competencia_nivelId_codigo_key" ON "Competencia"("nivelId", "codigo");

-- CreateIndex
CREATE INDEX "Indicador_competenciaId_idx" ON "Indicador"("competenciaId");

-- CreateIndex
CREATE INDEX "Asignatura_nivelId_idx" ON "Asignatura"("nivelId");

-- CreateIndex
CREATE INDEX "MapeoAsignaturaCompetencia_competenciaId_idx" ON "MapeoAsignaturaCompetencia"("competenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "MapeoAsignaturaCompetencia_asignaturaId_competenciaId_key" ON "MapeoAsignaturaCompetencia"("asignaturaId", "competenciaId");

-- CreateIndex
CREATE INDEX "Docente_nivelId_idx" ON "Docente"("nivelId");

-- CreateIndex
CREATE UNIQUE INDEX "Docente_nivelId_email_key" ON "Docente"("nivelId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "DocenteAsignatura_docenteId_asignaturaId_key" ON "DocenteAsignatura"("docenteId", "asignaturaId");

-- CreateIndex
CREATE INDEX "Reunion_nivelId_idx" ON "Reunion"("nivelId");

-- CreateIndex
CREATE UNIQUE INDEX "Reunion_nivelId_numero_key" ON "Reunion"("nivelId", "numero");

-- CreateIndex
CREATE INDEX "Evaluacion_reunionId_idx" ON "Evaluacion"("reunionId");

-- CreateIndex
CREATE INDEX "Evaluacion_competenciaId_idx" ON "Evaluacion"("competenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluacion_reunionId_docenteId_asignaturaId_indicadorId_key" ON "Evaluacion"("reunionId", "docenteId", "asignaturaId", "indicadorId");

-- CreateIndex
CREATE INDEX "Acta_reunionId_idx" ON "Acta"("reunionId");
