import { F } from './timeline';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const back = (x: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
export const seg = (t: number, a: number, b: number, e = easeInOut) => e(clamp01((t - a) / (b - a)));
export type V3 = [number, number, number];
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// Gestos: cada chave termina `lead` quadros ANTES da palavra (padrão 4) e dura `dur` quadros (padrão 5).
// Entre chaves, a pose fica parada (sem respiração, sem balanço).
export type Key<T> = { at: number; v: Partial<T>; dur?: number; lead?: number; e?: (x: number) => number };

export function track<T extends Record<string, number>>(t: number, init: T, keys: Key<T>[]): T {
  let cur = { ...init };
  for (const k of [...keys].sort((a, b) => a.at - b.at)) {
    const end = k.at - (k.lead ?? 4) * F;
    const start = end - (k.dur ?? 5) * F;
    const p = seg(t, start, end, k.e ?? easeInOut);
    if (p <= 0) break;
    const next = { ...cur };
    for (const name in k.v) {
      const target = k.v[name] as number;
      (next as Record<string, number>)[name] = lerp(cur[name] as number, target, p);
    }
    cur = next;
  }
  return cur;
}

// Gerador pseudoaleatório fixo: o mesmo quadro sempre dá o mesmo resultado.
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
