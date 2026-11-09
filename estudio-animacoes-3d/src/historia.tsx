import * as THREE from 'three';
import { back, easeOut, lerp, rand, seg, V3 } from './anim';
import { Box, WarmLights } from './sets';
import { F } from './timeline';
import { canvasTex, comicTex, FONT, labelTex } from './textures';

// ============================================================================
// "O TEMPO VOA" — objetos e cenários desta história (superpoder: perceber o tempo 6x mais rápido).
// ============================================================================

type G = { position?: V3; rotation?: V3; scale?: number | V3 };
const Std = ({ c, r = 0.6, m = 0, e, ei = 0, ...p }: { c: string; r?: number; m?: number; e?: string; ei?: number; map?: THREE.Texture; side?: THREE.Side; transparent?: boolean; opacity?: number }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? '#000'} emissiveIntensity={ei} {...p} />
);

// ---------- Palco colorido para os fatos ----------
export const Palco = ({ cor = '#2f5f7a', noite = false }: { cor?: string; noite?: boolean }) => (
  <group>
    <WarmLights bg={cor} sky={noite ? '#9fb6ff' : '#ffffff'} ground={cor} fill={noite ? 0.7 : 1.0} power={noite ? 1.2 : 2.2} sun={[-3, 7, 6]} fog={[16, 40]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color={cor} roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.06, 0]} receiveShadow>
      <cylinderGeometry args={[2.8, 2.9, 0.12, 64]} />
      <meshStandardMaterial color={new THREE.Color(cor).offsetHSL(0, -0.05, 0.12).getStyle()} roughness={0.7} />
    </mesh>
  </group>
);

// ---------- Relógio grande de pé (ponteiros controlados) ----------
// minutos: ponteiro grande (60 = uma volta); horas: ponteiro pequeno.
export const RelogioGrande = ({ minutos = 0, horas = 10, tamanho = 1, ...g }: G & { minutos?: number; horas?: number; tamanho?: number }) => {
  const face = canvasTex('relogio-grande', 512, 512, (c) => {
    c.fillStyle = '#fffdf5';
    c.beginPath();
    c.arc(256, 256, 250, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#22252b';
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      c.save();
      c.translate(256 + Math.sin(a) * (i % 5 ? 228 : 212), 256 - Math.cos(a) * (i % 5 ? 228 : 212));
      c.rotate(a);
      c.fillRect(-3, 0, 6, i % 5 ? 12 : 26);
      c.restore();
    }
    c.font = `900 60px ${FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (let h = 1; h <= 12; h++) {
      const a = (h / 12) * Math.PI * 2;
      c.fillText(String(h), 256 + Math.sin(a) * 168, 256 - Math.cos(a) * 168);
    }
  });
  const R = 0.8 * tamanho;
  const mao = (frac: number, len: number, w: number, cor: string, z: number) => {
    const a = -frac * Math.PI * 2;
    return (
      <mesh position={[Math.sin(-a) * len * 0.5 * R, Math.cos(-a) * len * 0.5 * R, z]} rotation={[0, 0, a]}>
        <boxGeometry args={[w * R, len * R, 0.02]} />
        <Std c={cor} />
      </mesh>
    );
  };
  return (
    <group {...g}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[R * 1.12, R * 1.12, 0.16 * tamanho, 48]} />
        <Std c="#c8352f" r={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.081 * tamanho]}>
        <circleGeometry args={[R, 48]} />
        <meshStandardMaterial map={face} roughness={0.5} />
      </mesh>
      {mao((horas % 12) / 12, 0.55, 0.07, '#22252b', 0.1 * tamanho)}
      {mao(minutos / 60, 0.85, 0.045, '#22252b', 0.11 * tamanho)}
      <mesh position={[0, 0, 0.12 * tamanho]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05 * R, 0.05 * R, 0.02, 16]} />
        <Std c="#c8352f" />
      </mesh>
    </group>
  );
};

// ---------- Contador que vai de um número a outro e chega no final exatamente na palavra ----------
export const Contador = ({ t, from, at, de = 0, para, sufixo = '', cor = '#ffb53a', ...g }: G & { t: number; from: number; at: number; de?: number; para: number; sufixo?: string; cor?: string }) => {
  const k = seg(t, from, at - F, easeOut);
  const v = Math.round(lerp(de, para, k));
  const hit = t >= at - F ? 1 + 0.15 * Math.max(0, 1 - (t - at) / 0.2) : 1;
  return (
    <group {...g}>
      <group scale={hit}>
        <Box p={[0, 0, 0]} s={[2.4, 0.9, 0.25]} c="#202326" r={0.4} />
        <mesh position={[0, 0, 0.13]}>
          <planeGeometry args={[2.25, 0.74]} />
          <meshBasicMaterial map={labelTex(`${v}${sufixo}`, { w: 1024, h: 336, bg: '#0b0d0c', fg: cor, radius: 10 })} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

// Placa grande com texto que salta na palavra (ex.: "×6").
export const PlacaSalta = ({ t, at, texto, bg = '#ffd23a', fg = '#2a1a0a', w = 2.2, h = 1.2, ...g }: G & { t: number; at: number; texto: string; bg?: string; fg?: string; w?: number; h?: number }) => {
  const k = seg(t, at - 3 * F, at + 3 * F, back);
  if (k <= 0.001) return null;
  return (
    <group {...g}>
      <group scale={k} rotation={[0, 0, -0.06]}>
        <Box p={[0, 0, 0]} s={[w + 0.1, h + 0.1, 0.18]} c="#2a1a0a" />
        <mesh position={[0, 0, 0.095]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={labelTex(texto, { w: 1024, h: Math.round((1024 * h) / w), bg, fg, radius: 24 })} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- Ônibus (rodas giram na proporção da distância) e ponto ----------
export const Onibus = ({ x = 0, z = 0, cor = '#f2b632' }: { x?: number; z?: number; cor?: string }) => {
  const giro = -x / 0.45;
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 1.55, 0]} s={[6, 2.4, 2.2]} c={cor} r={0.45} />
      <Box p={[0, 0.5, 0]} s={[6, 0.3, 2.2]} c="#2a2c34" />
      <Box p={[0, 2.82, 0]} s={[5.6, 0.15, 2.0]} c="#e8e4da" />
      {[-2.2, -1.1, 0, 1.1].map((xx) => (
        <mesh key={xx} position={[xx, 1.95, 1.11]}>
          <planeGeometry args={[0.95, 0.85]} />
          <meshStandardMaterial color="#8fc8ee" roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[2.4, 1.6, 1.11]}>
        <planeGeometry args={[0.8, 1.9]} />
        <meshStandardMaterial color="#5a6272" />
      </mesh>
      <mesh position={[3.01, 1.95, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 0.9]} />
        <meshStandardMaterial color="#8fc8ee" roughness={0.1} />
      </mesh>
      <Box p={[0, 1.2, 1.11]} s={[6, 0.18, 0.02]} c="#2f6fb3" />
      {[-2, 2].map((xx) =>
        [-1.1, 1.1].map((zz) => (
          <group key={`${xx}${zz}`} position={[xx, 0.45, zz]} rotation={[0, 0, giro]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.3, 24]} />
              <Std c="#1e1f24" />
            </mesh>
            <Box p={[0, 0, zz > 0 ? 0.16 : -0.16]} s={[0.5, 0.1, 0.02]} c="#b9c0c8" />
          </group>
        )),
      )}
    </group>
  );
};

export const PontoOnibus = ({ ...g }: G) => (
  <group {...g}>
    <Box p={[0, 1.4, 0]} s={[0.08, 2.8, 0.08]} c="#4a4a52" />
    <group position={[0, 2.85, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.06, 32]} />
        <Std c="#2f6fb3" />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <circleGeometry args={[0.34, 32]} />
        <meshBasicMaterial map={labelTex('PONTO', { w: 512, h: 512, bg: '#2f6fb3', fg: '#ffffff', radius: 256 })} toneMapped={false} />
      </mesh>
    </group>
    <Box p={[1.2, 2.3, -0.5]} s={[2.4, 0.08, 1.2]} c="#c9d2da" />
    <Box p={[1.2, 1.15, -1.05]} s={[2.4, 2.3, 0.05]} c="#a8d0e8" r={0.1} />
    <Box p={[1.2, 0.5, -0.8]} s={[2.0, 0.08, 0.4]} c="#a8683a" />
  </group>
);

// ---------- Cérebro (com rostinho), cronômetro e ícones ----------
export const Cerebro = ({ ...g }: G) => (
  <group {...g}>
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.55, 0.1 + Math.sin(i * 1.7) * 0.25, Math.sin(a) * 0.4]} scale={[1, 0.8, 1]} castShadow>
          <sphereGeometry args={[0.38, 18, 14]} />
          <Std c={i % 2 ? '#f29ab8' : '#f5aac4'} r={0.55} />
        </mesh>
      );
    })}
    <mesh scale={[1.3, 0.95, 1]}>
      <sphereGeometry args={[0.6, 24, 18]} />
      <Std c="#f5aac4" r={0.55} />
    </mesh>
    {[-0.22, 0.22].map((x) => (
      <group key={x} position={[x, 0.05, 0.66]}>
        <mesh scale={[1, 1.25, 0.6]}>
          <sphereGeometry args={[0.1, 14, 12]} />
          <Std c="#ffffff" />
        </mesh>
        <mesh position={[0, -0.01, 0.06]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <Std c="#1a1a1a" />
        </mesh>
      </group>
    ))}
    <mesh position={[0, -0.2, 0.66]} rotation={[0, 0, Math.PI]}>
      <torusGeometry args={[0.1, 0.022, 8, 20, Math.PI]} />
      <Std c="#7a2a3a" />
    </mesh>
    <mesh position={[0, -0.75, 0]}>
      <cylinderGeometry args={[0.12, 0.18, 0.4, 16]} />
      <Std c="#e889a8" />
    </mesh>
  </group>
);

export const Cronometro = ({ t = 0, ...g }: G & { t?: number }) => {
  const s = t * 6;
  return (
    <group {...g}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.22, 40]} />
        <Std c="#b9c0c8" m={0.5} r={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.112]}>
        <circleGeometry args={[0.52, 40]} />
        <Std c="#fbfaf5" />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <Box key={i} p={[Math.sin(a) * 0.44, Math.cos(a) * 0.44, 0.115]} s={[0.03, 0.07, 0.005]} c="#22252b" />;
      })}
      <mesh position={[Math.sin(s) * 0.2, Math.cos(s) * 0.2, 0.12]} rotation={[0, 0, -s]}>
        <boxGeometry args={[0.025, 0.42, 0.01]} />
        <Std c="#d8322c" />
      </mesh>
      <Box p={[0, 0.72, 0]} s={[0.14, 0.18, 0.14]} c="#9aa0a8" />
      <mesh position={[0, 0.86, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 20]} />
        <Std c="#9aa0a8" m={0.5} />
      </mesh>
    </group>
  );
};

// X vermelho que carimba na palavra.
export const XVermelho = ({ t, at, ...g }: G & { t: number; at: number }) => {
  const k = seg(t, at - 3 * F, at + 2 * F, back);
  if (k <= 0.001) return null;
  return (
    <group {...g}>
      <group scale={k}>
        {[1, -1].map((s) => (
          <mesh key={s} rotation={[0, 0, s * 0.78]}>
            <boxGeometry args={[1.5, 0.2, 0.05]} />
            <Std c="#e02a2a" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const salto = (t: number, at: number) => seg(t, at - 3 * F, at + 3 * F, back);
export const IconeOlho = ({ t, at, ...g }: G & { t: number; at: number }) => {
  const k = salto(t, at);
  if (k <= 0.001) return null;
  return (
    <group {...g}>
      <group scale={k}>
        <mesh scale={[1, 0.6, 0.4]}>
          <sphereGeometry args={[0.45, 24, 16]} />
          <Std c="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.16]}>
          <sphereGeometry args={[0.18, 16, 12]} />
          <Std c="#3a86d8" />
        </mesh>
        <mesh position={[0, 0, 0.27]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <Std c="#111" />
        </mesh>
      </group>
    </group>
  );
};
export const IconeCoracao = ({ t, at, ...g }: G & { t: number; at: number }) => {
  const k = salto(t, at) * (1 + 0.08 * Math.max(0, Math.sin((t - at) * 9)));
  if (k <= 0.001) return null;
  return (
    <group {...g}>
      <group scale={k}>
        {[-0.17, 0.17].map((x) => (
          <mesh key={x} position={[x, 0.1, 0]}>
            <sphereGeometry args={[0.24, 20, 16]} />
            <Std c="#e8364c" r={0.4} />
          </mesh>
        ))}
        <mesh position={[0, -0.16, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.38, 0.48, 24]} />
          <Std c="#e8364c" r={0.4} />
        </mesh>
      </group>
    </group>
  );
};
export const IconeFoto = ({ t, at, ...g }: G & { t: number; at: number }) => {
  const k = salto(t, at);
  if (k <= 0.001) return null;
  const tex = canvasTex('foto-memoria', 256, 256, (c) => {
    c.fillStyle = '#8fc8ee';
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = '#ffd23a';
    c.beginPath();
    c.arc(190, 70, 30, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#4fa346';
    c.beginPath();
    c.moveTo(0, 256);
    c.lineTo(90, 120);
    c.lineTo(170, 256);
    c.fill();
    c.fillStyle = '#3f8a3a';
    c.beginPath();
    c.moveTo(110, 256);
    c.lineTo(190, 150);
    c.lineTo(256, 256);
    c.fill();
  });
  return (
    <group {...g}>
      <group scale={k} rotation={[0, 0, 0.12]}>
        <Box p={[0, -0.05, 0]} s={[0.75, 0.88, 0.03]} c="#fbfaf5" />
        <mesh position={[0, 0.03, 0.017]}>
          <planeGeometry args={[0.63, 0.6]} />
          <meshStandardMaterial map={tex} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- Relógio biológico: disco dia/noite (sol e lua) que gira ----------
export const CicloDiaNoite = ({ giro = 0, ...g }: G & { giro?: number }) => {
  const tex = canvasTex('dia-noite', 512, 512, (c) => {
    c.fillStyle = '#8fd0f5';
    c.beginPath();
    c.moveTo(256, 256);
    c.arc(256, 256, 250, Math.PI, 0);
    c.fill();
    c.fillStyle = '#1e2a5a';
    c.beginPath();
    c.moveTo(256, 256);
    c.arc(256, 256, 250, 0, Math.PI);
    c.fill();
    c.fillStyle = '#ffd23a';
    c.beginPath();
    c.arc(256, 110, 60, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#fff3c8';
    c.beginPath();
    c.arc(256, 400, 52, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#1e2a5a';
    c.beginPath();
    c.arc(280, 385, 46, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#ffffff';
    for (let i = 0; i < 14; i++) c.fillRect(60 + rand(i) * 380, 300 + rand(i + 1) * 170, 5, 5);
  });
  return (
    <group {...g}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.12, 1.12, 0.14, 48]} />
        <Std c="#2a2c34" />
      </mesh>
      <mesh position={[0, 0, 0.071]} rotation={[0, 0, giro]}>
        <circleGeometry args={[1.02, 48]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.2, 0.1]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.12, 0.22, 3]} />
        <Std c="#c8352f" />
      </mesh>
    </group>
  );
};

// ---------- Despertador que toca a partir de `toca` ----------
export const Despertador = ({ t = 0, toca = 999, cor = '#c8352f', semente = 0, ...g }: G & { t?: number; toca?: number; cor?: string; semente?: number }) => {
  const on = t >= toca;
  const tr = on ? Math.sin(t * 55 + semente * 7) * 0.12 : 0;
  return (
    <group {...g}>
      <group rotation={[0, 0, tr]}>
        <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.14, 28]} />
          <Std c={cor} r={0.35} />
        </mesh>
        <mesh position={[0, 0.32, 0.071]}>
          <circleGeometry args={[0.21, 28]} />
          <Std c="#fbfaf5" />
        </mesh>
        <Box p={[0.0, 0.37, 0.075]} s={[0.025, 0.12, 0.005]} c="#22252b" />
        <Box p={[0.04, 0.32, 0.075]} s={[0.1, 0.025, 0.005]} c="#22252b" />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.17, 0.58, 0]} rotation={[0, 0, -s * 0.5]}>
            <sphereGeometry args={[0.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Std c="#e2b23a" m={0.4} r={0.3} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <Box key={`p${s}`} p={[s * 0.16, 0.08, 0]} s={[0.04, 0.16, 0.04]} c="#2a2c34" />
        ))}
      </group>
      {on && Math.sin(t * 8 + semente) > -0.3 && (
        <sprite position={[0.3, 0.85, 0]} scale={[0.5, 0.25, 1]}>
          <spriteMaterial map={comicTex('TRIM!', '#ffd23a')} transparent depthWrite={false} />
        </sprite>
      )}
    </group>
  );
};

// ---------- Jaula que cai (a "armadilha") ----------
export const Jaula = ({ y = 0, ...g }: G & { y?: number }) => (
  <group {...g}>
    <group position={[0, y, 0]}>
      <mesh position={[0, 2.95, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.12, 32]} />
        <Std c="#4a4a52" m={0.5} r={0.35} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.05, 8, 32]} />
        <Std c="#4a4a52" m={0.5} r={0.35} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.98, 1.48, Math.sin(a) * 0.98]}>
            <cylinderGeometry args={[0.03, 0.03, 2.95, 8]} />
            <Std c="#5a5a62" m={0.5} r={0.35} />
          </mesh>
        );
      })}
    </group>
  </group>
);

// ---------- Botão de inscrição (genérico, sem marca) ----------
export const BotaoInscreva = ({ aperta = 0, inscrito = false, ...g }: G & { aperta?: number; inscrito?: boolean }) => (
  <group {...g}>
    <Box p={[0, 0.1, 0]} s={[2.6, 0.2, 1.0]} c="#2a2c34" />
    <group position={[0, 0.32 - 0.12 * aperta, 0]}>
      <Box p={[0, 0, 0]} s={[2.4, 0.3, 0.85]} c={inscrito ? '#6a6f78' : '#e02a2a'} r={0.35} />
      <mesh position={[0, 0, 0.43]}>
        <planeGeometry args={[2.3, 0.28]} />
        <meshBasicMaterial map={labelTex(inscrito ? 'INSCRITO ✓' : 'INSCREVA-SE', { w: 1024, h: 125, bg: inscrito ? '#6a6f78' : '#e02a2a', fg: '#ffffff', radius: 8 })} toneMapped={false} />
      </mesh>
    </group>
  </group>
);

// ---------- Cama ----------
export const Cama = ({ ...g }: G) => (
  <group {...g}>
    <Box p={[0, 0.25, 0]} s={[1.2, 0.2, 2.3]} c="#7a4a26" />
    <Box p={[0, 0.45, 0]} s={[1.12, 0.2, 2.2]} c="#f4f1e8" />
    <Box p={[0, 0.6, 0.35]} s={[1.14, 0.1, 1.4]} c="#3a5fa8" />
    <Box p={[0, 0.62, -0.85]} s={[0.8, 0.14, 0.4]} c="#ffffff" />
    <Box p={[0, 0.7, -1.15]} s={[1.2, 1.2, 0.12]} c="#7a4a26" />
  </group>
);
export const DEITADO: V3 = [-Math.PI / 2, 0, 0];

export const Zzz = ({ t, position, size = 0.35 }: { t: number; position: V3; size?: number }) => (
  <>
    {[0, 1, 2].map((i) => {
      const k = (((t * 0.55 + i / 3) % 1) + 1) % 1;
      const s = size * (0.5 + k * 0.7) * Math.sin(Math.PI * k);
      return (
        <sprite key={i} position={[position[0] + k * 0.4, position[1] + k * 0.9, position[2]]} scale={[s * 2, s, 1]}>
          <spriteMaterial map={comicTex('Z', '#bfe3ff')} transparent depthWrite={false} />
        </sprite>
      );
    })}
  </>
);

// Tarefa (prancheta grande num pedestal).
export const Tarefa = ({ texto = 'TAREFA\n5 MIN', ...g }: G & { texto?: string }) => (
  <group {...g}>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.06, 0.08, 1.0, 12]} />
      <Std c="#4a4a52" />
    </mesh>
    <group position={[0, 1.25, 0]} rotation={[-0.15, 0, 0]}>
      <Box p={[0, 0, 0]} s={[0.7, 0.9, 0.04]} c="#8a5a32" />
      <mesh position={[0, -0.02, 0.022]}>
        <planeGeometry args={[0.6, 0.76]} />
        <meshStandardMaterial map={labelTex(texto, { w: 512, h: 648, bg: '#fafafa', fg: '#2a2a2e', radius: 10 })} />
      </mesh>
    </group>
  </group>
);
