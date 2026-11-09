import * as THREE from 'three';
import { back, easeOut, rand, seg, V3 } from './anim';
import { Box } from './sets';
import { F } from './timeline';
import { canvasTex, FONT, labelTex } from './textures';

// ============================================================================
// OBJETOS NO ESTILO DOS SHORTS DE REFERÊNCIA (REFERENCIAS.md)
// Formas simples, cores saturadas, bordas arredondadas. Todo movimento é função de t.
// Medidas em metros do mundo (personagem ~2,3 de altura).
// ============================================================================

type G = { position?: V3; rotation?: V3; scale?: number | V3 };
const Std = ({ c, r = 0.6, m = 0, e, ei = 0, ...p }: { c: string; r?: number; m?: number; e?: string; ei?: number; map?: THREE.Texture; side?: THREE.Side; transparent?: boolean; opacity?: number }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? '#000'} emissiveIntensity={ei} {...p} />
);

// ---------- Escritório ----------

// Relógio de parede. `hora` em horas decimais (ex.: 9.5 = 9h30); o ponteiro dos segundos anda com t (tic-tac).
export const RelogioParede = ({ t = 0, hora = 10.1, tamanho = 0.35, ...g }: G & { t?: number; hora?: number; tamanho?: number }) => {
  const seg_ = Math.floor(t);
  const face = canvasTex('relogio-face', 512, 512, (c) => {
    c.fillStyle = '#fbfaf5';
    c.beginPath();
    c.arc(256, 256, 250, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#22252b';
    c.font = `900 64px ${FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (let h = 1; h <= 12; h++) {
      const a = (h / 12) * Math.PI * 2;
      c.fillText(String(h), 256 + Math.sin(a) * 185, 256 - Math.cos(a) * 185);
    }
  });
  const ang = (v: number) => -v * Math.PI * 2;
  const ponteiro = (a: number, len: number, w: number, cor: string, z: number) => (
    <mesh position={[Math.sin(-a) * len * 0.5 * tamanho, Math.cos(-a) * len * 0.5 * tamanho, z]} rotation={[0, 0, a]}>
      <boxGeometry args={[w * tamanho, len * tamanho, 0.01]} />
      <Std c={cor} />
    </mesh>
  );
  return (
    <group {...g}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[tamanho * 1.08, tamanho * 1.08, 0.06, 40]} />
        <Std c="#26282e" r={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.031]}>
        <circleGeometry args={[tamanho, 40]} />
        <meshStandardMaterial map={face} roughness={0.5} />
      </mesh>
      {ponteiro(ang((hora % 12) / 12), 0.55, 0.07, '#22252b', 0.04)}
      {ponteiro(ang((hora % 1)), 0.8, 0.045, '#22252b', 0.045)}
      {ponteiro(ang(seg_ / 60), 0.85, 0.02, '#d8322c', 0.05)}
      <mesh position={[0, 0, 0.055]}>
        <cylinderGeometry args={[0.03 * tamanho * 3, 0.03 * tamanho * 3, 0.01, 16]} />
        <Std c="#d8322c" />
      </mesh>
    </group>
  );
};

// Janela com persiana; atrás, a cidade (de dia ou de noite com janelinhas acesas).
export const JanelaPersiana = ({ w = 1.8, h = 1.6, noite = false, aberta = 0.55, ...g }: G & { w?: number; h?: number; noite?: boolean; aberta?: number }) => {
  const cidade = canvasTex(`cidade|${noite}`, 512, 512, (c) => {
    const ceu = c.createLinearGradient(0, 0, 0, 512);
    ceu.addColorStop(0, noite ? '#141c3a' : '#8fc8ee');
    ceu.addColorStop(1, noite ? '#2a2f5a' : '#d8eef8');
    c.fillStyle = ceu;
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 14; i++) {
      const x = i * 38 + rand(i) * 10, bw = 30 + rand(i + 1) * 20, bh = 140 + rand(i + 2) * 260;
      c.fillStyle = noite ? '#1c2244' : '#9fb3c8';
      c.fillRect(x, 512 - bh, bw, bh);
      for (let yy = 512 - bh + 10; yy < 500; yy += 18)
        for (let xx = x + 5; xx < x + bw - 6; xx += 10)
          if (rand(xx * 7 + yy) > (noite ? 0.55 : 0.75)) {
            c.fillStyle = noite ? '#ffd76a' : '#dfeaf2';
            c.fillRect(xx, yy, 5, 8);
          }
    }
  });
  const ripas = Math.round(h / 0.07);
  return (
    <group {...g}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={cidade} toneMapped={false} />
      </mesh>
      {Array.from({ length: Math.round(ripas * aberta) }, (_, i) => (
        <mesh key={i} position={[0, h / 2 - 0.035 - i * 0.07, 0.02]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[w - 0.04, 0.06, 0.008]} />
          <Std c="#d9d6cc" r={0.5} />
        </mesh>
      ))}
      <Box p={[0, h / 2 + 0.05, 0]} s={[w + 0.12, 0.1, 0.12]} c="#e8e4da" />
      <Box p={[0, -h / 2 - 0.05, 0.04]} s={[w + 0.2, 0.08, 0.2]} c="#e8e4da" />
      <Box p={[-w / 2 - 0.04, 0, 0]} s={[0.08, h + 0.1, 0.1]} c="#e8e4da" />
      <Box p={[w / 2 + 0.04, 0, 0]} s={[0.08, h + 0.1, 0.1]} c="#e8e4da" />
      <Box p={[0, 0, -0.01]} s={[0.04, h, 0.04]} c="#e8e4da" />
    </group>
  );
};

// Planta em vaso (folhas largas) e cacto.
export const Planta = ({ altura = 0.9, vaso = '#c8693a', ...g }: G & { altura?: number; vaso?: string }) => (
  <group {...g}>
    <mesh position={[0, 0.18, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.15, 0.36, 20]} />
      <Std c={vaso} />
    </mesh>
    <mesh position={[0, 0.36, 0]}>
      <cylinderGeometry args={[0.19, 0.19, 0.02, 20]} />
      <Std c="#4a3020" />
    </mesh>
    {Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + rand(i) * 0.4;
      const tilt = 0.5 + rand(i + 3) * 0.5;
      return (
        <group key={i} position={[0, 0.36, 0]} rotation={[0, a, 0]}>
          <mesh position={[0, altura * 0.35, 0.12]} rotation={[tilt, 0, 0]} scale={[0.6, 1, 0.12]} castShadow>
            <sphereGeometry args={[altura * 0.32, 14, 10]} />
            <Std c={i % 2 ? '#3f8a3a' : '#52a346'} r={0.7} />
          </mesh>
        </group>
      );
    })}
  </group>
);
export const Cacto = ({ ...g }: G) => (
  <group {...g}>
    <mesh position={[0, 0.08, 0]} castShadow>
      <cylinderGeometry args={[0.11, 0.09, 0.16, 16]} />
      <Std c="#e07a3a" />
    </mesh>
    <mesh position={[0, 0.32, 0]} scale={[1, 1.6, 1]} castShadow>
      <sphereGeometry args={[0.09, 14, 12]} />
      <Std c="#4f9a42" />
    </mesh>
    {[1, -1].map((s) => (
      <mesh key={s} position={[s * 0.1, 0.34 + s * 0.04, 0]} scale={[0.7, 1.2, 0.7]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <Std c="#4f9a42" />
      </mesh>
    ))}
    <mesh position={[0, 0.48, 0]}>
      <sphereGeometry args={[0.03, 8, 6]} />
      <Std c="#ff6aa0" />
    </mesh>
  </group>
);

// Caneca (com o texto opcional na frente).
export const Caneca = ({ cor = '#2f6fb3', ...g }: G & { cor?: string }) => (
  <group {...g}>
    <mesh position={[0, 0.06, 0]} castShadow>
      <cylinderGeometry args={[0.055, 0.05, 0.12, 20]} />
      <Std c={cor} r={0.35} />
    </mesh>
    <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.048, 20]} />
      <Std c="#4a2a14" />
    </mesh>
    <mesh position={[0.065, 0.06, 0]}>
      <torusGeometry args={[0.03, 0.01, 8, 16]} />
      <Std c={cor} r={0.35} />
    </mesh>
  </group>
);

// Celular com tela (texto em linhas; ex.: "0\ne-mails").
export const Celular = ({ texto = '0\ne-mails', cor = '#1a1c22', ...g }: G & { texto?: string; cor?: string }) => (
  <group {...g}>
    <mesh castShadow>
      <boxGeometry args={[0.16, 0.32, 0.02]} />
      <Std c={cor} r={0.3} />
    </mesh>
    <mesh position={[0, 0, 0.011]}>
      <planeGeometry args={[0.145, 0.29]} />
      <meshBasicMaterial map={labelTex(texto, { w: 256, h: 512, bg: '#f4f7fb', fg: '#26303c', radius: 18 })} toneMapped={false} />
    </mesh>
  </group>
);

// Monitor de computador.
export const Monitor = ({ tela = '#3a7fd0', ...g }: G & { tela?: string }) => (
  <group {...g}>
    <Box p={[0, 0.02, 0]} s={[0.3, 0.04, 0.2]} c="#2a2c32" />
    <Box p={[0, 0.17, -0.03]} s={[0.05, 0.28, 0.04]} c="#2a2c32" />
    <Box p={[0, 0.42, 0]} s={[0.72, 0.44, 0.05]} c="#2a2c32" r={0.4} />
    <mesh position={[0, 0.42, 0.027]}>
      <planeGeometry args={[0.66, 0.38]} />
      <meshBasicMaterial color={tela} toneMapped={false} />
    </mesh>
  </group>
);

// Mesa de escritório com gaveteiro.
export const Mesa = ({ w = 1.6, d = 0.8, cor = '#d8c8a8', ...g }: G & { w?: number; d?: number; cor?: string }) => (
  <group {...g}>
    <Box p={[0, 0.76, 0]} s={[w, 0.06, d]} c={cor} r={0.5} />
    <Box p={[w / 2 - 0.25, 0.37, 0]} s={[0.45, 0.74, d - 0.06]} c="#b9ab8e" />
    {[0.55, 0.32, 0.1].map((y) => (
      <Box key={y} p={[w / 2 - 0.25, y + 0.05, d / 2 - 0.02]} s={[0.4, 0.17, 0.02]} c="#a89a7c" />
    ))}
    <Box p={[-w / 2 + 0.05, 0.37, 0]} s={[0.05, 0.74, d - 0.1]} c="#b9ab8e" />
  </group>
);

// Cadeira de escritório giratória.
export const Cadeira = ({ cor = '#2f3440', ...g }: G & { cor?: string }) => (
  <group {...g}>
    <Box p={[0, 0.5, 0]} s={[0.5, 0.08, 0.5]} c={cor} r={0.6} />
    <Box p={[0, 0.85, -0.23]} s={[0.48, 0.6, 0.07]} c={cor} r={0.6} />
    <mesh position={[0, 0.27, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.44, 8]} />
      <Std c="#55585f" m={0.6} r={0.3} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => (
      <Box key={i} p={[Math.cos((i / 5) * 6.28) * 0.18, 0.05, Math.sin((i / 5) * 6.28) * 0.18]} s={[0.06, 0.04, 0.06]} c="#2a2a2e" />
    ))}
  </group>
);

// Divisória de baia (cubículo).
export const Baia = ({ w = 1.8, h = 1.3, cor = '#9aa3ad', ...g }: G & { w?: number; h?: number; cor?: string }) => (
  <group {...g}>
    <Box p={[0, h / 2, 0]} s={[w, h, 0.06]} c={cor} r={0.9} />
    <Box p={[0, h + 0.02, 0]} s={[w + 0.02, 0.04, 0.08]} c="#6c747d" />
  </group>
);

// Cartaz de parede (texto em linhas) — use para "TRABALHO EM EQUIPE", organograma, avisos.
export const Cartaz = ({ texto, w = 0.9, h = 1.2, bg = '#f2b632', fg = '#2a2a2e', ...g }: G & { texto: string; w?: number; h?: number; bg?: string; fg?: string }) => (
  <group {...g}>
    <Box p={[0, 0, 0]} s={[w + 0.06, h + 0.06, 0.03]} c="#2a2a2e" />
    <mesh position={[0, 0, 0.017]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={labelTex(texto, { w: 512, h: Math.round((512 * h) / w), bg, fg, radius: 6 })} roughness={0.6} />
    </mesh>
  </group>
);

// Placa de mesa ("CARGO: ...").
export const PlacaMesa = ({ texto, ...g }: G & { texto: string }) => (
  <group {...g}>
    <mesh position={[0, 0.08, 0]} rotation={[-0.35, 0, 0]} castShadow>
      <boxGeometry args={[0.6, 0.16, 0.04]} />
      <Std c="#2a2c34" r={0.3} />
    </mesh>
    <mesh position={[0, 0.085, 0.022]} rotation={[-0.35, 0, 0]}>
      <planeGeometry args={[0.57, 0.14]} />
      <meshStandardMaterial map={labelTex(texto, { w: 1024, h: 252, bg: '#2a2c34', fg: '#f3cf6b', radius: 6 })} />
    </mesh>
  </group>
);

// Bandeirolas penduradas (festa) de x0 a x1 na altura y.
export const Bandeirolas = ({ x0 = -2, x1 = 2, y = 2.6, z = 0, n = 12 }: { x0?: number; x1?: number; y?: number; z?: number; n?: number }) => {
  const cores = ['#e8402f', '#ffd23a', '#3aa14a', '#2f6fb3', '#ff8ad0'];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const k = (i + 0.5) / n;
        const x = x0 + (x1 - x0) * k;
        const yy = y - Math.sin(Math.PI * k) * 0.25;
        return (
          <mesh key={i} position={[x, yy - 0.1, z]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.1, 0.22, 3]} />
            <Std c={cores[i % cores.length]} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- Rua / estação / sinalização ----------

// Cone de trânsito.
export const Cone = ({ ...g }: G) => (
  <group {...g}>
    <Box p={[0, 0.02, 0]} s={[0.36, 0.04, 0.36]} c="#e8642a" />
    <mesh position={[0, 0.3, 0]} castShadow>
      <coneGeometry args={[0.14, 0.56, 20]} />
      <Std c="#ff7a2a" r={0.45} />
    </mesh>
    {[0.2, 0.36].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[0.14 * (1 - (y - 0.02) / 0.58) + 0.005, 0.14 * (1 - (y - 0.06) / 0.58) + 0.005, 0.07, 20, 1, true]} />
        <Std c="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    ))}
  </group>
);

// Barril de madeira.
export const Barril = ({ cor = '#9a6436', ...g }: G & { cor?: string }) => (
  <group {...g}>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.8, 20]} />
      <Std c={cor} r={0.8} />
    </mesh>
    <mesh position={[0, 0.4, 0]} scale={[1.08, 0.75, 1.08]}>
      <sphereGeometry args={[0.3, 20, 12]} />
      <Std c={cor} r={0.8} />
    </mesh>
    {[0.12, 0.68].map((y) => (
      <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.305, 0.02, 6, 24]} />
        <Std c="#4a4a52" m={0.6} r={0.4} />
      </mesh>
    ))}
  </group>
);

// Placa de madeira num poste (estrada, castelo, "NÍVEL 1").
export const PlacaMadeira = ({ texto, w = 1.2, h = 0.4, poste = 1.2, ...g }: G & { texto: string; w?: number; h?: number; poste?: number }) => (
  <group {...g}>
    {poste > 0 && <Box p={[0, poste / 2, -0.05]} s={[0.1, poste, 0.1]} c="#7a4a26" />}
    <group position={[0, poste + h / 2 - 0.05, 0]}>
      <Box p={[0, 0, 0]} s={[w, h, 0.07]} c="#9a6436" r={0.8} />
      <mesh position={[0, 0, 0.037]}>
        <planeGeometry args={[w * 0.96, h * 0.9]} />
        <meshStandardMaterial map={labelTex(texto, { w: 1024, h: Math.round((1024 * h) / w), bg: '#a86e3e', fg: '#fff1d6', border: '#7a4a26', radius: 10 })} roughness={0.8} />
      </mesh>
    </group>
  </group>
);

// Pilha de placas "NÍVEL 1 … N" (progressão de fases). `ate` = quantas aparecem (anima de baixo para cima a partir de `from`).
export const PilhaNiveis = ({ t = 99, from = 0, n = 6, rotulo = 'NÍVEL', topo = 'ÚLTIMO NÍVEL', ...g }: G & { t?: number; from?: number; n?: number; rotulo?: string; topo?: string }) => (
  <group {...g}>
    <Box p={[0, (n + 1) * 0.42 * 0.5 + 0.3, -0.06]} s={[0.12, (n + 1) * 0.42 + 0.6, 0.1]} c="#6b4426" />
    {Array.from({ length: n + 1 }, (_, i) => {
      const k = seg(t, from + i * 0.12, from + i * 0.12 + 0.25, back);
      if (k <= 0) return null;
      const txt = i === n ? topo : `${rotulo} ${i + 1}`;
      return (
        <group key={i} position={[0, 0.5 + i * 0.42, 0]} rotation={[0, (i % 2 ? 1 : -1) * 0.12, (i % 2 ? 1 : -1) * 0.03]} scale={k}>
          <PlacaMadeira texto={txt} w={i === n ? 1.5 : 1.15} h={0.36} poste={0} />
        </group>
      );
    })}
  </group>
);

// Cordão de fila (postes de metal com fita).
export const FilaCordao = ({ pontos, cor = '#c0302e' }: { pontos: V3[]; cor?: string }) => (
  <>
    {pontos.map((p, i) => (
      <group key={i} position={p}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 0.04, 20]} />
          <Std c="#c9a14a" m={0.5} r={0.35} />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.95, 10]} />
          <Std c="#c9a14a" m={0.5} r={0.35} />
        </mesh>
      </group>
    ))}
    {pontos.slice(1).map((p, i) => {
      const a = pontos[i];
      const dx = p[0] - a[0], dz = p[2] - a[2];
      const len = Math.hypot(dx, dz);
      return (
        <mesh key={`f${i}`} position={[(a[0] + p[0]) / 2, 0.85, (a[2] + p[2]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
          <boxGeometry args={[len, 0.07, 0.015]} />
          <Std c={cor} r={0.5} />
        </mesh>
      );
    })}
  </>
);

// Banco de espera.
export const Banco = ({ w = 1.8, ...g }: G & { w?: number }) => (
  <group {...g}>
    {[0, 1, 2].map((i) => (
      <Box key={i} p={[0, 0.48, -0.12 + i * 0.13]} s={[w, 0.05, 0.11]} c="#a8683a" />
    ))}
    {[0, 1].map((i) => (
      <Box key={`e${i}`} p={[0, 0.72 + i * 0.16, -0.24]} s={[w, 0.1, 0.05]} c="#a8683a" />
    ))}
    {[-w / 2 + 0.15, w / 2 - 0.15].map((x) => (
      <group key={x}>
        <Box p={[x, 0.24, 0]} s={[0.06, 0.48, 0.4]} c="#2a2c32" />
        <Box p={[x, 0.6, -0.24]} s={[0.06, 0.5, 0.05]} c="#2a2c32" />
      </group>
    ))}
  </group>
);

// Cabine de vidro com anéis de neon (teletransporte, elevador do futuro). `liga` 0..1 acende a luz de dentro.
export const Cabine = ({ t = 0, cidade = 'SÃO PAULO', neon = '#3ee6ff', liga = 0, ...g }: G & { t?: number; cidade?: string; neon?: string; liga?: number }) => {
  const pulso = 0.8 + 0.2 * Math.sin(t * 6);
  return (
    <group {...g}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.0, 0.12, 40]} />
        <Std c="#d8dde3" r={0.35} m={0.3} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.035, 10, 48]} />
        <Std c={neon} e={neon} ei={2.2 * pulso} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 2.6, 40, 1, true, -2.3, 4.6]} />
        <meshStandardMaterial color="#cfeaf6" transparent opacity={0.28} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[-2.3, 2.3].map((a) => (
        <mesh key={a} position={[Math.sin(a) * 0.86, 1.45, Math.cos(a) * 0.86]}>
          <boxGeometry args={[0.08, 2.6, 0.08]} />
          <Std c="#b9c0c8" m={0.5} r={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 2.85, 0]}>
        <cylinderGeometry args={[1.0, 0.95, 0.3, 40]} />
        <Std c="#2a4a5a" r={0.4} />
      </mesh>
      <mesh position={[0, 2.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.03, 10, 48]} />
        <Std c={neon} e={neon} ei={2.2 * pulso} />
      </mesh>
      <group position={[0, 3.25, 0.2]}>
        <Box p={[0, 0, 0]} s={[1.9, 0.45, 0.1]} c="#1f3b4a" />
        <mesh position={[0, 0, 0.052]}>
          <planeGeometry args={[1.84, 0.4]} />
          <meshBasicMaterial map={labelTex(cidade, { w: 1024, h: 222, bg: '#1f3b4a', fg: '#ffffff', border: '#ff8a3a', radius: 10 })} toneMapped={false} />
        </mesh>
      </group>
      {liga > 0 && (
        <>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 2.5, 32, 1, true]} />
            <meshBasicMaterial color={neon} transparent opacity={0.25 * liga} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 1.6, 0.4]} intensity={6 * liga} distance={4} color={neon} />
        </>
      )}
    </group>
  );
};

// Quadro de partidas (painel escuro com linhas de destino).
export const QuadroPartidas = ({ linhas = ['TÓQUIO', 'LISBOA', 'NOVA YORK', 'PARIS'], titulo = 'PARTIDAS', ...g }: G & { linhas?: string[]; titulo?: string }) => {
  const tex = canvasTex(`partidas|${titulo}|${linhas.join(',')}`, 1024, 640, (c) => {
    c.fillStyle = '#16202c';
    c.fillRect(0, 0, 1024, 640);
    c.fillStyle = '#ff8a2a';
    c.fillRect(0, 0, 1024, 110);
    c.font = `900 70px ${FONT}`;
    c.fillStyle = '#ffffff';
    c.textBaseline = 'middle';
    c.fillText(titulo, 40, 58);
    c.font = `900 54px ${FONT}`;
    linhas.forEach((l, i) => {
      const y = 175 + i * 110;
      c.fillStyle = '#f2f4f8';
      c.fillText(l, 40, y);
      c.fillStyle = '#ffd23a';
      c.fillText('1s', 640, y);
      c.fillStyle = '#5ce07a';
      c.fillText('OK', 860, y);
    });
  });
  return (
    <group {...g}>
      <Box p={[0, 0, 0]} s={[2.1, 1.35, 0.1]} c="#0e141c" />
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[2.0, 1.25]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- Castelo ----------

// Estandarte pendurado (pano com torre).
export const Estandarte = ({ cor = '#c8302e', simbolo = '#f2c62e', ...g }: G & { cor?: string; simbolo?: string }) => {
  const tex = canvasTex(`estandarte|${cor}|${simbolo}`, 256, 512, (c) => {
    c.fillStyle = cor;
    c.fillRect(0, 0, 256, 512);
    c.fillStyle = simbolo;
    c.fillRect(78, 170, 100, 150);
    for (let i = 0; i < 3; i++) c.fillRect(78 + i * 40, 140, 24, 36);
    c.fillStyle = cor;
    c.beginPath();
    c.arc(128, 320, 22, Math.PI, 0);
    c.fill();
  });
  return (
    <group {...g}>
      <Box p={[0, 0.05, 0]} s={[0.9, 0.06, 0.06]} c="#5a3a22" />
      <mesh position={[0, -0.85, 0.02]}>
        <planeGeometry args={[0.8, 1.6]} />
        <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.85} />
      </mesh>
    </group>
  );
};

// Escada de madeira encostada.
export const Escada = ({ altura = 3, ...g }: G & { altura?: number }) => (
  <group {...g}>
    {[-0.25, 0.25].map((x) => (
      <Box key={x} p={[x, altura / 2, 0]} s={[0.07, altura, 0.07]} c="#8a5a32" />
    ))}
    {Array.from({ length: Math.floor(altura / 0.35) }, (_, i) => (
      <Box key={i} p={[0, 0.3 + i * 0.35, 0]} s={[0.5, 0.05, 0.05]} c="#9a6a3e" />
    ))}
  </group>
);

// ---------- Ideias e informação (a informação vira objeto) ----------

// Balão de pensamento com ícone/texto, que surge com overshoot em `at`. Sempre de frente para a câmera.
export const BalaoPensamento = ({ t, at, texto = '?', hold = 1.6, size = 0.6, position = [0, 2.8, 0] as V3 }: { t: number; at: number; texto?: string; hold?: number; size?: number; position?: V3 }) => {
  const k = seg(t, at - 2 * F, at + 5 * F, back) * (1 - seg(t, at + hold, at + hold + 6 * F));
  if (k <= 0.001) return null;
  const tex = canvasTex(`balao|${texto}`, 512, 512, (c) => {
    c.fillStyle = '#ffffff';
    c.strokeStyle = '#26232a';
    c.lineWidth = 14;
    c.beginPath();
    c.ellipse(256, 210, 220, 170, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    [[150, 420, 34], [100, 478, 20]].forEach(([x, y, r]) => {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    });
    c.fillStyle = '#26232a';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const linhas = texto.split('\n');
    const fs = linhas.length > 1 ? 80 : texto.length > 3 ? 96 : 170;
    c.font = `900 ${fs}px ${FONT}`;
    linhas.forEach((l, i) => c.fillText(l, 256, 215 + (i - (linhas.length - 1) / 2) * fs * 1.05));
  });
  return (
    <sprite position={position} scale={[size * k, size * k, 1]} renderOrder={10}>
      <spriteMaterial map={tex} transparent depthTest={false} />
    </sprite>
  );
};

// Lâmpada de ideia que acende sobre a cabeça em `at`.
export const Lampada = ({ t, at, position = [0, 2.9, 0] as V3 }: { t: number; at: number; position?: V3 }) => {
  const k = seg(t, at - 2 * F, at + 4 * F, back);
  if (k <= 0.001) return null;
  return (
    <group position={position} scale={k}>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.16, 20, 16]} />
        <Std c="#fff3a0" e="#ffd23a" ei={2.4} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 14]} />
        <Std c="#9aa0a8" m={0.6} r={0.3} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, 0.12 + Math.sin(a) * 0.3, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.1, 0.025, 0.02]} />
            <Std c="#ffd23a" e="#ffd23a" ei={1.5} />
          </mesh>
        );
      })}
      <pointLight intensity={3} distance={3} color="#ffd76a" />
    </group>
  );
};

// Barra de progresso que enche de `from` até `at` e chega no valor (0..1) exatamente na palavra.
export const BarraProgresso = ({ t, from, at, valor = 1, cor = '#5ce07a', ...g }: G & { t: number; from: number; at: number; valor?: number; cor?: string }) => {
  const k = valor * seg(t, from, at - F, easeOut);
  const pct = `${Math.round(k * 100)}%`;
  return (
    <group {...g}>
      <Box p={[0, 0, 0]} s={[2.2, 0.42, 0.12]} c="#1a1f28" r={0.4} />
      <mesh position={[-1.0 + k, 0, 0.065]}>
        <planeGeometry args={[Math.max(0.001, 2.0 * k), 0.26]} />
        <meshBasicMaterial color={cor} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.42, 0.06]}>
        <planeGeometry args={[0.9, 0.34]} />
        <meshBasicMaterial map={labelTex(pct, { w: 512, h: 192, bg: '#1a1f28', fg: '#ffffff', radius: 14 })} toneMapped={false} />
      </mesh>
    </group>
  );
};

// Selo/aviso de tela ("ENVIADO ✓", "ERRO") que surge em `at`.
export const Aviso = ({ t, at, texto = 'ENVIADO ✓', bg = '#1f8a4a', ...g }: G & { t: number; at: number; texto?: string; bg?: string }) => {
  const k = seg(t, at - 2 * F, at + 4 * F, back);
  if (k <= 0.001) return null;
  return (
    <group {...g}>
      <group scale={k}>
        <Box p={[0, 0, 0]} s={[1.5, 0.5, 0.08]} c="#14181e" />
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.44, 0.44]} />
          <meshBasicMaterial map={labelTex(texto, { w: 1024, h: 300, bg, fg: '#ffffff', radius: 14 })} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};


