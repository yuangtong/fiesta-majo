# Referencia: invitación final en formato ticket (admit-one-ticket)

> **Estado: guardado, sin integrar.** No se instaló nada ni se tocó la app.

## Para qué es
Al **terminar el flujo**, se genera la invitación del invitado y se muestra con este componente:
un ticket tipo "ADMIT ONE" con su nombre, el evento, lugar y fecha.

Archivos en esta carpeta:
- `prompt-original.txt`: el archivo que mandó el usuario, sin tocar.
- `admit-one-ticket.tsx`: el componente extraído del prompt (solo se quitaron las tabulaciones de sangría).
- `demo.tsx`: el ejemplo de uso extraído del prompt.

## Qué hace el componente
- **Forma de ticket**: recorte con esquinas redondeadas, dos "mordidas" (muescas) y una línea perforada
  que separa el talón. Proporción fija 741 × 425.
- **Textura animada** con WebGL2 (shader de *dithering*, copiado de Paper Shaders): naranja por defecto,
  con formas `simplex | warp | dots | wave | ripple | swirl | sphere`. Respeta "reducir movimiento".
- **Textos**: `presenter` + `event` arriba, `name` grande (se parte en hasta 3 líneas y se achica solo para caber),
  `venue · dates` abajo, `stubText` vertical en el talón y `watermark` grande detrás.
- **Inclinación 3D + brillo** al pasar el mouse (`tilt`, se apaga con `tilt={false}`).
- Extras exportados:
  - `remixTicketStyle()`: genera colores y textura aleatorios (útil para que cada ticket sea distinto).
  - `playShutterSound()`: sonido de "obturador" para cuando se genera el ticket.
  - `ticketClipPath()`, `TicketCard`, `TiltCard` y las constantes de estilo.

### Props
| Prop | Ejemplo | Uso en nuestra invitación |
|---|---|---|
| `name` | "Garry Tan" | Nombre del invitado |
| `presenter` | "Y Combinator presents" | Anfitriones |
| `event` | "Startup School 2026" | Nombre de la fiesta |
| `venue` | "Chase Center, SF" | Lugar |
| `dates` | "July 25–26" | Fecha |
| `stubText` | "Admit one" | Texto del talón |
| `watermark` | "2026" | Año o número |
| `width` | 741 | Ancho en px (alto = width / 1.744) |
| `tilt`, `geometry`, `layout`, `texture`, `gradient` | opcionales | Ajustes de estilo |

## Notas para cuando lo integremos
- **Proyecto actual**: Vite + React + TypeScript + Tailwind 3, sin estructura shadcn → crear `src/components/ui/`.
- **No necesita dependencias nuevas** (todo el shader va dentro del archivo).
- **El código viene "compilado" (JS, no TS)**: tiene `var`, `imports` en medio del archivo y sin tipos.
  Con nuestro `tsconfig` estricto no compila tal cual → convertirlo a TypeScript con tipos,
  o darle extensión `.jsx` con un archivo de tipos.
- **Error en el prompt**: en el bloque de `presenter` + `event` hay un string `"\n"` que quedó partido en dos líneas.
  Hay que reemplazarlo por `"\n"` en una sola línea (salto entre presenter y event).
- **Celular**: el ancho es fijo en px → calcular `width` según la pantalla (ej. `min(ancho - 32, 741)`).
  Ojo: el texto es chico en celular a 741/425; quizás conviene un layout vertical del ticket.
- **WebGL2**: si el navegador no lo soporta, el componente lanza error → poner un fallback (fondo de color plano).
- La fuente es la del sistema; definir la tipografía del diseño final.
- Para descargar/compartir el ticket como imagen faltaría capturarlo (por ejemplo con `html-to-image`; el canvas WebGL
  necesita `preserveDrawingBuffer` para poder capturarse).
- `"use client"` es de Next.js; en Vite no hace falta.
