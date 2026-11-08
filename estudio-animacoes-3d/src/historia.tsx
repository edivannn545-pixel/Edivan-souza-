import { useMemo } from 'react';
import * as THREE from 'three';
import { back, clamp01, easeOut, rand, seg, V3 } from './anim';
import { ELENCO } from './personagens';
import { Look } from './Character';
import { Sign } from './props';
import { Box, WarmLights } from './sets';
import { canvasTex, FONT, labelTex, tileTex } from './textures';

// ============================================================================
// "O truque do pachinko": cenários e objetos novos desta história.
// Tudo é função de t (nada acumulado entre quadros).
// ============================================================================

type G = { position?: V3; rotation?: V3; scale?: number | V3 };

// ---------- Elenco desta história ----------
export const ATENDENTE: Look = { ...ELENCO.funcionario.look, vest: '#c8202e' };
export const JANELA: Look = ELENCO.sombra.look;
export const POLICIA: Look = ELENCO.ramos.look;
export const FIGURANTES: Look[] = [ELENCO.tonhao.look, ELENCO.kaio.look, ELENCO.paula.look, ELENCO.bento.look];

// ---------- Neon ----------
const neonTex = (text: string, color: string, vertical = false) => {
  const w = vertical ? 256 : 1024;
  const h = vertical ? 1024 : 256;
  return canvasTex(`neon|${text}|${color}|${vertical}`, w, h, (c) => {
    c.fillStyle = '#120d1e';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = color;
    c.lineWidth = 10;
    c.shadowColor = color;
    c.shadowBlur = 24;
    c.strokeRect(16, 16, w - 32, h - 32);
    const chars = vertical ? text.split('') : [text];
    let size = vertical ? Math.min(180, (h * 0.86) / chars.length) : h * 0.56;
    c.font = `900 ${size}px ${FONT}`;
    if (!vertical) {
      const wd = c.measureText(text).width;
      if (wd > w * 0.86) size *= (w * 0.86) / wd;
      c.font = `900 ${size}px ${FONT}`;
    }
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    chars.forEach((ch, i) => {
      const y = vertical ? h / 2 + (i - (chars.length - 1) / 2) * size * 0.98 : h / 2;
      c.shadowBlur = 30;
      c.fillStyle = color;
      c.fillText(ch, w / 2, y);
      c.shadowBlur = 0;
      c.fillStyle = '#ffffff';
      c.globalAlpha = 0.55;
      c.fillText(ch, w / 2, y);
      c.globalAlpha = 1;
    });
  });
};

// Letreiro de neon: apagado até `on`, pisca 2 vezes e acende. Brilho com leve pulsação.
export const NeonSign = ({ t, text, color, w = 2, h = 0.5, on = -99, vertical = false, seed = 0, light = false, ...g }: G & { t: number; text: string; color: string; w?: number; h?: number; on?: number; vertical?: boolean; seed?: number; light?: boolean }) => {
  const d = t - on;
  const flick = d < 0 ? 0 : d < 0.1 ? 1 : d < 0.16 ? 0 : d < 0.24 ? 1 : d < 0.28 ? 0.2 : 1;
  const k = (0.18 + 0.82 * flick) * (0.92 + 0.08 * Math.sin(t * 5 + seed * 2.3));
  const col = useMemo(() => new THREE.Color(), []);
  col.setRGB(k, k, k);
  return (
    <group {...g}>
      <mesh castShadow>
        <boxGeometry args={[w + 0.08, h + 0.08, 0.08]} />
        <meshStandardMaterial color="#14101e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={neonTex(text, color, vertical)} color={col} toneMapped={false} />
      </mesh>
      {light && flick > 0.5 && <pointLight position={[0, 0, 0.8]} color={color} intensity={4 * k} distance={5} decay={1.6} />}
    </group>
  );
};

// Luz noturna: céu roxo escuro, névoa, luar frio e preenchimento suave.
export const NightLights = ({ bg = '#241a3e', fog = [10, 34] as [number, number] }: { bg?: string; fog?: [number, number] }) => (
  <WarmLights sun={[-4, 8, 6]} bg={bg} sky="#b8b0ff" ground="#40284a" fill={1.15} power={1.25} fog={fog} />
);

const NEON = ['#ff3d8b', '#3df2ff', '#ffd23a', '#7dff6a', '#b06bff', '#ff8a3d'];
const PALAVRAS = ['RAMEN', 'KARAOKE', 'HOTEL', 'SUSHI', 'GAMES', 'CAFE', 'BAR', 'TAXI'];

// ---------- Rua de neon (corre ao longo de -Z) ----------
// `acende`: tempo em que todos os letreiros da rua acendem em cascata (padrão: já acesos).
export const NeonStreet = ({ t, acende = -99, placa, placaOn = -99 }: { t: number; acende?: number; placa?: string; placaOn?: number }) => (
  <group>
    <NightLights />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -15]}>
      <planeGeometry args={[40, 70]} />
      <meshStandardMaterial color="#2e2640" roughness={0.3} metalness={0.2} />
    </mesh>
    {/* faixas da rua */}
    {Array.from({ length: 14 }, (_, i) => (
      <Box key={i} p={[0, 0.005, 4 - i * 3]} s={[0.12, 0.01, 1.4]} c="#d8d2c0" />
    ))}
    {[-1, 1].map((sd) => (
      <group key={sd}>
        <Box p={[sd * 3.4, 0.08, -15]} s={[1.6, 0.16, 70]} c="#4a4258" />
        {Array.from({ length: 9 }, (_, i) => {
          const z = 3 - i * 5;
          const hgt = 6 + rand(i * 3 + sd) * 6;
          const cor = ['#3a2f55', '#2f3a55', '#4a2f45', '#353048'][(i + (sd > 0 ? 1 : 0)) % 4];
          const n = i + (sd > 0 ? 9 : 0);
          return (
            <group key={i}>
              <Box p={[sd * 6.2, hgt / 2, z]} s={[4, hgt, 4.6]} c={cor} r={0.7} />
              {/* janelas acesas */}
              {Array.from({ length: Math.floor(hgt / 1.6) }, (_, j) => (
                <mesh key={j} position={[sd * 4.18, 2.4 + j * 1.5, z + (rand(n * 7 + j) - 0.5) * 2.4]} rotation={[0, -sd * Math.PI / 2, 0]}>
                  <planeGeometry args={[0.9, 0.7]} />
                  <meshBasicMaterial color={rand(n + j) > 0.4 ? '#ffd99a' : '#5a4a70'} toneMapped={false} />
                </mesh>
              ))}
              {/* letreiro vertical saindo da fachada, de frente para quem olha a rua */}
              <NeonSign
                t={t}
                text={PALAVRAS[n % PALAVRAS.length]}
                color={NEON[n % NEON.length]}
                vertical
                w={0.62}
                h={2.6}
                seed={n}
                on={acende + i * 0.07}
                position={[sd * 3.75, 3.1 + rand(n + 2) * 1.6, z + 1.2]}
              />
              {/* toldo */}
              <Box p={[sd * 3.95, 2.4, z]} s={[0.5, 0.08, 3.6]} c={NEON[(n + 2) % NEON.length]} r={0.5} />
            </group>
          );
        })}
      </group>
    ))}
    {/* lanternas vermelhas penduradas */}
    {Array.from({ length: 8 }, (_, i) => (
      <group key={i}>
        {[-2.2, 2.2].map((x) => (
          <mesh key={x} position={[x, 3.2, 1 - i * 4]} scale={[1, 1.25, 1]}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshBasicMaterial color="#ff5a3c" toneMapped={false} />
          </mesh>
        ))}
      </group>
    ))}
    <pointLight position={[-2.5, 3.5, 1]} color="#ff3d8b" intensity={6} distance={9} decay={1.5} />
    <pointLight position={[2.5, 3.5, -2]} color="#3df2ff" intensity={6} distance={9} decay={1.5} />
    {placa && <NeonSign t={t} text={placa} color="#ff3d8b" w={3.4} h={0.9} on={placaOn} position={[0, 4.4, -7]} light />}
  </group>
);

// ---------- Fachada do pachinko (rua à noite + prédio de frente) ----------
export const PachinkoFront = ({ t, on = -99, h24 = -99 }: { t: number; on?: number; h24?: number }) => (
  <group>
    <NightLights fog={[12, 36]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#2e2640" roughness={0.3} metalness={0.2} />
    </mesh>
    <Box p={[0, 0.06, -2.6]} s={[30, 0.12, 2.4]} c="#4a4258" />
    {/* prédio */}
    <Box p={[0, 4, -4.4]} s={[9, 8, 1.2]} c="#2b1d3f" r={0.6} />
    <Box p={[-8.6, 4.5, -5.5]} s={[8, 9, 2]} c="#2f3a55" />
    <Box p={[8.6, 3.8, -5.5]} s={[8, 7.6, 2]} c="#3a2f55" />
    <NeonSign t={t} text="PACHINKO" color="#ffd23a" w={6} h={1.3} on={on} position={[0, 5.6, -3.7]} light />
    {/* lâmpadas que correm em volta do letreiro */}
    {Array.from({ length: 26 }, (_, i) => {
      const per = 2 * (6.6 + 1.9);
      let s = (i / 26) * per;
      let x = 0;
      let y = 0;
      if (s < 6.6) [x, y] = [-3.3 + s, 6.55];
      else if ((s -= 6.6) < 1.9) [x, y] = [3.3, 6.55 - s];
      else if ((s -= 1.9) < 6.6) [x, y] = [3.3 - s, 4.65];
      else [x, y] = [-3.3, 4.65 + (s - 6.6)];
      const lit = t >= on && Math.floor(t * 8 + i) % 3 === 0;
      return (
        <mesh key={i} position={[x, y, -3.68]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshBasicMaterial color={lit ? '#fff3b0' : t >= on ? '#c98a2a' : '#4a3a2a'} toneMapped={false} />
        </mesh>
      );
    })}
    <NeonSign t={t} text="24H" color="#3df2ff" w={1.5} h={0.7} on={h24} position={[3.0, 3.4, -3.7]} light />
    <NeonSign t={t} text="ABERTO" color="#7dff6a" w={1.7} h={0.5} on={h24} position={[-3.0, 3.4, -3.7]} />
    {/* portas de vidro com luz forte lá dentro */}
    <mesh position={[0, 1.4, -3.78]}>
      <planeGeometry args={[2.6, 2.8]} />
      <meshBasicMaterial color="#ffe6a6" toneMapped={false} />
    </mesh>
    <Box p={[0, 1.4, -3.76]} s={[0.06, 2.8, 0.04]} c="#1a1424" />
    <Box p={[0, 2.85, -3.74]} s={[2.8, 0.12, 0.08]} c="#1a1424" />
    <pointLight position={[0, 1.6, -2.6]} color="#ffd98a" intensity={8} distance={7} decay={1.4} />
    <pointLight position={[0, 5.6, -2.6]} color="#ffd23a" intensity={6} distance={8} decay={1.5} />
    {[-4.6, 4.6].map((x) => (
      <group key={x}>
        <mesh position={[x, 1.6, -2.1]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 3.2, 12]} />
          <meshStandardMaterial color="#1a1424" />
        </mesh>
        <mesh position={[x, 3.3, -2.1]}>
          <sphereGeometry args={[0.22, 16, 12]} />
          <meshBasicMaterial color="#ffe7a8" toneMapped={false} />
        </mesh>
      </group>
    ))}
  </group>
);

// ---------- Máquina de pachinko ----------
const playfieldTex = (hue: string) =>
  canvasTex(`playfield|${hue}`, 256, 340, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 340);
    g.addColorStop(0, hue);
    g.addColorStop(1, '#1a1030');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 340);
    c.strokeStyle = '#f2d36b';
    c.lineWidth = 8;
    c.beginPath();
    c.arc(128, 160, 112, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = '#ffffff';
    for (let r = 0; r < 9; r++)
      for (let k = 0; k < 7; k++) {
        const x = 40 + k * 30 + (r % 2) * 15;
        const y = 70 + r * 22;
        if ((x - 128) ** 2 + (y - 160) ** 2 < 100 ** 2) c.fillRect(x - 2, y - 2, 4, 4);
      }
    c.fillStyle = '#ff3d8b';
    c.beginPath();
    c.arc(128, 160, 34, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#ffd23a';
    c.font = `900 40px ${FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('777', 128, 162);
    c.fillStyle = '#3df2ff';
    c.fillRect(100, 280, 56, 20);
  });

const BALL = { color: '#e8ecf2', metalness: 0.9, roughness: 0.18 } as const;

// Máquina vista de frente (+Z). `seed` muda cores e o ritmo das bolinhas. `win`: tempo do prêmio (bolinhas jorram).
export const PachinkoMachine = ({ t, seed = 0, win = -99, balls = true, ...g }: G & { t: number; seed?: number; win?: number; balls?: boolean }) => {
  const hue = NEON[seed % NEON.length];
  const blink = Math.floor(t * 6 + seed * 1.7) % 2 === 0;
  const jackpot = t >= win && t < win + 2.5;
  return (
    <group {...g}>
      <Box p={[0, 0.95, 0]} s={[0.9, 1.9, 0.5]} c={['#c8202e', '#2f5fa8', '#d6a22a', '#7a3ab0'][seed % 4]} r={0.35} />
      <Box p={[0, 1.95, 0.02]} s={[0.94, 0.14, 0.54]} c="#f2f2f2" r={0.3} />
      {/* lâmpada do topo */}
      <mesh position={[0, 2.12, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.16, 16]} />
        <meshBasicMaterial color={jackpot ? (blink ? '#ffffff' : '#ffd23a') : blink ? hue : '#3a2a4a'} toneMapped={false} />
      </mesh>
      {/* vidro com o campo de pinos */}
      <mesh position={[0, 1.3, 0.252]}>
        <planeGeometry args={[0.76, 1.0]} />
        <meshBasicMaterial map={playfieldTex(hue)} toneMapped={false} />
      </mesh>
      {/* luzinhas da moldura */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const on = (Math.floor(t * 10) + i + seed) % 4 === 0 || jackpot;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.42, 1.3 + Math.sin(a) * 0.56, 0.26]}>
            <sphereGeometry args={[0.028, 8, 6]} />
            <meshBasicMaterial color={on ? '#fff6c0' : '#6a4a2a'} toneMapped={false} />
          </mesh>
        );
      })}
      {/* bolinhas caindo pelos pinos */}
      {balls &&
        Array.from({ length: jackpot ? 14 : 6 }, (_, i) => {
          const sp = 0.55 + rand(i + seed * 13) * 0.3;
          const ph = (t * sp + rand(i * 3 + seed)) % 1;
          const y = 1.75 - ph * 0.9;
          const x = (rand(i + 5 + seed) - 0.5) * 0.5 + Math.sin(ph * 18 + i) * 0.05;
          return (
            <mesh key={i} position={[x, y, 0.27]}>
              <sphereGeometry args={[0.022, 10, 8]} />
              <meshStandardMaterial {...BALL} />
            </mesh>
          );
        })}
      {/* bandeja de bolinhas */}
      <Box p={[0, 0.68, 0.36]} s={[0.7, 0.12, 0.26]} c="#d8d8de" r={0.25} />
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.26 + (i % 5) * 0.13, 0.77, 0.32 + Math.floor(i / 5) * 0.08]}>
          <sphereGeometry args={[0.04, 10, 8]} />
          <meshStandardMaterial {...BALL} />
        </mesh>
      ))}
      {/* alavanca */}
      <mesh position={[0.3, 0.5, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
};

// Banquinho redondo.
export const Stool = (g: G) => (
  <group {...g}>
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.08, 0.6, 10]} />
      <meshStandardMaterial color="#3a3a42" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.63, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.22, 0.08, 20]} />
      <meshStandardMaterial color="#c8202e" roughness={0.5} />
    </mesh>
  </group>
);

// ---------- Salão do pachinko: duas fileiras de máquinas ao longo de -Z ----------
// As máquinas olham para o corredor (x = 0). Máquina i da esquerda (0..15) fica em x = -2.9, z = 1.5 - i;
// as da direita são 16..31 em x = +2.9. `semBanco`: índices sem banquinho (lugar de quem está jogando em pé).
export const PachinkoHall = ({ t, win = -99, winIndex = -1, semBanco = [] }: { t: number; win?: number; winIndex?: number; semBanco?: number[] }) => {
  const piso = tileTex('#7a1e3a', '#4a1028', 24);
  return (
    <group>
      <WarmLights sun={[-2, 9, 4]} bg="#2a1530" sky="#ffe6f2" ground="#4a1a2a" fill={1.1} power={1.3} fog={[9, 30]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -10]}>
        <planeGeometry args={[14, 40]} />
        <meshStandardMaterial map={piso} roughness={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.6, -10]}>
        <planeGeometry args={[14, 40]} />
        <meshStandardMaterial color="#1e1426" />
      </mesh>
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Box p={[sd * 3.4, 1.8, -10]} s={[0.3, 3.6, 40]} c="#3a1f45" />
          {Array.from({ length: 16 }, (_, i) => {
            const idx = i + (sd > 0 ? 16 : 0);
            const z = 1.5 - i * 1.0;
            return (
              <group key={i}>
                <PachinkoMachine t={t} seed={idx} position={[sd * 2.9, 0, z]} rotation={[0, -sd * Math.PI / 2, 0]} win={idx === winIndex ? win : -99} />
                {!semBanco.includes(idx) && <Stool position={[sd * 2.0, 0, z]} />}
              </group>
            );
          })}
        </group>
      ))}
      {/* faixas de luz no teto */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, 3.55, 1 - i * 4]}>
          <boxGeometry args={[3.2, 0.06, 0.3]} />
          <meshBasicMaterial color={Math.floor(t * 3 + i) % 2 ? '#ff7ab8' : '#7af2ff'} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, 3, 0]} color="#ffb0d8" intensity={8} distance={10} decay={1.4} />
      <pointLight position={[0, 3, -6]} color="#b0f0ff" intensity={8} distance={10} decay={1.4} />
    </group>
  );
};

// ---------- Balde de bolinhas ----------
export const Bucket = ({ fill = 1, ...g }: G & { fill?: number }) => (
  <group {...g}>
    <mesh castShadow position={[0, 0.17, 0]}>
      <cylinderGeometry args={[0.24, 0.18, 0.34, 24, 1, true]} />
      <meshStandardMaterial color="#2f8fd8" roughness={0.4} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0.005, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 0.01, 24]} />
      <meshStandardMaterial color="#2f8fd8" />
    </mesh>
    {fill > 0 &&
      Array.from({ length: 34 }, (_, i) => {
        const a = i * 2.4;
        const r = 0.2 * Math.sqrt((i % 17) / 17);
        const layer = Math.floor(i / 17);
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.06 + 0.3 * fill + layer * 0.07 - r * 0.25, Math.sin(a) * r]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial {...BALL} />
          </mesh>
        );
      })}
  </group>
);

// ---------- Prêmios ----------
export const Chocolate = (g: G) => (
  <group {...g}>
    <Box p={[0, 0.04, 0]} s={[0.36, 0.08, 0.16]} c="#5a2e18" r={0.5} />
    <Box p={[0, 0.042, 0]} s={[0.14, 0.086, 0.165]} c="#e8b931" r={0.3} />
    <mesh position={[0, 0.042, 0.083]}>
      <planeGeometry args={[0.34, 0.07]} />
      <meshStandardMaterial map={labelTex('CHOCOLATE', { w: 512, h: 104, fg: '#fff3d6' })} transparent />
    </mesh>
  </group>
);

export const Shampoo = (g: G) => (
  <group {...g}>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.09, 0.3, 20]} />
      <meshStandardMaterial color="#5cc8e8" roughness={0.25} />
    </mesh>
    <mesh position={[0, 0.34, 0]} castShadow>
      <cylinderGeometry args={[0.04, 0.06, 0.08, 16]} />
      <meshStandardMaterial color="#ff5a9a" />
    </mesh>
    <mesh position={[0, 0.15, 0.091]}>
      <planeGeometry args={[0.14, 0.12]} />
      <meshStandardMaterial map={labelTex('XAMPU', { w: 256, h: 220, bg: '#ffffff', fg: '#2f6fb3', radius: 10 })} />
    </mesh>
  </group>
);

export const Ursinho = (g: G) => (
  <group {...g}>
    <mesh position={[0, 0.12, 0]} castShadow>
      <sphereGeometry args={[0.12, 16, 12]} />
      <meshStandardMaterial color="#c98a4a" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.3, 0]} castShadow>
      <sphereGeometry args={[0.09, 16, 12]} />
      <meshStandardMaterial color="#c98a4a" roughness={0.9} />
    </mesh>
    {[-1, 1].map((s) => (
      <group key={s}>
        <mesh position={[s * 0.07, 0.38, 0]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshStandardMaterial color="#a86a34" />
        </mesh>
        <mesh position={[s * 0.035, 0.32, 0.08]}>
          <sphereGeometry args={[0.013, 8, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    ))}
    <mesh position={[0, 0.28, 0.085]}>
      <sphereGeometry args={[0.03, 10, 8]} />
      <meshStandardMaterial color="#f0d2a8" />
    </mesh>
    <mesh position={[0, 0.2, 0.06]} rotation={[0.3, 0, 0]}>
      <torusGeometry args={[0.05, 0.012, 6, 16]} />
      <meshStandardMaterial color="#d8352f" />
    </mesh>
  </group>
);

// Pop com overshoot (objeto surgindo na palavra).
export const pop = (t: number, at: number) => Math.max(0.001, seg(t, at - 0.2, at - 0.03, back));

// ---------- Balcão de prêmios (dentro do pachinko) ----------
// Atendente atrás do balcão em y = 0.75, z = -0.95. `acende`: prateleiras se iluminam.
export const PrizeCounter = ({ t, acende = -99 }: { t: number; acende?: number }) => {
  const lit = t >= acende;
  return (
    <group>
      <WarmLights sun={[-3, 7, 6]} bg="#5a1a35" sky="#fff0f6" ground="#4a1a2a" fill={1.05} power={1.8} fog={[12, 34]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={tileTex('#7a1e3a', '#4a1028', 20)} roughness={0.6} />
      </mesh>
      <Box p={[0, 3, -3]} s={[16, 6, 0.3]} c="#7a2340" r={0.6} />
      <Sign text="PRÊMIOS" w={3.2} h={0.6} position={[0, 3.55, -2.8]} bg="#2b1d3f" fg="#ffd23a" />
      {/* prateleiras com prêmios */}
      {[0, 1, 2].map((r) => (
        <group key={r}>
          <Box p={[0, 1.15 + r * 0.6, -2.7]} s={[4.6, 0.06, 0.4]} c={lit ? '#fff3c8' : '#c9a080'} r={0.5} />
          {Array.from({ length: 9 }, (_, i) => {
            const x = -2.0 + i * 0.5;
            const kind = (i + r) % 3;
            const s = lit ? 1 : 0.92;
            const p: V3 = [x, 1.18 + r * 0.6, -2.62];
            return kind === 0 ? <Chocolate key={i} position={p} scale={s} /> : kind === 1 ? <Shampoo key={i} position={p} scale={s * 0.9} /> : <Ursinho key={i} position={p} scale={s * 0.9} />;
          })}
        </group>
      ))}
      {lit && <pointLight position={[0, 2.2, -1.6]} color="#fff0c0" intensity={6} distance={5} decay={1.4} />}
      {/* balcão */}
      <Box p={[0, 0.375, -0.95]} s={[4.2, 0.75, 1.1]} c="#2b1d3f" />
      <Box p={[0, 0.5, 0]} s={[4.2, 1.0, 0.8]} c="#c8202e" r={0.45} />
      <Box p={[0, 1.03, 0]} s={[4.4, 0.07, 0.95]} c="#f4efe6" r={0.2} />
      {[-1.4, 0, 1.4].map((x) => (
        <Box key={x} p={[x, 0.5, 0.41]} s={[1.1, 0.7, 0.03]} c="#ffd23a" r={0.4} />
      ))}
      {[-4.5, 4.5].map((x) => (
        <PachinkoMachine key={x} t={t} seed={x > 0 ? 3 : 5} position={[x, 0, -2.2]} />
      ))}
    </group>
  );
};

// ---------- Lojinha com janelinha (rua à noite) ----------
// A janelinha fica em x = 0, centro y = 1.55, na face z = 0.
// O atendente da janela (Sombra) fica atrás: position z ≈ -0.6.
// `abre`: tempo em que a portinhola sobe.
export const WindowShop = ({ t, abre = -99, placa = 'COMPRA DE PRÊMIOS' }: { t: number; abre?: number; placa?: string }) => {
  const k = seg(t, abre - 0.3, abre - 0.03, easeOut);
  const parede = '#4a5a6a';
  return (
    <group>
      <NightLights bg="#1e1a36" fog={[10, 30]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#2e2640" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* corpo da lojinha */}
      <Box p={[-1.27, 1.4, -1.2]} s={[0.06, 2.8, 2.4]} c="#3a3a4a" />
      <Box p={[1.27, 1.4, -1.2]} s={[0.06, 2.8, 2.4]} c="#3a3a4a" />
      <Box p={[0, 2.83, -1.2]} s={[2.6, 0.06, 2.4]} c="#3a3a4a" />
      {/* frente com o buraco da janela (0.7 x 0.5) */}
      <Box p={[0, 0.65, 0.02]} s={[2.6, 1.3, 0.08]} c={parede} />
      <Box p={[0, 2.25, 0.02]} s={[2.6, 1.1, 0.08]} c={parede} />
      <Box p={[-0.87, 1.55, 0.02]} s={[0.86, 0.5, 0.08]} c={parede} />
      <Box p={[0.87, 1.55, 0.02]} s={[0.86, 0.5, 0.08]} c={parede} />
      {/* moldura e parapeito */}
      <Box p={[0, 1.29, 0.12]} s={[0.86, 0.04, 0.22]} c="#c9b48a" />
      <Box p={[0, 1.82, 0.07]} s={[0.8, 0.04, 0.1]} c="#c9b48a" />
      {/* portinhola que sobe */}
      <Box p={[0, 1.55 + k * 0.5, 0.075]} s={[0.72, 0.52, 0.03]} c="#8a96a6" r={0.4} />
      {/* luz lá dentro */}
      <pointLight position={[0, 1.7, -0.3]} color="#ffe2a0" intensity={3 + 4 * k} distance={2.5} decay={1.4} />
      <mesh position={[0, 1.4, -2.38]}>
        <planeGeometry args={[2.5, 2.7]} />
        <meshBasicMaterial color="#5a4a30" />
      </mesh>
      <Sign text={placa} w={2.4} h={0.42} position={[0, 2.5, 0.08]} bg="#1b2a3a" fg="#ffe7a8" />
      {/* poste e vizinhos */}
      <Box p={[-4.4, 3.5, -2]} s={[5, 7, 3]} c="#2f3a55" />
      <Box p={[4.4, 3, -2]} s={[5, 6, 3]} c="#3a2f55" />
      <NeonSign t={t} text="RAMEN" color="#ff3d8b" vertical w={0.5} h={2} position={[-2.1, 3.6, 0.2]} seed={2} />
      <NeonSign t={t} text="BAR" color="#3df2ff" vertical w={0.5} h={1.4} position={[2.1, 3.4, 0.2]} seed={5} />
      <mesh position={[-1.7, 1.5, 0.3]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 3, 10]} />
        <meshStandardMaterial color="#1a1424" />
      </mesh>
      <mesh position={[-1.7, 3.05, 0.3]}>
        <sphereGeometry args={[0.18, 14, 10]} />
        <meshBasicMaterial color="#ffe7a8" toneMapped={false} />
      </mesh>
      <pointLight position={[-1.7, 2.8, 1.2]} color="#ffd98a" intensity={5} distance={6} decay={1.4} />
    </group>
  );
};

// ---------- Papel com um rótulo (registro) ----------
const checkRowTex = (text: string, ok: boolean) =>
  canvasTex(`row|${text}|${ok}`, 768, 160, (c) => {
    c.fillStyle = '#fbf8f0';
    c.fillRect(0, 0, 768, 160);
    c.strokeStyle = '#b8c8e0';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(20, 150);
    c.lineTo(748, 150);
    c.stroke();
    c.fillStyle = '#26324a';
    c.font = `900 78px ${FONT}`;
    c.textBaseline = 'middle';
    c.fillText(text, 40, 84);
    c.strokeStyle = '#2a8a3a';
    c.lineWidth = 8;
    c.strokeRect(612, 30, 100, 100);
    if (ok) {
      c.lineWidth = 18;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(626, 80);
      c.lineTo(656, 116);
      c.lineTo(712, 22);
      c.stroke();
    }
  });

// Quadro de registro: cada linha ganha o ✓ na sua palavra.
export const RecordBoard = ({ t, rows, ...g }: G & { t: number; rows: { text: string; at: number }[] }) => (
  <group {...g}>
    <Box p={[0, 0, -0.03]} s={[2.0, 0.5 + rows.length * 0.42, 0.06]} c="#8a5a32" />
    <mesh position={[0, 0.02 + (rows.length * 0.42) / 2, 0.01]}>
      <planeGeometry args={[1.8, 0.3]} />
      <meshStandardMaterial map={labelTex('REGISTRO', { w: 768, h: 128, bg: '#26324a', fg: '#ffffff', radius: 12 })} />
    </mesh>
    {rows.map((r, i) => {
      const s = seg(t, r.at - 0.25, r.at - 0.05, back);
      return (
        <group key={i} position={[0, (rows.length * 0.42) / 2 - 0.3 - i * 0.42, 0.01]}>
          <mesh scale={[1, 1, 1]}>
            <planeGeometry args={[1.8, 0.375]} />
            <meshStandardMaterial map={checkRowTex(r.text, t >= r.at - 0.05)} />
          </mesh>
          {s > 0 && s < 1 && (
            <mesh position={[0.66, 0, 0.02]} scale={1 + 0.4 * Math.sin(s * Math.PI)}>
              <ringGeometry args={[0.14, 0.17, 24]} />
              <meshBasicMaterial color="#5ad86a" transparent opacity={1 - s} />
            </mesh>
          )}
        </group>
      );
    })}
  </group>
);

// Folha de papel em pé com um título grande.
export const Paper = ({ text, color = '#c8202e', ...g }: G & { text: string; color?: string }) => (
  <group {...g}>
    <Box p={[0, 0, -0.01]} s={[0.9, 1.15, 0.02]} c="#fbf8f0" r={0.9} />
    <mesh position={[0, 0.3, 0.002]}>
      <planeGeometry args={[0.8, 0.28]} />
      <meshStandardMaterial map={labelTex(text, { w: 512, h: 180, fg: color })} transparent />
    </mesh>
    {[0, 1, 2, 3].map((i) => (
      <Box key={i} p={[0, 0.02 - i * 0.14, 0.002]} s={[0.66 - (i % 2) * 0.18, 0.035, 0.004]} c="#9aa6b8" />
    ))}
  </group>
);

// Mesa com dados e cartas ("jogos de azar").
export const GamblingTable = (g: G) => (
  <group {...g}>
    <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.85, 0.85, 0.08, 40]} />
      <meshStandardMaterial color="#1f7a4a" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.85, 0.05, 8, 40]} />
      <meshStandardMaterial color="#6b3a1e" />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.25, 0.8, 16]} />
      <meshStandardMaterial color="#6b3a1e" />
    </mesh>
    {[[-0.3, 0.2, 0.4], [0.05, 0.3, -0.5]].map(([x, z, r], i) => (
      <mesh key={i} position={[x, 0.95, z]} rotation={[0, r, 0]} castShadow>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial map={diceTex()} />
      </mesh>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[0.35 + i * 0.06, 0.865 + i * 0.002, -0.1 + i * 0.05]} rotation={[-Math.PI / 2, 0, 0.2 + i * 0.3]}>
        <planeGeometry args={[0.2, 0.28]} />
        <meshStandardMaterial map={cardTex(['A', 'K', '7', 'Q'][i])} />
      </mesh>
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <mesh key={i} position={[-0.45, 0.875 + i * 0.03, -0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.028, 20]} />
        <meshStandardMaterial color={i % 2 ? '#c8202e' : '#f2f2f2'} />
      </mesh>
    ))}
  </group>
);

const diceTex = () =>
  canvasTex('dice', 128, 128, (c) => {
    c.fillStyle = '#fbfbf8';
    c.fillRect(0, 0, 128, 128);
    c.fillStyle = '#c8202e';
    [[32, 32], [96, 96], [64, 64], [32, 96], [96, 32]].forEach(([x, y]) => {
      c.beginPath();
      c.arc(x, y, 11, 0, Math.PI * 2);
      c.fill();
    });
  });

const cardTex = (v: string) =>
  canvasTex(`card|${v}`, 128, 180, (c) => {
    c.fillStyle = '#fbfbf8';
    c.fillRect(0, 0, 128, 180);
    c.fillStyle = v === 'K' || v === 'Q' ? '#1a1a1a' : '#c8202e';
    c.font = `900 80px ${FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(v, 64, 92);
  });

// Placa "✗" vermelha (dinheiro NÃO).
export const NoSign = ({ k = 1, ...g }: G & { k?: number }) => (
  <group {...g} scale={Math.max(0.001, k)}>
    <mesh>
      <torusGeometry args={[0.42, 0.06, 10, 40]} />
      <meshStandardMaterial color="#e0262e" />
    </mesh>
    <mesh rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[0.84, 0.12, 0.06]} />
      <meshStandardMaterial color="#e0262e" />
    </mesh>
  </group>
);

// Mini-prédio para o "mapa" das três etapas.
export const MiniBuilding = ({ t, text, color, wall = '#2b1d3f', ...g }: G & { t: number; text: string; color: string; wall?: string }) => (
  <group {...g}>
    <Box p={[0, 0.6, 0]} s={[1.1, 1.2, 0.9]} c={wall} />
    <Box p={[0, 1.24, 0]} s={[1.2, 0.08, 1.0]} c="#1a1424" />
    <NeonSign t={t} text={text} color={color} w={1.0} h={0.3} position={[0, 0.98, 0.46]} />
    <mesh position={[0, 0.35, 0.451]}>
      <planeGeometry args={[0.36, 0.6]} />
      <meshBasicMaterial color="#ffe6a6" toneMapped={false} />
    </mesh>
  </group>
);

// Lâmpada de ideia que aparece acima da cabeça.
export const IdeaBulb = ({ t, at, ...g }: G & { t: number; at: number }) => {
  const s = seg(t, at - 0.2, at - 0.02, back);
  if (s <= 0) return null;
  return (
    <group {...g} scale={s}>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.16, 20, 16]} />
        <meshBasicMaterial color="#fff2a0" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 14]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.7} roughness={0.3} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, 0.12 + Math.sin(a) * 0.3, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.1, 0.025, 0.02]} />
            <meshBasicMaterial color="#ffd23a" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

export const clampK = clamp01;
