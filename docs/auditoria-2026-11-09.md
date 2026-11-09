# Auditoría UI/UX y rendimiento — Huamanga Club v0 (9 nov 2026)

Base: skills `awwwards-ui-design` (scorecard), `cinematic-ui` (continuidad, cortes, "lazy cut")
y `frontend-design` (restricción, una idea fuerte). Rendimiento: Lighthouse 12, celular simulado.
Nada de esto está implementado todavía: son propuestas para aprobar.

## Resumen
| Área | Hoy |
|---|---|
| Lighthouse Rendimiento | **73** (FCP 2.8 s · LCP 5.8 s · TBT 120 ms · CLS 0) |
| Accesibilidad / Buenas prácticas / SEO | 100 / 96 / 92 |
| UI-Max Scorecard (awwwards) | **~80/100** (meta del skill: 88) |

## UI/UX
### Lo que funciona
- Un mundo coherente: globos inflados (cumpleaños) + cartel de club (pantalla de puntos).
- Escena "Huamanga Club Vol 0": zoom out de cine, capas con profundidad, todo arrastrable.
- Ruleta con sorpresa (Cumpleaños → se tacha → La ocasión incorrecta).
- Movimiento reducido respetado; accesibilidad 100.

### Problemas (por impacto)
1. **Inicio: hueco de ~1 s de cielo vacío** entre que se va el sobre y aparece "Estás invitado". Es un corte
   en negro sin intención (el "lazy cut" del skill cinematic-ui).
2. **El estallido no se ve**: los objetos que salen del sobre aparecen y explotan en ~1 s, chicos y rápidos.
3. **El sobre no pertenece al mundo**: rosa plano, mientras todo lo demás es globo brillante o cromo.
   La carta dentro es una tarjeta blanca con texto chico ("Estás invitado" de 14 px).
4. **Sin continuidad** carta → título: se cambia de pantalla en vez de que la carta *se convierta* en el título.
5. **Juguetes encima del texto**: al pasear pueden quedar sobre títulos o botones.
6. **Soltar un objeto se siente "muerto"**: se queda donde lo dejaste, sin inercia.
7. **Compartir por WhatsApp sin vista previa**: no hay imagen ni título para el link (og:image). Para una
   invitación que se manda por WhatsApp es de lo más visible.
8. Sin favicon; sin música configurada (el flujo original la tenía).

## Rendimiento
| # | Hallazgo | Ahorro estimado |
|---|---|---|
| P1 | Fuentes de Google bloquean el primer pintado | ~0.85 s de FCP |
| P2 | Se precarga un fondo que ya no se usa (`cielo-nubes-horizontal`) | 1 descarga |
| P3 | Imágenes de 800 px mostradas a ~100 px (juguetes, nube) | ~250 KB en la 1.ª pantalla |
| P4 | El ticket WebGL, ruleta, info y admin van en el JS inicial | ~90 KB de JS |
| P5 | Spline sigue instalado: 4 MB de archivos en el deploy que no se usan | peso de deploy |
| P6 | Muchas capas animadas con sombra (`drop-shadow`) a la vez | fluidez en celulares básicos |
| P7 | robots.txt inválido, sin favicon | SEO / pulido |
Meta: Rendimiento 73 → 90+.

## Propuestas
### A. Nueva apertura "la carta se infla" (recomendada)
1. Espera: sobre de **foil/globo** (brillo, arrugas, borde inflado) que respira; sello de plastilina.
2. Toque → *pop* del sello, se abre la solapa y sube la carta con **"Estás invitado" en cromo** (la imagen real).
3. **La cámara empuja hacia la carta** (zoom continuo) mientras salen del sobre, en abanico y grandes,
   el perrito, la flor, el cerdito y corazones con *puff*… y **se quedan flotando** (no desaparecen).
4. La carta llena la pantalla y se funde en el título grande + "a la fiesta más hot del año". Sin hueco.

### B. Alternativa: "revienta los globos"
La pantalla empieza tapada por un racimo de globos; cada toque revienta uno (pop + confeti) y al
reventar el último aparece "Estás invitado". Más juego, más largo.

### C. Física al soltar
Inercia al lanzar (InertiaPlugin de GSAP, gratis): el objeto sigue en la dirección del gesto, frena con
fricción, rebota suave en los bordes y se inclina según la velocidad; luego retoma su flotar/paseo.

### D. Pulido UX
- Juguetes pasean por **detrás** del contenido (y delante solo mientras los arrastras), o solo por los bordes.
- Vista previa para WhatsApp (og:image con la escena Huamanga Club, título y descripción) + favicon de globo.
- Opcional: música de fondo (necesita un archivo de audio).

### E. Rendimiento (P1–P7)
Fuentes propias con precarga, imágenes en 2 tamaños (srcset), carga diferida de pantallas pesadas,
quitar Spline, capas animadas más livianas, robots.txt y favicon.
