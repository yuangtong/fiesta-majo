// POST /api/rsvp — guarda la confirmación, manda el email y devuelve el N° de entrada.
// 409 si el email ya confirmó.
import { allowMethod, isEmail } from './_lib/shared.js';
import { insertRsvp } from './_lib/db.js';
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
    if (duplicate) return res.status(409).json({ error: 'duplicate' });

    const { error } = await sendConfirmation({ email, nombre, numero });
    if (error) console.error('Resend error:', error);

    res.status(200).json({ ok: true, numero, emailSent: !error });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo guardar' });
  }
}
