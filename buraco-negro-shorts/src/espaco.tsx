import { useThree } from '@react-three/fiber';
import { ReactNode, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { clamp01, rand, seg, V3 } from './anim';
import { Character, FaceState, Look, Pose } from './Character';
import { ESFERAS } from './personagens';
import { canvasTex, labelTex } from './textures';

// ============================================================================
// CENÁRIOS E OBJETOS DO ESPAÇO — "What If You Fell Into a Black Hole?"
// ============================================================================

// Nino ("você") de astronauta: traje com a cor coral dele, capacete de vidro.
export const ASTRO: Look = { ...ESFERAS.nino.look, jacket: '#ff6a3d', pants: '#eef0f4', shoes: '#9aa0a8', hat: 'astronauta', backpack: '#d8d8de', mangaCurta: false };

// ---------- Céu, luz e estrelas ----------
const SpaceSky = ({ bg }: { bg: string }) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, 150, 400);
  }, [scene, bg]);
  return null;
};

export const SpaceLights = ({ bg = '#05060f', glow = '#ff9a3c', key = [-4, 5, 7] as V3, glowPos = [0, -2, -12] as V3, power = 2.2 }) => (
  <>
    <SpaceSky bg={bg} />
    <hemisphereLight args={['#cfdcff', '#2a1a10', 1.0]} />
    <directionalLight position={key} intensity={power} color="#fff1dc" />
    <pointLight position={glowPos} intensity={60} distance={40} decay={1.2} color={glow} />
    <directionalLight position={[5, 2, -6]} intensity={0.9} color="#7fa4ff" />
  </>
);

export const Stars = ({ n = 1600, r = 90 }: { n?: number; r?: number }) => {
  const geo = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = rand(i * 3.1) * 2 - 1;
      const a = rand(i * 7.7) * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      pos.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3);
      const warm = rand(i * 1.3);
      col.set(warm > 0.8 ? [1, 0.85, 0.6] : warm < 0.2 ? [0.7, 0.8, 1] : [1, 1, 1], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [n, r]);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.55} sizeAttenuation vertexColors fog={false} />
    </points>
  );
};

// Estrelas passando rápido (queda). speed em m/s; dir = 1 sobe (você cai).
export const StarStreaks = ({ t, n = 140, speed = 14, center = [0, 0, 0] as V3 }: { t: number; n?: number; speed?: number; center?: V3 }) => (
  <group position={center}>
    {Array.from({ length: n }, (_, i) => {
      const a = rand(i * 2.3) * Math.PI * 2;
      const rr = 2.5 + rand(i * 5.1) * 9;
      const y = ((((rand(i * 9.7) * 40 + t * speed) % 40) + 40) % 40) - 20;
      return (
        <mesh key={i} position={[Math.cos(a) * rr, y, Math.sin(a) * rr - 2]}>
          <boxGeometry args={[0.03, 0.4 + speed * 0.06, 0.03]} />
          <meshBasicMaterial color={i % 5 ? '#ffffff' : '#ffd29a'} fog={false} />
        </mesh>
      );
    })}
  </group>
);

// ---------- Buraco negro ----------
const diskTex = () =>
  canvasTex('bh-disk', 1024, 1024, (c) => {
    const g = c.createRadialGradient(512, 512, 150, 512, 512, 512);
    g.addColorStop(0, 'rgba(255,255,240,1)');
    g.addColorStop(0.18, 'rgba(255,226,140,1)');
    g.addColorStop(0.45, 'rgba(255,140,40,0.95)');
    g.addColorStop(0.75, 'rgba(200,60,20,0.55)');
    g.addColorStop(1, 'rgba(120,20,10,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 1024, 1024);
    // Faixas em espiral para o giro aparecer.
    for (let i = 0; i < 220; i++) {
      const r = 170 + rand(i) * 330;
      const a0 = rand(i + 50) * Math.PI * 2;
      c.strokeStyle = rand(i + 9) > 0.5 ? 'rgba(255,250,220,0.35)' : 'rgba(120,30,0,0.35)';
      c.lineWidth = 2 + rand(i + 3) * 6;
      c.beginPath();
      c.arc(512, 512, r, a0, a0 + 0.4 + rand(i + 7) * 1.2);
      c.stroke();
    }
  });

const glowTex = (color: string) =>
  canvasTex(`glow|${color}`, 256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });

// r = raio do horizonte. tilt = inclinação do disco. spin = velocidade do giro.
export const BlackHole = ({ t, position = [0, 0, 0] as V3, r = 3, tilt = 1.32, spin = 1, glow = 1 }: { t: number; position?: V3; r?: number; tilt?: number; spin?: number; glow?: number }) => (
  <group position={position}>
    <sprite scale={[r * 9 * glow, r * 9 * glow, 1]} renderOrder={-1}>
      <spriteMaterial map={glowTex('rgba(255,140,50,0.55)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </sprite>
    <mesh renderOrder={2}>
      <sphereGeometry args={[r, 48, 32]} />
      <meshBasicMaterial color="#000000" fog={false} />
    </mesh>
    {/* Anel de fótons (o contorno brilhante) */}
    <mesh>
      <torusGeometry args={[r * 1.06, r * 0.035, 12, 96]} />
      <meshBasicMaterial color="#ffe7b0" fog={false} />
    </mesh>
    {/* Disco de acreção */}
    <mesh rotation={[-tilt, 0, t * 0.6 * spin]}>
      <ringGeometry args={[r * 1.25, r * 3.4, 160, 1]} />
      <meshBasicMaterial map={diskTex()} transparent side={THREE.DoubleSide} depthWrite={false} fog={false} />
    </mesh>
    {/* Arco de luz curvada por cima (lente gravitacional) */}
    <mesh rotation={[0, 0, t * 0.2 * spin]} position={[0, 0, -r * 0.2]}>
      <ringGeometry args={[r * 1.1, r * 1.7, 128, 1]} />
      <meshBasicMaterial map={diskTex()} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} fog={false} />
    </mesh>
  </group>
);

// ---------- Astronauta flutuando (gira em torno do peito, pode esticar) ----------
export const Floating = ({ pose, face, look = ASTRO, position = [0, 0, 0] as V3, rotation = [0, 0, 0] as V3, stretch = 1, scale = 1, red = 0, right, left }: { pose: Pose; face: FaceState; look?: Look; position?: V3; rotation?: V3; stretch?: number; scale?: number; red?: number; right?: ReactNode; left?: ReactNode }) => {
  const sx = scale / Math.sqrt(stretch);
  return (
    <group position={position} rotation={rotation} scale={[sx, scale * stretch, sx]}>
      <group position={[0, -1.05, 0]}>
        <Character pose={pose} face={face} look={look} right={right} left={left} />
      </group>
      {red > 0.001 && (
        <mesh scale={[0.85, 1.35, 0.85]} renderOrder={5}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshBasicMaterial color="#ff1a10" transparent opacity={0.8 * red} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

// ---------- Nave ----------
export const Ship = ({ t, position = [0, 0, 0] as V3, rotation = [0, 0, 0] as V3, scale = 1 }: { t: number; position?: V3; rotation?: V3; scale?: number }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.7, 2.6, 12, 32]} />
      <meshStandardMaterial color="#e9ecf2" roughness={0.4} metalness={0.3} />
    </mesh>
    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.72, 0.72, 0.5, 32]} />
      <meshStandardMaterial color="#d8442f" roughness={0.5} />
    </mesh>
    {[-0.9, 0.9].map((x) => (
      <mesh key={x} position={[x, 0.25, 0.62]}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial color="#9fe3ff" />
      </mesh>
    ))}
    {[1, -1].map((s) => (
      <mesh key={s} position={[-1.5, s * 0.75, 0]} rotation={[0, 0, s * 0.5]}>
        <boxGeometry args={[0.8, 0.12, 0.5]} />
        <meshStandardMaterial color="#d8442f" />
      </mesh>
    ))}
    <sprite position={[-2.4, 0, 0]} scale={[1.6 + 0.2 * Math.sin(t * 20), 1.2, 1]}>
      <spriteMaterial map={glowTex('rgba(120,200,255,0.9)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  </group>
);

// Cabine da nave (amigo olhando pela janela redonda).
export const Cockpit = () => (
  <group>
    <mesh position={[0, -0.05, 0]} receiveShadow>
      <boxGeometry args={[7, 0.1, 6]} />
      <meshStandardMaterial color="#3a4458" roughness={0.7} />
    </mesh>
    {[-3.2, 3.2].map((x) => (
      <mesh key={x} position={[x, 1.8, -1]}>
        <boxGeometry args={[0.3, 3.8, 5]} />
        <meshStandardMaterial color="#2a3346" roughness={0.6} />
      </mesh>
    ))}
    {/* parede com janela redonda: anel grosso + cantos */}
    <mesh position={[0, 1.9, -3]}>
      <torusGeometry args={[1.75, 0.2, 16, 64]} />
      <meshStandardMaterial color="#c9ced8" metalness={0.6} roughness={0.3} />
    </mesh>
    {[[-2.55, 1.9, 1.3, 3.8], [2.55, 1.9, 1.3, 3.8], [0, 3.85, 6.4, 0.5], [0, -0.05, 6.4, 0.3]].map(([x, y, w, h], i) => (
      <mesh key={i} position={[x, y, -3.05]}>
        <boxGeometry args={[w, h, 0.2]} />
        <meshStandardMaterial color="#2a3346" />
      </mesh>
    ))}
    {/* painel de comando */}
    <mesh position={[0, 0.55, -2.3]} rotation={[-0.4, 0, 0]}>
      <boxGeometry args={[3.2, 0.9, 0.5]} />
      <meshStandardMaterial color="#1b2232" />
    </mesh>
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={i} position={[-1.3 + (i % 5) * 0.65, 0.78 - Math.floor(i / 5) * 0.25, -2.0]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.18, 0.1, 0.05]} />
        <meshBasicMaterial color={['#ff4d4d', '#3dff8a', '#ffd23a', '#4dc3ff'][i % 4]} />
      </mesh>
    ))}
    <pointLight position={[0, 2.8, 1]} intensity={6} distance={10} color="#cfe2ff" />
  </group>
);

// ---------- Galáxia em espiral ----------
export const Galaxy = ({ t, position = [0, 0, 0] as V3, r = 30, n = 5000 }: { t: number; position?: V3; r?: number; n?: number }) => {
  const geo = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const arm = i % 2;
      const d = Math.pow(rand(i * 1.7), 0.7) * r;
      const a = arm * Math.PI + d * 0.22 + (rand(i * 4.4) - 0.5) * 0.9;
      const h = (rand(i * 8.8) - 0.5) * (1.4 - d / r) * 1.5;
      pos.set([Math.cos(a) * d, h, Math.sin(a) * d], i * 3);
      const k = d / r;
      col.set([1 - k * 0.4, 0.8 - k * 0.2, 0.6 + k * 0.4], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [n, r]);
  return (
    <group position={position} rotation={[0.45, t * 0.05, 0]}>
      <points geometry={geo}>
        <pointsMaterial size={0.35} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </points>
      <sprite scale={[r * 0.6, r * 0.6, 1]}>
        <spriteMaterial map={glowTex('rgba(255,220,160,0.9)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
    </group>
  );
};

// ---------- Terra ----------
const earthTex = () =>
  canvasTex('earth', 1024, 512, (c) => {
    c.fillStyle = '#2f7fd0';
    c.fillRect(0, 0, 1024, 512);
    c.fillStyle = '#4cae4f';
    for (let i = 0; i < 28; i++) {
      c.beginPath();
      c.ellipse(rand(i) * 1024, 90 + rand(i + 9) * 330, 40 + rand(i + 3) * 90, 25 + rand(i + 5) * 60, rand(i + 1) * 3, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,0.75)';
    for (let i = 0; i < 30; i++) {
      c.beginPath();
      c.ellipse(rand(i + 70) * 1024, rand(i + 80) * 512, 50 + rand(i + 90) * 70, 8 + rand(i + 95) * 10, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.fillRect(0, 0, 1024, 26);
    c.fillRect(0, 486, 1024, 26);
  });

export const Earth = ({ t, position = [0, 0, 0] as V3, r = 2 }: { t: number; position?: V3; r?: number }) => (
  <group position={position}>
    <mesh rotation={[0.3, t * 0.25, 0]}>
      <sphereGeometry args={[r, 64, 48]} />
      <meshStandardMaterial map={earthTex()} roughness={0.7} />
    </mesh>
    <sprite scale={[r * 2.8, r * 2.8, 1]}>
      <spriteMaterial map={glowTex('rgba(120,190,255,0.55)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  </group>
);

// ---------- Horizonte de eventos (anel que você atravessa) ----------
export const HorizonRing = ({ t, position = [0, 0, 0] as V3, r = 2.6, k = 1 }: { t: number; position?: V3; r?: number; k?: number }) => (
  <group position={position} scale={Math.max(0.001, k)}>
    <mesh rotation={[Math.PI / 2, 0, t * 0.8]}>
      <torusGeometry args={[r, 0.06, 12, 96]} />
      <meshBasicMaterial color="#ffb347" />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r * 0.6, r, 96, 1]} />
      <meshBasicMaterial color="#ff8a2a" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  </group>
);

// ---------- Singularidade: ponto de luz com ondas ----------
export const Singularity = ({ t, from, position = [0, 0, 0] as V3, size = 1 }: { t: number; from: number; position?: V3; size?: number }) => {
  const k = seg(t, from - 0.3, from + 0.4);
  return (
    <group position={position} scale={size}>
      <sprite scale={[3 + 3 * k + 0.3 * Math.sin(t * 9), 3 + 3 * k + 0.3 * Math.sin(t * 9), 1]}>
        <spriteMaterial map={glowTex('rgba(255,255,255,1)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
      {Array.from({ length: 4 }, (_, i) => {
        const p = (((t - from) * 0.6 + i / 4) % 1 + 1) % 1;
        return (
          <mesh key={i} scale={0.5 + p * 5}>
            <torusGeometry args={[1, 0.02, 8, 96]} />
            <meshBasicMaterial color="#cfe6ff" transparent opacity={(1 - p) * 0.7 * clamp01(k * 2)} depthWrite={false} fog={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Placas flutuantes e objetos ----------
export const FloatSign = ({ t, at, text, position = [0, 0, 0] as V3, w = 2.2, h = 0.6, bg = '#14182a', fg = '#ffd23a', rotation = [0, 0, 0] as V3 }: { t: number; at: number; text: string; position?: V3; w?: number; h?: number; bg?: string; fg?: string; rotation?: V3 }) => {
  const k = seg(t, at - 6 / 30, at - 1 / 30);
  if (k <= 0) return null;
  const s = 0.3 + 0.7 * k + 0.08 * Math.sin(Math.min(1, k) * Math.PI);
  return (
    <group position={[position[0], position[1] + 0.05 * Math.sin(t * 2), position[2]]} rotation={rotation} scale={s}>
      <mesh>
        <boxGeometry args={[w, h, 0.06]} />
        <meshStandardMaterial color={bg} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[w * 0.98, h * 0.94]} />
        <meshBasicMaterial map={labelTex(text, { bg, fg, border: fg, w: 1024, h: Math.round((1024 * h) / w) })} />
      </mesh>
    </group>
  );
};

// Placa que racha em duas metades e se afasta girando a partir de `at`.
export const BreakingSign = ({ t, at, text, position = [0, 0, 0] as V3, w = 1.8, h = 0.55, fg = '#7fe0ff', appear }: { t: number; at: number; text: string; position?: V3; w?: number; h?: number; fg?: string; appear: number }) => {
  const a = seg(t, appear - 6 / 30, appear - 1 / 30);
  if (a <= 0) return null;
  const b = seg(t, at - 2 / 30, at + 1.2);
  const tex = labelTex(text, { bg: '#10142a', fg, border: fg, w: 1024, h: Math.round((1024 * h) / w) });
  return (
    <group position={position} scale={a}>
      {[-1, 1].map((s) => {
        const half = tex.clone();
        half.needsUpdate = true;
        half.repeat.set(0.5, 1);
        half.offset.set(s < 0 ? 0 : 0.5, 0);
        return (
          <group key={s} position={[s * (w / 4 + b * 0.9), -b * 0.6 * (s > 0 ? 1 : 0.5), 0]} rotation={[0, 0, s * b * 1.4]}>
            <mesh>
              <boxGeometry args={[w / 2, h, 0.05]} />
              <meshStandardMaterial color="#10142a" />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[w / 2 * 0.98, h * 0.94]} />
              <meshBasicMaterial map={half} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const Apple = ({ position = [0, 0, 0] as V3, rotation = [0, 0, 0] as V3, scale = 1 }: { position?: V3; rotation?: V3; scale?: number }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh scale={[1, 0.92, 1]}>
      <sphereGeometry args={[0.25, 24, 18]} />
      <meshStandardMaterial color="#d6262b" roughness={0.35} />
    </mesh>
    <mesh position={[0, 0.27, 0]}>
      <cylinderGeometry args={[0.015, 0.02, 0.12, 6]} />
      <meshStandardMaterial color="#5a3a1e" />
    </mesh>
    <mesh position={[0.08, 0.3, 0]} rotation={[0, 0, -0.8]} scale={[1, 0.4, 0.15]}>
      <sphereGeometry args={[0.08, 10, 8]} />
      <meshStandardMaterial color="#3fa34a" />
    </mesh>
  </group>
);

// Relógio de parede; `time` em segundos de ponteiro (controle a velocidade por fora).
export const Clock = ({ time, position = [0, 0, 0] as V3, rotation = [0, 0, 0] as V3, scale = 1 }: { time: number; position?: V3; rotation?: V3; scale?: number }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 0.08, 48]} />
      <meshStandardMaterial color="#f7f3e8" />
    </mesh>
    <mesh rotation={[0, 0, 0]}>
      <torusGeometry args={[0.5, 0.05, 10, 48]} />
      <meshStandardMaterial color="#c9a14a" metalness={0.6} roughness={0.3} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * 0.4, Math.cos((i / 12) * Math.PI * 2) * 0.4, 0.05]}>
        <boxGeometry args={[0.03, 0.07, 0.01]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>
    ))}
    <group position={[0, 0, 0.06]} rotation={[0, 0, -time * Math.PI * 2 / 60]}>
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.025, 0.36, 0.01]} />
        <meshBasicMaterial color="#d22d2d" />
      </mesh>
    </group>
    <group position={[0, 0, 0.055]} rotation={[0, 0, -time * Math.PI * 2 / 720]}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.045, 0.26, 0.01]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>
    </group>
  </group>
);

// Pedras/poeira sendo puxadas em espiral para o centro a partir de `from`.
export const Debris = ({ t, from, center = [0, 0, 0] as V3, n = 18, r0 = 9, color = '#8a7a6a' }: { t: number; from: number; center?: V3; n?: number; r0?: number; color?: string }) => (
  <group position={center}>
    {Array.from({ length: n }, (_, i) => {
      const life = 1.6 + rand(i) * 1.2;
      const p = ((((t - from) / life + rand(i + 4)) % 1) + 1) % 1;
      const r = r0 * (1 - p * p);
      const a = rand(i + 8) * 6.28 + p * 5;
      return (
        <mesh key={i} position={[Math.cos(a) * r, (rand(i + 2) - 0.5) * 2 * (1 - p), Math.sin(a) * r * 0.5]} rotation={[t * 2 + i, t + i, 0]} scale={(0.12 + rand(i + 6) * 0.2) * (1 - p * 0.7)}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} roughness={0.9} flatShading />
        </mesh>
      );
    })}
  </group>
);

// Raios de luz (pontinhos amarelos) caindo em espiral para dentro.
export const LightFall = ({ t, from, center = [0, 0, 0] as V3, n = 40, r0 = 7 }: { t: number; from: number; center?: V3; n?: number; r0?: number }) => {
  if (t < from - 0.2) return null;
  return (
    <group position={center}>
      {Array.from({ length: n }, (_, i) => {
        const p = ((((t - from) / 1.4 + i / n) % 1) + 1) % 1;
        const r = r0 * (1 - p);
        const a = (i / n) * 6.28 + p * 3;
        return (
          <sprite key={i} position={[Math.cos(a) * r, Math.sin(a) * r * 0.35, Math.sin(a) * r * 0.3]} scale={[0.35 * (1 - p * 0.6), 0.35 * (1 - p * 0.6), 1]}>
            <spriteMaterial map={glowTex('rgba(255,240,150,1)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
          </sprite>
        );
      })}
    </group>
  );
};
