import { JSX } from 'react';
import { seg, track, V3 } from './anim';
import { Character, faceAt, Pose, REST } from './Character';
import { ASTRO, BreakingSign, Clock, Cockpit, Earth, FloatSign, Floating, Ship, StarStreaks } from './espaco';
import { Titulo } from './hud';
import { IARA, IARA_IDOSA, Lab, LightBolt, Moon, NINO, OrbitTrail, Ready, Space, Sun } from './luz';
import { Calendar, LedCounter, Sparkles } from './props';
import { Cam } from './sets';
import { W } from './timeline';

// ============================================================================
// "What if you traveled at the speed of light?" — elenco esfera.
// Nino ("você", de astronauta na nave), Dra. Iara (a cientista) e Dra. Iara idosa no final.
// Sem legenda, sem música e sem efeitos sonoros: só a voz do usuário.
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element; O?: (p: ShotProps) => JSX.Element; trans?: 'corte' | 'dissolve' | 'flash' | 'preto'; semLegenda?: boolean };

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });
const drift = (t: number, s = 0): V3 => [0.06 * Math.sin(t * 0.7 + s), 0.08 * Math.sin(t * 0.9 + s), 0];
const FLOAT = { lsz: 0.7, rsz: 0.7, lel: 0.5, rel: 0.5 };

// 1. "What if you traveled at the speed of *light?*"
const S01 = ({ t, t0, t1 }: ShotProps) => {
  const li = W(0, 'light');
  const pose = track(t, P(FLOAT), [{ at: W(0, 'traveled'), v: { lsz: 1.3, rsz: 1.3, lel: 0.15, rel: 0.15, lean: 0.2 } }, { at: li, v: { lsx: 2.6, rsx: 2.6, lsz: 0.25, rsz: 0.25, lel: 0, rel: 0, hp: -0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: W(0, 'traveled'), f: 'amazed' }, { at: li, f: 'starstruck', o: ['sparkle'] }], 1);
  const speed = 10 + 40 * seg(t, li - 0.4, t1);
  return (
    <>
      <Space glowPos={[0, 4, -10]} glow="#9fd0ff" />
      <StarStreaks t={t} speed={speed} n={170} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, -0.6, 4.4], [0, 0.1, 0], 32], [t1, [0.1, -0.4, 3.6], [0, 0.2, 0], 32]]} />
      <Floating pose={pose} face={face} position={drift(t)} rotation={[0.15, 0.2, 0.05 * Math.sin(t)]} />
    </>
  );
};
const O01 = ({ t }: ShotProps) => (
  <Titulo t={t} linhas={[{ texto: 'WHAT IF YOU', at: 0.05 }, { texto: 'TRAVELED AT THE', at: W(0, 'traveled') }, { texto: 'SPEED OF LIGHT?', at: W(0, 'speed'), grande: true }]} sai={W(1, 0) - 0.2} />
);

// 2. "Dr. Teo just *finished*" — a cientista no hangar, ao lado da nave pronta.
const S02 = ({ t, t0, t1 }: ShotProps) => {
  const fi = W(1, 'finished');
  const pose = track(t, P({ x: -0.35, ry: 0.0, hy: 0.0 }), [{ at: fi, v: { rsz: 1.4, rsx: 0.6, rel: 0.1, hy: 0.35, hp: -0.05 } }]);
  const face = faceAt(t, [{ at: t0, f: 'thinking' }, { at: fi, f: 'confident' }], 2);
  return (
    <>
      <Lab t={t} />
      <Ship t={0} position={[1.4, 1.05, -3.5]} rotation={[0, -0.6, 0]} scale={1.5} />
      <Ready t={t} at={fi} position={[-0.4, 2.55, 0.1]} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.2, 1.7, 5.4], [0.0, 1.4, -0.8], 34], [t1, [0.0, 1.65, 4.7], [0.0, 1.4, -0.8], 34]]} />
      <Character pose={pose} face={face} look={IARA} />
    </>
  );
};

// 3. "the *fastest* ship in the *world.*" — a nave em destaque.
const S03 = ({ t, t0, t1 }: ShotProps) => {
  const fa = W(1, 'fastest');
  const wo = W(1, 'world');
  return (
    <>
      <Lab t={t} />
      <Ship t={t} position={[0, 1.05, -1.2]} rotation={[0, 0.25 * Math.sin(t * 0.3), 0]} scale={1.5} />
      <FloatSign t={t} at={fa} text="FASTEST SHIP" position={[0, 2.9, -1.2]} w={2.6} h={0.6} />
      <Sparkles t={t} from={wo} n={10} radius={2.0} center={[0, 1.3, -1]} size={0.3} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-4.5, 1.6, 7.5], [0, 1.5, -1.2], 34], [t1, [3.8, 1.8, 7.2], [0, 1.6, -1.2], 34]]} />
    </>
  );
};

// 4. "And *guess* who he picked to fly it?"
const S04 = ({ t, t0, t1 }: ShotProps) => {
  const g = W(2, 'guess');
  const pk = W(2, 'picked');
  const pose = track(t, P({ ry: 0.1 }), [{ at: g, v: { rsx: 2.3, rsz: 0.3, rel: -2.0, hr: 0.15 } }, { at: pk, v: { rsx: 1.5, rsz: 0.1, rel: -0.1, hr: 0, hp: 0.05 } }]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: g, f: 'sideEye' }, { at: pk, f: 'smug' }], 3);
  return (
    <>
      <Lab t={t} />
      <Ship t={0} position={[-1.9, 1.05, -2.5]} rotation={[0, 0.4, 0]} scale={1.5} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 1.6, 4.6], [0, 1.3, 0], 32], [t1, [0.1, 1.6, 3.9], [0, 1.35, 0], 32]]} />
      <Character pose={pose} face={face} look={IARA} />
    </>
  );
};

// 5. "*You.*" — Nino aponta para si mesmo.
const S05 = ({ t, t0, t1 }: ShotProps) => {
  const y = W(3, 'you');
  const pose = track(t, P({ ry: -0.1 }), [{ at: y, v: { rsx: 1.2, rsz: -0.1, rel: -2.3, lsz: 0.9, lel: 0.4, squash: 0.08, hp: -0.1 } }]);
  const face = faceAt(t, [{ at: t0, f: 'surprised' }, { at: y + 0.35, f: 'shocked', o: ['sweat'] }], 4);
  return (
    <>
      <Lab t={t} />
      <Ship t={0} position={[2.0, 1.05, -3]} rotation={[0, -0.4, 0]} scale={1.5} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.1, 1.6, 4.4], [0, 1.3, 0], 30], [t1, [0, 1.6, 3.7], [0, 1.35, 0], 30]]} />
      <Character pose={pose} face={face} look={NINO} />
    </>
  );
};

// 6. "*Light* travels *300,000* kilometers per second." — raio de luz cruzando o espaço + contador.
const S06 = ({ t, t0, t1 }: ShotProps) => {
  const li = W(4, 'light');
  const n = W(4, '300');
  const x = -6 + ((t - t0) * 9) % 12;
  return (
    <>
      <Space glowPos={[0, 0, -8]} glow="#ffe9a0" />
      <LightBolt position={[x, 0.6, -1]} len={4} />
      <LightBolt position={[x - 5, -1.4, -3]} len={4} size={0.25} />
      <LedCounter t={t} from={li} at={n} value={300000} position={[0, 2.2, 0]} scale={0.8} />
      <FloatSign t={t} at={W(4, 'kilometers')} text="KM PER SECOND" position={[0, 1.4, 0]} w={2.2} h={0.45} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.2, 6.5], [0, 1.0, 0], 34], [t1, [0.4, 1.4, 5.6], [0, 1.2, 0], 34]]} />
    </>
  );
};

// 7. "In *one* second, you could circle the *Earth*" — a luz dá voltas na Terra.
const S07 = ({ t, t0, t1 }: ShotProps) => {
  const sev = W(5, 'seven');
  return (
    <>
      <Space glowPos={[-4, 3, 4]} glow="#ffffff" />
      <Earth t={t} position={[0, 0, 0]} r={1.8} />
      <OrbitTrail t={t} from={W(5, 'circle')} at={sev} laps={7} r={2.4} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 1.0, 9.5], [0, 0.4, 0], 34], [t1, [0.6, 1.4, 8.0], [0, 0.6, 0], 34]]} />
    </>
  );
};

// 8. "more than *seven* times." — contador de voltas.
const S08 = ({ t, t0, t1 }: ShotProps) => {
  const sev = W(5, 'seven');
  return (
    <>
      <Space glowPos={[-4, 3, 4]} glow="#ffffff" />
      <Earth t={t} position={[0, -1.4, 0]} r={1.8} />
      <OrbitTrail t={t} from={W(5, 'circle')} at={sev} laps={7} r={2.4} />
      <LedCounter t={t} from={t0} at={sev} value={7} suffix=" LAPS" position={[0, 2.0, 0.5]} scale={0.7} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 0.8, 8.5], [0, 0.4, 0], 34], [t1, [-0.4, 0.9, 7.6], [0, 0.4, 0], 34]]} />
    </>
  );
};

// 9. "You would reach the *Moon* in just over *one* second." — a nave sai da Terra (embaixo) e chega à Lua (em cima).
const S09 = ({ t, t0, t1 }: ShotProps) => {
  const mo = W(6, 'moon');
  const one = W(6, 'one');
  const k = seg(t, t0 + 0.2, one);
  return (
    <>
      <Space glowPos={[-4, 3, 4]} glow="#ffffff" />
      <Earth t={t} position={[0, -3.6, -2]} r={1.7} />
      <Moon t={t} position={[0.2, 3.4, -2]} r={0.8} />
      <Ship t={t} position={[0.1 + 0.3 * Math.sin(k * 3), -1.6 + 4.2 * k, -1]} rotation={[0, 0.4, Math.PI / 2]} scale={0.35} />
      <FloatSign t={t} at={mo} text="MOON" position={[0.2, 4.6, -2]} w={1.3} h={0.42} />
      <FloatSign t={t} at={one} text="1.3 SECONDS" position={[0, 0.2, 0]} w={2.2} h={0.5} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 0, 11.5], [0, 0.2, -1.5], 34], [t1, [-0.4, 0.2, 10.5], [0, 0.4, -1.5], 34]]} />
    </>
  );
};

// 10. "And the *Sun* in *eight* minutes." — a nave voando para o Sol gigante.
const S10 = ({ t, t0, t1 }: ShotProps) => {
  const su = W(7, 'sun');
  const ei = W(7, 'eight');
  return (
    <>
      <Space glowPos={[0, 2, -14]} glow="#ffb23a" />
      <Sun t={t} position={[0, 2.5, -22]} r={5.5} />
      <Ship t={t} position={[0.2, -0.5, -1 - 4 * seg(t, t0, t1 + 0.5)]} rotation={[0, Math.PI / 2, 0.1]} scale={0.6} />
      <LedCounter t={t} from={su} at={ei} value={8} suffix=" MIN" position={[0, -2.2, 0]} scale={0.6} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 0.2, 5.5], [0, 0.6, -6], 36], [t1, [0.2, 0.4, 4.6], [0, 0.8, -8], 36]]} />
    </>
  );
};

// 11. "But here's where it gets *weird.*" — Nino na cabine, desconfiado.
const S11 = ({ t, t0, t1 }: ShotProps) => {
  const we = W(8, 'weird');
  const pose = track(t, P({ ry: 0.2 }), [{ at: we, v: { rsx: 2.2, rsz: 0.3, rel: -2.3, hy: 0.3, hr: -0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: we, f: 'confused' }], 5);
  return (
    <>
      <Space glowPos={[0, 2, -10]} glow="#9fd0ff" />
      <Cockpit />
      <Earth t={t} position={[1, 1.4, -12]} r={1.4} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 1.7, 3.8], [0, 1.4, 0], 32], [t1, [0.1, 1.65, 3.1], [0, 1.45, 0], 32]]} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 12. "The *faster* you go," — a nave dispara, estrelas viram riscos.
const S12 = ({ t, t0, t1 }: ShotProps) => {
  const fa = W(9, 'faster');
  const sp = 12 + 60 * seg(t, fa - 0.3, t1);
  return (
    <>
      <Space glowPos={[0, 0, -8]} glow="#9fd0ff" />
      <group rotation={[0, 0, Math.PI / 2]}>
        <StarStreaks t={t} speed={sp} n={180} />
      </group>
      <Ship t={t * 3} position={[0, 0, 0]} rotation={[0.15, -0.3, 0]} scale={1} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.0, 1.0, 6.5], [0, 0, 0], 34], [t1, [0.6, 0.7, 5.0], [0, 0, 0], 34]]} />
    </>
  );
};

// 13. "the *slower* time passes for you." — relógio da cabine quase parando.
const S13 = ({ t, t0, t1 }: ShotProps) => {
  const sl = W(9, 'slower');
  const clk = (t - t0) * 40 * (1 - 0.95 * seg(t, t0, sl));
  const pose = track(t, P({ ry: -0.4, x: 0.7, hy: -0.5 }), [{ at: sl, v: { hp: 0.1, rsx: 1.4, rsz: 0.2, rel: -0.3 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: sl, f: 'surprised' }], 6);
  return (
    <>
      <Space glowPos={[0, 2, -10]} glow="#9fd0ff" />
      <Cockpit />
      <Clock time={clk} position={[-0.7, 1.9, -1.2]} scale={1.2} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.2, 1.8, 4.2], [0, 1.6, -0.6], 32], [t1, [0, 1.75, 3.5], [0, 1.6, -0.6], 32]]} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 14. "On the *ship,* the trip lasted just a few *minutes.*"
const S14 = ({ t, t0, t1 }: ShotProps) => {
  const mi = W(10, 'minutes');
  const clk = 60 * 5 * seg(t, t0, mi);
  const pose = track(t, P({ ry: 0.15 }), [{ at: W(10, 'ship'), v: { lsz: 1.2, rsz: 1.2, lel: 0.3, rel: 0.3 } }, { at: mi, v: { lsz: 0.2, rsz: 0.2, lel: 0.15, rel: 0.15, rsx: 1.6 } }]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: mi, f: 'confident' }], 7);
  return (
    <>
      <Space glowPos={[0, 2, -10]} glow="#9fd0ff" />
      <Cockpit />
      <Clock time={clk} position={[0.95, 2.1, -1.2]} scale={1.0} />
      <FloatSign t={t} at={mi} text="5 MINUTES" position={[0.95, 1.2, -1.2]} w={1.5} h={0.4} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.6, 1.6, 4.6], [0.3, 1.4, -0.5], 34], [t1, [-0.3, 1.6, 4.0], [0.3, 1.45, -0.5], 34]]} />
      <Character pose={P({ ...pose, x: -0.5 })} face={face} look={ASTRO} />
    </>
  );
};

// 15. "On *Earth,* *years* went by." — Dra. Iara no hangar; o calendário dispara.
const S15 = ({ t, t0, t1 }: ShotProps) => {
  const ye = W(11, 'years');
  const pages = ['2026', '2030', '2035', '2040', '2045', '2050', '2055', '2060', '2066', '+40 YEARS'];
  const pose = track(t, P({ x: -0.6, ry: 0.15, hy: 0.15 }), [{ at: ye, v: { hy: 0.35, hp: -0.05, lsz: 0.8, lel: 0.6 } }]);
  const face = faceAt(t, [{ at: t0, f: 'thinking' }, { at: ye, f: 'worried' }], 8);
  return (
    <>
      <Lab t={t} />
      <Calendar t={t} from={t0} at={ye} pages={pages} position={[0.75, 1.6, 0]} rotation={[0, -0.25, 0]} scale={0.95} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 1.6, 5.0], [0.1, 1.4, 0], 32], [t1, [0.0, 1.55, 4.4], [0.1, 1.45, 0], 32]]} />
      <Character pose={pose} face={face} look={IARA} />
    </>
  );
};

// 16. "You come back *home,*" — a nave pousa no hangar, Nino desce.
const S16 = ({ t, t0, t1 }: ShotProps) => {
  const ho = W(12, 'home');
  const land = seg(t, t0, ho);
  const pose = track(t, P({ x: 1.4, z: 1.2, ry: -0.3 }), [{ at: ho, v: { lsz: 1.3, rsz: 1.3, lel: 0.2, rel: 0.2 } }]);
  const face = faceAt(t, [{ at: t0, f: 'happy' }, { at: ho, f: 'bigSmile' }], 9);
  return (
    <>
      <Lab t={t} />
      <Ship t={t} position={[-0.4, 1.05 + 3 * (1 - land), -1.6]} rotation={[0, 0.3, 0]} scale={1.5} />
      {t > ho - 0.3 && <Character pose={pose} face={face} look={ASTRO} />}
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.6, 2.2, 7.5], [0, 1.8, -1], 34], [t1, [0.8, 1.6, 6.2], [0.4, 1.3, -0.5], 34]]} />
    </>
  );
};

// 17. "and Dr. Teo has *white* *hair.*" — Dra. Iara idosa.
const S17 = ({ t, t0, t1 }: ShotProps) => {
  const wh = W(12, 'white');
  const pose = track(t, P({ ry: 0.15, lean: 0.1 }), [{ at: wh, v: { lsz: 1.0, rsz: 1.0, lel: 0.5, rel: 0.5, hp: 0.05 } }]);
  const face = faceAt(t, [{ at: t0, f: 'content' }, { at: wh, f: 'happy' }], 10);
  return (
    <>
      <Lab t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.1, 1.6, 4.4], [0, 1.35, 0], 30], [t1, [0, 1.6, 3.4], [0, 1.45, 0], 30]]} />
      <Character pose={pose} face={face} look={IARA_IDOSA} />
      <Sparkles t={t} from={wh} n={8} radius={0.7} center={[0, 2.4, 0]} size={0.16} />
    </>
  );
};

// 18. "You traveled to the *future,*" — Nino espantado, com a Dra. Iara idosa de costas.
const S18 = ({ t, t0, t1 }: ShotProps) => {
  const fu = W(13, 'future');
  const pose = track(t, P({ ry: -0.2 }), [{ at: fu, v: { lsz: 1.6, rsz: 1.6, lel: 0.1, rel: 0.1, squash: 0.1, hp: -0.1 } }]);
  const face = faceAt(t, [{ at: t0, f: 'surprised' }, { at: fu, f: 'shocked', o: ['sweat'] }], 11);
  return (
    <>
      <Lab t={t} />
      <Character pose={P({ x: 0.9, z: -1.2, ry: -2.6 })} face={{ f: 'content', blink: 0, o: [] }} look={IARA_IDOSA} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 1.7, 4.4], [0.2, 1.35, -0.4], 32], [t1, [0.1, 1.65, 3.6], [0.1, 1.4, -0.4], 32]]} />
      <Character pose={P({ ...pose, x: -0.4 })} face={face} look={ASTRO} />
    </>
  );
};

// 19. "and there's *no* ticket *back.*" — a placa "TICKET BACK" racha ao meio.
const S19 = ({ t, t0, t1 }: ShotProps) => {
  const bk = W(13, 'back');
  const pose = track(t, P({ ry: 0.2, hp: -0.2, hy: 0.3 }), [{ at: bk, v: { hp: 0.15, hy: 0, lsz: 0.15, rsz: 0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'lookUp' }, { at: bk, f: 'worried' }], 12);
  return (
    <>
      <Lab t={t} />
      <BreakingSign t={t} appear={t0 + 0.15} at={bk} text="TICKET BACK" position={[0, 2.85, 0.3]} w={2.0} h={0.55} fg="#ffd23a" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 1.9, 4.6], [0, 1.8, 0], 32], [t1, [0.1, 1.8, 5.2], [0, 1.6, 0], 32]]} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: '01 speed of light', C: S01, O: O01 },
  { from: W(1, 0), name: '02 finished', C: S02 },
  { from: W(1, 'fastest') - 0.25, name: '03 fastest ship', C: S03 },
  { from: W(2, 0), name: '04 guess', C: S04 },
  { from: W(3, 0), name: '05 you', C: S05, trans: 'flash' },
  { from: W(4, 0), name: '06 300000', C: S06 },
  { from: W(5, 0), name: '07 earth', C: S07 },
  { from: W(5, 'more'), name: '08 seven', C: S08 },
  { from: W(6, 0), name: '09 moon', C: S09 },
  { from: W(7, 0), name: '10 sun', C: S10 },
  { from: W(8, 0), name: '11 weird', C: S11, trans: 'flash' },
  { from: W(9, 0), name: '12 faster', C: S12 },
  { from: W(9, 'slower') - 0.3, name: '13 slower', C: S13 },
  { from: W(10, 0), name: '14 minutes', C: S14 },
  { from: W(11, 0), name: '15 years', C: S15, trans: 'dissolve' },
  { from: W(12, 0), name: '16 home', C: S16 },
  { from: W(12, 'and'), name: '17 white hair', C: S17 },
  { from: W(13, 0), name: '18 future', C: S18 },
  { from: W(13, 'and'), name: '19 no ticket back', C: S19 },
];

// Sem efeitos sonoros: o usuário coloca os dele na edição.
export const SFX: { at: number; file: string; vol: number }[] = [];
