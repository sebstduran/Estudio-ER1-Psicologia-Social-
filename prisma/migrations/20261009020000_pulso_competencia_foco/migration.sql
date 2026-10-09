-- Distingue las respuestas breves por competencia de la rúbrica histórica
-- por indicador, y registra hasta dos elementos curriculares como foco.
ALTER TABLE "Evaluacion"
ADD COLUMN "esPulso" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "esFoco" BOOLEAN NOT NULL DEFAULT false;
