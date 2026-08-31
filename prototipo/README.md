# Prototipo de dirección de arte

Maqueta navegable del instrumento CCAA, en un solo archivo HTML sin dependencias.
No se conecta a la base de datos: los datos están escritos a mano para mostrar el
caso que importa (una competencia crítica, un disenso entre docentes, una reunión
de cierre comparada con su línea base).

Existe para **decidir el diseño antes de escribirlo en la aplicación real**.
Cambiar un color aquí toma un minuto; cambiarlo en `src/` toca decenas de
componentes.

## La dirección

Una herramienta de trabajo, no un documento académico: densa, precisa y sin
adornos. La profundidad viene de líneas de un píxel y de superficies que se
distinguen apenas, no de sombras. El color se reserva — casi todo el tablero es
tinta sobre blanco.

- **Tipografía**: Instrument Sans para todo el texto, Geist Mono para cifras,
  códigos y rótulos. Las columnas de números usan `tabular-nums` para que
  cuadren verticalmente.
- **Superficies**: fondo gris frío, paneles blancos, borde de 1 px, radio de
  10 px. Los grises tienen un sesgo frío mínimo que hace leer más profundo al
  rojo institucional.
- **Mapa de evidencias**: 6 competencias × 3 indicadores en una rejilla. Cada
  celda lleva su puntaje y un medidor de tres segmentos, así que la severidad se
  lee sin depender del color; el disenso se marca con el signo ⇄, no con un
  matiz.
- **Color semántico separado del color de marca**: el rojo de la universidad
  aparece en el escudo y en los distintivos; los botones primarios son casi
  negros. Así el rojo de "crítico" no compite con el rojo institucional.
- **Tres estados de tema**: claro, oscuro por preferencia del sistema y oscuro
  por elección explícita. Los tres se definen a nivel de variables.

## Uso

```bash
node prototipo/fuentes.mjs      # baja las tipografías y las incrusta (rara vez)
node prototipo/construir.mjs    # ensambla prototipo/instrumento.html
node prototipo/verificar.mjs    # lo revisa en Chromium y deja capturas
```

`construir.mjs` incrusta las fuentes (`fuentes.css`) y el escudo
(`public/logo-ua.png`) en el HTML. El resultado — `instrumento.html`, unos
294 KB — no se versiona: se regenera y se abre con doble clic, sin red.

`verificar.mjs` comprueba en cada vista, en claro, oscuro y móvil, que no haya
desborde horizontal, que las tipografías hayan cargado de verdad (una fuente que
no carga no falla a la vista: cae en la del sistema y el diseño se desarma en
silencio) y que la consola esté limpia.

Se edita `instrumento.template.html`, nunca el archivo ensamblado.
