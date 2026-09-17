ALTER TABLE "Informe"
ADD COLUMN "versionPrompt" TEXT NOT NULL DEFAULT 'v2',
ADD COLUMN "versionEvidencia" TEXT NOT NULL DEFAULT '2026-09',
ADD COLUMN "huellaEntrada" TEXT;

ALTER TABLE "Acuerdo"
ADD COLUMN "criterioExito" TEXT,
ADD COLUMN "evidenciaEsperada" TEXT;
