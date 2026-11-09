import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { Character, REST } from './Character';
import { ELENCO, Membro, ROUPAS } from './personagens';
import { tileTex } from './textures';

// Folha do elenco (1920x1760): mostra todos os personagens e roupas prontos para usar.
export const PAGE = '#ecebe6';
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

export const Cartoes = ({ membros, w, h }: { membros: Membro[]; w: number; h: number }) => {
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
