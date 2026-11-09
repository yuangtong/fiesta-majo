# Referencia: selector aleatorio (scroll-morph-hero)

> **Estado: guardado, sin integrar.** No se instaló nada ni se tocó la app. Esperando la descripción del flujo y otro archivo del usuario.

## Qué es
Componente React (de 21st.dev) que el usuario compartió como base visual para el **flujo del selector aleatorio**.
Archivos en esta carpeta:
- `scroll-morph-hero.tsx` — el componente original, sin cambios (salvo un comentario arriba).
- `demo.tsx` — el ejemplo de uso original.

## Cómo funciona la animación
1. **scatter** (0–0.5 s): ~20 cartas con fotos aparecen en posiciones aleatorias.
2. **line** (0.5–2.5 s): se alinean en una fila horizontal.
3. **circle** (desde 2.5 s): forman un círculo con un texto en el centro ("SCROLL TO EXPLORE").
4. **scroll / swipe** (scroll virtual 0–600): el círculo se transforma en un arco tipo arcoíris abajo y aparece el contenido de arriba.
5. **scroll** (600–3000): el arco gira para recorrer las cartas.
- Extras: parallax con el mouse, y cada carta se voltea (3D) al pasar el mouse mostrando "View / Details".

## Instrucciones originales de integración (resumen)
- Requiere estructura shadcn + Tailwind + TypeScript; copiarlo en `components/ui/`.
- Dependencia: `framer-motion`.
- CSS sugerido (Tailwind 4):
  ```css
  @import "tailwindcss";
  @import "tw-animate-css";
  @theme inline {
    --font-sans: var(--font-geist-sans);
    --font-mono: var(--font-geist-mono);
  }
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
  ```

## Notas para cuando lo integremos
- **Proyecto actual:** Vite + React + TypeScript + **Tailwind 3** (no 4) y sin estructura shadcn.
  Habría que crear `src/components/ui/` (convención de shadcn, para que futuros componentes caigan ahí),
  agregar el alias `@/` y adaptar el CSS de Tailwind 4 a `tailwind.config.js` / `src/index.css`.
- La clase `perspective-1000` no existe en Tailwind 3 por defecto: agregarla como utilidad propia.
- `"use client"` es de Next.js; en Vite no hace nada (se puede quitar).
- Las imágenes son URLs de ejemplo (cdn.21st.dev) → reemplazar por las nuestras (`public/images/`).
- Para un selector aleatorio faltaría: lógica para elegir una carta al azar, resaltarla/voltearla,
  y conectar el resultado con el resto del flujo.
- En celular: el swipe usa `touchmove` sobre el contenedor; revisar que no choque con el scroll de las pantallas.
- Hay props que no se usan (`total`, `phase` en `FlipCard`) → el `tsconfig` actual (`noUnusedParameters`) daría error; ajustar al integrar.
