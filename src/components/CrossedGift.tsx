import { plasticine } from '../lib/motion';

// El regalo de cumpleaños tachado con una "X" inflada.
// `crossed={false}` muestra solo el regalo; las barras tienen la clase .xbar para animar el tachado (scaleX).
export function CrossedGift({ size = 120, crossed = true }: { size?: number; crossed?: boolean }) {
  const bar = (deg: number) => (
    <span className="pointer-events-none absolute inset-0 grid place-items-center" style={{ transform: `rotate(${deg}deg)` }}>
      <span
        className="xbar block rounded-full"
        style={{
          width: size * 1.05,
          height: size * 0.17,
          background: 'radial-gradient(120% 160% at 30% 25%, #ff8fa3 0%, #ff4d6d 45%, #d9264a 100%)',
          boxShadow: 'inset 0 -4px 8px rgb(0 0 0 / .2), inset 0 4px 6px rgb(255 255 255 / .4), 0 6px 12px rgb(217 38 74 / .35)',
        }}
      />
    </span>
  );
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img src={plasticine('lifestyle-gift')} alt="" className="h-full w-full object-contain" />
      {crossed && bar(45)}
      {crossed && bar(-45)}
    </div>
  );
}
