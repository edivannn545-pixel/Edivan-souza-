import { ReactNode, useMemo } from 'react';
import * as THREE from 'three';
import { F } from './timeline';
import { drawFace, FaceName, OverlayName, patternTex } from './textures';

// ---------- Pose ----------
// Ângulos em radianos. Braço: sz = abre para o lado, sx = levanta para frente, el = dobra o cotovelo.
export const REST = {
  x: 0, y: 0, z: 0, ry: 0,
  lean: 0, side: 0, twist: 0, squash: 0,
  hy: 0, hp: 0, hr: 0,
  lsz: 0.12, lsx: 0, lel: 0.15,
  rsz: 0.12, rsx: 0, rel: 0.15,
  walk: 0, stride: 0,
  ltap: 0, rtap: 0,
  pockets: 0,
};
export type Pose = typeof REST;

// ---------- Rosto ----------
// Troca sempre por uma piscada: meio fechado (rosto antigo), fechado (rosto novo), aberto ~2 quadros antes da palavra.
export type FaceKey = { at: number; f: FaceName; o?: OverlayName[] };
export type FaceState = { f: FaceName; blink: number; o: OverlayName[] };

export function faceAt(t: number, keys: FaceKey[], seed = 0): FaceState {
  const ks = [...keys].sort((a, b) => a.at - b.at);
  let cur: FaceState = { f: ks[0]?.f ?? 'neutral', blink: 0, o: ks[0]?.o ?? [] };
  let nearest = Infinity;
  for (let i = 0; i < ks.length; i++) {
    const swap = ks[i].at - 2 * F;
    nearest = Math.min(nearest, Math.abs(t - swap));
    if (i > 0 && t >= swap - 2 * F && t < swap - F) cur = { ...cur, blink: 0.5 };
    else if (i > 0 && t >= swap - F && t < swap) cur = { f: ks[i].f, blink: 1, o: ks[i].o ?? [] };
    else if (t >= swap) cur = { f: ks[i].f, blink: 0, o: ks[i].o ?? [] };
  }
  if (cur.blink === 0 && nearest > 0.5) {
    const period = 2.6 + (seed % 3) * 0.35;
    const ph = (t + seed * 0.77) % period;
    if (ph < F) cur = { ...cur, blink: 0.5 };
    else if (ph < 2 * F) cur = { ...cur, blink: 1 };
    else if (ph < 3 * F) cur = { ...cur, blink: 0.5 };
  }
  return cur;
}

// ---------- Visual ----------
// Corpo: 6 tipos, todos da mesma base (cabeça grande, membros finos).
export type Body = 'adulto' | 'magro' | 'forte' | 'crianca' | 'idoso' | 'baixo';
export type HairStyle = 'curto' | 'liso' | 'longo' | 'coque' | 'crespo' | 'careca' | 'chanel' | 'rabo' | 'nenhum';
export type Hat =
  | 'bone' | 'gorro' | 'policia' | 'chef' | 'capacete' | 'explorador' | 'astronauta' | 'cavaleiro'
  | 'farao' | 'marinheiro' | 'piloto' | 'capuz' | 'boina' | 'touca' | 'coroa' | 'cartola';
export type Pattern = 'liso' | 'listras' | 'xadrez' | 'florido' | 'acolchoado';

export type Look = {
  skin: string;
  jacket: string; // cor da roupa de cima
  pants: string;
  shoes: string;
  gloves: string; // mãos (escuras no estilo padrão; use a cor da pele ou branco para mãos claras)
  hair: string;
  body?: Body;
  hairStyle?: HairStyle; // padrão: 'curto'
  pattern?: Pattern; // estampa da roupa de cima
  pattern2?: string; // segunda cor da estampa
  patternH?: boolean; // listras deitadas (marinheiro)
  coat?: string; // jaleco / sobretudo aberto
  skirt?: { color: string; long?: boolean }; // saia, vestido, túnica
  vest?: string; // colete
  apron?: string; // avental
  shorts?: boolean; // bermuda (canela à mostra)
  scarf?: string;
  tie?: string;
  shirt?: string; // gola da camisa
  hat?: Hat;
  hatColor?: string;
  cap?: boolean; // atalho antigo para hat: 'bone'
  glasses?: boolean; // atalho antigo para eyewear: 'grau'
  eyewear?: 'grau' | 'escuro' | 'mergulho' | 'aviador';
  beard?: 'bigode' | 'barba';
  metal?: boolean; // armadura
  backpack?: string; // mochila / tanque
  faixa?: string; // faixa colorida na cintura (macacão de astronauta, armadura em gomos)
  estilo?: 'video' | 'classico'; // padrão 'video' = corpo e rosto dos Shorts de referência; 'classico' = corpo antigo do kit
};

export const VOCE: Look = {
  skin: '#f0dccb', jacket: '#2f6158', pants: '#2e3442', shoes: '#5a3a22', gloves: '#1e1f24',
  scarf: '#c0302e', hair: '#5b351f', hat: 'bone', hatColor: '#2d3b66',
};
export const FUNC: Look = {
  skin: '#ead3bf', jacket: '#6d7480', pants: '#4f5560', shoes: '#26211f', gloves: '#1e1f24',
  tie: '#a3242a', shirt: '#f4f4f0', hair: '#2b2421', hairStyle: 'liso', eyewear: 'grau',
};

const BODY: Record<Body, { s: number; torso: [number, number, number]; legs: number; head: number; lean: number; sh: number }> = {
  adulto: { s: 1, torso: [1, 1.15, 0.85], legs: 1, head: 1, lean: 0, sh: 0.27 },
  magro: { s: 1, torso: [0.82, 1.22, 0.72], legs: 1.18, head: 0.96, lean: 0, sh: 0.23 },
  forte: { s: 1.05, torso: [1.38, 1.22, 1.12], legs: 0.92, head: 1, lean: 0, sh: 0.37 },
  crianca: { s: 0.7, torso: [0.95, 1.0, 0.85], legs: 0.85, head: 1.12, lean: 0, sh: 0.26 },
  idoso: { s: 0.94, torso: [1.05, 1.08, 0.9], legs: 0.95, head: 1, lean: 0.12, sh: 0.27 },
  baixo: { s: 0.84, torso: [1.15, 1.0, 0.95], legs: 0.78, head: 1.02, lean: 0, sh: 0.3 },
};

const HEAD_R = 0.5;
const HEAD_Y = 1.62;

const Mat = ({ color, metal, ...p }: { color: string; metal?: boolean; map?: THREE.Texture; side?: THREE.Side; roughness?: number; transparent?: boolean; opacity?: number }) => (
  <meshStandardMaterial color={color} metalness={metal ? 0.85 : 0} roughness={metal ? 0.25 : p.roughness ?? 0.7} {...p} />
);

const FaceDecal = ({ face, skin, escala = 1 }: { face: FaceState; skin: string; escala?: number }) => {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    return c;
  }, []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  const key = `${face.f}|${face.blink}|${face.o.join(',')}|${skin}|${escala}`;
  useMemo(() => {
    drawFace(canvas.getContext('2d')!, face.f, face.blink, face.o, skin, escala);
    tex.needsUpdate = true;
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const L = 1.95;
  return (
    <mesh renderOrder={2}>
      <sphereGeometry args={[HEAD_R * 1.006, 48, 32, Math.PI / 2 - L / 2, L, Math.PI / 2 + 0.1 - L / 2, L]} />
      <meshStandardMaterial map={tex} transparent depthWrite={false} roughness={0.55} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
};

const Limb = ({ len, r, color, metal }: { len: number; r: number; color: string; metal?: boolean }) => (
  <mesh position={[0, -len / 2, 0]} castShadow>
    <capsuleGeometry args={[r, len, 4, 10]} />
    <Mat color={color} metal={metal} />
  </mesh>
);

const Arm = ({ side, sz, sx, el, look, sh, hand }: { side: 1 | -1; sz: number; sx: number; el: number; look: Look; sh: number; hand?: ReactNode }) => {
  // Estilo vídeo: braço cor de pele com manguinha curta e mão pequena clara (exceto armadura/macacão).
  const V = look.estilo !== 'classico';
  // Braço à mostra só quando a "luva" é a mão padrão (escura) ou da cor da pele; luva de roupa especial mantém a manga.
  const nu = V && !look.metal && !look.coat && (look.gloves === '#1e1f24' || look.gloves === look.skin);
  const braco = nu ? look.skin : look.jacket;
  const mao = V && !look.metal ? (nu ? look.skin : look.gloves) : look.gloves;
  return (
    <group position={[side * sh, 1.0, 0]} rotation={new THREE.Euler(-sx, 0, side * sz, 'ZXY')}>
      <Limb len={0.3} r={V ? 0.026 : 0.032} color={braco} metal={look.metal} />
      {nu && (
        <mesh position={[0, -0.06, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.08, 4, 10]} />
          <Mat color={look.jacket} />
        </mesh>
      )}
      <group position={[0, -0.3, 0]} rotation={[-el, 0, 0]}>
        <Limb len={0.27} r={V ? 0.024 : 0.028} color={nu ? look.skin : look.coat ?? look.jacket} metal={look.metal} />
        <group position={[0, -0.3, 0]}>
          <mesh castShadow scale={[1, 1.1, 0.9]}>
            <sphereGeometry args={[V ? 0.05 : 0.07, 16, 12]} />
            <Mat color={mao} roughness={0.5} />
          </mesh>
          {hand}
        </group>
      </group>
    </group>
  );
};

// Tronco em forma de ovo (estilo vídeo): mais largo embaixo; em cima a camisa, embaixo a calça.
const ovoPontos = (de: number, ate: number) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 20; i++) {
    const th = de + ((ate - de) * i) / 20;
    const R = 0.285 - 0.045 * Math.sin(th);
    pts.push(new THREE.Vector2(Math.max(0.0001, R * Math.cos(th)), 0.3 * Math.sin(th)));
  }
  return pts;
};
const CORTE = -0.32; // onde a camisa encontra a calça (ângulo)
const GEO_CAMISA = new THREE.LatheGeometry(ovoPontos(CORTE, Math.PI / 2), 40);
const GEO_CALCA = new THREE.LatheGeometry(ovoPontos(-Math.PI / 2, CORTE + 0.02), 40);
const GEO_OVO = new THREE.LatheGeometry(ovoPontos(-Math.PI / 2, Math.PI / 2), 40);
const CONTORNO = '#1f1712';
const TroncoOvo = ({ look, scale, map }: { look: Look; scale: [number, number, number]; map?: THREE.Texture }) => (
  <group position={[0, 0.84, 0]} scale={scale}>
    <mesh geometry={GEO_CAMISA} castShadow>
      <Mat color={map ? '#ffffff' : look.jacket} map={map} metal={look.metal} side={THREE.DoubleSide} />
    </mesh>
    <mesh geometry={GEO_CALCA} castShadow>
      <Mat color={look.skirt ? look.skirt.color : look.pants} metal={look.metal} side={THREE.DoubleSide} />
    </mesh>
    <mesh geometry={GEO_OVO} scale={1.045}>
      <meshBasicMaterial color={CONTORNO} side={THREE.BackSide} />
    </mesh>
  </group>
);

const Leg = ({ side, swing, tap, look }: { side: 1 | -1; swing: number; tap: number; look: Look }) => {
  const knee = Math.max(0, -swing) * 0.9 + tap * 0.5;
  return (
    <group position={[side * 0.13, 0.55, 0]} rotation={[-swing - tap * 0.3, 0, 0]}>
      <Limb len={0.24} r={0.035} color={look.pants} metal={look.metal} />
      <group position={[0, -0.26, 0]} rotation={[knee, 0, 0]}>
        <Limb len={0.22} r={0.032} color={look.shorts ? look.skin : look.pants} metal={look.metal} />
        <mesh position={[0, -0.27, 0.07]} scale={[1, 0.7, 1.6]} castShadow>
          <sphereGeometry args={[0.08, 16, 12]} />
          <Mat color={look.shoes} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};

// Casca aberta na frente (jaleco, colete): esfera sem a fatia da frente.
const OpenShell = ({ color, scale, gap = 0.55, y = 0.84 }: { color: string; scale: [number, number, number]; gap?: number; y?: number }) => (
  <mesh position={[0, y, 0]} scale={scale} castShadow>
    <sphereGeometry args={[0.3, 32, 20, Math.PI / 2 + gap, Math.PI * 2 - gap * 2]} />
    <Mat color={color} side={THREE.DoubleSide} />
  </mesh>
);

const Hair = ({ look }: { look: Look }) => {
  const st = look.hairStyle ?? 'curto';
  const c = look.hair;
  if (st === 'nenhum') return null;
  const m = <Mat color={c} roughness={0.8} />;
  const sides = (sc = 0.9) =>
    [1, -1].map((s) => (
      <mesh key={s} position={[s * 0.4, 0.06, -0.12]} scale={[0.55, sc, 0.9]} castShadow>
        <sphereGeometry args={[0.24, 20, 16]} />
        {m}
      </mesh>
    ));
  const back = (
    <mesh position={[0, 0.12, -0.2]} scale={[1.02, 0.85, 0.75]}>
      <sphereGeometry args={[0.47, 24, 18]} />
      {m}
    </mesh>
  );
  const top = (
    <mesh position={[0, 0.2, -0.02]} scale={[1.03, 0.62, 1.0]}>
      <sphereGeometry args={[0.49, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Mat color={c} roughness={0.45} />
    </mesh>
  );
  switch (st) {
    case 'careca':
      return <>{sides(0.6)}</>;
    case 'curto':
      return <>{sides()}{back}</>;
    case 'liso':
      return <>{sides()}{back}{top}</>;
    case 'longo':
    case 'chanel':
      return (
        <>
          {top}
          {back}
          <mesh position={[0, st === 'longo' ? -0.12 : 0.02, -0.12]} scale={[1.08, 1, 0.8]} castShadow>
            <cylinderGeometry args={[0.5, 0.52, st === 'longo' ? 0.7 : 0.42, 32, 1, true, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5]} />
            <Mat color={c} side={THREE.DoubleSide} roughness={0.8} />
          </mesh>
        </>
      );
    case 'coque':
      return (
        <>
          {top}
          {back}
          {[1, -1].map((s) => (
            <mesh key={s} position={[s * 0.36, 0.42, -0.05]} castShadow>
              <sphereGeometry args={[0.15, 16, 12]} />
              {m}
            </mesh>
          ))}
        </>
      );
    case 'rabo':
      return (
        <>
          {top}
          {back}
          <mesh position={[0, 0.0, -0.55]} rotation={[0.5, 0, 0]} scale={[0.7, 1.4, 0.7]} castShadow>
            <sphereGeometry args={[0.16, 16, 12]} />
            {m}
          </mesh>
        </>
      );
    case 'crespo':
      return (
        <mesh position={[0, 0.16, -0.06]} scale={[1.16, 1.0, 1.08]} castShadow>
          <sphereGeometry args={[0.5, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <Mat color={c} roughness={0.95} />
        </mesh>
      );
  }
};

const HatMesh = ({ look }: { look: Look }) => {
  const hat = look.hat ?? (look.cap ? 'bone' : undefined);
  if (!hat) return null;
  const c = look.hatColor ?? '#2d3b66';
  const dome = (sy: number, color: string, y = 0.3, rr = 0.5, extra: Record<string, unknown> = {}) => (
    <mesh position={[0, y, -0.02]} scale={[1.08, sy, 1.08]} castShadow>
      <sphereGeometry args={[rr, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Mat color={color} {...extra} />
    </mesh>
  );
  const brim = (r: number, color: string, y = 0.3, front = false) => (
    <mesh position={[0, y, front ? 0.42 : 0]} rotation={[front ? 0.18 : 0, 0, 0]} scale={front ? [1, 0.12, 0.62] : [1, 1, 1]} castShadow>
      {front ? <cylinderGeometry args={[0.38, 0.38, 0.2, 32, 1, false, -Math.PI / 2, Math.PI]} /> : <cylinderGeometry args={[r, r, 0.03, 40]} />}
      <Mat color={color} />
    </mesh>
  );
  switch (hat) {
    case 'bone':
      return (
        <>
          <mesh position={[0, 0.3, -0.02]} scale={[1.12, 0.5, 1.12]} castShadow>
            <sphereGeometry args={[0.5, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Mat color="#ffffff" map={patternTex('listras', c, '#e9ecf5')} roughness={0.85} />
          </mesh>
          {brim(0, c, 0.3, true)}
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.05, 12, 8]} />
            <Mat color={c} />
          </mesh>
        </>
      );
    case 'boina':
      return (
        <mesh position={[0.06, 0.4, -0.04]} rotation={[0, 0, -0.18]} scale={[1.15, 0.32, 1.15]} castShadow>
          <sphereGeometry args={[0.5, 32, 16]} />
          <Mat color={c} />
        </mesh>
      );
    case 'gorro':
    case 'touca':
      return (
        <>
          {dome(0.72, c, 0.18, 0.52)}
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.52, 0.06, 10, 40]} />
            <Mat color={c} />
          </mesh>
          {hat === 'gorro' && (
            <mesh position={[0, 0.6, -0.02]}>
              <sphereGeometry args={[0.1, 14, 10]} />
              <Mat color="#f4f0e8" />
            </mesh>
          )}
        </>
      );
    case 'policia':
    case 'marinheiro':
    case 'piloto':
      return (
        <>
          <mesh position={[0, 0.42, -0.02]} castShadow>
            <cylinderGeometry args={[0.52, 0.46, 0.22, 32]} />
            <Mat color={c} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.47, 0.47, 0.08, 32]} />
            <Mat color={hat === 'marinheiro' ? '#1f3b7a' : '#1b1b1f'} />
          </mesh>
          {hat !== 'marinheiro' && brim(0, '#1b1b1f', 0.32, true)}
          {hat === 'piloto' && (
            <mesh position={[0, 0.3, 0.44]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.5, 0.1, 0.04]} />
              <Mat color="#c9a14a" metal />
            </mesh>
          )}
        </>
      );
    case 'coroa': {
      const ouro = look.hatColor ?? '#e2b23a';
      return (
        <group position={[0, 0.36, -0.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.36, 0.38, 0.18, 32, 1, true]} />
            <Mat color={ouro} metal side={THREE.DoubleSide} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <group key={i} position={[Math.sin(a) * 0.36, 0.15, Math.cos(a) * 0.36]}>
                <mesh castShadow>
                  <coneGeometry args={[0.07, 0.18, 8]} />
                  <Mat color={ouro} metal />
                </mesh>
                <mesh position={[0, 0.1, 0]}>
                  <sphereGeometry args={[0.03, 10, 8]} />
                  <Mat color={i % 2 ? '#c0302e' : '#2f6fb3'} />
                </mesh>
              </group>
            );
          })}
        </group>
      );
    }
    case 'cartola':
      return (
        <>
          <mesh position={[0, 0.62, -0.02]} castShadow>
            <cylinderGeometry args={[0.32, 0.3, 0.56, 32]} />
            <Mat color={c} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.4, -0.02]}>
            <cylinderGeometry args={[0.315, 0.315, 0.09, 32]} />
            <Mat color="#a8242a" />
          </mesh>
          {brim(0.58, c, 0.35)}
        </>
      );
    case 'chef':
      return (
        <>
          <mesh position={[0, 0.48, -0.02]} castShadow>
            <cylinderGeometry args={[0.42, 0.4, 0.4, 32]} />
            <Mat color="#fbfbf8" />
          </mesh>
          <mesh position={[0, 0.78, -0.02]} scale={[1, 0.6, 1]}>
            <sphereGeometry args={[0.5, 24, 16]} />
            <Mat color="#fbfbf8" />
          </mesh>
        </>
      );
    case 'capacete':
      return (
        <>
          {dome(0.75, c, 0.24, 0.52, { roughness: 0.35 })}
          {brim(0.62, c, 0.26)}
        </>
      );
    case 'explorador':
      return (
        <>
          {dome(0.7, c, 0.26, 0.5)}
          <mesh position={[0, 0.27, 0]} rotation={[0.08, 0, 0]}>
            <cylinderGeometry args={[0.78, 0.82, 0.03, 40]} />
            <Mat color={c} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.535, 0.535, 0.06, 32, 1, true]} />
            <Mat color="#5a3a22" side={THREE.DoubleSide} />
          </mesh>
        </>
      );
    case 'astronauta':
      return (
        <>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.64, 40, 28]} />
            <meshStandardMaterial color="#dff3ff" transparent opacity={0.22} roughness={0.05} depthWrite={false} />
          </mesh>
          <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.07, 12, 32]} />
            <Mat color="#e8e8ec" metal />
          </mesh>
        </>
      );
    case 'cavaleiro':
      return (
        <>
          {dome(1.0, look.hatColor ?? '#b9c0c8', 0.12, 0.54, { metal: true })}
          {[1, -1].map((s) => (
            <mesh key={s} position={[s * 0.44, -0.06, -0.02]} scale={[0.35, 1, 0.9]} castShadow>
              <sphereGeometry args={[0.32, 16, 12]} />
              <Mat color={look.hatColor ?? '#b9c0c8'} metal />
            </mesh>
          ))}
          <mesh position={[0, 0.72, -0.05]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.06, 0.25, 8]} />
            <Mat color="#c0302e" />
          </mesh>
        </>
      );
    case 'farao':
      return (
        <>
          <mesh position={[0, 0.26, -0.02]} scale={[1.1, 0.55, 1.1]} castShadow>
            <sphereGeometry args={[0.5, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Mat color="#ffffff" map={patternTex('listras', '#2b56a8', '#e8b931', true)} />
          </mesh>
          {[1, -1].map((s) => (
            <mesh key={s} position={[s * 0.46, -0.22, 0.02]} rotation={[0, 0, s * 0.12]} scale={[0.22, 1, 0.55]} castShadow>
              <boxGeometry args={[0.5, 0.75, 0.5]} />
              <Mat color="#ffffff" map={patternTex('listras', '#2b56a8', '#e8b931', true)} />
            </mesh>
          ))}
        </>
      );
    case 'capuz':
      return (
        <mesh position={[0, 0.02, -0.06]} scale={[1.12, 1.1, 1.08]} castShadow>
          <sphereGeometry args={[0.5, 32, 20, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9]} />
          <Mat color={c} side={THREE.DoubleSide} />
        </mesh>
      );
  }
};

const Eyewear = ({ look }: { look: Look }) => {
  const e = look.eyewear ?? (look.glasses ? 'grau' : undefined);
  if (!e) return null;
  if (e === 'mergulho')
    return (
      <>
        <mesh position={[0, 0.03, 0.42]} scale={[1, 0.62, 0.5]}>
          <sphereGeometry args={[0.36, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#bfe6ff" transparent opacity={0.35} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.03, 0.47]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.62]}>
          <torusGeometry args={[0.34, 0.035, 10, 32]} />
          <Mat color="#1d1d22" />
        </mesh>
        <mesh position={[0.45, 0.25, 0.1]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
          <Mat color="#f2c33a" />
        </mesh>
      </>
    );
  if (e === 'aviador')
    return (
      <>
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * 0.15, 0.3, 0.4]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 20]} />
            <Mat color="#8a6b3a" metal />
          </mesh>
        ))}
        <mesh position={[0, 0.32, 0]} rotation={[0.35, 0, 0]}>
          <torusGeometry args={[0.5, 0.025, 8, 40]} />
          <Mat color="#5a3a22" />
        </mesh>
      </>
    );
  const dark = e === 'escuro';
  return (
    <>
      {[1, -1].map((s) => (
        <group key={s} position={[s * 0.14, 0.02, 0.49]} rotation={[0, s * 0.3, 0]}>
          <mesh>
            <torusGeometry args={[0.1, 0.012, 8, 24]} />
            <Mat color="#1c1c1c" roughness={0.3} />
          </mesh>
          {dark && (
            <mesh>
              <circleGeometry args={[0.1, 24]} />
              <meshStandardMaterial color="#111" roughness={0.1} />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
};

const Beard = ({ look }: { look: Look }) => {
  if (!look.beard) return null;
  return look.beard === 'bigode' ? (
    <mesh position={[0, -0.13, 0.47]} rotation={[0.25, 0, 0]} scale={[1, 0.38, 0.5]}>
      <sphereGeometry args={[0.14, 16, 10]} />
      <Mat color={look.hair} roughness={0.9} />
    </mesh>
  ) : (
    <mesh position={[0, -0.2, 0.12]} scale={[1.0, 0.75, 0.95]} castShadow>
      <sphereGeometry args={[0.44, 32, 16, Math.PI / 2 - 1.2, 2.4, Math.PI * 0.55, Math.PI * 0.45]} />
      <Mat color={look.hair} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
};

export const Character = ({
  pose,
  face,
  look = VOCE,
  right,
  left,
}: {
  pose: Pose;
  face: FaceState;
  look?: Look;
  right?: ReactNode;
  left?: ReactNode;
}) => {
  const p = pose;
  const b = BODY[look.body ?? 'adulto'];
  const ph = p.walk * Math.PI;
  const swing = Math.sin(ph) * 0.55 * p.stride;
  const bob = Math.abs(Math.sin(ph)) * 0.07 * p.stride;
  const sq = 1 - p.squash * 0.18;
  const V = look.estilo !== 'classico';
  const pernas = b.legs * (V ? 1.35 : 1);
  // Estilo vídeo: tronco maior em relação à cabeça, ombros mais abertos.
  const torso: [number, number, number] = V ? [b.torso[0] * 1.18, b.torso[1] * 1.08, b.torso[2] * 1.18] : b.torso;
  const ombro = V ? b.sh * 1.15 : b.sh;
  const dy = 0.55 * (pernas - 1);
  const torsoMap = look.pattern && look.pattern !== 'liso' ? patternTex(look.pattern, look.jacket, look.pattern2 ?? '#f4f0e8', look.patternH) : undefined;
  return (
    <group position={[p.x, p.y + bob, p.z]} rotation={[0, p.ry, 0]} scale={b.s}>
      <group scale={[1, pernas, 1]}>
        <Leg side={1} swing={swing} tap={p.ltap} look={look} />
        <Leg side={-1} swing={-swing} tap={p.rtap} look={look} />
      </group>
      <group position={[0, 0.55 + dy, 0]} scale={[2 - sq, sq, 2 - sq]}>
        <group rotation={[p.lean + b.lean, p.twist, p.side]} position={[0, -0.55, 0]}>
          {/* Tronco arredondado */}
          {V ? (
            <TroncoOvo look={look} scale={torso} map={torsoMap} />
          ) : (
            <mesh position={[0, 0.84, 0]} scale={b.torso} castShadow>
              <sphereGeometry args={[0.3, 32, 24]} />
              <Mat color={torsoMap ? '#ffffff' : look.jacket} map={torsoMap} metal={look.metal} />
            </mesh>
          )}
          {look.faixa && (
            <mesh position={[0, 0.84, 0]} scale={torso} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.298, 0.028, 10, 40]} />
              <Mat color={look.faixa} />
            </mesh>
          )}
          {look.backpack && (
            <mesh position={[0, 0.88, -0.3 * torso[2]]} castShadow>
              <boxGeometry args={[0.42, 0.5, 0.2]} />
              <Mat color={look.backpack} />
            </mesh>
          )}
          {look.coat && <OpenShell color={look.coat} scale={[torso[0] * 1.05, torso[1] * 1.05, torso[2] * 1.06]} />}
          {look.coat && (
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.29 * torso[0], 0.34 * torso[0], 0.5, 32, 1, true, Math.PI / 2 + 0.45, Math.PI * 2 - 0.9]} />
              <Mat color={look.coat} side={THREE.DoubleSide} />
            </mesh>
          )}
          {look.vest && <OpenShell color={look.vest} scale={[torso[0] * 1.04, torso[1] * 0.96, torso[2] * 1.05]} gap={0.35} y={0.86} />}
          {look.skirt && (
            <mesh position={[0, look.skirt.long ? 0.42 : 0.62, 0]} castShadow>
              <cylinderGeometry args={[0.24 * torso[0], (look.skirt.long ? 0.38 : 0.32) * torso[0], look.skirt.long ? 0.7 : 0.3, 32]} />
              <Mat color={look.skirt.color} />
            </mesh>
          )}
          {look.apron && (
            <mesh position={[0, 0.7, 0.27 * torso[2]]} rotation={[0.08, 0, 0]}>
              <planeGeometry args={[0.36 * torso[0], 0.62]} />
              <Mat color={look.apron} side={THREE.DoubleSide} />
            </mesh>
          )}
          {look.shirt && (
            <mesh position={[0, 0.98, 0.2]} rotation={[0.35, 0, 0]}>
              <coneGeometry args={[0.1, 0.24, 3]} />
              <Mat color={look.shirt} roughness={0.6} />
            </mesh>
          )}
          {look.tie && (
            <mesh position={[0, 0.9, 0.255 * torso[2] / 0.85]} rotation={[0.25, 0, Math.PI]}>
              <coneGeometry args={[0.05, 0.26, 4]} />
              <Mat color={look.tie} roughness={0.5} />
            </mesh>
          )}
          {look.scarf && (
            <>
              <mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.17, 0.065, 12, 24]} />
                <Mat color={look.scarf} />
              </mesh>
              <mesh position={[0.02, 1.02, 0.2]} rotation={[0.3, 0, Math.PI]}>
                <coneGeometry args={[0.09, 0.18, 3]} />
                <Mat color={look.scarf} />
              </mesh>
            </>
          )}
          {p.pockets > 0 &&
            [1, -1].map((s) => (
              <mesh key={s} position={[s * 0.3, 0.62 - (1 - p.pockets) * 0.1, 0.05]} scale={[p.pockets, p.pockets, p.pockets]}>
                <boxGeometry args={[0.12, 0.16, 0.06]} />
                <Mat color="#efeee8" roughness={0.9} />
              </mesh>
            ))}
          <Arm side={1} sz={p.lsz} sx={p.lsx} el={p.lel} look={look} sh={ombro} hand={left} />
          <Arm side={-1} sz={p.rsz} sx={p.rsx} el={p.rel} look={look} sh={ombro} hand={right} />
          {/* Cabeça */}
          <group position={[0, 1.18, 0]} rotation={new THREE.Euler(p.hp, p.hy, p.hr, 'YXZ')}>
            <group position={[0, (HEAD_Y - 1.18) * b.head, 0]} scale={b.head}>
              <mesh castShadow>
                <sphereGeometry args={[HEAD_R, 48, 32]} />
                <Mat color={look.skin} roughness={0.55} />
              </mesh>
              {V && (
                <mesh scale={1.035}>
                  <sphereGeometry args={[HEAD_R, 40, 28]} />
                  <meshBasicMaterial color={CONTORNO} side={THREE.BackSide} />
                </mesh>
              )}
              <FaceDecal face={face} skin={look.skin} escala={V ? 1.95 : 1} />
              <Hair look={look} />
              <Beard look={look} />
              <Eyewear look={look} />
              <HatMesh look={look} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
