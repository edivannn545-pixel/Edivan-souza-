import { JSX } from 'react';
import { easeOut, seg, track, V3 } from './anim';
import { Character, faceAt, Pose, REST } from './Character';
import {
  Apple, ASTRO, BlackHole, BreakingSign, Clock, Cockpit, Debris, Earth, FloatSign, Floating, Galaxy,
  HorizonRing, LightFall, Ship, Singularity, SpaceLights, Stars, StarStreaks,
} from './espaco';
import { Titulo } from './hud';
import { ESFERAS } from './personagens';
import { Clipboard, Comic, Gauge, Sparkles, UpArrow } from './props';
import { Cam, Stage } from './sets';
import { W } from './timeline';

// ============================================================================
// "What If You Fell Into a Black Hole?" — elenco esfera.
// Nino ("você") de astronauta, Dra. Iara (cientista), Zeca (amigo na nave), Mestre Ono e Lara (cientistas na Terra).
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element; O?: (p: ShotProps) => JSX.Element; trans?: 'corte' | 'dissolve' | 'flash' | 'preto'; semLegenda?: boolean };

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });
const drift = (t: number, s = 0): V3 => [0.06 * Math.sin(t * 0.7 + s), 0.08 * Math.sin(t * 0.9 + s), 0];
const tumble = (t: number, s = 0): V3 => [0.08 * Math.sin(t * 0.5 + s), 0.15 * Math.sin(t * 0.4 + s), 0.12 * Math.sin(t * 0.6 + s)];
const FLOAT = { lsz: 0.7, rsz: 0.7, lel: 0.5, rel: 0.5 };
const IARA = ESFERAS.dra_iara.look;
const ZECA = ESFERAS.zeca.look;
const ONO = ESFERAS.mestre_ono.look;
const LARA = ESFERAS.lara.look;

const Space = ({ bg, glowPos }: { bg?: string; glowPos?: V3 }) => (
  <>
    <SpaceLights bg={bg} glowPos={glowPos} />
    <Stars />
  </>
);

// 1. "If you fell into a *black* *hole*, your body would be *stretched* like a *noodle*."
const S01 = ({ t, t0, t1 }: ShotProps) => {
  const st = W(0, 'stretched');
  const nd = W(0, 'noodle');
  const stretch = 1 + 0.45 * seg(t, st - 0.2, st + 0.25) + 0.45 * seg(t, nd - 0.2, nd + 0.2);
  const pose = track(t, P(FLOAT), [{ at: st, v: { lsz: 1.2, rsz: 1.2, lel: 0.2, rel: 0.2, hp: -0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'amazed' }, { at: W(0, 'black'), f: 'surprised' }, { at: st, f: 'shocked' }, { at: nd, f: 'panic', o: ['sweat'] }], 1);
  return (
    <>
      <Space glowPos={[0, -1, -10]} />
      <BlackHole t={t} position={[0.5, -1.5, -16]} r={4} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 0.2, 4.6], [0, 0.1, 0], 32], [st, [0.2, 0.1, 4.4], [0, 0.1, 0], 32], [t1, [0.1, 0.1, 5.2], [0, 0.1, 0], 32]]} />
      <Floating pose={pose} face={face} position={drift(t)} rotation={tumble(t)} stretch={stretch} />
      <Comic t={t} at={nd} text="NOODLE?!" position={[0.9, -1.0, 0.6]} size={0.42} hold={1.2} />
    </>
  );
};
const O01 = ({ t }: ShotProps) => (
  <Titulo t={t} linhas={[{ texto: 'WHAT IF YOU FELL', at: 0.05 }, { texto: 'INTO A', at: W(0, 'a') }, { texto: 'BLACK HOLE?', at: W(0, 'black'), grande: true }]} sai={W(0, 'stretched') + 0.6} />
);

// 2. "And scientists actually have a *name* for it."
const S02 = ({ t, t0, t1 }: ShotProps) => {
  const nm = W(1, 'name');
  const pose = track(t, P({ ry: 0.15, rsx: 0.5, rel: -0.9, y: 0.3 }), [{ at: nm, v: { lsx: 2.5, lsz: 0.25, lel: -0.15, hp: -0.1, hy: 0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'thinking' }, { at: nm, f: 'smug' }], 2);
  return (
    <>
      <Stage color="#1d2550" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 1.6, 4.8], [0, 1.35, 0], 32], [t1, [0.1, 1.6, 4.1], [0, 1.4, 0], 32]]} />
      <Character pose={pose} face={face} look={IARA} right={<Clipboard text={'?'} position={[0, -0.18, 0.05]} rotation={[0.4, 0, 0]} />} />
      <Sparkles t={t} from={nm} n={8} radius={0.7} center={[-0.4, 2.6, 0.3]} />
    </>
  );
};

// 3. "Let's say you're *floating* in space, and you get too *close*."
const S03 = ({ t, t0, t1 }: ShotProps) => {
  const fl = W(2, 'floating');
  const cl = W(2, 'close');
  const z = 1.5 - 3.5 * seg(t, cl - 0.6, t1 + 0.4);
  const pose = track(t, P(FLOAT), [{ at: fl, v: { lsz: 1.1, rsz: 1.1, lel: 0.3, rel: 0.3 } }, { at: cl, v: { lsz: 0.4, rsz: 0.4, lel: 0.9, rel: 0.9, hp: 0.2 } }]);
  const face = faceAt(t, [{ at: t0, f: 'content' }, { at: cl, f: 'curious' }], 3);
  return (
    <>
      <Space glowPos={[0, -1, -12]} />
      <BlackHole t={t} position={[0, -1.5, -18]} r={4.5} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [3, 1.8, 10], [0, -0.3, -4], 34], [cl, [1.6, 1.0, 6.5], [0, 0, -3], 34], [t1, [1.0, 0.8, 4.5], [0, 0, -3], 34]]} />
      <Floating pose={pose} face={face} position={[drift(t, 1)[0], drift(t, 1)[1], z]} rotation={[0.2 * Math.sin(t * 0.3), t * 0.12, 0.25 * Math.sin(t * 0.25)]} />
    </>
  );
};

// 4. "At first, *nothing* feels wrong."
const S04 = ({ t, t0, t1 }: ShotProps) => {
  const no = W(3, 'nothing');
  const pose = track(t, P(FLOAT), [{ at: no, v: { rsz: 0.35, rsx: 1.3, rel: -1.35, hr: 0.12 } }]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: no, f: 'confident' }], 4);
  return (
    <>
      <Space glowPos={[-2, -1, -9]} />
      <BlackHole t={t} position={[-4, -2, -14]} r={3.2} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.7, 0.6, 3.6], [0, 0.4, 0], 32], [t1, [0.3, 0.55, 3.2], [0, 0.4, 0], 32]]} />
      <Floating pose={pose} face={face} position={drift(t, 2)} rotation={[0, 0.25, 0.05 * Math.sin(t)]} />
    </>
  );
};

// 5. "But a black hole's *gravity* is so strong that *nothing* can escape it."
const S05 = ({ t, t0, t1 }: ShotProps) => {
  const g = W(4, 'gravity');
  const no = W(4, 'nothing');
  return (
    <>
      <Space glowPos={[0, 0, -2]} />
      <BlackHole t={t} position={[0, 0, -3]} r={2.4} spin={2.2} />
      <Debris t={t} from={no - 0.4} center={[0, 0, -3]} n={22} r0={8} />
      <Gauge t={t} from={t0 + 0.1} at={g} value={1} label="GRAVITY" position={[1.0, 2.6, 2.2]} scale={0.8} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.5, 2.4, 9], [0, 0.6, -3], 34], [g, [0.6, 2.4, 7.6], [0.2, 0.8, -2], 34], [t1, [0.2, 1.6, 6.4], [0, 0.4, -3], 34]]} />
    </>
  );
};

// 6. "Not *you*. Not even *light*."
const S06 = ({ t, t0, t1 }: ShotProps) => {
  const y = W(5, 'you');
  const li = W(5, 'light');
  const z = -4.5 * seg(t, t0, t1 + 0.3, (x) => x * x);
  const pose = track(t, P(FLOAT), [{ at: y, v: { lsx: 1.5, rsx: 1.5, lsz: 0.3, rsz: 0.3, lel: -0.2, rel: -0.2, lean: 0.2 } }]);
  const face = faceAt(t, [{ at: t0, f: 'worried' }, { at: y, f: 'scared', o: ['sweat'] }], 5);
  return (
    <>
      <Space glowPos={[0, -0.5, -8]} />
      <BlackHole t={t} position={[0, -0.5, -11]} r={2.6} spin={1.6} />
      <LightFall t={t} from={li - 0.4} center={[0, -0.5, -11]} r0={8} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 0.5, 3.6], [0, 0.3, 0], 32], [li - 0.2, [0.6, 0.8, 2.4], [0, 0.2, -2.5], 32], [t1, [1.6, 2.2, 6], [0, -0.3, -7], 36]]} />
      <Floating pose={pose} face={face} position={[0, 0, z]} rotation={[-0.15, 0, 0.1 * Math.sin(t * 3)]} />
    </>
  );
};

// 7. "As you fall, gravity pulls on your *feet* much harder than your *head*."
const S07 = ({ t, t0, t1 }: ShotProps) => {
  const fe = W(6, 'feet');
  const he = W(6, 'head');
  const yy = -0.8 * seg(t, t0, t1);
  const pose = track(t, P({ lsz: 0.9, rsz: 0.9, lel: 0.3, rel: 0.3 }), [{ at: fe, v: { hp: 0.5, lsz: 1.3, rsz: 1.3 } }, { at: he, v: { hp: -0.2 } }]);
  const face = faceAt(t, [{ at: t0, f: 'worried' }, { at: fe, f: 'shocked' }, { at: he, f: 'confused' }], 6);
  const kf = 1.6 * seg(t, fe - 0.25, fe - 0.05, easeOut);
  const kh = 0.45 * seg(t, he - 0.25, he - 0.05, easeOut);
  return (
    <>
      <Space glowPos={[0, -7, 0]} />
      <BlackHole t={t} position={[0.5, -12, -4]} r={3.5} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [3.6, 0.4, 3.4], [0, -0.3, 0], 34], [t1, [3.2, 0.0, 2.8], [0, -0.6, 0], 34]]} />
      <group position={[0, yy, 0]}>
        <Floating pose={pose} face={face} rotation={[0, 0.9, 0.04 * Math.sin(t * 2)]} />
        <UpArrow k={kf} color="#ff4d3a" position={[0.8, -1.2, 0.4]} rotation={[0, 0.9, Math.PI]} scale={0.9} />
        <UpArrow k={kh} color="#ff9a3a" position={[0.8, 1.6, 0.4]} rotation={[0, 0.9, Math.PI]} scale={0.9} />
      </group>
    </>
  );
};

// 8. "You start to *stretch*. *Longer*. *Thinner*."
const S08 = ({ t, t0, t1 }: ShotProps) => {
  const s1 = W(7, 'stretch');
  const s2 = W(7, 'longer');
  const s3 = W(7, 'thinner');
  const stretch = 1 + 0.5 * seg(t, s1 - 0.25, s1) + 0.6 * seg(t, s2 - 0.25, s2) + 0.8 * seg(t, s3 - 0.25, s3);
  const pose = track(t, P({ lsz: 1.0, rsz: 1.0, lel: 0.2, rel: 0.2 }), [{ at: s1, v: { lsz: 2.6, rsz: 2.6, hp: -0.2 } }, { at: s3, v: { lsz: 0.15, rsz: 0.15, lel: 0, rel: 0 } }]);
  const face = faceAt(t, [{ at: t0, f: 'nervous' }, { at: s1, f: 'panic', o: ['sweat'] }, { at: s2, f: 'terrified' }, { at: s3, f: 'dizzy' }], 7);
  return (
    <>
      <Space glowPos={[0, -8, -1]} />
      <BlackHole t={t} position={[0, -14, -6]} r={4} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 0.2, 5.6], [0, 0, 0], 34], [s2, [0.3, 0.2, 7.0], [0, -0.2, 0], 34], [t1, [0.2, 0, 7.8], [0, -0.3, 0], 34]]} />
      <Floating pose={pose} face={face} position={[0, -0.3 * (stretch - 1), 0]} rotation={[0, 0.2, 0.03 * Math.sin(t * 4)]} stretch={stretch} />
    </>
  );
};

// 9. "Scientists call it *spaghettification*."
const S09 = ({ t, t0, t1 }: ShotProps) => {
  const sp = W(8, 'spaghettification');
  const pose = track(t, P({ x: -0.35, ry: 0.3, y: 0.3 }), [{ at: sp, v: { rsz: 2.2, rsx: 0.6, rel: 0.1, lsz: 0.4, hy: 0.25, hp: -0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: sp, f: 'bigSmile' }], 8);
  return (
    <>
      <Stage color="#1d2550" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 2.0, 5.2], [0, 1.8, 0], 32], [t1, [0, 2.0, 4.7], [0, 1.9, 0], 32]]} />
      <Character pose={pose} face={face} look={IARA} />
      <FloatSign t={t} at={sp} text="SPAGHETTIFICATION" position={[0.1, 3.25, -0.3]} w={2.5} h={0.5} />
    </>
  );
};

// 10. "But here's where it gets *weird*."
const S10 = ({ t, t0, t1 }: ShotProps) => {
  const we = W(9, 'weird');
  const pose = track(t, P(FLOAT), [{ at: we, v: { hr: 0.35, hp: 0.1 } }]);
  const face = faceAt(t, [{ at: t0, f: 'suspicious' }, { at: we, f: 'confused' }], 9);
  return (
    <>
      <Space glowPos={[2, -1, -9]} />
      <BlackHole t={t} position={[3, -1, -14]} r={3} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 0.5, 3.6], [0, 0.4, 0], 32, 0], [we, [-0.2, 0.5, 3.3], [0, 0.4, 0], 32, 0.22], [t1, [-0.3, 0.5, 3.1], [0, 0.4, 0], 32, 0.25]]} />
      <Floating pose={pose} face={face} position={drift(t, 3)} rotation={[0, -0.2, 0]} />
      <Comic t={t} at={we} text="WEIRD..." position={[-0.7, -0.9, 0.5]} size={0.35} hold={0.9} />
    </>
  );
};

// 11. "Your *friend* is watching from a" — Zeca na cabine da nave
const S11 = ({ t, t0, t1 }: ShotProps) => {
  const fr = W(10, 'friend');
  const pose = track(t, P({ x: 0.5, ry: -0.35, hy: -0.2 }), [{ at: fr, v: { rsz: 2.6, rel: 0.6, hy: 0.25, hp: -0.05 } }]);
  const face = faceAt(t, [{ at: t0, f: 'happy' }, { at: fr, f: 'bigSmile' }], 10);
  return (
    <>
      <SpaceLights glowPos={[0, 2, -20]} />
      <Stars />
      <BlackHole t={t} position={[-0.5, 2.2, -32]} r={3.2} />
      <Cockpit />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.0, 1.6, 4.2], [0.2, 1.4, -0.5], 34], [t1, [0.6, 1.5, 3.7], [0.3, 1.35, -0.5], 34]]} />
      <Character pose={pose} face={face} look={ZECA} />
    </>
  );
};

// 12. "*spaceship* far away." — a nave por fora, recuando
const S12 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <SpaceLights glowPos={[-6, -1, -30]} />
    <Stars />
    <BlackHole t={t} position={[-9, -2, -45]} r={7} />
    <Ship t={t} position={[0.3, 0.2 + 0.1 * Math.sin(t), 0]} rotation={[0.1, 0.5, 0.05]} scale={0.9} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.4, 0.8, 4.2], [0, 0.1, 0], 34], [t1, [3.0, 2.0, 10], [-2, -0.2, -10], 36]]} />
  </>
);

// 13. "To them, you *never* actually fall in." — Zeca olha pela janela; você, pequeno, parado na borda
const S13 = ({ t, t0, t1 }: ShotProps) => {
  const nv = W(11, 'never');
  const pose = track(t, P({ x: 1.1, z: 0.4, ry: -0.6, hy: -0.7, hp: -0.1 }), [{ at: nv, v: { hy: 0.45, rsz: 0.9, rel: 1.2, lsz: 0.9, lel: 1.2 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: nv, f: 'confused' }], 11);
  return (
    <>
      <SpaceLights glowPos={[0, 2, -20]} />
      <Stars />
      <BlackHole t={t} position={[-0.5, 2.0, -30]} r={3.8} />
      <Floating pose={P(FLOAT)} face={faceAt(t, [{ at: t0, f: 'scared' }], 3)} position={[0.6, 2.4, -24.5]} rotation={[0, 0, 0.3]} scale={0.35} />
      <Cockpit />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.6, 1.8, 4.4], [0.2, 1.8, -3], 34], [t1, [-0.4, 1.8, 3.8], [0.3, 1.7, -3], 34]]} />
      <Character pose={pose} face={face} look={ZECA} />
    </>
  );
};

// Relógio que desacelera até parar em `stop`.
const slowTime = (t: number, t0: number, stop: number) => 60 * (1 - Math.exp(-(Math.min(t, stop) - t0) * 0.9));
const FROZEN = (fz: number) => track(fz, P(FLOAT), [{ at: W(12, 'slow'), v: { lsz: 1.4, rsz: 1.2, lel: 0.1, hp: -0.1 } }, { at: fz, v: { lsx: 0.6, rsx: 0.9, hr: 0.2 }, dur: 3 }]);

// 14. "You *slow* down. You *freeze* at the edge."
const S14 = ({ t, t0, t1 }: ShotProps) => {
  const fz = W(12, 'freeze');
  const T = Math.min(t, fz);
  const spin = 0.9 * (1 - Math.exp(-(T - t0) * 1.0));
  const face = faceAt(T, [{ at: t0, f: 'scared' }, { at: fz, f: 'terrified' }], 12);
  return (
    <>
      <Space glowPos={[0, 0, -4]} />
      <BlackHole t={T} position={[0, -0.4, -7]} r={4.2} spin={0.6} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.0, 0.6, 5.2], [0, 0.1, 0], 34], [t1, [0.6, 0.5, 4.4], [0.1, 0.1, 0], 34]]} />
      <Floating pose={FROZEN(T)} face={face} position={[-0.3, 0, 0]} rotation={[0.2, 0.3, spin]} />
      <Clock time={slowTime(t, t0, fz)} position={[1.2, 1.2, 0.2]} scale={0.55} rotation={[0, -0.25, 0]} />
    </>
  );
};

// 15. "And your image slowly fades into *red*, until it *disappears*."
const S15 = ({ t, t0, t1 }: ShotProps) => {
  const rd = W(13, 'red');
  const ds = W(13, 'disappears');
  const fz = W(12, 'freeze');
  const red = seg(t, t0 + 0.3, rd);
  const gone = 1 - seg(t, ds - 0.1, ds + 0.6);
  const spin = 0.9 * (1 - Math.exp(-(fz - W(12, 0)) * 1.0));
  return (
    <>
      <Space glowPos={[0, 0, -4]} />
      <BlackHole t={fz + (t - t0) * 0.1} position={[0, -0.4, -7]} r={4.2} spin={0.6} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.6, 0.5, 4.4], [0.1, 0.1, 0], 34], [ds, [0.4, 0.5, 3.6], [0.1, 0.1, 0], 34], [t1, [0.8, 0.9, 6.5], [0, 0, -2], 34]]} />
      {gone > 0.01 && <Floating pose={FROZEN(fz)} face={faceAt(fz, [{ at: fz, f: 'terrified' }], 12)} position={[-0.3, 0, 0]} rotation={[0.2, 0.3, spin]} red={red} scale={gone} />}
      {gone > 0.01 && <Clock time={slowTime(fz, W(12, 0), fz)} position={[1.2, 1.2, 0.2]} scale={0.55 * gone} rotation={[0, -0.25, 0]} />}
    </>
  );
};

// 16. "For you, though, time feels completely *normal*."
const S16 = ({ t, t0, t1 }: ShotProps) => {
  const tm = W(14, 'time');
  const nr = W(14, 'normal');
  const pose = track(t, P(FLOAT), [{ at: tm, v: { lsx: 1.35, lsz: 0.55, lel: -1.5, hp: 0.3, hy: -0.3 } }, { at: nr, v: { hp: 0, hy: 0.1, rsz: 0.35, rsx: 1.3, rel: -1.35 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: tm, f: 'lookDown' }, { at: nr, f: 'content' }], 13);
  return (
    <>
      <Space glowPos={[0, -2, -8]} />
      <BlackHole t={t} position={[1, -2.5, -12]} r={3} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.5, 0.6, 3.6], [0, 0.3, 0], 32], [t1, [-0.2, 0.5, 3.1], [0.1, 0.3, 0], 32]]} />
      <Floating pose={pose} face={face} position={drift(t, 4)} rotation={[0, 0.15, 0]} />
      <Clock time={(t - t0) * 8} position={[-1.1, 1.1, 0.3]} scale={0.5} rotation={[0, 0.3, 0]} />
    </>
  );
};

// 17. "You keep *falling*."
const S17 = ({ t, t0, t1 }: ShotProps) => {
  const fa = W(15, 'falling');
  const pose = track(t, P({ lsz: 1.6, rsz: 1.6, lel: 0.4, rel: 0.4 }), [{ at: fa, v: { lsz: 2.4, rsz: 2.4, hp: 0.35 } }]);
  const face = faceAt(t, [{ at: t0, f: 'worried' }, { at: fa, f: 'anxious', o: ['sweat'] }], 14);
  return (
    <>
      <SpaceLights glowPos={[0, -6, 0]} />
      <StarStreaks t={t} speed={16} />
      <BlackHole t={t} position={[0, -16, -3]} r={4} glow={1.4} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 1.0, 4.2], [0, 0, 0], 34, 0.1], [t1, [0.1, 1.4, 3.6], [0, -0.1, 0], 34, -0.1]]} />
      <Floating pose={pose} face={face} rotation={[0.35, t * 0.3, 0.1 * Math.sin(t * 2)]} />
    </>
  );
};

// 18. "You cross the *event* *horizon*, the point of *no* *return*."
const S18 = ({ t, t0, t1 }: ShotProps) => {
  const ev = W(16, 'event');
  const no = W(16, 'no');
  const ry = -3.2 + 5.4 * seg(t, t0, W(16, 'return') + 0.2);
  const pose = track(t, P({ lsz: 1.5, rsz: 1.5, lel: 0.4, rel: 0.4 }), [{ at: ev, v: { hp: 0.4 } }, { at: no, v: { hp: -0.3, lsx: 1.2, rsx: 1.2, lsz: 0.4, rsz: 0.4 } }]);
  const face = faceAt(t, [{ at: t0, f: 'nervous' }, { at: ev, f: 'scared' }, { at: no, f: 'terrified', o: ['sweat3'] }], 15);
  return (
    <>
      <SpaceLights bg="#0a0508" glowPos={[0, -4, 0]} />
      <Stars />
      <StarStreaks t={t} speed={8} />
      <HorizonRing t={t} position={[0, ry, 0]} r={2.4} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 1.2, 6.2], [0, -0.1, 0], 34], [t1, [0.1, 0.7, 5.4], [0, 0.2, 0], 34]]} />
      <Floating pose={pose} face={face} rotation={[0.1, 0.2, 0.05 * Math.sin(t * 2)]} />
      {t < no - 0.1 && <FloatSign t={t} at={ev} text="EVENT HORIZON" position={[0, -2.4, 0.8]} w={2.4} h={0.5} />}
      <FloatSign t={t} at={no} text="NO RETURN" position={[0, 2.2, 0.6]} w={2.0} h={0.5} bg="#2a0808" fg="#ff4d3a" />
    </>
  );
};

// 19. "From here, there is *no* way *back*."
const S19 = ({ t, t0, t1 }: ShotProps) => {
  const bk = W(17, 'back');
  const k = 1 - 0.75 * seg(t, t0, t1 + 0.5);
  const pose = track(t, P({ lsz: 0.6, rsz: 0.6 }), [{ at: W(17, 'no'), v: { hp: -0.45, rsx: 2.6, rsz: 0.3, rel: 0 } }, { at: bk, v: { lsx: 2.6, lsz: 0.3, lel: 0 } }]);
  const face = faceAt(t, [{ at: t0, f: 'worried' }, { at: bk, f: 'worried', o: ['tears'] }], 16);
  return (
    <>
      <SpaceLights bg="#0a0508" glowPos={[0, 4, 0]} />
      <Stars />
      <HorizonRing t={t} position={[0, 2.8 + 3 * seg(t, t0, t1 + 0.5), -1]} r={2.4} k={k} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, -1.4, 3.6], [0, 0.6, 0], 36], [t1, [0.2, -1.6, 3.2], [0, 0.8, 0], 36]]} />
      <Floating pose={pose} face={face} position={[0, -0.3 * seg(t, t0, t1), 0]} rotation={[0, 0, 0.05 * Math.sin(t)]} />
    </>
  );
};

// 20. "Every *direction* now points to one place, the *center*."
const S20 = ({ t, t0, t1 }: ShotProps) => {
  const dr = W(18, 'direction');
  const ce = W(18, 'center');
  const C: V3 = [0, 0.3, -5];
  const pose = track(t, P({ ...FLOAT, ry: -0.6 }), [{ at: dr, v: { hy: -0.5, rsx: 1.5, rsz: 0.2, rel: 0 } }]);
  const face = faceAt(t, [{ at: t0, f: 'lookUp' }, { at: dr, f: 'amazed' }, { at: ce, f: 'shocked' }], 17);
  return (
    <>
      <SpaceLights bg="#08040c" glowPos={C} />
      <Stars />
      <Singularity t={t} from={ce} position={C} size={0.35 + 0.25 * seg(t, ce - 0.3, ce + 0.3)} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const R = 2.6;
        const x = Math.cos(a) * R;
        const y = Math.sin(a) * R;
        const k = seg(t, dr - 0.3 + i * 0.05, dr + i * 0.05, easeOut);
        return <UpArrow key={i} k={k} color={i % 2 ? '#ffd23a' : '#ff8a2a'} position={[C[0] + x, C[1] + y, C[2] + 0.5]} rotation={[0, 0, Math.atan2(x, -y)]} scale={0.8} />;
      })}
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [2.2, 0.8, 4.2], [0.3, 0.2, -2.5], 36], [t1, [1.8, 0.7, 3.4], [0.2, 0.3, -3], 36]]} />
      <Floating pose={pose} face={face} position={[1.3, -0.4, 0.6]} rotation={[0, 0, 0.04 * Math.sin(t)]} scale={0.8} />
    </>
  );
};

// 21. "Now, if you picked a *giant* black hole, like the one at the center of our"
const S21 = ({ t, t0, t1 }: ShotProps) => {
  const gi = W(19, 'giant');
  const pose = track(t, P(FLOAT), [{ at: gi, v: { lsz: 2.2, rsz: 2.2, lel: 0.1, rel: 0.1, hp: -0.2 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: gi, f: 'amazed', o: ['sparkle'] }], 18);
  return (
    <>
      <Space glowPos={[0, 0, -20]} />
      <BlackHole t={t} position={[0, 2, -48]} r={11} spin={0.4} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 0.3, 3.6], [0, 0.4, 0], 34], [gi, [0.6, -0.4, 5.4], [0, 1.4, -6], 34], [t1, [0.4, -0.8, 6.6], [0, 1.8, -10], 36]]} />
      <Floating pose={pose} face={face} position={drift(t, 5)} rotation={[0, 0.3, 0]} />
    </>
  );
};

// 22. "*galaxy*, things would be different." — a galáxia inteira
const S22 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <SpaceLights bg="#03030a" />
    <Stars />
    <Galaxy t={t} r={32} />
    <BlackHole t={t} r={1.6} glow={0.7} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 6, 20], [0, 0, 0], 40], [t1, [6, 24, 44], [0, 0, 0], 40]]} />
  </>
);

// 23. "Its edge is so *big* that you could cross it without feeling a *thing*."
const S23 = ({ t, t0, t1 }: ShotProps) => {
  const bg = W(20, 'big');
  const th = W(20, 'thing');
  const pose = track(t, P(FLOAT), [{ at: bg, v: { lsz: 2.4, rsz: 2.4, lel: 0, rel: 0 } }, { at: th, v: { lsz: 0.9, rsz: 0.9, lel: 1.7, rel: 1.7, hr: 0.2 } }]);
  const face = faceAt(t, [{ at: t0, f: 'amazed' }, { at: th, f: 'closedSmile' }], 19);
  return (
    <>
      <Space glowPos={[0, -10, -10]} />
      <BlackHole t={t} position={[0, -66, -22]} r={60} spin={0.1} glow={0.5} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [2.5, 3.0, 10], [0, -1.5, -6], 36], [th, [1.0, 0.8, 5.0], [0, -0.1, -1], 34], [t1, [0.7, 0.6, 4.2], [0, 0.1, 0], 34]]} />
      <Floating pose={pose} face={face} position={drift(t, 6)} rotation={[0, 0.25, 0.05 * Math.sin(t)]} />
    </>
  );
};

// 24. "At least, at *first*."
const S24 = ({ t, t0, t1 }: ShotProps) => {
  const fi = W(21, 'first');
  const pose = track(t, P(FLOAT), [{ at: fi, v: { hy: 0.5, hp: 0.15, lsz: 0.4, rsz: 0.4 } }]);
  const face = faceAt(t, [{ at: t0, f: 'closedSmile' }, { at: fi, f: 'worried', o: ['sweat'] }], 20);
  return (
    <>
      <Space glowPos={[0, -3, -6]} />
      <BlackHole t={t} position={[-1, -4, -10]} r={3} glow={1.2} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 0.5, 3.4], [0, 0.4, 0], 32], [t1, [0, 0.5, 2.8], [0, 0.45, 0], 32]]} />
      <Floating pose={pose} face={face} position={drift(t, 7)} />
    </>
  );
};

// 25. "But eventually, you reach the *center*."
const S25 = ({ t, t0, t1 }: ShotProps) => {
  const ce = W(22, 'center');
  const pose = track(t, P({ lsz: 1.4, rsz: 1.4, lel: 0.3, rel: 0.3 }), [{ at: ce, v: { lsx: 1.6, rsx: 1.6, lsz: 0.3, rsz: 0.3, lel: -0.2, rel: -0.2, hp: -0.1 } }]);
  const face = faceAt(t, [{ at: t0, f: 'nervous' }, { at: ce, f: 'shocked' }], 21);
  return (
    <>
      <SpaceLights bg="#07030a" glowPos={[0, 0, -6]} />
      <StarStreaks t={t} speed={24} center={[0, 0, -2]} />
      <Singularity t={t} from={ce} position={[0, 0.4, -8 + 3 * seg(t, t0, t1)]} size={0.6} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.4, 0.7, 3.4], [0, 0.2, -2], 34], [t1, [0.9, 0.6, 2.8], [0, 0.2, -2.5], 34]]} />
      <Floating pose={pose} face={face} rotation={[0, -0.5, 0.05 * Math.sin(t * 3)]} />
    </>
  );
};

// 26. "The *singularity*."
const S26 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <SpaceLights bg="#06030a" glowPos={[0, 0, -3]} />
    <Stars />
    <Singularity t={t} from={W(23, 'singularity')} position={[0, 0.2, -4]} size={1.1} />
    <Floating pose={P({ lsz: 2.2, rsz: 2.2, lel: 0, rel: 0 })} face={faceAt(t, [{ at: t0, f: 'amazed' }], 22)} position={[0.5, -0.8, 0]} rotation={[0, Math.PI, 0]} scale={0.7} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.6, 0.1, 5.0], [0, 0, -2], 36], [t1, [0.3, 0.0, 4.0], [0, 0, -2.5], 36]]} />
  </>
);

// 27. "A place where our *laws* of physics simply *break* down."
const S27 = ({ t, t0, t1 }: ShotProps) => {
  const la = W(24, 'laws');
  const br = W(24, 'break');
  const fall = seg(t, br, t1 + 0.5);
  return (
    <>
      <SpaceLights bg="#0b0614" glowPos={[0, 0, -4]} />
      <Stars />
      <Singularity t={t} from={t0} position={[0, 0.5, -7]} size={0.8} />
      <BreakingSign t={t} appear={la} at={br} text="E = mc²" position={[-0.5, 1.9, 0]} />
      <BreakingSign t={t} appear={la + 0.15} at={br + 0.1} text="F = ma" position={[0.6, 0.9, 0.2]} fg="#ffd23a" />
      <BreakingSign t={t} appear={la + 0.3} at={br + 0.2} text="1 + 1 = 2" position={[-0.4, -0.1, 0.1]} fg="#7dff9a" />
      <Apple position={[1.0, -0.9 + 1.6 * fall, 0.4]} rotation={[0, t, 0.5 * fall]} scale={1.2} />
      <Clock time={-(t - t0) * 40} position={[-1.1, -1.0, 0]} scale={0.55} rotation={[0.2, 0.4, fall]} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 0.5, 5.6], [0, 0.4, 0], 36], [t1, [-0.4, 0.4, 5.0], [0, 0.4, 0], 36]]} />
    </>
  );
};

// 28. "What happens there? *Nobody* *knows*." — Dra. Iara e Mestre Ono dão de ombros
const S28 = ({ t, t0, t1 }: ShotProps) => {
  const nb = W(25, 'nobody');
  const kn = W(25, 'knows');
  const shrug = { lsz: 0.9, rsz: 0.9, lel: 1.7, rel: 1.7, hr: 0.18 };
  const p1 = track(t, P({ x: -0.8, ry: 0.25, y: 0.3 }), [{ at: nb, v: shrug }]);
  const p2 = track(t, P({ x: 0.8, ry: -0.25, y: 0.3 }), [{ at: kn, v: { ...shrug, hr: -0.18 } }]);
  return (
    <>
      <Stage color="#1d2550" pedestal={false} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.9, 6.0], [0, 1.5, 0], 32], [t1, [0, 1.8, 5.3], [0, 1.5, 0], 32]]} />
      <Character pose={p1} face={faceAt(t, [{ at: t0, f: 'thinking' }, { at: nb, f: 'confused' }], 23)} look={IARA} />
      <Character pose={p2} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: kn, f: 'unsure' }], 24)} look={ONO} />
      <Comic t={t} at={kn} text="???" position={[0, 3.3, 0.3]} size={0.5} hold={1.2} />
    </>
  );
};

// 29. "Not even the *smartest* scientists on *Earth*." — Iara, Ono e Lara em cima da Terra
const S29 = ({ t, t0, t1 }: ShotProps) => {
  const sm = W(26, 'smartest');
  const ea = W(26, 'earth');
  const R = 3;
  const cast = [ONO, IARA, LARA];
  return (
    <>
      <SpaceLights glowPos={[6, 4, -10]} />
      <Stars />
      <Earth t={t} position={[0, -R, 0]} r={R} />
      {cast.map((look, i) => {
        const a = (i - 1) * 0.45;
        const pose = track(t, P({ ry: -a * 0.5 }), [{ at: sm + i * 0.08, v: { rsx: 2.5, rsz: 0.5, rel: -1.9, hr: 0.15 * (i - 1) } }]);
        return (
          <group key={i} position={[Math.sin(a) * R, -R + Math.cos(a) * R, 0]} rotation={[0, 0, -a]}>
            <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'thinking' }, { at: sm + i * 0.08, f: i === 1 ? 'confused' : 'unsure' }], 30 + i)} look={look} />
          </group>
        );
      })}
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.5, 5.6], [0, 1.1, 0], 34], [ea, [0, 1.2, 9], [0, -0.5, 0], 36], [t1, [0, 1.2, 12], [0, -1.2, 0], 38]]} />
    </>
  );
};

// Em cima da nave, na beirada, olhando o buraco negro.
const Ledge = ({ t }: { t: number }) => (
  <>
    <SpaceLights glowPos={[0, -2, -10]} />
    <Stars />
    <BlackHole t={t} position={[0, -3, -16]} r={4.5} />
    <Ship t={t} position={[0.6, -1.05, 0.3]} scale={1.5} />
  </>
);

// 30. "So, here's the *question*."
const S30 = ({ t, t0, t1 }: ShotProps) => {
  const q = W(27, 'question');
  const pose = track(t, P({ ry: -0.4 }), [{ at: q, v: { rsx: 2.2, rsz: 0.3, rel: -2.2, hy: -0.25, hp: 0.1 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: q, f: 'thinking' }], 25);
  return (
    <>
      <Ledge t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.6, 1.8, 4.4], [0, 1.3, -1], 34], [t1, [1.2, 1.7, 3.9], [0, 1.4, -1], 34]]} />
      <Character pose={pose} face={face} look={ASTRO} />
      <Comic t={t} at={q} text="?" position={[-0.8, 3.0, 0.2]} size={0.4} hold={1.0} />
    </>
  );
};

// 31. "If you could *jump* into a black hole and finally learn the *answer*,"
const S31 = ({ t, t0, t1 }: ShotProps) => {
  const ju = W(28, 'jump');
  const an = W(28, 'answer');
  const pose = track(t, P({ ry: Math.PI - 0.4 }), [{ at: ju, v: { squash: 0.55, lean: 0.35, lsz: 0.5, rsz: 0.5, lsx: -0.6, rsx: -0.6 } }, { at: an, v: { squash: 0.2, hy: -0.6, hp: -0.1 } }]);
  const face = faceAt(t, [{ at: t0, f: 'confident' }, { at: an, f: 'starstruck', o: ['sparkle'] }], 26);
  return (
    <>
      <Ledge t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [2.0, 1.7, 2.6], [-0.2, 0.9, -1.2], 36], [t1, [1.7, 1.5, 2.1], [-0.2, 0.8, -1.5], 36]]} />
      <Character pose={pose} face={face} look={ASTRO} />
      <Sparkles t={t} from={an} n={10} radius={2.5} center={[0, -2.5, -15]} size={0.6} />
    </>
  );
};

// 32. "but never come *back*, would you *do* it?"
const S32 = ({ t, t0, t1 }: ShotProps) => {
  const bk = W(29, 'back');
  const d = W(29, 'do');
  const pose = track(t, P({ ry: 0.2 }), [{ at: bk, v: { hy: 0.15, hp: 0.15 } }, { at: d, v: { rsx: 1.5, rsz: 0.2, rel: -0.2, hr: 0.18, hp: -0.05 } }]);
  const face = faceAt(t, [{ at: t0, f: 'unsure' }, { at: bk, f: 'worried' }, { at: d, f: 'smug' }], 27);
  return (
    <>
      <Ledge t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 1.9, 3.6], [0, 1.65, 0], 32], [t1, [0.1, 1.8, 3.0], [0, 1.65, 0], 32]]} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 33. "*Comment* below."
const S33 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(30, 'comment');
  const pose = track(t, P({ ry: 0.1 }), [{ at: c, v: { rsx: 0.5, rsz: 0.15, rel: 0, hp: 0.3, lsz: 0.6, lel: 0.8 } }]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: c, f: 'bigSmile' }], 28);
  return (
    <>
      <Ledge t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 1.7, 4.2], [0, 1.3, 0], 32], [t1, [0.1, 1.6, 4.6], [0, 1.2, 0], 32]]} />
      <Character pose={pose} face={face} look={ASTRO} />
      <Comic t={t} at={c} text="COMMENT!" position={[0, 0.45, 0.9]} size={0.6} hold={3} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: '01 noodle', C: S01, O: O01 },
  { from: W(1, 0), name: '02 name', C: S02 },
  { from: W(2, 0), name: '03 floating', C: S03, trans: 'dissolve' },
  { from: W(3, 0), name: '04 nothing', C: S04 },
  { from: W(4, 0), name: '05 gravity', C: S05, trans: 'flash' },
  { from: W(5, 0), name: '06 light', C: S06 },
  { from: W(6, 0), name: '07 feet', C: S07 },
  { from: W(7, 0), name: '08 stretch', C: S08 },
  { from: W(8, 0), name: '09 spaghetti', C: S09 },
  { from: W(9, 0), name: '10 weird', C: S10, trans: 'flash' },
  { from: W(10, 0), name: '11 friend', C: S11 },
  { from: W(10, 'spaceship'), name: '12 spaceship', C: S12 },
  { from: W(11, 0), name: '13 never', C: S13 },
  { from: W(12, 0), name: '14 freeze', C: S14 },
  { from: W(13, 0), name: '15 red', C: S15 },
  { from: W(14, 0), name: '16 normal', C: S16, trans: 'dissolve' },
  { from: W(15, 0), name: '17 falling', C: S17 },
  { from: W(16, 0), name: '18 horizon', C: S18 },
  { from: W(17, 0), name: '19 back', C: S19 },
  { from: W(18, 0), name: '20 center', C: S20 },
  { from: W(19, 0), name: '21 giant', C: S21, trans: 'flash' },
  { from: W(19, 'galaxy'), name: '22 galaxy', C: S22, trans: 'dissolve' },
  { from: W(20, 0), name: '23 big', C: S23 },
  { from: W(21, 0), name: '24 first', C: S24 },
  { from: W(22, 0), name: '25 reach', C: S25 },
  { from: W(23, 0), name: '26 singularity', C: S26, trans: 'flash' },
  { from: W(24, 0), name: '27 laws', C: S27 },
  { from: W(25, 0), name: '28 nobody', C: S28 },
  { from: W(26, 0), name: '29 earth', C: S29 },
  { from: W(27, 0), name: '30 question', C: S30, trans: 'dissolve' },
  { from: W(28, 0), name: '31 jump', C: S31 },
  { from: W(29, 0), name: '32 back', C: S32 },
  { from: W(30, 0), name: '33 comment', C: S33 },
];

// Efeitos sonoros (public/sfx/), ancorados nas palavras.
// Sem efeitos sonoros: o usuário coloca os dele na edição.
export const SFX: { at: number; file: string; vol: number }[] = [];
