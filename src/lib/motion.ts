export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Ruta de un juguete: nombre corto de Plasticine ('nature-sun') o carpeta/nombre ('globos/perrito'). */
export const plasticine = (name: string) =>
  name.includes('/') ? `/images/${name}.webp` : `/images/plasticine/${name}.webp`;

export const formatNumero = (n: number | null | undefined) => (n ? `#${String(n).padStart(3, '0')}` : '');
