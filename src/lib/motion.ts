export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Ruta de una imagen de Plasticine por su nombre corto. */
export const plasticine = (name: string) => `/images/plasticine/${name}.webp`;

export const formatNumero = (n: number | null | undefined) => (n ? `#${String(n).padStart(3, '0')}` : '');
