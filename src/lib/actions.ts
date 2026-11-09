// Acciones de la pantalla final: calendario, mapa, compartir, copiar link.
import { config } from '../config';

const ev = config.evento;

export const mapsUrl = () =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.mapsQuery)}`;

export function downloadICS() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invitacion//ES',
    'BEGIN:VEVENT',
    `UID:${ev.inicioUTC}@invitacion`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${ev.marca} · ${ev.edicion} — ${ev.nombre}`,
    `DTSTART:${ev.inicioUTC}`,
    `DTEND:${ev.finUTC}`,
    `LOCATION:${ev.mapsQuery.replace(/,/g, '\\,')}`,
    `DESCRIPTION:Dress code: ${config.tematica.titulo}${config.info.playlist.url ? ` · Playlist: ${config.info.playlist.url}` : ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'huamanga-club-edicion-0.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function shareWhatsApp() {
  const text = `${ev.marca} presenta ${ev.edicion}: ${ev.nombre}. Confirma aquí: ${window.location.origin}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export async function copyLink(): Promise<void> {
  const url = window.location.origin;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
}
