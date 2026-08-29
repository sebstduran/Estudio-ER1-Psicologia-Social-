# Landing del Instrumento CCAA

Página de presentación del instrumento para universidades y coordinaciones de
Comunidad Académica. Es una página estática: se abre `index.html` en cualquier
navegador, sin instalar nada.

## Antes de publicarla

Abre `index.html`, busca `CORREO_DESTINO` (cerca del final, en el `<script>`) y
reemplaza la dirección de ejemplo por el correo donde quieres recibir las
solicitudes. Es lo único que hay que ajustar.

```js
const CORREO_DESTINO = "coordinacion.ccaa@ejemplo.cl";
```

## Cómo está construida

- HTML5 semántico, **Tailwind CSS** y JavaScript sin librerías.
- **Autocontenida**: Tailwind viene compilado (solo las clases que se usan, 15 KB),
  las tipografías van incrustadas como WOFF2 y las capturas de la aplicación como
  data URI. No depende de ningún CDN, así que funciona incluso sin conexión y no
  se rompe si un servicio externo cambia.
- Tema claro y oscuro, respetando la preferencia del sistema y con interruptor
  manual. Responsiva de 390 px a escritorio.
- Respeta `prefers-reduced-motion`.

## Volver a compilarla

`index.html` es un archivo generado. Para cambiar contenido o estilos, edita
`fuente.template.html` y vuelve a compilar:

```bash
npm install tailwindcss@3
npx tailwindcss -c tw.config.js -i tw.in.css -o tw.out.css --minify
```

Luego se ensamblan tipografías, CSS y capturas dentro del HTML. El proceso está
descrito en el historial del proyecto; si prefieres, edita `index.html`
directamente y trata `fuente.template.html` como referencia.
