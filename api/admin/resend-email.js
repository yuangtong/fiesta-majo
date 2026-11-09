// POST /api/admin/resend-email — reenvío desde /admin (header x-admin-password).
import { allowMethod, isAdmin, isEmail } from '../_lib/shared.js';
import { sendConfirmation } from '../_lib/email.js';

export default async function handler(req, res) {
  if (!allowMethod(req, res, 'POST')) return;
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { email, nombre, numero } = req.body || {};
  if (!isEmail(email) || !nombre) return res.status(400).json({ error: 'Missing email or nombre' });

  const { data, error } = await sendConfirmation({ email: email.trim(), nombre, numero });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ id: data.id });
}
