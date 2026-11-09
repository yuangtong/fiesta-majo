// GET /api/admin/guests — lista de invitados + estado del email (header x-admin-password).
import { allowMethod, isAdmin } from '../_lib/shared.js';
import { listRsvps } from '../_lib/db.js';

async function fetchEmailStatuses() {
  if (!process.env.RESEND_API_KEY) return [];
  try {
    const res = await fetch('https://api.resend.com/emails?limit=100', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((e) => ({
      to: (e.to?.[0] || '').toLowerCase(),
      status: e.last_event,
      sentAt: e.created_at,
    }));
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (!allowMethod(req, res, 'GET')) return;
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [rows, emails] = await Promise.all([listRsvps(), fetchEmailStatuses()]);
    const guests = rows.map((r) => {
      const rec = emails.find((e) => e.to === r.email.toLowerCase());
      return {
        id: r.id,
        nombre: r.nombre,
        email: r.email,
        numero: r.numero,
        cancion: r.cancion || '',
        submittedAt: r.created_at,
        emailStatus: rec ? rec.status : 'unknown',
        emailSentAt: rec ? rec.sentAt : null,
      };
    });
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ guests, total: guests.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
