import { ThreeCanvas } from '@remotion/three';
import { JSX } from 'react';
import { AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { Desk, MESA_CHEFE, MESA_COLEGA, MESA_GABI, MESA_KAIO, MESA_PAULA, MESA_VOCE, Office, CityFront, DeskPlate, DESK_H } from './escritorio';
import { Boat, BrazilMap, Buoy, Anemometer, DryLand, PacificMap, RainCloud, Screen, SeaScene, Thermometer, Tub, TubRoom } from './elnino';
import { NeonStreet, PachinkoFront, PachinkoHall, PrizeCounter, WindowShop } from './historia';
import { Cam, Room, Stage, Street, Warehouse } from './sets';
import { NOVOS_CENARIOS } from './cenarios2';

// Catálogo de cenários do estúdio (node tools/cenarios.mjs -> out/cenarios.png).
type C = { nome: string; C: (p: { t: number }) => JSX.Element };
const cam = (t: number, p: [number, number, number], a: [number, number, number]) => <Cam t={t} t0={t} t1={t + 10} keys={[[t, p, a, 32]]} />;

export const CENARIOS: C[] = [
  { nome: 'Rua do bairro', C: ({ t }) => (<><Street placa="PADARIA" />{cam(t, [0, 2.4, 8.5], [0, 2.6, -3])}</>) },
  { nome: 'Recepção / balcão', C: ({ t }) => (<><Room placa="RECEPÇÃO" />{cam(t, [0, 2.0, 6], [0, 1.6, -1])}</>) },
  { nome: 'Depósito', C: ({ t }) => (<><Warehouse />{cam(t, [0, 2.4, 4], [0, 2.2, -8])}</>) },
  { nome: 'Palco de fatos', C: ({ t }) => (<><Stage color="#2a5466" />{cam(t, [0, 2.0, 5], [0, 0.8, 0])}</>) },
  { nome: 'Rua de neon (noite)', C: ({ t }) => (<><NeonStreet t={t} placa="JAPÃO" />{cam(t, [0.4, 2.2, 6], [0, 2.4, -4])}</>) },
  { nome: 'Fachada do pachinko', C: ({ t }) => (<><PachinkoFront t={t} />{cam(t, [0.5, 3.0, 9.5], [0, 3.2, -3])}</>) },
  { nome: 'Salão de máquinas', C: ({ t }) => (<><PachinkoHall t={t} />{cam(t, [0.2, 2.2, 4], [0, 1.2, -6])}</>) },
  { nome: 'Balcão de prêmios', C: ({ t }) => (<><PrizeCounter t={t} acende={0} />{cam(t, [0, 1.9, 4.8], [0, 1.6, -1.5])}</>) },
  { nome: 'Lojinha da janelinha', C: ({ t }) => (<><WindowShop t={t} />{cam(t, [0.5, 2.2, 6.5], [0, 1.8, 0])}</>) },
  {
    nome: 'Escritório', C: ({ t }) => (
      <>
        <Office t={t} />
        {[MESA_COLEGA, MESA_PAULA, MESA_KAIO, MESA_GABI, MESA_CHEFE].map((m, i) => <Desk key={i} t={t} position={m} papeis={0.3 + (i % 3) * 0.2} />)}
        <Desk t={t} position={MESA_VOCE} vazia />
        <DeskPlate text="CARGO: NÃO FAZER NADA" position={[MESA_VOCE[0] + 0.1, DESK_H + 0.03, MESA_VOCE[2] + 0.15]} scale={0.8} />
        {cam(t, [-0.4, 3.0, 6.6], [0.2, 1.0, -0.8])}
      </>
    ),
  },
  { nome: 'Rua com cerejeiras', C: ({ t }) => (<><CityFront t={t} sobe={0} />{cam(t, [0.2, 2.6, 8.5], [0.2, 2.8, -2])}</>) },
  { nome: 'Banheira do Pacífico', C: ({ t }) => (<><TubRoom /><Tub t={t} warm={0.2} wind={1} upwell={1} fish={1} nutri={1} />{cam(t, [0.3, 5.6, 5.2], [0.3, 0.5, 0])}</>) },
  { nome: 'Mar com barco', C: ({ t }) => (<><SeaScene t={t} /><Boat t={t} rotation={[0, 0.3, 0]} />{cam(t, [0.5, 2.2, 6.5], [0, 1.4, -2])}</>) },
  { nome: 'Mapa do Pacífico', C: ({ t }) => (<><Stage color="#24304a" pedestal={false} /><PacificMap />{cam(t, [0, 9.5, 5.5], [0, 0, 0.2])}</>) },
  { nome: 'Mapa do Brasil', C: ({ t }) => (<><Stage color="#24304a" pedestal={false} /><BrazilMap />{cam(t, [0, 5.6, 4.4], [0, 0, 0.1])}</>) },
  {
    nome: 'Rua alagada', C: ({ t }) => (
      <>
        <Street placa="MERCADO" bg="#8a96a8" parede="#c8c0b0" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#6a8a9a" transparent opacity={0.85} roughness={0.15} /></mesh>
        <RainCloud t={t} rain={1} dark={0.7} position={[-0.6, 4.2, 0.2]} scale={1.2} />
        <RainCloud t={t} rain={1} dark={0.7} position={[1.0, 4.4, -0.6]} scale={1.2} />
        {cam(t, [0.5, 2.6, 7.5], [0, 2.2, 0])}
      </>
    ),
  },
  { nome: 'Rio seco / sertão', C: ({ t }) => (<><DryLand t={t} rio={0.15} sol={1.3} calor={1} />{cam(t, [0.4, 2.4, 6], [0.4, 1.8, -1])}</>) },
  {
    nome: 'Laboratório do clima', C: ({ t }) => (
      <>
        <Room placa="LABORATÓRIO DO CLIMA" parede="#2f4a6a" balcao={false} />
        <Screen alerta position={[-0.25, 1.75, -2.7]} />
        <Buoy t={t} position={[-1.3, 0, 0.2]} />
        <Anemometer t={t} position={[1.0, 0, 0.3]} scale={1.1} />
        <Thermometer k={0.55} label="OCEANO" position={[-1.6, 0, -1.4]} />
        {cam(t, [0, 2.0, 5.6], [-0.2, 1.4, -1])}
      </>
    ),
  },
];

// Os 30 cenários novos entram depois dos 18 primeiros (índices 18 a 47).
for (const n of NOVOS_CENARIOS) {
  const Comp = n.C;
  CENARIOS.push({ nome: n.nome, C: ({ t }) => (<><Comp t={t} />{cam(t, n.cam[0], n.cam[1])}</>) });
}

export const Cenario = ({ i }: { i: number }) => {
  const c = CENARIOS[i] ?? CENARIOS[0];
  const Comp = c.C;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ThreeCanvas width={540} height={960} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, antialias: true }} camera={{ fov: 32, near: 0.05, far: 200, position: [0, 2, 5] }}>
        <Comp t={2} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
