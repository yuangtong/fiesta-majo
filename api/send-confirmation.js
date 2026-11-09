// POST /api/send-confirmation — reenvía el email, solo a emails que ya confirmaron.
import { allowMethod, config, isEmail } from './_lib/shared.js';
import { findByEmail } from './_lib/db.js';
import { sendConfirmation } from './_lib/email.js';

export default async function handler(req, res) {
  if (!allowMethod(req, res, 'POST')) return;
  if (!config.email.activo) return res.status(404).json({ error: 'El email está desactivado' });
  const email = String(req.body?.email || '').trim();
  if (!isEmail(email)) return res.status(400).json({ error: 'Email inválido' });

  try {
    const guest = await findByEmail(email);
    if (!guest) return res.status(404).json({ error: 'Email no registrado' });
    const { error } = await sendConfirmation({ email: guest.email, nombre: guest.nombre, numero: guest.numero });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
