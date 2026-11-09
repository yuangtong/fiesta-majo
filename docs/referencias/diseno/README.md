# Referencias de diseño

> Son **referentes** para iterar el diseño de la invitación, no reglas obligatorias.
> No están instalados como skills; solo guardados aquí para consultarlos.

| Referencia | Archivo / enlace | Para qué sirve |
|---|---|---|
| awwwards-ui-design | `skills/awwwards-ui-design.md` | Nivel "Awwwards": motion con easing y desfases, profundidad (parallax, máscaras), microinteracciones, accesibilidad, rúbrica de 100 puntos. |
| cinematic-ui | `skills/cinematic-ui.md` | Dirigir el sitio como una película: un director/película como referencia, un "protagonista" que cambia, guion de escenas, cortes, colorimetría. |
| frontend-design | `skills/frontend-design.md` | Dirección visual propia y no genérica: plan de tokens (color, tipografía, layout), lista de clichés de IA a evitar, copy claro. |
| gsap-skills (oficial GreenSock) | https://github.com/greensock/gsap-skills (revisado en el commit `aed9cfd`) | Uso correcto de GSAP: core, timeline, ScrollTrigger, plugins, React (`useGSAP`), rendimiento. |

## Revisión de seguridad (skill-inspector, 9 nov 2026)

No había `skillspector` disponible: **revisión manual del código fuente** (confianza algo menor que con escaneo automático).

| Skill | Veredicto | Motivo |
|---|---|---|
| awwwards-ui-design | `APPROVE` | Solo instrucciones de diseño. Sin scripts, red ni accesos sensibles. Sus disparadores ("cool ui", "amazing ui") son amplios. |
| frontend-design | `APPROVE` | Solo instrucciones de diseño y redacción. Nada sensible. |
| cinematic-ui | `CAUTION` | El SKILL.md en sí está bien, pero hace referencia a `kit/`, `scripts/` y `references/` que **no se compartieron**, así que no se pudieron revisar. Además: escribe un archivo fuera del proyecto (`~/.cinematic-ui/filmography.md`), usa red para buscar material (`find-footage.mjs`) y puede generar imágenes con un servicio pago (Runware, con tu API key y solo con tu "sí"). |
| gsap-skills | `APPROVE` | Repo oficial de GreenSock, licencia MIT. Solo documentación en Markdown y ejemplos; ningún script se ejecuta al instalar. Enlaces solo a gsap.com, docs oficiales y CDN con versión fija. Detalles menores: sus descripciones recomiendan GSAP "cuando no se especifica librería", y los ejemplos usan versiones con `^`. |

### Condiciones de uso
1. Usarlos como guía de diseño en este proyecto, no como reglas que se activen solas en cualquier conversación.
2. `cinematic-ui`: no usar sus `kit/` y `scripts/` hasta revisarlos; no generar imágenes pagas sin aprobación explícita.
3. Si se instala `gsap-skills`, fijarlo a un commit revisado (por ejemplo `aed9cfd`) y no a la rama `main`.

## Nota para este proyecto
- Ya usamos **GSAP** (transiciones, confetti, barras); `gsap-skills` encaja directo, en especial `gsap-react` (`useGSAP` para limpiar animaciones al desmontar).
- Los componentes de referencia (`selector-aleatorio` usa framer-motion; `ticket-invitacion` usa WebGL propio) conviven con GSAP; conviene decidir **una** librería de animación principal al integrar.
