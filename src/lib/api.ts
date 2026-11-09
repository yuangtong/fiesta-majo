// Llamadas a las funciones de Vercel (carpeta api/).
import type { Guest } from '../types';

const postJSON = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

export const fullName = (g: Pick<Guest, 'nombre' | 'apellido'>) =>
  `${g.nombre.trim()} ${g.apellido.trim()}`.trim();

export type RsvpResult =
  | { status: 'ok'; numero: number | null }
  | { status: 'duplicate' }
  | { status: 'error' };

/** Guarda la confirmación; el servidor manda el email y devuelve el N° de entrada. */
export async function submitRSVP(g: Guest): Promise<RsvpResult> {
  try {
    const res = await postJSON('/api/rsvp', { nombre: fullName(g), email: g.email.trim(), cancion: g.cancion.trim() });
    if (res.status === 409) return { status: 'duplicate' };
    if (!res.ok) return { status: 'error' };
    const data = await res.json();
    return { status: 'ok', numero: data.numero ?? null };
  } catch {
    return { status: 'error' };
  }
}

export const resendConfirmation = (email: string) => postJSON('/api/send-confirmation', { email });

// --- Admin ---
export const getSubmissions = (password: string) =>
  fetch('/api/admin/guests', { headers: { 'x-admin-password': password } });

export const adminResendEmail = (password: string, email: string, nombre: string, numero: number | null) =>
  postJSON('/api/admin/resend-email', { email, nombre, numero }, { 'x-admin-password': password });
