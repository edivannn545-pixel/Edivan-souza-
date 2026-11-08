import { JSX } from 'react';
import { clamp01, easeInOut, lerp, seg, track, V3 } from './anim';
import { Character, faceAt, Pose, REST, VOCE } from './Character';
import {
  ATENDENTE, Bucket, Chocolate, FIGURANTES, GamblingTable, IdeaBulb, JANELA, MiniBuilding, NeonSign, NeonStreet, NoSign,
  PachinkoFront, PachinkoHall, PachinkoMachine, Paper, POLICIA, pop, PrizeCounter, RecordBoard, Shampoo, Ursinho, WindowShop,
} from './historia';
import { Clipboard, Coin, CoinBurst, Comic, MoneyStack, Puff, Sign, Sparkles, StampMark } from './props';
import { Cam, Stage } from './sets';
import { F, W } from './timeline';

// ============================================================================
// "O TRUQUE DO PACHINKO" — tomadas do STORYBOARD.md, tudo ancorado em palavras com W(linha, 'palavra').
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element };

// Efeitos sonoros: arquivos em public/sfx/.
export const SFX: { at: number; file: string; vol: number }[] = [];

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });
// Caminhada: posição ao longo de um trecho entre a e b (segundos), com passos coerentes com a distância.
const walkAlong = (t: number, a: number, b: number, from: V3, to: V3) => {
  const k = clamp01((t - a) / (b - a));
  const kk = easeInOut(k) * 0.25 + k * 0.75;
  const p: V3 = [lerp(from[0], to[0], kk), from[1], lerp(from[2], to[2], kk)];
  const dist = Math.hypot(p[0] - from[0], p[2] - from[2]);
  const moving = t > a && t < b;
  return { p, walk: dist / 0.24, stride: moving ? Math.min(1, (t - a) / 0.15, (b - t) / 0.15) : 0 };
};

// Os figurantes jogando nas máquinas do salão (índices de máquina e quem está em cada uma).
const JOGADORES: { idx: number; look: number }[] = [
  { idx: 1, look: 0 },
  { idx: 3, look: 2 },
  { idx: 18, look: 1 },
  { idx: 21, look: 3 },
  { idx: 8, look: 1 },
  { idx: 25, look: 0 },
];
const Jogadores = ({ t }: { t: number }) => (
  <>
    {JOGADORES.map(({ idx, look }, n) => {
      const sd = idx >= 16 ? 1 : -1;
      const z = 1.5 - (idx % 16);
      const arm = 0.9 + 0.08 * Math.sin(t * 2.2 + n);
      const pose = P({ x: sd * 2.15, z, ry: sd * Math.PI / 2, rsx: arm, rel: -0.4, hp: 0.05 });
      return <Character key={idx} pose={pose} face={faceAt(t, [{ at: 0, f: n % 2 ? 'happy' : 'curious' }], n + 10)} look={FIGURANTES[look]} />;
    })}
  </>
);
const HALL_LIVRES = [...JOGADORES.map((j) => j.idx), 5];

// 01. "No *Japão*, você ouve dizer que" — rua de neon, letreiro JAPÃO acende.
const S01 = ({ t, t0, t1 }: ShotProps) => {
  const jp = W(0, 'japao');
  const pose = track(t, P({ ry: 0.15, hy: 0.25, hp: -0.15 }), [
    { at: jp, v: { hy: -0.05, hp: -0.35, lsz: 0.5, rsz: 0.5, lel: 0.4, rel: 0.4 } },
    { at: W(0, 'ouve'), v: { hy: 0.35, hp: 0, hr: 0.18, lsz: 0.12, rsz: 0.12, rsx: 0.9, rel: -1.9 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: jp, f: 'amazed' }, { at: W(0, 'ouve'), f: 'thinking' }], 1);
  return (
    <>
      <NeonStreet t={t} placa="JAPÃO" placaOn={jp} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 5.2, 9.5], [0, 3.2, -4], 30], [jp, [0.3, 2.2, 6.2], [0, 2.4, -1], 32], [t1, [0.5, 1.75, 4.6], [0, 1.6, 0], 32]]} />
      <Character pose={pose} face={face} />
    </>
  );
};

// 02. "jogos de azar são *proibidos*." — mesa de dados e cartas, carimbo PROIBIDO.
const S02 = ({ t, t0, t1 }: ShotProps) => {
  const pr = W(0, 'proibidos');
  const pose = track(t, P({ x: -0.75, ry: 0.5, hy: 0.4 }), [
    { at: W(0, 'jogos'), v: { lsz: 1.3, lel: -0.2, lsx: 0.4 } },
    { at: pr, v: { lsz: 0.2, lsx: 0, rsx: 0.5, rel: -2.2, squash: 0.15, hy: 0.2, hp: 0.1 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: pr, f: 'shocked', o: ['sweat'] }], 2);
  const s = pop(t, pr);
  return (
    <>
      <Stage color="#3a1f45" pedestal={false} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.6, 2.2, 5.6], [0.15, 1.3, 0], 32], [t1, [0.3, 2.0, 4.7], [0.15, 1.35, 0], 32]]} />
      <GamblingTable position={[0.55, 0, 0]} />
      <Sign text={'JOGOS\nDE AZAR'} w={1.3} h={0.7} position={[0.55, 2.25, -0.5]} bg="#2b1d3f" fg="#ffd23a" />
      <StampMark text="PROIBIDO" w={1.7} position={[0.55, 2.25, -0.42]} rotation={[0, 0, 0.22]} scale={s} />
      <Puff t={t} at={pr} position={[0.55, 2.2, -0.3]} color="#ffb0b0" />
      <Character pose={pose} face={face} />
    </>
  );
};

// 03. "Mesmo assim, ao caminhar por uma rua iluminada por letreiros de *neon*," — travelling na rua.
const S03 = ({ t, t0, t1 }: ShotProps) => {
  const ne = W(1, 'neon');
  const w = walkAlong(t, t0, t1 + 0.3, [0, 0, -9], [0, 0, -9 + (t1 + 0.3 - t0) * 1.15]);
  const pose = { ...track(t, P({ hy: 0 }), [{ at: ne, v: { hy: 0.5, hp: -0.3 } }]), x: w.p[0], z: w.p[2], walk: w.walk, stride: w.stride };
  const face = faceAt(t, [{ at: t0, f: 'content' }, { at: W(1, 'iluminada'), f: 'curious' }, { at: ne, f: 'starstruck', o: ['sparkle'] }], 3);
  const z = w.p[2];
  return (
    <>
      <NeonStreet t={t} acende={W(1, 'letreiros')} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [1.5, 1.9, z + 4.6], [0, 1.5, z - 0.4], 32]]} />
      <Character pose={pose} face={face} />
    </>
  );
};

// 04. "você encontra uma casa de *pachinko* aberta dia e noite."
const S04 = ({ t, t0, t1 }: ShotProps) => {
  const pa = W(2, 'pachinko');
  const pose = track(t, P({ x: -0.5, z: 0.6, ry: 0.35 }), [
    { at: pa, v: { hy: 0.7, hp: -0.4, lsz: 1.1, rsz: 1.1, lel: 0.5, rel: 0.5 } },
    { at: W(2, 'dia'), v: { lsz: 0.2, rsz: 0.2, rsx: 1.6, rel: -0.2, hy: 0.4 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: pa, f: 'amazed' }, { at: W(2, 'dia'), f: 'starstruck', o: ['sparkle'] }], 4);
  return (
    <>
      <PachinkoFront t={t} on={pa} h24={W(2, 'dia')} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 1.8, 4.6], [-0.3, 1.7, 0], 32], [pa, [0.6, 2.4, 7.6], [0, 3.2, -2.5], 32], [t1, [0.7, 2.6, 8.6], [0, 3.4, -3], 32]]} />
      <Character pose={pose} face={face} />
    </>
  );
};

// 05. "Curioso, você *entra*." — caminha até a porta iluminada.
const S05 = ({ t, t0, t1 }: ShotProps) => {
  const w = walkAlong(t, t0 + 0.15, t1 + 0.2, [-0.5, 0, 0.6], [0, 0, -2.9]);
  const ry = lerp(0.35, Math.PI, seg(t, t0, t0 + 0.25));
  const pose = P({ x: w.p[0], z: w.p[2], ry, walk: w.walk, stride: w.stride });
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: W(3, 'entra'), f: 'bigSmile' }], 5);
  return (
    <>
      <PachinkoFront t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.4, 2.0, 4.8], [0, 1.6, -0.5], 32], [t1, [0.5, 2.0, 2.4], [0, 1.6, -3.2], 32]]} />
      <Character pose={pose} face={face} />
    </>
  );
};

// 06. "Lá dentro, vê fileiras de *máquinas*," — corredor do salão.
const S06 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <PachinkoHall t={t} semBanco={HALL_LIVRES} />
    <Jogadores t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 2.6, 4.5], [0, 1.2, -8], 34], [W(4, 'maquinas'), [0.6, 1.9, 2.0], [-0.6, 1.2, -6], 32], [t1, [0.8, 1.7, 0.6], [-1.0, 1.2, -6], 32]]} />
  </>
);

// 07. "luzes piscando e bolinhas caindo sem parar." — close na máquina.
const S07 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <PachinkoHall t={t} semBanco={HALL_LIVRES} />
    <Jogadores t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.9, 1.5, -0.6], [-2.9, 1.35, -1.5], 32], [W(4, 'bolinhas'), [-1.4, 1.4, -1.3], [-2.9, 1.3, -1.5], 32], [t1, [-1.6, 1.35, -1.45], [-2.9, 1.3, -1.5], 32]]} />
  </>
);

// 08. "Você começa a jogar e, quando *ganha*," — Você na máquina 5 (x -2.9, z -3.5).
const S08 = ({ t, t0, t1 }: ShotProps) => {
  const g = W(5, 'ganha');
  const pose = track(t, P({ x: -2.05, z: -3.5, ry: -0.75, hy: -0.6, rsx: 0.9, rel: -0.5 }), [
    { at: W(5, 'jogar'), v: { rsx: 1.1, rel: -0.8, hp: 0.1 } },
    { at: g, v: { rsx: 0.3, rel: 0.3, lsz: 2.4, rsz: 2.4, lel: 0.3, hy: 0.1, hp: -0.15, squash: 0.1 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'thinking' }, { at: W(5, 'jogar'), f: 'grin' }, { at: g, f: 'starstruck', o: ['sparkle', 'blush'] }], 6);
  return (
    <>
      <PachinkoHall t={t} win={g} winIndex={5} semBanco={HALL_LIVRES} />
      <Jogadores t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.9, 2.0, 0.4], [-2.2, 1.35, -3.6], 32], [t1, [0.7, 1.9, 0.0], [-2.2, 1.4, -3.6], 32]]} />
      <Character pose={pose} face={face} />
      <Comic t={t} at={g} text="GANHOU!" position={[-2.4, 2.65, -3.3]} size={0.42} hold={1.2} />
      <Sparkles t={t} from={g} n={10} radius={0.7} center={[-2.6, 1.8, -3.4]} />
    </>
  );
};

// 09. "recebe um *balde* cheio delas." — o balde cai nas mãos.
const S09 = ({ t, t0, t1 }: ShotProps) => {
  const b = W(5, 'balde');
  const pose = track(t, P({ z: -3.2, hy: 0.1, hp: -0.2, lsx: 0.6, rsx: 0.6, lel: -0.6, rel: -0.6 }), [
    { at: b, v: { lsx: 0.95, rsx: 0.95, lel: -0.9, rel: -0.9, lsz: 0.35, rsz: 0.35, hp: 0.15 }, lead: 0 },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'happy' }, { at: b, f: 'bigSmile', o: ['blush'] }], 7);
  const y = Math.max(0.94, 2.6 - 9 * Math.max(0, t - (b - 0.25)) ** 2 * 2) + (t > b ? Math.abs(Math.sin((t - b) * 14)) * 0.05 * Math.exp(-(t - b) * 6) : 0);
  return (
    <>
      <PachinkoHall t={t} semBanco={HALL_LIVRES} />
      <Jogadores t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 1.6, 0.3], [0, 1.35, -3.2], 32], [t1, [0.15, 1.55, -0.2], [0, 1.3, -3.2], 32]]} />
      <Character pose={pose} face={face} />
      <Bucket position={[0, y, -2.72]} />
      <Sparkles t={t} from={b} n={7} radius={0.5} center={[0, 1.45, -2.7]} size={0.12} />
    </>
  );
};

// 10. "Mas, ao sair, você *não* troca as bolinhas por dinheiro." — caminhando com o balde.
const S10 = ({ t, t0, t1 }: ShotProps) => {
  const n = W(6, 'nao');
  const w = walkAlong(t, t0, t1 + 0.3, [0, 0, -6], [0, 0, -6 + (t1 + 0.3 - t0) * 0.9]);
  const pose = { ...track(t, P({ lsx: 0.95, rsx: 0.95, lel: -0.9, rel: -0.9, lsz: 0.35, rsz: 0.35 }), [{ at: n, v: { hy: 0.5, hp: 0.05 } }]), x: w.p[0], z: w.p[2], walk: w.walk, stride: w.stride };
  const face = faceAt(t, [{ at: t0, f: 'happy' }, { at: n, f: 'confused' }, { at: W(6, 'dinheiro'), f: 'unsure' }], 8);
  const z = w.p[2];
  const k = pop(t, n);
  return (
    <>
      <PachinkoHall t={t} semBanco={HALL_LIVRES} />
      <Jogadores t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [1.0, 1.75, z + 4.4], [0.35, 1.4, z], 32]]} />
      <Character pose={pose} face={face} />
      <Bucket position={[0, 0.94, z + 0.48]} />
      <group position={[0.95, 1.5, z + 0.4]} scale={k}>
        <MoneyStack n={5} symbol="¥" position={[0, -0.15, 0]} rotation={[0.5, -0.3, 0]} />
        <NoSign position={[0, 0, 0.15]} scale={0.7} />
      </group>
    </>
  );
};

// 11. "Primeiro, entrega tudo e escolhe um *prêmio*:" — balcão de prêmios.
const S11 = ({ t, t0, t1 }: ShotProps) => {
  const td = W(7, 'tudo');
  const pr = W(7, 'premio');
  const pose = track(t, P({ x: -0.55, z: 1.05, ry: Math.PI - 0.55, lsx: 0.95, rsx: 0.95, lel: -0.9, rel: -0.9, lsz: 0.35, rsz: 0.35 }), [
    { at: td, v: { lsx: 1.4, rsx: 1.4, lel: -0.2, rel: -0.2, lean: 0.15 } },
    { at: pr, v: { lsx: 0, rsx: 1.5, rel: -0.1, lel: 0.15, lean: 0, hy: 0.25, hp: -0.15 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: pr, f: 'curious' }], 9);
  const k = seg(t, td - 0.3, td - 0.05);
  const bucketP: V3 = [lerp(-0.55 + Math.sin(Math.PI - 0.55) * 0.48, -0.2, k), lerp(0.94, 1.07, k), lerp(1.05 + Math.cos(Math.PI - 0.55) * 0.48, 0.05, k)];
  const fpose = track(t, P({ x: 0.45, y: 0.75, z: -0.95, ry: -0.2 }), [
    { at: td, v: { lsx: 0.9, rsx: 0.9, lel: -0.6, rel: -0.6, hp: 0.15 } },
    { at: pr, v: { lsx: 0, rsx: 0, rsz: 1.4, rel: 0.3, hy: 0.8, hp: -0.1, twist: 0.3 } },
  ]);
  return (
    <>
      <PrizeCounter t={t} acende={pr} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.6, 2.0, 5.4], [-0.15, 1.3, -0.1], 32], [t1, [1.3, 1.9, 4.9], [-0.1, 1.4, -0.3], 32]]} />
      <Character pose={fpose} face={faceAt(t, [{ at: t0, f: 'smile' }, { at: pr, f: 'bigSmile' }], 19)} look={ATENDENTE} />
      <Character pose={pose} face={face} />
      <Bucket position={bucketP} />
    </>
  );
};

// 12. "pode ser um *chocolate*, um *xampu* ou um *brinquedo* pequeno." — prêmios pulam no balcão.
const S12 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(8, 'chocolate');
  const x = W(8, 'xampu');
  const b = W(8, 'brinquedo');
  const fpose = track(t, P({ x: 0, y: 0.75, z: -0.95 }), [
    { at: c, v: { lsz: 1.0, lsx: 0.6, lel: -0.3, hy: 0.5, hp: 0.2 } },
    { at: x, v: { lsz: 0.2, lsx: 0, hy: 0, hp: 0.25 } },
    { at: b, v: { rsz: 1.0, rsx: 0.6, rel: -0.3, hy: -0.5, hp: 0.2 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: c, f: 'happy' }, { at: x, f: 'wink' }, { at: b, f: 'bigSmile' }], 11);
  return (
    <>
      <PrizeCounter t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.0, 1.8, 4.2], [0, 1.3, -0.3], 32], [t1, [0.25, 1.7, 3.8], [0, 1.3, -0.3], 32]]} />
      <Character pose={fpose} face={face} look={ATENDENTE} />
      <Chocolate position={[-0.62, 1.07, 0.15]} scale={pop(t, c) * 1.4} />
      <Shampoo position={[0, 1.07, 0.15]} scale={pop(t, x) * 1.4} />
      <Ursinho position={[0.62, 1.07, 0.15]} scale={pop(t, b) * 1.4} />
      <Sparkles t={t} from={c} n={5} radius={0.25} center={[-0.62, 1.25, 0.2]} size={0.09} />
      <Sparkles t={t} from={x} n={5} radius={0.25} center={[0, 1.35, 0.2]} size={0.09} />
      <Sparkles t={t} from={b} n={5} radius={0.25} center={[0.62, 1.35, 0.2]} size={0.09} />
    </>
  );
};

// O prêmio na mão de Você (ursinho), posicionado em frente ao peito.
const PremioNaMao = ({ p, ry }: { p: V3; ry: number }) => <Ursinho position={[p[0] + Math.sin(ry) * 0.45, 0.95, p[2] + Math.cos(ry) * 0.45]} rotation={[0, ry, 0]} scale={1.3} />;

// 13. "Então você percebe uma pequena *loja* ali perto."
const S13 = ({ t, t0, t1 }: ShotProps) => {
  const l = W(9, 'loja');
  const pose = track(t, P({ x: 1.3, z: 2.2, ry: 0.2, lsx: 0.9, rsx: 0.9, lel: -1.0, rel: -1.0, lsz: 0.3, rsz: 0.3 }), [
    { at: W(9, 'percebe'), v: { hy: -0.9, hp: 0 }, lead: 2 },
    { at: l, v: { ry: -0.5, hy: -0.7 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'content' }, { at: W(9, 'percebe'), f: 'sideEye' }, { at: l, f: 'curious' }], 12);
  return (
    <>
      <WindowShop t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [2.2, 1.7, 5.4], [1.3, 1.5, 2.2], 32], [l, [1.4, 2.0, 6.6], [0.4, 1.6, 0.6], 32], [t1, [1.1, 2.0, 6.0], [0.3, 1.6, 0.4], 32]]} />
      <Character pose={pose} face={face} />
      <PremioNaMao p={[pose.x, 0, pose.z]} ry={pose.ry} />
    </>
  );
};

// 14. "Na *janela*, alguém compra justamente aquele prêmio." — janelinha abre, Sombra aparece.
const S14 = ({ t, t0, t1 }: ShotProps) => {
  const j = W(10, 'janela');
  const spose = track(t, P({ z: -0.62, hp: 0.15 }), [{ at: j, v: { hp: -0.05, hy: 0.15 } }, { at: W(10, 'compra'), v: { rsx: 1.3, rel: -0.3, hy: 0 } }]);
  const face = faceAt(t, [{ at: t0, f: 'deadpan' }, { at: j, f: 'suspicious' }, { at: W(10, 'premio'), f: 'smug' }], 13);
  return (
    <>
      <WindowShop t={t} abre={j} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.5, 1.55, 3.0], [0, 1.5, 0], 32], [t1, [0.3, 1.58, 2.3], [0, 1.55, 0], 32]]} />
      <Character pose={spose} face={face} look={JANELA} />
    </>
  );
};

// 15. "Você entrega o objeto e recebe *dinheiro* em troca."
const S15 = ({ t, t0, t1 }: ShotProps) => {
  const ob = W(11, 'objeto');
  const d = W(11, 'dinheiro');
  const pose = track(t, P({ x: 0.3, z: 0.95, ry: Math.PI - 0.15, lsx: 0.9, rsx: 0.9, lel: -1.0, rel: -1.0, lsz: 0.3, rsz: 0.3 }), [
    { at: ob, v: { lsx: 1.45, rsx: 1.45, lel: -0.1, rel: -0.1, lean: 0.1 } },
    { at: d, v: { lsx: 0.2, lel: 0.15, rsx: 1.0, rel: -1.2, lean: 0, ry: Math.PI - 1.4, hy: -0.6 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: d, f: 'starstruck', o: ['sparkle'] }], 14);
  const spose = track(t, P({ z: -0.62, hp: 0.1 }), [{ at: ob, v: { rsx: 1.5, rel: -0.1, lsx: 1.5, lel: -0.1 } }, { at: d, v: { rsx: 0.2, lsx: 0.2 } }]);
  const kIn = seg(t, ob - 0.35, ob + 0.25);
  const prize: V3 = [lerp(0.3 + Math.sin(Math.PI - 0.15) * 0.45, 0, kIn), lerp(0.95, 1.33, kIn), lerp(0.95 + Math.cos(Math.PI - 0.15) * 0.45, -0.3, kIn)];
  const kOut = seg(t, d - 0.35, d - 0.03);
  return (
    <>
      <WindowShop t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.3, 2.1, 4.0], [0.1, 1.4, 0.2], 32], [d, [2.3, 1.8, 3.8], [0.25, 1.4, 0.5], 32], [t1, [2.4, 1.75, 3.9], [0.3, 1.4, 0.5], 32]]} />
      <Character pose={spose} face={faceAt(t, [{ at: t0, f: 'suspicious' }], 15)} look={JANELA} />
      <Character pose={pose} face={face} />
      {kIn < 0.98 && <Ursinho position={prize} rotation={[0, Math.PI, 0]} scale={1.3} />}
      {t > d - 0.4 && <MoneyStack n={4} symbol="¥" position={[lerp(0, 0.15, kOut), 1.32, lerp(-0.2, 0.18, kOut)]} rotation={[0, 0.3, 0]} />}
      <CoinBurst t={t} at={d} n={6} position={[0.1, 1.4, 0.25]} />
    </>
  );
};

// 16. "A casa de pachinko diz que oferece *apenas* o jogo." — atendente, placa SÓ JOGO.
const S16 = ({ t, t0, t1 }: ShotProps) => {
  const a = W(12, 'apenas');
  const fpose = track(t, P({ x: 0, y: 0.75, z: -0.95 }), [
    { at: W(12, 'diz'), v: { rsx: 0.8, rel: -0.6, hy: 0.15 } },
    { at: a, v: { rsx: 0, rel: 0.3, lsz: 1.5, rsz: 1.5, lel: 0.2, hp: -0.1, hy: 0 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: a, f: 'smug' }], 16);
  return (
    <>
      <PrizeCounter t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.6, 1.8, 3.9], [0, 1.6, -0.6], 32], [t1, [-0.2, 1.75, 3.3], [0, 1.6, -0.6], 32]]} />
      <Character pose={fpose} face={face} look={ATENDENTE} />
      <Sign text="SÓ JOGO" w={1.2} h={0.42} position={[0, 1.3, 0.3]} rotation={[-0.15, 0, 0]} scale={pop(t, a)} bg="#2b1d3f" fg="#ffd23a" />
    </>
  );
};

// 17. "A loja afirma que só compra *prêmios*." — Sombra, placa SÓ PRÊMIOS.
const S17 = ({ t, t0, t1 }: ShotProps) => {
  const p = W(13, 'premios');
  const spose = track(t, P({ z: -0.62, hp: 0.1 }), [{ at: W(13, 'afirma'), v: { hy: -0.2, hr: 0.15 } }, { at: p, v: { hy: 0.1, hr: -0.1, hp: -0.05 } }]);
  const face = faceAt(t, [{ at: t0, f: 'suspicious' }, { at: p, f: 'smug' }], 17);
  return (
    <>
      <WindowShop t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.5, 1.6, 3.1], [0, 1.4, 0], 32], [t1, [-0.25, 1.55, 2.6], [0, 1.4, 0], 32]]} />
      <Character pose={spose} face={face} look={JANELA} />
      <Sign text="SÓ PRÊMIOS" w={1.3} h={0.36} position={[0, 0.98, 0.14]} scale={pop(t, p)} bg="#7a2340" fg="#ffffff" />
    </>
  );
};

// 18. "E, quando a *polícia* aparece, você vê que," — Sargento Ramos chega.
const S18 = ({ t, t0, t1 }: ShotProps) => {
  const po = W(14, 'policia');
  const w = walkAlong(t, t0, po - 0.05, [3.4, 0, 2.2], [1.25, 0, 1.6]);
  const rpose = track(t, P({ ry: -1.2, rsx: 0.9, rel: -1.2 }), [{ at: W(14, 'voce'), v: { ry: -0.7, hy: -0.4 } }]);
  const rp = { ...rpose, x: w.p[0], z: w.p[2], walk: w.walk, stride: w.stride };
  const vpose = track(t, P({ x: -0.9, z: 1.4, ry: 0.5, lsx: 0.2 }), [{ at: po, v: { hy: 0.8, squash: 0.08 } }, { at: W(14, 'voce'), v: { hy: 0.5 } }]);
  const vface = faceAt(t, [{ at: t0, f: 'happy' }, { at: po, f: 'nervous', o: ['sweat'] }], 18);
  return (
    <>
      <WindowShop t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 2.0, 7.4], [0.1, 1.3, 0.8], 32], [t1, [0.3, 1.9, 6.8], [0.1, 1.35, 0.9], 32]]} />
      <Character pose={spose14} face={faceAt(t, [{ at: t0, f: 'deadpan' }], 30)} look={JANELA} />
      <Character pose={rp} face={faceAt(t, [{ at: t0, f: 'suspicious' }, { at: W(14, 'voce'), f: 'confident' }], 20)} look={POLICIA} right={<Clipboard text={'JOGO\nPRÊMIO\nVENDA'} position={[0, -0.12, 0.05]} rotation={[-1.2, 0, 0]} />} />
      <Character pose={vpose} face={vface} />
    </>
  );
};
const spose14 = P({ z: -0.62, hp: 0.1 });

// 19. "no papel, tudo parece *separado*." — três papéis se afastam.
const S19 = ({ t, t0, t1 }: ShotProps) => {
  const s = W(14, 'separado');
  const k = seg(t, s - 0.35, s - 0.05, (x) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2));
  const rpose = track(t, P({ x: -0.6, ry: 0.55, rsx: 0.9, rel: -1.2 }), [{ at: s, v: { lsz: 1.4, lel: 0.2, hy: 0.5, hp: -0.1 } }]);
  const papers = ['JOGO', 'PRÊMIO', 'VENDA'];
  const cores = ['#c8202e', '#2f6fb3', '#2a8a3a'];
  return (
    <>
      <Stage color="#2a2448" pedestal={false} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.1, 1.7, 5.6], [0.05, 1.35, 0], 32], [t1, [0.15, 1.8, 6.2], [0.05, 1.35, 0], 32]]} />
      <Character pose={rpose} face={faceAt(t, [{ at: t0, f: 'thinking' }, { at: s, f: 'confident' }], 21)} look={POLICIA} right={<Clipboard text={'JOGO\nPRÊMIO\nVENDA'} position={[0, -0.12, 0.05]} rotation={[-1.2, 0, 0]} />} />
      {papers.map((p, i) => (
        <Paper key={p} text={p} color={cores[i]} position={[0.55 + (i - 1) * (0.12 + 0.4 * k) + 0.1 * k, 1.35 + (i - 1) * 0.55 * (1 - k * 0.3) - 0.0, 0.1 + i * 0.03 - 0.15 * k * Math.abs(i - 1)]} rotation={[0, -0.15, (i - 1) * 0.12 * k]} scale={0.55} />
      ))}
    </>
  );
};

// 20. "Você olha para a janelinha e entende o *truque*:" — lâmpada de ideia.
const S20 = ({ t, t0, t1 }: ShotProps) => {
  const tr = W(15, 'truque');
  const pose = track(t, P({ x: 0.9, z: 1.7, ry: 0.15, hy: -0.75, hp: -0.05 }), [
    { at: W(15, 'entende'), v: { hy: -0.3, hp: 0.1, rsx: 0.9, rel: -2.0 } },
    { at: tr, v: { hy: 0.15, hp: -0.15, rsx: 2.6, rel: -0.1 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'sideEye' }, { at: W(15, 'entende'), f: 'thinking' }, { at: tr, f: 'amazed', o: ['sparkle'] }], 22);
  return (
    <>
      <WindowShop t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.6, 1.8, 5.0], [0.85, 1.55, 1.7], 32], [t1, [1.35, 1.75, 4.4], [0.85, 1.65, 1.7], 32]]} />
      <Character pose={pose} face={face} />
      <IdeaBulb t={t} at={tr} position={[0.9, 2.75, 1.7]} scale={0.9} />
    </>
  );
};

// 21. "o dinheiro está ali, mas cada etapa acontece em um lugar *diferente*." — três mini-prédios se afastam.
const S21 = ({ t, t0, t1 }: ShotProps) => {
  const d = W(16, 'diferente');
  const k = seg(t, d - 0.35, d - 0.05, (x) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2));
  const gap = 0.85 + 0.75 * k;
  const pos: V3[] = [[-0.45, 0, -gap * 1.1], [0.45, 0, 0], [-0.45, 0, gap * 1.1]];
  // moeda pula de prédio em prédio desde "dinheiro"
  const ph = Math.max(0, t - W(16, 'dinheiro')) * 1.4;
  const i0 = Math.floor(ph) % 3;
  const i1 = (i0 + 1) % 3;
  const f = ph % 1;
  const a = pos[i0];
  const b = pos[i1];
  const coin: V3 = [lerp(a[0], b[0], f), 1.45 + Math.sin(f * Math.PI) * 0.9, lerp(a[2], b[2], f)];
  return (
    <>
      <Stage color="#241a3e" pedestal={false} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [3.4, 5.6, 7.0], [0, 0.5, 0.3], 32], [t1, [3.7, 6.0, 7.6], [0, 0.5, 0.3], 32]]} />
      <MiniBuilding t={t} text="PACHINKO" color="#ffd23a" position={pos[0]} rotation={[0, 0.5, 0]} />
      <MiniBuilding t={t} text="PRÊMIOS" color="#ff3d8b" wall="#5a1a35" position={pos[1]} rotation={[0, 0.5, 0]} />
      <MiniBuilding t={t} text="LOJA" color="#3df2ff" wall="#3a3a4a" position={pos[2]} rotation={[0, 0.5, 0]} />
      {t > W(16, 'dinheiro') && <Coin position={coin} rotation={[Math.PI / 2, 0, t * 6]} scale={1.6} />}
      <Sparkles t={t} from={d} n={8} radius={1.6} center={[0, 1.6, 0]} size={0.12} />
    </>
  );
};

// 22. "No registro, você só *jogou*, ganhou um *prêmio* e o *vendeu*."
const S22 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Stage color="#2a2448" pedestal={false} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 1.7, 5.2], [0, 1.45, 0], 32], [t1, [0.1, 1.65, 4.7], [0, 1.45, 0], 32]]} />
    <mesh position={[0, 0.7, -0.05]} castShadow>
      <boxGeometry args={[0.08, 1.4, 0.08]} />
      <meshStandardMaterial color="#5a3a22" />
    </mesh>
    <RecordBoard t={t} position={[0, 1.6, 0]} rows={[{ text: 'JOGOU', at: W(17, 'jogou') }, { text: 'PRÊMIO', at: W(17, 'premio') }, { text: 'VENDEU', at: W(17, 'vendeu') }]} />
  </>
);

// 23. "No papel, *ninguém* apostou em nada." — volta para a rua de neon (loop com o início).
const S23 = ({ t, t0, t1 }: ShotProps) => {
  const n = W(18, 'ninguem');
  const pose = track(t, P({ ry: 0.15, hy: 0.25, hp: -0.1 }), [
    { at: n, v: { hy: 0.5, rsz: 1.2, rel: 0.4, rsx: 0.4 } },
    { at: W(18, 'nada'), v: { hy: 0.1, rsz: 0.12, rsx: 0.9, rel: -1.9, hr: 0.15 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'smug' }, { at: n, f: 'sideEye' }, { at: W(18, 'nada'), f: 'wink' }], 23);
  const s = pop(t, n);
  return (
    <>
      <NeonStreet t={t} placa="JAPÃO" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.5, 1.75, 4.6], [0.25, 1.6, 0], 32], [n, [0.5, 1.9, 5.2], [0.3, 1.7, 0], 32], [t1 + 0.8, [0.4, 5.2, 9.5], [0, 3.2, -4], 30]]} />
      <Character pose={pose} face={face} />
      <Paper text="APOSTAS" color="#26324a" position={[0.95, 1.55, 0.3]} rotation={[0, -0.35, 0]} scale={0.8} />
      <StampMark text="ZERO" w={0.8} color="#e0262e" position={[0.97, 1.42, 0.34]} rotation={[0, -0.35, 0.25]} scale={s} />
      <Puff t={t} at={n} position={[0.97, 1.42, 0.45]} color="#ffb0b0" size={0.18} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: '01 japao', C: S01 },
  { from: W(0, 'jogos'), name: '02 proibidos', C: S02 },
  { from: W(1, 0), name: '03 neon', C: S03 },
  { from: W(2, 0), name: '04 pachinko', C: S04 },
  { from: W(3, 0), name: '05 entra', C: S05 },
  { from: W(4, 0), name: '06 maquinas', C: S06 },
  { from: W(4, 'luzes'), name: '07 bolinhas', C: S07 },
  { from: W(5, 0), name: '08 ganha', C: S08 },
  { from: W(5, 'recebe'), name: '09 balde', C: S09 },
  { from: W(6, 0), name: '10 nao', C: S10 },
  { from: W(7, 0), name: '11 premio', C: S11 },
  { from: W(8, 0), name: '12 premios', C: S12 },
  { from: W(9, 0), name: '13 loja', C: S13 },
  { from: W(10, 0), name: '14 janela', C: S14 },
  { from: W(11, 0), name: '15 dinheiro', C: S15 },
  { from: W(12, 0), name: '16 apenas', C: S16 },
  { from: W(13, 0), name: '17 so premios', C: S17 },
  { from: W(14, 0), name: '18 policia', C: S18 },
  { from: W(14, 'no'), name: '19 separado', C: S19 },
  { from: W(15, 0), name: '20 truque', C: S20 },
  { from: W(16, 0), name: '21 diferente', C: S21 },
  { from: W(17, 0), name: '22 registro', C: S22 },
  { from: W(18, 0), name: '23 ninguem', C: S23 },
];

// evita aviso de importação não usada quando alguma tomada é desligada
void [VOCE, PachinkoMachine, NeonSign, Shampoo, F];
