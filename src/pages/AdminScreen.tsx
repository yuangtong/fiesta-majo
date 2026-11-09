import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart2, Download, Lock, Mail, RefreshCw, Users } from 'lucide-react';
import { config } from '../config';
import { adminResendEmail, getSubmissions } from '../lib/api';

// Panel /admin: login con contraseña, stats, tabla de invitados, buscar, reenviar email, exportar CSV.
const PWD_KEY = 'admin_pwd';

interface Guest {
  id: string;
  nombre: string;
  email: string;
  extra: string;
  voto: string;
  espectro: string;
  regalo: string;
  submittedAt: string;
  emailStatus: string;
  emailSentAt: string | null;
}

const STATUS: Record<string, string> = {
  delivered: 'Entregado', sent: 'Enviado', bounced: 'Rebotó', complained: 'Spam', unknown: 'Sin email',
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

const optionLabel = (id: string) => config.pregunta1.opciones.find((o) => o.id === id)?.label ?? id;
const extraLabel = (v: string) => config.formulario.preguntaExtra.opciones.find((o) => o.value === v)?.label ?? v;

export default function AdminScreen() {
  // La app principal bloquea el scroll; aquí lo habilitamos.
  useEffect(() => {
    const els = [document.documentElement, document.body, document.getElementById('root')];
    els.forEach((el) => el && (el.style.overflow = 'auto'));
    return () => els.forEach((el) => el && (el.style.overflow = ''));
  }, []);

  const [password, setPassword] = useState(() => sessionStorage.getItem(PWD_KEY) || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const fetchGuests = useCallback(async (pwd: string) => {
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
      setGuests(data.guests || []);
      setAuthed(true);
      setPassword(pwd);
      sessionStorage.setItem(PWD_KEY, pwd);
    } catch {
      setError('Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (password) fetchGuests(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const votos = Object.fromEntries(config.pregunta1.opciones.map((o) => [o.id, guests.filter((g) => g.voto === o.id).length]));
    const esp = guests.map((g) => parseFloat(g.espectro)).filter((v) => !isNaN(v));
    const media = esp.length ? Math.round((esp.reduce((a, b) => a + b, 0) / esp.length) * 10) / 10 : 0;
    return { total: guests.length, votos, media };
  }, [guests]);

  const filtered = guests.filter((g) =>
    `${g.nombre} ${g.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleResend = async (g: Guest) => {
    setSendingId(g.id);
    try {
      const res = await adminResendEmail(password, g.email, g.nombre);
      if (res.ok) setSentIds((prev) => new Set(prev).add(g.id));
    } finally {
      setSendingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', config.formulario.preguntaExtra.titulo, 'Voto', 'Espectro', 'Regalo', 'Fecha', 'Email Status'];
    const rows = guests.map((g) => [g.nombre, g.email, extraLabel(g.extra), optionLabel(g.voto), g.espectro, g.regalo, formatDate(g.submittedAt), g.emailStatus]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitados-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); fetchGuests(passwordInput); }}
          className="card w-full max-w-[320px]"
        >
          <p className="mb-4 flex items-center gap-2 font-semibold"><Lock size={16} /> Admin</p>
          <input className="input" type="password" placeholder="Contraseña" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
          {error && <p className="error">{error}</p>}
          <button className="btn mt-4" disabled={loading || !passwordInput}>{loading ? 'Cargando…' : 'Entrar'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">{config.evento.nombre} · Admin</h1>
        <div className="flex gap-2">
          <button className="rounded-lg border border-zinc-300 bg-white p-2" onClick={() => fetchGuests(password)} aria-label="Recargar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white" onClick={handleExportCSV}>
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card"><p className="label flex items-center gap-1"><Users size={12} /> Invitados</p><p className="text-2xl font-bold">{stats.total}</p></div>
        {config.pregunta1.opciones.map((o) => (
          <div key={o.id} className="card"><p className="label">{o.label}</p><p className="text-2xl font-bold">{stats.votos[o.id]}</p></div>
        ))}
        <div className="card"><p className="label flex items-center gap-1"><BarChart2 size={12} /> Media espectro</p><p className="text-2xl font-bold">{stats.media}</p></div>
      </div>

      <input className="input mb-3" placeholder="Buscar por nombre o email" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
            <tr>
              <th className="p-3">Nombre</th><th className="p-3">Email</th><th className="p-3">Respuesta</th>
              <th className="p-3">Voto</th><th className="p-3">Espectro</th><th className="p-3">Fecha</th>
              <th className="p-3">Email</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-b border-zinc-100">
                <td className="p-3 font-medium">{g.nombre}</td>
                <td className="p-3">{g.email}</td>
                <td className="p-3">{extraLabel(g.extra)}</td>
                <td className="p-3">{optionLabel(g.voto)}</td>
                <td className="p-3">{g.espectro}</td>
                <td className="whitespace-nowrap p-3">{formatDate(g.submittedAt)}</td>
                <td className="p-3">{STATUS[g.emailStatus] ?? g.emailStatus}</td>
                <td className="p-3">
                  <button
                    className="flex items-center gap-1 rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40"
                    onClick={() => handleResend(g)}
                    disabled={sendingId === g.id}
                  >
                    <Mail size={12} /> {sentIds.has(g.id) ? 'Enviado' : sendingId === g.id ? '…' : 'Reenviar'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-zinc-500">Sin invitados todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
