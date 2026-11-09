// Email con la entrada (Resend). Usado por /api/rsvp, /api/send-confirmation y /api/admin/resend-email.
// Colores sólidos y texto con color explícito para que se lea igual en modo claro y oscuro de Gmail.
import { Resend } from 'resend';
import { config, escapeHtml } from './shared.js';

const SKY = '#4BB1F8';
const INK = '#0A1F44';
const BALLOON = '#FF4D6D';

export const formatNumero = (n) => (n ? `#${String(n).padStart(3, '0')}` : '');

export function buildEmailHTML(nombre, numero) {
  const e = config.evento;
  const info = config.info;
  const n = escapeHtml(nombre);
  const num = formatNumero(numero);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.mapsQuery)}`;
  const reglas = info.reglas
    .map((r, i) => `<p style="margin:0 0 8px;color:${INK};font-size:14px;"><b>${i + 1}.</b> ${escapeHtml(r)}</p>`)
    .join('');
  const btn = (href, label, bg) =>
    `<a href="${href}" style="display:block;text-align:center;padding:14px;background:${bg};color:#FFFFFF;text-decoration:none;border-radius:999px;font-weight:bold;">${label}</a>`;
  const card = (title, body) =>
    `<div style="border-radius:20px;padding:18px;margin-bottom:12px;background:#FFFFFF;">
      <p style="margin:0 0 10px;font-size:12px;color:#5B6B8C;font-weight:bold;">${title}</p>${body}</div>`;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;background:${SKY};font-family:Arial,Helvetica,sans-serif;">
<div style="background:${SKY};padding:24px 0;">
<div style="max-width:480px;margin:0 auto;padding:0 16px;">
  <div style="border-radius:24px;padding:24px;margin-bottom:12px;background:${BALLOON};">
    <p style="margin:0;font-size:13px;color:#FFFFFF;font-weight:bold;">${escapeHtml(e.marca)} presenta · ${escapeHtml(e.edicion)}</p>
    <p style="margin:10px 0 0;font-size:30px;line-height:1.1;font-weight:bold;color:#FFFFFF;">${n}</p>
    <p style="margin:8px 0 0;font-size:14px;color:#FFFFFF;">${escapeHtml(e.nombre)}${num ? ` · Entrada ${num}` : ''}</p>
  </div>
  ${card('Cuándo', `<p style="margin:0;font-size:24px;font-weight:bold;color:${INK};">${escapeHtml(e.fechaLarga)}</p><p style="margin:4px 0 0;color:${INK};">${escapeHtml(e.hora)}</p>`)}
  ${card('Dónde', `<p style="margin:0;font-weight:bold;color:${INK};">${escapeHtml(e.direccion)}</p><p style="margin:4px 0 12px;color:#5B6B8C;font-size:13px;">${escapeHtml(e.referencia)}</p>${btn(mapsUrl, 'Ver en Google Maps', INK)}`)}
  ${card('Dress code', `<p style="margin:0;font-size:18px;font-weight:bold;color:${BALLOON};">${escapeHtml(config.tematica.titulo)}</p><p style="margin:6px 0 0;color:${INK};">${escapeHtml(config.tematica.texto)}</p>`)}
  ${card('Reglas', reglas)}
  ${info.playlist.url ? card(escapeHtml(info.playlist.nombre), btn(info.playlist.url, 'Abrir playlist', '#1DB954')) : ''}
  ${info.yape.qrImagen ? card('Colaboraciones', `<p style="margin:0;color:${INK};">${escapeHtml(info.yape.texto)}</p><div style="text-align:center;margin-top:12px;"><img src="${e.urlPublica}${info.yape.qrImagen}" width="160" height="160" alt="QR" /></div>`) : ''}
  <p style="text-align:center;color:#FFFFFF;font-size:11px;">Recibiste este email porque confirmaste asistencia.</p>
</div></div></body></html>`;
}

export async function sendConfirmation({ email, nombre, numero }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const payload = {
    from: config.email.from,
    to: [email],
    subject: config.email.asunto,
    html: buildEmailHTML(nombre, numero),
  };
  if (config.email.replyTo) payload.replyTo = config.email.replyTo;
  return resend.emails.send(payload);
}
