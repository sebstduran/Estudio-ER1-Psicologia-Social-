# Prototipo de dirección de arte

Maqueta navegable del instrumento CCAA, en un solo archivo HTML sin dependencias.
No se conecta a la base de datos: los datos están escritos a mano para mostrar el
caso que importa (una competencia crítica, un disenso entre docentes, una reunión
de cierre comparada con su línea base).

Existe para **decidir el diseño antes de escribirlo en la aplicación real**.
Cambiar un color aquí toma un minuto; cambiarlo en `src/` toca decenas de
componentes.

## Qué define

- **Cáscara de aplicación**: rail oscuro fijo, lienzo cálido, tarjetas blancas.
  La profundidad sale del contraste entre superficies, no de sombras.
- **Mapa de evidencias**: 6 competencias × 3 indicadores en una matriz coloreada
  por severidad. Responde de un vistazo dónde está el problema.
- **Disenso con forma, no sólo con color**: la esquina blanca marca las celdas
  donde dos docentes calificaron la misma evidencia de forma opuesta. Quien no
  distingue rojo y verde igual lo ve.
- **Tres estados de tema**: claro, oscuro por preferencia del sistema y oscuro
  por elección explícita. Los tres se definen a nivel de variables.

## Uso

```bash
node prototipo/construir.mjs      # ensambla prototipo/instrumento.html
node prototipo/verificar.mjs      # lo revisa en Chromium (requiere playwright)
```

`construir.mjs` incrusta las fuentes (`fuentes.css`) y el escudo
(`public/logo-ua.png`) en el HTML. El resultado — `instrumento.html`, unos
237 KB — no se versiona: se regenera y se abre con doble clic.

Se edita `instrumento.template.html`, nunca el archivo ensamblado.
