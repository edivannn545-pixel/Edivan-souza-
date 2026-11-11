import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import { back, clamp01, easeIn, easeOut, rand, seg, V3 } from './anim';
import { LedCounter, Puff } from './props';
import { Box, WarmLights } from './sets';
import { canvasTex, tileTex } from './textures';

// ============================================================================
// Cenários e objetos do estilo "E se...?" (reutilizáveis em qualquer episódio).
// ============================================================================
type G = { position?: V3; rotation?: V3; scale?: number | V3 };

const Fundo = ({ bg, near, far }: { bg: string; near: number; far: number }) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, near, far);
  }, [scene, bg, near, far]);
  return null;
};

// ---------- Mundo raio-X: fundo azul-marinho, chão de grade neon, partículas ----------
const gradeTex = (cor: string) =>
  canvasTex(`grade|${cor}`, 256, 256, (c) => {
    c.fillStyle = '#0b1a3e';
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = cor;
    c.lineWidth = 5;
    c.strokeRect(0, 0, 256, 256);
    c.globalAlpha = 0.35;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(128, 0);
    c.lineTo(128, 256);
    c.moveTo(0, 128);
    c.lineTo(256, 128);
    c.stroke();
  }, [24, 24]);

export const GradeNeon = ({ t, cor = '#2ee6d6', bg = '#0a1636' }: { t: number; cor?: string; bg?: string }) => (
  <group>
    <Fundo bg={bg} near={9} far={30} />
    <hemisphereLight args={['#bfe6ff', '#0a1636', 1.3]} />
    <directionalLight position={[-3, 6, 5]} intensity={1.6} color="#ffffff" />
    <directionalLight position={[3, 2, -4]} intensity={1.2} color="#5fd0ff" />
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial map={gradeTex(cor)} />
    </mesh>
    {Array.from({ length: 46 }, (_, i) => {
      const x = (rand(i) - 0.5) * 14;
      const z = -rand(i + 50) * 12 + 2;
      const y = ((rand(i + 99) * 6 + t * (0.15 + rand(i + 7) * 0.2)) % 6) + 0.2;
      const s = 0.025 + rand(i + 3) * 0.04;
      return (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[s, 8, 6]} />
          <meshBasicMaterial color="#cfefff" transparent opacity={0.7} />
        </mesh>
      );
    })}
  </group>
);

// ---------- Piscina do clube (vista de fora ou de dentro d'água) ----------
// Água: superfície em y = -0.15. Fundo em y = -2.4. Borda interna: x de -2.5 a 2.5, z de -7 a 1.5.
// Personagem dentro d'água com a cabeça para fora: y ≈ -1.45. Andando no fundo: y = -2.4.
export const AGUA_Y = -0.15;
export const FUNDO_Y = -2.4;
const PX = 2.5;
const Z0 = -7;
const Z1 = 1.5;

export const Piscina = ({ t = 0, submerso = false, bg = '#9ad8ff' }: { t?: number; submerso?: boolean; bg?: string }) => {
  const azulejo = tileTex('#bfe9f6', '#9fd6ea', 10);
  return (
    <group>
      {submerso ? (
        <>
          <Fundo bg="#14608f" near={1.5} far={11} />
          <hemisphereLight args={['#bff2ff', '#0b3a5a', 1.6]} />
          <directionalLight position={[-2, 8, 3]} intensity={1.6} color="#dff8ff" />
        </>
      ) : (
        <WarmLights sun={[-6, 8, 6]} bg={bg} sky="#ffffff" ground="#5a7a8a" fog={[18, 50]} />
      )}
      {/* deque em volta da piscina (topo em y = 0) */}
      <Box p={[0, -0.15, Z1 + 6]} s={[30, 0.3, 12]} c="#efe4d0" />
      <Box p={[0, -0.15, Z0 - 6]} s={[30, 0.3, 12]} c="#efe4d0" />
      <Box p={[PX + 6, -0.15, (Z0 + Z1) / 2]} s={[12, 0.3, Z1 - Z0]} c="#efe4d0" />
      <Box p={[-PX - 6, -0.15, (Z0 + Z1) / 2]} s={[12, 0.3, Z1 - Z0]} c="#efe4d0" />
      {/* borda */}
      <Box p={[0, 0.03, Z1 + 0.15]} s={[PX * 2 + 0.6, 0.06, 0.3]} c="#ffffff" r={0.4} />
      <Box p={[0, 0.03, Z0 - 0.15]} s={[PX * 2 + 0.6, 0.06, 0.3]} c="#ffffff" r={0.4} />
      <Box p={[PX + 0.15, 0.03, (Z0 + Z1) / 2]} s={[0.3, 0.06, Z1 - Z0]} c="#ffffff" r={0.4} />
      <Box p={[-PX - 0.15, 0.03, (Z0 + Z1) / 2]} s={[0.3, 0.06, Z1 - Z0]} c="#ffffff" r={0.4} />
      {/* paredes e fundo azulejados */}
      <Box p={[0, (FUNDO_Y - 0.3) / 2, Z1 + 0.05]} s={[PX * 2, -FUNDO_Y + 0.3, 0.1]} map={azulejo} />
      <Box p={[0, (FUNDO_Y - 0.3) / 2, Z0 - 0.05]} s={[PX * 2, -FUNDO_Y + 0.3, 0.1]} map={azulejo} />
      <Box p={[PX + 0.05, (FUNDO_Y - 0.3) / 2, (Z0 + Z1) / 2]} s={[0.1, -FUNDO_Y + 0.3, Z1 - Z0]} map={azulejo} />
      <Box p={[-PX - 0.05, (FUNDO_Y - 0.3) / 2, (Z0 + Z1) / 2]} s={[0.1, -FUNDO_Y + 0.3, Z1 - Z0]} map={azulejo} />
      <mesh position={[0, FUNDO_Y, (Z0 + Z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[PX * 2, Z1 - Z0]} />
        <meshStandardMaterial map={tileTex('#8fd2ea', '#7cc4de', 14)} />
      </mesh>
      {/* faixa escura no fundo (raia) */}
      <Box p={[0, FUNDO_Y + 0.01, (Z0 + Z1) / 2]} s={[0.25, 0.01, Z1 - Z0 - 1]} c="#1d4e8a" />
      {/* superfície da água */}
      <mesh position={[0, AGUA_Y, (Z0 + Z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
        <planeGeometry args={[PX * 2, Z1 - Z0, 1, 1]} />
        <meshStandardMaterial color="#3fb7e6" transparent opacity={submerso ? 0.7 : 0.55} roughness={0.08} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* raia de boias */}
      {Array.from({ length: 22 }, (_, i) => (
        <mesh key={i} position={[-PX + 0.12 + i * 0.23, AGUA_Y + 0.02 + Math.sin(t * 2 + i) * 0.015, -6.2]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color={i % 4 < 2 ? '#e63946' : '#ffffff'} />
        </mesh>
      ))}
      {/* escada (lado direito, perto da borda da frente) */}
      <EscadaPiscina position={[PX - 0.05, 0, 0.6]} />
      {/* raios de luz dentro d'água */}
      {submerso &&
        Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[-2 + i * 0.7, -1.2, -3 + Math.sin(i) * 2]} rotation={[0.25, 0, 0.2]}>
            <cylinderGeometry args={[0.12, 0.3, 2.6, 8, 1, true]} />
            <meshBasicMaterial color="#e8fbff" transparent opacity={0.08 + 0.04 * Math.sin(t * 2 + i)} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      {/* espreguiçadeiras e guarda-sol */}
      {!submerso &&
        [-5, 5].map((x) => (
          <group key={x} position={[x, 0, -2]}>
            <Box p={[0, 0.25, 0]} s={[0.8, 0.08, 2]} c={x < 0 ? '#ff8a5c' : '#5cc8ff'} />
            <Box p={[0, 0.5, -0.85]} s={[0.8, 0.5, 0.08]} c={x < 0 ? '#ff8a5c' : '#5cc8ff'} />
            <mesh position={[x < 0 ? 1.1 : -1.1, 1.2, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
              <meshStandardMaterial color="#eeeeee" />
            </mesh>
            <mesh position={[x < 0 ? 1.1 : -1.1, 2.4, 0]} castShadow>
              <coneGeometry args={[1.2, 0.5, 12]} />
              <meshStandardMaterial color={x < 0 ? '#ffd23a' : '#ff6a8a'} />
            </mesh>
          </group>
        ))}
      {!submerso && <Box p={[0, 1.4, -14]} s={[30, 2.8, 0.4]} c="#f6efe0" />}
      {!submerso &&
        [-8, -4, 4, 8].map((x) => (
          <group key={x} position={[x, 0, -13]}>
            <mesh position={[0, 1.8, 0]}>
              <cylinderGeometry args={[0.12, 0.16, 3.6, 10]} />
              <meshStandardMaterial color="#a0754a" />
            </mesh>
            <mesh position={[0, 3.8, 0]}>
              <sphereGeometry args={[1.1, 14, 10]} />
              <meshStandardMaterial color="#3f9d58" roughness={0.9} />
            </mesh>
          </group>
        ))}
    </group>
  );
};

export const EscadaPiscina = (g: G) => (
  <group {...g}>
    {[-0.25, 0.25].map((z) => (
      <group key={z}>
        <mesh position={[-0.12, -1.0, z]}>
          <cylinderGeometry args={[0.03, 0.03, 2.2, 10]} />
          <meshStandardMaterial color="#d8dde3" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0.08, 0.55, z]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.2, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#d8dde3" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <Box key={i} p={[-0.12, -0.35 - i * 0.45, 0]} s={[0.12, 0.04, 0.5]} c="#c9ced4" />
    ))}
  </group>
);

// ---------- Objetos ----------
export const Skate = ({ roda = 0, ...g }: G & { roda?: number }) => (
  <group {...g}>
    <mesh position={[0, 0.13, 0]} castShadow scale={[1, 1, 1]}>
      <boxGeometry args={[0.28, 0.04, 0.95]} />
      <meshStandardMaterial color="#ff6a3d" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.155, 0]}>
      <boxGeometry args={[0.26, 0.01, 0.9]} />
      <meshStandardMaterial color="#2a2a30" roughness={0.95} />
    </mesh>
    {[-0.33, 0.33].map((z) =>
      [-0.1, 0.1].map((x) => (
        <mesh key={`${x}${z}`} position={[x, 0.05, z]} rotation={[roda, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 14]} />
          <meshStandardMaterial color="#ffd23a" />
        </mesh>
      )),
    )}
  </group>
);

// Meio-fio que racha e se parte em `at` (pedaços caem com gravidade).
export const Calcada = ({ t, at, ...g }: G & { t: number; at?: number }) => {
  const dt = at === undefined ? -1 : t - at;
  const pecas: { x: number; w: number }[] = [
    { x: -0.9, w: 0.6 },
    { x: -0.3, w: 0.6 },
    { x: 0.3, w: 0.6 },
    { x: 0.9, w: 0.6 },
  ];
  return (
    <group {...g}>
      {pecas.map((p, i) => {
        const solto = dt > 0 && i > 0 && i < 3;
        const vx = (i === 1 ? -1 : 1) * (0.8 + rand(i) * 0.6);
        const vy = 1.6 + rand(i + 5) * 0.8;
        const tt = solto ? Math.min(dt, 0.9) : 0;
        const y = Math.max(0, vy * tt - 4.9 * tt * tt);
        return (
          <mesh key={i} position={[p.x + vx * tt, 0.15 + y, solto ? tt * 0.6 : 0]} rotation={[tt * 3 * (i - 1.5), 0, tt * 4 * (i - 1.5)]} castShadow receiveShadow>
            <boxGeometry args={[p.w * 0.98, 0.3, 0.45]} />
            <meshStandardMaterial color="#c9c4ba" roughness={0.95} />
          </mesh>
        );
      })}
      {at !== undefined && <Puff t={t} at={at} n={9} position={[0, 0.2, 0.1]} color="#d8d2c6" size={0.35} />}
    </group>
  );
};

// Osso de desenho (haste com duas bolinhas em cada ponta).
export const Osso = ({ cor = '#f6f3ea', metal = false, comp = 1, ...g }: G & { cor?: string; metal?: boolean; comp?: number }) => {
  const m = <meshStandardMaterial color={cor} metalness={metal ? 1 : 0} roughness={metal ? 0.18 : 0.5} emissive={metal ? '#000' : cor} emissiveIntensity={metal ? 0 : 0.15} />;
  return (
    <group {...g}>
      <mesh castShadow>
        <capsuleGeometry args={[0.09, comp, 6, 12]} />
        {m}
      </mesh>
      {[1, -1].map((s) =>
        [-0.09, 0.09].map((x) => (
          <mesh key={`${s}${x}`} position={[x, s * (comp / 2 + 0.08), 0]} castShadow>
            <sphereGeometry args={[0.12, 14, 10]} />
            {m}
          </mesh>
        )),
      )}
    </group>
  );
};

// Bloco de concreto que esmaga (achata e solta pedaços) em `at`.
export const BlocoConcreto = ({ t, at, ...g }: G & { t: number; at: number }) => {
  const k = seg(t, at - 3 / 30, at, easeIn);
  return (
    <group {...g}>
      <mesh position={[0, 0.5 - k * 0.3, 0]} scale={[1 + k * 0.25, 1 - k * 0.6, 1 + k * 0.25]} castShadow>
        <boxGeometry args={[0.7, 1, 0.7]} />
        <meshStandardMaterial color="#a9a59c" roughness={1} />
      </mesh>
      <Puff t={t} at={at} n={8} position={[0, 0.2, 0.2]} color="#cfc9bd" size={0.3} />
      {Array.from({ length: 6 }, (_, i) => {
        const dt = clamp01((t - at) / 0.7);
        if (dt <= 0) return null;
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * dt * 0.8, Math.max(0.05, 0.4 + dt * 1.2 - dt * dt * 2.2), Math.sin(a) * dt * 0.5]} rotation={[dt * 5, i, dt * 3]}>
            <boxGeometry args={[0.12, 0.1, 0.1]} />
            <meshStandardMaterial color="#9a958b" />
          </mesh>
        );
      })}
    </group>
  );
};

// Prensa: placa metálica que desce sobre os objetos e chega em `at`.
export const Prensa = ({ t, from, at, topo = 1.15, w = 3, ...g }: G & { t: number; from: number; at: number; topo?: number; w?: number }) => {
  const y = 3 - (3 - topo) * seg(t, from, at, easeIn);
  return (
    <group {...g}>
      <mesh position={[0, y + 0.1, 0]} castShadow>
        <boxGeometry args={[w, 0.2, 1]} />
        <meshStandardMaterial color="#8d97a3" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, y + 2.2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 4, 12]} />
        <meshStandardMaterial color="#6d7682" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};

// Balança de farmácia com visor que rola até o valor em `at`.
export const Balanca = ({ t, from, at, valor, sufixo = ' KG', ...g }: G & { t: number; from: number; at: number; valor: number; sufixo?: string }) => (
  <group {...g}>
    <Box p={[0, 0.06, 0]} s={[1.0, 0.12, 0.8]} c="#e9edf2" r={0.3} />
    <mesh position={[0, 0.9, -0.36]} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 1.6, 10]} />
      <meshStandardMaterial color="#c9ced4" metalness={0.7} roughness={0.3} />
    </mesh>
    <LedCounter t={t} from={from} at={at} value={valor} suffix={sufixo} position={[0, 1.85, -0.36]} scale={0.38} />
  </group>
);

// Bolhas subindo (debaixo d'água).
export const Bolhas = ({ t, n = 14, centro = [0, 0, 0] as V3, raio = 0.4, altura = 2.2 }: { t: number; n?: number; centro?: V3; raio?: number; altura?: number }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const per = 1.2 + rand(i) * 0.8;
      const k = ((t + rand(i + 9) * per) % per) / per;
      const s = 0.03 + rand(i + 4) * 0.05;
      return (
        <mesh key={i} position={[centro[0] + (rand(i + 1) - 0.5) * raio * 2 + Math.sin(t * 4 + i) * 0.05, centro[1] + k * altura, centro[2] + (rand(i + 2) - 0.5) * raio]}>
          <sphereGeometry args={[s, 8, 6]} />
          <meshStandardMaterial color="#e8fbff" transparent opacity={0.6 * (1 - k)} roughness={0.05} />
        </mesh>
      );
    })}
  </>
);

// Respingo d'água que nasce em `at`.
export const Splash = ({ t, at, position = [0, 0, 0] as V3, forca = 1 }: { t: number; at: number; position?: V3; forca?: number }) => {
  const dt = t - at;
  if (dt < 0 || dt > 1.1) return null;
  return (
    <group position={position}>
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const v = (1.2 + rand(i) * 1.4) * forca;
        const up = (2.6 + rand(i + 3) * 2.2) * forca;
        const y = up * dt - 4.9 * dt * dt;
        if (y < -0.1) return null;
        return (
          <mesh key={i} position={[Math.cos(a) * v * dt, y, Math.sin(a) * v * dt * 0.7]}>
            <sphereGeometry args={[0.07 + rand(i + 1) * 0.06, 8, 6]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.9 * (1 - dt / 1.1)} />
          </mesh>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={0.3 + easeOut(clamp01(dt)) * 1.6}>
        <ringGeometry args={[0.6, 0.75, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8 * (1 - clamp01(dt))} />
      </mesh>
    </group>
  );
};

// Arco de trajetória pontilhado que se desenha de `from` até `at` (salto, queda, chute).
export const Arco = ({ t, from, at, p0, p1, altura = 1, cor = '#ffffff' }: { t: number; from: number; at: number; p0: V3; p1: V3; altura?: number; cor?: string }) => {
  const k = seg(t, from, at, easeOut);
  const n = 26;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        if (u > k) return null;
        const p: V3 = [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u + altura * 4 * u * (1 - u), p0[2] + (p1[2] - p0[2]) * u];
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshBasicMaterial color={cor} />
          </mesh>
        );
      })}
    </>
  );
};

// Pulo/queda: altura de uma parábola entre a e b (0 fora do intervalo).
export const salto = (t: number, a: number, b: number, h: number) => {
  const u = clamp01((t - a) / (b - a));
  return 4 * h * u * (1 - u);
};
export const pop3 = (t: number, at: number) => Math.max(0, seg(t, at - 2 / 30, at + 5 / 30, back));
