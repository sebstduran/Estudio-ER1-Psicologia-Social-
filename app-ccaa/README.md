# Instrumento CCAA — EPG

Aplicación para coordinadores de Comunidad Académica (CCAA) de Psicología UA:
diagnostica el logro de las competencias de ciclo a partir del juicio docente
y lo traduce en decisiones de Estrategia Pedagógica Global (EPG).

Ver `AGENTS.md` (contexto institucional) y el hilo de diseño para el detalle
completo del modelo de datos y los milestones.

## Requisitos

- Node.js 20+

## Puesta en marcha

```bash
npm install
cp .env.example .env
# Genera tu propio AUTH_SECRET:
npx auth secret

npm run db:migrate   # crea prisma/dev.db y aplica el schema
npm run db:seed      # carga los 7 componentes EPG institucionales
npm run dev
```

Abre http://localhost:3000, crea una cuenta de coordinador en `/registro` y
empieza a configurar un Nivel.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:migrate` | Aplica migraciones de Prisma (crea una nueva si cambiaste el schema) |
| `npm run db:seed` | Carga el catálogo fijo de Componentes EPG |
| `npm run db:studio` | Explorador visual de la base de datos (Prisma Studio) |

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Prisma + SQLite +
NextAuth (Credentials). Ver el schema completo en `prisma/schema.prisma`.

## Estado

- [x] M0 — Scaffold, autenticación por coordinador, tema claro/oscuro con
      paleta institucional UA.
- [x] M1 — Configurar: Niveles, competencias del Ciclo Inicial precargadas,
      Asignaturas, matriz de mapeo Asignatura × Competencia.
- [ ] M2 — Evaluar: rúbrica docente por indicador, subida de actas.
- [ ] M3 — Sintetizar: agregación de votos y comparación línea base vs. cierre.
- [ ] M4 — Informe generado con la API de Anthropic.
