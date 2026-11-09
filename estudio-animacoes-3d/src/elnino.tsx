import * as THREE from 'three';
import { back, clamp01, lerp, rand, seg, V3 } from './anim';
import { Look } from './Character';
import { ELENCO, ROUPAS } from './personagens';
import { Sign } from './props';
import { Box, WarmLights } from './sets';
import { canvasTex, FONT, labelTex, tileTex } from './textures';

// ============================================================================
// "El Niño: a banheira do Pacífico" — cenários e objetos. Tudo é função de t.
// ============================================================================

type G = { position?: V3; rotation?: V3; scale?: number | V3 };

export const CIENTISTA: Look = ELENCO.teo.look;
export const PESCADOR: Look = { ...ROUPAS.marinheiro.look, skin: ELENCO.tonhao.look.skin, hair: ELENCO.tonhao.look.hair, beard: 'barba', body: 'forte' };
export const PAULA_EN: Look = ELENCO.paula.look;
export const BENTO: Look = ELENCO.bento.look;

export const pop = (t: number, at: number) => Math.max(0.001, seg(t, at - 0.2, at - 0.03, back));

const QUENTE = '#ff6a2a';
const FRIA = '#5fd0ff';

// ---------- Céu e chão de estúdio ----------
export const SkyStage = ({ bg = '#9fd4ff', chao = '#d8e8f0' }: { bg?: string; chao?: string }) => (
  <group>
    <WarmLights sun={[-4, 8, 6]} bg={bg} sky="#ffffff" ground="#8aa0b0" fill={1.05} power={2.0} fog={[16, 45]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color={chao} roughness={0.9} />
    </mesh>
  </group>
);

// ---------- Banheira-oceano ----------
// Comprimento em x (oeste = -x, leste/Peru = +x). Superfície da água em y = 0.85.
// warm: 0 = água quente no oeste, 1 = no leste. wind: força do vento (0..1). upwell: água fria subindo (0..1).
// fish: tamanho do cardume (0..1). nutri: nutrientes (0..1). peru: terra do Peru (0..1).
export const WATER_Y = 0.85;
export const Tub = ({ t, warm = 0, wind = 0, upwell = 0, fish = 0, nutri = 0, peru = 1, glow = 0 }: { t: number; warm?: number; wind?: number; upwell?: number; fish?: number; nutri?: number; peru?: number; glow?: number }) => {
  const L = 4.2;
  const Wd = 1.8;
  const H = 1.0;
  const wx = lerp(-1.15, 1.05, warm);
  return (
    <group>
      {/* casco */}
      <Box p={[0, 0.06, 0]} s={[L, 0.12, Wd]} c="#f4f4f2" r={0.3} />
      <Box p={[0, H / 2, Wd / 2]} s={[L, H, 0.1]} c="#f4f4f2" r={0.3} />
      <Box p={[0, H / 2, -Wd / 2]} s={[L, H, 0.1]} c="#f4f4f2" r={0.3} />
      <Box p={[L / 2, H / 2, 0]} s={[0.1, H, Wd]} c="#f4f4f2" r={0.3} />
      <Box p={[-L / 2, H / 2, 0]} s={[0.1, H, Wd]} c="#f4f4f2" r={0.3} />
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => (
        <mesh key={i} position={[a * (L / 2 - 0.2), 0.0, b * (Wd / 2 - 0.15)]}>
          <sphereGeometry args={[0.12, 14, 10]} />
          <meshStandardMaterial color="#d8b04a" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* água */}
      <mesh position={[0, (WATER_Y + 0.12) / 2, 0]}>
        <boxGeometry args={[L - 0.12, WATER_Y - 0.12, Wd - 0.12]} />
        <meshStandardMaterial color="#2f7fd0" transparent opacity={0.72} roughness={0.15} />
      </mesh>
      {/* água quente na superfície */}
      <mesh position={[wx, WATER_Y + 0.005, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[1.9, 0.05, Wd - 0.14]} />
        <meshStandardMaterial color={QUENTE} emissive={QUENTE} emissiveIntensity={0.25 + glow * 0.5 + 0.1 * Math.sin(t * 4) * glow} transparent opacity={0.85} />
      </mesh>
      {/* água fria do leste (na superfície quando sobe) */}
      <mesh position={[1.55, WATER_Y + 0.004, 0]}>
        <boxGeometry args={[0.9, 0.04, Wd - 0.14]} />
        <meshStandardMaterial color={FRIA} transparent opacity={0.25 + 0.6 * upwell} />
      </mesh>
      {/* bolhas frias subindo do fundo */}
      {upwell > 0.01 &&
        Array.from({ length: 12 }, (_, i) => {
          const ph = (t * 0.5 + rand(i)) % 1;
          return (
            <mesh key={i} position={[1.2 + rand(i + 3) * 0.75, 0.2 + ph * (WATER_Y - 0.25), (rand(i + 5) - 0.5) * 1.3]} scale={upwell * (0.6 + 0.4 * Math.sin(ph * Math.PI))}>
              <sphereGeometry args={[0.09, 12, 10]} />
              <meshStandardMaterial color="#bff0ff" transparent opacity={0.85} />
            </mesh>
          );
        })}
      {/* nutrientes */}
      {nutri > 0.01 &&
        Array.from({ length: 16 }, (_, i) => {
          const ph = (t * 0.35 + rand(i + 20)) % 1;
          return (
            <mesh key={i} position={[1.0 + rand(i + 9) * 0.9, 0.25 + ph * (WATER_Y - 0.2), (rand(i + 13) - 0.5) * 1.4]} scale={nutri}>
              <sphereGeometry args={[0.04, 8, 6]} />
              <meshBasicMaterial color="#7dff6a" toneMapped={false} />
            </mesh>
          );
        })}
      {/* peixes */}
      {fish > 0.01 &&
        Array.from({ length: 9 }, (_, i) => {
          const a = t * (0.8 + rand(i) * 0.4) + i * 0.7;
          const r = 0.25 + rand(i + 2) * 0.35;
          return <Fish key={i} position={[1.15 + Math.cos(a) * r, WATER_Y - 0.12 - rand(i + 4) * 0.2, Math.sin(a) * r * 1.3]} rotation={[0, -a, 0]} scale={fish * 0.9} color={i % 3 ? '#ffb43a' : '#c8d4e0'} />;
        })}
      {/* setas de vento (para o oeste) */}
      {wind > 0.01 &&
        Array.from({ length: 6 }, (_, i) => {
          const ph = (t * 0.55 + i / 6) % 1;
          return <WindArrow key={i} position={[1.9 - ph * 3.8, 1.25 + (i % 3) * 0.28, -0.55 + (i % 2) * 1.1]} scale={wind * Math.sin(ph * Math.PI)} />;
        })}
      {/* Peru (leste) e Indonésia (oeste) */}
      <group position={[L / 2 + 0.55, 0, 0]} scale={peru}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <coneGeometry args={[0.6, 1.2, 6]} />
          <meshStandardMaterial color="#8a7a4a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <coneGeometry args={[0.2, 0.3, 6]} />
          <meshStandardMaterial color="#f4f4f2" />
        </mesh>
        <Sign text="PERU" w={0.8} h={0.28} position={[0, 0.35, 0.62]} bg="#c8102e" fg="#ffffff" />
      </group>
      <group position={[-L / 2 - 0.5, 0, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <sphereGeometry args={[0.45, 16, 12]} />
          <meshStandardMaterial color="#4f8d3c" roughness={0.9} />
        </mesh>
        <Sign text="INDONÉSIA" w={0.95} h={0.26} position={[0, 0.25, 0.5]} bg="#2a5a3a" fg="#ffffff" />
      </group>
    </group>
  );
};

export const Fish = ({ color = '#ffb43a', ...g }: G & { color?: string }) => (
  <group {...g}>
    <mesh scale={[1, 0.6, 0.45]}>
      <sphereGeometry args={[0.1, 12, 10]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
    <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.3]}>
      <coneGeometry args={[0.06, 0.08, 4]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </group>
);

export const WindArrow = (g: G) => (
  <group {...g}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.035, 0.035, 0.6, 10]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
    </mesh>
    <mesh position={[-0.36, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <coneGeometry args={[0.09, 0.18, 12]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
    </mesh>
  </group>
);

// Patinho de borracha (genérico).
export const Duck = (g: G) => (
  <group {...g}>
    <mesh scale={[1.2, 0.8, 0.9]} castShadow>
      <sphereGeometry args={[0.18, 16, 12]} />
      <meshStandardMaterial color="#ffd23a" roughness={0.4} />
    </mesh>
    <mesh position={[0.12, 0.18, 0]} castShadow>
      <sphereGeometry args={[0.11, 14, 10]} />
      <meshStandardMaterial color="#ffd23a" roughness={0.4} />
    </mesh>
    <mesh position={[0.24, 0.16, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.04, 0.09, 8]} />
      <meshStandardMaterial color="#ff7a2a" />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[0.19, 0.22, s * 0.05]}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    ))}
  </group>
);

// ---------- Nuvem de chuva ----------
export const RainCloud = ({ t, rain = 0, dark = 0.5, k = 1, ...g }: G & { t: number; rain?: number; dark?: number; k?: number }) => {
  if (k <= 0.001) return null;
  const c = new THREE.Color('#ffffff').lerp(new THREE.Color('#6a7280'), dark);
  return (
    <group {...g} scale={k}>
      {[[0, 0, 0.45], [-0.45, -0.08, 0.32], [0.45, -0.06, 0.35], [-0.2, 0.22, 0.32], [0.22, 0.2, 0.3]].map(([x, y, r], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <sphereGeometry args={[r, 18, 14]} />
          <meshStandardMaterial color={c} roughness={0.95} />
        </mesh>
      ))}
      {rain > 0.01 &&
        Array.from({ length: 22 }, (_, i) => {
          const ph = (t * 1.8 + rand(i)) % 1;
          return (
            <mesh key={`r${i}`} position={[(rand(i + 3) - 0.5) * 1.2, -0.35 - ph * 2.2, (rand(i + 7) - 0.5) * 0.6]} scale={rain}>
              <cylinderGeometry args={[0.012, 0.012, 0.18, 4]} />
              <meshStandardMaterial color="#9fd8ff" transparent opacity={0.85} />
            </mesh>
          );
        })}
    </group>
  );
};

// ---------- Sol ----------
export const Sun = ({ t, k = 1, ...g }: G & { t: number; k?: number }) => {
  if (k <= 0.001) return null;
  return (
    <group {...g} scale={k}>
      <mesh>
        <sphereGeometry args={[0.35, 24, 18]} />
        <meshBasicMaterial color="#ffc93a" toneMapped={false} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + t * 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0]} rotation={[0, 0, a + Math.PI / 2]}>
            <coneGeometry args={[0.06, 0.2, 6]} />
            <meshBasicMaterial color="#ffa82a" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Fogo ----------
export const Fire = ({ t, k = 1, ...g }: G & { t: number; k?: number }) => {
  if (k <= 0.001) return null;
  return (
    <group {...g} scale={k}>
      {[0, 1, 2, 3, 4].map((i) => {
        const h = 0.35 + 0.12 * Math.sin(t * 9 + i * 1.7);
        return (
          <mesh key={i} position={[(i - 2) * 0.09, h / 2, (i % 2) * 0.05]}>
            <coneGeometry args={[0.08, h, 8]} />
            <meshBasicMaterial color={i % 2 ? '#ffd23a' : '#ff5a1a'} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Termômetro ----------
export const Thermometer = ({ k = 0.3, label = '', ...g }: G & { k?: number; label?: string }) => (
  <group {...g}>
    <mesh position={[0, 0.75, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 1.2, 16]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.5} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0.15, 0]}>
      <sphereGeometry args={[0.13, 16, 12]} />
      <meshStandardMaterial color="#e0262e" />
    </mesh>
    <mesh position={[0, 0.15 + (1.2 * k) / 2 + 0.05, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 1.2 * k + 0.1, 12]} />
      <meshStandardMaterial color="#e0262e" />
    </mesh>
    {label && <Sign text={label} w={0.8} h={0.22} position={[0, 1.5, 0]} bg="#2a2a30" fg="#ffffff" />}
  </group>
);

// ---------- Mar do Peru com barco ----------
export const SeaScene = ({ t }: { t: number }) => (
  <group>
    <WarmLights sun={[-4, 8, 6]} bg="#9fd4ff" sky="#ffffff" ground="#2f7fc0" fill={1.05} power={2.0} fog={[14, 40]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#2f86c8" roughness={0.25} metalness={0.2} />
    </mesh>
    {Array.from({ length: 30 }, (_, i) => (
      <mesh key={i} position={[(rand(i) - 0.5) * 12, -0.03 + 0.03 * Math.sin(t * 2 + i), -rand(i + 5) * 10 + 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5 + rand(i + 1) * 0.6, 0.06]} />
        <meshBasicMaterial color="#d8f0ff" transparent opacity={0.7} />
      </mesh>
    ))}
    {/* montanhas da costa */}
    {[-6, -3, 0, 3.5, 6.5].map((x, i) => (
      <mesh key={x} position={[x, 1.2 + (i % 2) * 0.6, -12]}>
        <coneGeometry args={[2.6, 2.6 + (i % 2) * 1.2, 6]} />
        <meshStandardMaterial color={i % 2 ? '#9a8a5a' : '#7a8a4a'} roughness={0.9} />
      </mesh>
    ))}
    <Sign text="COSTA DO PERU" w={2.4} h={0.5} position={[0, 3.6, -11]} bg="#c8102e" fg="#ffffff" />
  </group>
);

export const Boat = ({ t, ...g }: G & { t: number }) => (
  <group {...g} position={[g.position?.[0] ?? 0, (g.position?.[1] ?? 0) + 0.04 * Math.sin(t * 2.2), g.position?.[2] ?? 0]} rotation={[0.03 * Math.sin(t * 1.7), g.rotation?.[1] ?? 0, 0.04 * Math.sin(t * 2.2)]}>
    <Box p={[0, 0.15, 0]} s={[2.2, 0.4, 1.0]} c="#b0603a" r={0.6} />
    <Box p={[0, 0.37, 0]} s={[2.25, 0.06, 1.05]} c="#f4f0e6" />
    <mesh position={[1.25, 0.18, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.5, 0.4, 4]} />
      <meshStandardMaterial color="#b0603a" />
    </mesh>
  </group>
);

// Rede de pesca: `n` peixes dentro (0 = vazia).
export const Net = ({ t, n = 0, ...g }: G & { t: number; n?: number }) => (
  <group {...g}>
    <mesh scale={[1, 1.15, 1]}>
      <sphereGeometry args={[0.38, 12, 10]} />
      <meshBasicMaterial color="#2a4a2a" wireframe />
    </mesh>
    {Array.from({ length: Math.round(n) }, (_, i) => (
      <Fish key={i} position={[(rand(i) - 0.5) * 0.45, -0.2 + rand(i + 3) * 0.35, (rand(i + 6) - 0.5) * 0.4]} rotation={[0, rand(i + 1) * 6 + t * 0.5, 0.3 * Math.sin(t * 6 + i)]} scale={1.2} color={i % 3 ? '#ffb43a' : '#c8d4e0'} />
    ))}
    <mesh position={[0, 0.48, 0]}>
      <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
      <meshStandardMaterial color="#6b4a2a" />
    </mesh>
  </group>
);

// ---------- Mapa do Pacífico no chão ----------
// x de -4 (90°E) a +4 (60°W); z de -1.8 (45°N) a +1.8 (50°S).
export const MAP_W = 8;
export const MAP_D = 3.6;
export const mapXZ = (lon: number, lat: number): [number, number] => {
  const l = lon < 0 ? 360 + lon : lon;
  return [-MAP_W / 2 + (MAP_W * (l - 90)) / 210, -MAP_D / 2 + (MAP_D * (45 - lat)) / 95];
};
const LANDS: Record<string, [number, number][]> = {
  americas: [[-125, 45], [-123, 40], [-117, 33], [-110, 25], [-105, 20], [-95, 16], [-88, 14], [-83, 8], [-78, 8], [-60, 10], [-60, -50], [-74, -50], [-73, -40], [-71, -25], [-76, -15], [-81, -5], [-80, 0], [-78, 7], [-83, 8], [-60, 10], [-60, 45]],
  asia: [[90, 22], [100, 15], [105, 9], [109, 12], [108, 20], [120, 25], [122, 31], [121, 40], [127, 45], [90, 45]],
  australia: [[114, -22], [114, -34], [118, -35], [130, -32], [138, -35], [146, -39], [150, -37], [153, -28], [153, -25], [146, -19], [142, -11], [136, -12], [130, -12], [122, -17]],
};
const ISLANDS: [number, number, number, number][] = [
  [101, 0, 7, 2.2], [114, 0.5, 4, 3.5], [111, -7.3, 5, 1], [121, -2, 2, 3], [140, -5, 9, 2.5], [138, 37, 4, 7], [122, 12, 2, 5],
];
const mapTex = () =>
  canvasTex('mapa-pacifico', 2048, 922, (c) => {
    const W = 2048;
    const H = 922;
    const px = (lon: number, lat: number) => {
      const l = lon < 0 ? 360 + lon : lon;
      return [(W * (l - 90)) / 210, (H * (45 - lat)) / 95];
    };
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2f78c0');
    g.addColorStop(0.5, '#2a90d8');
    g.addColorStop(1, '#2f78c0');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,255,255,0.25)';
    c.lineWidth = 3;
    c.setLineDash([16, 14]);
    const [, ey] = px(150, 0);
    c.beginPath();
    c.moveTo(0, ey);
    c.lineTo(W, ey);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = '#8fbf5a';
    c.strokeStyle = '#4f7a2a';
    c.lineWidth = 6;
    for (const k of Object.keys(LANDS)) {
      c.beginPath();
      LANDS[k].forEach(([lo, la], i) => {
        const [x, y] = px(lo, la);
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      });
      c.closePath();
      c.fill();
      c.stroke();
    }
    for (const [lo, la, rl, rt] of ISLANDS) {
      const [x, y] = px(lo, la);
      c.beginPath();
      c.ellipse(x, y, (W * rl) / 210, (H * rt) / 95, 0.3, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.9)';
    c.font = `900 64px ${FONT}`;
    c.textAlign = 'center';
    const lbl = (txt: string, lo: number, la: number, s = 64) => {
      c.font = `900 ${s}px ${FONT}`;
      const [x, y] = px(lo, la);
      c.fillText(txt, x, y);
    };
    lbl('OCEANO PACÍFICO', 205, 15, 72);
    c.fillStyle = '#1f3a12';
    lbl('AMÉRICA DO SUL', -66, -18, 44);
    lbl('INDONÉSIA', 115, -11, 44);
    lbl('AUSTRÁLIA', 134, -25, 48);
  });

// `tints`: manchas coloridas sobre regiões (ex.: marrom = seca, azul = chuva), cada uma com opacidade.
export const PacificMap = ({ tints = [] }: { tints?: { lon: number; lat: number; r: number; color: string; k: number }[] }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[MAP_W, MAP_D]} />
      <meshStandardMaterial map={mapTex()} roughness={0.8} />
    </mesh>
    <Box p={[0, -0.03, 0]} s={[MAP_W + 0.2, 0.04, MAP_D + 0.2]} c="#6b4a2a" />
    {tints.map((tn, i) => {
      const [x, z] = mapXZ(tn.lon, tn.lat);
      if (tn.k <= 0.01) return null;
      return (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02 + i * 0.001, z]}>
          <circleGeometry args={[tn.r, 32]} />
          <meshBasicMaterial color={tn.color} transparent opacity={0.6 * tn.k} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

// ---------- Mapa do Brasil no chão ----------
// x de -2 (74°W) a +2 (34°W); z de -2 (6°N) a +2 (34°S).
export const brXZ = (lon: number, lat: number): [number, number] => [-2 + (4 * (lon + 74)) / 40, -2 + (4 * (6 - lat)) / 40];
const BRAZIL: [number, number][] = [
  [-60, 5], [-51, 4], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -15], [-40, -22], [-48, -26], [-53, -33], [-57, -30], [-54, -26], [-58, -20], [-58, -16], [-65, -12], [-70, -10], [-73, -7], [-70, -4], [-70, 2], [-64, 2],
];
const brazilTex = () =>
  canvasTex('mapa-brasil', 1024, 1024, (c) => {
    c.fillStyle = '#2a90d8';
    c.fillRect(0, 0, 1024, 1024);
    const px = (lo: number, la: number) => [(1024 * (lo + 74)) / 40, (1024 * (6 - la)) / 40];
    c.fillStyle = '#c8b88a';
    c.beginPath();
    [[-80, 12], [-34, 12], [-34, -40], [-80, -40]].forEach(([lo, la], i) => {
      const [x, y] = px(lo, la);
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    });
    c.fill();
    c.fillStyle = '#2a90d8';
    c.beginPath();
    c.moveTo(...(px(-34, 12) as [number, number]));
    [[-34, -40], [-53, -40], [-53, -33], [-48, -26], [-40, -22], [-39, -15], [-35, -9], [-35, -5], [-44, -2], [-50, 0], [-51, 4], [-50, 12]].forEach(([lo, la]) => c.lineTo(...(px(lo, la) as [number, number])));
    c.fill();
    c.fillStyle = '#8fbf5a';
    c.strokeStyle = '#2f5a1a';
    c.lineWidth = 8;
    c.beginPath();
    BRAZIL.forEach(([lo, la], i) => {
      const [x, y] = px(lo, la);
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    });
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = '#1f3a12';
    c.font = `900 64px ${FONT}`;
    c.textAlign = 'center';
    const [bx, by] = px(-52, -12);
    c.fillText('BRASIL', bx, by);
  });

export const BrazilMap = ({ rise = 1, tints = [] }: { rise?: number; tints?: { lon: number; lat: number; r: number; color: string; k: number }[] }) => (
  <group position={[0, (rise - 1) * 0.6, 0]} scale={[1, 1, 1]}>
    <Box p={[0, 0, 0]} s={[4.2, 0.04, 4.2]} c="#6b4a2a" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial map={brazilTex()} roughness={0.8} transparent opacity={clamp01(rise * 1.5)} />
    </mesh>
    {tints.map((tn, i) => {
      const [x, z] = brXZ(tn.lon, tn.lat);
      if (tn.k <= 0.01) return null;
      return (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03 + i * 0.001, z]}>
          <circleGeometry args={[tn.r, 32]} />
          <meshBasicMaterial color={tn.color} transparent opacity={0.55 * tn.k} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

// Alfinete de mapa.
export const Pin = ({ text = 'VOCÊ', ...g }: G & { text?: string }) => (
  <group {...g}>
    <mesh position={[0, 0.35, 0]} rotation={[Math.PI, 0, 0]} castShadow>
      <coneGeometry args={[0.12, 0.4, 16]} />
      <meshStandardMaterial color="#e0262e" />
    </mesh>
    <mesh position={[0, 0.6, 0]} castShadow>
      <sphereGeometry args={[0.16, 18, 14]} />
      <meshStandardMaterial color="#e0262e" />
    </mesh>
    <Sign text={text} w={0.7} h={0.24} position={[0, 0.98, 0]} bg="#ffffff" fg="#e0262e" />
  </group>
);

// Gota d'água (cheia ou vazia).
export const Drop = ({ empty = false, ...g }: G & { empty?: boolean }) => (
  <group {...g}>
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.2, 18, 14]} />
      <meshStandardMaterial color="#3a9fe8" transparent opacity={empty ? 0.25 : 0.95} wireframe={empty} />
    </mesh>
    <mesh position={[0, 0.22, 0]}>
      <coneGeometry args={[0.17, 0.3, 18]} />
      <meshStandardMaterial color="#3a9fe8" transparent opacity={empty ? 0.25 : 0.95} wireframe={empty} />
    </mesh>
  </group>
);

// ---------- Terra rachada / rio seco ----------
const crackTex = () =>
  canvasTex('rachado', 1024, 1024, (c) => {
    c.fillStyle = '#c99a5a';
    c.fillRect(0, 0, 1024, 1024);
    c.strokeStyle = '#7a5a30';
    c.lineWidth = 5;
    for (let i = 0; i < 70; i++) {
      let x = rand(i) * 1024;
      let y = rand(i + 50) * 1024;
      c.beginPath();
      c.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        x += (rand(i * 7 + j) - 0.5) * 140;
        y += (rand(i * 11 + j) - 0.5) * 140;
        c.lineTo(x, y);
      }
      c.stroke();
    }
  });

// `rio` (0..1): largura da água no leito.
export const DryLand = ({ t, rio = 1, sol = 1, calor = 0 }: { t: number; rio?: number; sol?: number; calor?: number }) => (
  <group>
    <WarmLights sun={[-4, 8, 6]} bg={calor > 0.5 ? '#ffd9a0' : '#ffe6c0'} sky="#fff6e0" ground="#a87a4a" fill={1.1} power={2.4} fog={[14, 40]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial map={crackTex()} roughness={0.95} />
    </mesh>
    {/* leito do rio */}
    <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[1.2, 0.005, -2]}>
      <planeGeometry args={[2.4, 30]} />
      <meshStandardMaterial color="#a8824a" roughness={0.9} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[1.2, 0.012, -2]} scale={[Math.max(0.03, rio), 1, 1]}>
      <planeGeometry args={[2.2, 30]} />
      <meshStandardMaterial color="#3a8fd8" roughness={0.2} />
    </mesh>
    {/* árvore seca */}
    <group position={[-1.8, 0, -1.8]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 1.8, 8]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {[[-0.35, 1.6, 0.6], [0.35, 1.5, -0.7], [0.1, 1.9, 0.2]].map(([x, y, r], i) => (
        <mesh key={i} position={[x / 2, y, 0]} rotation={[0, 0, r]} castShadow>
          <cylinderGeometry args={[0.03, 0.05, 0.8, 6]} />
          <meshStandardMaterial color="#5a4030" />
        </mesh>
      ))}
    </group>
    <Sun t={t} k={sol} position={[0.9, 4.2, -5]} />
    {calor > 0.01 && <pointLight position={[0.9, 4, -3]} color="#ffb060" intensity={10 * calor} distance={12} decay={1.3} />}
  </group>
);

// ---------- Rua alagada ----------
export const FloodLights = () => <WarmLights sun={[-4, 8, 6]} bg="#8a96a8" sky="#d8e0ea" ground="#5a6070" fill={1.0} power={1.2} fog={[12, 36]} />;

// Guarda-chuva (fica parado acima de uma posição).
export const Umbrella = ({ color = '#e0262e', ...g }: G & { color?: string }) => (
  <group {...g}>
    <mesh position={[0, 0.55, 0]} castShadow>
      <coneGeometry args={[0.75, 0.35, 16, 1, true]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.015, 0.015, 0.95, 6]} />
      <meshStandardMaterial color="#2a2a2a" />
    </mesh>
  </group>
);

// ---------- Laboratório do clima ----------
const oceanScreenTex = (alerta: boolean) =>
  canvasTex(`tela-oceano|${alerta}`, 768, 512, (c) => {
    c.fillStyle = '#10182a';
    c.fillRect(0, 0, 768, 512);
    const g = c.createLinearGradient(40, 0, 728, 0);
    g.addColorStop(0, '#2f6fd8');
    g.addColorStop(0.55, alerta ? '#ffb43a' : '#4fa0e8');
    g.addColorStop(1, alerta ? '#ff3a2a' : '#5fd0ff');
    c.fillStyle = g;
    c.fillRect(40, 150, 688, 220);
    c.fillStyle = '#ffffff';
    c.font = `900 46px ${FONT}`;
    c.textAlign = 'center';
    c.fillText('TEMPERATURA DO OCEANO', 384, 90);
    c.font = `900 36px ${FONT}`;
    c.fillText(alerta ? '+2 °C  ACIMA DO NORMAL' : 'NORMAL', 384, 450);
  });

export const Screen = ({ alerta = false, ...g }: G & { alerta?: boolean }) => (
  <group {...g}>
    <Box p={[0, 0, -0.04]} s={[1.7, 1.15, 0.08]} c="#2a2a30" />
    <mesh position={[0, 0, 0.005]}>
      <planeGeometry args={[1.6, 1.05]} />
      <meshBasicMaterial map={oceanScreenTex(alerta)} toneMapped={false} />
    </mesh>
  </group>
);

export const Buoy = ({ t, ...g }: G & { t: number }) => (
  <group {...g}>
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.25, 0.3, 0.5, 20]} />
      <meshStandardMaterial color="#ffc23a" />
    </mesh>
    <mesh position={[0, 0.7, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
      <meshStandardMaterial color="#555" />
    </mesh>
    <mesh position={[0, 0.98, 0]}>
      <sphereGeometry args={[0.05, 10, 8]} />
      <meshBasicMaterial color={Math.floor(t * 2) % 2 ? '#ff3a2a' : '#5a1a1a'} toneMapped={false} />
    </mesh>
  </group>
);

// Anemômetro: as conchas giram com `spin` (voltas por segundo).
export const Anemometer = ({ t, spin = 1, ...g }: G & { t: number; spin?: number }) => (
  <group {...g}>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.025, 0.03, 1.0, 8]} />
      <meshStandardMaterial color="#555" />
    </mesh>
    <group position={[0, 1.02, 0]} rotation={[0, t * spin * Math.PI * 2, 0]}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
              <meshStandardMaterial color="#555" />
            </mesh>
            <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <sphereGeometry args={[0.07, 12, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#e0262e" side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  </group>
);

// Placa "ALERTA" que pisca.
export const AlertSign = ({ t, at, ...g }: G & { t: number; at: number }) => {
  const s = pop(t, at);
  const blink = t > at && Math.floor((t - at) * 4) % 2 === 0;
  return (
    <group {...g} scale={s}>
      <mesh>
        <boxGeometry args={[1.5, 0.5, 0.08]} />
        <meshStandardMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.42, 0.42]} />
        <meshBasicMaterial map={labelTex('ALERTA!', { w: 1024, h: 300, bg: blink ? '#ff2a1a' : '#a01010', fg: '#ffffff' })} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const clampK = clamp01;

// ---------- Banheiro em volta da banheira (azulejos) ----------
export const TubRoom = ({ quente = false }: { quente?: boolean }) => (
  <group>
    <WarmLights sun={[-4, 9, 6]} bg={quente ? '#f2c8a0' : '#cfe6f2'} sky="#ffffff" ground="#9ab0c0" fill={1.1} power={1.8} fog={[18, 50]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial map={tileTex(quente ? '#f6e2cf' : '#e8f2f8', quente ? '#e8c8a8' : '#b8d4e4', 40)} roughness={0.5} />
    </mesh>
    <mesh position={[0, 4, -2.2]}>
      <planeGeometry args={[40, 8]} />
      <meshStandardMaterial map={tileTex(quente ? '#f8e8d8' : '#f2f8fc', quente ? '#ecd4b8' : '#cfe2ee', 24)} roughness={0.5} />
    </mesh>
    {/* tapete e toalha */}
    <Box p={[0, 0.01, 2.0]} s={[2.2, 0.02, 0.9]} c={quente ? '#e0703a' : '#3a8fd8'} r={0.9} />
    <Box p={[-3.2, 1.6, -2.15]} s={[0.9, 1.2, 0.05]} c="#ffffff" r={0.9} />
    <Box p={[-3.2, 2.25, -2.12]} s={[1.1, 0.06, 0.08]} c="#b8b8c0" r={0.3} />
  </group>
);
