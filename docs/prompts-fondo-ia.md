# Prompts para el fondo (IA)

Base: `public/images/fondo/cielo-nubes-horizontal.webp` (1672×941, para computadora).
Colores del cielo medidos: arriba `#4BB1F8`, medio `#65C1FD`, abajo `#ACE8FD`.

## 1. Versión vertical (celular) — la más importante
```text
Same style as the reference image: glossy white inflated balloon clouds (like foil/latex party balloons,
soft highlights, subtle seams) on a clean bright sky-blue gradient (#4BB1F8 at top to #ACE8FD at bottom).
Vertical 9:16 portrait format, 1080x1920. Clouds only around the edges and corners, different sizes,
some cut off by the frame. Keep a large empty area in the center (about 60% of the image) for text.
No text, no people, no other objects. Soft, high quality 3D render.
```

## 2. Nubes sueltas (para animarlas por separado)
```text
A single glossy white inflated balloon cloud, same style as the reference (foil/latex party balloon,
soft highlights, subtle seams). Centered, fully visible, isolated on a plain solid #FF00FF magenta background,
no shadow on the background. Square 1:1, 1024x1024. No text.
```
Generar 3–4 variaciones (pequeña redonda, mediana, grande alargada). El fondo magenta lo quito yo.

## 3. Cielo vacío (opcional)
No hace falta: el degradado lo hago con CSS usando los colores medidos.
