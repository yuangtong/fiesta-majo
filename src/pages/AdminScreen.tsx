import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Lock, Mail, Music, RefreshCw, Users } from 'lucide-react';
import { config } from '../config';
import { adminResendEmail, getSubmissions } from '../lib/api';
import { formatNumero } from '../lib/motion';

// Panel /admin: login con contraseña, stats, invitados, canciones pedidas, reenviar email, exportar CSV.
const PWD_KEY = 'admin_pwd';

interface Row {
  id: string;
  numero: number | null;
  nombre: string;
  email: string;
  cancion: string;
  submittedAt: string;
  emailStatus: string;
}

const STATUS: Record<string, string> = {
  delivered: 'Entregado', sent: 'Enviado', opened: 'Abierto', clicked: 'Abierto', bounced: 'Rebotó', complained: 'Spam', unknown: 'Sin datos',
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

export default function AdminScreen() {
  // La invitación bloquea el scroll del documento; aquí se habilita.
  useEffect(() => {
    const els = [document.documentElement, document.body, document.getElementById('root')];
    els.forEach((el) => el && (el.style.overflow = 'auto'));
    return () => els.forEach((el) => el && (el.style.overflow = ''));
  }, []);

  const [password, setPassword] = useState(() => sessionStorage.getItem(PWD_KEY) || '');
  const [input, setInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const load = useCallback(async (pwd: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await getSubmissions(pwd);
      if (res.status === 401) {
        setError('Contraseña incorrecta.');
        setAuthed(false);
        sessionStorage.removeItem(PWD_KEY);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows(data.guests || []);
      setAuthed(true);
      setPassword(pwd);
      sessionStorage.setItem(PWD_KEY, pwd);
    } catch {
      setError('No se pudieron cargar los invitados. Revisa la conexión o las variables de entorno.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (password) load(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => rows.filter((r) => `${r.nombre} ${r.email} ${r.cancion}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search],
  );
  const songs = rows.reduce((n, r) => n + (r.cancion ? r.cancion.split('\n').length : 0), 0);

  const resend = async (r: Row) => {
    setSendingId(r.id);
    try {
      const res = await adminResendEmail(password, r.email, r.nombre, r.numero);
      if (res.ok) setSentIds((prev) => new Set(prev).add(r.id));
    } finally {
      setSendingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ['N°', 'Nombre', 'Email', 'Canción', 'Fecha'];
    const data = rows.map((r) => [formatNumero(r.numero), r.nombre, r.email, r.cancion.split('\n').join(' / '), formatDate(r.submittedAt)]);
    const csv = [headers, ...data].map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `huamanga-club-invitados-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); load(input); }} className="panel w-full max-w-[340px]">
          <p className="mb-4 flex items-center gap-2 font-extrabold"><Lock size={16} /> {config.evento.marca} · Admin</p>
          <input className="field" type="password" placeholder="Contraseña" aria-label="Contraseña" value={input} onChange={(e) => setInput(e.target.value)} />
          {error && <p role="alert" className="mt-2 text-sm font-bold text-balloon-dark">{error}</p>}
          <button className="btn-balloon mt-4 w-full" disabled={loading || !input}>{loading ? 'Cargando…' : 'Entrar'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 text-ink">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-legible">{config.evento.marca} · Admin</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => load(password)} aria-label="Recargar"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
          <button className="btn-ghost" onClick={exportCSV}><Download size={16} /> CSV</button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="panel"><p className="flex items-center gap-1 text-sm font-bold text-ink/60"><Users size={14} /> Entradas</p><p className="font-display text-4xl">{rows.length}</p></div>
        <div className="panel"><p className="flex items-center gap-1 text-sm font-bold text-ink/60"><Music size={14} /> Canciones pedidas</p><p className="font-display text-4xl">{songs}</p></div>
      </div>

      <input className="field mb-3" placeholder="Buscar por nombre, email o canción" aria-label="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="panel overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs text-ink/60">
            <tr><th className="p-3">N°</th><th className="p-3">Nombre</th><th className="p-3">Email</th><th className="p-3">Canción</th><th className="p-3">Fecha</th>{config.email.activo && <><th className="p-3">Correo</th><th className="p-3" /></>}</tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-ink/5">
                <td className="p-3 font-dot font-black">{formatNumero(r.numero)}</td>
                <td className="p-3 font-bold">{r.nombre}</td>
                <td className="p-3">{r.email}</td>
                <td className="whitespace-pre-line p-3">{r.cancion || '—'}</td>
                <td className="whitespace-nowrap p-3">{formatDate(r.submittedAt)}</td>
                {config.email.activo && (
                  <>
                    <td className="p-3">{STATUS[r.emailStatus] ?? r.emailStatus}</td>
                    <td className="p-3">
                      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => resend(r)} disabled={sendingId === r.id}>
                        <Mail size={12} /> {sentIds.has(r.id) ? 'Enviado' : sendingId === r.id ? '…' : 'Reenviar'}
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-ink/60">{rows.length ? 'Nada coincide con la búsqueda.' : 'Todavía no hay entradas.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
