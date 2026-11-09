# Referencia: carta / sobre de apertura

> Estado: guardado, sin integrar.

| Archivo | Qué es | Para qué sirve |
|---|---|---|
| `envelope-ephemera.tsx` | Componente "Envelope" de Ephemera (React + Tailwind, **MIT**). | Base técnica: solapa con `clip-path` + `rotateX` (perspectiva 1400px), carta que sube ~55% al abrir, sello que se desvanece, textura de papel con SVG. |
| `envelope-medium-rn.tsx` | Resumen del ejemplo de Medium (React Native). | La secuencia en dos tiempos: primero abre la solapa, después sale la carta. |

## Cómo lo usaríamos
- Tomar la mecánica de Ephemera (no su look de papel antiguo).
- Sobre con estética **inflada/plastilina**: colores del moodboard, sello = un objeto Plasticine (estrella o corazón) en vez de cera.
- Al tocar: solapa abre → salen globos con sonido "puff" → explotan "pop" → aparece la escena Spline "Estás invitado".
