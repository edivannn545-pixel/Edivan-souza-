import { JSX } from 'react';
import { clamp01, lerp, seg, track, V3 } from './anim';
import { Character, faceAt, Pose, REST } from './Character';
import {
  AlertSign, Anemometer, TUB_S, BENTO, Boat, BrazilMap, brXZ, Buoy, CIENTISTA, Drop, DryLand, Duck, Fire, MAP_D, mapXZ, Net,
  PacificMap, PAULA_EN, Pin, TubRoom, PESCADOR, pop, RainCloud, Screen, SeaScene, SkyStage, Sun, Thermometer, Tub, Umbrella, WATER_Y,
} from './elnino';
import { Comic, Puff, Sign, Sparkles } from './props';
import { Box, Cam, Room, Street } from './sets';
import { W } from './timeline';

// ============================================================================
// "EL NIÑO: A BANHEIRA DO PACÍFICO" — tomadas do STORYBOARD.md, ancoradas em palavras com W(linha, 'palavra').
// Versões anteriores: historias/pachinko/ e historias/escritorio/.
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element };

export const SFX: { at: number; file: string; vol: number }[] = [];

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });
const k01 = (t: number, a: number, b: number) => seg(t, a, b);

// Estado da banheira ao longo do filme (função pura do tempo).
const tubState = (t: number) => {
  const ventoOn = k01(t, W(1, 'ventos') - 0.4, W(1, 'ventos'));
  const ventoOff = k01(t, W(4, 'enfraquecem') - 0.6, W(4, 'enfraquecem'));
  const quenteOeste = k01(t, W(1, 'quente') - 0.3, W(1, 'levando'));
  const volta = k01(t, W(5, 'desloca') - 0.8, W(5, 'desloca') + 0.6);
  const fria = k01(t, W(2, 'fria') - 0.4, W(2, 'fria') + 0.3) * (1 - k01(t, W(6, 'menos'), W(6, 'subindo') + 0.5));
  const peixe = k01(t, W(3, 'peixes') - 0.3, W(3, 'peixes')) * (1 - k01(t, W(6, 'desaparecer') - 0.25, W(6, 'desaparecer')));
  const nutri = k01(t, W(3, 'nutrientes') - 0.3, W(3, 'nutrientes')) * (1 - k01(t, W(6, 'menos'), W(6, 'subindo') + 0.5));
  const warm = lerp(lerp(0.75, 0, quenteOeste), 0.95, volta);
  return { warm, wind: ventoOn * (1 - 0.85 * ventoOff), upwell: fria, fish: peixe, nutri, peru: t < W(2, 'peru') - 0.2 ? 1 : 1 };
};

// 01. "Imagine o oceano *Pacífico* como uma imensa *banheira*."
const S01 = ({ t, t0, t1 }: ShotProps) => {
  const pa = W(0, 'pacifico');
  const b = W(0, 'banheira');
  const duckY = t < b - 0.4 ? 4 : Math.max(WATER_Y + 0.02, 3.2 - 12 * (t - (b - 0.4)) ** 2) + (t > b ? 0.03 * Math.sin((t - b) * 10) * Math.exp(-(t - b) * 3) : 0);
  const pose = track(t, P({ x: 0, z: 1.5, ry: 0, hy: 0.3, hp: -0.15 }), [
    { at: pa, v: { rsz: 1.4, rel: 0.2, rsx: 0.5, hy: 0.6, hp: -0.1 } },
    { at: b, v: { rsz: 0.12, rsx: 0, lsz: 1.2, lel: 0.3, hy: 0.4 } },
  ]);
  return (
    <>
      <TubRoom />
      <Tub t={t} {...tubState(t)} />
      <Sign text="OCEANO PACÍFICO" w={2.4} h={0.46} position={[0, 1.5, -0.9]} rotation={[-0.5, 0, 0]} scale={pop(t, pa)} bg="#1f4d7a" fg="#ffffff" />
      {t > b - 0.4 && <Duck position={[0.35, duckY, 0.1]} rotation={[0, 0.6, 0]} scale={0.9} />}
      <Puff t={t} at={b} position={[0.35, WATER_Y + 0.08, 0.1]} color="#cfeaff" size={0.25} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: pa, f: 'happy' }, { at: b, f: 'bigSmile' }], 1)} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 7.6, 6.2], [0.3, 0.4, 0.2], 32], [pa, [0.2, 4.6, 6.2], [0.1, 0.8, 0.5], 32], [t1, [0.0, 2.7, 5.6], [0.0, 1.1, 0.8], 32]]} />
    </>
  );
};

// 02. "Normalmente, os *ventos* empurram a água *quente*… para o outro lado do oceano."
const S02 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <TubRoom />
    <Tub t={t} {...tubState(t)} />
    <Comic t={t} at={W(1, 'ventos')} text="FUUU!" position={[0.4, 1.6, 0.2]} size={0.3} hold={0.8} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 6.0, 5.0], [0.3, 0.4, 0.1], 32], [t1, [0.2, 5.6, 4.6], [0.2, 0.4, 0.1], 32]]} />
  </>
);

// 03. "Perto da costa do *Peru*, a água *fria* que vem do fundo sobe até a superfície."
const S03 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <TubRoom />
    <Tub t={t} {...tubState(t)} peru={pop(t, t0 + 0.35)} />
    <Comic t={t} at={W(2, 'fria')} text="BRRR!" position={[0.95, 1.35, 0.4]} size={0.26} hold={0.8} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [2.2, 2.2, 5.0], [2.2, 1.0, 0.0], 32], [W(2, 'peru') + 0.6, [2.2, 2.1, 4.6], [2.2, 1.0, 0.0], 32], [W(2, 'fria'), [1.0, 3.2, 3.0], [0.95, 0.45, 0.0], 32], [t1, [1.0, 3.0, 2.7], [0.95, 0.45, 0.0], 32]]} />
  </>
);

// 04. "Ela traz *nutrientes* e ajuda a manter muitos *peixes*"
const S04 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <TubRoom />
    <Tub t={t} {...tubState(t)} />
    <Sparkles t={t} from={W(3, 'peixes')} n={8} radius={0.45} center={[0.85, 0.8, 0]} size={0.09} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.95, 3.0, 2.7], [0.85, 0.45, 0], 32], [t1, [0.9, 2.8, 2.4], [0.85, 0.45, 0], 32]]} />
  </>
);

// 05. "naquela região." / 09. "…depende da *pesca*…" — Tonhão no barco.
const Pescador = ({ t, t0, t1, cheia, at }: ShotProps & { cheia: boolean; at: number }) => {
  const pose = track(t, P({ x: -0.3, y: 0.38, z: 0.1, ry: 0.5, rsx: 0.6, rsz: 0.6, rel: -0.3 }), [
    { at, v: cheia ? { rsx: 1.3, rsz: 0.9, hy: 0.5, hp: -0.1, lsz: 1.2 } : { rsx: 1.0, rsz: 0.7, hy: 0.6, hp: 0.3, squash: 0.1 } },
  ]);
  const face = faceAt(t, cheia ? [{ at: t0, f: 'happy' }, { at, f: 'laugh' }] : [{ at: t0, f: 'worried' }, { at, f: 'tired', o: ['tears'] }], cheia ? 5 : 9);
  return (
    <>
      <SeaScene t={t} />
      <Boat t={t} position={[0, 0, 0]} rotation={[0, 0.3, 0]} />
      <Character pose={{ ...pose, y: pose.y + 0.04 * Math.sin(t * 2.2) }} face={face} look={PESCADOR} />
      <Net t={t} n={cheia ? 12 : 0} position={[0.4, 1.15 + 0.04 * Math.sin(t * 2.2), 0.6]} />
      {cheia && <Sparkles t={t} from={at} n={6} radius={0.4} center={[0.4, 1.2, 0.6]} size={0.1} />}
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.0, 2.0, 4.8], [-0.1, 1.35, 0.2], 32], [t1, [-0.05, 1.9, 4.3], [-0.1, 1.35, 0.2], 32]]} />
    </>
  );
};
const S05 = (p: ShotProps) => <Pescador {...p} cheia at={W(3, 'regiao')} />;

// 06. "Mas, quando os ventos *enfraquecem*, esse equilíbrio pode *mudar*."
const S06 = ({ t, t0, t1 }: ShotProps) => {
  const e = W(4, 'enfraquecem');
  const k = 1 - 0.9 * seg(t, e - 0.6, e - 0.03);
  return (
    <>
      <TubRoom />
      <Tub t={t} {...tubState(t)} />
      <group position={[0, 1.7, 0.2]}>
        <Box p={[0, 0, -0.03]} s={[1.6, 0.6, 0.06]} c="#2a2a30" />
        <Sign text="VENTO" w={1.0} h={0.2} position={[0, 0.16, 0.01]} bg="#2a2a30" fg="#ffffff" />
        <Box p={[0, -0.1, 0.01]} s={[1.4, 0.2, 0.02]} c="#4a4a52" />
        <Box p={[-0.7 + 0.7 * k, -0.1, 0.03]} s={[1.4 * k, 0.18, 0.02]} c={k > 0.5 ? '#3ab54a' : '#e0262e'} />
      </group>
      <Comic t={t} at={W(4, 'mudar')} text="?!" position={[0.6, 2.2, 0.3]} size={0.28} hold={0.8} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.0, 5.4, 5.4], [0.0, 0.9, 0.2], 32], [t1, [0.0, 5.0, 5.0], [0.0, 0.9, 0.2], 32]]} />
    </>
  );
};

// 07. "A água quente se *desloca*…"
const S07 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <TubRoom />
    <Tub t={t} {...tubState(t)} />
    <Comic t={t} at={W(5, 'desloca')} text="ZUUM!" position={[0.7, 1.4, 0.3]} size={0.28} hold={0.8} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t, [lerp(-1.15, 1.05, tubState(t).warm) * TUB_S, 4.6, 4.4], [lerp(-1.15, 1.05, tubState(t).warm) * TUB_S, 0.4, 0.0], 32]]} />
  </>
);

// 08. "Com menos água fria subindo, os peixes podem *desaparecer* de algumas áreas,"
const S08 = ({ t, t0, t1 }: ShotProps) => {
  const d = W(6, 'desaparecer');
  return (
    <>
      <TubRoom />
      <Tub t={t} {...tubState(t)} />
      <Puff t={t} at={d} n={8} position={[0.8, WATER_Y, 0]} color="#ffffff" size={0.25} />
      <Comic t={t} at={d} text="PUF!" position={[0.85, 1.3, 0.4]} size={0.28} hold={0.7} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.95, 3.0, 2.7], [0.85, 0.45, 0], 32], [t1, [0.9, 2.8, 2.4], [0.85, 0.45, 0], 32]]} />
    </>
  );
};
const S09 = (p: ShotProps) => <Pescador {...p} cheia={false} at={W(7, 'pesca')} />;

// 10. "A mudança não fica só no *mar*." — nuvens se formam sobre a água quente.
const S10 = ({ t, t0, t1 }: ShotProps) => {
  const m = W(8, 'mar');
  return (
    <>
      <TubRoom />
      <Tub t={t} {...tubState(t)} glow={1} />
      <RainCloud t={t} k={pop(t, m) * 0.8} dark={0.4} position={[0.55, 2.3, 0]} />
      <RainCloud t={t} k={pop(t, m + 0.25) * 0.6} dark={0.5} position={[1.2, 2.6, -0.3]} />
      {Array.from({ length: 8 }, (_, i) => {
        const ph = (t * 0.6 + i / 8) % 1;
        return (
          <mesh key={i} position={[0.3 + (i % 4) * 0.25, WATER_Y + ph * 1.6, (i % 2) * 0.3 - 0.15]} scale={0.1 * Math.sin(ph * Math.PI)}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        );
      })}
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.7, 4.4, 4.4], [0.7, 0.6, 0.0], 32], [t1, [0.85, 3.0, 5.2], [0.85, 1.9, 0.0], 32]]} />
    </>
  );
};

// Mapa: nuvens e sóis em posições do mapa.
const ESTUDIO = () => <SkyStage bg="#24304a" chao="#2a3450" />;
const onMap = (lon: number, lat: number, y: number): V3 => {
  const [x, z] = mapXZ(lon, lat);
  return [x, y, z];
};

// 11. "O calor e a umidade alteram o caminho das *chuvas*." — nuvens viajam no mapa.
const S11 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(9, 'chuvas');
  const k = seg(t, t0, c + 0.6);
  const lon = lerp(140, 250, k);
  return (
    <>
      <ESTUDIO />
      <PacificMap />
      <RainCloud t={t} rain={t > c ? 1 : 0} dark={0.55} position={onMap(lon, 0, 1.4)} scale={0.6} />
      <RainCloud t={t} rain={t > c ? 1 : 0} dark={0.45} position={onMap(lon - 25, -8, 1.6)} scale={0.45} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [onMap(lon, 0, 0)[0], 4.2, onMap(lon, 0, 0)[2] + 3.4], [onMap(lon, 0, 0)[0], 0.4, onMap(lon, 0, 0)[2]], 32]]} />
    </>
  );
};

// 12. "Em alguns lugares, pode chover mais e causar *enchentes*." — Paula na rua alagada.
const S12 = ({ t, t0, t1 }: ShotProps) => {
  const e = W(10, 'enchentes');
  const lvl = lerp(0.02, 0.55, seg(t, W(10, 'chover'), e + 0.4));
  const pose = track(t, P({ x: 0.1, z: 0.8, ry: 0.2, lsx: 0.4 }), [{ at: e, v: { hy: -0.4, hp: 0.35, lsz: 0.9, lel: 0.3 } }]);
  return (
    <>
      <Street placa="MERCADO" bg="#8a96a8" parede="#c8c0b0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, lvl, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#6a8a9a" transparent opacity={0.85} roughness={0.15} />
      </mesh>
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: e, f: 'scared', o: ['sweat'] }], 12)} look={PAULA_EN} />
      <Umbrella position={[0.15, 1.95, 0.85]} />
      <RainCloud t={t} rain={1} dark={0.7} position={[-0.6, 4.2, 0.2]} scale={1.2} />
      <RainCloud t={t} rain={1} dark={0.7} position={[1.0, 4.4, -0.6]} scale={1.2} />
      <Comic t={t} at={e} text="SPLASH!" position={[0.1, 2.9, 1.0]} size={0.36} hold={0.8} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.6, 2.4, 6.8], [0.1, 1.4, 0.6], 32], [t1, [0.4, 2.3, 6.2], [0.1, 1.4, 0.6], 32]]} />
    </>
  );
};

// 13. "Em outros, a *seca* pode se prolongar, os rios baixar e o calor *aumentar*." — Seu Bento no rio seco.
const S13 = ({ t, t0, t1 }: ShotProps) => {
  const s = W(11, 'seca');
  const a = W(11, 'aumentar');
  const rio = 1 - 0.95 * seg(t, W(11, 'rios'), W(11, 'baixar') + 0.3);
  const sol = 0.8 + 0.7 * seg(t, a - 0.4, a - 0.03);
  const pose = track(t, P({ x: -0.5, z: 0.8, ry: 0.4, hy: 0.4 }), [
    { at: s, v: { hp: 0.3, hy: 0.6 } },
    { at: a, v: { rsx: 2.2, rel: -1.8, hp: -0.1, hy: 0.1 } },
  ]);
  return (
    <>
      <DryLand t={t} rio={rio} sol={sol} calor={seg(t, a - 0.4, a)} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: s, f: 'tired' }, { at: a, f: 'sick', o: ['sweat3'] }], 13)} look={BENTO} />
      <Thermometer k={lerp(0.35, 0.95, seg(t, a - 0.5, a - 0.03))} label="CALOR" position={[0.65, 0, 0.9]} scale={0.9} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.5, 2.0, 5.2], [-0.5, 1.4, 0.8], 32], [W(11, 'calor') - 0.1, [-0.45, 1.95, 4.9], [-0.5, 1.4, 0.8], 32], [a, [0.6, 2.3, 4.6], [0.65, 1.6, 0.6], 32], [t1, [0.6, 2.3, 4.3], [0.65, 1.7, 0.6], 32]]} />
    </>
  );
};

// 14/15. Mapa: América do Sul com chuva; Indonésia e Austrália secas, com fogo.
const S14 = ({ t, t0, t1 }: ShotProps) => {
  const am = W(12, 'america');
  return (
    <>
      <ESTUDIO />
      <PacificMap tints={[{ lon: -60, lat: -12, r: 0.65, color: '#3a7fff', k: seg(t, am - 0.3, am) }]} />
      <RainCloud t={t} rain={1} dark={0.6} k={pop(t, am) * 0.5} position={onMap(-64, -6, 1.3)} />
      <RainCloud t={t} rain={1} dark={0.6} k={pop(t, am + 0.3) * 0.42} position={onMap(-52, -22, 1.4)} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [onMap(-60, -15, 0)[0], 4.0, onMap(-60, -15, 0)[2] + 3.4], onMap(-60, -15, 0.3), 32], [t1, [onMap(-60, -15, 0)[0], 3.7, onMap(-60, -15, 0)[2] + 3.0], onMap(-60, -15, 0.3), 32]]} />
    </>
  );
};
const S15 = ({ t, t0, t1 }: ShotProps) => {
  const id = W(13, 'indonesia');
  const au = W(13, 'australia');
  const fo = W(13, 'incendios');
  return (
    <>
      <ESTUDIO />
      <PacificMap tints={[{ lon: 115, lat: -2, r: 0.5, color: '#c8782a', k: seg(t, id - 0.3, id) }, { lon: 134, lat: -25, r: 0.65, color: '#c8782a', k: seg(t, au - 0.3, au) }]} />
      <Sun t={t} k={pop(t, id) * 0.45} position={onMap(115, -2, 1.3)} />
      <Sun t={t} k={pop(t, au) * 0.5} position={onMap(134, -24, 1.4)} />
      <Fire t={t} k={pop(t, fo) * 0.6} position={onMap(128, -28, 0.02)} />
      <Fire t={t} k={pop(t, fo + 0.2) * 0.5} position={onMap(142, -22, 0.02)} />
      <Fire t={t} k={pop(t, fo + 0.35) * 0.45} position={onMap(112, 0, 0.02)} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [onMap(115, -2, 0)[0], 3.8, onMap(115, -2, 0)[2] + 3.2], onMap(115, -2, 0.3), 32], [id + 0.3, [onMap(115, -2, 0)[0], 3.7, onMap(115, -2, 0)[2] + 3.1], onMap(115, -2, 0.3), 32], [au, [onMap(134, -25, 0)[0], 3.6, onMap(134, -25, 0)[2] + 3.0], onMap(134, -25, 0.3), 32], [t1, [onMap(134, -25, 0)[0], 3.3, onMap(134, -25, 0)[2] + 2.7], onMap(134, -25, 0.3), 32]]} />
    </>
  );
};

// 16. "No *Brasil*, os efeitos podem variar de uma região para outra:" — mapa do Brasil sobe.
const brOn = (lon: number, lat: number, y: number): V3 => {
  const [x, z] = brXZ(lon, lat);
  return [x, y, z];
};
const S16 = ({ t, t0, t1 }: ShotProps) => {
  const b = W(14, 'brasil');
  return (
    <>
      <ESTUDIO />
      <BrazilMap rise={seg(t, b - 0.5, b - 0.03)} />
      <Sparkles t={t} from={b} n={10} radius={1.4} center={[0, 0.5, 0]} size={0.14} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 5.6, 4.6], [0, 0, 0], 32], [t1, [0.2, 5.0, 4.0], [0, 0, 0.1], 32]]} />
    </>
  );
};

// 17. "você pode ver mais *chuva* em alguns lugares e falta de *água* em outros."
const S17 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(15, 'chuva');
  const a = W(15, 'agua');
  return (
    <>
      <ESTUDIO />
      <BrazilMap tints={[{ lon: -52, lat: -28, r: 0.6, color: '#3a7fff', k: seg(t, c - 0.3, c) }, { lon: -42, lat: -8, r: 0.7, color: '#c8782a', k: seg(t, a - 0.3, a) }, { lon: -60, lat: -3, r: 0.6, color: '#c8782a', k: seg(t, a - 0.1, a + 0.2) }]} />
      <RainCloud t={t} rain={1} dark={0.6} k={pop(t, c) * 0.55} position={brOn(-52, -27, 1.4)} />
      <Sun t={t} k={pop(t, a) * 0.45} position={brOn(-42, -7, 1.4)} />
      <Drop empty position={brOn(-48, -6, 0.6)} scale={pop(t, a + 0.15) * 1.2} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.2, 5.0, 4.0], [0, 0, 0.1], 32], [t1, [0.1, 4.6, 3.6], [0, 0, 0.1], 32]]} />
    </>
  );
};

// 18. "Por isso, *cientistas* acompanham as temperaturas do oceano e os *ventos*." — laboratório.
const S18 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(16, 'cientistas');
  const v = W(16, 'ventos');
  const pose = track(t, P({ x: -0.3, z: 0.4, ry: 0.35 }), [
    { at: c, v: { rsz: 1.2, rel: 0.3, hy: 0.3, lsz: 1.2, lel: 0.3 } },
    { at: W(16, 'temperaturas'), v: { rsz: 0.12, lsz: 0.12, lsx: 1.3, lel: -0.3, hy: -0.6, hp: 0.1 } },
    { at: v, v: { lsx: 0, rsx: 1.4, rel: -0.2, hy: 0.7, hp: -0.15 } },
  ]);
  return (
    <>
      <Room placa="LABORATÓRIO DO CLIMA" parede="#2f4a6a" balcao={false} />
      <Screen position={[-0.9, 1.8, -2.7]} />
      <Buoy t={t} position={[-1.3, 0, 0.2]} />
      <Anemometer t={t} spin={0.3 + 2.0 * seg(t, v - 0.5, v)} position={[1.0, 0, 0.3]} scale={1.1} />
      <Thermometer k={0.55} label="OCEANO" position={[-1.6, 0, -1.4]} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'happy' }, { at: c, f: 'confident' }, { at: v, f: 'curious' }], 18)} look={CIENTISTA} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.2, 1.9, 5.4], [-0.3, 1.4, 0.2], 32], [W(16, 'temperaturas'), [-0.25, 1.85, 4.9], [-0.3, 1.4, 0.2], 32], [v, [1.0, 1.6, 3.8], [1.0, 1.0, 0.3], 32], [t1, [1.0, 1.55, 3.5], [1.0, 1.05, 0.3], 32]]} />
    </>
  );
};

// 19. "O vídeo mostra uma *previsão* e um *alerta*," — tela PREVISÃO e placa ALERTA.
const S19 = ({ t, t0, t1 }: ShotProps) => {
  const p = W(17, 'previsao');
  const a = W(17, 'alerta');
  const pose = track(t, P({ x: 0.75, z: -1.6, ry: -0.45, rsx: 1.2, rsz: 0.5, rel: -0.2 }), [{ at: a, v: { rsx: 0.3, rsz: 0.12, lsz: 1.1, rel: 0.3, lel: 0.3, hy: -0.5 } }]);
  return (
    <>
      <Room placa="LABORATÓRIO DO CLIMA" parede="#2f4a6a" balcao={false} />
      <Screen alerta={t > p - 0.05} position={[-0.25, 1.75, -2.7]} />
      <Sign text="PREVISÃO" w={1.5} h={0.36} position={[-0.25, 2.65, -2.6]} scale={pop(t, p)} bg="#1f4d7a" fg="#ffffff" />
      <AlertSign t={t} at={a} position={[-0.25, 0.9, -2.5]} />
      <Character pose={pose} face={faceAt(t, [{ at: t0, f: 'thinking' }, { at: p, f: 'confident' }, { at: a, f: 'worried' }], 19)} look={CIENTISTA} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.25, 1.9, 2.6], [-0.25, 1.75, -2.4], 32], [W(17, 'alerta'), [-0.25, 1.6, 2.3], [-0.25, 1.35, -2.4], 32], [t1, [-0.25, 1.55, 2.1], [-0.25, 1.35, -2.4], 32]]} />
    </>
  );
};

// 20. "mas o impacto depende de onde você *mora* e de como o fenômeno se desenvolve." — alfinete VOCÊ.
const S20 = ({ t, t0, t1 }: ShotProps) => {
  const m = W(17, 'mora');
  const y = t < m - 0.3 ? 4 : Math.max(0.03, 3 - 30 * (t - (m - 0.3)) ** 2);
  return (
    <>
      <ESTUDIO />
      <BrazilMap tints={[{ lon: -52, lat: -28, r: 0.6, color: '#3a7fff', k: 1 }, { lon: -42, lat: -8, r: 0.7, color: '#c8782a', k: 1 }]} />
      {t > m - 0.3 && <group position={brOn(-46, -22, y)}><Pin text="VOCÊ" /></group>}
      <Puff t={t} at={m} position={brOn(-46, -22, 0.1)} color="#ffffff" size={0.2} />
      <Comic t={t} at={W(17, 'desenvolve')} text="?" position={brOn(-46, -22, 1.8)} size={0.3} hold={1.0} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [brOn(-46, -22, 0)[0], 4.2, brOn(-46, -22, 0)[2] + 3.4], brOn(-46, -22, 0.4), 32], [t1, [brOn(-46, -22, 0)[0], 3.2, brOn(-46, -22, 0)[2] + 2.9], brOn(-46, -22, 0.5), 32]]} />
    </>
  );
};

// 21. "Então, quando o *El Niño* chega, a pergunta não é apenas o que acontece no oceano."
const S21 = ({ t, t0, t1 }: ShotProps) => {
  const e = W(18, 'el');
  return (
    <>
      <TubRoom quente />
      <Tub t={t} warm={0.95} wind={0.1} glow={1} />
      <Sign text="EL NIÑO" w={2.0} h={0.56} position={[0, 1.75, -0.3]} scale={pop(t, e)} bg="#c8301a" fg="#ffffff" />
      <Sparkles t={t} from={e} n={10} radius={1.0} center={[0, 1.75, -0.2]} size={0.13} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.0, 3.8, 4.8], [0.0, 1.0, 0.0], 32], [t1, [0.0, 3.5, 4.3], [0.0, 1.05, 0.0], 32]]} />
    </>
  );
};

// 22. "É também: na sua cidade, você vai enfrentar *seca*, *enchente* ou *calorão*?"
const S22 = ({ t, t0, t1 }: ShotProps) => {
  const s = W(19, 'seca');
  const en = W(19, 'enchente');
  const ca = W(19, 'calorao');
  const pose = track(t, P({ z: 0.6, ry: 0 }), [
    { at: W(19, 'cidade'), v: { lsz: 1.1, rsz: 1.1, lel: 0.3, rel: 0.3 } },
    { at: s, v: { hy: 0.6, lsz: 0.12, rsz: 0.12, rsx: 1.4, rel: -0.2 } },
    { at: en, v: { hy: -0.6, rsx: 0, lsx: 1.4, lel: -0.2 } },
    { at: ca, v: { hy: 0, lsx: 0, rsx: 0.9, rel: -2.2, hr: 0.2 } },
  ]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: s, f: 'worried' }, { at: en, f: 'scared' }, { at: ca, f: 'confused', o: ['sweat'] }], 22);
  return (
    <>
      <Street placa="SUA CIDADE" bg="#f2c88c" />
      <Character pose={pose} face={face} />
      <group position={[0, 3.75, 0.3]} scale={pop(t, s)}>
        <Sign text="SECA" w={0.9} h={0.32} bg="#c8782a" fg="#ffffff" />
        <Sun t={t} position={[-0.75, 0, 0]} k={0.22} />
      </group>
      <group position={[0, 3.15, 0.3]} scale={pop(t, en)}>
        <Sign text="ENCHENTE" w={1.0} h={0.32} bg="#2f6fd8" fg="#ffffff" />
        <Drop position={[0.8, -0.1, 0]} scale={0.7} />
      </group>
      <group position={[0, 2.55, 0.3]} scale={pop(t, ca)}>
        <Sign text="CALORÃO" w={1.1} h={0.34} bg="#e0262e" fg="#ffffff" />
        <Thermometer k={0.95} position={[-0.8, -0.32, 0]} scale={0.4} />
      </group>
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.3, 2.6, 7.0], [0, 2.4, 0.3], 32], [t1, [0.2, 2.6, 6.5], [0, 2.4, 0.3], 32]]} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: '01 banheira', C: S01 },
  { from: W(1, 0), name: '02 ventos', C: S02 },
  { from: W(2, 0), name: '03 peru', C: S03 },
  { from: W(3, 0), name: '04 peixes', C: S04 },
  { from: W(3, 'naquela'), name: '05 rede cheia', C: S05 },
  { from: W(4, 0), name: '06 enfraquecem', C: S06 },
  { from: W(5, 0), name: '07 desloca', C: S07 },
  { from: W(6, 0), name: '08 desaparecer', C: S08 },
  { from: W(7, 0), name: '09 rede vazia', C: S09 },
  { from: W(8, 0), name: '10 mar', C: S10 },
  { from: W(9, 0), name: '11 chuvas', C: S11 },
  { from: W(10, 0), name: '12 enchentes', C: S12 },
  { from: W(11, 0), name: '13 seca', C: S13 },
  { from: W(12, 0), name: '14 america', C: S14 },
  { from: W(13, 0), name: '15 incendios', C: S15 },
  { from: W(14, 0), name: '16 brasil', C: S16 },
  { from: W(15, 0), name: '17 chuva agua', C: S17 },
  { from: W(16, 0), name: '18 cientistas', C: S18 },
  { from: W(17, 0), name: '19 alerta', C: S19 },
  { from: W(17, 'mas'), name: '20 mora', C: S20 },
  { from: W(18, 0), name: '21 el nino', C: S21 },
  { from: W(19, 0), name: '22 cidade', C: S22 },
];

void [clamp01, MAP_D];
