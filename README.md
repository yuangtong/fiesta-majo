# Nueva fiesta — invitación

Invitación web de Huamanga Club, Edición 0 (el cumple de Majo). Basada en la mecánica de la invitación del trío (repo `invitacion-cumple`).
Hosting en **Vercel**, datos en **Supabase**, emails con **Resend**.

## Flujo
Loader → Bienvenida → Pregunta 1 (voto A/B + resultados reales) → Pregunta 2 (slider 0–100 + distribución real)
→ Formulario (valida, guarda en Supabase, rechaza emails repetidos, manda email) → Celebración (confetti)
→ Resultados acumulados → Datos de la fiesta (mapa, reglas, playlist, QR, calendario .ics, reenviar email,
compartir por WhatsApp con easter egg opcional, copiar link).

`/admin`: contraseña, stats, tabla de invitados, búsqueda, reenviar email, exportar CSV.

## Dónde se edita
- **Textos y datos del evento:** `event.config.js` (lo leen el front y el email).
- **Imágenes / audio:** `public/images/`, `public/audio/` (`track.mp3` + `sfx-tap|success|error.mp3`).
- **Diseño:** `src/index.css` (clases `.screen`, `.btn`, `.card`, …) y cada pantalla en `src/screens/`.

## API (Vercel Functions, carpeta `api/`)
| Ruta | Qué hace |
|---|---|
| `GET /api/stats` | % de votos y distribución del espectro |
| `POST /api/rsvp` | Guarda la confirmación + manda email (409 si el email ya existe) |
| `POST /api/send-confirmation` | Reenvía el email (solo a emails registrados) |
| `GET /api/admin/guests` | Lista de invitados (header `x-admin-password`) |
| `POST /api/admin/resend-email` | Reenvío desde admin (header `x-admin-password`) |

## Puesta en marcha
1. **Supabase:** crea un proyecto y ejecuta `supabase/schema.sql` en el SQL Editor.
2. **Vercel:** importa este repo (detecta Vite solo).
3. **Variables de entorno** en Vercel: las de `.env.example`.
4. **Resend:** verifica el dominio del remitente (`email.from` en `event.config.js`).

```bash
npm install
npm run dev        # solo front
npx vercel dev     # front + funciones (necesita un .env con las variables)
```
