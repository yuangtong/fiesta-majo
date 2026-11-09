# Brief — Huamanga Club, Edición 0 (borrador v2)

> Notas de la conversación. Falta: datos del evento y decisión de cómo se hacen los assets 3D.

## Decidido
- **Nombre:** Huamanga Club (como la calle; la fiesta es en la casa de Majo, Huamanga 419).
- **Concepto:** primera fiesta organizada por el grupo de amigos (compraron una consola de DJ) → "Edición 0". Cumpleaños de Majo.
- **Estilo:** se descarta Y2K. Va **globo inflado** (texturas balloon / inflatable 3D), ver `referencias/moodboard/`.
  Mezclado con lenguaje de **cartel de club** (moodboard 04 y 05) para el lado "Club".
- **Temática:** la ruleta parece aleatoria, pero **siempre cae en "La ocasión incorrecta"**: ir vestido para cualquier evento menos un cumpleaños.
  La temática es la misma para todos. Las otras cartas son señuelos (High School Musical, Halloween, etc.).
- **Preguntas:** solo datos (nombre, email) + **canción que le pedirías al DJ**.
- **Final:** ticket (componente `ticket-invitacion`).

## Flujo (v2)
0. **Inicio:** carta/sobre inflado + "Toca para abrir". El toque desbloquea el audio.
1. **Apertura:** al tocar, salen globos con sonidos "puff puff", explotan (pop) → aparece **"Estás invitado a la fiesta más hot del año"** en letras infladas.
2. **Presentación:** "Huamanga Club presenta: Edición 0 — el cumple de Majo" (estilo cartel de club).
3. **"Toca para saber la temática"** → ruleta de cartas (componente `selector-aleatorio` adaptado) → cae en **La ocasión incorrecta**.
4. **Explicación de la temática:** qué significa, ejemplos de ocasiones (boda, graduación, funeral, gym…).
5. **Datos:** nombre, apellido, email, canción para el DJ.
6. **Ticket:** "Huamanga Club presenta · Edición 0 · [Nombre] · Dress code: la ocasión incorrecta · #NNN". Descargar / compartir. También por email.
7. **Info:** fecha, dirección, reglas, playlist, calendario, Yape.
- Se mantiene `/admin`.

## Pendiente
- Datos del evento: fecha, hora, lineup, reglas, regalo.
- Sonidos: puff (inflar), pop (explotar), squeak (juguete).
- Re-exportar "Estás invitado" en Spline con renderer "Both" o "WebGL 2" (hoy es solo WebGPU).

## Ruleta (aprobada)
Boda/gala (tacones), Quinceañero (corona), Playa (palmera), Pijamada (luna), Examen/graduación (libro + lentes),
Concierto (guitarra), Turista (globo terráqueo), Desfile escolar (trompeta), Cumpleaños (regalo).
Carta ganadora "La ocasión incorrecta": **regalo tachado**.

## Assets
- **Spline: letras globo cromadas**
  - Huamanga Club: `https://prod.spline.design/nCbIKyw6U5Vr-tyc/scene.splinecode` (445 KB, WebGL OK).
    Objetos: `titulo-club`, `club-H`, `club-u`… y `Hint` (texto "Drag any balloon…", se oculta por código).
  - Estás invitado: `https://prod.spline.design/E7ixEusTl982zmgw/scene.splinecode` (658 KB). **Exportada solo para WebGPU**: no carga en la mayoría de celulares → re-exportar.
  - El runtime (`@splinetool/runtime`) descarga piezas desde `unpkg.com` y `cdn.spline.design`.
  - Fondo transparente: se logra por código (`setBackgroundColor`).
  - Sale el sello "Built with Spline" (plan gratuito).
- **Carta de apertura:** referencias en `referencias/carta/` (Ephemera MIT + secuencia de Medium).
- **Craftwork: se usa Plasticine** (Slimer descartado por el usuario). 39 objetos optimizados en `public/images/plasticine/` (WebP, 2.2 MB en total), con uso propuesto en su README.
- Licencia: subir al repo solo las imágenes finales que se usan, no los packs completos.
