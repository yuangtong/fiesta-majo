import { ExternalLink } from 'lucide-react';

// Videos de TikTok de referencia (reproductor oficial embebido; se carga solo al acercarse a la vista).
// Celular: carrusel horizontal con "snap". Computadora: fila de 4.
export function TikToks({ items, titulo }: { items: { autor: string; id: string }[]; titulo: string }) {
  if (!items.length) return null;
  return (
    <section className="w-full max-w-[420px] md:max-w-[900px]" aria-label={titulo}>
      <h3 className="text-legible mb-3 font-display text-2xl md:text-center md:text-3xl">{titulo}</h3>
      <ul className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {items.map((t) => (
          <li key={t.id} className="w-[64%] shrink-0 snap-center md:w-auto">
            <div className="overflow-hidden rounded-[22px] bg-ink shadow-[0_12px_24px_rgba(10,31,68,0.25)]" style={{ aspectRatio: '9 / 16' }}>
              <iframe
                src={`https://www.tiktok.com/player/v1/${t.id}?music_info=1&description=0&rel=0&native_context_menu=0&closed_caption=0`}
                title={`TikTok de ${t.autor}`}
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
            <a
              href={`https://www.tiktok.com/${t.autor}/video/${t.id}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-ink"
            >
              {t.autor} <ExternalLink size={12} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
