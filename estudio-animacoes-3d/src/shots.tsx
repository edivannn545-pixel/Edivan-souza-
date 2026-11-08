import { JSX } from 'react';
import { clamp01, easeInOut, lerp, seg, track, V3 } from './anim';
import { Character, faceAt, Pose, REST } from './Character';
import {
  Cage, CHEFE, CityFront, Cobweb, COLEGA, Desk, DESK_H, DeskPlate, DreamCloud, GABI, InTray, KAIO, Letter, MESA_CHEFE, MESA_COLEGA, MESA_GABI,
  MESA_KAIO, MESA_PAULA, MESA_VOCE, Meter, Office, PAULA, pop, sentadoEm, SENTADO, WallClock, Weight,
} from './escritorio';
import { IdeaBulb, Paper } from './historia';
import { Calendar, Comic, LedCounter, PaperRain, Puff, Sparkles, StampMark } from './props';
import { Cam, Stage } from './sets';
import { W } from './timeline';

// ============================================================================
// "O CARGO DE NÃO FAZER NADA" — tomadas do STORYBOARD.md, ancoradas em palavras com W(linha, 'palavra').
// A versão do pachinko está guardada em historias/pachinko/.
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element };

export const SFX: { at: number; file: string; vol: number }[] = [];

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });
const walkAlong = (t: number, a: number, b: number, from: V3, to: V3) => {
  const k = clamp01((t - a) / (b - a));
  const kk = easeInOut(k) * 0.25 + k * 0.75;
  const p: V3 = [lerp(from[0], to[0], kk), from[1], lerp(from[2], to[2], kk)];
  const dist = Math.hypot(p[0] - from[0], p[2] - from[2]);
  const moving = t > a && t < b;
  return { p, walk: dist / 0.24, stride: moving ? Math.min(1, (t - a) / 0.15, (b - t) / 0.15) : 0 };
};

// Colegas trabalhando nas mesas (digitando: braços batem no teclado). `afasta` empurra as mesas para longe.
const Colegas = ({ t, digitando = false, afasta = 0, sem = [] as string[] }: { t: number; digitando?: boolean; afasta?: number; sem?: string[] }) => {
  const lista: [string, V3, typeof PAULA, number][] = [
    ['colega', MESA_COLEGA, COLEGA, 31],
    ['paula', MESA_PAULA, PAULA, 32],
    ['kaio', MESA_KAIO, KAIO, 33],
    ['gabi', MESA_GABI, GABI, 34],
  ];
  return (
    <>
      {lista.map(([id, m, look, seed]) => {
        const off: V3 = [m[0] + afasta * 3.5, 0, m[2] - afasta * 2.5];
        const typ = digitando ? Math.abs(Math.sin(t * 9 + seed)) * 0.15 : 0;
        return (
          <group key={id}>
            <Desk t={t} position={off} papeis={0.4 + (seed % 3) * 0.2} />
            {!sem.includes(id) && (
              <Character pose={sentadoEm(off, { lsx: 0.75 + typ, rsx: 0.9 - typ, hp: 0.12, hy: Math.sin(seed) * 0.15 })} face={faceAt(t, [{ at: 0, f: seed % 2 ? 'thinking' : 'neutral' }], seed)} look={look} />
            )}
          </group>
        );
      })}
    </>
  );
};

// A mesa do Você (com a placa do cargo).
const MesaVoce = ({ t, placa = true, extra }: { t: number; placa?: boolean; extra?: JSX.Element }) => (
  <group>
    <Desk t={t} position={MESA_VOCE} vazia />
    {placa && <DeskPlate text="CARGO: NÃO FAZER NADA" position={[MESA_VOCE[0] + 0.1, DESK_H + 0.03, MESA_VOCE[2] + 0.15]} scale={0.8} />}
    {extra}
  </group>
);
const VOCE_SENTADO = (o: Partial<Pose> = {}) => sentadoEm(MESA_VOCE, { lsx: 0.6, rsx: 0.6, lel: -0.9, rel: -0.9, ...o });

// 01. "No *Japão*, você descobre que" — rua de dia em frente ao prédio; a bandeira chega ao topo em "Japão".
const S01 = ({ t, t0, t1 }: ShotProps) => {
  const jp = W(0, 'japao');
  const pose = track(t, P({ ry: 0.15, hy: 0.25, hp: -0.15 }), [
    { at: jp, v: { hy: -0.05, hp: -0.35, lsz: 0.5, rsz: 0.5, lel: 0.4, rel: 0.4 } },
    { at: W(0, 'descobre'), v: { hy: 0.3, hp: 0, lsz: 0.12, rsz: 0.12, rsx: 0.9, rel: -1.9 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: jp, f: 'amazed' }, { at: W(0, 'descobre'), f: 'thinking' }], 1);
  return (
    <>
      <CityFront t={t} sobe={jp} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.6, 3.6, 7.0], [0.6, 3.6, -1.2], 32], [jp, [-0.3, 2.6, 6.0], [0.5, 2.6, -0.6], 32], [t1, [0.1, 1.7, 4.4], [0.1, 1.55, 0], 32]]} />
      <Character pose={pose} face={face} />
    </>
  );
};

// 02. "pode ser muito difícil *demitir* um funcionário." — o chefe tenta demitir o Funcionário.
const S02 = ({ t, t0, t1 }: ShotProps) => {
  const d = W(0, 'demitir');
  const hpose = track(t, P({ x: 0.15, z: 0.6, ry: 0.5, rsx: 0.9, rel: -0.6 }), [
    { at: W(0, 'dificil'), v: { rsx: 1.3, rel: -0.2, hy: 0.4 } },
    { at: d, v: { rsx: 0.4, rel: 0.2, lsz: 1.2, rsz: 1.2, lel: 0.3, squash: 0.08, hy: 0.2 } },
  ]);
  const hface = faceAt(t, [{ at: t0, f: 'confident' }, { at: d, f: 'worried', o: ['sweat'] }], 2);
  const s = pop(t, d);
  return (
    <>
      <Office t={t} />
      <Desk t={t} position={MESA_COLEGA} papeis={0.6} />
      <Character pose={sentadoEm(MESA_COLEGA, { hy: -0.4, hp: -0.1 })} face={faceAt(t, [{ at: t0, f: 'smile' }, { at: d, f: 'confident' }], 3)} look={COLEGA} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.6, 1.8, 4.4], [0.6, 1.25, 0], 32], [t1, [1.3, 1.75, 3.9], [0.6, 1.3, 0], 32]]} />
      <Character pose={hpose} face={hface} look={CHEFE} />
      <group position={[0.55, 2.35, 0.4]} scale={s}>
        <Paper text="DEMISSÃO" color="#26324a" scale={0.75} />
        <StampMark text="DIFÍCIL!" w={0.75} color="#e0262e" position={[0, -0.05, 0.02]} rotation={[0, 0, 0.25]} />
      </group>
      <Puff t={t} at={d} position={[0.55, 2.3, 0.5]} color="#ffb0b0" size={0.18} />
    </>
  );
};

// 03. "Então a empresa encontra uma solução *estranha*:" — o chefe pensa.
const S03 = ({ t, t0, t1 }: ShotProps) => {
  const e = W(1, 'estranha');
  const pose = track(t, P({ x: -1.6, z: -1.2, ry: 0.25, rsx: 0.9, rel: -2.2, hp: -0.15, hy: 0.3 }), [
    { at: W(1, 'solucao'), v: { hy: -0.2, hr: 0.15 } },
    { at: e, v: { rsx: 2.6, rel: -0.1, hp: -0.25, hy: 0.1, hr: 0 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'thinking' }, { at: W(1, 'solucao'), f: 'curious' }, { at: e, f: 'grin', o: ['sparkle'] }], 4);
  return (
    <>
      <Office t={t} />
      <Desk t={t} position={MESA_CHEFE} papeis={0.3} tela="#ffd98a" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.8, 1.9, 2.6], [-1.6, 1.7, -1.2], 32], [t1, [-1.0, 1.85, 2.0], [-1.6, 1.8, -1.2], 32]]} />
      <Character pose={pose} face={face} look={CHEFE} />
      <IdeaBulb t={t} at={e} position={[-1.6, 3.05, -1.2]} scale={0.8} />
      <Comic t={t} at={e} text="?!" position={[-0.9, 2.7, -1.0]} size={0.32} hold={0.9} />
    </>
  );
};

// 04. "cria um cargo em que sua única tarefa é *não* fazer *nada*." — a mesa vazia e a placa.
const S04 = ({ t, t0, t1 }: ShotProps) => {
  const n = W(2, 'nao');
  const na = W(2, 'nada');
  const hpose = track(t, P({ x: -0.45, z: 0.35, ry: -0.45, hy: -0.2 }), [
    { at: W(2, 'cargo'), v: { lsz: 1.3, lel: 0.2, lsx: 0.4, hy: -0.5 } },
    { at: na, v: { lsz: 1.5, rsz: 1.5, lel: 0.2, rel: 0.2, lsx: 0, hy: 0, hp: -0.1 } },
  ]);
  return (
    <>
      <Office t={t} />
      <Colegas t={t} />
      <MesaVoce t={t} placa={false} />
      <DeskPlate text="CARGO: NÃO FAZER NADA" position={[MESA_VOCE[0] + 0.1, DESK_H + 0.03, MESA_VOCE[2] + 0.15]} scale={0.8 * pop(t, n)} />
      <Sparkles t={t} from={na} n={8} radius={0.5} center={[MESA_VOCE[0] + 0.1, DESK_H + 0.3, MESA_VOCE[2] + 0.2]} size={0.12} />
      <Puff t={t} at={n} position={[MESA_VOCE[0] + 0.1, DESK_H + 0.1, MESA_VOCE[2] + 0.2]} color="#fff2c0" size={0.15} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.9, 1.85, 5.6], [-0.95, 1.2, 0.7], 32], [t1, [-0.95, 1.8, 5.1], [-0.95, 1.15, 0.7], 32]]} />
      <Character pose={hpose} face={faceAt(t, [{ at: t0, f: 'smile' }, { at: na, f: 'smug' }], 5)} look={CHEFE} />
    </>
  );
};

// 05. "Você chega ao *escritório*, senta à mesa e *espera*." — entra, senta, espera.
const S05 = ({ t, t0, t1 }: ShotProps) => {
  const sen = W(3, 'senta');
  const esp = W(3, 'espera');
  const w = walkAlong(t, t0, sen - 0.15, [-3.8, 0, -0.7], [MESA_VOCE[0], 0, MESA_VOCE[2] - 0.55]);
  const sitK = seg(t, sen - 0.2, sen + 0.15);
  const ry = lerp(1.1, 0, seg(t, sen - 0.45, sen - 0.1));
  const walkPose = P({ x: w.p[0], z: w.p[2], ry, walk: w.walk, stride: w.stride });
  const sitPose = VOCE_SENTADO({ lsx: 0.4, rsx: 0.4 });
  const pose = sitK <= 0 ? walkPose : { ...sitPose, y: lerp(0, SENTADO, sitK), lsx: lerp(0, 0.6, sitK), rsx: lerp(0, 0.6, sitK) };
  const espPose = track(t, pose, [{ at: esp, v: { lsx: 0.9, rsx: 0.9, lel: -1.4, rel: -1.4, hp: 0.1 } }]);
  const face = faceAt(t, [{ at: t0, f: 'happy' }, { at: W(3, 'escritorio'), f: 'bigSmile' }, { at: esp, f: 'neutral' }], 6);
  return (
    <>
      <Office t={t} />
      <Colegas t={t} digitando />
      <MesaVoce t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [espPose.x + 0.3, 1.85, espPose.z + 4.2], [espPose.x, 1.1, espPose.z + 0.3], 32]]} />
      <Character pose={espPose} face={face} />
    </>
  );
};

// 06. "Não recebe *serviço*," — bandeja do colega enche, a sua fica vazia.
const S06 = ({ t, t0, t1 }: ShotProps) => {
  const s = W(4, 'servico');
  const pose = VOCE_SENTADO({ hy: 0.6, hp: 0.35 });
  const trayV: V3 = [MESA_VOCE[0] + 0.45, DESK_H + 0.03, MESA_VOCE[2] + 0.05];
  return (
    <>
      <Office t={t} />
      <Colegas t={t} digitando />
      <MesaVoce t={t} extra={<InTray t={t} position={trayV} label="ENTRADA" />} />
      <InTray t={t} a={t0} b={s} n={12} position={[MESA_COLEGA[0] - 0.45, DESK_H + 0.03, MESA_COLEGA[2] + 0.1]} label="ENTRADA" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.9, 2.1, 4.6], [-1.35, 1.05, 0.5], 32], [t1, [-1.85, 2.0, 4.2], [-1.35, 1.05, 0.5], 32]]} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: s, f: 'confused' }], 7)} />
      <Puff t={t} at={s} position={[trayV[0], trayV[1] + 0.08, trayV[2]]} color="#d8d0c0" size={0.12} />
    </>
  );
};

// 07. "não participa das *decisões*" — reunião sem Você.
const S07 = ({ t, t0, t1 }: ShotProps) => {
  const d = W(4, 'decisoes');
  const mesa: V3 = [2.6, 0, -2.6];
  const pessoas: [typeof PAULA, V3, number][] = [
    [CHEFE, [2.6, 0, -3.4], 0],
    [PAULA, [1.8, 0, -2.4], 1.2],
    [KAIO, [3.4, 0, -2.4], -1.2],
  ];
  return (
    <>
      <Office t={t} />
      <mesh position={[mesa[0], 0.72, mesa[2]]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.06, 32]} />
        <meshStandardMaterial color="#c79a64" />
      </mesh>
      <mesh position={[mesa[0], 0.36, mesa[2]]}>
        <cylinderGeometry args={[0.08, 0.2, 0.72, 12]} />
        <meshStandardMaterial color="#8a6a44" />
      </mesh>
      <group position={[2.6, 2.3, -4.15]}>
        <mesh>
          <boxGeometry args={[1.8, 1.1, 0.05]} />
          <meshStandardMaterial color="#fbfbf8" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.7, 1.0]} />
          <meshStandardMaterial map={undefined} color="#ffffff" />
        </mesh>
        {[0.25, 0.45, 0.35, 0.6].map((h, i) => (
          <mesh key={i} position={[-0.5 + i * 0.32, -0.4 + h / 2 + seg(t, d - 0.5, d) * 0.0, 0.04]}>
            <boxGeometry args={[0.2, h * (0.4 + 0.6 * seg(t, t0, d - 0.05)), 0.01]} />
            <meshStandardMaterial color={['#3ab54a', '#2f6fb3', '#f2b53a', '#e0262e'][i]} />
          </mesh>
        ))}
      </group>
      {pessoas.map(([look, p, ry], i) => (
        <Character key={i} pose={track(t, P({ x: p[0], z: p[2], ry, hy: 0 }), [{ at: d, v: i === 0 ? { rsx: 1.4, rel: -0.2 } : { hp: 0.15, hy: 0.2 } }])} face={faceAt(t, [{ at: 0, f: i === 0 ? 'confident' : 'thinking' }, { at: d, f: i === 0 ? 'smug' : 'happy' }], 40 + i)} look={look} />
      ))}
      <MesaVoce t={t} />
      <Character pose={VOCE_SENTADO({ ry: 0.9, hy: 0.4, hp: -0.05 })} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: d, f: 'worried' }], 8)} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-3.2, 2.6, 3.8], [1.2, 1.0, -2.0], 32], [t1, [-3.0, 2.5, 3.5], [1.2, 1.05, -2.0], 32]]} />
      <Comic t={t} at={d} text="BLÁ BLÁ" position={[2.6, 2.9, -2.8]} size={0.3} hold={0.8} />
    </>
  );
};

// 08. "e ninguém parece precisar da sua *ajuda*." — mão levantada, ninguém olha.
const S08 = ({ t, t0, t1 }: ShotProps) => {
  const a = W(5, 'ajuda');
  const pose = track(t, VOCE_SENTADO(), [
    { at: W(5, 'ninguem'), v: { rsx: 2.9, rel: 0, rsz: 0.3, hy: 0.3 } },
    { at: a, v: { rsx: 0.6, rel: -0.9, rsz: 0.12, hy: 0, hp: 0.3 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'happy' }, { at: W(5, 'ninguem'), f: 'curious' }, { at: a, f: 'tired' }], 9);
  const w = walkAlong(t, t0 - 0.2, t1, [-3.8, 0, -1.55], [0.6, 0, -1.55]);
  return (
    <>
      <Office t={t} />
      <Colegas t={t} digitando sem={['paula']} />
      <MesaVoce t={t} />
      <Character pose={P({ x: w.p[0], z: w.p[2], ry: Math.PI / 2, walk: w.walk, stride: w.stride, lsx: 0.9, lel: -1.6, hy: 0.4 })} face={faceAt(t, [{ at: 0, f: 'neutral' }], 50)} look={PAULA} left={<Paper text="RELATÓRIO" scale={0.25} position={[0, -0.05, 0.05]} rotation={[-1.4, 0, 0]} />} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.7, 1.7, 4.4], [-1.3, 1.25, 0.6], 32], [t1, [-1.0, 1.65, 3.9], [-1.4, 1.25, 0.6], 32]]} />
      <Character pose={pose} face={face} />
    </>
  );
};

// 09. "O *relógio* continua andando… tic-tac, tic-tac…" — close no relógio.
const S09 = ({ t, t0, t1 }: ShotProps) => {
  const r = W(6, 'relogio');
  const tics = [W(6, 4), W(6, 4) + 0.35, W(6, 5), W(6, 5) + 0.35];
  return (
    <>
      <Office t={t} />
      <WallClock t={t} position={[-1.4, 3.0, -4.12]} scale={0.8} balanca={tics} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.2, 2.6, -1.0], [-1.4, 2.95, -4.1], 32], [r, [-1.3, 2.85, -2.2], [-1.4, 3.0, -4.1], 32], [t1, [-1.35, 2.95, -2.6], [-1.4, 3.0, -4.1], 32]]} />
      {tics.map((at, i) => (
        <Comic key={i} t={t} at={at} text={i % 2 ? 'TAC!' : 'TIC!'} position={[i % 2 ? -0.95 : -1.85, 3.55 - (i % 2) * 0.1, -3.9]} size={0.22} hold={0.3} />
      ))}
    </>
  );
};

// 10. "e o dia *não* passa." — Você entediado, cabeça apoiada na mão.
const S10 = ({ t, t0, t1 }: ShotProps) => {
  const n = W(6, 'nao');
  const pose = track(t, VOCE_SENTADO({ rsx: 1.2, rel: -2.3, hr: 0.25, hp: 0.1 }), [{ at: n, v: { hr: 0.4, hp: 0.15, squash: 0.08 } }]);
  return (
    <>
      <Office t={t} />
      <Colegas t={t} digitando />
      <MesaVoce t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.0, 1.55, 3.0], [-1.5, 1.2, 0.5], 32], [t1, [-1.15, 1.5, 2.6], [-1.5, 1.2, 0.5], 32]]} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'bored' }, { at: n, f: 'tired' }], 10)} />
    </>
  );
};

// 11. "No começo, talvez você até ache que conseguiu o emprego *perfeito*." — recostado, feliz.
const S11 = ({ t, t0, t1 }: ShotProps) => {
  const p = W(7, 'perfeito');
  const pose = track(t, VOCE_SENTADO(), [
    { at: W(7, 'talvez'), v: { lsx: 2.6, rsx: 2.6, lel: -2.4, rel: -2.4, lsz: 0.6, rsz: 0.6, lean: -0.15, hp: -0.1 } },
    { at: p, v: { hp: -0.2, hr: 0.1 } },
  ]);
  return (
    <>
      <Office t={t} />
      <Colegas t={t} digitando />
      <MesaVoce t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.6, 1.7, 3.9], [-1.4, 1.25, 0.6], 32], [t1, [-0.9, 1.65, 3.3], [-1.45, 1.3, 0.6], 32]]} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'content' }, { at: W(7, 'talvez'), f: 'closedSmile' }, { at: p, f: 'starstruck', o: ['sparkle', 'blush'] }], 11)} />
      <Comic t={t} at={p} text="PERFEITO!" position={[-1.4, 2.45, 0.6]} size={0.38} hold={0.9} />
      <Sparkles t={t} from={p} n={9} radius={0.65} center={[-1.5, 1.45, 0.5]} />
    </>
  );
};

// 12/13. Calendário de mesa virando folhas (dias → meses → anos).
const CAL: V3 = [MESA_VOCE[0] - 0.62, DESK_H + 0.27, MESA_VOCE[2] + 0.28];
const S12 = ({ t, t0, t1 }: ShotProps) => {
  const m = W(8, 'meses');
  return (
    <>
      <Office t={t} noite={Math.floor(t * 3) % 2} />
      <MesaVoce t={t} />
      <Character pose={VOCE_SENTADO({ rsx: 1.2, rel: -2.3, hr: 0.25 })} face={faceAt(t, [{ at: t0, f: 'bored' }], 12)} />
      <Calendar t={t} from={t0 + 0.1} at={m} pages={['SEG', 'TER', 'QUA', 'QUI', 'SEX', '1 MÊS', '2 MESES', '4 MESES', '6 MESES']} position={CAL} rotation={[-0.1, 0.55, 0]} scale={0.45} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.7, 1.55, 3.5], [-1.9, 1.1, 0.8], 32], [t1, [-1.75, 1.5, 3.2], [-1.95, 1.1, 0.85], 32]]} />
      <Sparkles t={t} from={m} n={6} radius={0.35} center={[CAL[0], CAL[1] + 0.1, CAL[2] + 0.1]} size={0.08} />
    </>
  );
};
const S13 = ({ t, t0, t1 }: ShotProps) => {
  const a = W(9, 'anos');
  return (
    <>
      <Office t={t} noite={Math.floor(t * 5) % 2} />
      <Colegas t={t} digitando />
      <MesaVoce t={t} />
      <Character pose={VOCE_SENTADO({ rsx: 1.2, rel: -2.3, hr: 0.35, hp: 0.15 })} face={faceAt(t, [{ at: t0, f: 'tired' }, { at: a, f: 'sleepy' }], 13)} />
      <Calendar t={t} from={t0 + 0.05} at={a} pages={['6 MESES', '9 MESES', '1 ANO', '2 ANOS', '3 ANOS']} position={CAL} rotation={[-0.1, 0.55, 0]} scale={0.45} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.7, 1.6, 3.4], [-1.9, 1.1, 0.8], 32], [t1, [-1.7, 1.75, 4.2], [-1.85, 1.15, 0.7], 32]]} />
    </>
  );
};

// 14. "Enquanto os outros *trabalham*, você continua no mesmo *lugar*, sem uma tarefa de verdade." — teia de aranha.
const S14 = ({ t, t0, t1 }: ShotProps) => {
  const tr = W(10, 'trabalham');
  const l = W(10, 'lugar');
  return (
    <>
      <Office t={t} />
      <Colegas t={t} digitando />
      <PaperRain t={t} from={tr - 0.3} n={18} area={2.4} top={3.2} title="TAREFA" footer="URGENTE" position={[1.9, 0, -1.4]} />
      <MesaVoce t={t} />
      <Character pose={VOCE_SENTADO({ hp: 0.05 })} face={faceAt(t, [{ at: t0, f: 'deadpan' }, { at: l, f: 'bored' }], 14)} />
      <Cobweb t={t} at={l} position={[MESA_VOCE[0] - 0.74, DESK_H + 0.36, MESA_VOCE[2] - 0.38]} rotation={[0, Math.PI / 4, 0]} size={0.75} />
      <Cobweb t={t} at={l + 0.25} position={[MESA_VOCE[0] + 0.74, DESK_H + 0.34, MESA_VOCE[2] + 0.38]} rotation={[0, Math.PI + Math.PI / 4, Math.PI]} size={0.6} />
      <Puff t={t} at={l} position={[MESA_VOCE[0], DESK_H + 0.1, MESA_VOCE[2]]} color="#cfc8b8" size={0.2} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 2.3, 5.0], [0.4, 1.0, -0.6], 32], [l, [-0.8, 1.8, 3.8], [-1.3, 1.05, 0.6], 32], [t1, [-1.0, 1.7, 3.3], [-1.4, 1.05, 0.6], 32]]} />
    </>
  );
};

// 15. "Quando percebe, já está há *oito* anos sem fazer nada." — contador 8 ANOS.
const S15 = ({ t, t0, t1 }: ShotProps) => {
  const o = W(11, 'oito');
  const pose = track(t, VOCE_SENTADO({ hp: 0.05 }), [{ at: o, v: { lsz: 1.4, rsz: 1.4, lel: 0.2, rel: 0.2, lsx: 0.2, rsx: 0.2, hp: -0.2, squash: 0.05 } }]);
  return (
    <>
      <Office t={t} />
      <MesaVoce t={t} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: o, f: 'shocked', o: ['sweat'] }], 15)} />
      <LedCounter t={t} from={W(11, 'ja')} at={o} value={8} suffix=" ANOS" position={[MESA_VOCE[0], 2.45, MESA_VOCE[2] - 0.6]} scale={0.45} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.2, 1.9, 4.2], [-1.5, 1.7, 0.4], 32], [t1, [-1.3, 1.85, 3.6], [-1.5, 1.75, 0.4], 32]]} />
    </>
  );
};

// 16. "E então você entende que ficar sem trabalhar também pode *pesar*." — o peso cai.
const S16 = ({ t, t0, t1 }: ShotProps) => {
  const p = W(12, 'pesar');
  const y = DESK_H + 0.03 + Math.max(0, 3.2 * (1 - seg(t, p - 0.25, p, (x) => x * x))) + (t > p ? Math.abs(Math.sin((t - p) * 16)) * 0.06 * Math.exp(-(t - p) * 7) : 0);
  const pose = track(t, VOCE_SENTADO({ hp: 0.05 }), [{ at: p, v: { squash: 0.25, hp: 0.3, lsx: 0.3, rsx: 0.3 }, lead: 0, dur: 3 }]);
  return (
    <>
      <Office t={t} />
      <Colegas t={t} />
      <MesaVoce t={t} placa={false} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'thinking' }, { at: W(12, 'trabalhar'), f: 'worried' }, { at: p, f: 'tired', o: ['shading'] }], 16)} />
      {t > p - 0.3 && <Weight position={[MESA_VOCE[0] - 0.1, y, MESA_VOCE[2] + 0.05]} scale={0.9} />}
      <Puff t={t} at={p} position={[MESA_VOCE[0], DESK_H + 0.08, MESA_VOCE[2] + 0.2]} color="#d8d0c0" size={0.3} />
      <Comic t={t} at={p} text="TUM!" position={[-0.55, 2.2, 1.1]} size={0.32} hold={0.6} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.6, 2.0, 5.0], [-1.4, 1.3, 0.6], 32], [t1, [-0.8, 1.9, 4.5], [-1.45, 1.25, 0.6], 32]]} />
    </>
  );
};

// 17. "Você se sente *inútil*," — medidor de utilidade cai a zero.
const S17 = ({ t, t0, t1 }: ShotProps) => {
  const i = W(13, 'inutil');
  return (
    <>
      <Office t={t} escuro={0.3} />
      <MesaVoce t={t} />
      <Character pose={VOCE_SENTADO({ hp: 0.25, squash: 0.1 })} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: i, f: 'worried', o: ['tears'] }], 17)} />
      <Meter t={t} from={t0} at={i} label="UTILIDADE" position={[MESA_VOCE[0], 2.4, MESA_VOCE[2] - 0.5]} scale={0.7} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.1, 1.8, 3.6], [-1.5, 1.65, 0.4], 32], [t1, [-1.2, 1.75, 3.2], [-1.5, 1.65, 0.4], 32]]} />
    </>
  );
};

// 18. "*isolado* e *preso* naquele escritório." — mesas se afastam, grades descem.
const S18 = ({ t, t0, t1 }: ShotProps) => {
  const is = W(13, 'isolado');
  const pr = W(13, 'preso');
  const af = seg(t, is - 0.3, is + 0.4);
  const ck = seg(t, pr - 0.3, pr - 0.02, (x) => x * x);
  return (
    <>
      <Office t={t} escuro={0.3 + 0.6 * af} />
      <Colegas t={t} digitando afasta={af} />
      <MesaVoce t={t} />
      <pointLight position={[MESA_VOCE[0], 2.6, MESA_VOCE[2] + 0.8]} color="#fff2d0" intensity={8 * af} distance={4} decay={1.5} />
      <Character pose={track(t, VOCE_SENTADO({ hp: 0.2 }), [{ at: is, v: { hy: 0.6, hp: 0 } }, { at: pr, v: { hy: 0, hp: -0.1, lsx: 1.2, rsx: 1.2, lel: -0.3, rel: -0.3 } }])} face={faceAt(t, [{ at: t0, f: 'tired' }, { at: is, f: 'worried' }, { at: pr, f: 'scared', o: ['tears'] }], 18)} />
      <Cage k={ck} position={[MESA_VOCE[0], 0, MESA_VOCE[2] - 0.35]} />
      {t > pr - 0.05 && <Puff t={t} at={pr} position={[MESA_VOCE[0], 0.1, MESA_VOCE[2] + 0.6]} color="#c8c0b0" size={0.25} />}
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.9, 2.0, 4.0], [-1.4, 1.1, 0.4], 32], [pr, [-0.6, 2.3, 5.4], [-1.4, 1.2, 0.4], 32], [t1, [-0.5, 2.4, 5.8], [-1.4, 1.2, 0.4], 32]]} />
    </>
  );
};

// 19. "Até que, um dia, coloca um pedido de *demissão* sobre a mesa." — carta na mesa do chefe.
const S19 = ({ t, t0, t1 }: ShotProps) => {
  const d = W(14, 'demissao');
  const ponto: V3 = [MESA_CHEFE[0] + 0.25, DESK_H + 0.035, MESA_CHEFE[2] + 0.2];
  const vp = track(t, P({ x: MESA_CHEFE[0] + 0.35, z: MESA_CHEFE[2] + 1.05, ry: Math.PI - 0.35, rsx: 0.6, rel: -0.9 }), [
    { at: W(14, 'coloca'), v: { rsx: 1.3, rel: -0.6, lean: 0.12 } },
    { at: d, v: { rsx: 1.0, rel: -0.2, lean: 0.25, hp: 0.15 }, lead: 0, dur: 4 },
  ]);
  const hand = seg(t, W(14, 'coloca') - 0.2, d - 0.03);
  const lp: V3 = [lerp(ponto[0] + 0.25, ponto[0], hand), lerp(1.05, ponto[1], hand), lerp(ponto[2] + 0.55, ponto[2], hand)];
  return (
    <>
      <Office t={t} />
      <Desk t={t} position={MESA_CHEFE} papeis={0.3} tela="#ffd98a" />
      <Character pose={sentadoEm(MESA_CHEFE, { hy: 0.1 })} face={faceAt(t, [{ at: t0, f: 'smug' }, { at: d, f: 'shocked', o: ['sweat'] }], 19)} look={CHEFE} />
      <Character pose={vp} face={faceAt(t, [{ at: t0, f: 'neutral' }, { at: d, f: 'confident' }], 20)} />
      <Letter position={lp} rotation={[0, Math.PI / 2 + 0.3, 0]} scale={1.3} />
      <Comic t={t} at={d} text="TUM!" position={[MESA_CHEFE[0] - 0.4, 2.2, MESA_CHEFE[2] + 0.4]} size={0.3} hold={0.6} />
      <Puff t={t} at={d} position={[ponto[0], ponto[1] + 0.05, ponto[2]]} color="#fff" size={0.14} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [3.8, 2.0, -2.0], [-1.45, 1.2, -2.15], 32], [t1, [3.5, 1.95, -2.05], [-1.45, 1.2, -2.15], 32]]} />
    </>
  );
};

// 20. "Porque receber para não fazer nada pode parecer um *sonho*…" — nuvem de sonho.
const S20 = ({ t, t0, t1 }: ShotProps) => {
  const s = W(15, 'sonho');
  const k = seg(t, t0 + 0.4, s - 0.03, (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2));
  return (
    <>
      <Stage color="#3a3460" pedestal={false} />
      <Character pose={P({ ry: 0.2, hp: -0.15, lsx: 2.6, rsx: 2.6, lel: -2.4, rel: -2.4, lsz: 0.6, rsz: 0.6 })} face={faceAt(t, [{ at: t0, f: 'content' }, { at: s, f: 'closedSmile', o: ['blush'] }], 21)} />
      <DreamCloud t={t} k={k} position={[0.5, 2.75, 0]} scale={1} />
      <Sparkles t={t} from={s} n={10} radius={0.9} center={[0.5, 2.8, 0]} size={0.14} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 1.9, 4.6], [0.2, 1.9, 0], 32], [t1, [0.3, 1.95, 4.1], [0.25, 2.0, 0], 32]]} />
    </>
  );
};

// 21. "até você perceber que passou anos sem saber para que está *ali*." — nuvem estoura; mesa vazia (loop).
const S21 = ({ t, t0, t1 }: ShotProps) => {
  const pe = W(16, 'perceber');
  const ali = W(16, 'ali');
  const w = walkAlong(t, pe + 0.3, t1 + 0.4, [MESA_VOCE[0] + 0.9, 0, MESA_VOCE[2] + 0.9], [MESA_VOCE[0] + 3.4, 0, MESA_VOCE[2] + 2.6]);
  const ry = lerp(-2.3, 0.9, seg(t, pe + 0.1, pe + 0.4));
  const hy = track(t, { hy: -0.9 } as Record<string, number>, [{ at: ali, v: { hy: -1.4 } }]).hy;
  return (
    <>
      <Office t={t} />
      <Colegas t={t} digitando />
      <MesaVoce t={t} />
      <Character pose={P({ x: w.p[0], z: w.p[2], ry, hy, walk: w.walk, stride: w.stride })} face={faceAt(t, [{ at: t0, f: 'lookDown' }, { at: pe, f: 'thinking' }, { at: ali, f: 'content' }], 22)} />
      <Sparkles t={t} from={ali} n={6} radius={0.5} center={[MESA_VOCE[0], DESK_H + 0.4, MESA_VOCE[2]]} size={0.1} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [w.p[0] - 0.2, 1.9, w.p[2] + 4.6], [w.p[0] - 0.4, 1.15, w.p[2] - 0.2], 32]]} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: '01 japao', C: S01 },
  { from: W(0, 'pode'), name: '02 demitir', C: S02 },
  { from: W(1, 0), name: '03 estranha', C: S03 },
  { from: W(2, 0), name: '04 nada', C: S04 },
  { from: W(3, 0), name: '05 escritorio', C: S05 },
  { from: W(4, 0), name: '06 servico', C: S06 },
  { from: W(4, 3), name: '07 decisoes', C: S07 },
  { from: W(5, 0), name: '08 ajuda', C: S08 },
  { from: W(6, 0), name: '09 relogio', C: S09 },
  { from: W(6, 6), name: '10 nao passa', C: S10 },
  { from: W(7, 0), name: '11 perfeito', C: S11 },
  { from: W(8, 0), name: '12 meses', C: S12 },
  { from: W(9, 0), name: '13 anos', C: S13 },
  { from: W(10, 0), name: '14 lugar', C: S14 },
  { from: W(11, 0), name: '15 oito', C: S15 },
  { from: W(12, 0), name: '16 pesar', C: S16 },
  { from: W(13, 0), name: '17 inutil', C: S17 },
  { from: W(13, 'isolado'), name: '18 preso', C: S18 },
  { from: W(14, 0), name: '19 demissao', C: S19 },
  { from: W(15, 0), name: '20 sonho', C: S20 },
  { from: W(16, 0), name: '21 ali', C: S21 },
];
