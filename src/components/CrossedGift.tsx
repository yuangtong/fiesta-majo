import { plasticine } from '../lib/motion';

// La carta ganadora: el regalo de cumpleaños tachado con una "X" inflada.
export function CrossedGift({ size = 120 }: { size?: number }) {
  const bar = 'absolute left-1/2 top-1/2 rounded-full';
  const barStyle = (deg: number) => ({
    width: size * 1.05,
    height: size * 0.17,
    transform: `translate(-50%, -50%) rotate(${deg}deg)`,
    background: 'radial-gradient(120% 160% at 30% 25%, #ff8fa3 0%, #ff4d6d 45%, #d9264a 100%)',
    boxShadow: 'inset 0 -4px 8px rgb(0 0 0 / .2), inset 0 4px 6px rgb(255 255 255 / .4), 0 6px 12px rgb(217 38 74 / .35)',
  });
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img src={plasticine('lifestyle-gift')} alt="" className="h-full w-full object-contain" />
      <span className={bar} style={barStyle(45)} />
      <span className={bar} style={barStyle(-45)} />
    </div>
  );
}
