import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { back, clamp01, easeIn, easeOut, rand, seg, V3 } from './anim';
import { F } from './timeline';
import { comicTex, crateTex, labelTex, moneyTex, paperTex, starTex } from './textures';

// Objetos reutilizáveis. Crie objetos novos da história seguindo o mesmo padrão:
// formas simples (caixa, cilindro, esfera, toro), cores chapadas, texto via labelTex/canvasTex,
// e todo movimento calculado a partir de t (nunca estado acumulado).
type G = { position?: V3; rotation?: V3; scale?: number | V3 };

// ---------- Efeitos ----------
// Palavra de quadrinho que salta com overshoot no quadro da batida.
export const Comic = ({ t, at, text, size = 0.9, fill, hold = 0.7, position = [0, 0, 0] }: { t: number; at: number; text: string; size?: number; fill?: string; hold?: number; position?: V3 }) => {
  const k = seg(t, at - 2 * F, at + 4 * F, back);
  const out = 1 - seg(t, at + hold, at + hold + 5 * F);
  const s = size * Math.max(0, k) * out;
  if (s <= 0.001) return null;
  return (
    <sprite position={position} scale={[s * 2, s, 1]} renderOrder={10}>
      <spriteMaterial map={comicTex(text, fill)} depthTest={false} transparent />
    </sprite>
  );
};

export const Sparkles = ({ t, from, n = 8, radius = 0.8, center = [0, 0, 0] as V3, size = 0.18 }: { t: number; from: number; n?: number; radius?: number; center?: V3; size?: number }) => {
  if (t < from) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + t * 0.6;
        const s = size * (0.6 + 0.4 * Math.sin(t * 7 + i * 1.7)) * seg(t, from + i * 0.04, from + i * 0.04 + 0.2, back);
        return (
          <sprite key={i} position={[center[0] + Math.cos(a) * radius, center[1] + Math.sin(i * 2.1) * radius * 0.5, center[2] + Math.sin(a) * radius * 0.4]} scale={[s, s, 1]}>
            <spriteMaterial map={starTex()} transparent depthWrite={false} />
          </sprite>
        );
      })}
    </>
  );
};

// Poeira / fumaça que nasce em `at` e se desfaz.
export const Puff = ({ t, at, n = 6, position = [0, 0, 0] as V3, color = '#e8d6b8', size = 0.25 }: { t: number; at: number; n?: number; position?: V3; color?: string; size?: number }) => {
  const a = seg(t, at - 0.05, at + 0.5);
  if (a <= 0 || a >= 1) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[position[0] + (rand(i) - 0.5) * 0.6 * (1 + a), position[1] + a * 0.3 + rand(i + 3) * 0.1, position[2] + (rand(i + 7) - 0.5) * 0.4]} scale={size * Math.sin(a * Math.PI) * (0.7 + rand(i + 1) * 0.6)}>
          <sphereGeometry args={[0.5, 10, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.7 * (1 - a)} />
        </mesh>
      ))}
    </>
  );
};

// ---------- Informação como objeto ----------
export const Sign = ({ text, w = 2, h = 0.5, bg = '#1f4d3a', fg = '#f3cf6b', border, ...g }: G & { text: string; w?: number; h?: number; bg?: string; fg?: string; border?: string }) => (
  <group {...g}>
    <mesh castShadow>
      <boxGeometry args={[w, h, 0.06]} />
      <meshStandardMaterial color={bg} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0, 0.032]}>
      <planeGeometry args={[w * 0.98, h * 0.94]} />
      <meshStandardMaterial map={labelTex(text, { bg, fg, border: border ?? fg, w: 1024, h: Math.round((1024 * h) / w) })} roughness={0.4} />
    </mesh>
  </group>
);

// Calendário que vira as folhas e pousa na última exatamente na palavra.
// pages = rótulos das folhas, a última é a "resposta" (ex.: meses + '1 ANO!', ou dias + 'SEXTA!').
export const Calendar = ({ t, from, at, pages = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ', '1 ANO!'], ...g }: G & { t: number; from: number; at: number; pages?: string[] }) => {
  const total = pages.length - 1;
  const p = clamp01((t - from) / (at - 2 * F - from));
  const flips = Math.pow(p, 0.75) * total;
  const n = Math.floor(flips);
  const frac = flips - n;
  const page = (i: number) => labelTex(pages[Math.min(i, total)], { w: 512, h: 512, bg: '#fffdf6', fg: i >= total ? '#d22d2d' : '#2c2c2c', radius: 10 });
  return (
    <group {...g}>
      <mesh position={[0, 0, -0.03]} castShadow>
        <boxGeometry args={[1.0, 1.15, 0.04]} />
        <meshStandardMaterial color="#b9322c" />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <planeGeometry args={[0.92, 0.92]} />
        <meshStandardMaterial map={page(Math.min(total, n + 1))} />
      </mesh>
      {n < total && (
        <group position={[0, 0.41, 0.01]} rotation={[-Math.min(1, frac * 1.6) * Math.PI * 0.95, 0, 0]}>
          <mesh position={[0, -0.46, 0]}>
            <planeGeometry args={[0.92, 0.92]} />
            <meshStandardMaterial map={page(n)} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      {[-0.3, 0, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.5, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.04, 0.012, 8, 16]} />
          <meshStandardMaterial color="#888" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Contador de LED que rola e pousa no número exatamente na palavra.
export const LedCounter = ({ t, from, at, value, prefix = '', suffix = '', ...g }: G & { t: number; from: number; at: number; value: number; prefix?: string; suffix?: string }) => {
  const k = seg(t, from, at - F, easeOut);
  const txt = prefix + Math.round(value * k).toLocaleString('en-US') + (k >= 1 ? suffix : '');
  const hit = t >= at - F ? 1 + 0.12 * Math.max(0, 1 - (t - at) / 0.2) : 1;
  return (
    <group {...g}>
      <group scale={hit}>
        <mesh castShadow>
          <boxGeometry args={[2.6, 0.8, 0.25]} />
          <meshStandardMaterial color="#202326" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.13]}>
          <planeGeometry args={[2.4, 0.62]} />
          <meshBasicMaterial map={labelTex(txt, { w: 1024, h: 264, bg: '#0b0d0c', fg: '#ffb53a', radius: 8 })} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

// Ponteiro de medidor que gira com overshoot e para no valor (0..1) na palavra.
export const Gauge = ({ t, from, at, value, label = '', ...g }: G & { t: number; from: number; at: number; value: number; label?: string }) => {
  const k = seg(t, from, at - F, back);
  const ang = Math.PI * 0.75 - k * value * Math.PI * 1.5;
  return (
    <group {...g}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.08, 48]} />
        <meshStandardMaterial color="#f4efe2" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.05, 10, 48]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.06]} rotation={[0, 0, ang - Math.PI / 2]}>
        <boxGeometry args={[0.04, 0.5, 0.02]} />
        <meshStandardMaterial color="#d22d2d" />
      </mesh>
      {label && (
        <mesh position={[0, -0.28, 0.05]}>
          <planeGeometry args={[0.7, 0.18]} />
          <meshStandardMaterial map={labelTex(label, { w: 512, h: 132, fg: '#2a2a2a' })} transparent />
        </mesh>
      )}
    </group>
  );
};

// Carimbo que desce até a superfície (down 0..1).
export const Stamp = ({ down = 0, color = '#c4161c', ...g }: G & { down?: number; color?: string }) => (
  <group {...g}>
    <group position={[0, 0.5 - down * 0.5, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.25, 16]} />
        <meshStandardMaterial color="#5a2e18" />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 12]} />
        <meshStandardMaterial color="#5a2e18" />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[0.3, 0.08, 0.16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  </group>
);

// Marca de carimbo para pôr sobre uma superfície depois da batida.
export const StampMark = ({ text, w = 0.6, color = '#c4161c', ...g }: G & { text: string; w?: number; color?: string }) => (
  <mesh {...g} rotation={g.rotation ?? [-Math.PI / 2, 0, 0.3]}>
    <planeGeometry args={[w, w * 0.35]} />
    <meshStandardMaterial map={labelTex(text, { fg: color, border: color, w: 768, h: 256 })} transparent />
  </mesh>
);

export const Tag = ({ text, ...g }: G & { text: string }) => (
  <group {...g}>
    <mesh position={[0, 0.18, 0]}>
      <cylinderGeometry args={[0.004, 0.004, 0.36, 4]} />
      <meshStandardMaterial color="#6b4a2a" />
    </mesh>
    <mesh castShadow>
      <boxGeometry args={[0.46, 0.2, 0.01]} />
      <meshStandardMaterial color="#f7e7b5" />
    </mesh>
    <mesh position={[0, 0, 0.006]}>
      <planeGeometry args={[0.44, 0.18]} />
      <meshStandardMaterial map={labelTex(text, { w: 512, h: 210, bg: '#f7e7b5', fg: '#2e5c34' })} />
    </mesh>
  </group>
);

// Chuva de papéis (contas, cartas, multas...) a partir de `from`.
export const PaperRain = ({ t, from, n = 36, area = 2.2, top = 5, title = 'CONTA', footer = 'PAGAR!', ...g }: G & { t: number; from: number; n?: number; area?: number; top?: number; title?: string; footer?: string }) => (
  <group {...g}>
    {Array.from({ length: n }, (_, i) => {
      const life = t - (from + rand(i) * 1.1);
      if (life < 0) return null;
      const fall = 1.3 + rand(i + 50) * 0.6;
      const y = Math.max(0.02 + i * 0.002, top - (top / fall) * life * (1 + life * 0.3));
      const landed = y <= 0.03 + i * 0.002;
      const sw = landed ? 0 : Math.sin(life * 6 + i) * 0.4;
      return (
        <mesh key={i} position={[(rand(i + 7) - 0.5) * area + sw * 0.3, y, (rand(i + 13) - 0.5) * area]} rotation={landed ? [-Math.PI / 2, 0, rand(i + 3) * 6] : [sw + life * 2, life * 3 + i, sw]} castShadow>
          <planeGeometry args={[0.26, 0.34]} />
          <meshStandardMaterial map={paperTex(title, footer)} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
      );
    })}
  </group>
);

// ---------- Dinheiro e valor ----------
export const Coin = (g: G) => (
  <mesh {...g} castShadow>
    <cylinderGeometry args={[0.12, 0.12, 0.03, 32]} />
    <meshStandardMaterial color="#f2c34a" metalness={0.85} roughness={0.25} />
  </mesh>
);

// Moedas saltando de um ponto a partir de `at`.
export const CoinBurst = ({ t, at, n = 7, position = [0, 0, 0] as V3 }: { t: number; at: number; n?: number; position?: V3 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const tau = t - (at - 3 * F) - i * 0.03;
      if (tau < 0) return null;
      const x = (i - (n - 1) / 2) * 0.32 * tau * 2.2;
      const y = position[1] + 4.2 * tau - 6 * tau * tau;
      return <Coin key={i} position={[position[0] + x, Math.max(0.03, y), position[2] + (i % 2) * 0.1]} rotation={[tau * 9 + i, i, tau * 4]} />;
    })}
  </>
);

// Pilhas de moedas que crescem até a palavra (gráfico de barras feito de objetos).
export const CoinStacks = ({ t, from, at, heights = [3, 7, 11, 15], ...g }: G & { t: number; from: number; at: number; heights?: number[] }) => (
  <group {...g}>
    {heights.map((target, s) => {
      const n = Math.round(target * seg(t, from + s * 0.15, at - F + s * 0.05, easeOut));
      return (
        <group key={s} position={[s * 0.32, 0, 0]}>
          {Array.from({ length: n }, (_, i) => (
            <Coin key={i} position={[0, 0.015 + i * 0.034, 0]} rotation={[0, i * 0.7, 0]} />
          ))}
        </group>
      );
    })}
  </group>
);

export const MoneyStack = ({ n = 6, symbol = '$', ...g }: G & { n?: number; symbol?: string }) => (
  <group {...g}>
    {Array.from({ length: n }, (_, i) => (
      <mesh key={i} position={[(rand(i) - 0.5) * 0.03, 0.03 + i * 0.055, 0]} rotation={[0, (rand(i + 9) - 0.5) * 0.15, 0]} castShadow>
        <boxGeometry args={[0.42, 0.05, 0.22]} />
        <meshStandardMaterial attach="material-0" color="#e8efe0" />
        <meshStandardMaterial attach="material-1" color="#e8efe0" />
        <meshStandardMaterial attach="material-2" map={moneyTex(symbol)} />
        <meshStandardMaterial attach="material-3" color="#e8efe0" />
        <meshStandardMaterial attach="material-4" color="#7fbf7a" />
        <meshStandardMaterial attach="material-5" color="#7fbf7a" />
      </mesh>
    ))}
  </group>
);

export const UpArrow = ({ k = 1, color = '#39b54a', ...g }: G & { k?: number; color?: string }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.12, 0);
    s.lineTo(0.12, 0);
    s.lineTo(0.12, 0.6);
    s.lineTo(0.3, 0.6);
    s.lineTo(0, 1);
    s.lineTo(-0.3, 0.6);
    s.lineTo(-0.12, 0.6);
    s.closePath();
    return s;
  }, []);
  return (
    <group {...g}>
      <group scale={[1, Math.max(0.001, k), 1]}>
        <mesh castShadow>
          <extrudeGeometry args={[shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- Objetos de mão (use em right/left do Character) ----------
// A mão aponta para -Y local; o objeto continua na direção do antebraço.
export const Hammer = (g: G) => (
  <group {...g}>
    <mesh position={[0, -0.12, 0]} castShadow>
      <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
      <meshStandardMaterial color="#8a5a32" roughness={0.6} />
    </mesh>
    <mesh position={[0, -0.27, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.035, 0.035, 0.13, 16]} />
      <meshStandardMaterial color="#c9a14a" metalness={0.7} roughness={0.3} />
    </mesh>
  </group>
);

export const Magnifier = (g: G) => (
  <group {...g}>
    <mesh position={[0, -0.1, 0]}>
      <cylinderGeometry args={[0.018, 0.018, 0.2, 8]} />
      <meshStandardMaterial color="#3b2416" />
    </mesh>
    <group position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.1, 0.015, 10, 32]} />
        <meshStandardMaterial color="#c9a14a" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.01, 32]} />
        <meshStandardMaterial color="#cfe8ff" transparent opacity={0.35} roughness={0.05} />
      </mesh>
    </group>
  </group>
);

export const Clipboard = ({ text = '✓\n✓\n✓', ...g }: G & { text?: string }) => (
  <group {...g}>
    <mesh>
      <boxGeometry args={[0.22, 0.3, 0.015]} />
      <meshStandardMaterial color="#8a5a32" />
    </mesh>
    <mesh position={[0, -0.01, 0.009]}>
      <planeGeometry args={[0.19, 0.25]} />
      <meshStandardMaterial map={labelTex(text, { w: 256, h: 320, bg: '#fafafa', fg: '#2a7a3a' })} />
    </mesh>
  </group>
);

// ---------- Mercadorias ----------
export const Crate = ({ label = '', size = 0.6, ...g }: G & { label?: string; size?: number }) => (
  <mesh {...g} castShadow receiveShadow>
    <boxGeometry args={[size, size, size]} />
    <meshStandardMaterial map={crateTex(label)} roughness={0.8} />
  </mesh>
);

// Muitas cópias do mesmo objeto numa só malha (prateleiras cheias, multidão de caixas...).
export const Field = ({ items, geometry, material }: { items: V3[]; geometry: THREE.BufferGeometry; material: THREE.Material }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    items.forEach((p, i) => {
      m.makeRotationY((rand(i) - 0.5) * 0.3);
      m.setPosition(p[0], p[1], p[2]);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow receiveShadow />;
};

// Queda rápida de um objeto até o chão com quique (para "TUM!").
export const dropY = (t: number, at: number, fromY: number, toY: number) => {
  const k = seg(t, at - 6 * F, at, easeIn);
  const bounce = t > at ? Math.abs(Math.sin((t - at) * 14)) * 0.08 * Math.exp(-(t - at) * 6) : 0;
  return fromY + (toY - fromY) * k + bounce;
};
