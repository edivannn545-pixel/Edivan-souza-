import { JSX, useMemo } from 'react';
import * as THREE from 'three';
import { rand, V3 } from './anim';
import { Field, Sign } from './props';
import { Box, WarmLights } from './sets';
import { canvasTex, cobbleTex, labelTex, starTex, tileTex, windowsTex } from './textures';

// ============================================================================
// 30 CENÁRIOS NOVOS — floresta, fazenda, escola, cozinha, praia, hospital, prédios e mais.
// Cada um é um componente sem props obrigatórias (só `t` para o que se move).
// O personagem fica perto de (0, 0, 0) olhando para +Z; a câmera típica fica em z ≈ 5–8.
// ============================================================================

type G = { position?: V3; rotation?: V3; scale?: number | V3 };
type T = { t?: number };

const Ground = ({ color, map, size = 80 }: { color?: string; map?: THREE.Texture; size?: number }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial color={map ? '#ffffff' : color} map={map} roughness={0.9} />
  </mesh>
);
const Wall = ({ z = -4, color = '#e8e2d6', w = 20, h = 6, map }: { z?: number; color?: string; w?: number; h?: number; map?: THREE.Texture }) => (
  <mesh position={[0, h / 2, z]} receiveShadow>
    <planeGeometry args={[w, h]} />
    <meshStandardMaterial color={map ? '#ffffff' : color} map={map} roughness={0.85} />
  </mesh>
);
const Ball = ({ p, r, c, e }: { p: V3; r: number; c: string; e?: boolean }) => (
  <mesh position={p} castShadow>
    <sphereGeometry args={[r, 18, 14]} />
    {e ? <meshBasicMaterial color={c} toneMapped={false} /> : <meshStandardMaterial color={c} roughness={0.8} />}
  </mesh>
);
const Cyl = ({ p, r, h, c, r2, rot }: { p: V3; r: number; h: number; c: string; r2?: number; rot?: V3 }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r, r2 ?? r, h, 20]} />
    <meshStandardMaterial color={c} roughness={0.7} />
  </mesh>
);
const Cone = ({ p, r, h, c }: { p: V3; r: number; h: number; c: string }) => (
  <mesh position={p} castShadow>
    <coneGeometry args={[r, h, 10]} />
    <meshStandardMaterial color={c} roughness={0.85} />
  </mesh>
);

// ---------- peças reaproveitáveis ----------
export const Tree = ({ s = 1, leaf = '#4f8d3c', ...g }: G & { s?: number; leaf?: string }) => (
  <group {...g} scale={s}>
    <Cyl p={[0, 0.8, 0]} r={0.12} r2={0.18} h={1.6} c="#6b4a2e" />
    <Ball p={[0, 2.0, 0]} r={0.8} c={leaf} />
    <Ball p={[-0.45, 1.7, 0.1]} r={0.55} c={leaf} />
    <Ball p={[0.45, 1.75, -0.1]} r={0.55} c={leaf} />
  </group>
);
export const Pine = ({ s = 1, leaf = '#2f6b3a', snow = false, ...g }: G & { s?: number; leaf?: string; snow?: boolean }) => (
  <group {...g} scale={s}>
    <Cyl p={[0, 0.35, 0]} r={0.1} h={0.7} c="#5a3a22" />
    <Cone p={[0, 1.1, 0]} r={0.75} h={1.2} c={leaf} />
    <Cone p={[0, 1.7, 0]} r={0.55} h={1.0} c={leaf} />
    <Cone p={[0, 2.2, 0]} r={0.35} h={0.8} c={snow ? '#f4f8fc' : leaf} />
  </group>
);
export const Palm = ({ s = 1, ...g }: G & { s?: number }) => (
  <group {...g} scale={s}>
    {[0, 1, 2, 3, 4].map((i) => (
      <Cyl key={i} p={[i * 0.06, 0.35 + i * 0.6, 0]} r={0.12 - i * 0.012} h={0.62} c="#8a6a44" />
    ))}
    {Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return (
        <mesh key={i} position={[0.28 + Math.cos(a) * 0.55, 3.05, Math.sin(a) * 0.55]} rotation={[Math.sin(a) * 0.5, -a, Math.cos(a) * 0.5 - 0.2]} castShadow>
          <boxGeometry args={[1.2, 0.04, 0.32]} />
          <meshStandardMaterial color="#3f9a4a" />
        </mesh>
      );
    })}
  </group>
);
export const Building = ({ w = 3, h = 8, d = 3, c = '#9fb4c8', rows = 8, cols = 4, ...g }: G & { w?: number; h?: number; d?: number; c?: string; rows?: number; cols?: number }) => (
  <group {...g}>
    <Box p={[0, h / 2, 0]} s={[w, h, d]} c={c} map={windowsTex(c, rows, cols)} />
    <Box p={[0, h + 0.08, 0]} s={[w + 0.15, 0.16, d + 0.15]} c="#5a6070" />
  </group>
);
const Fence = ({ n = 8, ...g }: G & { n?: number }) => (
  <group {...g}>
    {Array.from({ length: n }, (_, i) => (
      <Box key={i} p={[i * 0.6, 0.45, 0]} s={[0.1, 0.9, 0.1]} c="#f4f0e6" />
    ))}
    <Box p={[(n - 1) * 0.3, 0.65, 0]} s={[n * 0.6, 0.08, 0.06]} c="#f4f0e6" />
    <Box p={[(n - 1) * 0.3, 0.35, 0]} s={[n * 0.6, 0.08, 0.06]} c="#f4f0e6" />
  </group>
);
const Table = ({ w = 1.4, d = 0.8, h = 0.75, c = '#b07a4a', ...g }: G & { w?: number; d?: number; h?: number; c?: string }) => (
  <group {...g}>
    <Box p={[0, h, 0]} s={[w, 0.06, d]} c={c} r={0.5} />
    {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => (
      <Box key={i} p={[a * (w / 2 - 0.06), h / 2, b * (d / 2 - 0.06)]} s={[0.06, h, 0.06]} c="#5a3a22" />
    ))}
  </group>
);
const Chair = ({ c = '#d8352f', ...g }: G & { c?: string }) => (
  <group {...g}>
    <Box p={[0, 0.45, 0]} s={[0.42, 0.06, 0.42]} c={c} />
    <Box p={[0, 0.75, -0.19]} s={[0.42, 0.55, 0.05]} c={c} />
    {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => (
      <Box key={i} p={[a * 0.17, 0.22, b * 0.17]} s={[0.04, 0.44, 0.04]} c="#3a3a40" />
    ))}
  </group>
);
const Lamp = ({ ...g }: G) => (
  <group {...g}>
    <Cyl p={[0, 1.6, 0]} r={0.05} h={3.2} c="#2a2a30" />
    <Ball p={[0, 3.3, 0]} r={0.2} c="#ffe7a8" e />
  </group>
);
const Car = ({ c = '#d8352f', ...g }: G & { c?: string }) => (
  <group {...g}>
    <Box p={[0, 0.35, 0]} s={[1.8, 0.45, 0.85]} c={c} r={0.35} />
    <Box p={[-0.1, 0.72, 0]} s={[1.0, 0.36, 0.78]} c={c} r={0.35} />
    <Box p={[-0.1, 0.72, 0]} s={[0.92, 0.28, 0.8]} c="#9fd0f0" r={0.1} />
    {[[-0.6, 0.42], [0.6, 0.42], [-0.6, -0.42], [0.6, -0.42]].map(([x, z], i) => (
      <Cyl key={i} p={[x, 0.18, z]} r={0.18} h={0.12} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
    ))}
  </group>
);
const Bed = ({ c = '#7fa8d8', hospital = false, ...g }: G & { c?: string; hospital?: boolean }) => (
  <group {...g}>
    <Box p={[0, 0.3, 0]} s={[1.1, 0.3, 2.0]} c={hospital ? '#d8dce2' : '#8a5a32'} />
    <Box p={[0, 0.5, 0.05]} s={[1.0, 0.16, 1.85]} c="#ffffff" />
    <Box p={[0, 0.6, 0.25]} s={[1.02, 0.08, 1.4]} c={c} />
    <Box p={[0, 0.62, -0.7]} s={[0.6, 0.12, 0.35]} c="#ffffff" />
    <Box p={[0, 0.7, -1.0]} s={[1.1, 0.9, 0.08]} c={hospital ? '#c8ccd4' : '#6b4a2e'} />
  </group>
);
const Shelf = ({ w = 2, levels = 4, colors = ['#d8352f', '#2f6fb3', '#f2c62e', '#3aa14a', '#7b5aa6'], ...g }: G & { w?: number; levels?: number; colors?: string[] }) => (
  <group {...g}>
    {Array.from({ length: levels }, (_, l) => (
      <group key={l}>
        <Box p={[0, 0.3 + l * 0.5, 0]} s={[w, 0.04, 0.45]} c="#c8c8cc" />
        {Array.from({ length: Math.floor(w / 0.2) }, (_, i) => (
          <Box key={i} p={[-w / 2 + 0.12 + i * 0.2, 0.3 + l * 0.5 + 0.17, 0]} s={[0.15, 0.3, 0.3]} c={colors[(i + l * 2) % colors.length]} r={0.5} />
        ))}
      </group>
    ))}
    <Box p={[-w / 2, (levels * 0.5) / 2 + 0.1, 0]} s={[0.05, levels * 0.5 + 0.2, 0.45]} c="#9a9aa2" />
    <Box p={[w / 2, (levels * 0.5) / 2 + 0.1, 0]} s={[0.05, levels * 0.5 + 0.2, 0.45]} c="#9a9aa2" />
  </group>
);
const Water = ({ y = 0.02, c = '#2f86c8', size = 80, z = 0 }: { y?: number; c?: string; size?: number; z?: number }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, z]}>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial color={c} roughness={0.2} metalness={0.2} />
  </mesh>
);
const Sky = ({ bg, fog = [16, 50] as [number, number], sun = [-4, 8, 6] as V3, power = 2.0, fill = 1.05, sky = '#ffffff', ground = '#8a8a80' }: { bg: string; fog?: [number, number]; sun?: V3; power?: number; fill?: number; sky?: string; ground?: string }) => (
  <WarmLights sun={sun} bg={bg} sky={sky} ground={ground} fill={fill} power={power} fog={fog} />
);
const grass = () => tileTex('#7fbf5a', '#74b350', 40);
const sand = () => tileTex('#f2dcae', '#ecd4a2', 40);

// ---------- 1. Floresta (dia) ----------
export const Floresta = ({ noite = false, t = 0 }: { noite?: boolean } & T) => {
  const trees = useMemo(() => Array.from({ length: 34 }, (_, i) => [((rand(i) - 0.5) * 22), 0, -2 - rand(i + 50) * 18] as V3).filter((p) => Math.abs(p[0]) > 1.4 || p[2] < -6), []);
  return (
    <group>
      <Sky bg={noite ? '#16224a' : '#bfe6c8'} sky={noite ? '#8090ff' : '#ffffff'} ground="#3a5a2a" fill={noite ? 0.6 : 1.0} power={noite ? 0.5 : 1.8} fog={[8, 30]} />
      <Ground map={grass()} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -6]}>
        <planeGeometry args={[1.6, 24]} />
        <meshStandardMaterial color="#c8a878" roughness={0.95} />
      </mesh>
      {trees.map((p, i) => (i % 3 ? <Tree key={i} position={p} s={1.1 + rand(i + 9) * 0.8} leaf={i % 2 ? '#4f8d3c' : '#3f7a34'} /> : <Pine key={i} position={p} s={1.2 + rand(i + 3) * 0.8} />))}
      {[[-1.1, 0.8], [1.2, 0.3], [-0.9, -1.4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Cyl p={[0, 0.12, 0]} r={0.05} h={0.24} c="#f4f0e6" />
          <Ball p={[0, 0.25, 0]} r={0.14} c="#d8352f" />
        </group>
      ))}
      {noite &&
        Array.from({ length: 24 }, (_, i) => (
          <Ball key={i} p={[(rand(i) - 0.5) * 6, 0.6 + rand(i + 4) * 2 + 0.2 * Math.sin(t * 2 + i), -rand(i + 8) * 6]} r={0.035} c="#fff3a0" e />
        ))}
      {noite && <Ball p={[3, 8, -20]} r={1.2} c="#f4f0d8" e />}
    </group>
  );
};

// ---------- 3. Fazenda ----------
export const Fazenda = () => (
  <group>
    <Sky bg="#a8d8ff" ground="#6a8a4a" />
    <Ground map={grass()} />
    {/* celeiro */}
    <group position={[-1.6, 0, -4]}>
      <Box p={[0, 1.4, 0]} s={[3, 2.8, 2.4]} c="#b8322c" />
      <mesh position={[0, 3.25, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[2.15, 2.15, 2.5]} />
        <meshStandardMaterial color="#7a2a24" />
      </mesh>
      <Box p={[0, 0.9, 1.21]} s={[1.2, 1.8, 0.04]} c="#f4f0e6" />
      <Box p={[0, 0.9, 1.23]} s={[1.1, 0.08, 0.04]} c="#b8322c" />
    </group>
    {/* silo */}
    <Cyl p={[1.2, 2, -4.5]} r={0.8} h={4} c="#c8ccd4" />
    <mesh position={[1.2, 4.2, -4.5]}><sphereGeometry args={[0.8, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#9aa0a8" /></mesh>
    <Fence position={[-3.5, 0, -1.6]} n={12} />
    {[[2.2, -1.2], [2.9, -0.6], [-2.6, -0.4]].map(([x, z], i) => (
      <Cyl key={i} p={[x, 0.35, z]} r={0.4} h={0.7} c="#e2c27a" rot={[0, 0, Math.PI / 2]} />
    ))}
    <Tree position={[4, 0, -6]} s={1.4} />
    <Tree position={[-5, 0, -7]} s={1.6} />
  </group>
);

// ---------- 4. Plantação ----------
export const Plantacao = () => {
  const geo = useMemo(() => new THREE.ConeGeometry(0.12, 0.45, 6), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4f9a3c' }), []);
  const items = useMemo(() => {
    const o: V3[] = [];
    for (let r = 0; r < 14; r++) for (let i = 0; i < 30; i++) o.push([-6 + i * 0.42, 0.22, -0.5 - r * 0.9]);
    return o;
  }, []);
  return (
    <group>
      <Sky bg="#ffe0a8" ground="#8a6a3a" />
      <Ground color="#8a5a32" />
      {Array.from({ length: 14 }, (_, r) => (
        <Box key={r} p={[0, 0.04, -0.5 - r * 0.9]} s={[13, 0.08, 0.4]} c="#6b4426" />
      ))}
      <Field items={items} geometry={geo} material={mat} />
      <group position={[2.6, 0, -1.6]} rotation={[0, -0.6, 0]}>
        <Box p={[0, 0.7, 0]} s={[1.4, 0.6, 0.9]} c="#2f9a4a" />
        <Box p={[-0.3, 1.3, 0]} s={[0.6, 0.7, 0.8]} c="#2f9a4a" />
        <Cyl p={[0.45, 0.45, 0.5]} r={0.45} h={0.25} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
        <Cyl p={[0.45, 0.45, -0.5]} r={0.45} h={0.25} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
        <Cyl p={[-0.5, 0.28, 0.45]} r={0.28} h={0.2} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
        <Cyl p={[-0.5, 0.28, -0.45]} r={0.28} h={0.2} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
      </group>
    </group>
  );
};

// ---------- 5. Horta ----------
export const Horta = () => (
  <group>
    <Sky bg="#bfe6ff" ground="#6a8a4a" />
    <Ground map={grass()} />
    {[-1.6, 0, 1.6].map((x, k) => (
      <group key={x} position={[x, 0, -1.2]}>
        <Box p={[0, 0.2, 0]} s={[1.2, 0.4, 3]} c="#8a5a32" />
        <Box p={[0, 0.41, 0]} s={[1.05, 0.04, 2.85]} c="#5a3a22" />
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i} position={[(i % 2) * 0.4 - 0.2, 0.45, -1.1 + i * 0.45]}>
            {k === 0 ? <Ball p={[0, 0.12, 0]} r={0.14} c="#e0262e" /> : k === 1 ? <Ball p={[0, 0.1, 0]} r={0.18} c="#7fcf5a" /> : <Cone p={[0, 0.15, 0]} r={0.08} h={0.3} c="#ff8a2a" />}
            <Cone p={[0, 0.3, 0]} r={0.08} h={0.2} c="#3a8a2a" />
          </group>
        ))}
      </group>
    ))}
    <Fence position={[-3, 0, -3.4]} n={11} />
    <Tree position={[-3.5, 0, -5]} s={1.3} />
  </group>
);

// ---------- 6. Sala de aula ----------
export const SalaDeAula = () => (
  <group>
    <Sky bg="#e8e2d6" ground="#8a7a6a" sun={[-3, 7, 6]} />
    <Ground map={tileTex('#c8a878', '#bc9c6c', 24)} />
    <Wall z={-3.2} color="#f0e6c8" />
    <Box p={[0, 1.9, -3.15]} s={[4.2, 1.6, 0.06]} c="#2f5a3a" />
    <mesh position={[0, 1.9, -3.11]}>
      <planeGeometry args={[4, 1.4]} />
      <meshStandardMaterial map={labelTex('2 + 2 = 4', { w: 1024, h: 360, bg: '#2f5a3a', fg: '#f4f4f2' })} />
    </mesh>
    <Box p={[0, 1.05, -3.05]} s={[4.2, 0.06, 0.12]} c="#8a6a44" />
    <Table position={[-1.6, 0, -2.2]} w={1.3} c="#8a5a32" />
    {[-1.6, 0, 1.6].map((x) =>
      [-0.2, 1.4].map((z) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <Table w={0.8} d={0.55} h={0.68} c="#d8b07a" />
          <Chair position={[0, 0, 0.5]} rotation={[0, Math.PI, 0]} c="#2f6fb3" />
        </group>
      )),
    )}
    <Box p={[3.2, 2.2, -3.15]} s={[1.4, 1.1, 0.04]} c="#9fd0f0" />
    <Box p={[-3.2, 2.4, -3.15]} s={[0.9, 1.2, 0.04]} c="#f2c62e" />
  </group>
);

// ---------- 7. Pátio da escola ----------
export const EscolaFachada = () => (
  <group>
    <Sky bg="#a8d8ff" ground="#8a8a80" />
    <Ground map={tileTex('#d8d2c6', '#c8c2b6', 30)} />
    <Box p={[0, 2.2, -5]} s={[10, 4.4, 2]} c="#f2c88c" map={windowsTex('#f2c88c', 3, 6)} />
    <Box p={[0, 4.55, -5]} s={[10.3, 0.3, 2.3]} c="#c8322c" />
    <Sign text="ESCOLA" w={3} h={0.7} position={[0, 3.7, -3.95]} bg="#2f6fb3" fg="#ffffff" />
    <Box p={[0, 1.1, -3.98]} s={[1.6, 2.2, 0.06]} c="#2f4f8f" />
    <Cyl p={[3.5, 2.5, -2.5]} r={0.04} h={5} c="#d8d8de" />
    <Box p={[3.95, 4.6, -2.5]} s={[0.9, 0.6, 0.02]} c="#2f9a4a" />
    <Box p={[-2.6, 0.45, -1.5]} s={[1.6, 0.08, 0.45]} c="#8a5a32" />
    <Tree position={[-4.4, 0, -2.6]} s={1.2} />
    <Tree position={[4.8, 0, -3.2]} s={1.1} />
  </group>
);

// ---------- 8. Biblioteca ----------
export const Biblioteca = () => {
  const geo = useMemo(() => new THREE.BoxGeometry(0.1, 0.36, 0.3), []);
  const mats = useMemo(() => ['#c8322c', '#2f5fa8', '#3a8a4a', '#d8a23a', '#6b3a8a', '#8a5a32'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })), []);
  const rows = useMemo(() => mats.map((_, m) => {
    const o: V3[] = [];
    for (const x0 of [-3.4, -1.1, 1.1, 3.4]) for (let l = 0; l < 6; l++) for (let i = 0; i < 18; i++) if ((i + l + m) % 6 === 0) o.push([x0 - 0.9 + i * 0.105, 0.35 + l * 0.55, -3.0]);
    return o;
  }), [mats]);
  return (
    <group>
      <Sky bg="#5a3a2a" ground="#3a2a1a" sky="#ffe6c0" sun={[-2, 7, 6]} power={1.6} />
      <Ground map={tileTex('#8a5a32', '#7a4e2a', 20)} />
      <Wall z={-3.3} color="#6b4426" />
      {[-3.4, -1.1, 1.1, 3.4].map((x) => (
        <group key={x}>
          {Array.from({ length: 6 }, (_, l) => <Box key={l} p={[x, 0.16 + l * 0.55, -3.0]} s={[2, 0.04, 0.4]} c="#5a3a22" />)}
          <Box p={[x - 1, 1.7, -3.0]} s={[0.06, 3.4, 0.4]} c="#5a3a22" />
          <Box p={[x + 1, 1.7, -3.0]} s={[0.06, 3.4, 0.4]} c="#5a3a22" />
        </group>
      ))}
      {rows.map((it, m) => <Field key={m} items={it} geometry={geo} material={mats[m]} />)}
      <Table position={[0, 0, -0.6]} w={2.4} d={1} c="#9a6a3a" />
      <Box p={[-0.5, 0.8, -0.6]} s={[0.4, 0.06, 0.3]} c="#c8322c" />
      <Cyl p={[0.6, 1.0, -0.7]} r={0.03} h={0.45} c="#3a3a3a" />
      <Ball p={[0.6, 1.25, -0.7]} r={0.12} c="#ffe7a8" e />
    </group>
  );
};

// ---------- 9. Cozinha de casa ----------
export const Cozinha = () => (
  <group>
    <Sky bg="#f2e8d8" ground="#8a7a6a" sun={[-3, 7, 6]} />
    <Ground map={tileTex('#f4f4f2', '#d8d8de', 22)} />
    <Wall z={-2.6} map={tileTex('#e8f2f8', '#cfe2ee', 30)} />
    <Box p={[0, 0.45, -2.25]} s={[5.2, 0.9, 0.7]} c="#f4f0e6" />
    <Box p={[0, 0.92, -2.25]} s={[5.3, 0.06, 0.75]} c="#8a8a92" />
    {[-2, -1, 0, 1, 2].map((x) => <Box key={x} p={[x, 0.45, -1.89]} s={[0.92, 0.8, 0.02]} c="#e8dcc0" />)}
    <Box p={[0, 2.3, -2.45]} s={[5.2, 0.9, 0.4]} c="#e8dcc0" />
    {/* fogão */}
    {[[-0.3, -2.35], [0.1, -2.35], [-0.3, -2.1], [0.1, -2.1]].map(([x, z], i) => <Cyl key={i} p={[x - 0.9, 0.96, z]} r={0.1} h={0.02} c="#1a1a1a" />)}
    <Cyl p={[-1.2, 1.12, -2.25]} r={0.2} h={0.28} c="#c8322c" />
    {/* geladeira */}
    <Box p={[3.2, 1.1, -2.2]} s={[0.95, 2.2, 0.8]} c="#f4f4f6" r={0.3} />
    <Box p={[2.82, 1.4, -1.79]} s={[0.04, 0.5, 0.04]} c="#9aa0a8" />
    <Table position={[0, 0, 0.4]} w={1.6} d={0.9} c="#c79a64" />
    <Ball p={[0, 0.88, 0.4]} r={0.12} c="#ff8a2a" />
    <Chair position={[-0.6, 0, 1.0]} rotation={[0, Math.PI, 0]} c="#3aa14a" />
    <Chair position={[0.6, 0, 1.0]} rotation={[0, Math.PI, 0]} c="#3aa14a" />
  </group>
);

// ---------- 10. Cozinha de restaurante ----------
export const CozinhaRestaurante = ({ t = 0 }: T) => (
  <group>
    <Sky bg="#c8ccd4" ground="#6a6a72" sun={[-3, 7, 6]} />
    <Ground map={tileTex('#3a3a42', '#2a2a30', 20)} />
    <Wall z={-2.8} map={tileTex('#f4f4f6', '#dcdce2', 26)} />
    <Box p={[0, 0.48, -2.35]} s={[6, 0.96, 0.8]} c="#b8bcc4" r={0.25} />
    <Box p={[0, 2.6, -2.45]} s={[2.4, 0.6, 0.8]} c="#9aa0a8" r={0.25} />
    {[-1.6, -0.6, 0.6, 1.6].map((x, i) => (
      <group key={x}>
        <Cyl p={[x, 1.15, -2.35]} r={0.28} h={0.38} c="#c8ccd4" />
        {i % 2 === 0 && Array.from({ length: 3 }, (_, k) => {
          const ph = (t * 0.5 + k / 3) % 1;
          return <Ball key={k} p={[x, 1.4 + ph * 1.2, -2.35]} r={0.08 + ph * 0.15} c="#ffffff" />;
        })}
      </group>
    ))}
    <Box p={[0, 0.48, 0.2]} s={[3, 0.96, 0.9]} c="#b8bcc4" r={0.25} />
    <Box p={[-0.6, 1.0, 0.2]} s={[0.8, 0.04, 0.5]} c="#c79a64" />
    <Ball p={[0.6, 1.08, 0.2]} r={0.12} c="#e0262e" />
    <Ball p={[0.85, 1.06, 0.1]} r={0.1} c="#7fcf5a" />
  </group>
);

// ---------- 11/12. Praia ----------
export const Praia = ({ porDoSol = false, t = 0 }: { porDoSol?: boolean } & T) => (
  <group>
    <Sky bg={porDoSol ? '#ff9a6a' : '#8fd4ff'} sky={porDoSol ? '#ffd0a0' : '#ffffff'} ground="#c8a878" sun={porDoSol ? [-6, 3, -8] : [-4, 8, 6]} power={porDoSol ? 1.4 : 2.2} />
    <Ground map={sand()} />
    <Water z={-28} y={0.03} c={porDoSol ? '#4a6aa8' : '#2fa8d8'} size={50} />
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(rand(i) - 0.5) * 8, 0.05, -3.2 - i * 0.6 + 0.15 * Math.sin(t * 1.5 + i)]}>
        <planeGeometry args={[2 + rand(i + 2) * 2, 0.08]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    ))}
    <Palm position={[-2.6, 0, -1.4]} s={1.1} />
    <Palm position={[3.0, 0, -2.4]} s={0.95} rotation={[0, 2, 0]} />
    <group position={[1.4, 0, 0.2]}>
      <Cyl p={[0, 1.0, 0]} r={0.03} h={2} c="#f4f4f2" />
      <mesh position={[0, 1.95, 0]}><coneGeometry args={[1.1, 0.45, 12, 1, true]} /><meshStandardMaterial color="#e0262e" side={THREE.DoubleSide} /></mesh>
      <Box p={[0.5, 0.03, 0.4]} s={[0.7, 0.04, 1.5]} c="#2f9ae0" />
    </group>
    <Ball p={[-1.2, 0.2, 0.8]} r={0.2} c="#f2c62e" />
    {porDoSol ? <Ball p={[-5, 2.4, -26]} r={2.2} c="#ffb84a" e /> : <Ball p={[4, 9, -25]} r={1.4} c="#fff2a0" e />}
  </group>
);

// ---------- 13. Quarto de hospital ----------
export const HospitalQuarto = ({ t = 0 }: T) => (
  <group>
    <Sky bg="#dfe8ee" ground="#8a9aa8" sun={[-3, 7, 6]} />
    <Ground map={tileTex('#e8ecf0', '#d8dee4', 24)} />
    <Wall z={-2.6} color="#cfe6e8" />
    <Bed position={[-0.4, 0, -1.2]} hospital c="#8fc8e8" />
    <group position={[0.75, 0, -1.9]}>
      <Cyl p={[0, 0.9, 0]} r={0.025} h={1.8} c="#9aa0a8" />
      <Box p={[0, 1.4, 0]} s={[0.55, 0.4, 0.3]} c="#2a2a30" />
      <mesh position={[0, 1.4, 0.16]}><planeGeometry args={[0.48, 0.32]} /><meshBasicMaterial map={ekgTex(Math.floor(t * 4) % 4)} toneMapped={false} /></mesh>
    </group>
    <group position={[-1.3, 0, -1.6]}>
      <Cyl p={[0, 0.95, 0]} r={0.02} h={1.9} c="#c8ccd4" />
      <Box p={[0, 1.75, 0]} s={[0.18, 0.28, 0.06]} c="#bfe6ff" />
    </group>
    <Box p={[2.0, 1.4, -2.0]} s={[0.05, 2.8, 2.4]} c="#8fd0c8" />
    <Box p={[-2.6, 2.2, -2.55]} s={[1.2, 0.9, 0.04]} c="#9fd0f0" />
    <Sign text="+" w={0.5} h={0.5} position={[0.2, 2.6, -2.55]} bg="#ffffff" fg="#e0262e" />
  </group>
);
const ekgTex = (k: number) =>
  canvasTex(`ekg|${k}`, 256, 160, (c) => {
    c.fillStyle = '#0a1a10';
    c.fillRect(0, 0, 256, 160);
    c.strokeStyle = '#4aff6a';
    c.lineWidth = 5;
    c.beginPath();
    for (let x = 0; x < 256; x += 4) {
      const p = ((x + k * 64) % 128) / 128;
      const y = p > 0.45 && p < 0.5 ? 30 : p > 0.5 && p < 0.55 ? 130 : 80;
      if (x === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  });

// ---------- 14. Fachada do hospital ----------
export const HospitalFachada = () => (
  <group>
    <Sky bg="#bfe6ff" ground="#8a8a80" />
    <Ground map={tileTex('#d8d2c6', '#c8c2b6', 30)} />
    <Box p={[0, 4, -5]} s={[9, 8, 2]} c="#f4f4f6" map={windowsTex('#eef2f6', 7, 6)} />
    <Sign text="HOSPITAL" w={3.6} h={0.75} position={[0, 2.9, -3.95]} bg="#ffffff" fg="#e0262e" />
    <Sign text="+" w={1} h={1} position={[0, 6.9, -3.95]} bg="#e0262e" fg="#ffffff" />
    <Box p={[0, 1.15, -3.97]} s={[2.4, 2.3, 0.06]} c="#9fd0f0" />
    <Box p={[0, 2.45, -3.6]} s={[3.2, 0.12, 1]} c="#c8ccd4" />
    <group position={[3.2, 0, -2]} rotation={[0, -0.4, 0]}>
      <Box p={[0, 0.8, 0]} s={[2.4, 1.3, 1.1]} c="#ffffff" r={0.3} />
      <Box p={[0, 0.85, 0.56]} s={[2.3, 0.16, 0.02]} c="#e0262e" />
      <Box p={[0, 1.55, 0]} s={[0.4, 0.12, 0.3]} c="#e0262e" />
      <Cyl p={[-0.75, 0.2, 0.5]} r={0.2} h={0.12} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
      <Cyl p={[0.75, 0.2, 0.5]} r={0.2} h={0.12} c="#1a1a1a" rot={[Math.PI / 2, 0, 0]} />
    </group>
  </group>
);

// ---------- 15. Centro da cidade ----------
export const CentroCidade = () => (
  <group>
    <Sky bg="#a8cfee" ground="#6a7080" fog={[18, 60]} />
    <Ground color="#4a4e58" />
    {Array.from({ length: 10 }, (_, i) => <Box key={i} p={[0, 0.01, 4 - i * 3]} s={[0.15, 0.01, 1.4]} c="#f4f0e6" />)}
    {[-1, 1].map((sd) => (
      <group key={sd}>
        <Box p={[sd * 3.2, 0.08, -10]} s={[1.6, 0.16, 40]} c="#9a9aa2" />
        {Array.from({ length: 6 }, (_, i) => (
          <Building key={i} position={[sd * 6, 0, 2 - i * 5]} w={3.6} d={4} h={8 + rand(i * 3 + sd) * 12} c={['#9fb4c8', '#c8b4a0', '#a8a8b8', '#b8c8a8'][(i + (sd > 0 ? 1 : 0)) % 4]} rows={10} cols={4} />
        ))}
        {[-1, -6, -11].map((z) => <Lamp key={z} position={[sd * 2.7, 0, z]} />)}
      </group>
    ))}
    <Car position={[-1, 0, -2]} c="#2f6fb3" />
    <Car position={[1, 0, -7]} rotation={[0, Math.PI, 0]} c="#f2c62e" />
  </group>
);

// ---------- 16. Terraço de prédio ----------
export const Terraco = () => (
  <group>
    <Sky bg="#ffc89a" sky="#fff0dc" ground="#6a6070" sun={[-6, 4, -6]} fog={[20, 70]} />
    <Box p={[0, -0.1, 0]} s={[10, 0.2, 8]} c="#8a8a92" map={tileTex('#9a9aa2', '#8a8a92', 16)} />
    <Box p={[0, 0.5, 4]} s={[10, 1, 0.2]} c="#c8ccd4" />
    <Box p={[-5, 0.5, 0]} s={[0.2, 1, 8]} c="#c8ccd4" />
    <Box p={[5, 0.5, 0]} s={[0.2, 1, 8]} c="#c8ccd4" />
    <Cyl p={[-2.8, 1.6, -2.6]} r={0.8} h={1.4} c="#5a8ab8" />
    {[[-3.4, -3.2], [-2.2, -3.2], [-3.4, -2], [-2.2, -2]].map(([x, z], i) => <Box key={i} p={[x, 0.45, z]} s={[0.08, 0.9, 0.08]} c="#3a3a40" />)}
    <Box p={[2.6, 0.6, -2.6]} s={[1.2, 1.2, 1]} c="#c8ccd4" />
    {Array.from({ length: 16 }, (_, i) => (
      <Building key={i} position={[-24 + i * 3.4, -30, -18 - rand(i) * 8]} w={3} d={3} h={30 + rand(i + 5) * 20} c={['#6a7a9a', '#8a7a8a', '#5a6a8a'][i % 3]} rows={14} cols={3} />
    ))}
  </group>
);

// ---------- 17. Sala de estar ----------
export const SalaDeEstar = () => (
  <group>
    <Sky bg="#e8dcc8" ground="#8a7a6a" sun={[-3, 7, 6]} />
    <Ground map={tileTex('#c79a64', '#b88a56', 18)} />
    <Wall z={-2.6} color="#d8c8a8" />
    <Box p={[0, 0.02, -0.6]} s={[3.4, 0.03, 2.2]} c="#c8322c" r={0.95} />
    <group position={[0, 0, -2]}>
      <Box p={[0, 0.3, 0]} s={[2.6, 0.5, 0.9]} c="#2f6fb3" r={0.8} />
      <Box p={[0, 0.8, -0.35]} s={[2.6, 0.7, 0.25]} c="#2f6fb3" r={0.8} />
      <Box p={[-1.25, 0.6, 0]} s={[0.22, 0.6, 0.9]} c="#2f6fb3" r={0.8} />
      <Box p={[1.25, 0.6, 0]} s={[0.22, 0.6, 0.9]} c="#2f6fb3" r={0.8} />
    </group>
    <Table position={[0, 0, -0.6]} w={1.2} d={0.6} h={0.38} c="#8a5a32" />
    <Box p={[2.5, 1.6, -2.55]} s={[1.6, 0.95, 0.06]} c="#1a1a1a" />
    <mesh position={[2.5, 1.6, -2.51]}><planeGeometry args={[1.5, 0.85]} /><meshBasicMaterial color="#4a8ad8" toneMapped={false} /></mesh>
    <Box p={[2.5, 0.35, -2.3]} s={[1.8, 0.7, 0.5]} c="#6b4426" />
    <group position={[-2.6, 0, -2.2]}>
      <Cyl p={[0, 0.8, 0]} r={0.03} h={1.6} c="#2a2a30" />
      <mesh position={[0, 1.7, 0]}><coneGeometry args={[0.3, 0.35, 16, 1, true]} /><meshStandardMaterial color="#f2e2b0" side={THREE.DoubleSide} /></mesh>
    </group>
    <Box p={[-0.6, 2.1, -2.56]} s={[1.0, 0.7, 0.04]} c="#f2c62e" />
  </group>
);

// ---------- 18. Quarto ----------
export const Quarto = () => (
  <group>
    <Sky bg="#d8d0f0" ground="#7a7090" sun={[-3, 7, 6]} />
    <Ground map={tileTex('#b8a0d8', '#a890c8', 18)} />
    <Wall z={-2.6} color="#c8d8f0" />
    <Bed position={[-0.6, 0, -1.4]} c="#f2a0c0" />
    <Box p={[2.4, 1.1, -2.2]} s={[1.3, 2.2, 0.7]} c="#f4f0e6" />
    <Box p={[2.4, 1.1, -1.84]} s={[0.02, 2.1, 0.02]} c="#9a9aa2" />
    <Box p={[0.6, 0.3, -2.2]} s={[0.5, 0.6, 0.45]} c="#c79a64" />
    <Ball p={[0.6, 0.75, -2.2]} r={0.15} c="#ffe7a8" e />
    <Box p={[-0.6, 2.1, -2.56]} s={[1.6, 1.0, 0.04]} c="#9fd0f0" />
    <Box p={[-0.6, 0.02, 0.4]} s={[1.8, 0.03, 1.2]} c="#7b5aa6" r={0.95} />
  </group>
);

// ---------- 19. Supermercado ----------
export const Supermercado = () => (
  <group>
    <Sky bg="#e8ecf0" ground="#8a9aa8" sun={[-3, 9, 6]} />
    <Ground map={tileTex('#f4f4f6', '#e2e6ea', 30)} />
    <Wall z={-8} color="#f4f4f6" />
    <Sign text="SUPERMERCADO" w={4} h={0.6} position={[0, 3.4, -7.9]} bg="#3aa14a" fg="#ffffff" />
    {[-3.3, -1.15, 1.15, 3.3].map((x) => (
      <Shelf key={x} position={[x, 0, -3.4]} rotation={[0, Math.PI / 2, 0]} w={6} levels={4} />
    ))}
    <group position={[2.6, 0, 1.0]}>
      <Box p={[0, 0.45, 0]} s={[1.6, 0.9, 0.7]} c="#2f6fb3" />
      <Box p={[0.3, 1.1, 0]} s={[0.4, 0.3, 0.3]} c="#2a2a30" />
    </group>
    <group position={[-1.6, 0, 1.2]}>
      <Box p={[0, 0.65, 0]} s={[0.7, 0.45, 0.5]} c="#c8ccd4" />
      <Cyl p={[-0.25, 0.1, 0.2]} r={0.08} h={0.05} c="#2a2a30" rot={[Math.PI / 2, 0, 0]} />
      <Cyl p={[0.25, 0.1, 0.2]} r={0.08} h={0.05} c="#2a2a30" rot={[Math.PI / 2, 0, 0]} />
    </group>
  </group>
);

// ---------- 20. Praça ----------
export const Praca = ({ t = 0 }: T) => (
  <group>
    <Sky bg="#bfe6ff" ground="#6a8a4a" />
    <Ground map={grass()} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2]}><circleGeometry args={[3, 40]} /><meshStandardMaterial map={cobbleTex()} /></mesh>
    <Cyl p={[0, 0.3, -2.6]} r={1.2} h={0.6} c="#c8c2b6" />
    <Water y={0.55} c="#5ab8e8" size={2.1} z={-2.6} />
    <Cyl p={[0, 0.9, -2.6]} r={0.12} h={1} c="#c8c2b6" />
    {Array.from({ length: 8 }, (_, i) => {
      const ph = (t * 1.2 + i / 8) % 1;
      const a = (i / 8) * Math.PI * 2;
      return <Ball key={i} p={[Math.cos(a) * ph * 0.7, 1.4 + 0.6 * Math.sin(ph * Math.PI), -2.6 + Math.sin(a) * ph * 0.7]} r={0.05} c="#bfe8ff" />;
    })}
    {[-2.4, 2.4].map((x) => (
      <group key={x} position={[x, 0, -0.4]} rotation={[0, x > 0 ? -0.6 : 0.6, 0]}>
        <Box p={[0, 0.45, 0]} s={[1.4, 0.08, 0.45]} c="#8a5a32" />
        <Box p={[0, 0.75, -0.2]} s={[1.4, 0.4, 0.06]} c="#8a5a32" />
        <Box p={[-0.6, 0.22, 0]} s={[0.06, 0.45, 0.4]} c="#2a2a30" />
        <Box p={[0.6, 0.22, 0]} s={[0.06, 0.45, 0.4]} c="#2a2a30" />
      </group>
    ))}
    <Lamp position={[-3.2, 0, -2.6]} />
    <Lamp position={[3.2, 0, -2.6]} />
    <Tree position={[-4.5, 0, -5]} s={1.5} />
    <Tree position={[4.5, 0, -5.5]} s={1.4} />
    <Tree position={[0, 0, -8]} s={1.8} />
  </group>
);

// ---------- 21. Montanha nevada ----------
export const MontanhaNevada = ({ t = 0 }: T) => (
  <group>
    <Sky bg="#cfe6f8" ground="#c8d8e8" sky="#ffffff" fog={[14, 50]} />
    <Ground color="#f4f8fc" />
    {[[-8, -18, 7], [0, -24, 10], [9, -20, 8]].map(([x, z, h], i) => (
      <group key={i}>
        <Cone p={[x, h / 2, z]} r={h * 0.8} h={h} c="#8a96a8" />
        <Cone p={[x, h * 0.82, z]} r={h * 0.3} h={h * 0.36} c="#ffffff" />
      </group>
    ))}
    {Array.from({ length: 14 }, (_, i) => <Pine key={i} position={[(rand(i) - 0.5) * 14, 0, -3 - rand(i + 7) * 8]} s={1 + rand(i + 2) * 0.7} snow />)}
    {Array.from({ length: 40 }, (_, i) => (
      <Ball key={i} p={[(rand(i) - 0.5) * 8, 4 - ((t * 0.4 + rand(i + 9)) % 1) * 4, (rand(i + 3) - 0.5) * 4]} r={0.03} c="#ffffff" />
    ))}
    <Box p={[2.2, 0.6, -2.4]} s={[1.6, 1.2, 1.4]} c="#8a5a32" />
    <mesh position={[2.2, 1.55, -2.4]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[1.2, 1.2, 1.5]} /><meshStandardMaterial color="#f4f8fc" /></mesh>
  </group>
);

// ---------- 22. Deserto ----------
export const Deserto = () => (
  <group>
    <Sky bg="#ffd9a0" ground="#c8964a" sky="#fff2d8" power={2.4} />
    <Ground map={sand()} />
    {[[-6, -12, 3], [4, -16, 4], [10, -10, 2.5], [-12, -20, 5]].map(([x, z, r], i) => (
      <mesh key={i} position={[x, -r * 0.55, z]} scale={[1.8, 1, 1]}><sphereGeometry args={[r, 24, 16]} /><meshStandardMaterial color="#e8c48a" roughness={0.95} /></mesh>
    ))}
    {[[-2.2, -1.5], [2.6, -3]].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <Cyl p={[0, 0.9, 0]} r={0.18} h={1.8} c="#4f9a4a" />
        <Cyl p={[0.32, 1.0, 0]} r={0.1} h={0.6} c="#4f9a4a" />
        <Cyl p={[-0.3, 1.2, 0]} r={0.1} h={0.5} c="#4f9a4a" />
        <Box p={[0.2, 0.7, 0]} s={[0.3, 0.12, 0.12]} c="#4f9a4a" />
        <Box p={[-0.2, 0.95, 0]} s={[0.25, 0.12, 0.12]} c="#4f9a4a" />
      </group>
    ))}
    <Ball p={[0.5, 0.15, 0.5]} r={0.25} c="#a8824a" />
    <Ball p={[3, 9, -25]} r={1.6} c="#fff2a0" e />
  </group>
);

// ---------- 23. Selva com rio ----------
export const Selva = ({ t = 0 }: T) => (
  <group>
    <Sky bg="#9fd8a8" ground="#2a5a2a" fog={[8, 28]} power={1.6} />
    <Ground map={tileTex('#3f7a34', '#36702e', 30)} />
    <mesh rotation={[-Math.PI / 2, 0, 0.25]} position={[0.5, 0.02, -6]}><planeGeometry args={[2.6, 30]} /><meshStandardMaterial color="#3a9ab8" roughness={0.2} /></mesh>
    {Array.from({ length: 22 }, (_, i) => {
      const x = (rand(i) - 0.5) * 16;
      const z = -1 - rand(i + 30) * 14;
      if (Math.abs(x - 0.5 - (z + 6) * -0.25) < 1.8) return null;
      return i % 2 ? <Palm key={i} position={[x, 0, z]} s={1 + rand(i + 4) * 0.5} rotation={[0, i, 0]} /> : <Tree key={i} position={[x, 0, z]} s={1.4 + rand(i + 5) * 0.7} leaf="#2f7a3a" />;
    })}
    {Array.from({ length: 10 }, (_, i) => <Ball key={i} p={[(rand(i) - 0.5) * 5, 0.25, -0.5 - rand(i + 2) * 3]} r={0.3 + rand(i + 1) * 0.2} c="#3a8a3a" />)}
    <Ball p={[-1.6, 2.4 + 0.1 * Math.sin(t * 3), -2]} r={0.12} c="#e0262e" />
    <Cone p={[-1.48, 2.42 + 0.1 * Math.sin(t * 3), -2]} r={0.05} h={0.12} c="#f2c62e" />
  </group>
);

// ---------- 24. Fundo do mar ----------
export const FundoDoMar = ({ t = 0 }: T) => (
  <group>
    <Sky bg="#1a5a8a" sky="#8fd8ff" ground="#1a3a5a" fog={[6, 22]} power={1.2} fill={1.1} />
    <Ground map={sand()} />
    {Array.from({ length: 9 }, (_, i) => {
      const x = (rand(i) - 0.5) * 7;
      const z = -1 - rand(i + 3) * 5;
      return (
        <group key={i} position={[x, 0, z]}>
          {i % 3 === 0 ? (
            [0, 1, 2].map((k) => <Cyl key={k} p={[k * 0.15 - 0.15, 0.5 + k * 0.1, 0]} r={0.06} h={1 + k * 0.2} c="#ff6a8a" rot={[0, 0, (k - 1) * 0.3]} />)
          ) : i % 3 === 1 ? (
            <Ball p={[0, 0.3, 0]} r={0.35} c="#ffb43a" />
          ) : (
            [0, 1, 2, 3].map((k) => <Box key={k} p={[0, 0.4 + 0.1 * Math.sin(t * 2 + k), k * 0.06]} s={[0.05, 0.8 + k * 0.15, 0.02]} c="#3aa14a" />)
          )}
        </group>
      );
    })}
    {Array.from({ length: 7 }, (_, i) => {
      const a = t * 0.4 + i;
      return (
        <group key={i} position={[Math.cos(a) * (1.5 + i * 0.3), 1.2 + (i % 3) * 0.5, -2 + Math.sin(a) * 1.2]} rotation={[0, -a, 0]}>
          <mesh scale={[1, 0.6, 0.4]}><sphereGeometry args={[0.18, 12, 10]} /><meshStandardMaterial color={i % 2 ? '#ffb43a' : '#4ac8f0'} /></mesh>
          <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.3]}><coneGeometry args={[0.1, 0.14, 4]} /><meshStandardMaterial color={i % 2 ? '#ffb43a' : '#4ac8f0'} /></mesh>
        </group>
      );
    })}
    {Array.from({ length: 14 }, (_, i) => <Ball key={`b${i}`} p={[(rand(i) - 0.5) * 4, ((t * 0.5 + rand(i + 4)) % 1) * 5, -1 - rand(i + 8) * 3]} r={0.04} c="#cfefff" />)}
  </group>
);

// ---------- 25. Espaço ----------
export const Espaco = ({ t = 0 }: T) => {
  const geo = useMemo(() => new THREE.SphereGeometry(0.05, 6, 4), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff' }), []);
  const stars = useMemo(() => Array.from({ length: 400 }, (_, i) => [(rand(i) - 0.5) * 80, rand(i + 900) * 40 - 5, -20 - rand(i + 400) * 30] as V3), []);
  return (
    <group>
      <Sky bg="#070a1a" sky="#a0a8ff" ground="#2a2a3a" fill={0.7} power={1.8} fog={[60, 120]} />
      <Field items={stars} geometry={geo} material={mat} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial color="#9a9aa2" roughness={1} /></mesh>
      {[[-1.8, -1], [2.2, -3], [0.4, -5], [-3, -6]].map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}><ringGeometry args={[0.3 + i * 0.1, 0.45 + i * 0.12, 24]} /><meshStandardMaterial color="#7a7a82" /></mesh>
      ))}
      <mesh position={[-4, 7, -30]}><sphereGeometry args={[4, 32, 24]} /><meshStandardMaterial color="#3a7fd8" emissive="#1a3a7a" emissiveIntensity={0.4} /></mesh>
      <mesh position={[6, 10, -40]} rotation={[0.4, 0, 0.3]}><torusGeometry args={[4, 0.3, 4, 40]} /><meshBasicMaterial color="#e8c88a" /></mesh>
      <mesh position={[6, 10, -40]}><sphereGeometry args={[2.6, 24, 18]} /><meshStandardMaterial color="#d8a86a" /></mesh>
      <group position={[2, 0, -2]}>
        <Cyl p={[0, 1.2, 0]} r={0.02} h={2.4} c="#d8d8de" />
        <Box p={[0.35, 2.2, 0]} s={[0.7, 0.45, 0.02]} c="#f4f4f6" />
      </group>
      {void t}
    </group>
  );
};

// ---------- 26. Estação de trem ----------
export const EstacaoTrem = () => (
  <group>
    <Sky bg="#c8ccd4" ground="#6a6a72" sun={[-4, 9, 4]} />
    <Ground color="#5a5a62" />
    <Box p={[-1.2, 0.5, -3]} s={[4, 1, 20]} c="#c8c2b6" />
    <Box p={[0.82, 1.005, -3]} s={[0.1, 0.01, 20]} c="#f2c62e" />
    {[1.8, 2.8].map((x) => <Box key={x} p={[x, 0.05, -3]} s={[0.08, 0.1, 30]} c="#8a8a92" />)}
    {Array.from({ length: 20 }, (_, i) => <Box key={i} p={[2.3, 0.02, 6 - i * 1.2]} s={[1.4, 0.04, 0.2]} c="#6b4a2e" />)}
    <group position={[2.3, 0, -6]}>
      <Box p={[0, 1.4, 0]} s={[1.9, 2.4, 9]} c="#c8322c" r={0.3} />
      {Array.from({ length: 5 }, (_, i) => <Box key={i} p={[-0.96, 1.7, -3.4 + i * 1.7]} s={[0.02, 0.7, 1.1]} c="#bfe6ff" />)}
      <Box p={[0, 2.66, 0]} s={[1.6, 0.12, 9]} c="#9aa0a8" />
    </group>
    {[-3, -7].map((z) => (
      <group key={z}>
        <Box p={[-2.6, 2.2, z]} s={[0.12, 3.4, 0.12]} c="#2a2a30" />
        <Box p={[-1.2, 3.9, z]} s={[4.2, 0.12, 0.6]} c="#2a2a30" />
      </group>
    ))}
    <Sign text="PLATAFORMA 1" w={1.8} h={0.38} position={[-1.2, 3.4, -3]} bg="#1f3b7a" fg="#ffffff" />
    <Box p={[-2.4, 1.45, -0.6]} s={[1.4, 0.08, 0.45]} c="#8a5a32" />
  </group>
);

// ---------- 27. Aeroporto ----------
export const Aeroporto = () => (
  <group>
    <Sky bg="#a8d8ff" ground="#8a8a80" fog={[24, 80]} />
    <Ground color="#7a8a6a" />
    <Box p={[0, 0.01, -8]} s={[8, 0.02, 60]} c="#3a3a42" />
    {Array.from({ length: 12 }, (_, i) => <Box key={i} p={[0, 0.03, 4 - i * 5]} s={[0.3, 0.02, 2.4]} c="#f4f4f2" />)}
    <group position={[0, 0, -6]}>
      <Cyl p={[0, 1.4, 0]} r={0.6} h={9} c="#f4f4f6" rot={[Math.PI / 2, 0, 0]} />
      <mesh position={[0, 1.4, 4.7]} rotation={[Math.PI / 2, 0, 0]}><sphereGeometry args={[0.6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#f4f4f6" /></mesh>
      <Box p={[0, 1.2, 0.4]} s={[10, 0.14, 1.6]} c="#d8d8de" />
      <Box p={[0, 2.6, -4]} s={[0.12, 2.2, 1.2]} c="#2f6fb3" />
      <Box p={[0, 1.7, -4.1]} s={[3.2, 0.1, 0.8]} c="#d8d8de" />
      {Array.from({ length: 9 }, (_, i) => <Box key={i} p={[0.6, 1.6, 3 - i * 0.7]} s={[0.02, 0.18, 0.25]} c="#3a5a8a" />)}
      {[-2.2, 2.2].map((x) => <Cyl key={x} p={[x, 0.8, 0.6]} r={0.28} h={0.9} c="#9aa0a8" rot={[Math.PI / 2, 0, 0]} />)}
    </group>
    <Box p={[-8, 3, -20]} s={[10, 6, 4]} c="#c8d8e8" map={windowsTex('#c8d8e8', 3, 8)} />
    <Cyl p={[7, 4, -18]} r={0.5} h={8} c="#d8d8de" />
    <Box p={[7, 8.4, -18]} s={[2, 1.2, 2]} c="#5a8ab8" />
  </group>
);

// ---------- 28. Fábrica ----------
export const Fabrica = ({ t = 0 }: T) => (
  <group>
    <Sky bg="#8a8a92" ground="#4a4a52" sun={[-3, 9, 5]} power={1.6} />
    <Ground map={tileTex('#6a6a72', '#5e5e66', 20)} />
    <Wall z={-6} color="#7a7a82" h={8} />
    {/* esteira */}
    <Box p={[0, 0.55, -1.4]} s={[8, 0.1, 0.9]} c="#2a2a30" />
    {Array.from({ length: 8 }, (_, i) => <Cyl key={i} p={[-3.6 + i, 0.45, -1.4]} r={0.12} h={0.95} c="#5a5a62" rot={[Math.PI / 2, 0, 0]} />)}
    {Array.from({ length: 5 }, (_, i) => <Box key={i} p={[-4 + (((t * 0.8 + i * 1.7) % 8)), 0.85, -1.4]} s={[0.5, 0.5, 0.5]} c="#c8964a" />)}
    {[-2.6, 0.6, 3.4].map((x, i) => (
      <group key={x} position={[x, 0, -3.6]}>
        <Box p={[0, 1.2, 0]} s={[1.8, 2.4, 1.4]} c={['#f2c62e', '#2f6fb3', '#3aa14a'][i]} r={0.4} />
        <Cyl p={[0, 2.8, 0]} r={0.2} h={0.8} c="#5a5a62" />
        <Ball p={[0.6, 1.8, 0.71]} r={0.08} c={Math.floor(t * 2 + i) % 2 ? '#ff3a2a' : '#5aff6a'} e />
      </group>
    ))}
    {[-3, 0, 3].map((x) => <Box key={x} p={[x, 6, -2]} s={[0.25, 0.25, 8]} c="#5a5a62" />)}
  </group>
);

// ---------- 29. Castelo ----------
export const Castelo = () => (
  <group>
    <Sky bg="#a8c8f0" ground="#6a8a4a" fog={[18, 60]} />
    <Ground map={grass()} />
    <Water y={0.03} c="#3a7ab8" size={1} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -4.4]}><planeGeometry args={[16, 1.4]} /><meshStandardMaterial color="#3a7ab8" roughness={0.2} /></mesh>
    <Box p={[0, 2, -6.5]} s={[9, 4, 1.2]} c="#a8a8b0" map={tileTex('#b0b0b8', '#9a9aa2', 10)} />
    {Array.from({ length: 10 }, (_, i) => <Box key={i} p={[-4.3 + i * 0.95, 4.25, -6.5]} s={[0.5, 0.5, 1.2]} c="#a8a8b0" />)}
    {[-4.6, 4.6].map((x) => (
      <group key={x}>
        <Cyl p={[x, 2.8, -6.5]} r={1.0} h={5.6} c="#9a9aa2" />
        <Cone p={[x, 6.4, -6.5]} r={1.2} h={1.8} c="#2f4f8f" />
        <Cyl p={[x, 7.8, -6.5]} r={0.02} h={1} c="#3a3a3a" />
        <Box p={[x + 0.3, 8.1, -6.5]} s={[0.6, 0.35, 0.02]} c="#c8322c" />
      </group>
    ))}
    <mesh position={[0, 1.2, -5.88]}><circleGeometry args={[1, 24, 0, Math.PI]} /><meshStandardMaterial color="#3a2a1a" /></mesh>
    <Box p={[0, 0.6, -5.88]} s={[2, 1.2, 0.02]} c="#3a2a1a" />
    <Box p={[0, 0.06, -4.4]} s={[2, 0.12, 1.6]} c="#6b4a2e" />
    <Tree position={[-6, 0, -3]} s={1.3} />
    <Tree position={[6.4, 0, -3.4]} s={1.2} />
  </group>
);

// ---------- 30. Estádio ----------
export const Estadio = () => (
  <group>
    <Sky bg="#8fc8ff" ground="#3a6a2a" fog={[30, 90]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 50]} /><meshStandardMaterial map={tileTex('#4fa84a', '#46a042', 14)} /></mesh>
    {[[0, -0.5, 14, 0.08], [0, -12, 14, 0.08]].map(([x, z, w, d], i) => <Box key={i} p={[x, 0.01, z]} s={[w, 0.01, d]} c="#ffffff" />)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -0.5]}><ringGeometry args={[2.2, 2.3, 40]} /><meshBasicMaterial color="#ffffff" /></mesh>
    <group position={[0, 0, -12]}>
      <Box p={[-1.8, 1.1, 0]} s={[0.1, 2.2, 0.1]} c="#ffffff" />
      <Box p={[1.8, 1.1, 0]} s={[0.1, 2.2, 0.1]} c="#ffffff" />
      <Box p={[0, 2.2, 0]} s={[3.7, 0.1, 0.1]} c="#ffffff" />
      <mesh position={[0, 1.1, -0.6]}><boxGeometry args={[3.6, 2.2, 1.2]} /><meshBasicMaterial color="#ffffff" wireframe /></mesh>
    </group>
    {Array.from({ length: 6 }, (_, r) => (
      <Box key={r} p={[0, 0.6 + r * 0.6, -20 - r * 1.2]} s={[40, 0.6, 1.2]} c={r % 2 ? '#c8322c' : '#f4f4f2'} />
    ))}
    {[-14, 14].map((x) => (
      <group key={x}>
        <Cyl p={[x, 6, -18]} r={0.2} h={12} c="#9aa0a8" />
        <Box p={[x, 12, -18]} s={[2.4, 1.2, 0.3]} c="#fff8d8" />
      </group>
    ))}
    <Ball p={[0.6, 0.18, 0.6]} r={0.18} c="#ffffff" />
  </group>
);

export const NOVOS_CENARIOS: { nome: string; C: (p: { t: number }) => JSX.Element; cam: [V3, V3] }[] = [
  { nome: 'Floresta', C: ({ t }) => <Floresta t={t} />, cam: [[0, 2.2, 6], [0, 1.6, -4]] },
  { nome: 'Floresta à noite', C: ({ t }) => <Floresta noite t={t} />, cam: [[0, 2.2, 6], [0, 1.6, -4]] },
  { nome: 'Fazenda', C: () => <Fazenda />, cam: [[0, 2.4, 6.5], [-0.3, 1.8, -3]] },
  { nome: 'Plantação', C: () => <Plantacao />, cam: [[0, 3.0, 5.5], [0.6, 0.6, -3]] },
  { nome: 'Horta', C: () => <Horta />, cam: [[0, 3.2, 5], [0, 0.6, -1.4]] },
  { nome: 'Sala de aula', C: () => <SalaDeAula />, cam: [[0, 2.4, 5.6], [0, 1.3, -1.4]] },
  { nome: 'Fachada da escola', C: () => <EscolaFachada />, cam: [[0, 2.4, 7.5], [0, 2.4, -3]] },
  { nome: 'Biblioteca', C: () => <Biblioteca />, cam: [[0, 2.0, 5], [0, 1.5, -2]] },
  { nome: 'Cozinha de casa', C: () => <Cozinha />, cam: [[0, 2.2, 5.2], [0.4, 1.1, -1.2]] },
  { nome: 'Cozinha de restaurante', C: ({ t }) => <CozinhaRestaurante t={t} />, cam: [[0, 2.2, 5.2], [0, 1.4, -1.4]] },
  { nome: 'Praia', C: ({ t }) => <Praia t={t} />, cam: [[0, 2.0, 6], [0.2, 1.6, -2]] },
  { nome: 'Praia ao pôr do sol', C: ({ t }) => <Praia porDoSol t={t} />, cam: [[0, 2.0, 6], [0.2, 1.6, -2]] },
  { nome: 'Quarto de hospital', C: ({ t }) => <HospitalQuarto t={t} />, cam: [[0, 2.2, 4.6], [0, 1.2, -1.4]] },
  { nome: 'Fachada do hospital', C: () => <HospitalFachada />, cam: [[0.4, 2.6, 8], [0.4, 3.2, -3]] },
  { nome: 'Centro da cidade', C: () => <CentroCidade />, cam: [[0, 2.2, 6], [0, 3.4, -6]] },
  { nome: 'Terraço de prédio', C: () => <Terraco />, cam: [[0, 1.8, 3.6], [0, 1.4, -4]] },
  { nome: 'Sala de estar', C: () => <SalaDeEstar />, cam: [[0, 2.0, 4.6], [0.2, 1.1, -1.4]] },
  { nome: 'Quarto', C: () => <Quarto />, cam: [[0, 2.0, 4.4], [0.3, 1.1, -1.4]] },
  { nome: 'Supermercado', C: () => <Supermercado />, cam: [[0, 2.2, 5.5], [0, 1.4, -3]] },
  { nome: 'Praça', C: ({ t }) => <Praca t={t} />, cam: [[0, 2.4, 5.5], [0, 1.2, -2.6]] },
  { nome: 'Montanha nevada', C: ({ t }) => <MontanhaNevada t={t} />, cam: [[0, 2.2, 6], [0, 2.6, -6]] },
  { nome: 'Deserto', C: () => <Deserto />, cam: [[0, 1.8, 6], [0, 1.4, -4]] },
  { nome: 'Selva com rio', C: ({ t }) => <Selva t={t} />, cam: [[0, 2.2, 5.5], [0, 1.6, -4]] },
  { nome: 'Fundo do mar', C: ({ t }) => <FundoDoMar t={t} />, cam: [[0, 1.8, 5], [0, 1.2, -2]] },
  { nome: 'Espaço / Lua', C: ({ t }) => <Espaco t={t} />, cam: [[0, 1.8, 6], [0, 3, -10]] },
  { nome: 'Estação de trem', C: () => <EstacaoTrem />, cam: [[-0.4, 2.4, 5.5], [0.4, 1.6, -4]] },
  { nome: 'Aeroporto', C: () => <Aeroporto />, cam: [[2.6, 2.8, 6], [0, 1.6, -6]] },
  { nome: 'Fábrica', C: ({ t }) => <Fabrica t={t} />, cam: [[0, 2.6, 5.6], [0, 1.4, -2.4]] },
  { nome: 'Castelo', C: () => <Castelo />, cam: [[0, 2.4, 6], [0, 3, -6]] },
  { nome: 'Estádio de futebol', C: () => <Estadio />, cam: [[0, 2.6, 6], [0, 1.2, -8]] },
];
void starTex;
