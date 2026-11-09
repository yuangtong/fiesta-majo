// REFERENCIA (sin integrar). Del artículo de Medium (React Native + Animated), pasado por el usuario:
// https://mrkhandal.medium.com/creating-a-looping-envelope-animation-with-react-native-and-reanimated-7702b66f6acd
// Idea útil: secuencia en 2 tiempos → la solapa rota 0→180° (rotateX, origen arriba) y DESPUÉS la carta sube y aparece.
// No sirve tal cual en web (usa componentes de React Native); la secuencia se replica con GSAP.
//
// Secuencia original:
//   1. flap rotateX 0deg → 180deg, 2000 ms, transform-origin: top
//   2. (delay 2000 ms) card translateY 0 → -80 y opacity 0 → 1, 2000 ms
//   3. luego se cierra en orden inverso y repite en loop (para la invitación NO hace falta el loop)
//
// Forma: solapa = triángulo con bordes CSS (borderTop color, resto transparente);
//        bolsillo = rectángulo con bordes de colores que forman los 3 triángulos (izq, der, abajo).
