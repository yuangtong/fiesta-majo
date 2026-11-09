# Prompt para el Agent de Spline

Pegar en el panel **Agent** de la escena "Balloon Experience" (en inglés suele entender mejor).

```text
I have a scene with the word "balloon" made of inflated, chrome/foil balloon letters that can be dragged.
Keep EXACTLY the same look: the same balloon/foil material, reflections, inflated shape, seams,
lighting and drag interaction/physics. Only change the text and the setup below.

1. TEXT
   - Replace "balloon" with "Huamanga Club", in two lines:
       Line 1: "Huamanga"
       Line 2: "Club"
   - Create a second, separate group with the text "Estás invitado", in two lines:
       Line 1: "Estás"
       Line 2: "invitado"
     It must include the accented "á". If the font has no "á", add the accent as a small balloon shape on top of the "a".
   - If the letters are separate 3D models instead of an editable Text object, build the new letters
     with the same inflated balloon style and material.

2. NAMES (important, I control them with code)
   - Group "Huamanga Club" → name it "titulo-club". Each letter inside: "club-H", "club-u", "club-a"…
   - Group "Estás invitado" → name it "titulo-invitado". Each letter inside: "inv-E", "inv-s", "inv-t"…
   - Hide "titulo-invitado" at start (I will show it with code).

3. BACKGROUND
   - Make the scene background fully transparent (BG color opacity 0%). No sky, no floor visible.

4. CAMERA
   - Portrait framing for mobile (9:16 aspect ratio). Both titles must fit inside the frame with some margin.
   - Keep the camera still (no auto-rotate).

5. PERFORMANCE
   - Keep the polygon count and textures as light as possible for phones.

Do not change anything else.
```

## Después del Agent
1. Revisar que se vean bien "Huamanga / Club" y "Estás / invitado" (sobre todo la "á").
2. **Export → Code → React** → copiar la URL que termina en `.splinecode`.
3. **Export → Image (PNG, fondo transparente, 2x)** de cada título.
4. Opcional: **Export → Video** de las letras inflándose.
