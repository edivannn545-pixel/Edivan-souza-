import { useMemo } from 'react';
import * as THREE from 'three';
import { rand, V3 } from './anim';
import { Look } from './Character';
import { ELENCO, Membro } from './personagens';
import { Sign } from './props';
import { Box, WarmLights } from './sets';
import { canvasTex, cobbleTex, FONT, tileTex } from './textures';

// ============================================================================
// "A batata na França de 1780" — elenco, cenários e objetos desta história.
// ============================================================================

type G = { position?: V3; rotation?: V3; scale?: number | V3 };

// ---------- Elenco ----------
const MAO = '#1e1f24';
export const ELENCO_BATATAS = {
  voce: {
    nome: 'Você', papel: 'o aldeão de 1780', rosto: 'curious',
    look: { ...ELENCO.voce.look, hat: 'boina', hatColor: '#2a2a40', jacket: '#f4f4f2', pattern: 'listras', pattern2: '#2f4f8f', patternH: true, pants: '#5a3e26', scarf: '#c0302e' } as Look,
  },
  agronomo: {
    nome: 'O agrônomo', papel: 'o homem da batata', rosto: 'starstruck',
    look: { skin: '#f0dccb', jacket: '#3f7a4a', pants: '#e8dcc0', shoes: '#2a2a2a', gloves: MAO, hair: '#eeeeee', hairStyle: 'liso', vest: '#e8dcc0', scarf: '#ffffff', eyewear: 'grau', body: 'magro' } as Look,
  },
  rei: {
    nome: 'O rei', papel: 'o rei da França', rosto: 'smug',
    look: { skin: '#f0dccb', jacket: '#2b56a8', pants: '#2b56a8', shoes: '#c9a14a', gloves: '#f4f4f2', hair: '#e6e6e6', hairStyle: 'liso', hat: 'coroa', hatColor: '#c8102e', skirt: { color: '#c8102e', long: true }, scarf: '#e8b931', body: 'forte' } as Look,
  },
  guarda1: {
    nome: 'Guarda', papel: 'guarda do campo', rosto: 'confident',
    look: { skin: '#6e4329', jacket: '#2b4a8f', pants: '#f4f4f2', shoes: '#111', gloves: '#f4f4f2', hair: '#120c08', hat: 'bicorne', hatColor: '#1b1b1f', vest: '#f4f4f2', beard: 'bigode' } as Look,
  },
  guarda2: {
    nome: 'Guarda', papel: 'guarda do campo', rosto: 'suspicious',
    look: { skin: '#d9a57c', jacket: '#2b4a8f', pants: '#f4f4f2', shoes: '#111', gloves: '#f4f4f2', hair: '#3a2416', hat: 'bicorne', hatColor: '#1b1b1f', vest: '#f4f4f2', body: 'forte' } as Look,
  },
  aldea: {
    nome: 'Paula', papel: 'a vizinha (aldeã)', rosto: 'worried',
    look: { ...ELENCO.paula.look, jacket: '#c8964a', skirt: { color: '#6b4426', long: true }, apron: '#f4f0e6', hat: 'touca', hatColor: '#f4f0e6' } as Look,
  },
  aldeao: {
    nome: 'Seu Bento', papel: 'o aldeão idoso', rosto: 'suspicious',
    look: { ...ELENCO.bento.look, jacket: '#8a5a32', vest: '#5a3e26', hat: 'boina', hatColor: '#4a3a2a', hairStyle: 'curto' } as Look,
  },
  menino: {
    nome: 'Pedrinho', papel: 'o filho', rosto: 'bigSmile',
    look: { ...ELENCO.pedrinho.look, jacket: '#c8964a', pants: '#5a3e26', hat: 'boina', hatColor: '#6b4426', shorts: true } as Look,
  },
  nobre: {
    nome: 'Nobre da corte', papel: 'o apoio da corte', rosto: 'smug',
    look: { skin: '#f0dccb', jacket: '#6b2a5a', pants: '#1f2228', shoes: '#111', gloves: '#f4f4f2', hair: '#d9b56a', hairStyle: 'liso', hat: 'cartola', hatColor: '#1b1b1f', scarf: '#ffffff', eyewear: 'grau', body: 'magro' } as Look,
  },
} satisfies Record<string, Membro>;

// ---------- objetos ----------
const potatoMat = () => new THREE.MeshStandardMaterial({ color: '#c8964a', roughness: 0.9 });
export const Potato = ({ big = false, ...g }: G & { big?: boolean }) => (
  <group {...g}>
    <mesh scale={[1.25, 0.85, 0.95]} castShadow>
      <sphereGeometry args={[0.12, 16, 12]} />
      <meshStandardMaterial color="#c8964a" roughness={0.9} />
    </mesh>
    {big &&
      [[0.05, 0.05, 0.1], [-0.07, 0.02, 0.1], [0.02, -0.05, 0.11]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshStandardMaterial color="#7a5226" />
        </mesh>
      ))}
  </group>
);

// Monte de batatas (muitas numa malha só).
export const PotatoPile = ({ n = 30, r = 0.5, ...g }: G & { n?: number; r?: number }) => {
  const geo = useMemo(() => new THREE.SphereGeometry(0.12, 12, 10).scale(1.25, 0.85, 0.95), []);
  const mat = useMemo(potatoMat, []);
  const items = useMemo(() => Array.from({ length: n }, (_, i) => {
    const a = i * 2.4;
    const rr = r * Math.sqrt(rand(i));
    const h = (1 - rr / r) * r * 0.7;
    return [Math.cos(a) * rr, 0.08 + h * rand(i + 5), Math.sin(a) * rr] as V3;
  }), [n, r]);
  return (
    <group {...g}>
      <Field3 items={items} geo={geo} mat={mat} />
    </group>
  );
};
const Field3 = ({ items, geo, mat }: { items: V3[]; geo: THREE.BufferGeometry; mat: THREE.Material }) => (
  <>
    {items.map((p, i) => (
      <mesh key={i} geometry={geo} material={mat} position={p} rotation={[rand(i) * 3, rand(i + 1) * 3, 0]} castShadow />
    ))}
  </>
);

// Saco de batatas.
export const Sack = (g: G) => (
  <group {...g}>
    <mesh position={[0, 0.3, 0]} scale={[1, 1.2, 1]} castShadow>
      <sphereGeometry args={[0.28, 16, 12]} />
      <meshStandardMaterial color="#c8a878" roughness={1} />
    </mesh>
    <mesh position={[0, 0.66, 0]}>
      <cylinderGeometry args={[0.06, 0.12, 0.12, 10]} />
      <meshStandardMaterial color="#a88858" />
    </mesh>
  </group>
);

// Carroça com batatas.
export const Cart = (g: G) => (
  <group {...g}>
    <Box p={[0, 0.65, 0]} s={[1.6, 0.35, 1]} c="#8a5a32" />
    <Box p={[1.3, 0.55, 0]} s={[1.2, 0.06, 0.06]} c="#6b4426" />
    {[-1, 1].map((s) => (
      <group key={s}>
        <mesh position={[-0.2, 0.42, s * 0.56]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 20]} />
          <meshStandardMaterial color="#5a3a22" />
        </mesh>
        <mesh position={[-0.2, 0.42, s * 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.04, 8, 24]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
      </group>
    ))}
    <PotatoPile n={26} r={0.55} position={[0, 0.82, 0]} scale={[1.3, 1, 0.8]} />
  </group>
);

// Lança de guarda (para a mão: o eixo -Y continua o antebraço).
export const Spear = (g: G) => (
  <group {...g}>
    <mesh position={[0, -0.2, 0]}>
      <cylinderGeometry args={[0.018, 0.018, 2.4, 8]} />
      <meshStandardMaterial color="#6b4426" />
    </mesh>
    <mesh position={[0, 1.08, 0]}>
      <coneGeometry args={[0.05, 0.22, 8]} />
      <meshStandardMaterial color="#c8ccd4" metalness={0.8} roughness={0.25} />
    </mesh>
    <mesh position={[0, 0.9, 0]}>
      <sphereGeometry args={[0.06, 10, 8]} />
      <meshStandardMaterial color="#c8102e" />
    </mesh>
  </group>
);

// Placa de madeira pendurada com o ano.
export const HangingSign = ({ text = '1780', ...g }: G & { text?: string }) => (
  <group {...g}>
    <Box p={[0, 0.55, 0]} s={[1.4, 0.06, 0.06]} c="#5a3a22" />
    {[-0.45, 0.45].map((x) => <Box key={x} p={[x, 0.42, 0]} s={[0.02, 0.26, 0.02]} c="#3a2a1a" />)}
    <Sign text={text} w={1.1} h={0.55} position={[0, 0.0, 0]} bg="#c8a06a" fg="#5a2e18" border="#6b4426" />
  </group>
);

// ---------- textura de flor-de-lis (desenho simples) ----------
const lisTex = () =>
  canvasTex('lis', 256, 256, (c) => {
    c.fillStyle = '#2b4a9f';
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = '#e8b931';
    const lis = (x: number, y: number, s: number) => {
      c.beginPath();
      c.ellipse(x, y - 14 * s, 7 * s, 18 * s, 0, 0, Math.PI * 2);
      c.ellipse(x - 13 * s, y - 2 * s, 6 * s, 14 * s, -0.7, 0, Math.PI * 2);
      c.ellipse(x + 13 * s, y - 2 * s, 6 * s, 14 * s, 0.7, 0, Math.PI * 2);
      c.fill();
      c.fillRect(x - 14 * s, y + 6 * s, 28 * s, 5 * s);
    };
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) lis(64 + i * 128, 70 + j * 128, 1.2);
  }, [8, 4]);

// ---------- casa enxaimel ----------
const timberTex = (base: string) =>
  canvasTex(`enxaimel|${base}`, 512, 512, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 512, 512);
    c.fillStyle = '#5a3a22';
    for (const x of [0, 160, 330, 496]) c.fillRect(x, 0, 18, 512);
    for (const y of [0, 250, 494]) c.fillRect(0, y, 512, 18);
    c.lineWidth = 16;
    c.strokeStyle = '#5a3a22';
    c.beginPath();
    c.moveTo(18, 250);
    c.lineTo(160, 18);
    c.moveTo(330, 18);
    c.lineTo(496, 250);
    c.stroke();
  });
export const TimberHouse = ({ w = 3, h = 4.2, cor = '#f2dcb0', telhado = '#a8442a', porta = '#3a6a4a', ...g }: G & { w?: number; h?: number; cor?: string; telhado?: string; porta?: string }) => (
  <group {...g}>
    <Box p={[0, h / 2, 0]} s={[w, h, 2.2]} c={cor} map={timberTex(cor)} />
    <mesh position={[0, h + 0.55, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
      <boxGeometry args={[w * 0.72, w * 0.72, 2.5]} />
      <meshStandardMaterial color={telhado} roughness={0.8} />
    </mesh>
    <Box p={[0, 0.85, 1.11]} s={[0.8, 1.7, 0.04]} c={porta} />
    {[-0.9, 0.9].map((x) => (
      <group key={x}>
        <Box p={[x, h * 0.66, 1.11]} s={[0.6, 0.6, 0.04]} c="#9fd0f0" />
        <Box p={[x - 0.42, h * 0.66, 1.12]} s={[0.22, 0.66, 0.03]} c="#3a5a9a" />
        <Box p={[x + 0.42, h * 0.66, 1.12]} s={[0.22, 0.66, 0.03]} c="#3a5a9a" />
      </group>
    ))}
  </group>
);

// ---------- A. Vila francesa de 1780 ----------
export const Vila = ({ t = 0, noite = false, ano = true }: { t?: number; noite?: boolean; ano?: boolean }) => (
  <group>
    <WarmLights sun={[-5, 8, 6]} bg={noite ? '#2a2448' : '#f2c88c'} sky="#fff2dc" ground="#7a5a3a" fill={noite ? 0.7 : 1.05} power={noite ? 0.6 : 2.0} fog={[14, 40]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial map={cobbleTex()} roughness={0.95} />
    </mesh>
    <TimberHouse position={[-3.2, 0, -4.5]} cor="#f2dcb0" />
    <TimberHouse position={[0, 0, -5]} w={3.2} h={4.8} cor="#f4e6c8" telhado="#8a3a24" porta="#6b4426" />
    <TimberHouse position={[3.3, 0, -4.6]} cor="#ecd2a8" porta="#2f5a8a" />
    <TimberHouse position={[-6.6, 0, -5.2]} cor="#f4e6c8" />
    <TimberHouse position={[6.7, 0, -5]} cor="#f2dcb0" telhado="#8a3a24" />
    {ano && <HangingSign position={[-1.6, 2.9, -3.7]} />}
    <Cart position={[1.6, 0, -2.2]} rotation={[0, -0.4, 0]} />
    <Sack position={[-1.9, 0, -2.6]} />
    <Sack position={[-2.4, 0, -2.3]} rotation={[0, 1, 0]} />
    {/* poço */}
    <group position={[-3.4, 0, -1.6]}>
      <mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.6, 0.6, 0.8, 20, 1, true]} /><meshStandardMaterial map={tileTex('#9a9aa2', '#8a8a92', 6)} side={THREE.DoubleSide} /></mesh>
      <Box p={[-0.55, 1.2, 0]} s={[0.08, 1.6, 0.08]} c="#5a3a22" />
      <Box p={[0.55, 1.2, 0]} s={[0.08, 1.6, 0.08]} c="#5a3a22" />
      <Box p={[0, 2.0, 0]} s={[1.4, 0.1, 0.9]} c="#8a3a24" />
    </group>
    {noite && <mesh position={[4, 9, -20]}><sphereGeometry args={[1, 20, 14]} /><meshBasicMaterial color="#f4f0d8" toneMapped={false} /></mesh>}
    {void t}
  </group>
);

// ---------- B. Casa camponesa por dentro ----------
export const CasaCamponesa = ({ t = 0, farta = false }: { t?: number; farta?: boolean }) => (
  <group>
    <WarmLights sun={[-3, 7, 6]} bg="#5a3a2a" sky="#ffe0b0" ground="#4a3020" fill={1.0} power={1.6} fog={[10, 28]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial map={tileTex('#8a6a4a', '#7a5a3a', 14)} /></mesh>
    <mesh position={[0, 3, -2.8]}><planeGeometry args={[16, 6]} /><meshStandardMaterial map={timberTex('#e8d2a8')} /></mesh>
    {/* lareira */}
    <group position={[2.2, 0, -2.5]}>
      <Box p={[0, 1.0, 0]} s={[1.8, 2, 0.6]} c="#8a8a92" map={tileTex('#9a9aa2', '#7a7a82', 5)} />
      <Box p={[0, 0.55, 0.31]} s={[1.0, 0.9, 0.02]} c="#1a1210" />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 0.18, 0.35 + 0.08 * Math.sin(t * 8 + i), 0.33]}>
          <coneGeometry args={[0.1, 0.4 + 0.1 * Math.sin(t * 6 + i * 2), 8]} />
          <meshBasicMaterial color={i % 2 ? '#ffd23a' : '#ff6a1a'} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, 0.6, 0.8]} color="#ffa040" intensity={5} distance={5} decay={1.4} />
    </group>
    {/* mesa */}
    <Box p={[-0.4, 0.75, -0.6]} s={[2.2, 0.08, 1.1]} c="#9a6a3a" />
    {[[-1.4, -1.05], [0.6, -1.05], [-1.4, -0.15], [0.6, -0.15]].map(([x, z], i) => <Box key={i} p={[x, 0.37, z]} s={[0.08, 0.74, 0.08]} c="#6b4426" />)}
    {[-1.0, -0.4, 0.2].map((x) => (
      <group key={x} position={[x, 0.8, -0.5]}>
        <mesh><cylinderGeometry args={[0.18, 0.12, 0.1, 16, 1, true]} /><meshStandardMaterial color="#c8a878" side={THREE.DoubleSide} /></mesh>
        {farta && <PotatoPile n={6} r={0.12} position={[0, 0.0, 0]} />}
      </group>
    ))}
    {farta && <PotatoPile n={22} r={0.35} position={[-0.4, 0.8, -0.85]} />}
    <Box p={[-2.6, 2.0, -2.75]} s={[1.0, 0.8, 0.04]} c="#9fd0f0" />
  </group>
);

// ---------- C/E. Campo de batatas (dia / noite) ----------
export const CampoBatatas = ({ t = 0, noite = false, cresce = 1 }: { t?: number; noite?: boolean; cresce?: number }) => {
  const geo = useMemo(() => new THREE.SphereGeometry(0.22, 10, 8).scale(1, 0.6, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4f9a3c', roughness: 0.9 }), []);
  const plants = useMemo(() => {
    const o: V3[] = [];
    for (let r = 0; r < 9; r++) for (let i = 0; i < 16; i++) o.push([-4.2 + i * 0.56, 0.12, -1.0 - r * 0.8]);
    return o;
  }, []);
  return (
    <group>
      <WarmLights sun={noite ? [3, 6, -4] : [-5, 8, 6]} bg={noite ? '#2a2650' : '#f8c890'} sky={noite ? '#9090ff' : '#fff0d8'} ground={noite ? '#20203a' : '#6a7a3a'} fill={noite ? 0.75 : 1.05} power={noite ? 0.5 : 2.0} fog={[12, 36]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial map={tileTex('#6fae4a', '#64a244', 30)} /></mesh>
      <Box p={[0, 0.02, -4.2]} s={[9.4, 0.04, 7.4]} c="#7a5230" />
      {Array.from({ length: 9 }, (_, r) => <Box key={r} p={[0, 0.07, -1.0 - r * 0.8]} s={[9, 0.08, 0.35]} c="#6b4426" />)}
      <group scale={[1, Math.max(0.001, cresce), 1]}><Field3 items={plants} geo={geo} mat={mat} /></group>
      {/* cerca */}
      {Array.from({ length: 17 }, (_, i) => <Box key={i} p={[-4.8 + i * 0.6, 0.5, -0.3]} s={[0.1, 1.0, 0.1]} c="#8a5a32" />)}
      <Box p={[0, 0.75, -0.3]} s={[9.8, 0.08, 0.06]} c="#8a5a32" />
      <Box p={[0, 0.4, -0.3]} s={[9.8, 0.08, 0.06]} c="#8a5a32" />
      {/* colinas e árvores */}
      {[[-8, -16, 5], [3, -20, 7], [12, -15, 5]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, -r * 0.6, z]} scale={[2, 1, 1]}><sphereGeometry args={[r, 20, 14]} /><meshStandardMaterial color={noite ? '#3a3a6a' : '#8aa85a'} /></mesh>
      ))}
      {[[-5.6, -3], [5.6, -4], [-3, -9.5], [4, -10]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.12, 0.16, 1.6, 8]} /><meshStandardMaterial color="#6b4a2e" /></mesh>
          <mesh position={[0, 2.0, 0]}><sphereGeometry args={[0.8, 14, 10]} /><meshStandardMaterial color={noite ? '#2a5a4a' : '#4f8d3c'} /></mesh>
        </group>
      ))}
      {/* lanternas */}
      {[-4.8, 4.8].map((x) => (
        <group key={x} position={[x, 0, -0.3]}>
          <Box p={[0, 1.1, 0]} s={[0.08, 2.2, 0.08]} c="#3a2a1a" />
          <mesh position={[0, 2.3, 0]}><boxGeometry args={[0.22, 0.3, 0.22]} /><meshBasicMaterial color={noite ? '#ffd27a' : '#f4e6c0'} toneMapped={false} /></mesh>
          {noite && <pointLight position={[0, 2.3, 0.3]} color="#ffb860" intensity={3} distance={4} decay={1.4} />}
        </group>
      ))}
      {noite && <mesh position={[-4, 8, -22]}><sphereGeometry args={[1.1, 20, 14]} /><meshBasicMaterial color="#f4f0d8" toneMapped={false} /></mesh>}
      {void t}
    </group>
  );
};

// ---------- D. Sala do trono ----------
export const SalaDoTrono = () => (
  <group>
    <WarmLights sun={[-3, 7, 6]} bg="#2b3a7a" sky="#fff2dc" ground="#5a2a2a" fill={1.05} power={1.7} fog={[12, 34]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial map={tileTex('#f4f0e6', '#d8d2c6', 16)} /></mesh>
    <mesh position={[0, 3.5, -4]}><planeGeometry args={[16, 7]} /><meshStandardMaterial map={lisTex()} /></mesh>
    {/* tapete vermelho */}
    <Box p={[0, 0.01, -1]} s={[1.6, 0.02, 7]} c="#b8102e" />
    {/* degraus */}
    <Box p={[0, 0.12, -3.2]} s={[3.2, 0.24, 1.4]} c="#2b4a9f" />
    <Box p={[0, 0.36, -3.4]} s={[2.4, 0.24, 1.0]} c="#2b4a9f" />
    {/* trono */}
    <group position={[0, 0.48, -3.45]}>
      <Box p={[0, 0.35, 0]} s={[1.1, 0.12, 0.8]} c="#c8102e" />
      <Box p={[0, 1.2, -0.35]} s={[1.1, 1.7, 0.14]} c="#c8102e" />
      <Box p={[0, 1.2, -0.42]} s={[1.3, 1.9, 0.06]} c="#e8b931" />
      {[-0.55, 0.55].map((x) => <Box key={x} p={[x, 0.55, 0]} s={[0.12, 0.5, 0.8]} c="#e8b931" />)}
      <mesh position={[0, 2.2, -0.42]}><coneGeometry args={[0.18, 0.3, 6]} /><meshStandardMaterial color="#e8b931" metalness={0.7} roughness={0.3} /></mesh>
    </group>
    {/* colunas e cortinas */}
    {[-3.4, 3.4].map((x) => (
      <group key={x}>
        <mesh position={[x, 2.8, -3.6]} castShadow><cylinderGeometry args={[0.3, 0.3, 5.6, 20]} /><meshStandardMaterial color="#f4f0e6" /></mesh>
        <Box p={[x * 0.62, 3.6, -3.9]} s={[1.6, 4.2, 0.06]} c="#2b3a8a" />
        <Box p={[x * 0.62, 5.6, -3.86]} s={[1.7, 0.2, 0.08]} c="#e8b931" />
      </group>
    ))}
  </group>
);

export const NOVOS_LUGARES = { Vila, CasaCamponesa, CampoBatatas, SalaDoTrono };
void FONT;
