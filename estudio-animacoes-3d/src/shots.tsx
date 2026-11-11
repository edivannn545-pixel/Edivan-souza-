import { JSX, ReactNode } from 'react';
import { track, V3 } from './anim';
import { Character, faceAt, Pose, REST } from './Character';
import { AGUA_Y, Arco, Balanca, BlocoConcreto, Bolhas, Calcada, FUNDO_Y, GradeNeon, Osso, Piscina, Prensa, salto, Skate, Splash } from './historia';
import { Capitulo, Numero, Onoma, Selo, TelaFinal, Titulo, Vinheta } from './hud';
import { ESFERAS, raioX } from './personagens';
import { Clipboard, Puff } from './props';
import { Cam, Room, Street } from './sets';
import { W } from './timeline';

// ============================================================================
// EPISÓDIO DE EXEMPLO: "E se seus ossos fossem de aço?" — estilo "E se...?" (ver GUIA-ESTILO-E-SE.md).
// Fórmula: gancho absurdo → pergunta-título → ciência no raio-X → poder divertido → "só que..." →
// dilema com nomes → herói escolhe o outro → moral → volta ao começo → pergunta final → tela final.
// Cada tomada: { from, name, C (cena 3D), O? (HUD 2D por cima), trans? ('corte' | 'dissolve' | 'flash' | 'preto') }.
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element; O?: (p: ShotProps) => JSX.Element; trans?: 'corte' | 'dissolve' | 'flash' | 'preto'; semLegenda?: boolean };

// Efeitos sonoros opcionais: arquivos em public/sfx/ (ex.: { at: W(0, 'canela'), file: 'toc.mp3', vol: 1 }).
// Gerados no ElevenLabs (flow "Ossos de aço — música e efeitos"). Um efeito por onomatopeia, na mesma palavra.
export const SFX: { at: number; file: string; vol: number }[] = [
  { at: 0.05, file: 'skate.mp3', vol: 0.55 },
  { at: W(0, 'canela') - 0.03, file: 'toc.mp3', vol: 1 },
  { at: W(1, 'quebra') - 0.03, file: 'crack.mp3', vol: 0.8 },
  { at: W(2, 0) - 0.15, file: 'whoosh.mp3', vol: 0.6 }, // flash do título
  { at: W(3, 'concreto') - 0.03, file: 'crack.mp3', vol: 0.7 },
  { at: W(4, 'quatro') - 0.05, file: 'pop.mp3', vol: 0.5 },
  { at: W(5, 'dez') - 0.05, file: 'pop.mp3', vol: 0.5 },
  { at: W(6, 'quarenta') - 0.03, file: 'tum.mp3', vol: 0.85 },
  { at: W(7, 'canela') - 0.03, file: 'teim.mp3', vol: 1 },
  { at: W(9, 0) - 0.15, file: 'whoosh.mp3', vol: 0.55 }, // flash do "Só que..."
  { at: W(9, 'trinta') - 0.05, file: 'pop.mp3', vol: 0.5 },
  { at: W(11, 0), file: 'agua.mp3', vol: 0.6 },
  { at: W(16, 'ou') - 0.05, file: 'pop.mp3', vol: 0.45 },
  { at: W(18, 0) - 0.12, file: 'splash.mp3', vol: 0.75 },
  { at: W(18, 'pedra') - 0.03, file: 'tum.mp3', vol: 0.8 },
  { at: W(18, 'anda'), file: 'agua.mp3', vol: 0.5 },
  { at: W(19, 0), file: 'agua.mp3', vol: 0.5 },
  { at: W(20, 0), file: 'splash.mp3', vol: 0.45 },
  { at: W(22, 'cai') + 0.25, file: 'skate.mp3', vol: 0.5 },
  { at: W(23, 0) - 0.1, file: 'whoosh.mp3', vol: 0.5 },
  { at: W(24, 0) - 0.05, file: 'ding.mp3', vol: 0.9 }, // tela final
];

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });
const NINO = ESFERAS.nino.look;
const LARA = ESFERAS.lara.look;
const BRUNO = ESFERAS.bruno.look;
const IARA = ESFERAS.dra_iara.look;
const NINO_X = raioX(NINO);
const NINO_X_PERNAS = raioX(NINO, { destaque: 'pernas', destaqueCor: '#fff6c8' });
const NINO_ACO_PERNAS = raioX(NINO, { destaque: 'pernas', destaqueCor: '#dfe7f0', ossoMetal: true });
const NINO_ACO = raioX(NINO, { destaque: 'tudo', destaqueCor: '#dfe7f0', ossoMetal: true });

// Gira um personagem inteiro em volta de um ponto (queda, voo, mergulho).
const Giro = ({ p = [0, 0, 0], r = [0, 0, 0], children }: { p?: V3; r?: V3; children: ReactNode }) => (
  <group position={p} rotation={r}>
    {children}
  </group>
);

// ---------------------------------------------------------------------------
// 0 "Você cai do *skate*, bate a canela na calçada,"  — GANCHO
// ---------------------------------------------------------------------------
const S01 = ({ t, t0, t1 }: ShotProps) => {
  const bate = W(0, 'bate');
  const trava = bate - 0.45; // skate trava no meio-fio
  const x = t < trava ? -3 + (t - t0) * 3.2 : -3 + (trava - t0) * 3.2 + (t - trava) * 2.6;
  const voo = salto(t, trava, trava + 0.8, 0.9);
  const tomb = Math.min(1, Math.max(0, (t - trava) / 0.5));
  const face = faceAt(t, [{ at: t0, f: 'happy' }, { at: trava + 0.1, f: 'shocked', o: ['sweat'] }], 1);
  const skX = Math.min(x, -3 + (trava - t0) * 3.2);
  return (
    <>
      <Street placa="SORVETES" bg="#f6b98a" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-2.4, 0.7, 6.4], [-1, 1.0, 0], 32], [t1, [0.2, 0.8, 6.0], [0.5, 1.1, 0], 32]]} />
      <Calcada t={t} position={[1.15, 0, 0.1]} rotation={[0, Math.PI / 2, 0]} />
      <Skate position={[skX, 0, 0]} rotation={[0, Math.PI / 2, 0]} roda={skX * 6} />
      <Giro p={[x, 0.17 + voo, 0]} r={[0, 0, -tomb * 1.0]}>
        <Character pose={P({ ry: Math.PI / 2, lsx: 0.4 + tomb * 1.2, rsx: 0.4 + tomb * 1.2, lsz: 0.5, rsz: 0.5, squash: 0.15 - tomb * 0.15 })} face={face} look={NINO} />
      </Giro>
      <Arco t={t} from={trava} at={trava + 0.5} p0={[skX, 1.0, 0]} p1={[skX + 2.2, 0.6, 0]} altura={0.8} />
    </>
  );
};

const S02 = ({ t, t0, t1 }: ShotProps) => {
  const can = W(0, 'canela');
  const face = faceAt(t, [{ at: t0, f: 'shocked' }, { at: W(0, 'calcada'), f: 'nervous', o: ['sweat'] }], 2);
  return (
    <>
      <Street placa="SORVETES" bg="#f6b98a" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.6, 1.2, 4.6], [1.7, 0.5, 0], 32], [t1, [0.8, 1.1, 4.2], [1.8, 0.5, 0], 32]]} />
      <Calcada t={t} position={[1.15, 0, 0.1]} rotation={[0, Math.PI / 2, 0]} />
      <Giro p={[0.55, 0.05, 0]} r={[0, 0, -1.25]}>
        <Character pose={P({ ry: Math.PI / 2, lsx: 1.6, rsx: 1.6, lsz: 0.6, rsz: 0.6, walk: 0.5, stride: 0.8 })} face={face} look={NINO} />
      </Giro>
      <Puff t={t} at={can} n={6} position={[1.0, 0.3, 0]} color="#e0d8c8" />
    </>
  );
};

// 1 "e quem *quebra* é a calçada."
const S03 = ({ t, t0, t1 }: ShotProps) => {
  const q = W(1, 'quebra');
  const pose = track(t, P({ x: -0.6, ry: 0.5, hy: 0.6, squash: 0.35, lsz: 0.4, rsz: 0.4 }), [
    { at: q, v: { squash: 0, hy: 1.0, lsz: 0.9, rsz: 0.9, rel: 0.4, lel: 0.4 } },
    { at: W(1, 'calcada'), v: { hy: 0.2, ry: 0.25, lsz: 0.2, rsz: 0.2 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'dizzy' }, { at: q, f: 'shocked' }, { at: W(1, 'calcada'), f: 'smug', o: ['sparkle'] }], 3);
  return (
    <>
      <Street placa="SORVETES" bg="#f6b98a" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 1.4, 5.2], [0.3, 0.9, 0], 32], [t1, [0.0, 1.35, 4.5], [0.1, 1.0, 0], 32]]} />
      <Calcada t={t} at={q} position={[0.7, 0, -0.6]} />
      <Character pose={pose} face={face} look={NINO} />
    </>
  );
};
const O03 = ({ t }: ShotProps) => <Onoma t={t} at={W(1, 'quebra')} texto="CRÁÁÁC!" x={700} y={760} />;

// 2 "E se seus *ossos* fossem de *aço*?"  — PERGUNTA-TÍTULO
const S04 = ({ t, t0, t1 }: ShotProps) => {
  const pose = track(t, P({ x: 0, ry: 0.15, hp: 0.35, hy: -0.2 }), [
    { at: W(2, 'ossos'), v: { hp: 0.45, lsx: 0.5, lel: -0.6 } },
    { at: W(2, 'aco'), v: { hp: -0.05, hy: 0, lsx: 0, lel: 0.15, rsz: 1.2, rel: 0.3 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: W(2, 'aco'), f: 'starstruck', o: ['sparkle'] }], 4);
  return (
    <>
      <Street placa="SORVETES" bg="#f6b98a" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.3, 6.4], [0, 1.0, 0], 32], [t1, [0, 1.35, 5.2], [0, 1.05, 0], 32]]} />
      <Calcada t={t} at={t0 - 2} position={[0.8, 0, -0.8]} />
      <Character pose={pose} face={face} look={NINO} />
    </>
  );
};
const O04 = ({ t }: ShotProps) => (
  <Titulo t={t} linhas={[{ texto: 'E SE SEUS OSSOS', at: W(2, 0) }, { texto: 'FOSSEM', at: W(2, 'fossem') }, { texto: 'DE AÇO?', at: W(2, 'aco'), grande: true }]} />
);

// 3 "Seu osso já aguenta mais aperto que *concreto*."  — CIÊNCIA (raio-X, órbita)
const S05 = ({ t, t0, t1 }: ShotProps) => {
  const a0 = -0.6;
  const a1 = 0.5;
  const ang = (k: number) => [Math.sin(k) * 4.4, 1.3, Math.cos(k) * 4.4] as V3;
  const face = faceAt(t, [{ at: t0, f: 'confident' }], 5);
  return (
    <>
      <GradeNeon t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, ang(a0), [0, 1.05, 0], 32], [t1, ang(a1), [0, 1.05, 0], 32]]} />
      <Character pose={P({ lsz: 0.35, rsz: 0.35 })} face={face} look={t >= W(3, 'osso') ? NINO_X_PERNAS : NINO_X} />
    </>
  );
};
const S06 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(3, 'concreto');
  return (
    <>
      <GradeNeon t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.3, 4.6], [0, 0.8, 0], 32], [t1, [0, 1.2, 4.0], [0, 0.75, 0], 32]]} />
      <Osso position={[-0.75, 0.62, 0]} comp={0.8} />
      <group scale={[1, 1.2, 1]}>
        <BlocoConcreto t={t} at={c} position={[0.75, 0, 0]} />
      </group>
      <Prensa t={t} from={t0} at={c} topo={1.22} />
    </>
  );
};
const O06 = ({ t }: ShotProps) => (
  <>
    <Numero t={t} at={W(3, 'osso') + 0.2} texto="OSSO" x={330} y={1150} size={70} cor="#ffffff" />
    <Numero t={t} at={W(3, 'concreto')} texto="CONCRETO" x={760} y={1150} size={70} cor="#ffffff" />
    <Onoma t={t} at={W(3, 'concreto')} texto="CRACK!" x={760} y={620} />
  </>
);

// 4 "Mas o aço pesa quase *quatro* vezes mais."
const S07 = ({ t, t0, t1 }: ShotProps) => {
  const aco = W(4, 'aco');
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: W(4, 'quatro'), f: 'surprised' }], 6);
  return (
    <>
      <GradeNeon t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.9, 0.5, 2.6], [0, 0.5, 0], 34], [t1, [0.7, 1.3, 3.4], [0, 1.0, 0], 34]]} />
      <Character pose={P({ lsz: 0.3, rsz: 0.3, hp: 0.3 })} face={face} look={t >= aco ? NINO_ACO_PERNAS : NINO_X_PERNAS} />
    </>
  );
};
const O07 = ({ t }: ShotProps) => (
  <>
    <Numero t={t} at={W(4, 'quatro')} texto="4X" x={780} y={900} size={190} />
    <Numero t={t} at={W(4, 'vezes')} texto="MAIS PESADO" x={780} y={1040} size={64} cor="#ffffff" />
  </>
);

// 5 "Seu esqueleto tinha uns *dez* quilos."
const S08 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <GradeNeon t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.8, 1.2, 4.8], [0, 1.0, 0], 32], [t1, [-0.4, 1.25, 4.4], [0, 1.0, 0], 32]]} />
    <Character pose={P({ lsz: 0.45, rsz: 0.45 })} face={faceAt(t, [{ at: t0, f: 'smile' }], 7)} look={NINO_X} />
  </>
);
const O08 = ({ t, t0 }: ShotProps) => <Selo t={t} from={t0 + 0.1} at={W(5, 'dez')} para={10} sufixo=" KG" y={330} />;

// 6 "Agora? *Quarenta*."
const S09 = ({ t, t0, t1 }: ShotProps) => {
  const q = W(6, 'quarenta');
  const pose = track(t, P({ lsz: 0.45, rsz: 0.45 }), [{ at: q, v: { squash: 0.35, lsz: 0.9, rsz: 0.9, hp: 0.15 }, lead: 0 }]);
  return (
    <>
      <GradeNeon t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 0.45, 3.9], [0, 1.25, 0], 34], [t1, [0.3, 0.4, 3.5], [0, 1.25, 0], 34]]} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'surprised' }, { at: q, f: 'shocked', o: ['sweat'] }], 8)} look={NINO_ACO} />
      <Puff t={t} at={q} n={10} position={[0, 0.05, 0.1]} color="#9fe8ff" size={0.4} />
    </>
  );
};
const O09 = ({ t, t0 }: ShotProps) => (
  <>
    <Selo t={t} from={t0} at={W(6, 'quarenta')} de={10} para={40} sufixo=" KG" y={330} cor="#ff3b4f" />
    <Onoma t={t} at={W(6, 'quarenta')} texto="TUM!" x={760} y={1220} size={110} />
  </>
);

// 7 "O Bruno, seu rival, chuta sua *canela*."
const S10 = ({ t, t0, t1 }: ShotProps) => {
  const pose = track(t, P({ x: 0, ry: -0.2, lsz: 0.15, rsz: 0.15 }), [{ at: W(7, 'rival'), v: { hy: -0.25, hr: 0.12, lsx: 0.9, rsx: 0.9, lel: 1.6, rel: 1.6 } }]);
  return (
    <>
      <Room placa="ESCOLA" parede="#3a6aa6" balcao={false} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.5, 1.6, 4.0], [0, 1.4, 0], 32], [t1, [0.3, 1.65, 3.3], [0, 1.45, 0], 32]]} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'smug' }, { at: W(7, 'rival'), f: 'confident' }], 9)} look={BRUNO} />
    </>
  );
};
const S11 = ({ t, t0, t1 }: ShotProps) => {
  const can = W(7, 'canela');
  const kick = track(t, P({ x: -0.7, ry: Math.PI / 2, lsz: 0.4, rsz: 0.4 }), [{ at: can, v: { walk: 0.5, stride: 1.7, lean: -0.25, lsz: 1.0, rsz: 1.0 }, lead: 0, dur: 4 }]);
  return (
    <>
      <Room placa="ESCOLA" parede="#3a6aa6" balcao={false} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.1, 1.2, 5.8], [-0.1, 0.9, 0], 32], [t1, [-0.1, 1.1, 5.3], [-0.1, 0.85, 0], 32]]} />
      <Character pose={kick} face={faceAt(t, [{ at: t0, f: 'furious' }], 10)} look={BRUNO} />
      <Character pose={P({ x: 0.55, ry: -Math.PI / 2, lsz: 0.2, rsz: 0.2, hy: 0.4 })} face={faceAt(t, [{ at: t0, f: 'deadpan' }], 11)} look={NINO} />
    </>
  );
};
const O11 = ({ t }: ShotProps) => <Onoma t={t} at={W(7, 'canela')} texto="TÉÉÉIM!" x={560} y={1060} size={120} />;

// 8 "Quem sai pulando num pé só é *ele*."
const S12 = ({ t, t0, t1 }: ShotProps) => {
  const hop = Math.abs(Math.sin((t - t0) * 7)) * 0.32;
  const x = -0.4 + Math.sin((t - t0) * 2) * 0.5;
  return (
    <>
      <Room placa="ESCOLA" parede="#3a6aa6" balcao={false} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.5, 6.2], [0, 1.0, 0], 32], [t1, [0.2, 1.5, 5.6], [0, 1.0, 0], 32]]} />
      <Character pose={P({ x, y: hop, ry: 0.4, rtap: 1, lsx: 0.4, rsx: 1.2, rel: 1.4, lsz: 0.9, hp: 0.2 })} face={faceAt(t, [{ at: t0, f: 'panic', o: ['tears'] }], 12)} look={BRUNO} />
      <Character pose={P({ x: 1.2, z: -1.2, ry: -0.4, lsz: 0.15, rsz: 0.15, pockets: 0 })} face={faceAt(t, [{ at: t0, f: 'deadpan' }, { at: W(8, 'ele'), f: 'smug', o: ['sparkle'] }], 13)} look={NINO} />
    </>
  );
};
const O12 = ({ t, t0 }: ShotProps) => <Onoma t={t} at={t0 + 0.2} texto="AIAIAI!" x={360} y={520} size={100} hold={1.6} />;

// 9 "Só que seu corpo ganhou *trinta* quilos."  — O PORÉM
const S13 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <GradeNeon t={t} cor="#ff4d6d" bg="#1a0f2e" />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 0.4, 4.2], [0, 1.3, 0], 34], [t1, [-0.4, 0.45, 3.7], [0, 1.3, 0], 34]]} />
    <Character pose={P({ squash: 0.25, lsz: 0.2, rsz: 0.2, hp: 0.2 })} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: W(9, 'trinta'), f: 'nervous', o: ['sweat'] }], 14)} look={NINO_ACO} />
  </>
);
const O13 = ({ t, t0 }: ShotProps) => <Selo t={t} from={t0} at={W(9, 'trinta')} para={30} prefixo="+" sufixo=" KG" y={330} cor="#ff3b4f" />;

// 10 "Na balança da escola: *noventa*."
const S14 = ({ t, t0, t1 }: ShotProps) => {
  const n = W(10, 'noventa');
  return (
    <>
      <Room placa="ENFERMARIA" parede="#cfe6ee" balcao={false} piso={['#f4f1ea', '#d8d2c4']} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.6, 1.6, 5.4], [0.2, 1.3, 0], 32], [t1, [0.4, 1.7, 4.6], [0.2, 1.4, 0], 32]]} />
      <Balanca t={t} from={t0 + 0.2} at={n} valor={90} position={[-0.3, 0, 0]} />
      <Character pose={P({ x: -0.3, y: 0.12, z: 0.1, lsz: 0.2, rsz: 0.2, hp: 0.25 })} face={faceAt(t, [{ at: t0, f: 'unsure' }, { at: n, f: 'shocked', o: ['sweat'] }], 15)} look={NINO} />
      <Character pose={P({ x: 1.0, z: 0.3, ry: -0.6, rsx: 0.9, rel: 1.2 })} face={faceAt(t, [{ at: t0, f: 'thinking' }, { at: n, f: 'amazed' }], 16)} look={IARA} right={<Clipboard position={[0, -0.12, 0.05]} scale={0.6} />} />
    </>
  );
};

// 11 "E corpo pesado não *boia*."
const S15 = ({ t, t0, t1 }: ShotProps) => {
  const y = Math.max(FUNDO_Y, -0.6 - (t - t0) * 1.4);
  return (
    <>
      <Piscina t={t} submerso />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, -1.0, 0.4], [0, -1.0, -3.5], 34], [t1, [0.4, -1.5, 0.2], [0, -1.6, -3.5], 34]]} />
      <Character pose={P({ z: -3.5, y, lsz: 1.4, rsz: 1.4, lel: 0.3, rel: 0.3 })} face={faceAt(t, [{ at: t0, f: 'surprised' }, { at: W(11, 'boia'), f: 'nervous', o: ['sweat'] }], 17)} look={NINO} />
      <Bolhas t={t} centro={[0, y + 1.9, -3.5]} raio={0.5} altura={2.4} />
    </>
  );
};

// 12 "Sábado, *piscina* do clube."  — CONFLITO
const S16 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Piscina t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [5.5, 6.5, 8.5], [0, 0, -2.5], 32], [t1, [4.5, 4.2, 7.5], [0, 0, -2.5], 32]]} />
    <Character pose={P({ x: -1.2, z: 2.2, ry: 0.2 })} face={faceAt(t, [{ at: t0, f: 'happy' }], 18)} look={NINO} />
    <Character pose={P({ x: 1.3, z: 2.6, ry: -0.5 })} face={faceAt(t, [{ at: t0, f: 'smug' }], 19)} look={BRUNO} />
    <Character pose={P({ x: 0.3 + Math.sin(t) * 0.3, z: -4.2, y: -1.45, lsz: 1.3, rsz: 1.3 })} face={faceAt(t, [{ at: t0, f: 'laugh' }], 20)} look={LARA} />
  </>
);
const O16 = ({ t }: ShotProps) => <Capitulo t={t} at={W(12, 0)} texto="SÁBADO" sub="piscina do clube" />;

// 13 "A Lara, sua melhor amiga, tem *câimbra* no fundo."
const S17 = ({ t, t0, t1 }: ShotProps) => {
  const wave = Math.sin((t - t0) * 6) * 0.4;
  return (
    <>
      <Piscina t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 0.6, -0.6], [0.1, 0.1, -4.2], 30], [t1, [0.2, 0.55, -1.2], [0.1, 0.15, -4.2], 30]]} />
      <Character pose={P({ x: 0.1, z: -4.2, y: -1.45, rsz: 2.6 + wave, rel: 0.4, lsz: 0.9 })} face={faceAt(t, [{ at: t0, f: 'bigSmile' }, { at: W(13, 'amiga'), f: 'laugh' }], 21)} look={LARA} />
    </>
  );
};
const S18 = ({ t, t0, t1 }: ShotProps) => {
  const f = Math.sin((t - t0) * 14);
  return (
    <>
      <Piscina t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 0.45, -0.5], [0.1, 0.15, -4.2], 30], [t1, [0.25, 0.45, -0.9], [0.1, 0.15, -4.2], 30]]} />
      <Character pose={P({ x: 0.1, z: -4.2, y: -1.6 + f * 0.04, lsz: 2.5 + f * 0.3, rsz: 2.5 - f * 0.3, lel: 0.5, rel: 0.5, hp: -0.15 })} face={faceAt(t, [{ at: t0, f: 'panic', o: ['sweat3'] }], 22)} look={LARA} />
      <Splash t={t} at={t0 + 0.05} position={[0.1, AGUA_Y, -4.2]} forca={0.5} />
    </>
  );
};
const O18 = ({ t }: ShotProps) => (
  <>
    <Vinheta forca={0.5} />
    <Onoma t={t} at={W(13, 'caimbra') + 0.1} texto="SOCORRO!" x={540} y={520} size={110} cor="#ff6a8a" hold={1.2} />
  </>
);

// 14 "O Bruno grita: pula, *herói*!"
const S19 = ({ t, t0, t1 }: ShotProps) => {
  const pose = track(t, P({ x: 0, ry: -0.3, lsz: 0.2, rsz: 0.2 }), [{ at: W(14, 'pula'), v: { rsx: 1.5, rsz: 0.3, rel: 0, lsz: 0.6, hy: -0.2 } }]);
  return (
    <>
      <Piscina t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 0.6, 3.6], [0, 1.6, 0], 34], [t1, [0.6, 0.55, 3.2], [0, 1.65, 0], 34]]} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'furious' }, { at: W(14, 'heroi'), f: 'smug' }], 23)} look={BRUNO} />
    </>
  );
};

// 15 "Mas se você pular, você *afunda*."
const S20 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Piscina t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 1.6, 5.0], [0, 1.35, 1.2], 32], [t1, [0.15, 1.6, 4.5], [0, 1.4, 1.2], 32]]} />
    <Character pose={P({ z: 1.2, ry: 0.15, hp: 0.25, lsz: 0.15, rsz: 0.15 })} face={faceAt(t, [{ at: t0, f: 'worried', o: ['sweat'] }, { at: W(15, 'afunda'), f: 'scared', o: ['sweat3'] }], 24)} look={NINO} />
  </>
);
const O20 = () => <Vinheta forca={0.6} />;

// 16 "Ficar na borda, ou pular *mesmo* assim?"  — DILEMA
const S21 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Piscina t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.9, 3.7, 5.8], [0.1, 0.0, -4.2], 30], [t1, [-1.7, 3.5, 5.3], [0.1, 0.0, -4.2], 30]]} />
    <Character pose={P({ x: -0.1, z: 1.9, ry: Math.PI, lsz: 0.2, rsz: 0.2 })} face={faceAt(t, [{ at: t0, f: 'worried' }], 25)} look={NINO} />
    <Character pose={P({ x: 0.1, z: -4.2, y: -1.65, lsz: 2.6, rsz: 2.4 })} face={faceAt(t, [{ at: t0, f: 'panic' }], 26)} look={LARA} />
  </>
);
const O21 = ({ t }: ShotProps) => (
  <Titulo t={t} linhas={[{ texto: 'FICAR NA BORDA?', at: W(16, 0) }, { texto: 'OU PULAR?', at: W(16, 'ou'), grande: true }]} />
);

// 17 "Você *pula*."
const S22 = ({ t, t0, t1 }: ShotProps) => {
  const pula = W(17, 'pula');
  const fim = W(18, 0);
  const u = Math.min(1, Math.max(0, (t - pula) / (fim - pula)));
  const z = 1.2 - u * 2.4;
  const y = salto(t, pula, fim + 0.25, 1.3) - (u > 0.85 ? (u - 0.85) * 6 : 0);
  const pose = track(t, P({ z: 1.2, ry: Math.PI, squash: 0 }), [
    { at: pula - 0.12, v: { squash: 0.4, lsx: -0.6, rsx: -0.6 } },
    { at: pula, v: { squash: 0, lsx: 2.8, rsx: 2.8, lsz: 0.2, rsz: 0.2 }, lead: 0, dur: 3 },
  ]);
  return (
    <>
      <Piscina t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [6.2, 1.6, 0.0], [0, 1.2, -0.1], 32], [t1, [5.8, 1.3, -0.3], [0, 0.7, -0.5], 32]]} />
      <Character pose={{ ...pose, z, y }} face={faceAt(t, [{ at: t0, f: 'confident' }], 27)} look={NINO} />
      <Splash t={t} at={fim - 0.08} position={[0, AGUA_Y, -1.1]} forca={1.1} />
    </>
  );
};
const O22 = ({ t }: ShotProps) => <Onoma t={t} at={W(18, 0) - 0.05} texto="SPLASH!" x={540} y={600} cor="#7fe3ff" />;

// 18 "Afunda feito *pedra*, e anda pelo *fundo*."
const S23 = ({ t, t0, t1 }: ShotProps) => {
  const pedra = W(18, 'pedra');
  const y = Math.max(FUNDO_Y, AGUA_Y - 0.4 - ((t - t0) / (pedra - t0)) * (AGUA_Y - 0.4 - FUNDO_Y));
  return (
    <>
      <Piscina t={t} submerso />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.6, -1.1, 0.6], [0, -1.1, -1.4], 42], [t1, [1.7, -1.5, 0.5], [0, -1.35, -1.4], 42]]} />
      <Character pose={P({ z: -1.4, y, ry: 0.4, lsz: 2.4, rsz: 2.4, squash: t >= pedra ? 0.3 * Math.max(0, 1 - (t - pedra) / 0.3) : 0 })} face={faceAt(t, [{ at: t0, f: 'surprised' }, { at: pedra, f: 'confident' }], 28)} look={NINO} />
      <Bolhas t={t} centro={[0, y + 1.8, -1.4]} raio={0.6} altura={2.2} n={20} />
      <Puff t={t} at={pedra} n={9} position={[0, FUNDO_Y + 0.05, -1.4]} color="#d8f3ff" size={0.4} />
    </>
  );
};
const O23 = ({ t }: ShotProps) => <Onoma t={t} at={W(18, 'pedra')} texto="TUM!" x={540} y={1180} size={110} />;
const S24 = ({ t, t0, t1 }: ShotProps) => {
  const d = (t - t0) * 0.9;
  const z = -1.4 - d;
  return (
    <>
      <Piscina t={t} submerso />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [2.2, -1.25, -1.6], [0, -1.2, -1.6], 48], [t1, [2.2, -1.25, -1.6 - (t1 - t0) * 0.9], [0, -1.2, -1.6 - (t1 - t0) * 0.9], 48]]} />
      <Character pose={P({ z, y: FUNDO_Y, ry: Math.PI, walk: d / 0.24, stride: 1, lean: 0.25, lsz: 0.3, rsz: 0.3 })} face={faceAt(t, [{ at: t0, f: 'confident' }], 29)} look={NINO} />
      <Bolhas t={t} centro={[0, FUNDO_Y + 1.9, z]} raio={0.3} altura={2} n={8} />
    </>
  );
};

// 19 "Segura a Lara e *empurra* ela pra cima."
const S25 = ({ t, t0, t1 }: ShotProps) => {
  const e = W(19, 'empurra');
  const subir = Math.max(0, Math.min(1, (t - e) / 0.6));
  const pose = track(t, P({ z: -4.2, y: FUNDO_Y, ry: Math.PI * 0.85, lsx: 1.6, rsx: 1.6, lel: 0.8, rel: 0.8 }), [
    { at: e, v: { lsx: 3.0, rsx: 3.0, lel: 0, rel: 0, squash: 0 }, lead: 0, dur: 5 },
  ]);
  return (
    <>
      <Piscina t={t} submerso />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [2.2, -2.2, -0.6], [0, -1.0, -4.2], 38], [t1, [2.0, -2.25, -0.8], [0, -0.85, -4.2], 38]]} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'confident' }, { at: e, f: 'furious' }], 30)} look={NINO} />
      <Character pose={P({ z: -4.15, y: -1.75 + subir * 0.7 + (t < e ? 0 : 0), lsz: 1.8, rsz: 1.8, ry: 0.2 })} face={faceAt(t, [{ at: t0, f: 'scared' }, { at: e, f: 'surprised' }], 31)} look={LARA} />
      <Bolhas t={t} centro={[0, -0.6, -4.2]} raio={0.6} altura={1} n={12} />
    </>
  );
};

// 20 "Ela respira. Você sai pela *escada*, a pé."
const S26 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Piscina t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 0.6, -0.4], [0.1, 0.15, -4.2], 30], [t1, [0.3, 0.6, -0.9], [0.1, 0.2, -4.2], 30]]} />
    <Character pose={P({ x: 0.1, z: -4.2, y: -1.3, lsz: 1.0, rsz: 1.0 })} face={faceAt(t, [{ at: t0, f: 'shocked' }, { at: W(20, 'respira') + 0.2, f: 'laugh' }], 32)} look={LARA} />
    <Splash t={t} at={t0} position={[0.1, AGUA_Y, -4.2]} forca={0.6} />
  </>
);
const O26 = ({ t, t0 }: ShotProps) => <Onoma t={t} at={t0 + 0.05} texto="HAAA!" x={540} y={560} size={110} cor="#ffffff" />;
const S27 = ({ t, t0, t1 }: ShotProps) => {
  const k = Math.min(1, (t - t0) / (t1 - t0 - 0.3));
  const y = FUNDO_Y + 0.4 + k * (0 - FUNDO_Y - 0.4);
  const x = 2.05 + (k > 0.85 ? (k - 0.85) * 4 : 0);
  return (
    <>
      <Piscina t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [6.0, 1.6, 4.4], [2.3, 0.3, 0.6], 32], [t1, [5.6, 1.8, 4.0], [2.5, 0.8, 0.6], 32]]} />
      <Character pose={P({ x, y, z: 0.6, ry: Math.PI / 2, lsx: 2.2 - k, rsx: 2.4 - k, walk: k * 6, stride: 0.6 })} face={faceAt(t, [{ at: t0, f: 'tired' }, { at: W(20, 'escada'), f: 'content' }], 33)} look={NINO} />
    </>
  );
};

// 21 "Às vezes, quem afunda é quem *levanta* os outros."  — MORAL
const S28 = ({ t, t0, t1 }: ShotProps) => {
  const a = (k: number) => [Math.sin(k) * 6, 1.6, 2.2 + Math.cos(k) * 6] as V3;
  return (
    <>
      <Piscina t={t} bg="#ffb98a" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, a(-0.5), [0, 1.0, 2.2], 30], [t1, a(0.15), [0, 1.0, 2.2], 30]]} />
      <Character pose={P({ x: -0.45, z: 2.3, ry: 0.35, hy: 0.4, lsz: 0.2, rsz: 0.2 })} face={faceAt(t, [{ at: t0, f: 'closedSmile' }], 34)} look={NINO} />
      <Character pose={P({ x: 0.45, z: 2.2, ry: -0.35, hy: -0.4, lsz: 1.2, lel: 0.3 })} face={faceAt(t, [{ at: t0, f: 'laugh' }], 35)} look={LARA} />
      <Character pose={P({ x: 1.9, z: 0.9, ry: -0.6, lsx: 1.1, rsx: 1.1, lel: 1.3, rel: 1.3 })} face={faceAt(t, [{ at: t0, f: 'unsure' }, { at: W(21, 'levanta'), f: 'smile' }], 36)} look={BRUNO} />
    </>
  );
};

// 22 "Dias depois, você cai do skate de novo, e *ri*."  — VOLTA AO COMEÇO
const S29 = ({ t, t0, t1 }: ShotProps) => {
  const cai = W(22, 'cai');
  const trava = cai + 0.25;
  const x = t < trava ? -2.6 + (t - t0) * 2.4 : -2.6 + (trava - t0) * 2.4 + Math.min(t - trava, 0.5) * 1.2;
  const voo = salto(t, trava, trava + 0.6, 0.6);
  const tomb = Math.min(1, Math.max(0, (t - trava) / 0.45));
  const skX = Math.min(x, -2.6 + (trava - t0) * 2.4);
  return (
    <>
      <Street placa="SORVETES" bg="#f6b98a" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.2, 1.3, 6.2], [-0.6, 0.9, 0], 32], [t1, [2.6, 1.6, 5.4], [2.8, 0.5, 0], 32]]} />
      <Calcada t={t} position={[1.15, 0, 0.1]} rotation={[0, Math.PI / 2, 0]} at={trava + 0.4} />
      <Skate position={[skX, 0, 0]} rotation={[0, Math.PI / 2, 0]} roda={skX * 6} />
      <Giro p={[x, 0.17 + voo, 0]} r={[0, 0, -tomb * 1.35]}>
        <Character pose={P({ ry: Math.PI / 2, lsx: 0.4 + tomb * 1.4, rsx: 0.4 + tomb * 1.4, lsz: 0.5, rsz: 0.5, hy: tomb * -0.8 })} face={faceAt(t, [{ at: t0, f: 'happy' }, { at: trava + 0.1, f: 'surprised' }, { at: W(22, 'ri'), f: 'laugh' }], 37)} look={NINO} />
      </Giro>
    </>
  );
};
const O29 = ({ t }: ShotProps) => <Capitulo t={t} at={W(22, 0)} texto="DIAS DEPOIS" ate={W(22, 'skate')} />;

// 23 "E você, o que faria com ossos de *aço*?"  — PERGUNTA FINAL
const S30 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Street placa="SORVETES" bg="#f6b98a" />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.3, 5.4], [0, 1.05, 0], 32], [t1, [0, 1.35, 4.7], [0, 1.1, 0], 32]]} />
    <Character pose={P({ x: -0.5, ry: 0.15, rsz: 1.1, rel: 0.2 })} face={faceAt(t, [{ at: t0, f: 'bigSmile' }, { at: W(23, 'aco'), f: 'wink' }], 38)} look={NINO} />
    <Character pose={P({ x: 0.55, z: -0.3, ry: -0.2, lsz: 2.7, lel: 0.3 })} face={faceAt(t, [{ at: t0, f: 'happy' }], 39)} look={LARA} />
  </>
);
const O30 = ({ t }: ShotProps) => (
  <Titulo t={t} linhas={[{ texto: 'E VOCÊ?', at: W(23, 0), grande: true }, { texto: 'O QUE FARIA COM', at: W(23, 'o') }, { texto: 'OSSOS DE AÇO?', at: W(23, 'ossos') }]} />
);

// 24 "Comenta aí e se *inscreve*!"  — TELA FINAL
const S31 = () => <></>;
const O31 = ({ t, t0 }: ShotProps) => <TelaFinal t={t} t0={t0} />;

export const SHOTS: Shot[] = [
  { from: 0, name: '01 skate', C: S01 },
  { from: W(0, 'bate'), name: '02 canela', C: S02 },
  { from: W(1, 0), name: '03 calcada quebra', C: S03, O: O03 },
  { from: W(2, 0), name: '04 titulo', C: S04, O: O04, trans: 'flash' },
  { from: W(3, 0), name: '05 raio-x orbita', C: S05 },
  { from: W(3, 'aperto'), name: '06 prensa', C: S06, O: O06 },
  { from: W(4, 0), name: '07 pernas de aco', C: S07, O: O07 },
  { from: W(5, 0), name: '08 dez quilos', C: S08, O: O08 },
  { from: W(6, 0), name: '09 quarenta', C: S09, O: O09 },
  { from: W(7, 0), name: '10 bruno', C: S10 },
  { from: W(7, 'chuta'), name: '11 chute', C: S11, O: O11 },
  { from: W(8, 0), name: '12 pula num pe', C: S12, O: O12 },
  { from: W(9, 0), name: '13 trinta quilos', C: S13, O: O13, trans: 'flash' },
  { from: W(10, 0), name: '14 balanca', C: S14 },
  { from: W(11, 0), name: '15 nao boia', C: S15 },
  { from: W(12, 0), name: '16 sabado', C: S16, O: O16, trans: 'dissolve' },
  { from: W(13, 0), name: '17 lara', C: S17 },
  { from: W(13, 'caimbra'), name: '18 caimbra', C: S18, O: O18 },
  { from: W(14, 0), name: '19 bruno grita', C: S19 },
  { from: W(15, 0), name: '20 medo', C: S20, O: O20 },
  { from: W(16, 0), name: '21 dilema', C: S21, O: O21 },
  { from: W(17, 0), name: '22 pula', C: S22, O: O22 },
  { from: W(18, 0), name: '23 afunda', C: S23, O: O23 },
  { from: W(18, 'anda'), name: '24 anda no fundo', C: S24 },
  { from: W(19, 0), name: '25 empurra', C: S25 },
  { from: W(20, 0), name: '26 respira', C: S26, O: O26 },
  { from: W(20, 'voce'), name: '27 escada', C: S27 },
  { from: W(21, 0), name: '28 moral', C: S28, trans: 'dissolve' },
  { from: W(22, 0), name: '29 dias depois', C: S29, O: O29, trans: 'preto' },
  { from: W(23, 0), name: '30 e voce', C: S30, O: O30 },
  { from: W(24, 0), name: '31 tela final', C: S31, O: O31, trans: 'flash', semLegenda: true },
];
