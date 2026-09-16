# Plano maestro de experiencia

## Promesa en tres segundos

La aplicación debe sentirse institucional, humana y precisa. La primera pantalla tiene que comunicar, sin explicación previa, tres ideas:

1. aquí se escucha al equipo docente;
2. esa evidencia se compara con las competencias del ciclo;
3. el resultado sirve para tomar una decisión concreta.

La imagen universitaria aporta contexto humano. Los datos superpuestos muestran que no es una página informativa, sino un instrumento de trabajo.

## Identidad visual

- Base editorial clara: blanco cálido, negro carbón y mucho espacio.
- Rojo institucional reservado para marca, foco y acciones principales.
- Verde, ámbar y rojo de logro se mantienen separados de la marca y siempre acompañados por palabras, cifras o forma.
- Vidrio translúcido solo para capas breves, navegación y resúmenes. Nunca detrás de texto largo ni formularios densos.
- Instrument Sans para lectura y Geist Mono para códigos, reuniones y cifras.
- Fotografía natural de conversación universitaria, sin poses publicitarias.

## Arquitectura y narrativa

### Portada

1. Promesa y elección inmediata: coordinación o docente.
2. Ruta en tres verbos: preparar, escuchar, decidir.
3. Demostración del resultado esperado.
4. Segunda llamada a la acción para quien necesitó comprender antes de entrar.

### Coordinación

La pantalla siempre muestra una sola prioridad. El estado de los datos decide el siguiente paso:

1. preparar nivel y equipo;
2. recibir respuestas;
3. subir el acta;
4. revisar resultados y acordar acciones.

### Docencia

Una tarea breve y sin cuenta: entrar, identificarse, elegir asignatura, responder y terminar.

## Sistema de movimiento

- La fotografía de portada tiene una deriva muy lenta para aportar profundidad, no espectáculo.
- El resumen flotante se desplaza pocos píxeles y solo en pantallas grandes.
- Hover: elevación máxima de cuatro píxeles y cambio suave de borde o superficie.
- Clic: respuesta inmediata del control, sin rebotes ni esperas decorativas.
- Cambio de página: entrada breve de opacidad y desplazamiento máximo de cuatro píxeles.
- En móvil se reducen capas, desenfoque y movimiento.
- `prefers-reduced-motion` detiene toda animación ambiental.

Nunca se mueven: formularios, preguntas, botones durante la lectura, cifras de resultados, umbrales, distintivos de severidad, tablas ni contenido proyectado en una reunión.

## Tecnología

- Next.js App Router y Server Components como base.
- Tailwind CSS v4 y CSS nativo para movimiento ambiental.
- `next/image` para servir la fotografía optimizada.
- Sin biblioteca de animación adicional mientras el movimiento pueda resolverse con CSS: menos JavaScript, mejor carga móvil y menor riesgo de distracción.
- Componentes compartidos para tarjetas, paneles, navegación y estados de logro.

## Auditoría de conversión

### Fricciones detectadas

- La elección coordinación/docente estaba demasiado abajo.
- El gráfico inicial mostraba capacidad visual, pero no explicaba con suficiente rapidez qué decisión habilita.
- La portada y las pantallas internas se sentían como capas visuales distintas.
- El acceso docente necesitaba confirmar antes que no requiere cuenta ni correo.

### Tres cambios prioritarios

1. Llevar la elección de rol al primer pantallazo.
2. Mostrar el valor final con tres preguntas: cómo está, qué reforzar y cómo avanzar.
3. Unificar portada, acceso y espacio interno con la misma profundidad, tipografía y jerarquía.

### Experimentos y métricas

1. Comparar entrada de roles arriba versus al final. Métrica: porcentaje de visitas que inicia coordinación o docencia.
2. Comparar CTA “Entrar” versus CTA orientada a tarea. Métrica: inicio del flujo por rol.
3. Evaluar el flujo docente completo. Métrica principal: porcentaje que guarda una evaluación; secundarias: tiempo mediano y abandono por paso.
4. Evaluar coordinación. Métrica principal: porcentaje de niveles que llega a resultados; secundarias: tiempo entre creación, primera respuesta y acta subida.

El éxito no se mide por tiempo en la portada, sino por completar la siguiente acción correcta con menos dudas.
