import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import { clamp01, rand, V3 } from './anim';
import { Look, Pose, VOCE } from './Character';
import { ELENCO } from './personagens';
import { Sign } from './props';
import { Box } from './sets';
import { canvasTex, comicTex } from './textures';

// ============================================================================
// "O PASSARINHO DA MINA" — elenco, cenários e objetos desta história.
// ============================================================================

type G = { position?: V3; rotation?: V3; scale?: number | V3 };
const MAO = '#1e1f24';

// ---------- Elenco ----------
// Você: o mineiro da gaiola (capacete marrom, colete, lenço vermelho).
export const MINEIRO: Look = {
  ...VOCE, jacket: '#e0a030', vest: '#7a4a26', pants: '#3a3530', hat: 'capacete', hatColor: '#7a4a26', scarf: '#c0302e',
};
// O chefe: grandão de terno vinho, bigode.
export const CHEFE: Look = {
  skin: '#f0dccb', jacket: '#8a1f24', pants: '#2a2226', shoes: '#111', gloves: MAO, hair: '#1a120c', hairStyle: 'liso',
  beard: 'bigode', body: 'forte', shirt: '#f4f0e8', tie: '#1a1a1a',
};
// Os outros mineiros (do elenco, com capacete).
export const TONHAO: Look = { ...ELENCO.tonhao.look, hat: 'capacete', hatColor: '#f2c62e' };
export const TIAO: Look = { ...ELENCO.tiao.look, hat: 'capacete', hatColor: '#d98c2e' };
export const KAIO: Look = { ...ELENCO.kaio.look, jacket: '#4a6a8a', hat: 'capacete', hatColor: '#f2c62e' };

// Posição da mão direita no mundo (corpo adulto, sem inclinação), para pendurar a gaiola na mão.
export const maoDireita = (p: Pose): V3 => {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(p.x, p.y, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, p.ry, 0)), new THREE.Vector3(1, 1, 1));
  const ombro = new THREE.Matrix4().compose(new THREE.Vector3(-0.27, 1.0, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(-p.rsx, 0, -p.rsz, 'ZXY')), new THREE.Vector3(1, 1, 1));
  const cot = new THREE.Matrix4().compose(new THREE.Vector3(0, -0.3, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(-p.rel, 0, 0)), new THREE.Vector3(1, 1, 1));
  const v = new THREE.Vector3(0, -0.3, 0).applyMatrix4(cot).applyMatrix4(ombro).applyMatrix4(m);
  return [v.x, v.y, v.z];
};

// ---------- Céu, névoa e luz ----------
const Ceu = ({ bg, near, far }: { bg: string; near: number; far: number }) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, near, far);
  }, [scene, bg, near, far]);
  return null;
};

// mina = laranja quente (normal) · perigo = azul · gas = verde · dia = lá fora
export type Clima = 'mina' | 'perigo' | 'gas' | 'dia';
const CLIMA = {
  mina: { bg: '#3a2414', sky: '#ffd9a0', ground: '#4a2a14', fill: 0.75, sol: '#ffcf8a', power: 1.3, pos: [-3, 6, 5] as V3 },
  perigo: { bg: '#121a33', sky: '#6f86c8', ground: '#141420', fill: 0.6, sol: '#9fb6ff', power: 0.8, pos: [3, 6, 5] as V3 },
  gas: { bg: '#18301c', sky: '#9fe08a', ground: '#14240f', fill: 0.65, sol: '#b8ff9a', power: 0.7, pos: [3, 6, 5] as V3 },
  dia: { bg: '#a9d6f2', sky: '#fff1d8', ground: '#8a6a40', fill: 1.0, sol: '#ffe2b8', power: 2.4, pos: [-6, 9, 7] as V3 },
};
export const Luz = ({ clima = 'mina' as Clima, fog = [8, 30] as [number, number] }) => {
  const c = CLIMA[clima];
  return (
    <>
      <Ceu bg={c.bg} near={fog[0]} far={fog[1]} />
      <hemisphereLight args={[c.sky, c.ground, c.fill]} />
      <directionalLight
        position={c.pos}
        intensity={c.power}
        color={c.sol}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </>
  );
};

// ---------- Texturas ----------
const terraTex = () =>
  canvasTex('terra-mina', 512, 512, (c) => {
    c.fillStyle = '#c8874a';
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 80; i++) {
      c.fillStyle = `rgba(${rand(i) > 0.5 ? '90,50,20' : '230,170,110'},0.22)`;
      c.beginPath();
      c.ellipse(rand(i + 1) * 512, rand(i + 2) * 512, 18 + rand(i + 3) * 50, 8 + rand(i + 4) * 22, rand(i) * 3, 0, Math.PI * 2);
      c.fill();
    }
  }, [6, 10]);

const rochaTex = () =>
  canvasTex('rocha-mina', 512, 512, (c) => {
    c.fillStyle = '#b07a48';
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 70; i++) {
      c.fillStyle = `rgba(${rand(i) > 0.5 ? '70,40,20' : '220,160,100'},0.25)`;
      c.beginPath();
      c.ellipse(rand(i + 1) * 512, rand(i + 2) * 512, 20 + rand(i + 3) * 60, 10 + rand(i + 4) * 30, rand(i) * 3, 0, Math.PI * 2);
      c.fill();
    }
  }, [3, 2]);

// ---------- Objetos ----------
// Lamparina pendurada; `forca` 0..1 (apagando quando o gás chega).
export const Lamparina = ({ t, position, forca = 1 }: { t: number; position: V3; forca?: number }) => {
  const f = forca * (1 + 0.1 * Math.sin(t * 21 + position[2] * 3) + 0.06 * Math.sin(t * 33));
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.3, 4]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.07, 0.09, 0.16, 12]} />
        <meshStandardMaterial color="#e8c070" emissive="#ffb347" emissiveIntensity={2.5 * f} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.09, 0.07, 12]} />
        <meshStandardMaterial color="#3a2a1e" />
      </mesh>
      {f > 0.02 && <pointLight intensity={6 * f} distance={6} color="#ffaa55" />}
    </group>
  );
};

// Passarinho (canário). canta 0..1 = bico aberto + pulinho; mal 0..1 = murcho e pálido; caido 0..1 = deitado no chão da gaiola.
export type AveEstado = { canta?: number; mal?: number; caido?: number; olho?: number; ry?: number };
export const Passarinho = ({ e = {}, ...g }: G & { e?: AveEstado }) => {
  const canta = e.canta ?? 0, mal = e.mal ?? 0, caido = e.caido ?? 0, olho = e.olho ?? 1;
  const cor = new THREE.Color('#ffd23a').lerp(new THREE.Color('#b8c47a'), mal * 0.7).getStyle();
  return (
    <group {...g}>
      <group rotation={[0, e.ry ?? 0, caido * 1.5 + mal * 0.25]} position={[0, canta * 0.02, 0]}>
        <mesh position={[0, 0.07, 0]} scale={[0.9, 0.85 - mal * 0.1, 1.15]} castShadow>
          <sphereGeometry args={[0.07, 18, 14]} />
          <meshStandardMaterial color={cor} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.06, -0.08]} rotation={[-0.6 + mal * 0.6, 0, 0]}>
          <coneGeometry args={[0.035, 0.08, 8]} />
          <meshStandardMaterial color={cor} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * 0.058, 0.07, -0.01]} rotation={[0, 0, s * (0.2 + canta * 0.5 - mal * 0.3)]} scale={[0.3, 0.6, 1]}>
            <sphereGeometry args={[0.06, 12, 8]} />
            <meshStandardMaterial color="#f2bf2a" />
          </mesh>
        ))}
        <group position={[0, 0.15 - mal * 0.04, 0.04 + mal * 0.02]} rotation={[mal * 0.6 - canta * 0.4, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshStandardMaterial color={cor} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.005, 0.05]} rotation={[Math.PI / 2 - canta * 0.3, 0, 0]}>
            <coneGeometry args={[0.015, 0.04, 8]} />
            <meshStandardMaterial color="#e8822a" />
          </mesh>
          <mesh position={[0, -0.015, 0.047]} rotation={[Math.PI / 2 + canta * 0.6, 0, 0]}>
            <coneGeometry args={[0.012, 0.03, 8]} />
            <meshStandardMaterial color="#c86a1a" />
          </mesh>
          {[1, -1].map((s) => (
            <mesh key={s} position={[s * 0.03, 0.012, 0.03]} scale={[1, Math.max(0.12, olho * (1 - mal * 0.5)), 1]}>
              <sphereGeometry args={[0.011, 8, 6]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

// Gaiola dourada (altura ~0.45, o gancho fica no topo: posicione pelo gancho com `topo`).
export const Gaiola = ({ ave, topo, balanco = 0, escala = 1 }: { ave?: AveEstado; topo: V3; balanco?: number; escala?: number }) => {
  const ouro = '#e2b23a';
  const H = 0.34;
  return (
    <group position={topo} rotation={[balanco * 0.3, 0, balanco]} scale={escala}>
      <group position={[0, -0.59, 0]}>
        {/* base: bacia dourada grossa com fundo de palha (fechada, não dá para ver o chão através) */}
        <mesh position={[0, 0.0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.1, 32]} />
          <meshStandardMaterial color={ouro} metalness={0.35} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.014, 8, 32]} />
          <meshStandardMaterial color="#f2c84a" metalness={0.35} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.19, 32]} />
          <meshStandardMaterial color="#e6cf8a" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.11, 0.13, 0.03, 24]} />
          <meshStandardMaterial color={ouro} metalness={0.35} roughness={0.35} />
        </mesh>
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.17, 0.05 + H / 2, Math.sin(a) * 0.17]}>
              <cylinderGeometry args={[0.005, 0.005, H, 4]} />
              <meshStandardMaterial color={ouro} metalness={0.35} roughness={0.35} />
            </mesh>
          );
        })}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`a${i}`} position={[0, 0.04 + H, 0]} rotation={[0, (i * Math.PI) / 4, 0]}>
            <torusGeometry args={[0.17, 0.005, 6, 24, Math.PI]} />
            <meshStandardMaterial color={ouro} metalness={0.35} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 0.04 + H, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.17, 0.006, 6, 28]} />
          <meshStandardMaterial color={ouro} metalness={0.35} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.25 + H, 0]}>
          <torusGeometry args={[0.035, 0.007, 6, 16]} />
          <meshStandardMaterial color={ouro} metalness={0.35} roughness={0.35} />
        </mesh>
        {/* poleiro e potinho */}
        <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.33, 6]} />
          <meshStandardMaterial color="#8a5a32" />
        </mesh>
        <mesh position={[0.08, 0.07, 0.08]}>
          <cylinderGeometry args={[0.035, 0.03, 0.04, 12]} />
          <meshStandardMaterial color="#f4f4f2" />
        </mesh>
        {ave && <Passarinho e={ave} position={(ave.caido ?? 0) > 0.01 ? [0, 0.06, 0] : [0, 0.16, 0]} />}
      </group>
    </group>
  );
};

// Monte de pedras que os mineiros cavam.
export const Monte = ({ seed = 0, ...g }: G & { seed?: number }) => (
  <group {...g}>
    {Array.from({ length: 7 }, (_, i) => (
      <mesh key={i} position={[(rand(i + seed * 9) - 0.5) * 0.6, 0.08 + (i > 4 ? 0.18 : 0), (rand(i + 3 + seed * 9) - 0.5) * 0.5]} scale={[1, 0.75, 1]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.16 + rand(i + 5 + seed) * 0.1, 0]} />
        <meshStandardMaterial color={i % 2 ? '#8a5a3a' : '#a8724a'} roughness={0.9} flatShading />
      </mesh>
    ))}
  </group>
);

// Picareta (na mão: o cabo continua o antebraço, eixo -Y).
export const Picareta = (g: G) => (
  <group {...g}>
    <mesh position={[0, -0.25, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.022, 0.6, 8]} />
      <meshStandardMaterial color="#8a5a32" roughness={0.7} />
    </mesh>
    <mesh position={[0, -0.53, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.025, 0.006, 0.5, 8]} />
      <meshStandardMaterial color="#8a8f96" metalness={0.7} roughness={0.35} />
    </mesh>
  </group>
);

// Notas musicais subindo (assobio / canto). Função pura de t; `forca` 0..1 some com elas.
export const Notas = ({ t, position, forca = 1, size = 0.18 }: { t: number; position: V3; forca?: number; size?: number }) => {
  if (forca <= 0.01) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const k = (((t * 0.7 + i / 3) % 1) + 1) % 1;
        const s = size * Math.sin(Math.PI * k) * forca;
        return (
          <sprite key={i} position={[position[0] + Math.sin(k * 5 + i) * 0.15 + (i - 1) * 0.12, position[1] + k * 0.6, position[2]]} scale={[s * 2, s, 1]}>
            <spriteMaterial map={comicTex('♪', '#fff2a8')} transparent depthWrite={false} />
          </sprite>
        );
      })}
    </>
  );
};

// Gás: nuvem verde que avança a partir de `from` ao longo de -Z → +Z (ou parada, com `fixo`).
export const Gas = ({ t, from, center = [0, 0.8, -6] as V3, area = [4, 1.6, 8] as V3, n = 40, avanca = 2 }: { t: number; from: number; center?: V3; area?: V3; n?: number; avanca?: number }) => {
  const k = clamp01((t - from) / 1.2);
  if (k <= 0) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const s = (0.35 + rand(i) * 0.5) * k * (1 + 0.1 * Math.sin(t * 1.5 + i));
        return (
          <mesh
            key={i}
            position={[center[0] + (rand(i + 1) - 0.5) * area[0] + Math.sin(t * 0.7 + i) * 0.2, center[1] + (rand(i + 2) - 0.5) * area[1], center[2] + (rand(i + 3) - 0.5) * area[2] + (t - from) * avanca * 0.3]}
            scale={s}
          >
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#7fe05a" emissive="#3a9a2a" emissiveIntensity={0.5} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

// ============================================================================
// CENÁRIOS
// ============================================================================

// Túnel da mina ao longo de -Z: trilhos no meio (x = 0.7), quadros de madeira a cada 2,5 m,
// paredes de rocha em x = ±2.6, teto em y = 3.4. `lamp` 0..1 = força das lamparinas.
const QUADROS = [2.5, 0, -2.5, -5, -7.5, -10, -12.5, -15, -17.5, -20, -22.5, -25];
export const Tunel = ({ t, clima = 'mina' as Clima, lamp = 1, perigo = false }: { t: number; clima?: Clima; lamp?: number; perigo?: boolean }) => (
  <group>
    <Luz clima={clima} fog={clima === 'mina' ? [9, 30] : [6, 22]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
      <planeGeometry args={[6, 40]} />
      <meshStandardMaterial map={terraTex()} roughness={1} />
    </mesh>
    {/* trilhos */}
    {[0.42, 0.98].map((x) => (
      <Box key={x} p={[x, 0.06, -10]} s={[0.06, 0.06, 40]} c="#4a4a52" r={0.35} />
    ))}
    {Array.from({ length: 50 }, (_, i) => (
      <Box key={i} p={[0.7, 0.025, 8 - i * 0.8]} s={[0.95, 0.05, 0.16]} c="#6b4426" />
    ))}
    {/* paredes e teto */}
    {[-2.6, 2.6].map((x) => (
      <Box key={x} p={[x, 1.7, -10]} s={[0.4, 3.4, 40]} c="#ffffff" map={rochaTex()} r={0.95} />
    ))}
    <Box p={[0, 3.5, -10]} s={[6, 0.2, 40]} c="#2a1a10" />
    {QUADROS.map((z) => (
      <group key={z}>
        {[-2.2, 2.2].map((x) => (
          <Box key={x} p={[x, 1.6, z]} s={[0.22, 3.2, 0.22]} c="#8a5a32" />
        ))}
        <Box p={[0, 3.25, z]} s={[4.8, 0.26, 0.28]} c="#7a4a26" />
        <Lamparina t={t} position={[-1.85, 2.6, z + 0.2]} forca={lamp} />
      </group>
    ))}
    {/* barris, caixas, pedras */}
    <mesh position={[-1.7, 0.4, -3.5]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
      <meshStandardMaterial color="#8a5a32" />
    </mesh>
    <Box p={[1.85, 0.3, -6.4]} s={[0.6, 0.6, 0.6]} c="#9a6b3e" />
    <Box p={[1.8, 0.25, -11]} s={[0.5, 0.5, 0.5]} c="#9a6b3e" />
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={i} position={[(rand(i) - 0.5) * 4, 0.06, -rand(i + 1) * 20]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.08 + rand(i + 2) * 0.1, 8, 6]} />
        <meshStandardMaterial color="#5a3a22" />
      </mesh>
    ))}
    {/* carrinho de mina */}
    <group position={[0.7, 0, -8.5]}>
      <Box p={[0, 0.5, 0]} s={[0.8, 0.5, 1.1]} c="#5a5a62" r={0.4} />
      {[[-0.32, -0.35], [0.32, -0.35], [-0.32, 0.35], [0.32, 0.35]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.06, 14]} />
          <meshStandardMaterial color="#2a2a2e" />
        </mesh>
      ))}
      <mesh position={[0, 0.8, 0]} scale={[1, 0.4, 1]}>
        <sphereGeometry args={[0.38, 12, 8]} />
        <meshStandardMaterial color="#3a2a1e" />
      </mesh>
    </group>
    {/* frente de escavação no fundo */}
    <Box p={[0, 1.7, -26]} s={[5, 3.4, 0.5]} c="#ffffff" map={rochaTex()} />
    {perigo && <Sign text="PERIGO" w={1.3} h={0.35} position={[0, 2.85, -9.8]} bg="#b3241e" fg="#ffffff" />}
  </group>
);

// Entrada da mina vista de fora (dia): encosta de rocha, portal de madeira com placa MINA, trilhos saindo.
export const Entrada = () => (
  <group>
    <Luz clima="dia" fog={[25, 80]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#e2c08a" roughness={1} />
    </mesh>
    {/* encosta */}
    <mesh position={[0, 0, -9]} scale={[2.2, 1, 1]} castShadow receiveShadow>
      <sphereGeometry args={[7, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial map={rochaTex()} color="#e8b88a" roughness={0.95} />
    </mesh>
    {/* boca escura */}
    <Box p={[0, 1.5, -2.7]} s={[2.6, 3.0, 0.5]} c="#120a06" />
    {/* portal */}
    {[-1.45, 1.45].map((x) => (
      <Box key={x} p={[x, 1.65, -2.4]} s={[0.3, 3.3, 0.3]} c="#9a6436" />
    ))}
    <Box p={[0, 3.35, -2.4]} s={[3.5, 0.32, 0.35]} c="#8a5a32" />
    {[-1, 1].map((s) => (
      <Box key={s} p={[s * 1.15, 3.0, -2.25]} s={[0.6, 0.12, 0.12]} c="#8a5a32" />
    ))}
    <Sign text="MINA" w={1.9} h={0.55} position={[0, 3.95, -2.35]} bg="#c88a3e" fg="#3a2210" />
    {/* trilhos saindo */}
    {[0.42, 0.98].map((x) => (
      <Box key={x} p={[x - 0.7, 0.06, 4]} s={[0.06, 0.06, 14]} c="#4a4a52" />
    ))}
    {Array.from({ length: 18 }, (_, i) => (
      <Box key={i} p={[0, 0.025, -2.4 + i * 0.8]} s={[0.95, 0.05, 0.16]} c="#6b4426" />
    ))}
    {/* caixas, barris, placa verde */}
    <Box p={[-2.6, 0.35, -1.2]} s={[0.7, 0.7, 0.7]} c="#9a6b3e" />
    <Box p={[-3.2, 0.3, -0.6]} s={[0.6, 0.6, 0.6]} c="#a87444" />
    {[[2.6, -1.0], [3.2, -0.4]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.4, z]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
        <meshStandardMaterial color="#8a5a32" />
      </mesh>
    ))}
    {/* nuvens */}
    {[[-8, 14, -40], [10, 17, -50], [0, 20, -60]].map(([x, y, z], i) => (
      <group key={i} position={[x, y, z]}>
        {[0, 1.6, -1.6].map((dx) => (
          <mesh key={dx} position={[dx, 0, 0]} scale={[1.4, 0.8, 1]}>
            <sphereGeometry args={[1.6, 14, 10]} />
            <meshStandardMaterial color="#ffffff" fog={false} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

// Corte da mina (como um diagrama): bloco de terra em camadas com o túnel aberto na frente.
// Túnel de x = -4.5 a 4.5, chão em y = 0, teto em y = 2.6, frente em z = 0.
export const Corte = ({ t, clima = 'mina' as Clima, lamp = 1 }: { t: number; clima?: Clima; lamp?: number }) => (
  <group>
    <Luz clima={clima} fog={[30, 70]} />
    <directionalLight position={[1, 3, 10]} intensity={clima === 'mina' ? 1.1 : 0.9} color={clima === 'mina' ? '#ffe2b8' : '#b8c8ff'} />
    {/* camadas de terra em volta do túnel */}
    <Box p={[0, -1.6, -1]} s={[14, 3.2, 2.2]} c="#a8693a" />
    <Box p={[0, 4.6, -1]} s={[14, 4, 2.2]} c="#b8784a" />
    <Box p={[-5.75, 1.3, -1]} s={[2.5, 2.6, 2.2]} c="#b8784a" />
    <Box p={[5.75, 1.3, -1]} s={[2.5, 2.6, 2.2]} c="#b8784a" />
    {[-0.6, 3.1, 5.4].map((y, i) => (
      <Box key={y} p={[0, y, 0.11]} s={[14, 0.12, 0.02]} c={['#8a5230', '#c88a56', '#d89a62'][i]} />
    ))}
    {/* superfície com grama e céu */}
    <Box p={[0, 6.7, -1]} s={[14, 0.2, 2.2]} c="#7fae4a" />
    {/* fundo do túnel */}
    <Box p={[0, 1.3, -2]} s={[9, 2.6, 0.2]} c="#5a3418" map={rochaTex()} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -1]} receiveShadow>
      <planeGeometry args={[9, 2.2]} />
      <meshStandardMaterial map={terraTex()} />
    </mesh>
    {[-4.2, -1.4, 1.4, 4.2].map((x) => (
      <group key={x}>
        <Box p={[x, 1.3, -1.6]} s={[0.16, 2.6, 0.16]} c="#8a5a32" />
        <Lamparina t={t} position={[x + 0.3, 2.2, -1.5]} forca={lamp} />
      </group>
    ))}
    <Box p={[0, 2.5, -1.6]} s={[9, 0.18, 0.2]} c="#7a4a26" />
    {/* pedrinhas na terra */}
    {Array.from({ length: 24 }, (_, i) => (
      <mesh key={i} position={[(rand(i) - 0.5) * 13, rand(i + 1) > 0.5 ? -0.3 - rand(i + 2) * 2.5 : 2.9 + rand(i + 2) * 3, 0.12]} scale={[1, 0.7, 0.3]}>
        <sphereGeometry args={[0.09 + rand(i + 3) * 0.08, 8, 6]} />
        <meshStandardMaterial color="#d8d0c4" />
      </mesh>
    ))}
  </group>
);
