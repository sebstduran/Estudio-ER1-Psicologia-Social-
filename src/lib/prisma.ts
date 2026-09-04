import { PrismaClient, Prisma } from '@prisma/client';

// Evita crear múltiples conexiones en desarrollo por el hot-reload de Next.js.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Reintento ante la base dormida.
 *
 * El plan gratuito de Neon suspende la base tras un rato sin uso y la despierta
 * sola al primer intento — pero ese primer intento puede tardar más de lo que
 * Prisma espera y volver con P1001 «Can't reach database server». La aplicación
 * se usa unas pocas veces por trimestre y proyectada en la reunión: la reunión
 * empieza SIEMPRE con la base dormida, así que ese primer fallo no es un caso
 * raro, es el caso normal. Sin esto, la primera pantalla del trimestre es una
 * página de error delante de la comunidad académica.
 *
 * Reintenta sólo el fallo de conexión, con una espera corta. Un error de
 * consulta, de permisos o de datos pasa de largo: reintentarlo escondería un
 * problema real.
 *
 * El fallo de conexión llega en DOS formas distintas, comprobadas contra la
 * base real: la base dormida devuelve PrismaClientKnownRequestError con código
 * P1001, y un servidor que no responde devuelve PrismaClientInitializationError
 * sin código. Filtrar sólo por P1001 dejaba fuera la mitad de los casos.
 */
const REINTENTOS = 3;
const ESPERA_MS = 700;

const despertarLaBase = Prisma.defineExtension({
  name: 'despertar-la-base',
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        for (let intento = 0; ; intento++) {
          try {
            return await query(args);
          } catch (e) {
            const dormida =
              (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P1001') ||
              e instanceof Prisma.PrismaClientInitializationError;
            if (!dormida || intento >= REINTENTOS - 1) throw e;
            await new Promise((r) => setTimeout(r, ESPERA_MS * (intento + 1)));
          }
        }
      },
    },
  },
});

const cliente = (globalForPrisma.prisma ?? new PrismaClient()).$extends(
  despertarLaBase
) as unknown as PrismaClient;

export const prisma = cliente;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = cliente;
}
