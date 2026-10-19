# Mi Horario UA

App de horario semanal (PC y celular) publicada como Artifact en claude.ai:
https://claude.ai/artifact/X6ykWYLUX8LdJ46457FeA5

- `index.html` — la app (vista Semana, Día y Todo; choques en rojo rayado; avisos 20 min antes y a las 21:00 del día anterior; exportación `.ics` con alarmas).
- `horario-2026-2.json` — respaldo del horario del semestre 2026-2 (mismo formato que "Exportar respaldo").

## Formato de cada bloque

```json
{ "title": "Desempeño ético", "kind": "catedra | asesoria | terreno | otro",
  "day": 1, "start": "14:00", "end": "18:20", "place": "Sala E-31",
  "dateFrom": "2026-10-26", "dateTo": "2026-11-06",
  "group": "Grupo 1", "people": ["..."], "note": "...", "estEnd": true }
```

`day`: 1 = lunes … 7 = domingo, 0 = por confirmar. `dateFrom`/`dateTo` son opcionales (para actividades acotadas, como los terrenos de 2 semanas).

## Nuevo semestre

1. En la app: Ajustes → "Nuevo semestre con Claude", pega el horario o adjunta el .docx, revisa la vista previa y toca "Reemplazar mi horario".
2. O en un chat con Claude: adjunta el horario nuevo y pide que actualice el artifact anterior; Claude reescribe la colección `events` de la base del artifact.
3. Antes de reemplazar, usa "Exportar respaldo" y guarda el JSON aquí como `horario-AAAA-S.json`.
- Por privacidad, el respaldo del repo no incluye los nombres de estudiantes; esos viven solo en la base privada del artifact.
