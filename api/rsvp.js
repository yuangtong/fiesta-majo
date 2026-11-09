// POST /api/rsvp — guarda la confirmación y devuelve el N° de entrada.
// Si el email ya confirmó, devuelve 409 con su entrada existente (para volver a mostrarla).
// El email de confirmación está apagado (config.email.activo); el código queda listo para activarlo.
import { allowMethod, config, isEmail } from './_lib/shared.js';
import { findByEmail, insertRsvp } from './_lib/db.js';
import { sendConfirmation } from './_lib/email.js';

export default async function handler(req, res) {
  if (!allowMethod(req, res, 'POST')) return;
  const b = req.body || {};

  const nombre = String(b.nombre || '').trim().slice(0, 100);
  const email = String(b.email || '').trim().toLowerCase();
  const cancion = String(b.cancion || '').trim().slice(0, 200);

  if (nombre.length < 2 || !isEmail(email)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    const { duplicate, numero } = await insertRsvp({ nombre, email, cancion: cancion || null });
    if (duplicate) {
      const existing = await findByEmail(email);
      return res.status(409).json({ error: 'duplicate', numero: existing?.numero ?? null, nombre: existing?.nombre ?? null });
    }

    let emailSent = false;
    if (config.email.activo) {
      try {
        const { error } = await sendConfirmation({ email, nombre, numero });
        if (error) console.error('Resend error:', error); else emailSent = true;
      } catch (err) {
        console.error('Resend error:', err); // la entrada ya está guardada: no fallar por el email
      }
    }

    res.status(200).json({ ok: true, numero, emailSent });
  } catch (err) {
    console.error(err);
    // Si faltan variables de entorno, decirlo (no expone secretos).
    const missing = String(err.message).startsWith('Missing');
    res.status(500).json({ error: missing ? err.message : 'No se pudo guardar' });
  }
}
