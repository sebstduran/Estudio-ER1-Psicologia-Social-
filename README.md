# Instrumento CCAA — EPG

Aplicación para coordinadores de Comunidad Académica (CCAA) de Psicología UA:
diagnostica el logro de las competencias de ciclo a partir del juicio docente
y lo traduce en decisiones de Estrategia Pedagógica Global (EPG).

Ver `AGENTS.md` (contexto institucional) y el hilo de diseño para el detalle
completo del modelo de datos y los milestones.

El prototipo original en un solo archivo HTML quedó guardado en
`prototipo-original/index.html`.

## Requisitos

- Node.js 20+
- Postgres (local o remoto — ver abajo)

## Puesta en marcha (local)

```bash
npm install
cp .env.example .env
# Completa DATABASE_URL con tu Postgres local, ej:
#   postgresql://postgres:postgres@localhost:5432/ccaa_dev
# Genera tu propio AUTH_SECRET:
npx auth secret

npm run db:migrate   # aplica el schema
npm run db:seed      # carga los 7 componentes EPG institucionales
npm run dev
```

Abre http://localhost:3000, crea una cuenta de coordinador en `/registro` y
empieza a configurar un Nivel.

Si quieres partir con datos de ejemplo ya cargados (un nivel completo,
asignaturas, docentes, mapeo y evaluaciones), corre además:

```bash
npm run db:seed:demo
```

Esto crea el coordinador `demo@ua.cl` / `demo1234` con un nivel de ejemplo
("Nivel 1 · Sede Temuco").

## Desplegar en Vercel

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importa este
   repositorio. La app vive en la raíz del repositorio y en la rama `main`, así
   que no hay que tocar "Root Directory" ni "Production Branch".
2. Pestaña **Storage** del proyecto → **Create Database** → Postgres (Neon).
   Vercel deja la variable `DATABASE_URL` (o `POSTGRES_URL`, según la
   integración) ya conectada al proyecto — si el nombre no calza exactamente
   con `DATABASE_URL`, agrégala tú en **Settings → Environment Variables**
   copiando ese mismo valor.
3. Misma pestaña **Storage** → **Create Database** → **Blob** (para las actas
   que suben los docentes). Al conectarlo, Vercel agrega solo
   `BLOB_READ_WRITE_TOKEN` — sin esto, la subida de actas fallaría en
   producción porque el disco de la función es de solo lectura.
4. Agrega el resto de las variables de entorno (Settings → Environment
   Variables), iguales a `.env.example`:
   - `AUTH_SECRET` (genera uno con `npx auth secret`)
   - `AUTH_TRUST_HOST=true`
   - `GEMINI_API_KEY` (habilita el botón "Generar recomendaciones"; si queda
     vacía el resto de la app funciona igual). Se obtiene gratis en
     https://aistudio.google.com/apikey — ver la advertencia de datos más abajo.
5. Deploy. El comando de build es `npm run vercel-build`, que ya deja
   `prisma migrate deploy` corriendo antes de `next build` — cada deploy
   aplica las migraciones pendientes automáticamente.
6. (Opcional) Para tener algo que mostrar de inmediato, corre una vez desde tu
   máquina, apuntando al `DATABASE_URL` de producción:
   ```bash
   DATABASE_URL="<la url de Vercel>" npm run db:seed:demo
   ```

## Las recomendaciones y tus datos

El botón "Generar recomendaciones" usa **Gemini** (Google) a través de su capa
gratuita, que es lo que hace viable la función sin presupuesto. Conviene tener
presente qué se manda y bajo qué condiciones.

**Qué se envía en cada petición:** los puntajes de la reunión, los nombres y
códigos de las competencias, y los comentarios que escribieron las y los
docentes, con el nombre de quien los escribió y su asignatura. No se envían
correos, contraseñas ni las actas subidas.

**La capa gratuita no es privada.** Google se reserva el derecho de revisar y
usar el contenido enviado por la capa sin costo para mejorar sus productos —
las condiciones vigentes están en https://ai.google.dev/gemini-api/terms. Los
comentarios docentes son juicio profesional sobre cursos reales, identificado
con nombre y apellido, así que la decisión de usar la capa gratuita es una
decisión institucional, no técnica. Vale la pena que la tome quien corresponda
y no que quede como un supuesto.

**Si más adelante hace falta que no lo sea**, hay dos caminos sin reescribir la
aplicación: activar facturación en el mismo proyecto de Google (la capa de pago
no usa el contenido para entrenar), o cambiar `src/lib/ai/informe.ts` a otro
proveedor — es el único archivo que habla con el modelo, y expone una sola
función, `generarInforme(diagnostico)`.

**Mientras tanto**, la vía corta para reducir la exposición es acordar con el
equipo que los comentarios describan al curso y no a personas — que además es
mejor práctica evaluativa por su cuenta.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:migrate` | Aplica migraciones de Prisma (crea una nueva si cambiaste el schema) |
| `npm run db:seed` | Carga el catálogo fijo de Componentes EPG |
| `npm run db:seed:demo` | Carga un nivel de ejemplo completo (Sede Temuco) |
| `npm run db:studio` | Explorador visual de la base de datos (Prisma Studio) |

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Prisma + PostgreSQL +
NextAuth (Credentials). Ver el schema completo en `prisma/schema.prisma`.

## Estado

- [x] M0 — Scaffold, autenticación por coordinador, tema claro/oscuro con
      paleta institucional UA.
- [x] M1 — Configurar: Niveles, competencias del Ciclo Inicial precargadas,
      Asignaturas, matriz de mapeo Asignatura × Competencia.
- [x] M2 — Evaluar: Docentes, rúbrica por indicador (sin cuenta, vía enlace),
      subida de actas.
- [x] M3 — Sintetizar: competencias priorizadas por urgencia (crítico / en
      riesgo / consolidado), evidencia más débil, comentarios de los docentes,
      apertura por asignatura y comparación línea base vs. cierre.
- [x] M4 — Recomendaciones generadas con la API de Anthropic: diagnóstico por
      competencia, decisión EPG a activar, acciones concretas para que las y los
      estudiantes alcancen el estándar, recomendaciones por asignatura y alertas
      de cara al Hito de Evaluación de Ciclo.
