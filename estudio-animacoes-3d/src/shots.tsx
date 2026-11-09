import { JSX } from 'react';
import { clamp01, easeInOut, lerp, seg, track, V3 } from './anim';
import { Character, faceAt, Pose, REST } from './Character';
import { CampoBatatas, CasaCamponesa, ELENCO_BATATAS as EB, HangingSign, Potato, PotatoPile, Sack, SalaDoTrono, Shovel, Spear, Vila } from './batatas';
import { Horta } from './cenarios2';
import { Paper } from './historia';
import { CoinBurst, Comic, Puff, Sparkles } from './props';
import { Cam, Stage } from './sets';
import { ambiente, passos, som, Som, VOL } from './sfx';
import { W } from './timeline';

// ============================================================================
// "A BATATA NA FRANÇA DE 1780" — tomadas do STORYBOARD.md, ancoradas em palavras com W(linha, 'palavra').
// Versões anteriores em historias/ (pachinko, escritorio, elnino).
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element };

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });
const walkAlong = (t: number, a: number, b: number, from: V3, to: V3) => {
  const k = clamp01((t - a) / (b - a));
  const kk = easeInOut(k) * 0.25 + k * 0.75;
  const p: V3 = [lerp(from[0], to[0], kk), from[1], lerp(from[2], to[2], kk)];
  const dist = Math.hypot(p[0] - from[0], p[2] - from[2]);
  const moving = t > a && t < b;
  return { p, walk: dist / 0.24, stride: moving ? Math.min(1, (t - a) / 0.15, (b - t) / 0.15) : 0 };
};
const pop = (t: number, at: number) => Math.max(0.001, seg(t, at - 0.2, at - 0.03, (x) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2)));
const naMao = <Potato position={[0, -0.12, 0.06]} scale={1.5} />;

// Fumaça verde ("faz mal").
const Fumaca = ({ t, from, center }: { t: number; from: number; center: V3 }) => (
  <>
    {t > from &&
      Array.from({ length: 7 }, (_, i) => {
        const ph = ((t - from) * 0.6 + i / 7) % 1;
        return (
          <mesh key={i} position={[center[0] + Math.sin(i * 2.1 + t) * 0.25, center[1] + ph * 1.1, center[2] + Math.cos(i * 1.7) * 0.15]} scale={0.12 + ph * 0.22}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#7fcf5a" transparent opacity={0.65 * (1 - ph)} />
          </mesh>
        );
      })}
  </>
);

// 01. "Você vive na *França* por volta de" — grua dos telhados até Você.
const S01 = ({ t, t0, t1 }: ShotProps) => {
  const f = W(0, 'franca');
  const pose = track(t, P({ z: 0.8, ry: 0.1, hy: 0.4, hp: -0.25 }), [{ at: f, v: { hy: 0, hp: 0, lsz: 0.9, rsz: 0.9, lel: 0.3, rel: 0.3 } }]);
  return (
    <>
      <Vila t={t} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: f, f: 'smile' }], 1)} look={EB.voce.look} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 6.2, 6.5], [0, 4.6, -4], 32], [f, [0, 2.4, 5.6], [0, 1.5, 0.6], 32], [t1, [0, 2.0, 4.6], [0, 1.45, 0.8], 32]]} />
    </>
  );
};

// 02. "mil setecentos e oitenta." — placa 1780 no centro.
const S02 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Vila t={t} ano={false} />
    <group position={[-1.6, 2.9, -2.9]} scale={pop(t, W(0, 'mil') + 0.15)}>
      <HangingSign />
    </group>
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-1.6, 2.9, 0.4], [-1.6, 2.95, -2.9], 32], [t1, [-1.6, 2.9, -0.1], [-1.6, 2.95, -2.9], 32]]} />
  </>
);

// 03. "A comida começa a *faltar*," — pratos vazios.
const S03 = ({ t, t0, t1 }: ShotProps) => {
  const fa = W(1, 'faltar');
  const pose = track(t, P({ x: -0.4, z: -1.55, hp: 0.35 }), [{ at: fa, v: { lsx: 0.6, rsx: 0.6, lel: -1.5, rel: -1.5, hp: 0.45, squash: 0.08 } }]);
  return (
    <>
      <CasaCamponesa t={t} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: fa, f: 'tired' }], 3)} look={EB.voce.look} />
      <Comic t={t} at={fa + 0.1} text="RONC!" position={[-0.4, 2.2, -1.2]} size={0.28} hold={0.7} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.4, 1.9, 2.8], [-0.4, 1.2, -1.0], 32], [t1, [-0.4, 1.8, 2.3], [-0.4, 1.2, -1.0], 32]]} />
    </>
  );
};

// 04. "e muita gente passa *fome*." — Paula e Seu Bento tristes na vila.
const S04 = ({ t, t0, t1 }: ShotProps) => {
  const fo = W(1, 'fome');
  return (
    <>
      <Vila t={t} />
      <Character pose={track(t, P({ x: -0.55, z: 0.6, ry: 0.3 }), [{ at: fo, v: { hp: 0.4, lsx: 0.7, rsx: 0.7, lel: -1.3, rel: -1.3 } }])} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: fo, f: 'tired', o: ['tears'] }], 4)} look={EB.aldea.look} />
      <Character pose={track(t, P({ x: 0.6, z: 0.5, ry: -0.3 }), [{ at: fo, v: { hp: 0.35, squash: 0.1 } }])} face={faceAt(t, [{ at: t0, f: 'tired' }, { at: fo, f: 'sick' }], 5)} look={EB.aldeao.look} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.0, 5.4], [0, 1.4, 0.5], 32], [t1, [0, 1.9, 4.8], [0, 1.4, 0.5], 32]]} />
    </>
  );
};

// 05. "Mesmo assim, há *batatas* sobrando nos campos." — montes de batatas surgem.
const S05 = ({ t, t0, t1 }: ShotProps) => {
  const b = W(2, 'batatas');
  return (
    <>
      <CampoBatatas t={t} />
      {[[-1.4, -2.2, 0], [0.3, -1.6, 0.25], [1.7, -2.6, 0.45], [-0.6, -4.0, 0.6], [1.0, -4.4, 0.75]].map(([x, z, d], i) => (
        <PotatoPile key={i} n={40} r={0.55} position={[x, 0.08, z]} scale={pop(t, b + d)} />
      ))}
      <Sparkles t={t} from={b} n={8} radius={1.6} center={[0, 1.0, -2.6]} size={0.12} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 3.4, 4.6], [0, 0.4, -2.6], 32], [t1, [0, 3.0, 3.8], [0, 0.4, -2.6], 32]]} />
    </>
  );
};

// 06. "O problema é que quase *ninguém* quer comê-las." — cara de nojo diante da carroça.
const S06 = ({ t, t0, t1 }: ShotProps) => {
  const n = W(3, 'ninguem');
  return (
    <>
      <Vila t={t} />
      <Character pose={track(t, P({ x: 0.9, z: -0.6, ry: -0.6 }), [{ at: n, v: { ry: 0.3, lsx: 1.2, lel: -0.2, hy: -0.4, lean: -0.1 } }])} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: n, f: 'disgusted' }], 6)} look={EB.voce.look} />
      <Character pose={track(t, P({ x: 0.0, z: -0.2, ry: -0.3 }), [{ at: n, v: { ry: 0.2, rsz: 1.2, hy: 0.3, lean: -0.1 } }])} face={faceAt(t, [{ at: t0, f: 'suspicious' }, { at: n, f: 'disgusted' }], 7)} look={EB.aldea.look} />
      <Comic t={t} at={n} text="ECA!" position={[0.45, 2.5, -0.4]} size={0.3} hold={0.8} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.6, 2.0, 4.6], [0.5, 1.4, -0.8], 32], [t1, [0.5, 1.95, 4.0], [0.5, 1.4, -0.8], 32]]} />
    </>
  );
};

// 07. "Você ouve que elas fazem *mal*" — batata gigante no centro.
const S07 = ({ t, t0, t1 }: ShotProps) => {
  const m = W(4, 'mal');
  return (
    <>
      <Stage color="#c87a3a" pedestal={false} />
      <group position={[0, 1.4, 0]} rotation={[0.2, t * 0.4, 0.1]} scale={5}>
        <Potato big />
      </group>
      <Fumaca t={t} from={m - 0.2} center={[0, 2.0, 0.4]} />
      <Comic t={t} at={m} text="FAZ MAL?" position={[0, 2.7, 0.8]} size={0.32} hold={1.0} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.7, 4.4], [0, 1.6, 0], 32], [t1, [0, 1.7, 3.9], [0, 1.6, 0], 32]]} />
    </>
  );
};

// 08. "e que podem até causar *doenças*." — enjoados, fumaça verde.
const S08 = ({ t, t0, t1 }: ShotProps) => {
  const d = W(4, 'doencas');
  return (
    <>
      <Vila t={t} />
      <Character pose={track(t, P({ x: -0.45, z: 0.6, ry: 0.25 }), [{ at: d, v: { rsx: 1.6, rel: -2.2, hp: 0.15, squash: 0.08 } }])} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: d, f: 'sick', o: ['sweat'] }], 8)} look={EB.voce.look} />
      <Character pose={track(t, P({ x: 0.55, z: 0.5, ry: -0.25 }), [{ at: d, v: { lsx: 1.6, lel: -2.2, hy: 0.3 } }])} face={faceAt(t, [{ at: t0, f: 'scared' }, { at: d, f: 'sick' }], 9)} look={EB.aldea.look} />
      <Fumaca t={t} from={d - 0.3} center={[0, 0.35, 1.3]} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.9, 4.6], [0, 1.45, 0.5], 32], [t1, [0, 1.85, 4.0], [0, 1.5, 0.5], 32]]} />
    </>
  );
};

// 09. "Um homem tenta convencer a população de que a batata é *nutritiva*," — agrônomo com a batata.
const S09 = ({ t, t0, t1 }: ShotProps) => {
  const n = W(5, 'nutritiva');
  const pose = track(t, P({ z: 0.7, ry: 0.1, rsx: 1.2, rel: -0.6 }), [
    { at: W(5, 'convencer'), v: { lsz: 1.1, lel: 0.3 } },
    { at: n, v: { rsx: 0.9, rsz: 2.2, rel: -0.1, lsz: 0.3, hp: -0.1, hy: -0.3 } },
  ]);
  return (
    <>
      <Vila t={t} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'happy' }, { at: W(5, 'convencer'), f: 'bigSmile' }, { at: n, f: 'starstruck', o: ['sparkle'] }], 10)} look={EB.agronomo.look} right={naMao} />
      <Sparkles t={t} from={n} n={9} radius={0.4} center={[-0.95, 2.3, 0.9]} size={0.12} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.0, 5.0], [0, 1.6, 0.6], 32], [n, [0, 2.1, 4.2], [0.1, 1.8, 0.6], 32], [t1, [0, 2.1, 3.9], [0.1, 1.85, 0.6], 32]]} />
    </>
  );
};

// 10. "mas ninguém *acredita*." — aldeões viram as costas.
const S10 = ({ t, t0, t1 }: ShotProps) => {
  const a = W(5, 'acredita');
  return (
    <>
      <Vila t={t} />
      <Character pose={P({ z: -0.6, ry: 0, rsx: 1.4, rel: -0.6 })} face={faceAt(t, [{ at: t0, f: 'bigSmile' }, { at: a, f: 'confused' }], 11)} look={EB.agronomo.look} right={naMao} />
      {[[-1.0, 0.9, EB.aldeao.look, 12], [1.0, 0.9, EB.aldea.look, 13], [0, 1.4, EB.voce.look, 14]].map(([x, z, look, s], i) => {
        const ry = lerp(Math.PI, 0.2 * (i - 1), seg(t, a - 0.45, a - 0.1));
        return <Character key={i} pose={P({ x: x as number, z: z as number, ry, lsx: 0.7, rsx: 0.7, lel: -2.2, rel: -2.2 })} face={faceAt(t, [{ at: 0, f: 'annoyed' }], s as number)} look={look as never} />;
      })}
      <Comic t={t} at={a} text="NÃO!" position={[0, 2.8, 0.4]} size={0.32} hold={0.8} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.6, 5.8], [0, 1.5, 0.3], 32], [t1, [0, 2.4, 5.2], [0, 1.5, 0.3], 32]]} />
    </>
  );
};

// 11. "Então ele procura o *rei*" — do agrônomo ao rei.
const REI: Pose = P({ y: 0.6, z: -3.3 });
const S11 = ({ t, t0, t1 }: ShotProps) => {
  const r = W(6, 'rei');
  const w = walkAlong(t, t0, r, [1.2, 0, 1.2], [1.2, 0, -1.4]);
  return (
    <>
      <SalaDoTrono />
      <Character pose={track(t, REI, [{ at: r, v: { hp: -0.1, rsz: 1.0, rel: 0.3 } }])} face={faceAt(t, [{ at: t0, f: 'bored' }, { at: r, f: 'curious' }], 15)} look={EB.rei.look} />
      <Character pose={P({ x: w.p[0], z: w.p[2], ry: Math.PI, walk: w.walk, stride: w.stride })} face={faceAt(t, [{ at: 0, f: 'happy' }], 16)} look={EB.agronomo.look} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.2, 2.0, 4.8], [1.2, 1.4, 0.4], 32], [r, [-0.2, 2.2, 2.6], [0, 2.1, -3.3], 32], [t1, [-0.2, 2.2, 2.2], [0, 2.15, -3.3], 32]]} />
    </>
  );
};

// 12. "e recebe uma *missão*:" — papel MISSÃO surge.
const S12 = ({ t, t0, t1 }: ShotProps) => {
  const m = W(6, 'missao');
  return (
    <>
      <SalaDoTrono />
      <Character pose={track(t, REI, [{ at: m, v: { rsx: 1.4, rel: -0.2, hy: 0 } }])} face={faceAt(t, [{ at: t0, f: 'confident' }, { at: m, f: 'smug' }], 17)} look={EB.rei.look} />
      <Character pose={P({ x: 2.3, z: -1.6, ry: Math.PI + 0.6 })} face={faceAt(t, [{ at: 0, f: 'curious' }], 18)} look={EB.agronomo.look} />
      <Paper text="MISSÃO" color="#c8102e" position={[0.75, 1.3, -2.4]} rotation={[0, -0.4, 0]} scale={pop(t, m) * 0.7} />
      <Sparkles t={t} from={m} n={8} radius={0.45} center={[0.75, 1.4, -2.3]} size={0.1} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.35, 2.0, 1.8], [0.35, 1.75, -2.6], 32], [t1, [0.35, 1.95, 1.4], [0.35, 1.75, -2.6], 32]]} />
    </>
  );
};

// 13. "fazer o povo *aceitar* aquele alimento." — agrônomo feliz com o papel.
const S13 = ({ t, t0, t1 }: ShotProps) => {
  const a = W(7, 'aceitar');
  return (
    <>
      <SalaDoTrono />
      <Character pose={track(t, P({ z: -1.0, rsx: 1.0, rel: -0.7, lsx: 1.0, lel: -0.7 }), [{ at: a, v: { rsz: 1.9, rsx: 0.6, rel: -0.1, hp: -0.1 } }])} face={faceAt(t, [{ at: t0, f: 'happy' }, { at: a, f: 'starstruck', o: ['sparkle'] }], 19)} look={EB.agronomo.look} right={<Paper text="MISSÃO" color="#c8102e" position={[0, -0.25, 0.05]} rotation={[-1.4, 0, 0]} scale={0.3} />} left={naMao} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.0, 2.8], [0, 1.75, -1.0], 32], [t1, [0, 2.0, 2.4], [0, 1.8, -1.0], 32]]} />
    </>
  );
};

// 14. "Com o apoio da *corte*," — nobre de cartola aprova.
const S14 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(8, 'corte');
  return (
    <>
      <SalaDoTrono />
      <Character pose={track(t, P({ x: 0, z: -1.2, ry: 0.1 }), [{ at: c, v: { rsx: 1.4, rel: -1.6, hp: 0.15 } }])} face={faceAt(t, [{ at: t0, f: 'suspicious' }, { at: c, f: 'smug' }], 20)} look={EB.nobre.look} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.0, 2.6], [0, 1.75, -1.2], 32], [t1, [0, 2.0, 2.2], [0, 1.75, -1.2], 32]]} />
    </>
  );
};

// 15. "ele consegue um *terreno* e organiza uma *plantação*." — campo vazio, plantas crescem rápido.
const S15 = ({ t, t0, t1 }: ShotProps) => {
  const te = W(8, 'terreno');
  const pl = W(8, 'plantacao');
  const cresce = seg(t, W(8, 'organiza') - 0.2, pl);
  return (
    <>
      <CampoBatatas t={t} cresce={cresce} />
      <Character pose={track(t, P({ x: 0, z: 0.5, ry: 0.15, rsx: 0.5, rel: -0.6 }), [{ at: te, v: { lsz: 1.3, lel: 0.2, hy: 0.3 } }, { at: pl, v: { lsz: 0.2, hy: 0, hp: -0.1 } }])} face={faceAt(t, [{ at: t0, f: 'confident' }, { at: pl, f: 'bigSmile' }], 21)} look={EB.agronomo.look} right={<Shovel rotation={[-0.3, 0, 0]} />} />
      <Sparkles t={t} from={pl} n={10} radius={1.6} center={[0, 0.6, -3]} size={0.12} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.4, 4.8], [0, 1.2, -0.6], 32], [te, [0, 3.4, 5.2], [0, 0.8, -2.0], 32], [t1, [0, 3.2, 4.8], [0, 0.8, -2.2], 32]]} />
    </>
  );
};

// 16. "Durante o dia, *guardas* protegem as batatas como se fossem um *tesouro*."
const GUARDA = (x: number, s: number, ry = 0) => P({ x, z: 0.2, ry, rsx: 0.4, rel: -1.2, hp: 0 + s * 0 });
const S16 = ({ t, t0, t1 }: ShotProps) => {
  const g = W(9, 'guardas');
  const te = W(9, 'tesouro');
  return (
    <>
      <CampoBatatas t={t} />
      <PotatoPile n={50} r={0.45} position={[0, 0.08, 0.55]} />
      <Character pose={track(t, GUARDA(-0.8, 1, 0.25), [{ at: g, v: { hy: 0.4 } }, { at: te, v: { hy: -0.3 } }])} face={faceAt(t, [{ at: t0, f: 'confident' }, { at: g, f: 'suspicious' }], 22)} look={EB.guarda1.look} right={<Spear rotation={[-1.2, 0, 0]} />} />
      <Character pose={track(t, GUARDA(0.8, -1, -0.25), [{ at: g, v: { hy: -0.4 } }, { at: te, v: { hy: 0.3 } }])} face={faceAt(t, [{ at: t0, f: 'suspicious' }, { at: g, f: 'confident' }], 23)} look={EB.guarda2.look} right={<Spear rotation={[-1.2, 0, 0]} />} />
      <Sparkles t={t} from={te} n={12} radius={0.55} center={[0, 0.6, 0.55]} size={0.13} />
      {t > te - 0.1 && <pointLight position={[0, 0.7, 0.9]} color="#ffd23a" intensity={2.5} distance={1.6} decay={1.6} />}
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.3, 5.6], [0, 1.3, 0.3], 32], [te, [0, 2.3, 5.2], [0, 1.0, 0.45], 32], [t1, [0, 2.2, 5.0], [0, 0.95, 0.45], 32]]} />
    </>
  );
};

// 17. "Ao ver tanta *vigilância*, você começa a pensar que… deve ter muito *valor*." — Você espiando, moedas.
const S17 = ({ t, t0, t1 }: ShotProps) => {
  const vi = W(10, 'vigilancia');
  const va = W(10, 'valor');
  return (
    <>
      <CampoBatatas t={t} />
      <Character pose={track(t, P({ x: -0.75, z: 0.5, ry: Math.PI, lsx: 1.2, rsx: 1.2, lel: -0.4, rel: -0.4 }), [{ at: vi, v: { hy: 0.4 } }, { at: W(10, 'pensar'), v: { x: 0, ry: Math.PI - 2.6, hy: 0, lsx: 0, lel: 0.15, rsx: 1.0, rel: -2.2 }, dur: 8 }])} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: W(10, 'pensar'), f: 'thinking' }, { at: va, f: 'starstruck', o: ['sparkle'] }], 24)} look={EB.voce.look} />
      <CoinBurst t={t} at={va} n={8} position={[0, 2.4, 0.7]} />
      <Sparkles t={t} from={va} n={9} radius={0.6} center={[0, 2.0, 0.6]} size={0.12} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 2.9, 3.6], [0, 1.0, -1.2], 32], [W(10, 'pensar'), [0.1, 2.0, 4.0], [0, 1.65, 0.5], 32], [t1, [0.05, 2.0, 3.7], [0, 1.7, 0.5], 32]]} />
    </>
  );
};

// 18. "À *noite*, os guardas deixam o campo menos protegido," — guardas sonolentos indo embora.
const S18 = ({ t, t0, t1 }: ShotProps) => {
  const w1 = walkAlong(t, W(11, 'deixam'), t1 + 0.5, [-0.6, 0, 0.6], [-3.4, 0, 1.2]);
  const w2 = walkAlong(t, W(11, 'deixam') + 0.2, t1 + 0.5, [0.6, 0, 0.6], [3.4, 0, 1.2]);
  return (
    <>
      <CampoBatatas t={t} noite />
      <Character pose={P({ x: w1.p[0], z: w1.p[2], ry: -1.3, walk: w1.walk, stride: w1.stride, hp: 0.3, rsx: 0.3, rel: -1.0 })} face={faceAt(t, [{ at: t0, f: 'sleepy' }], 25)} look={EB.guarda1.look} right={<Spear rotation={[-1.2, 0, 0]} />} />
      <Character pose={P({ x: w2.p[0], z: w2.p[2], ry: 1.3, walk: w2.walk, stride: w2.stride, hp: 0.3, rsx: 0.3, rel: -1.0 })} face={faceAt(t, [{ at: t0, f: 'tired' }], 26)} look={EB.guarda2.look} right={<Spear rotation={[-1.2, 0, 0]} />} />
      <Comic t={t} at={W(11, 'noite') + 0.3} text="ZZZ..." position={[0, 2.6, 0.6]} size={0.28} hold={1.2} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.4, 5.6], [0, 1.4, 0], 32], [t1, [0, 2.8, 6.4], [0, 1.3, -0.4], 32]]} />
    </>
  );
};

// 19. "e as pessoas entram para *pegar* algumas batatas." — Você entra agachado e pega.
const S19 = ({ t, t0, t1 }: ShotProps) => {
  const pe = W(11, 'pegar');
  const w = walkAlong(t, t0, pe - 0.4, [-1.6, 0, 0.9], [0, 0, -1.3]);
  const pose = track(t, P({ x: w.p[0], z: w.p[2], ry: lerp(2.6, Math.PI, seg(t, pe - 0.6, pe - 0.3)), walk: w.walk, stride: w.stride * 0.7, squash: 0.25, lean: 0.25 }), [
    { at: pe, v: { rsx: 1.3, rel: -0.4, squash: 0.45, lean: 0.4 }, lead: 0 },
  ]);
  return (
    <>
      <CampoBatatas t={t} noite />
      <PotatoPile n={30} r={0.45} position={[0, 0.08, -1.9]} />
      <Character pose={{ ...pose, x: w.p[0], z: w.p[2] }} face={faceAt(t, [{ at: t0, f: 'nervous', o: ['sweat'] }, { at: pe, f: 'grin' }], 27)} look={EB.voce.look} right={t > pe ? naMao : undefined} />
      <Character pose={P({ x: -2.2, z: 0.3, ry: 0.9, squash: 0.25, lean: 0.25 })} face={faceAt(t, [{ at: 0, f: 'nervous' }], 28)} look={EB.aldea.look} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [w.p[0] - 0.4, 2.0, w.p[2] - 3.4], [w.p[0], 1.0, w.p[2]], 32]]} />
    </>
  );
};

// 20. "A estratégia dá *certo*:" — agrônomo rindo no campo.
const S20 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(12, 'certo');
  return (
    <>
      <CampoBatatas t={t} />
      <Character pose={track(t, P({ z: 0.6, rsx: 0.5, rel: -0.6 }), [{ at: c, v: { rsx: 2.6, rel: -0.1, lsz: 1.3, lel: 0.3, hp: -0.2 } }])} face={faceAt(t, [{ at: t0, f: 'smug' }, { at: c, f: 'laugh' }], 29)} look={EB.agronomo.look} />
      <Comic t={t} at={c} text="DEU CERTO!" position={[0, 2.8, 0.8]} size={0.34} hold={0.9} />
      <Sparkles t={t} from={c} n={9} radius={0.8} center={[0, 1.8, 0.7]} size={0.12} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.1, 4.4], [0, 1.65, 0.6], 32], [t1, [0, 2.1, 3.9], [0, 1.7, 0.6], 32]]} />
    </>
  );
};

// 21. "você leva batatas para *casa*," — Você andando com o saco.
const S21 = ({ t, t0, t1 }: ShotProps) => {
  const w = walkAlong(t, t0, t1 + 0.3, [-1.6, 0, 1.0], [0.9, 0, 1.0]);
  return (
    <>
      <Vila t={t} />
      <Character pose={P({ x: w.p[0], z: w.p[2], ry: Math.PI / 2 - 0.4, walk: w.walk, stride: w.stride, lsx: 0.9, rsx: 0.9, lel: -1.2, rel: -1.2 })} face={faceAt(t, [{ at: t0, f: 'happy' }, { at: W(13, 'casa'), f: 'bigSmile' }], 30)} look={EB.voce.look} />
      <Sack position={[w.p[0] + 0.4, 0.55, w.p[2] + 0.05]} scale={0.8} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [w.p[0] + 0.3, 1.9, w.p[2] + 4.2], [w.p[0] + 0.3, 1.3, w.p[2]], 32]]} />
    </>
  );
};

// 22. "planta mais" — Você na horta.
const S22 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Horta />
    <Character pose={track(t, P({ z: 0.6, ry: 0, squash: 0.35, lean: 0.35, rsx: 1.0, rel: -0.3 }), [{ at: t0 + 0.4, v: { rsx: 1.4, rel: 0 }, lead: 0 }])} face={faceAt(t, [{ at: t0, f: 'content' }], 31)} look={EB.voce.look} right={<Shovel rotation={[-0.3, 0, 0]} />} />
    <Puff t={t} at={t0 + 0.4} position={[0.3, 0.1, 1.3]} color="#8a5a32" size={0.2} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.0, 4.0], [0, 1.0, 0.4], 32], [t1, [0, 1.95, 3.6], [0, 1.0, 0.4], 32]]} />
  </>
);

// 23. "e começa a *comê-las*." — Você comendo batata na mesa.
const S23 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(13, 'comel');
  return (
    <>
      <CasaCamponesa t={t} farta />
      <Character pose={track(t, P({ x: -0.4, z: -1.55, rsx: 0.8, rel: -1.2 }), [{ at: c, v: { rsx: 1.3, rel: -2.3, hp: -0.1 } }])} face={faceAt(t, [{ at: t0, f: 'happy' }, { at: c, f: 'inLove', o: ['blush'] }], 32)} look={EB.voce.look} right={naMao} />
      <Comic t={t} at={c} text="HUMM!" position={[-0.4, 2.4, -1.2]} size={0.28} hold={0.8} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.4, 1.9, 2.6], [-0.4, 1.35, -1.0], 32], [t1, [-0.4, 1.85, 2.2], [-0.4, 1.4, -1.0], 32]]} />
    </>
  );
};

// 24. "Aos poucos, aquilo que muita gente *rejeitava*" — Seu Bento agora come feliz.
const S24 = ({ t, t0, t1 }: ShotProps) => {
  const r = W(14, 'rejeitava');
  return (
    <>
      <Vila t={t} />
      <Character pose={track(t, P({ z: 0.7, rsx: 0.9, rel: -1.2 }), [{ at: r, v: { rsx: 1.4, rel: -2.3 } }])} face={faceAt(t, [{ at: t0, f: 'suspicious' }, { at: r, f: 'laugh' }], 33)} look={EB.aldeao.look} right={naMao} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.9, 3.8], [0, 1.6, 0.7], 32], [t1, [0, 1.9, 3.3], [0, 1.6, 0.7], 32]]} />
    </>
  );
};

// 25. "vira parte da *mesa* francesa." — família na mesa farta.
const S25 = ({ t, t0, t1 }: ShotProps) => {
  const m = W(14, 'mesa');
  return (
    <>
      <CasaCamponesa t={t} farta />
      <Character pose={P({ x: -0.4, z: -1.55, rsx: 0.9, rel: -1.2 })} face={faceAt(t, [{ at: t0, f: 'bigSmile' }], 34)} look={EB.voce.look} right={naMao} />
      <Character pose={P({ x: -1.6, z: -0.9, ry: 0.8 })} face={faceAt(t, [{ at: t0, f: 'happy' }], 35)} look={EB.aldea.look} />
      <Character pose={P({ x: 0.8, z: -0.9, ry: -0.8, rsx: 1.0, rel: -1.4 })} face={faceAt(t, [{ at: t0, f: 'laugh' }], 36)} look={EB.menino.look} right={naMao} />
      <Sparkles t={t} from={m} n={10} radius={1.1} center={[-0.4, 1.4, -0.8]} size={0.12} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.4, 1.9, 3.0], [-0.4, 1.2, -0.9], 32], [m, [-0.4, 2.1, 4.2], [-0.4, 1.25, -0.9], 32], [t1 + 0.6, [-0.4, 2.4, 5.4], [-0.4, 1.3, -0.9], 32]]} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: '01 franca', C: S01 },
  { from: W(0, 'mil'), name: '02 1780', C: S02 },
  { from: W(1, 0), name: '03 faltar', C: S03 },
  { from: W(1, 'e'), name: '04 fome', C: S04 },
  { from: W(2, 0), name: '05 batatas', C: S05 },
  { from: W(3, 0), name: '06 ninguem', C: S06 },
  { from: W(4, 0), name: '07 mal', C: S07 },
  { from: W(4, 7), name: '08 doencas', C: S08 },
  { from: W(5, 0), name: '09 nutritiva', C: S09 },
  { from: W(5, 'mas'), name: '10 acredita', C: S10 },
  { from: W(6, 0), name: '11 rei', C: S11 },
  { from: W(6, 'recebe'), name: '12 missao', C: S12 },
  { from: W(7, 0), name: '13 aceitar', C: S13 },
  { from: W(8, 0), name: '14 corte', C: S14 },
  { from: W(8, 'ele'), name: '15 plantacao', C: S15 },
  { from: W(9, 0), name: '16 guardas', C: S16 },
  { from: W(10, 0), name: '17 valor', C: S17 },
  { from: W(11, 0), name: '18 noite', C: S18 },
  { from: W(11, 'e'), name: '19 pegar', C: S19 },
  { from: W(12, 0), name: '20 certo', C: S20 },
  { from: W(13, 0), name: '21 casa', C: S21 },
  { from: W(13, 'planta'), name: '22 planta', C: S22 },
  { from: W(13, 'e'), name: '23 come', C: S23 },
  { from: W(14, 0), name: '24 rejeitava', C: S24 },
  { from: W(14, 'vira'), name: '25 mesa', C: S25 },
];

// ---------- efeitos sonoros ----------
const END_T = W(14, 'francesa') + 1.2;
export const SFX: Som[] = [
  ...ambiente('passaros', 0, W(1, 0)),
  som('pop', W(0, 'mil') + 0.15),
  som('ronco', W(1, 'faltar'), 0.6),
  ...ambiente('passaros', W(1, 'e'), W(4, 0)),
  som('pop', W(2, 'batatas'), VOL.pop), som('pop', W(2, 'batatas') + 0.25, VOL.pop), som('pop', W(2, 'batatas') + 0.5, VOL.pop),
  som('whoosh', W(4, 0) - 0.1, 0.4),
  ...ambiente('passaros', W(4, 7), W(6, 0)),
  som('ding', W(5, 'nutritiva'), 0.4),
  ...passos(W(5, 'acredita') - 0.4, W(5, 'acredita') + 0.6, 0.3),
  ...passos(W(6, 0), W(6, 'rei'), 0.42),
  som('pop', W(6, 'missao'), VOL.pop),
  som('ding', W(7, 'aceitar'), 0.35),
  ...ambiente('passaros', W(8, 'ele'), W(11, 0)),
  som('pop', W(8, 'plantacao'), VOL.pop),
  som('ding', W(9, 'tesouro'), 0.4),
  som('moeda', W(10, 'valor'), 0.5),
  ...ambiente('grilos', W(11, 0), W(12, 0), 0.2),
  ...passos(W(11, 'deixam'), W(11, 'e'), 0.45),
  ...passos(W(11, 'e'), W(11, 'pegar') - 0.4, 0.5, 0.25),
  som('pop', W(11, 'pegar'), VOL.pop),
  som('ding', W(12, 'certo'), 0.45),
  ...ambiente('passaros', W(12, 0), W(13, 'e')),
  ...passos(W(13, 0), W(13, 'planta'), 0.4),
  som('tum', W(13, 'planta') + 0.4, 0.3),
  ...ambiente('passaros', W(14, 0), W(14, 'vira')),
  som('pop', W(14, 'mesa'), VOL.pop),
  ...ambiente('passaros', W(14, 'vira'), END_T, 0.1),
];
