/**
 * Ensambla el prototipo en un único HTML autocontenido.
 *
 * La plantilla se escribe con dos marcadores — {{FONTS}} y {{LOGO}} — que aquí
 * se reemplazan por las fuentes y el escudo incrustados. El resultado no pide
 * nada a la red: se abre con doble clic o se publica tal cual.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..");

const logo = readFileSync(join(raiz, "public", "logo-ua.png")).toString("base64");

const html = readFileSync(join(aqui, "instrumento.template.html"), "utf8")
  .replace("{{FONTS}}", readFileSync(join(aqui, "fuentes.css"), "utf8"))
  .replace("{{LOGO}}", `data:image/png;base64,${logo}`);

if (html.includes("{{")) throw new Error("Quedaron marcadores sin reemplazar en la plantilla.");

const destino = join(aqui, "instrumento.html");
writeFileSync(destino, html);
console.log(`instrumento.html: ${Math.round(html.length / 1024)} KB · <title> al inicio: ${html.slice(0, 8192).includes("<title>")}`);
