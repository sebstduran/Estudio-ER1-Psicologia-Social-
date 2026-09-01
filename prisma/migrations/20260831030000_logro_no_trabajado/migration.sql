-- "Aún no lo trabajo": el docente puede decir que la evidencia todavía no se ve
-- en su asignatura. Queda fuera del denominador del puntaje (ver totalDe en
-- src/lib/diagnostico.ts), así que no suma ni resta.
--
-- Va en su propia migración a propósito: Postgres no permite USAR un valor de
-- enum recién creado dentro de la misma transacción que lo crea.
ALTER TYPE "NivelLogro" ADD VALUE 'NO_TRABAJADO';
