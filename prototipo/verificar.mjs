/**
 * Revisa el prototipo ya ensamblado en un navegador real: que ninguna vista
 * desborde horizontalmente, que las fuentes carguen de verdad (un fallback
 * silencioso no se ve en el código, sólo en pantalla) y que no haya errores
 * de consola. Deja una captura de cada vista junto al HTML.
 *
 *   npm i -D playwright && node prototipo/verificar.mjs
 */
import { chromium } from "playwright";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const archivo = "file://" + join(aqui, "instrumento.html");

// En este entorno Chromium ya viene instalado; fuera de él, playwright lo baja solo.
const navegador = await chromium.launch(
  process.env.PLAYWRIGHT_BROWSERS_PATH ? { executablePath: "/opt/pw-browsers/chromium" } : {}
);

let fallas = 0;

async function ver(nombre, { w, h, oscuro = false, vista = null }) {
  const ctx = await navegador.newContext({
    viewport: { width: w, height: h },
    colorScheme: oscuro ? "dark" : "light",
  });
  const p = await ctx.newPage();
  const errores = [];
  p.on("pageerror", (e) => errores.push("PAGEERROR: " + e.message));
  p.on("console", (m) => m.type() === "error" && errores.push(m.text()));

  await p.goto(archivo, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  if (vista) {
    await p.click(`.nav[data-ir="${vista}"]`);
    await p.waitForTimeout(700);
  }
  await p.screenshot({ path: join(aqui, `captura-${nombre}.png`), fullPage: true });

  const d = await p.evaluate(() => ({
    desborde: document.documentElement.scrollWidth > window.innerWidth + 1,
    fondo: getComputedStyle(document.body).backgroundColor,
    // Una fuente que no cargó cae en la del sistema sin avisar; esto lo detecta.
    fuentes: document.fonts.check('600 1rem "Instrument Sans"') && document.fonts.check('1rem "Geist Mono"'),
    celdas: document.querySelectorAll(".cel").length,
    disenso: document.querySelectorAll(".cel-dis").length,
  }));
  await ctx.close();

  if (d.desborde || !d.fuentes || errores.length) fallas += 1;
  console.log(
    `${nombre}: desborde=${d.desborde} fuentes=${d.fuentes} fondo=${d.fondo} ` +
      `celdas=${d.celdas} disenso=${d.disenso}${errores.length ? " ⚠ " + errores.slice(0, 2).join(" | ") : ""}`
  );
}

await ver("resultados", { w: 1280, h: 900 });
await ver("panel", { w: 1280, h: 900, vista: "panel" });
await ver("configurar", { w: 1280, h: 900, vista: "configurar" });
await ver("evaluar", { w: 1280, h: 900, vista: "evaluar" });
await ver("oscuro", { w: 1280, h: 900, oscuro: true });
await ver("movil", { w: 390, h: 844 });

await navegador.close();
if (fallas) {
  console.error(`\n${fallas} vista(s) con desborde, fuentes sin cargar o errores de consola.`);
  process.exit(1);
}
