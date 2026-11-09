// GET /api/stats — cuántas personas confirmaron.
import { allowMethod } from './_lib/shared.js';
import { listRsvps } from './_lib/db.js';

export default async function handler(req, res) {
  if (!allowMethod(req, res, 'GET')) return;
  try {
    const rows = await listRsvps('id');
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.status(200).json({ total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
