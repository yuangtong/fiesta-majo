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
  const res = await fetch(`${url}?select=id,nombre,email,numero&email=ilike.${q}&limit=1`, { headers });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  const rows = await res.json();
  return rows[0] || null;
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
