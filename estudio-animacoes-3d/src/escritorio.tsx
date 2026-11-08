import * as THREE from 'three';
import { back, clamp01, rand, seg, V3 } from './anim';
import { Look, Pose, REST } from './Character';
import { ELENCO } from './personagens';
import { Box, WarmLights } from './sets';
import { canvasTex, FONT, labelTex, tileTex } from './textures';

// ============================================================================
// "O cargo de não fazer nada": escritório, mesas, relógio e objetos desta história.
// Tudo é função de t.
// ============================================================================

type G = { position?: V3; rotation?: V3; scale?: number | V3 };

export const CHEFE: Look = ELENCO.henrique.look;
export const COLEGA: Look = ELENCO.funcionario.look;
export const PAULA: Look = ELENCO.paula.look;
export const KAIO: Look = ELENCO.kaio.look;
export const GABI: Look = ELENCO.gabi.look;

// Pessoa sentada atrás de uma mesa: o corpo desce, as pernas ficam escondidas pela mesa.
export const SENTADO = -0.32;
export const sentadoEm = (desk: V3, o: Partial<Pose> = {}): Pose => ({ ...REST, x: desk[0], y: SENTADO, z: desk[2] - 0.55, lsx: 0.75, rsx: 0.75, lel: -0.7, rel: -0.7, ...o });

// Mesas fixas do escritório (centro do tampo no chão).
export const MESA_VOCE: V3 = [-1.5, 0, 1.0];
export const MESA_COLEGA: V3 = [0.9, 0, -0.4];
export const MESA_PAULA: V3 = [2.8, 0, -0.4];
export const MESA_KAIO: V3 = [0.9, 0, -2.4];
export const MESA_GABI: V3 = [2.8, 0, -2.4];
export const MESA_CHEFE: V3 = [-1.6, 0, -2.4];
export const DESK_H = 0.62;

const windowTex = (night: boolean) =>
  canvasTex(`janela|${night}`, 512, 384, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 384);
    g.addColorStop(0, night ? '#151a3a' : '#7ec4ff');
    g.addColorStop(1, night ? '#3a2a5a' : '#ffe0b0');
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 384);
    for (let i = 0; i < 14; i++) {
      const w = 26 + rand(i) * 40;
      const h = 80 + rand(i + 9) * 200;
      const x = i * 38 - 10;
      c.fillStyle = night ? '#1c1830' : '#6f88a8';
      c.fillRect(x, 384 - h, w, h);
      c.fillStyle = night ? '#ffd98a' : '#cfe4ff';
      for (let y = 384 - h + 10; y < 380; y += 22)
        for (let xx = x + 6; xx < x + w - 6; xx += 12) if (rand(xx * 3 + y) > (night ? 0.55 : 0.3)) c.fillRect(xx, y, 5, 8);
    }
  });

// ---------- Escritório ----------
// `noite` (0..1) troca a paisagem da janela; `escuro` (0..1) apaga as luzes (isolamento).
export const Office = ({ t, noite = 0, escuro = 0 }: { t: number; noite?: number; escuro?: number }) => {
  const night = noite > 0.5;
  const k = 1 - 0.65 * escuro;
  return (
    <group>
      <WarmLights sun={[-3, 8, 6]} bg={escuro > 0.5 ? '#1e2230' : '#c9d3dc'} sky="#fff6e8" ground="#5a6070" fill={1.1 * k} power={1.6 * k} fog={[14, 34]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={tileTex('#8c9aa8', '#7d8a98', 22)} roughness={0.85} />
      </mesh>
      {/* parede do fundo com janelas */}
      <Box p={[0, 2, -4.3]} s={[14, 4, 0.2]} c="#e8e2d6" r={0.8} />
      <Box p={[-6.1, 2, 0]} s={[0.2, 4, 9]} c="#ded7c8" r={0.8} />
      <Box p={[6.1, 2, 0]} s={[0.2, 4, 9]} c="#ded7c8" r={0.8} />
      {[-3.2, 0.4, 4.0].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.3, -4.19]}>
            <planeGeometry args={[2.4, 1.8]} />
            <meshBasicMaterial map={windowTex(night)} toneMapped={false} color={new THREE.Color(k, k, k)} />
          </mesh>
          <Box p={[x, 2.3, -4.17]} s={[0.06, 1.8, 0.04]} c="#5a6070" />
          <Box p={[x, 1.38, -4.12]} s={[2.6, 0.06, 0.18]} c="#c8c0b0" />
        </group>
      ))}
      {/* luminárias do teto */}
      {[-2, 1, 4].map((x) =>
        [-2.5, 0.5].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 3.95, z]}>
            <boxGeometry args={[1.4, 0.05, 0.4]} />
            <meshBasicMaterial color={escuro > 0.5 ? '#3a3a40' : '#fffbe8'} toneMapped={false} />
          </mesh>
        )),
      )}
      {/* vasos */}
      {[-5.4, 5.4].map((x) => (
        <group key={x} position={[x, 0, -3.6]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.24, 0.6, 16]} />
            <meshStandardMaterial color="#c8643c" />
          </mesh>
          <mesh position={[0, 1.0, 0]} castShadow>
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshStandardMaterial color="#4f8d3c" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <WallClock t={t} position={[-1.4, 3.0, -4.15]} scale={0.8} />
      <pointLight position={[0, 3.5, 0]} color="#fff3dc" intensity={6 * k} distance={10} decay={1.4} />
    </group>
  );
};

// ---------- Mesa de escritório ----------
// `papeis`: altura da pilha (0..1 → até 14 folhas); `tela`: cor do monitor; `vazia`: sem monitor.
export const Desk = ({ t, papeis = 0, tela = '#7fd0ff', vazia = false, cadeira = true, ...g }: G & { t: number; papeis?: number; tela?: string; vazia?: boolean; cadeira?: boolean }) => (
  <group {...g}>
    <Box p={[0, DESK_H, 0]} s={[1.5, 0.06, 0.8]} c="#c79a64" r={0.5} />
    <Box p={[0, DESK_H / 2, 0.36]} s={[1.46, DESK_H, 0.04]} c="#a87e4e" r={0.6} />
    {[-0.7, 0.7].map((x) => (
      <Box key={x} p={[x, DESK_H / 2, 0]} s={[0.05, DESK_H, 0.76]} c="#8a6a44" />
    ))}
    {!vazia && (
      <group>
        <Box p={[0.15, DESK_H + 0.04, -0.22]} s={[0.22, 0.04, 0.16]} c="#3a3a40" />
        <Box p={[0.15, DESK_H + 0.15, -0.22]} s={[0.04, 0.2, 0.04]} c="#3a3a40" />
        <Box p={[0.15, DESK_H + 0.4, -0.24]} s={[0.62, 0.38, 0.04]} c="#2a2a30" />
        <mesh position={[0.15, DESK_H + 0.4, -0.215]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.56, 0.32]} />
          <meshBasicMaterial color={tela} toneMapped={false} />
        </mesh>
        <Box p={[0.15, DESK_H + 0.04, 0.05]} s={[0.46, 0.02, 0.14]} c="#e8e8ec" />
      </group>
    )}
    {papeis > 0 &&
      Array.from({ length: Math.round(papeis * 14) }, (_, i) => (
        <Box key={i} p={[-0.48 + (rand(i) - 0.5) * 0.03, DESK_H + 0.04 + i * 0.022, 0.0 + (rand(i + 4) - 0.5) * 0.03]} s={[0.3, 0.018, 0.38]} c={i % 3 ? '#fbfbf6' : '#f2ecd8'} />
      ))}
    {cadeira && (
      <group position={[0, 0, -0.75]}>
        <Box p={[0, 0.42, 0]} s={[0.5, 0.08, 0.46]} c="#2f3a55" />
        <Box p={[0, 0.82, -0.24]} s={[0.5, 0.7, 0.07]} c="#2f3a55" />
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#555" metalness={0.6} />
        </mesh>
      </group>
    )}
    {void t}
  </group>
);

// ---------- Relógio de parede ----------
// Ponteiro dos segundos anda aos saltos; `balanca` faz o relógio tremer em cada TIC/TAC (tempos).
export const WallClock = ({ t, balanca = [], lento = 1, ...g }: G & { t: number; balanca?: number[]; lento?: number }) => {
  let wob = 0;
  for (const b of balanca) {
    const d = t - (b - 0.05);
    if (d > 0 && d < 0.5) wob += Math.sin(d * 30) * 0.18 * Math.exp(-d * 7);
  }
  const s = Math.floor(t * lento);
  const tick = clamp01((t * lento - s) * 8);
  const secA = -((s + tick) / 60) * Math.PI * 2;
  const minA = -(t * lento / 3600) * Math.PI * 2 - 1.1;
  const hourA = minA / 12 - 2.2;
  return (
    <group {...g}>
      <group rotation={[0, 0, wob]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.08, 48]} />
          <meshStandardMaterial color="#fbfaf4" />
        </mesh>
        <mesh>
          <torusGeometry args={[0.6, 0.06, 12, 48]} />
          <meshStandardMaterial color="#2a2a30" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial map={clockFaceTex()} transparent />
        </mesh>
        <mesh position={[0, 0, 0.06]} rotation={[0, 0, hourA]}>
          <boxGeometry args={[0.05, 0.3, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0, 0.065]} rotation={[0, 0, minA]}>
          <boxGeometry args={[0.035, 0.44, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <group position={[0, 0, 0.075]} rotation={[0, 0, secA]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.015, 0.48, 0.01]} />
            <meshStandardMaterial color="#d22d2d" />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
          <meshStandardMaterial color="#d22d2d" />
        </mesh>
      </group>
    </group>
  );
};
const clockFaceTex = () =>
  canvasTex('clockface', 512, 512, (c) => {
    c.translate(256, 256);
    for (let i = 0; i < 60; i++) {
      c.save();
      c.rotate((i / 60) * Math.PI * 2);
      c.fillStyle = '#2a2a30';
      if (i % 5 === 0) c.fillRect(-6, -232, 12, 34);
      else c.fillRect(-2, -228, 4, 14);
      c.restore();
    }
    c.fillStyle = '#2a2a30';
    c.font = `900 56px ${FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    [12, 3, 6, 9].forEach((n, i) => {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
      c.fillText(String(n), Math.cos(a) * 160, Math.sin(a) * 160);
    });
  });

// Pop com overshoot.
export const pop = (t: number, at: number) => Math.max(0.001, seg(t, at - 0.2, at - 0.03, back));

// Placa de mesa (nome do cargo), em pé, olhando para +Z.
export const DeskPlate = ({ text, ...g }: G & { text: string }) => (
  <group {...g}>
    <mesh rotation={[-0.35, 0, 0]} position={[0, 0.09, 0]} castShadow>
      <boxGeometry args={[0.9, 0.22, 0.05]} />
      <meshStandardMaterial color="#2a2a30" />
    </mesh>
    <mesh rotation={[-0.35, 0, 0]} position={[0, 0.09, 0.027]}>
      <planeGeometry args={[0.86, 0.19]} />
      <meshStandardMaterial map={labelTex(text, { w: 1024, h: 228, bg: '#2a2a30', fg: '#ffd23a' })} />
    </mesh>
  </group>
);

// Bandeja de entrada com papéis que caem até `n` folhas no tempo [a, b].
export const InTray = ({ t, a = -99, b = -99, n = 0, label = '', ...g }: G & { t: number; a?: number; b?: number; n?: number; label?: string }) => {
  const shown = b > a ? Math.floor(n * clamp01((t - a) / (b - a))) : n;
  return (
    <group {...g}>
      <Box p={[0, 0.015, 0]} s={[0.4, 0.03, 0.5]} c="#3a5a8a" />
      {[-0.19, 0.19].map((x) => (
        <Box key={x} p={[x, 0.06, 0]} s={[0.02, 0.1, 0.5]} c="#3a5a8a" />
      ))}
      <Box p={[0, 0.06, -0.24]} s={[0.4, 0.1, 0.02]} c="#3a5a8a" />
      {Array.from({ length: shown }, (_, i) => {
        const land = a + ((i + 1) / n) * (b - a);
        const y = 0.04 + i * 0.02 + Math.max(0, 0.5 - (t - land + 0.15) * 3.3);
        return <Box key={i} p={[(rand(i) - 0.5) * 0.04, y, (rand(i + 2) - 0.5) * 0.04]} s={[0.3, 0.015, 0.4]} c="#fbfbf6" />;
      })}
      {label && (
        <mesh position={[0, 0.06, 0.252]}>
          <planeGeometry args={[0.36, 0.08]} />
          <meshStandardMaterial map={labelTex(label, { w: 512, h: 112, bg: '#ffffff', fg: '#3a5a8a', radius: 8 })} />
        </mesh>
      )}
    </group>
  );
};

// Teia de aranha (aparece em `at`).
const webTex = () =>
  canvasTex('teia', 512, 512, (c) => {
    c.strokeStyle = 'rgba(255,255,255,0.85)';
    c.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 0.5;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(Math.cos(a) * 500, Math.sin(a) * 500);
      c.stroke();
    }
    for (let r = 60; r < 500; r += 60) {
      c.beginPath();
      for (let i = 0; i <= 8; i++) {
        const a = (i / 8) * Math.PI * 0.5;
        const rr = r - 8 * Math.sin(i * 1.3);
        if (i === 0) c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        else c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      c.stroke();
    }
  });
export const Cobweb = ({ t, at, size = 0.7, ...g }: G & { t: number; at: number; size?: number }) => {
  const k = seg(t, at - 0.35, at - 0.02);
  if (k <= 0) return null;
  return (
    <mesh {...g} scale={size * k}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={webTex()} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Peso de ferro com etiqueta.
export const Weight = ({ text = '8 ANOS', ...g }: G & { text?: string }) => (
  <group {...g}>
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.42, 0.5, 6]} />
      <meshStandardMaterial color="#2a2a30" metalness={0.5} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.58, 0]} castShadow>
      <torusGeometry args={[0.14, 0.05, 10, 24]} />
      <meshStandardMaterial color="#2a2a30" metalness={0.5} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.26, 0.37]} rotation={[-0.23, 0, 0]}>
      <planeGeometry args={[0.5, 0.2]} />
      <meshStandardMaterial map={labelTex(text, { w: 512, h: 205, bg: '#ffd23a', fg: '#1a1a1a', radius: 10 })} />
    </mesh>
  </group>
);

// Grades que descem em volta de um ponto (cela). `k` 0..1 = quanto já desceram.
export const Cage = ({ k, w = 2.0, d = 1.9, h = 2.6, ...g }: G & { k: number; w?: number; d?: number; h?: number }) => {
  const y = (1 - k) * 4.5;
  const bars: [number, number][] = [];
  for (let i = 0; i <= 8; i++) bars.push([-w / 2 + (i / 8) * w, d / 2]);
  for (let i = 1; i < 6; i++) {
    bars.push([-w / 2, d / 2 - (i / 6) * d]);
    bars.push([w / 2, d / 2 - (i / 6) * d]);
  }
  return (
    <group {...g} position={[g.position?.[0] ?? 0, (g.position?.[1] ?? 0) + y, g.position?.[2] ?? 0]}>
      {bars.map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, h, 8]} />
          <meshStandardMaterial color="#5a5e66" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <Box p={[0, h, d / 2]} s={[w + 0.1, 0.08, 0.08]} c="#4a4e56" />
      <Box p={[-w / 2, h, 0]} s={[0.08, 0.08, d]} c="#4a4e56" />
      <Box p={[w / 2, h, 0]} s={[0.08, 0.08, d]} c="#4a4e56" />
    </group>
  );
};

// Medidor horizontal (barra) que cai de cheio para quase zero até `at`.
export const Meter = ({ t, from, at, label, ...g }: G & { t: number; from: number; at: number; label: string }) => {
  const k = 1 - 0.96 * seg(t, from, at - 0.03);
  const col = k > 0.5 ? '#3ab54a' : k > 0.2 ? '#f2b53a' : '#e0262e';
  return (
    <group {...g}>
      <Box p={[0, 0, -0.03]} s={[1.6, 0.62, 0.06]} c="#2a2a30" />
      <mesh position={[0, 0.17, 0.01]}>
        <planeGeometry args={[1.4, 0.2]} />
        <meshStandardMaterial map={labelTex(label, { w: 1024, h: 146, fg: '#ffffff' })} transparent />
      </mesh>
      <Box p={[0, -0.1, 0.01]} s={[1.4, 0.22, 0.02]} c="#4a4a52" />
      <Box p={[-0.7 + 0.7 * k, -0.1, 0.03]} s={[1.4 * k, 0.2, 0.02]} c={col} />
    </group>
  );
};

// Carta (envelope) "DEMISSÃO".
export const Letter = ({ text = 'DEMISSÃO', ...g }: G & { text?: string }) => (
  <group {...g}>
    <Box p={[0, 0.006, 0]} s={[0.5, 0.012, 0.34]} c="#fbf8f0" r={0.9} />
    <mesh position={[0, 0.0135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.46, 0.15]} />
      <meshStandardMaterial map={labelTex(text, { w: 512, h: 168, fg: '#c4161c' })} transparent />
    </mesh>
  </group>
);

// Nuvem de pensamento (sonho) com estrelinhas. `k` 0..1 = tamanho.
export const DreamCloud = ({ t, k, ...g }: G & { t: number; k: number }) => {
  if (k <= 0.001) return null;
  const blobs: [number, number, number][] = [[0, 0, 0.42], [-0.45, -0.05, 0.32], [0.45, -0.05, 0.32], [-0.22, 0.25, 0.3], [0.25, 0.24, 0.32]];
  return (
    <group {...g} scale={k}>
      {blobs.map(([x, y, r], i) => (
        <mesh key={i} position={[x, y + Math.sin(t * 2 + i) * 0.02, 0]}>
          <sphereGeometry args={[r, 20, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      ))}
      {[[-0.1, -0.55, 0.1], [0.05, -0.8, 0.06]].map(([x, y, r], i) => (
        <mesh key={`b${i}`} position={[x, y, 0]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* sol e praia dentro do sonho */}
      <mesh position={[0.15, 0.08, 0.43]}>
        <circleGeometry args={[0.12, 24]} />
        <meshBasicMaterial color="#ffc23a" toneMapped={false} />
      </mesh>
      <mesh position={[-0.12, -0.08, 0.43]}>
        <planeGeometry args={[0.36, 0.12]} />
        <meshBasicMaterial color="#5ac8f0" toneMapped={false} />
      </mesh>
    </group>
  );
};
