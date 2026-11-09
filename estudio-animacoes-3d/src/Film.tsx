import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { rand } from './anim';
import { Efeito } from './camera';
import { EFEITOS, SFX, SHOTS, Shot } from './shots';
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

// Legenda: blocos curtos (como nos Shorts que retêm mais), a palavra enfatizada em amarelo.
const POR_BLOCO = 2; // palavras por legenda
const ALTURA = 700; // distância da base (px): ~63% da altura da tela
const Captions = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = WORDS.findIndex((w, i) => t >= w.t0 && (i === WORDS.length - 1 || t < WORDS[i + 1].t0));
  if (idx < 0 || t > WORDS[WORDS.length - 1].t1 + 0.4) return null;
  const cur = WORDS[idx];
  const start = Math.floor(cur.i / POR_BLOCO) * POR_BLOCO;
  const chunk = WORDS.filter((w) => w.line === cur.line).slice(start, start + POR_BLOCO);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: ALTURA }}>
      <div style={{ textAlign: 'center', maxWidth: 900, fontFamily: '"Arial Black", Arial, sans-serif', fontSize: 86, lineHeight: 1.1 }}>
        {chunk.map((w) => (
          <span key={w.i} style={{ color: w.stressed ? '#ffd23a' : '#fff', WebkitTextStroke: '14px #1a1208', paintOrder: 'stroke fill', marginRight: 18, display: 'inline-block', transform: w === cur ? 'scale(1.08)' : 'none' }}>
            {w.text.toUpperCase()}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Linhas de velocidade e clarões (src/camera.ts → Efeito). Determinístico: mesmo quadro, mesmo desenho.
const Efeitos = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <>
      {EFEITOS.map((e: Efeito, n) => {
        const dur = e.dur ?? (e.tipo === 'flash' ? 0.2 : 0.35);
        const k = (t - (e.at - 2 / fps)) / dur;
        if (k < 0 || k > 1) return null;
        if (e.tipo === 'flash') return <AbsoluteFill key={n} style={{ background: e.cor ?? '#fff', opacity: 0.85 * (1 - k) }} />;
        const cx = width / 2, cy = height * 0.45;
        const fase = Math.floor(frame / 2);
        const linhas = Array.from({ length: 46 }, (_, i) => {
          const a = (i / 46) * Math.PI * 2 + rand(i + fase * 7) * 0.12;
          const r0 = (0.28 + 0.22 * rand(i * 3 + fase)) * height * (1 - 0.35 * k);
          const r1 = height * 1.1;
          const w = 6 + 16 * rand(i * 5 + fase);
          const p = (r: number, s: number) => `${cx + Math.cos(a + s) * r},${cy + Math.sin(a + s) * r}`;
          const da = w / r1;
          return <polygon key={i} points={`${p(r0, 0)} ${p(r1, -da)} ${p(r1, da)}`} fill={e.cor ?? '#fff'} />;
        });
        return (
          <svg key={n} width={width} height={height} style={{ position: 'absolute', opacity: 0.9 * Math.sin(Math.PI * Math.min(1, k * 1.3)) }}>
            {linhas}
          </svg>
        );
      })}
    </>
  );
};

// Vinheta suave nas bordas: puxa o olho para o centro (como nos Shorts de referência).
const Vinheta = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)', pointerEvents: 'none' }} />;

export type FilmProps = { legendas: boolean; voz: boolean; musica: boolean };

export const Film = ({ legendas, voz, musica }: FilmProps) => {
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SHOTS.map((s, i) => {
        const t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].from : END;
        const from = Math.round(s.from * fps);
        const next = SHOTS[i + 1];
        const to = Math.round(t1 * fps) + (next && !next.corte ? DISSOLVE : 0);
        return (
          <Sequence key={s.name} name={s.name} from={from} durationInFrames={to - from}>
            <ShotCanvas shot={s} t0={from / fps} t1={t1} fade={i > 0 && !s.corte} />
          </Sequence>
        );
      })}
      <Vinheta />
      <Efeitos />
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
