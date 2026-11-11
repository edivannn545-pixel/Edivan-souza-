import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { JSX, useLayoutEffect } from 'react';
import { CorredorEscola, Enfermaria, Parque, Quadra, Quarto, RuaBairro, Telhados } from './cenarios';
import { AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { Character, REST } from './Character';
import { ELENCO, ESFERAS, Membro, raioX, ROUPAS } from './personagens';
import { tileTex } from './textures';

// Folha do elenco (1920x1760): mostra todos os personagens e roupas prontos para usar.
const PAGE = '#ecebe6';
const ESP = 1.2; // distância entre personagens no mundo 3D

const OrthoCam = ({ n }: { n: number }) => {
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;
  const size = useThree((s) => s.size);
  useLayoutEffect(() => {
    camera.zoom = size.width / (n * ESP);
    camera.position.set(0, 2.5, 12);
    camera.lookAt(0, 1.38, 0);
    camera.updateProjectionMatrix();
  }, [camera, size, n]);
  return null;
};

const Fileira = ({ membros, w, h }: { membros: Membro[]; w: number; h: number }) => {
  const n = membros.length;
  return (
    <ThreeCanvas orthographic width={w} height={h} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, antialias: true }} camera={{ near: 0.1, far: 100 }}>
      <OrthoCam n={n} />
      <color attach="background" args={['#5c6a77']} />
      <hemisphereLight args={['#fff6ea', '#5a3a22', 1.0]} />
      <directionalLight position={[-3, 6, 6]} intensity={2.2} color="#fff0dc" castShadow shadow-mapSize={[4096, 1024]} shadow-camera-left={-n} shadow-camera-right={n} shadow-camera-top={4} shadow-camera-bottom={-2} />
      <mesh position={[0, 3, -1.2]}>
        <planeGeometry args={[n * ESP + 4, 6]} />
        <meshStandardMaterial color="#5c6a77" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[n * ESP + 4, 6]} />
        <meshStandardMaterial map={tileTex('#a8653a', '#9a5a33', 24)} roughness={0.8} />
      </mesh>
      {membros.map((m, i) => (
        <Character
          key={m.nome}
          pose={{ ...REST, x: (i - (n - 1) / 2) * ESP, z: 0.2, ry: 0.12 }}
          face={{ f: m.rosto, blink: 0, o: [] }}
          look={m.look}
        />
      ))}
    </ThreeCanvas>
  );
};

const Cartoes = ({ membros, w, h }: { membros: Membro[]; w: number; h: number }) => {
  const n = membros.length;
  const cw = w / n;
  return (
    <div style={{ position: 'relative', width: w, height: h + 70 }}>
      <Fileira membros={membros} w={w} h={h} />
      {/* Separa a faixa em cartões */}
      {Array.from({ length: n + 1 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', top: 0, left: i * cw - 7, width: 14, height: h, background: PAGE }} />
      ))}
      {membros.map((m, i) => (
        <div key={m.nome} style={{ position: 'absolute', top: h + 8, left: i * cw, width: cw, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: n > 10 ? 21 : 23, color: '#1c1c1c' }}>{m.nome}</div>
          {m.papel && <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, color: '#c2302e' }}>{m.papel}</div>}
        </div>
      ))}
    </div>
  );
};

const Selo = ({ n, txt }: { n: number; txt: string }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: '10px 22px', display: 'flex', alignItems: 'baseline', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
    <span style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 34, color: '#c2302e' }}>{n}</span>
    <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 26, color: '#1c1c1c' }}>{txt}</span>
  </div>
);

export const Elenco = () => {
  const todos = Object.values(ELENCO) as Membro[];
  const roupas = Object.values(ROUPAS) as Membro[];
  const W = 1840;
  return (
    <AbsoluteFill style={{ background: PAGE, padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, letterSpacing: 4, color: '#6b6b6b', fontWeight: 700 }}>ESTÚDIO DE PRODUÇÃO DE ANIMAÇÕES</div>
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 86, color: '#141414', lineHeight: 1 }}>
            O <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>elenco.</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Selo n={todos.length} txt="personagens originais" />
          <Selo n={6} txt="tipos de corpo" />
          <Selo n={roupas.length} txt="roupas especiais" />
        </div>
      </div>
      <Cartoes membros={todos.slice(0, 10)} w={W} h={430} />
      <Cartoes membros={todos.slice(10)} w={W} h={430} />
      <Cartoes membros={roupas} w={W} h={370} />
    </AbsoluteFill>
  );
};

// Folha do elenco "cabeça-esfera" (estilo "E se...?") + versões raio-X: node tools/elenco.mjs ElencoEsferas
export const ElencoEsferas = () => {
  const todos = Object.values(ESFERAS) as Membro[];
  const n = ESFERAS.nino;
  const raios: Membro[] = [
    { nome: 'Nino raio-X', papel: 'ossos normais', rosto: 'confident', look: raioX(n.look) },
    { nome: 'Nino destaque', papel: "destaque: 'pernas'", rosto: 'curious', look: raioX(n.look, { destaque: 'pernas', destaqueCor: '#ff5a7a' }) },
    { nome: 'Nino de aço', papel: 'ossoMetal: true', rosto: 'starstruck', look: raioX(n.look, { destaque: 'tudo', destaqueCor: '#dfe7f0', ossoMetal: true }) },
    { nome: 'Nino calor', papel: "cor: '#ff7a2a'", rosto: 'furious', look: raioX(n.look, { cor: '#ff7a2a', osso: '#fff3d6' }) },
    { nome: 'Lara raio-X', papel: '', rosto: 'happy', look: raioX(ESFERAS.lara.look) },
    { nome: 'Bruno raio-X', papel: '', rosto: 'smug', look: raioX(ESFERAS.bruno.look) },
  ];
  const W = 1840;
  return (
    <AbsoluteFill style={{ background: PAGE, padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, letterSpacing: 4, color: '#6b6b6b', fontWeight: 700 }}>ESTILO "E SE...?"</div>
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 86, color: '#141414', lineHeight: 1 }}>
            O <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>elenco esfera.</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Selo n={todos.length} txt="personagens" />
          <Selo n={raios.length} txt="modos raio-X" />
        </div>
      </div>
      <Cartoes membros={todos} w={W} h={560} />
      <Cartoes membros={raios} w={W} h={560} />
    </AbsoluteFill>
  );
};

// Vitrine dos cenários do estilo "E se...?": node tools/elenco.mjs Cenarios → out/cenarios.png
const CamP = ({ pos, alvo }: { pos: [number, number, number]; alvo: [number, number, number] }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...alvo);
    camera.fov = 52;
    camera.updateProjectionMatrix();
  }, [camera, pos, alvo]);
  return null;
};
const PAINEIS: { nome: string; uso: string; C: () => JSX.Element; pos?: [number, number, number]; alvo?: [number, number, number] }[] = [
  { nome: 'RuaBairro', uso: "hora='dia'", C: () => <RuaBairro /> },
  { nome: 'RuaBairro', uso: "hora='tarde'", C: () => <RuaBairro hora="tarde" /> },
  { nome: 'CorredorEscola', uso: 'armários, sala 7', C: () => <CorredorEscola /> },
  { nome: 'Enfermaria', uso: 'maca, remédios', C: () => <Enfermaria /> },
  { nome: 'Quarto', uso: 'noite', C: () => <Quarto noite /> },
  { nome: 'Quadra', uso: 'torcida, gol', C: () => <Quadra />, pos: [0, 3.2, 7.5], alvo: [0, 1.6, -3] },
  { nome: 'Telhados', uso: 'pôr do sol', C: () => <Telhados /> },
  { nome: 'Parque', uso: 'lago, banco', C: () => <Parque />, pos: [0, 3.0, 7], alvo: [0, 1.2, -3] },
];
export const Cenarios = () => (
  <AbsoluteFill style={{ background: PAGE, padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 64, color: '#141414', lineHeight: 1 }}>
      Os <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>cenários.</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 450px)', gap: 16 }}>
      {PAINEIS.map((p, i) => (
        <div key={i}>
          <ThreeCanvas width={450} height={720} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, antialias: true }} camera={{ fov: 52, near: 0.05, far: 200 }}>
            <CamP pos={p.pos ?? [0.3, 2.4, 7.2]} alvo={p.alvo ?? [0, 1.4, -2]} />
            <p.C />
            <Character pose={{ ...REST, z: 0.6, ry: 0.15 }} face={{ f: 'happy', blink: 0, o: [] }} look={ESFERAS.nino.look} />
          </ThreeCanvas>
          <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 24, color: '#1c1c1c', textAlign: 'center', marginTop: 6 }}>{p.nome}</div>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, color: '#c2302e', textAlign: 'center' }}>{p.uso}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
