-- Código corto de nivel: deja entrar al docente que perdió el enlace.
-- Se añade en tres pasos porque la tabla ya tiene filas y la columna es
-- obligatoria y única: crear nullable, rellenar, y recién ahí exigirla.
ALTER TABLE "Nivel" ADD COLUMN "codigo" TEXT;

-- Hexadecimal en mayúsculas (0-9 A-F): no contiene O, I ni l, así que no hay
-- caracteres que se confundan al dictarlos por teléfono o WhatsApp.
UPDATE "Nivel"
SET "codigo" = upper(substr(md5(random()::text || "id"), 1, 6))
WHERE "codigo" IS NULL;

ALTER TABLE "Nivel" ALTER COLUMN "codigo" SET NOT NULL;
CREATE UNIQUE INDEX "Nivel_codigo_key" ON "Nivel"("codigo");

-- Percepciones del docente: las dos preguntas abiertas del final.
CREATE TABLE "Percepcion" (
    "id" TEXT NOT NULL,
    "dificultad" TEXT,
    "sugerencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reunionId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,

    CONSTRAINT "Percepcion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Percepcion_reunionId_idx" ON "Percepcion"("reunionId");
CREATE UNIQUE INDEX "Percepcion_reunionId_docenteId_asignaturaId_key" ON "Percepcion"("reunionId", "docenteId", "asignaturaId");

ALTER TABLE "Percepcion" ADD CONSTRAINT "Percepcion_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "Reunion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Percepcion" ADD CONSTRAINT "Percepcion_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Percepcion" ADD CONSTRAINT "Percepcion_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "Asignatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
