import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { clamp01, rand, seg, V3 } from './anim';
import { Arvore } from './cenarios';
import { glowTex } from './espaco';
import { canvasTex, labelTex } from './textures';

// ============================================================================
// "E se você vivesse em Marte?" — cenários e objetos NOVOS deste episódio.
// Base de lançamento (Terra), foguete vertical, superfície de Marte (dia, noite, pôr do sol azul),
// base marciana com antena, moléculas de CO2, termômetro, régua de pulo, sinal de rádio, passagem.
// ============================================================================

// ---------- céu e névoa ----------
const Ceu = ({ bg, near, far }: { bg: string; near: number; far: number }) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, near, far);
  }, [scene, bg, near, far]);
  return null;
};

const Sombra = ({ pos, power, color }: { pos: V3; power: number; color: string }) => (
  <directionalLight position={pos} intensity={power} color={color} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={12} shadow-camera-bottom={-6} shadow-bias={-0.0004} shadow-normalBias={0.02} />
);

// ---------- Foguete vertical ----------
// Altura total ~9 m (base em y=0). Porta na frente (+z) em y 0.9..3.0, abre girando na dobradiça (porta 0..1).
// chama 0..1 = fogo e fumaça embaixo.
export const Foguete = ({ t, position = [0, 0, 0] as V3, rotation = [0, 0, 0] as V3, scale = 1, porta = 0, chama = 0 }: { t: number; position?: V3; rotation?: V3; scale?: number; porta?: number; chama?: number }) => (
  <group position={position} rotation={rotation} scale={scale}>
    {/* corpo */}
    <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.15, 1.25, 6.4, 40]} />
      <meshStandardMaterial color="#f3f1ec" roughness={0.45} metalness={0.15} />
    </mesh>
    {[1.6, 6.6].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[1.27, 1.27, 0.35, 40]} />
        <meshStandardMaterial color="#e2402f" roughness={0.5} />
      </mesh>
    ))}
    {/* nariz */}
    <mesh position={[0, 8.4, 0]} castShadow>
      <coneGeometry args={[1.15, 2.2, 40]} />
      <meshStandardMaterial color="#e2402f" roughness={0.45} />
    </mesh>
    {/* janela redonda */}
    <mesh position={[0, 5.4, 1.13]}>
      <circleGeometry args={[0.42, 32]} />
      <meshStandardMaterial color="#8fd8ff" emissive="#3a8fd0" emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[0, 5.4, 1.12]}>
      <torusGeometry args={[0.45, 0.07, 10, 32]} />
      <meshStandardMaterial color="#9aa2ad" metalness={0.7} roughness={0.3} />
    </mesh>
    {/* moldura e buraco da porta */}
    <mesh position={[0, 1.95, 1.2]}>
      <planeGeometry args={[1.1, 2.1]} />
      <meshStandardMaterial color="#1a1f2c" />
    </mesh>
    <group position={[-0.55, 1.95, 1.24]} rotation={[0, -porta * 1.9, 0]}>
      <mesh position={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[1.1, 2.1, 0.08]} />
        <meshStandardMaterial color="#d9dde4" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0.95, 0, 0.06]}>
        <boxGeometry args={[0.08, 0.3, 0.06]} />
        <meshStandardMaterial color="#e2402f" />
      </mesh>
    </group>
    {/* aletas */}
    {[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      return (
        <mesh key={i} position={[Math.sin(a) * 1.45, 0.9, Math.cos(a) * 1.45]} rotation={[0, a, 0]} castShadow>
          <boxGeometry args={[0.12, 1.8, 1.0]} />
          <meshStandardMaterial color="#e2402f" roughness={0.5} />
        </mesh>
      );
    })}
    {/* bocal */}
    <mesh position={[0, 0.55, 0]}>
      <cylinderGeometry args={[0.7, 0.95, 0.6, 32]} />
      <meshStandardMaterial color="#3b3f48" metalness={0.6} roughness={0.4} />
    </mesh>
    {chama > 0.01 && (
      <group position={[0, 0.1, 0]} scale={chama}>
        <mesh position={[0, -1.2 - 0.15 * Math.sin(t * 40), 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.75, 2.6 + 0.3 * Math.sin(t * 33), 24]} />
          <meshBasicMaterial color="#ffb13a" transparent opacity={0.9} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.9, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.45, 1.7, 20]} />
          <meshBasicMaterial color="#fff3b0" toneMapped={false} />
        </mesh>
        <sprite position={[0, -1.4, 0]} scale={[4, 4, 1]}>
          <spriteMaterial map={glowTex('rgba(255,160,60,0.9)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
    )}
  </group>
);

// Fumaça da decolagem: nuvens que crescem e se espalham pelo chão a partir de `from`.
export const Fumaca = ({ t, from, position = [0, 0, 0] as V3, cor = '#f2ede6', n = 16 }: { t: number; from: number; position?: V3; cor?: string; n?: number }) => {
  const k = seg(t, from, from + 2.5, (x) => 1 - Math.pow(1 - x, 2));
  if (t < from) return null;
  return (
    <group position={position}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rand(i) * 0.4;
        const r = 0.8 + k * (2.5 + rand(i * 3) * 2.5);
        const s = (0.6 + rand(i * 5) * 0.7) * (0.4 + k * 1.2);
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.4 + rand(i * 7) * 0.8 * k, Math.sin(a) * r]} scale={s}>
            <sphereGeometry args={[0.8, 12, 10]} />
            <meshStandardMaterial color={cor} roughness={1} transparent opacity={0.92} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Base de lançamento na Terra (manhã, céu azul, grama, torre) ----------
export const BaseLancamento = () => (
  <group>
    <Ceu bg="#8fd0ff" near={30} far={90} />
    <hemisphereLight args={['#ffffff', '#5a7a3a', 1.1]} />
    <Sombra pos={[-6, 10, 8]} power={2.4} color="#fff3dc" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#6cbf4a" roughness={0.95} />
    </mesh>
    {/* plataforma de concreto */}
    <mesh position={[0, 0.06, 0]} receiveShadow>
      <cylinderGeometry args={[4.2, 4.4, 0.12, 48]} />
      <meshStandardMaterial color="#c9c6be" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.0, 2.2, 48]} />
      <meshBasicMaterial color="#ffd23a" />
    </mesh>
    {/* torre de serviço (treliça) atrás à esquerda */}
    <group position={[-3.2, 0, -1.8]}>
      {[-0.5, 0.5].map((x) =>
        [-0.5, 0.5].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 5.5, z]} castShadow>
            <boxGeometry args={[0.15, 11, 0.15]} />
            <meshStandardMaterial color="#e2402f" />
          </mesh>
        )),
      )}
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[0, 0.5 + i, 0]}>
          <boxGeometry args={[1.15, 0.1, 1.15]} />
          <meshStandardMaterial color="#c9352a" />
        </mesh>
      ))}
      <mesh position={[1.2, 6.6, 0.6]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.15, 0.4]} />
        <meshStandardMaterial color="#9aa2ad" />
      </mesh>
    </group>
    {/* morros, árvores, prédio de controle */}
    {[[-30, -40, 12], [10, -45, 16], [35, -38, 10], [-12, -50, 18]].map(([x, z, r], i) => (
      <mesh key={i} position={[x, -r * 0.55, z]}>
        <sphereGeometry args={[r, 24, 16]} />
        <meshStandardMaterial color={i % 2 ? '#5aa53e' : '#4f9a37'} roughness={1} />
      </mesh>
    ))}
    {[[-7, 0, -6], [-9, 0, -3], [7.5, 0, -7], [9, 0, -2], [6, 0, 4], [-6.5, 0, 5]].map((p, i) => (
      <Arvore key={i} p={p as V3} s={0.9 + rand(i) * 0.4} />
    ))}
    <mesh position={[7, 1.2, -10]} castShadow>
      <boxGeometry args={[5, 2.4, 3]} />
      <meshStandardMaterial color="#f2efe6" />
    </mesh>
    <mesh position={[7, 2.6, -10]}>
      <cylinderGeometry args={[0.05, 0.05, 1.4, 8]} />
      <meshStandardMaterial color="#555" />
    </mesh>
    {/* nuvens */}
    {[[-10, 14, -30], [6, 17, -35], [18, 13, -28]].map((p, i) => (
      <group key={i} position={p as V3}>
        {[0, 1.6, -1.6, 0.8].map((dx, j) => (
          <mesh key={j} position={[dx, j === 3 ? 0.9 : 0, 0]}>
            <sphereGeometry args={[1.5, 14, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

// ---------- Marte ----------
const solo = (base: string) =>
  canvasTex(`solo|${base}`, 512, 512, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      const v = rand(i * 1.7);
      c.fillStyle = v > 0.5 ? 'rgba(255,190,140,0.18)' : 'rgba(80,25,10,0.18)';
      c.fillRect(rand(i * 3.1) * 512, rand(i * 4.3) * 512, 3 + v * 8, 3 + v * 8);
    }
  }, [12, 12]);

export type HoraMarte = 'dia' | 'noite' | 'porDoSol';
const MARTE = {
  dia: { bg: '#e7a46a', chao: '#c4582e', sol: [-6, 9, 7] as V3, cor: '#ffe2bf', power: 2.5, ceu: '#ffd9b0', fill: 1.0 },
  noite: { bg: '#0d1330', chao: '#5a3340', sol: [4, 8, 5] as V3, cor: '#9fb4ff', power: 0.9, ceu: '#6f86d8', fill: 0.55 },
  porDoSol: { bg: '#5e4658', chao: '#9a4a32', sol: [0, 4, -20] as V3, cor: '#9fd4ff', power: 1.8, ceu: '#9fc4ff', fill: 0.95 },
};

const Pedras = ({ n = 40, area = 30, cor = '#8a3a1e', seed = 0 }: { n?: number; area?: number; cor?: string; seed?: number }) => {
  const geo = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const x = (rand(i * 2.1 + seed) - 0.5) * area;
        const z = -rand(i * 3.7 + seed) * area + 4;
        if (Math.abs(x) < 2.2 && z > -3) return null; // deixa o centro livre para o personagem
        const s = 0.15 + rand(i * 5.3 + seed) * 0.7;
        return (
          <mesh key={i} geometry={geo} position={[x, s * 0.4, z]} scale={[s, s * 0.7, s]} rotation={[rand(i) * 3, rand(i + 1) * 3, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={cor} roughness={1} flatShading />
          </mesh>
        );
      })}
    </>
  );
};

const Cratera = ({ p, r }: { p: V3; r: number }) => (
  <group position={p}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <circleGeometry args={[r, 32]} />
      <meshStandardMaterial color="#9c4322" roughness={1} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
      <torusGeometry args={[r, r * 0.12, 8, 32]} />
      <meshStandardMaterial color="#d2683a" roughness={1} />
    </mesh>
  </group>
);

// Superfície de Marte. hora: 'dia' (céu caramelo), 'noite' (azul-escuro com gelo e estrelas), 'porDoSol' (sol pequeno com brilho azul).
export const SoloMarte = ({ t = 0, hora = 'dia' as HoraMarte, terraNoCeu = false }: { t?: number; hora?: HoraMarte; terraNoCeu?: boolean }) => {
  const c = MARTE[hora];
  return (
    <group>
      <Ceu bg={c.bg} near={hora === 'noite' ? 25 : 22} far={hora === 'noite' ? 90 : 70} />
      <hemisphereLight args={[c.ceu, '#5a2a18', c.fill]} />
      <Sombra pos={c.sol} power={c.power} color={c.cor} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial map={solo(c.chao)} roughness={1} />
      </mesh>
      <Cratera p={[-5, 0, -6]} r={1.6} />
      <Cratera p={[5.5, 0, -9]} r={2.4} />
      <Cratera p={[3.5, 0, 3]} r={0.9} />
      <Pedras cor={hora === 'noite' ? '#4a2a35' : '#8a3a1e'} />
      {/* montanhas e um vulcão gigante ao fundo */}
      {[[-28, -45, 9, 14], [-8, -55, 7, 10], [20, -48, 10, 16]].map(([x, z, h, r], i) => (
        <mesh key={i} position={[x, h / 2, z]}>
          <coneGeometry args={[r, h, 7]} />
          <meshStandardMaterial color={hora === 'noite' ? '#2a1d33' : '#b25a34'} roughness={1} flatShading />
        </mesh>
      ))}
      <mesh position={[6, 5, -70]}>
        <cylinderGeometry args={[10, 34, 10, 24]} />
        <meshStandardMaterial color={hora === 'noite' ? '#22192e' : '#a8532f'} roughness={1} />
      </mesh>
      {hora === 'noite' && (
        <>
          {/* geada nas pedras e estrelas */}
          {Array.from({ length: 60 }, (_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(rand(i * 9) - 0.5) * 30, 0.03, -rand(i * 11) * 30 + 4]}>
              <circleGeometry args={[0.2 + rand(i) * 0.5, 10]} />
              <meshBasicMaterial color="#cfe0ff" transparent opacity={0.55} />
            </mesh>
          ))}
          {Array.from({ length: 220 }, (_, i) => (
            <mesh key={`s${i}`} position={[(rand(i * 1.3) - 0.5) * 140, 8 + rand(i * 2.9) * 50, -60 - rand(i * 4.1) * 10]}>
              <sphereGeometry args={[0.08 + rand(i) * 0.08, 6, 4]} />
              <meshBasicMaterial color="#ffffff" fog={false} />
            </mesh>
          ))}
        </>
      )}
      {hora === 'porDoSol' && (
        <>
          <mesh position={[0, 4.2, -60]}>
            <sphereGeometry args={[1.6, 24, 16]} />
            <meshBasicMaterial color="#f2fbff" fog={false} toneMapped={false} />
          </mesh>
          <sprite position={[0, 4.2, -59]} scale={[46 * (1 + 0.02 * Math.sin(t * 2)), 34, 1]}>
            <spriteMaterial map={glowTex('rgba(90,170,255,0.95)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
          </sprite>
        </>
      )}
      {terraNoCeu && (
        <sprite position={[-6, 14, -50]} scale={[1.6, 1.6, 1]}>
          <spriteMaterial map={glowTex('rgba(120,190,255,1)')} transparent depthWrite={false} fog={false} />
        </sprite>
      )}
    </group>
  );
};

// Poeira vermelha levantando (pouso, pulo).
export const PoeiraMarte = ({ t, at, position = [0, 0, 0] as V3, n = 14, raio = 2 }: { t: number; at: number; position?: V3; n?: number; raio?: number }) => {
  const k = seg(t, at, at + 1.4);
  if (k <= 0 || k >= 1) return null;
  return (
    <group position={position}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const r = raio * (0.3 + k * (0.8 + rand(i) * 0.6));
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.2 + k * 0.6 * rand(i * 3), Math.sin(a) * r]} scale={(0.3 + rand(i * 5) * 0.4) * Math.sin(k * Math.PI) + 0.01}>
            <sphereGeometry args={[0.8, 10, 8]} />
            <meshStandardMaterial color="#d9875a" transparent opacity={0.8 * (1 - k)} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Planeta Marte visto do espaço ----------
const marteTex = () =>
  canvasTex('marte-planeta', 1024, 512, (c) => {
    c.fillStyle = '#c8562c';
    c.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 40; i++) {
      c.fillStyle = i % 2 ? 'rgba(120,40,20,0.45)' : 'rgba(240,150,90,0.35)';
      c.beginPath();
      c.ellipse(rand(i * 2) * 1024, 60 + rand(i * 3) * 390, 30 + rand(i * 4) * 110, 14 + rand(i * 5) * 50, rand(i) * 3, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.fillRect(0, 0, 1024, 22);
    c.fillRect(0, 494, 1024, 18);
  });

export const PlanetaMarte = ({ t, position = [0, 0, 0] as V3, r = 2 }: { t: number; position?: V3; r?: number }) => (
  <group position={position}>
    <mesh rotation={[0.25, t * 0.2, 0]}>
      <sphereGeometry args={[r, 64, 48]} />
      <meshStandardMaterial map={marteTex()} roughness={0.9} />
    </mesh>
    <sprite scale={[r * 2.7, r * 2.7, 1]}>
      <spriteMaterial map={glowTex('rgba(255,140,90,0.45)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  </group>
);

// ---------- Base marciana (domo + antena parabólica) ----------
export const BaseMarte = ({ t, position = [0, 0, 0] as V3, antena = 0 }: { t: number; position?: V3; antena?: number }) => (
  <group position={position}>
    <mesh position={[0, 0, 0]} castShadow>
      <sphereGeometry args={[2.4, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#eef2f6" roughness={0.4} metalness={0.2} />
    </mesh>
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} position={[Math.sin((i / 6) * Math.PI * 2) * 1.75, 1.45, Math.cos((i / 6) * Math.PI * 2) * 1.75]}>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color="#8fd8ff" emissive="#4aa8e0" emissiveIntensity={0.6} />
      </mesh>
    ))}
    <group position={[2.8, 0, -0.6]}>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 2.6, 10]} />
        <meshStandardMaterial color="#9aa2ad" metalness={0.6} />
      </mesh>
      <group position={[0, 2.7, 0]} rotation={[-0.6, 0.4 + 0.3 * Math.sin(t * 0.8), 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.9, 24, 12, 0, Math.PI * 2, 0, 0.9]} />
          <meshStandardMaterial color="#f4f4f2" side={THREE.DoubleSide} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.5]}>
          <sphereGeometry args={[0.1 + 0.05 * antena, 10, 8]} />
          <meshBasicMaterial color={antena > 0 ? '#ff4d4d' : '#666'} toneMapped={false} />
        </mesh>
      </group>
    </group>
  </group>
);

// ---------- Objetos de informação ----------
// Molécula de CO2 (O=C=O): bolinha preta no meio, duas vermelhas nas pontas.
export const CO2 = ({ position = [0, 0, 0] as V3, rotation = [0, 0, 0] as V3, scale = 1 }: { position?: V3; rotation?: V3; scale?: number }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh>
      <sphereGeometry args={[0.2, 16, 12]} />
      <meshStandardMaterial color="#2a2a30" roughness={0.4} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.32, 0, 0]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshStandardMaterial color="#e2402f" roughness={0.4} />
      </mesh>
    ))}
  </group>
);

// Nuvem de moléculas flutuando em volta de um centro, aparecendo a partir de `from`.
export const NuvemCO2 = ({ t, from, centro = [0, 1.5, 0] as V3, n = 14, raio = 1.7 }: { t: number; from: number; centro?: V3; n?: number; raio?: number }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const k = seg(t, from + i * 0.05, from + i * 0.05 + 0.3);
      if (k <= 0) return null;
      const a = (i / n) * Math.PI * 2 + t * 0.4;
      const y = centro[1] + (rand(i * 3) - 0.5) * 2.4 + 0.1 * Math.sin(t * 1.5 + i);
      return <CO2 key={i} position={[centro[0] + Math.cos(a) * raio, y, centro[2] + Math.sin(a) * raio * 0.6]} rotation={[0, a * 2, rand(i) * 3 + t]} scale={0.8 * k} />;
    })}
  </>
);

// Termômetro: coluna vermelha desce de `de` até `para` graus e trava em `at`.
export const Termometro = ({ t, from, at, de = 20, para = -80, position = [0, 0, 0] as V3, scale = 1 }: { t: number; from: number; at: number; de?: number; para?: number; position?: V3; scale?: number }) => {
  const k = seg(t, from, at - 1 / 30);
  const v = Math.round(de + (para - de) * k);
  const frac = clamp01((v + 100) / 140);
  return (
    <group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[0.7, 2.6, 0.12]} />
        <meshStandardMaterial color="#f4f2ec" />
      </mesh>
      <mesh position={[0, -0.1, 0.07]}>
        <boxGeometry args={[0.16, 2.0, 0.02]} />
        <meshBasicMaterial color="#cfd6de" />
      </mesh>
      <mesh position={[0, -1.1 + frac, 0.08]}>
        <boxGeometry args={[0.12, 2 * frac + 0.01, 0.02]} />
        <meshBasicMaterial color={v < 0 ? '#3a8fff' : '#e2402f'} toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.15, 0.08]}>
        <circleGeometry args={[0.17, 20]} />
        <meshBasicMaterial color={v < 0 ? '#3a8fff' : '#e2402f'} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <planeGeometry args={[1.5, 0.45]} />
        <meshBasicMaterial map={labelTex(`${v}°C`, { w: 512, h: 154, bg: '#14182a', fg: v < 0 ? '#9fd0ff' : '#ffd23a', radius: 12 })} />
      </mesh>
    </group>
  );
};

// Régua de pulo: poste com duas marcas — TERRA (baixa) e MARTE (3x mais alta).
export const ReguaPulo = ({ t, at, position = [0, 0, 0] as V3, h1 = 0.6, h3 = 1.8 }: { t: number; at: number; position?: V3; h1?: number; h3?: number }) => {
  const k = seg(t, at - 0.3, at - 1 / 30);
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.12, 3.2, 0.12]} />
        <meshStandardMaterial color="#f4f2ec" />
      </mesh>
      {[
        [h1, 'TERRA', '#3aa0ff', 1],
        [h3, 'MARTE 3X', '#ff6a3d', k],
      ].map(([h, txt, cor, s], i) => (
        <group key={i} position={[-0.75, (h as number) + 1.0, 0]} scale={Math.max(0.001, s as number)}>
          <mesh position={[0.55, 0, 0]}>
            <boxGeometry args={[0.6, 0.05, 0.05]} />
            <meshBasicMaterial color={cor as string} />
          </mesh>
          <mesh position={[-0.35, 0, 0]}>
            <planeGeometry args={[1.2, 0.32]} />
            <meshBasicMaterial map={labelTex(txt as string, { w: 512, h: 136, bg: '#14182a', fg: cor as string, radius: 10 })} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Ondas de rádio indo de `de` até `para`, de `from` até `at` (a última chega na palavra).
export const Sinal = ({ t, from, at, de, para, cor = '#7fe0ff' }: { t: number; from: number; at: number; de: V3; para: V3; cor?: string }) => (
  <>
    {[0, 1, 2].map((i) => {
      const k = seg(t, from + i * 0.35, at + i * 0.35, (x) => x);
      if (k <= 0 || k >= 1) return null;
      const p: V3 = [de[0] + (para[0] - de[0]) * k, de[1] + (para[1] - de[1]) * k, de[2] + (para[2] - de[2]) * k];
      return (
        <group key={i} position={p}>
          <sprite scale={[0.7, 0.7, 1]}>
            <spriteMaterial map={glowTex('rgba(140,230,255,1)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
          </sprite>
          <mesh>
            <torusGeometry args={[0.35, 0.03, 8, 32]} />
            <meshBasicMaterial color={cor} toneMapped={false} />
          </mesh>
        </group>
      );
    })}
  </>
);

// Passagem (bilhete) na mão: "PASSAGEM: MARTE".
export const Passagem = ({ position = [0, 0, 0] as V3, rotation = [0, 0, 0] as V3, scale = 1 }: { position?: V3; rotation?: V3; scale?: number }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh>
      <boxGeometry args={[0.9, 0.45, 0.02]} />
      <meshStandardMaterial color="#ffd23a" />
    </mesh>
    <mesh position={[0, 0, 0.012]}>
      <planeGeometry args={[0.86, 0.41]} />
      <meshBasicMaterial map={labelTex('PASSAGEM: MARTE', { w: 1024, h: 490, bg: '#ffd23a', fg: '#7a2a12', border: '#7a2a12', radius: 18 })} />
    </mesh>
  </group>
);

// Telefone/rádio de mão.
export const Radio = (g: { position?: V3; rotation?: V3 }) => (
  <group {...g}>
    <mesh>
      <boxGeometry args={[0.16, 0.3, 0.08]} />
      <meshStandardMaterial color="#2a2f3a" />
    </mesh>
    <mesh position={[0.05, 0.22, 0]}>
      <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    <mesh position={[0, 0.03, 0.045]}>
      <planeGeometry args={[0.11, 0.1]} />
      <meshBasicMaterial color="#3dff8a" toneMapped={false} />
    </mesh>
  </group>
);
