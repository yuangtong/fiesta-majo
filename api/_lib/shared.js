// Lógica común de las funciones de Vercel. Las carpetas con "_" no se publican como rutas.
import { timingSafeEqual } from 'node:crypto';
import config from '../../event.config.js';

export { config };

export const isEmail = (s) => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

// Falla cerrado: si no hay ADMIN_PASSWORD configurado, nadie entra.
export function isAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD;
  const given = req.headers['x-admin-password'];
  if (!expected || typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function allowMethod(req, res, method) {
  if (req.method === method) return true;
  res.setHeader('Allow', method);
  res.status(405).json({ error: 'Method Not Allowed' });
  return false;
}
