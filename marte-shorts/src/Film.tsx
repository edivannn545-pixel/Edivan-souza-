import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { ESTILO } from './hud';
import { SFX, SHOTS, Shot } from './shots';
import { useFacesReady } from './textures';
import { END, WORDS } from './timeline';

// Transições entre tomadas (campo `trans` de cada tomada):
//   'corte'    corte seco (padrão do estilo "E se...?": ritmo rápido)
//   'dissolve' dissolução de 6 quadros
//   'flash'    clarão branco que some em 8 quadros (impacto, virada, título)
//   'preto'    sai do preto em 10 quadros (desmaio, "dias depois")
const DISSOLVE = 6;

const ShotLayer = ({ shot, t0, t1 }: { shot: Shot; t0: number; t1: number }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ready = useFacesReady();
  const C = shot.C;
  const O = shot.O;
  const t = t0 + frame / fps;
  const trans = shot.trans ?? 'corte';
  return (
    <AbsoluteFill style={{ opacity: trans === 'dissolve' ? Math.min(1, frame / DISSOLVE) : 1 }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, antialias: true }} camera={{ fov: 32, near: 0.05, far: 200, position: [0, 2, 5] }}>
          <C t={t} t0={t0} t1={t1} />
        </ThreeCanvas>
      )}
      {O && <O t={t} t0={t0} t1={t1} />}
      {trans === 'flash' && <AbsoluteFill style={{ background: '#fff', opacity: Math.max(0, 1 - frame / 8) }} />}
      {trans === 'preto' && <AbsoluteFill style={{ background: '#000', opacity: Math.max(0, 1 - frame / 10) }} />}
    </AbsoluteFill>
  );
};

// Legenda no estilo dos shorts: 2–3 palavras por vez, abaixo do meio, branca com contorno escuro,
// palavra enfatizada (*palavra*) na cor de destaque e um pouco maior.
const Captions = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = [...SHOTS].reverse().find((s) => t >= s.from);
  if (shot?.semLegenda) return null;
  const idx = WORDS.findIndex((w, i) => t >= w.t0 && (i === WORDS.length - 1 || t < WORDS[i + 1].t0));
  if (idx < 0 || t > WORDS[WORDS.length - 1].t1 + 0.4) return null;
  const cur = WORDS[idx];
  const N = ESTILO.palavrasPorLegenda;
  const start = Math.floor(cur.i / N) * N;
  const chunk = WORDS.filter((w) => w.line === cur.line).slice(start, start + N);
  const pop = Math.min(1, (t - chunk[0].t0) / 0.1);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: ESTILO.legendaBaixo }}>
      <div style={{ textAlign: 'center', maxWidth: 940, fontFamily: ESTILO.fonte, fontWeight: 900, fontSize: 76, lineHeight: 1.1, transform: `scale(${0.85 + 0.15 * pop})` }}>
        {chunk.map((w) => (
          <span key={w.i} style={{ color: w.stressed ? ESTILO.destaque : '#fff', WebkitTextStroke: '13px #15121a', paintOrder: 'stroke fill', marginRight: 16, display: 'inline-block', transform: w.stressed ? 'scale(1.1)' : 'none', textShadow: '0 6px 0 rgba(0,0,0,0.35)' }}>
            {w.text.toUpperCase()}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export type FilmProps = { legendas: boolean; voz: boolean; musica: boolean };

export const Film = ({ legendas, voz, musica }: FilmProps) => {
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SHOTS.map((s, i) => {
        const t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].from : END;
        const from = Math.round(s.from * fps);
        const nextDissolve = i + 1 < SHOTS.length && SHOTS[i + 1].trans === 'dissolve';
        const to = Math.round(t1 * fps) + (nextDissolve ? DISSOLVE : 0);
        return (
          <Sequence key={s.name} name={s.name} from={from} durationInFrames={Math.max(1, to - from)}>
            <ShotLayer shot={s} t0={from / fps} t1={t1} />
          </Sequence>
        );
      })}
      {legendas && <Captions />}
      {voz && <Audio src={staticFile('voz.mp3')} />}
      {musica && <Audio src={staticFile('musica.mp3')} volume={(f) => 0.11 * Math.min(1, f / (0.8 * fps), (durationInFrames - f) / (1.2 * fps))} />}
      {SFX.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, Math.round(s.at * fps))} durationInFrames={Math.round(5 * fps)} layout="none">
          <Audio src={staticFile(`sfx/${s.file}`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
