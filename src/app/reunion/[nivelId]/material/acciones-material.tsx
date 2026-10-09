"use client";

import { useState } from "react";

export type IndicadorParaExportar = {
  texto: string;
  score: number | null;
  estado: string;
  disenso: boolean;
};

export type CompetenciaParaExportar = {
  codigo: string;
  nombre: string;
  score: number | null;
  estado: string;
  brecha: number | null;
  cambio: number | null;
  foco: string;
  docentesQueEvaluaron: number;
  docentesEsperados: number;
  indicadores: IndicadorParaExportar[];
};

type Props = {
  nombreNivel: string;
  reunion: string;
  ciclo: string;
  promedio: number;
  meta: number;
  logradas: number;
  veredicto: string;
  competencias: CompetenciaParaExportar[];
};

const COLORES: Record<string, string> = {
  "Crítico": "#d64a63",
  "En riesgo": "#d7a536",
  "Logrado": "#35a77d",
  "Sin evaluar": "#777f8b",
};

function limpiarNombre(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function protegerCsv(valor: string | number | null) {
  let texto = valor === null ? "" : String(valor);
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}`;
  return `"${texto.replaceAll('"', '""')}"`;
}

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function acortar(texto: string, largo: number) {
  return texto.length > largo ? `${texto.slice(0, largo - 1).trim()}…` : texto;
}

function escaparXml(texto: string) {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function construirGrafico({
  nombreNivel,
  reunion,
  ciclo,
  promedio,
  meta,
  logradas,
  veredicto,
  competencias,
}: Props) {
  const conDatos = competencias.filter((c) => c.score !== null);
  const anchoGrafico = 880;
  const altoGrafico = 460;
  const inicioX = 630;
  const inicioY = 205;
  const espacio = conDatos.length > 0 ? anchoGrafico / conDatos.length : anchoGrafico;
  const anchoBarra = Math.min(92, Math.max(54, espacio * 0.54));
  const yMeta = inicioY + altoGrafico * (1 - meta / 100);
  const prioridades = conDatos
    .toSorted((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 3);

  const barras = conDatos
    .map((competencia, indice) => {
      const score = Math.round(competencia.score ?? 0);
      const alto = Math.max(8, (score / 100) * altoGrafico);
      const x = inicioX + espacio * indice + (espacio - anchoBarra) / 2;
      const y = inicioY + altoGrafico - alto;
      const color = COLORES[competencia.estado] ?? COLORES["Sin evaluar"];
      return `
        <g>
          <rect x="${x}" y="${inicioY}" width="${anchoBarra}" height="${altoGrafico}" rx="${anchoBarra / 2}" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.13" />
          <rect x="${x + 7}" y="${y}" width="${anchoBarra - 14}" height="${alto}" rx="${(anchoBarra - 14) / 2}" fill="${color}" />
          <text x="${x + anchoBarra / 2}" y="${Math.max(155, y - 18)}" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">${score}</text>
          <text x="${x + anchoBarra / 2}" y="${inicioY + altoGrafico + 38}" text-anchor="middle" fill="#ffffff" fill-opacity="0.62" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700">${escaparXml(competencia.codigo)}</text>
          <text x="${x + anchoBarra / 2}" y="${inicioY + altoGrafico + 66}" text-anchor="middle" fill="#ffffff" fill-opacity="0.78" font-family="Arial, Helvetica, sans-serif" font-size="15">${escaparXml(acortar(competencia.nombre, 14))}</text>
        </g>`;
    })
    .join("");

  const focos = prioridades
    .map((competencia, indice) => {
      const y = 535 + indice * 82;
      const color = COLORES[competencia.estado] ?? COLORES["Sin evaluar"];
      return `
        <g>
          <rect x="82" y="${y}" width="440" height="64" rx="18" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.1" />
          <rect x="82" y="${y}" width="7" height="64" rx="4" fill="${color}" />
          <text x="108" y="${y + 26}" fill="#ffffff" fill-opacity="0.55" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700">0${indice + 1} · ${escaparXml(competencia.codigo)}</text>
          <text x="108" y="${y + 49}" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700">${escaparXml(acortar(competencia.nombre, 34))}</text>
          <text x="495" y="${y + 40}" text-anchor="end" fill="${color}" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700">−${competencia.brecha ?? 0}</text>
        </g>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <defs>
      <radialGradient id="fondo1" cx="0" cy="0" r="1" gradientTransform="translate(1370 70) rotate(135) scale(610 500)">
        <stop stop-color="#b23a4a" stop-opacity="0.48" />
        <stop offset="1" stop-color="#b23a4a" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="fondo2" cx="0" cy="0" r="1" gradientTransform="translate(120 840) rotate(-42) scale(690 470)">
        <stop stop-color="#315c92" stop-opacity="0.44" />
        <stop offset="1" stop-color="#315c92" stop-opacity="0" />
      </radialGradient>
      <filter id="sombra" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="28" flood-opacity="0.28" /></filter>
    </defs>
    <rect width="1600" height="900" rx="44" fill="#11131a" />
    <rect width="1600" height="900" rx="44" fill="url(#fondo1)" />
    <rect width="1600" height="900" rx="44" fill="url(#fondo2)" />
    <text x="82" y="82" fill="#f0a4b2" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="3">RESULTADO DEL NIVEL</text>
    <text x="82" y="137" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">${escaparXml(acortar(nombreNivel, 36))}</text>
    <text x="82" y="171" fill="#ffffff" fill-opacity="0.52" font-family="Arial, Helvetica, sans-serif" font-size="19">${escaparXml(reunion)} · ${escaparXml(ciclo)}</text>

    <text x="82" y="280" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700">${escaparXml(veredicto)}</text>
    <text x="82" y="327" fill="#ffffff" fill-opacity="0.64" font-family="Arial, Helvetica, sans-serif" font-size="22">${logradas} de ${conDatos.length} competencias alcanzaron la meta.</text>
    <g filter="url(#sombra)">
      <rect x="82" y="370" width="205" height="114" rx="26" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.12" />
      <text x="111" y="409" fill="#ffffff" fill-opacity="0.5" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="2">PROMEDIO</text>
      <text x="111" y="461" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700">${promedio}</text>
    </g>
    <g filter="url(#sombra)">
      <rect x="307" y="370" width="215" height="114" rx="26" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.12" />
      <text x="336" y="409" fill="#ffffff" fill-opacity="0.5" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="2">META DEL CICLO</text>
      <text x="336" y="461" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700">${meta}</text>
    </g>
    ${focos}

    <line x1="${inicioX - 20}" y1="${yMeta}" x2="${inicioX + anchoGrafico + 20}" y2="${yMeta}" stroke="#ffffff" stroke-opacity="0.72" stroke-width="2" stroke-dasharray="10 10" />
    <text x="${inicioX + anchoGrafico}" y="${yMeta - 14}" text-anchor="end" fill="#ffffff" fill-opacity="0.72" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700">META ${meta}</text>
    ${barras}
    <text x="1518" y="842" text-anchor="end" fill="#ffffff" fill-opacity="0.34" font-family="Arial, Helvetica, sans-serif" font-size="15">Comunidades Académicas · Universidad Autónoma de Chile</text>
  </svg>`;
}

export function AccionesMaterial(props: Props) {
  const [estado, setEstado] = useState("");
  const baseNombre = limpiarNombre(`${props.nombreNivel}-${props.reunion}`) || "resultados-del-nivel";

  function descargarCsv() {
    const encabezado = [
      "Nivel",
      "Reunión",
      "Código",
      "Competencia",
      "Tipo de dato",
      "Evidencia",
      "Puntaje",
      "Meta",
      "Brecha",
      "Estado",
      "Cambio desde línea base",
      "Docentes que evaluaron",
      "Docentes esperados",
      "Disenso",
    ];
    const filas: Array<Array<string | number | null>> = [];

    for (const competencia of props.competencias) {
      filas.push([
        props.nombreNivel,
        props.reunion,
        competencia.codigo,
        competencia.nombre,
        "Competencia",
        competencia.foco,
        competencia.score === null ? null : Math.round(competencia.score),
        props.meta,
        competencia.brecha,
        competencia.estado,
        competencia.cambio === null ? null : Math.round(competencia.cambio),
        competencia.docentesQueEvaluaron,
        competencia.docentesEsperados,
        competencia.indicadores.some((i) => i.disenso) ? "Sí" : "No",
      ]);
      competencia.indicadores.forEach((indicador, indice) => {
        filas.push([
          props.nombreNivel,
          props.reunion,
          competencia.codigo,
          competencia.nombre,
          `Evidencia ${indice + 1}`,
          indicador.texto,
          indicador.score === null ? null : Math.round(indicador.score),
          props.meta,
          indicador.score === null ? null : Math.max(0, props.meta - Math.round(indicador.score)),
          indicador.estado,
          null,
          competencia.docentesQueEvaluaron,
          competencia.docentesEsperados,
          indicador.disenso ? "Sí" : "No",
        ]);
      });
    }

    const csv = [encabezado, ...filas]
      .map((fila) => fila.map(protegerCsv).join(";"))
      .join("\r\n");
    descargar(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }), `${baseNombre}-datos.csv`);
    setEstado("Datos descargados.");
  }

  async function descargarPng() {
    setEstado("Preparando el gráfico…");
    const svg = construirGrafico(props);
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const imagen = new Image();
      imagen.decoding = "async";
      await new Promise<void>((resolve, reject) => {
        imagen.onload = () => resolve();
        imagen.onerror = () => reject(new Error("No se pudo preparar el gráfico."));
        imagen.src = url;
      });
      const lienzo = document.createElement("canvas");
      lienzo.width = 1600;
      lienzo.height = 900;
      const contexto = lienzo.getContext("2d");
      if (!contexto) throw new Error("No se pudo preparar el gráfico.");
      contexto.drawImage(imagen, 0, 0, 1600, 900);
      const png = await new Promise<Blob>((resolve, reject) => {
        lienzo.toBlob((archivo) => (archivo ? resolve(archivo) : reject(new Error("No se pudo crear el archivo."))), "image/png", 1);
      });
      descargar(png, `${baseNombre}-grafico.png`);
      setEstado("Gráfico descargado.");
    } catch {
      setEstado("No pudimos crear la imagen. Inténtalo nuevamente.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function guardarPdf() {
    setEstado("En la ventana que se abrirá, elige “Guardar como PDF”.");
    if (document.fonts?.ready) await document.fonts.ready;
    window.print();
  }

  return (
    <div className="report-toolbar sticky top-0 z-50 border-b border-black/10 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-7">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#111318]">Material para la reunión</p>
          <p className="text-xs text-[#606773]">Elige el formato que necesitas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={guardarPdf} className="rounded-full bg-[#111318] px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111318]">
            Guardar informe en PDF
          </button>
          <button type="button" onClick={descargarPng} className="rounded-full border border-black/12 bg-white px-4 py-2.5 text-sm font-medium text-[#111318] transition-colors hover:bg-[#f3f4f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111318]">
            Descargar gráfico PNG
          </button>
          <button type="button" onClick={descargarCsv} className="rounded-full border border-black/12 bg-white px-4 py-2.5 text-sm font-medium text-[#111318] transition-colors hover:bg-[#f3f4f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111318]">
            Descargar datos CSV
          </button>
        </div>
        <p aria-live="polite" className="w-full text-right text-xs text-[#606773] empty:hidden">{estado}</p>
      </div>
    </div>
  );
}
