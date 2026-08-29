/**
 * Descarga las tipografías desde Google Fonts y las deja incrustadas en
 * `fuentes.css` como data URI.
 *
 * El prototipo tiene que abrirse sin red — desde un correo, un pendrive o un
 * computador de sala sin internet — y una fuente que no carga no falla a la
 * vista: cae en la del sistema y el diseño se desarma en silencio. Incrustarlas
 * elimina esa clase de error.
 *
 *   node prototipo/fuentes.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FAMILIAS = [
  "Instrument+Sans:wght@400;500;600;700",
  "Geist+Mono:wght@400;500",
];

// Sin este agente Google entrega formatos antiguos en vez de woff2.
const NAVEGADOR =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const url = `https://fonts.googleapis.com/css2?${FAMILIAS.map((f) => `family=${f}`).join("&")}&display=swap`;
const css = await (await fetch(url, { headers: { "User-Agent": NAVEGADOR } })).text();

// Sólo el subconjunto latino: cubre el español completo — acentos, ñ, ¿ y ¡ —
// y deja fuera cirílico, griego y vietnamita, que aquí no se usan nunca.
const bloques = css
  .split(/(?=\/\*\s*[a-z-]+\s*\*\/)/)
  .filter((b) => /\/\*\s*latin\s*\*\//.test(b));

const descargados = new Map();
let salida = "";

for (const bloque of bloques) {
  const enlace = bloque.match(/url\((https:\/\/[^)]+\.woff2)\)/);
  if (!enlace) continue;
  const [, remoto] = enlace;

  // Varios pesos comparten archivo; bajarlo y guardarlo una vez basta.
  if (!descargados.has(remoto)) {
    const buf = Buffer.from(await (await fetch(remoto)).arrayBuffer());
    descargados.set(remoto, `data:font/woff2;base64,${buf.toString("base64")}`);
  }
  salida += bloque.replace(remoto, descargados.get(remoto)).trim() + "\n";
}

const destino = join(dirname(fileURLToPath(import.meta.url)), "fuentes.css");
writeFileSync(destino, salida);
console.log(
  `fuentes.css: ${Math.round(salida.length / 1024)} KB · ${descargados.size} archivos · ${bloques.length} @font-face`
);
