export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Ruta de un juguete: nombre corto de Plasticine ('nature-sun') o carpeta/nombre ('globos/perrito'). */
export const plasticine = (name: string) =>
  name.includes('/') ? `/images/${name}.webp` : `/images/plasticine/${name}.webp`;

/** src + srcSet (240/480/800 px) para que cada pantalla descargue el tamaño justo. `sizes` = ancho mostrado. */
export const toyImg = (name: string, sizes: string) => {
  const full = plasticine(name);
  if (name.startsWith('fondo/')) return { src: full, sizes };
  const base = full.slice(0, -5);
  return { src: `${base}-480.webp`, srcSet: `${base}-240.webp 240w, ${base}-480.webp 480w, ${full} 800w`, sizes };
};

export const formatNumero = (n: number | null | undefined) => (n ? `#${String(n).padStart(3, '0')}` : '');
