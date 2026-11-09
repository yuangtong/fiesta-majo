// Acceso a la tabla "rsvps" de Supabase vía REST (sin SDK). Solo corre en el servidor.
const TABLE = 'rsvps';

function base() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return {
    url: `${url.replace(/\/$/, '')}/rest/v1/${TABLE}`,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  };
}

export async function listRsvps(columns = '*') {
  const { url, headers } = base();
  const res = await fetch(`${url}?select=${columns}&order=created_at.desc`, { headers });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

export async function findByEmail(email) {
  const { url, headers } = base();
  const q = encodeURIComponent(email.trim());
  const res = await fetch(`${url}?select=id,nombre,email,numero,cancion&email=ilike.${q}&limit=1`, { headers });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  const rows = await res.json();
  return rows[0] || null;
}

// Suma canciones nuevas a la entrada existente de ese email (sin repetir, máx. MAX_TOTAL). Devuelve cuántas se sumaron.
const MAX_TOTAL = 15;
export async function addCanciones(existing, nuevas) {
  const actuales = (existing.cancion || '').split('\n').filter(Boolean);
  const vistas = new Set(actuales.map((c) => c.toLowerCase()));
  const agregar = nuevas.filter((c) => !vistas.has(c.toLowerCase()) && vistas.add(c.toLowerCase()));
  const lista = [...actuales, ...agregar].slice(0, MAX_TOTAL);
  const agregadas = lista.length - actuales.length;
  if (agregadas <= 0) return 0;
  const { url, headers } = base();
  const res = await fetch(`${url}?id=eq.${existing.id}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ cancion: lista.join('\n') }),
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return agregadas;
}

// Devuelve { duplicate: true } si el email ya existe (índice único en lower(email)),
// o { duplicate: false, numero } con el N° de entrada asignado.
export async function insertRsvp(row) {
  const { url, headers } = base();
  const res = await fetch(`${url}?select=numero`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  if (res.status === 409) return { duplicate: true };
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${await res.text()}`);
  const [created] = await res.json();
  return { duplicate: false, numero: created?.numero ?? null };
}
