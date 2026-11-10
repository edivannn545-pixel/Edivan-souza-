import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { SFX, SHOTS, Shot } from './shots';
import { useFacesReady } from './textures';
import { END, WORDS } from './timeline';

const DISSOLVE = 6; // quadros de dissolução entre tomadas

const ShotCanvas = ({ shot, t0, t1, fade }: { shot: Shot; t0: number; t1: number; fade: boolean }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ready = useFacesReady();
  const C = shot.C;
  return (
    <AbsoluteFill style={{ opacity: fade ? Math.min(1, frame / DISSOLVE) : 1 }}>
      {ready && (
        <ThreeCanvas width={width} height={height} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, antialias: true }} camera={{ fov: 32, near: 0.05, far: 200, position: [0, 2, 5] }}>
          <C t={t0 + frame / fps} t0={t0} t1={t1} />
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};

// Legenda: blocos de até 4 palavras, a enfatizada em amarelo.
const Captions = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = WORDS.findIndex((w, i) => t >= w.t0 && (i === WORDS.length - 1 || t < WORDS[i + 1].t0));
  if (idx < 0 || t > WORDS[WORDS.length - 1].t1 + 0.4) return null;
  const cur = WORDS[idx];
  const start = Math.floor(cur.i / 4) * 4;
  const chunk = WORDS.filter((w) => w.line === cur.line).slice(start, start + 4);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 520 }}>
      <div style={{ textAlign: 'center', maxWidth: 900, fontFamily: '"Arial Black", Arial, sans-serif', fontSize: 74, lineHeight: 1.1 }}>
        {chunk.map((w) => (
          <span key={w.i} style={{ color: w.stressed ? '#ffd23a' : '#fff', WebkitTextStroke: '14px #1a1208', paintOrder: 'stroke fill', marginRight: 18, display: 'inline-block', transform: w === cur ? 'scale(1.08)' : 'none' }}>
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
        const to = Math.round(t1 * fps) + (i + 1 < SHOTS.length ? DISSOLVE : 0);
        return (
          <Sequence key={s.name} name={s.name} from={from} durationInFrames={to - from}>
            <ShotCanvas shot={s} t0={from / fps} t1={t1} fade={i > 0} />
          </Sequence>
        );
      })}
      {legendas && <Captions />}
      {voz && <Audio src={staticFile('voz.mp3')} />}
      {musica && <Audio src={staticFile('musica.mp3')} volume={(f) => 0.11 * Math.min(1, f / (0.8 * fps), (durationInFrames - f) / (1.2 * fps))} />}
      {SFX.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, Math.round(s.at * fps))} durationInFrames={Math.round(3.5 * fps)} layout="none">
          <Audio src={staticFile(`sfx/${s.file}`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
