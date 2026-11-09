import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import { rand, V3 } from './anim';
import { Bandeirolas, Banco, Barril, Baia, Cabine, Cadeira, Cacto, Caneca, Cartaz, Celular, Escada, Estandarte, FilaCordao, JanelaPersiana, Mesa, Monitor, PlacaMadeira, PlacaMesa, Planta, QuadroPartidas, RelogioParede } from './objetos';
import { Box } from './sets';
import { canvasTex } from './textures';

// ============================================================================
// CENÁRIOS NO ESTILO DOS SHORTS DE REFERÊNCIA (REFERENCIAS.md)
// Regra: o personagem principal fica perto da origem olhando para +Z; o cenário se estende para -Z.
// Cada cenário traz luz, fundo, névoa e objetos pequenos em volta. `t` anima relógios, neon e chamas.
// ============================================================================

const Fundo = ({ bg, near, far }: { bg: string; near: number; far: number }) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, near, far);
  }, [scene, bg, near, far]);
  return null;
};

type LuzP = { bg: string; ceu: string; chao: string; fill: number; sol: string; forca: number; pos?: V3; fog?: [number, number] };
const Luz = ({ bg, ceu, chao, fill, sol, forca, pos = [-4, 8, 6], fog = [14, 45] }: LuzP) => (
  <>
    <Fundo bg={bg} near={fog[0]} far={fog[1]} />
    <hemisphereLight args={[ceu, chao, fill]} />
    <directionalLight
      position={pos}
      intensity={forca}
      color={sol}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-9}
      shadow-camera-right={9}
      shadow-camera-top={9}
      shadow-camera-bottom={-9}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
    <directionalLight position={[3, 4, 8]} intensity={forca * 0.3} color="#dfe8ff" />
  </>
);

// ---------- Texturas de chão ----------
const granilite = (base: string, pontos: string[]) =>
  canvasTex(`granilite|${base}|${pontos.join()}`, 512, 512, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      c.fillStyle = pontos[i % pontos.length];
      const r = 1.5 + rand(i) * 3.5;
      c.beginPath();
      c.ellipse(rand(i + 1) * 512, rand(i + 2) * 512, r, r * (0.6 + rand(i + 3) * 0.5), rand(i) * 3, 0, Math.PI * 2);
      c.fill();
    }
  }, [6, 6]);

const pisoEscritorio = () =>
  canvasTex('piso-escritorio', 512, 512, (c) => {
    c.fillStyle = '#c9c2b2';
    c.fillRect(0, 0, 512, 512);
    c.strokeStyle = 'rgba(90,80,60,0.25)';
    c.lineWidth = 4;
    for (let i = 0; i <= 4; i++) {
      c.beginPath();
      c.moveTo(i * 128, 0);
      c.lineTo(i * 128, 512);
      c.moveTo(0, i * 128);
      c.lineTo(512, i * 128);
      c.stroke();
    }
  }, [10, 10]);

const pedraMuralha = (base: string) =>
  canvasTex(`muralha|${base}`, 512, 512, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 512, 512);
    for (let r = 0; r < 8; r++)
      for (let k = 0; k < 5; k++) {
        const x = ((k + (r % 2) * 0.5) * 112) % 560 - 20, y = r * 64;
        const tom = 0.9 + rand(r * 9 + k) * 0.2;
        c.fillStyle = `rgba(${Math.round(150 * tom)},${Math.round(150 * tom)},${Math.round(145 * tom)},1)`;
        c.beginPath();
        c.roundRect(x + 3, y + 3, 106, 58, 10);
        c.fill();
      }
  }, [3, 2]);

const metalNave = () =>
  canvasTex('metal-nave', 512, 512, (c) => {
    c.fillStyle = '#c4cad3';
    c.fillRect(0, 0, 512, 512);
    c.strokeStyle = 'rgba(60,70,90,0.35)';
    c.lineWidth = 5;
    for (let i = 0; i <= 2; i++) {
      c.strokeRect(i * 256 + 6, 6, 244, 244);
      c.strokeRect(i * 256 + 6, 262, 244, 244);
    }
    c.fillStyle = 'rgba(60,70,90,0.45)';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      c.beginPath();
      c.arc(20 + i * 256 + (i % 2) * 210, 20 + j * 128, 6, 0, Math.PI * 2);
      c.fill();
    }
  }, [4, 2]);

// ============================================================================
// ESCRITÓRIO — parede bege, janelas com persiana e cidade, baias, mesas, relógio, cartazes.
// clima: 'dia' (quente) | 'frio' (cinza-azulado, vazio/triste) | 'festa' (bandeirolas). hora: ponteiros do relógio (anime para o tempo voar).
// Mesa principal: frente em z ≈ 0.6, personagem sentado/atrás em z ≈ -0.3.
// ============================================================================
export const Escritorio = ({ t = 0, clima = 'dia' as 'dia' | 'frio' | 'festa', noite = false, cargo, hora }: { t?: number; clima?: 'dia' | 'frio' | 'festa'; noite?: boolean; cargo?: string; hora?: number }) => {
  const frio = clima === 'frio';
  const parede = frio ? '#9aa3ae' : '#d9cdb4';
  return (
    <group>
      <Luz bg={frio ? '#7d8794' : '#cdbf9f'} ceu={frio ? '#d8e2f0' : '#fff2dc'} chao={frio ? '#4a505a' : '#7a6a50'} fill={1.0} sol={frio ? '#dfe8ff' : '#ffe6c0'} forca={frio ? 1.4 : 2.0} fog={[14, 40]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={pisoEscritorio()} color={frio ? '#b4b8be' : '#ffffff'} roughness={0.8} />
      </mesh>
      {/* paredes */}
      <Box p={[0, 2.2, -3.2]} s={[16, 4.4, 0.2]} c={parede} r={0.9} />
      <Box p={[-5.5, 2.2, 0]} s={[0.2, 4.4, 14]} c={parede} r={0.9} />
      <Box p={[0, 0.08, -3.08]} s={[16, 0.16, 0.06]} c={frio ? '#6c747d' : '#a8946e'} />
      {/* janelas e relógio */}
      <JanelaPersiana position={[-1.4, 2.3, -3.05]} noite={noite} />
      <JanelaPersiana position={[2.6, 2.3, -3.05]} noite={noite} />
      <RelogioParede t={t} hora={hora ?? (noite ? 21.3 : 9.6)} position={[0.6, 3.3, -3.05]} />
      <Cartaz texto={'TRABALHO\nEM EQUIPE'} position={[4.6, 2.3, -3.05]} />
      <Cartaz texto={'TAREFAS\nDE HOJE:\n☐\n☐'} bg="#f4f1e8" w={0.8} h={1.0} position={[-3.6, 2.2, -3.05]} />
      {/* luminárias do teto */}
      {[-2.5, 1.5].map((z) =>
        [-2, 2].map((x) => (
          <mesh key={`${x}${z}`} position={[x, 4.3, z]}>
            <boxGeometry args={[1.4, 0.06, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive="#fff6e0" emissiveIntensity={frio ? 0.6 : 1.4} />
          </mesh>
        )),
      )}
      {/* baias ao fundo com mesas e monitores */}
      {[-3.2, 3.4].map((x) => (
        <group key={x} position={[x, 0, -1.6]}>
          <Baia w={2.2} position={[0, 0, -0.6]} cor={frio ? '#8a939c' : '#a3aab3'} />
          <Mesa w={1.8} position={[0, 0, 0]} cor={frio ? '#bfc3c8' : '#d8c8a8'} />
          <Monitor position={[-0.2, 0.79, -0.15]} tela={frio ? '#2a3038' : '#3a7fd0'} />
          <Cadeira position={[-0.2, 0, 0.7]} rotation={[0, Math.PI, 0]} />
          {!frio && <Caneca position={[0.5, 0.79, 0.1]} cor="#c8352f" />}
        </group>
      ))}
      {/* mesa da frente (do protagonista) */}
      <group position={[0, 0, 0.9]}>
        <Mesa w={1.9} position={[0, 0, 0]} cor={frio ? '#bfc3c8' : '#e2d2b0'} rotation={[0, Math.PI, 0]} />
        {!frio && <Caneca position={[0.55, 0.79, 0.05]} />}
        {!frio && <Cacto position={[-0.7, 0.79, 0.1]} />}
        <Celular texto={'0\ne-mails'} position={[0.15, 0.8, 0.05]} rotation={[-Math.PI / 2, 0, 0.3]} />
        {cargo && <PlacaMesa texto={cargo} position={[0, 0.79, 0.3]} />}
      </group>
      <Planta position={[-4.8, 0, -2.4]} />
      <Planta position={[5, 0, -2.4]} altura={1.1} vaso="#2f6fb3" />
      {clima === 'festa' && <Bandeirolas x0={-4} x1={4} y={3.9} z={-3.0} n={16} />}
    </group>
  );
};

// ============================================================================
// ESTAÇÃO DE TELETRANSPORTE — piso de granilite, cabines de vidro com neon, quadro de partidas,
// fila com cordão, bancos. neon=true: versão noite/futuro (roxo e rosa).
// Cabine principal na origem (o personagem entra nela em z ≈ 0).
// ============================================================================
export const Estacao = ({ t = 0, neon = false, cidade = 'SÃO PAULO', destino = 'TÓQUIO', liga = 0 }: { t?: number; neon?: boolean; cidade?: string; destino?: string; liga?: number }) => (
  <group>
    <Luz
      bg={neon ? '#2a1640' : '#e8c79a'}
      ceu={neon ? '#c89cff' : '#fff2dc'}
      chao={neon ? '#2a1640' : '#8a6a4a'}
      fill={neon ? 0.7 : 1.0}
      sol={neon ? '#ff9ad8' : '#ffe6c0'}
      forca={neon ? 1.2 : 2.2}
      fog={neon ? [10, 32] : [16, 50]}
    />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial map={neon ? granilite('#2e1d46', ['rgba(255,90,208,0.35)', 'rgba(90,224,255,0.3)', '#3d2a5c', '#3d2a5c', '#3d2a5c']) : granilite('#efe0c6', ['#c8693a', '#7a8a9a', '#e8b05a', '#a84a3a'])} roughness={neon ? 0.3 : 0.6} />
    </mesh>
    {/* parede do fundo com faixa e quadro */}
    <Box p={[0, 2.6, -5]} s={[24, 5.2, 0.3]} c={neon ? '#1e1430' : '#c8693a'} r={0.8} />
    <Box p={[0, 4.6, -4.8]} s={[24, 0.25, 0.1]} c={neon ? '#ff4ad0' : '#2a4a5a'} />
    <QuadroPartidas position={[-3.2, 3.0, -4.8]} />
    <QuadroPartidas position={[3.2, 3.0, -4.8]} titulo="CHEGADAS" linhas={['SÃO PAULO', 'RIO', 'LONDRES', 'CAIRO']} />
    {/* cabines */}
    <Cabine t={t} cidade={cidade} neon={neon ? '#ff4ad0' : '#3ee6ff'} liga={liga} position={[0, 0, -0.4]} />
    <Cabine t={t + 0.7} cidade={destino} neon={neon ? '#5ae0ff' : '#3ee6ff'} position={[-3.4, 0, -2.6]} />
    <Cabine t={t + 1.3} cidade="LISBOA" neon={neon ? '#ff4ad0' : '#3ee6ff'} position={[3.4, 0, -2.6]} />
    {/* fila e bancos */}
    <FilaCordao pontos={[[-2.3, 0, 1.4], [-2.3, 0, -0.2], [-1.3, 0, -0.2], [-1.3, 0, 1.4]]} />
    <Banco position={[4.4, 0, 0.6]} rotation={[0, -Math.PI / 2, 0]} />
    <Planta position={[-5, 0, -3.8]} altura={1.2} vaso="#2a4a5a" />
    <Planta position={[5.2, 0, -3.8]} altura={1.2} vaso="#2a4a5a" />
    {neon &&
      [-6, 6].map((x) => (
        <mesh key={x} position={[x, 2.4, -4.7]}>
          <boxGeometry args={[0.12, 4.2, 0.08]} />
          <meshStandardMaterial color="#ff4ad0" emissive="#ff4ad0" emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
      ))}
  </group>
);

// ============================================================================
// NAVE — interior cinza-azulado: escotilhas com o espaço, painéis com luzinhas, poltronas, cabos.
// gas=true: luz verde (cheiro/gás). Corredor ao longo de -Z.
// ============================================================================
export const Nave = ({ t = 0, gas = false }: { t?: number; gas?: boolean }) => (
  <group>
    <Luz
      bg={gas ? '#2f4a2a' : '#3a4256'}
      ceu={gas ? '#b8ff9a' : '#e8f0ff'}
      chao={gas ? '#20301c' : '#2a3040'}
      fill={gas ? 0.9 : 1.0}
      sol={gas ? '#c8ff9a' : '#f0f4ff'}
      forca={gas ? 1.3 : 1.8}
      fog={[10, 32]}
    />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[8, 40]} />
      <meshStandardMaterial map={metalNave()} color="#9aa3b0" roughness={0.6} />
    </mesh>
    {/* paredes curvas (meio cilindro) e teto */}
    <mesh position={[0, 1.8, -8]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[3, 3, 26, 32, 1, true, Math.PI * 0.5, Math.PI]} />
      <meshStandardMaterial map={metalNave()} color="#b9c0cb" side={THREE.BackSide} roughness={0.55} />
    </mesh>
    {/* escotilhas */}
    {[-1, -4.5, -8].map((z) =>
      [-1, 1].map((s) => (
        <group key={`${z}${s}`} position={[s * 2.55, 2.0, z]} rotation={[0, -s * Math.PI / 2, 0]}>
          <mesh>
            <torusGeometry args={[0.45, 0.09, 12, 32]} />
            <meshStandardMaterial color="#5a6272" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[0.44, 32]} />
            <meshBasicMaterial map={espacoTex()} toneMapped={false} />
          </mesh>
        </group>
      )),
    )}
    {/* painéis com luzinhas */}
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 2.3, 0.9, -2.6]} rotation={[0, -s * 0.9, 0]}>
        <Box p={[0, 0, 0]} s={[1.6, 0.9, 0.5]} c="#4a5262" />
        {Array.from({ length: 12 }, (_, i) => {
          const on = Math.sin(t * 3 + i * 1.7) > 0;
          const cor = ['#5ce07a', '#ff5a4a', '#ffd23a', '#5ab0ff'][i % 4];
          return (
            <mesh key={i} position={[-0.6 + (i % 6) * 0.24, 0.12 - Math.floor(i / 6) * 0.22, 0.26]}>
              <boxGeometry args={[0.12, 0.08, 0.02]} />
              <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={on ? 2 : 0.2} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    ))}
    {/* poltronas */}
    {[-1.2, 1.2].map((x) => (
      <group key={x} position={[x, 0, -5.2]}>
        <Box p={[0, 0.45, 0]} s={[0.8, 0.2, 0.8]} c="#2f3a52" />
        <Box p={[0, 1.05, -0.35]} s={[0.8, 1.1, 0.18]} c="#2f3a52" />
        <Box p={[0, 1.05, -0.25]} s={[0.12, 1.0, 0.02]} c="#3a7fd0" />
      </group>
    ))}
    {/* cabos coloridos no teto */}
    {['#ff5a4a', '#5ab0ff', '#ffd23a'].map((cor, i) => (
      <mesh key={cor} position={[-0.6 + i * 0.6, 4.25 - i * 0.05, -6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 22, 6]} />
        <meshStandardMaterial color={cor} />
      </mesh>
    ))}
    <RelogioParede t={t} hora={3} tamanho={0.3} position={[0, 3.6, -9]} />
    {gas &&
      Array.from({ length: 30 }, (_, i) => (
        <mesh key={i} position={[(rand(i) - 0.5) * 4, 0.6 + rand(i + 1) * 2.4, -1 - rand(i + 2) * 8]} scale={0.4 + rand(i + 3) * 0.5}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#8fe05a" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
  </group>
);

const espacoTex = () =>
  canvasTex('espaco', 512, 512, (c) => {
    c.fillStyle = '#0a0f26';
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 160; i++) {
      c.fillStyle = `rgba(255,255,255,${0.4 + rand(i) * 0.6})`;
      c.fillRect(rand(i + 1) * 512, rand(i + 2) * 512, 2 + rand(i + 3) * 2, 2 + rand(i + 3) * 2);
    }
    const g = c.createRadialGradient(330, 340, 20, 330, 340, 170);
    g.addColorStop(0, '#5ab0ff');
    g.addColorStop(0.7, '#2f6fb3');
    g.addColorStop(1, 'rgba(47,111,179,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(330, 340, 170, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#4fa346';
    c.beginPath();
    c.ellipse(300, 320, 60, 40, 0.5, 0, Math.PI * 2);
    c.fill();
  });

// ============================================================================
// NAVE NO ESPAÇO (plano de fora): módulo com painéis solares, estrelas e a Terra (ou Marte) ao fundo.
// ============================================================================
export const NaveEspaco = ({ t = 0, planeta = 'terra' as 'terra' | 'marte' }: { t?: number; planeta?: 'terra' | 'marte' }) => (
  <group>
    <Fundo bg="#0b1030" near={60} far={200} />
    <hemisphereLight args={['#ffffff', '#1a2040', 0.7]} />
    <directionalLight position={[6, 4, 8]} intensity={2.6} color="#fff4e0" />
    {Array.from({ length: 220 }, (_, i) => (
      <mesh key={i} position={[(rand(i) - 0.5) * 80, (rand(i + 1) - 0.5) * 80, -30 - rand(i + 2) * 20]}>
        <sphereGeometry args={[0.06 + rand(i + 3) * 0.08, 6, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    ))}
    <mesh position={[4, -7, -18]} rotation={[0.3, t * 0.05, 0]}>
      <sphereGeometry args={[8, 48, 32]} />
      <meshStandardMaterial color={planeta === 'terra' ? '#3a86d8' : '#d8743a'} roughness={0.8} />
    </mesh>
    {planeta === 'terra' &&
      Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[4 + (rand(i) - 0.5) * 9, -7 + 5 + rand(i + 1) * 2.5, -18 + 6.2 + rand(i + 2)]} scale={[1.6, 0.4, 1]}>
          <sphereGeometry args={[0.9 + rand(i + 3), 12, 8]} />
          <meshStandardMaterial color="#4fa346" />
        </mesh>
      ))}
    {/* módulo */}
    <group rotation={[0.1, 0.5 + t * 0.03, 0.08]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 3.2, 32]} />
        <meshStandardMaterial color="#e2ddd2" roughness={0.5} />
      </mesh>
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.92, 0.04, 8, 32]} />
          <meshStandardMaterial color="#c9a14a" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {[-0.8, 0, 0.8].map((x) => (
        <mesh key={`j${x}`} position={[x, 0.2, 0.88]}>
          <circleGeometry args={[0.16, 20]} />
          <meshStandardMaterial color="#ffd76a" emissive="#ffb347" emissiveIntensity={1.2} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <group key={s} position={[0, s * 2.4, 0]}>
          <Box p={[0, -s * 0.9, 0]} s={[0.08, 1.2, 0.08]} c="#9aa0a8" />
          <mesh>
            <boxGeometry args={[2.4, 1.6, 0.05]} />
            <meshStandardMaterial map={painelSolar()} metalness={0.4} roughness={0.35} />
          </mesh>
        </group>
      ))}
      <mesh position={[1.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.7, 0.6, 24]} />
        <meshStandardMaterial color="#5a6272" metalness={0.4} />
      </mesh>
    </group>
  </group>
);

const painelSolar = () =>
  canvasTex('painel-solar', 256, 256, (c) => {
    c.fillStyle = '#1e3a7a';
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = '#8fb0e8';
    c.lineWidth = 4;
    for (let i = 0; i <= 6; i++) {
      c.beginPath();
      c.moveTo((i * 256) / 6, 0);
      c.lineTo((i * 256) / 6, 256);
      c.moveTo(0, (i * 256) / 6);
      c.lineTo(256, (i * 256) / 6);
      c.stroke();
    }
  });

// ============================================================================
// CASTELO — dia ensolarado, grama, céu com nuvens fofas, muralha de pedra com ameias e torres,
// portão de madeira, estandartes, placa "NÍVEL", barris, escada. A muralha fica em z = -4.
// ============================================================================
export const Castelo = ({ t = 0, nivel = 'NÍVEL 5' }: { t?: number; nivel?: string }) => (
  <group>
    <Luz bg="#9fd3f5" ceu="#fff8e8" chao="#5a7a3a" fill={1.05} sol="#fff0d0" forca={2.5} fog={[25, 80]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial map={grama()} roughness={1} />
    </mesh>
    {/* caminho de terra até o portão */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.5]} receiveShadow>
      <planeGeometry args={[2.2, 8]} />
      <meshStandardMaterial color="#c8a06a" roughness={1} />
    </mesh>
    {/* muralha */}
    <Box p={[0, 2.2, -4]} s={[18, 4.4, 1]} c="#ffffff" map={pedraMuralha('#9a9a94')} r={0.9} />
    {Array.from({ length: 17 }, (_, i) => (
      <Box key={i} p={[-8.5 + i * 1.06, 4.75, -4]} s={[0.6, 0.7, 1.05]} c="#ffffff" map={pedraMuralha('#9a9a94')} />
    ))}
    {/* torres */}
    {[-6.5, 6.5].map((x) => (
      <group key={x} position={[x, 0, -4]}>
        <mesh position={[0, 3.4, 0]} castShadow>
          <cylinderGeometry args={[1.4, 1.5, 6.8, 28]} />
          <meshStandardMaterial map={pedraMuralha('#a2a29c')} roughness={0.9} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[Math.sin((i / 10) * 6.28) * 1.4, 7.1, Math.cos((i / 10) * 6.28) * 1.4]}>
            <boxGeometry args={[0.45, 0.6, 0.45]} />
            <meshStandardMaterial color="#a2a29c" />
          </mesh>
        ))}
        <mesh position={[0, 8.4, 0]}>
          <coneGeometry args={[1.6, 2.2, 28]} />
          <meshStandardMaterial color="#2f4f9a" />
        </mesh>
      </group>
    ))}
    {/* portão */}
    <Box p={[0, 1.4, -3.45]} s={[2.4, 2.8, 0.12]} c="#6b4426" />
    {Array.from({ length: 5 }, (_, i) => (
      <Box key={i} p={[-0.96 + i * 0.48, 1.4, -3.38]} s={[0.06, 2.7, 0.04]} c="#4a2e18" />
    ))}
    <Box p={[0, 2.95, -3.42]} s={[2.8, 0.3, 0.2]} c="#7a7a74" />
    <Estandarte position={[-2.4, 3.9, -3.45]} />
    <Estandarte position={[2.4, 3.9, -3.45]} />
    <PlacaMadeira texto={nivel} position={[2.0, 0, 0.4]} rotation={[0, -0.3, 0]} />
    <Barril position={[-2.6, 0, -2.6]} />
    <Barril position={[-3.2, 0, -2.0]} cor="#8a5a30" />
    <Escada altura={3.6} position={[4.2, 0.0, -3.35]} rotation={[-0.2, 0, 0]} />
    {/* arbustos e árvores */}
    {[[-5, 1], [5.5, 0.5], [-7, -1.5], [7.5, -1]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.5, z]} castShadow>
        <sphereGeometry args={[0.8 + rand(i) * 0.4, 16, 12]} />
        <meshStandardMaterial color={i % 2 ? '#3f8a3a' : '#52a346'} roughness={0.9} />
      </mesh>
    ))}
    {/* nuvens */}
    {[[-10, 16, -40], [8, 19, -45], [18, 14, -38]].map(([x, y, z], i) => (
      <group key={i} position={[x + Math.sin(t * 0.1 + i) * 0.5, y, z]}>
        {[0, 1.8, -1.8, 0.9].map((dx, j) => (
          <mesh key={j} position={[dx, j === 3 ? 1 : 0, 0]} scale={[1.4, 0.9, 1]}>
            <sphereGeometry args={[1.8, 16, 12]} />
            <meshStandardMaterial color="#ffffff" fog={false} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

const grama = () =>
  canvasTex('grama-castelo', 512, 512, (c) => {
    c.fillStyle = '#7fbf4a';
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      c.fillStyle = rand(i) > 0.5 ? 'rgba(60,120,40,0.35)' : 'rgba(200,235,120,0.3)';
      c.fillRect(rand(i + 3) * 512, rand(i + 7) * 512, 3, 9);
    }
  }, [20, 20]);


