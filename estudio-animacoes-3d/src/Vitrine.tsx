import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { V3 } from './anim';
import { Castelo, Escritorio, Estacao, Nave, NaveEspaco } from './cenarios';
import { Character, FaceState, Pose, REST } from './Character';
import {
  Aviso, Bandeirolas, Banco, BalaoPensamento, BarraProgresso, Barril, Cabine, Cadeira, Cacto, Caneca, Cartaz, Celular, Cone, Escada, Estandarte,
  JanelaPersiana, Lampada, Mesa, Monitor, PilhaNiveis, PlacaMadeira, PlacaMesa, Planta, QuadroPartidas, RelogioParede,
} from './objetos';
import { NOVOS } from './personagens';
import { Cam } from './sets';
import { useFacesReady } from './textures';

// Vitrine: um quadro de cada cenário com personagens (node tools/vitrine.mjs) e a folha de objetos.
const P = (o: Partial<Pose>): Pose => ({ ...REST, ...o });
const F_ = (f: FaceState['f']): FaceState => ({ f, blink: 0, o: [] });
const T = 3;

const CENAS: Record<string, () => JSX.Element> = {
  escritorio: () => (
    <>
      <Escritorio t={T} cargo="CARGO: NÃO FAZER NADA" />
      <Cam t={T} t0={T} t1={T + 5} keys={[[T, [0.6, 1.9, 5.4], [0, 1.4, -0.3], 34]]} />
      <Character pose={P({ x: 0, z: -0.3, hy: 0.15 })} face={F_('smug')} look={NOVOS.leo.look} />
      <Character pose={P({ x: 1.8, z: -0.9, ry: -0.5, rsz: 1.2, rel: 0.4 })} face={F_('bigSmile')} look={NOVOS.moraes.look} />
      <Lampada t={T} at={T - 1} position={[0, 2.95, -0.3]} />
    </>
  ),
  escritorioFrio: () => (
    <>
      <Escritorio t={T} clima="frio" noite />
      <Cam t={T} t0={T} t1={T + 5} keys={[[T, [-0.6, 1.8, 5.6], [0, 1.3, -0.5], 34]]} />
      <Character pose={P({ x: -0.4, z: -0.5, hp: 0.25 })} face={F_('worried')} look={NOVOS.tati.look} />
    </>
  ),
  estacao: () => (
    <>
      <Estacao t={T} liga={0.6} />
      <Cam t={T} t0={T} t1={T + 5} keys={[[T, [1.2, 1.9, 6.4], [0, 1.6, -0.6], 36]]} />
      <Character pose={P({ x: 0, z: -0.4, lsz: 0.3, rsz: 0.3 })} face={F_('starstruck')} look={NOVOS.leo.look} />
      <Character pose={P({ x: -1.8, z: 0.8, ry: 0.5 })} face={F_('curious')} look={NOVOS.juca.look} />
    </>
  ),
  estacaoNeon: () => (
    <>
      <Estacao t={T} neon cidade="TÓQUIO" destino="SÃO PAULO" />
      <Cam t={T} t0={T} t1={T + 5} keys={[[T, [-1.0, 1.8, 6.4], [0, 1.6, -0.6], 36]]} />
      <Character pose={P({ x: 0, z: -0.4 })} face={F_('amazed')} look={NOVOS.leo.look} />
      <BalaoPensamento t={T} at={T - 1} texto="?" position={[0.9, 3.2, -0.2]} />
    </>
  ),
  nave: () => (
    <>
      <Nave t={T} />
      <Cam t={T} t0={T} t1={T + 5} keys={[[T, [0.4, 1.8, 3.6], [0, 1.4, -1.5], 38]]} />
      <Character pose={P({ x: -0.5, z: -1.2, rsz: 2.4, rel: 0.3 })} face={F_('bigSmile')} look={NOVOS.nina.look} />
      <Character pose={P({ x: 0.7, z: -2.0, ry: -0.3 })} face={F_('happy')} look={{ ...NOVOS.nina.look, skin: '#d9a57c', hairStyle: 'curto', hair: '#3a2416' }} />
    </>
  ),
  naveGas: () => (
    <>
      <Nave t={T} gas />
      <Cam t={T} t0={T} t1={T + 5} keys={[[T, [0.2, 1.7, 2.6], [0, 1.55, -1.2], 36]]} />
      <Character pose={P({ x: 0, z: -1.2, lsx: 1.1, lel: 1.6, rsx: 1.1, rel: 1.6 })} face={{ f: 'sick', blink: 0, o: ['sweat3'] }} look={NOVOS.nina.look} />
    </>
  ),
  espaco: () => (
    <>
      <NaveEspaco t={T} />
      <Cam t={T} t0={T} t1={T + 5} keys={[[T, [0, 1, 9], [0, -0.5, 0], 40]]} />
    </>
  ),
  castelo: () => (
    <>
      <Castelo t={T} />
      <Cam t={T} t0={T} t1={T + 5} keys={[[T, [0.8, 1.7, 6.2], [0.3, 1.9, -1], 38]]} />
      <Character pose={P({ x: 0, z: 0.2, rsz: 0.9, rel: 0.6 })} face={F_('confident')} look={NOVOS.valdo.look} />
      <Character pose={P({ x: -1.6, z: -0.6, ry: 0.4 })} face={F_('content')} look={NOVOS.tome.look} />
    </>
  ),
};

export const CENAS_NOMES = Object.keys(CENAS);

export const Vitrine = ({ cena }: { cena: string }) => {
  const { width, height } = useVideoConfig();
  const ready = useFacesReady();
  const C = CENAS[cena] ?? CENAS.escritorio;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, antialias: true }} camera={{ fov: 32, near: 0.05, far: 300, position: [0, 2, 5] }}>
          <C />
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};

// ---------- Folha de objetos ----------
const OBJ: [string, () => JSX.Element, V3, number][] = [
  ['Relógio de parede', () => <RelogioParede t={T} hora={10.1} position={[0, 0.5, 0]} />, [0, 0.5, 0], 2.2],
  ['Janela c/ persiana', () => <JanelaPersiana position={[0, 0.9, 0]} noite />, [0, 0.9, 0], 3.6],
  ['Planta', () => <Planta />, [0, 0.6, 0], 2.8],
  ['Cacto + caneca', () => (<><Cacto position={[-0.2, 0, 0]} /><Caneca position={[0.2, 0, 0]} /></>), [0, 0.2, 0], 1.3],
  ['Celular', () => <Celular position={[0, 0.3, 0]} />, [0, 0.3, 0], 0.9],
  ['Monitor', () => <Monitor />, [0, 0.4, 0], 2],
  ['Mesa + cadeira', () => (<><Mesa position={[0, 0, -0.3]} /><Cadeira position={[0.2, 0, 0.5]} rotation={[0, Math.PI, 0]} /></>), [0, 0.6, 0], 4.2],
  ['Cartaz', () => <Cartaz texto={'TRABALHO\nEM EQUIPE'} position={[0, 0.7, 0]} />, [0, 0.7, 0], 2.6],
  ['Placa de mesa', () => <PlacaMesa texto="CARGO: NÃO FAZER NADA" />, [0, 0.1, 0], 1.3],
  ['Bandeirolas', () => <Bandeirolas x0={-1} x1={1} y={0.8} n={8} />, [0, 0.6, 0], 2.6],
  ['Cone', () => <Cone />, [0, 0.3, 0], 1.6],
  ['Barril', () => <Barril />, [0, 0.4, 0], 2],
  ['Placa de madeira', () => <PlacaMadeira texto="NÍVEL 1" />, [0, 0.9, 0], 3],
  ['Pilha de níveis', () => <PilhaNiveis />, [0, 1.7, 0], 5.6],
  ['Cabine de neon', () => <Cabine t={T} liga={0.5} />, [0, 1.7, 0], 6.5],
  ['Quadro de partidas', () => <QuadroPartidas position={[0, 0.7, 0]} />, [0, 0.7, 0], 3.2],
  ['Banco', () => <Banco />, [0, 0.4, 0], 3],
  ['Estandarte + escada', () => (<><Estandarte position={[-0.5, 1.7, 0]} /><Escada altura={2} position={[0.6, 0, 0]} /></>), [0, 1, 0], 4],
  ['Balão de pensamento', () => <BalaoPensamento t={T} at={T - 1} texto="$" size={1} position={[0, 0.5, 0]} />, [0, 0.5, 0], 2.2],
  ['Lâmpada de ideia', () => <Lampada t={T} at={T - 1} position={[0, 0.3, 0]} />, [0, 0.3, 0], 1.6],
  ['Barra de progresso', () => <BarraProgresso t={T} from={T - 2} at={T + 1} valor={1} position={[0, 0.4, 0]} />, [0, 0.4, 0], 3.2],
  ['Aviso de tela', () => <Aviso t={T} at={T - 1} position={[0, 0.4, 0]} />, [0, 0.4, 0], 2.4],
];

const Celula = ({ nome, C, alvo, dist }: { nome: string; C: () => JSX.Element; alvo: V3; dist: number }) => (
  <div style={{ width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 400, height: 400, borderRadius: 18, overflow: 'hidden' }}>
      <ThreeCanvas width={400} height={400} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, antialias: true }} camera={{ fov: 32, near: 0.05, far: 100, position: [0, 1, 5] }}>
        <color attach="background" args={['#5c6a77']} />
        <hemisphereLight args={['#fff6ea', '#5a3a22', 1.1]} />
        <directionalLight position={[-3, 6, 6]} intensity={2.2} color="#fff0dc" castShadow />
        <directionalLight position={[3, 2, 5]} intensity={0.6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#a8653a" />
        </mesh>
        <Cam t={T} t0={T} t1={T + 99} keys={[[T, [alvo[0] + dist * 0.35, alvo[1] + dist * 0.25, alvo[2] + dist], alvo, 32]]} />
        <C />
      </ThreeCanvas>
    </div>
    <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: 28, color: '#1c1c1c' }}>{nome}</div>
  </div>
);

export const OBJ_NOMES = OBJ.map((o) => o[0]);
// Um objeto por vez (a folha é montada pelo tools/vitrine.mjs): o navegador não aguenta 22 telas 3D juntas.
export const Objeto = ({ i }: { i: number }) => {
  const ready = useFacesReady();
  const [nome, C, a, d] = OBJ[i] ?? OBJ[0];
  return <AbsoluteFill style={{ background: '#ecebe6', alignItems: 'center', justifyContent: 'center' }}>{ready && <Celula nome={nome} C={C} alvo={a} dist={d} />}</AbsoluteFill>;
};
