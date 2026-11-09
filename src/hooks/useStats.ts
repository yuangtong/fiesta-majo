import { useEffect, useState } from 'react';

/** Cuántas personas confirmaron (null mientras carga o si falla). */
export function useStats() {
  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (!cancelled) setTotal(d.total); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return total;
}
