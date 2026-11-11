import { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { back, clamp01, easeOut, seg } from './anim';
import { F } from './timeline';

// ============================================================================
// HUD do estilo "E se...?" — elementos 2D por cima do 3D (pergunta-título, selos, números grandes,
// onomatopeias, capítulos, pálpebra, tela final). Tudo é função do tempo `t` (segundos do filme)
// e entra ancorado numa palavra: at={W(linha, 'palavra')}.
// Use em cada tomada pelo campo `O` (overlay) de SHOTS, em src/shots.tsx.
// ============================================================================

export const ESTILO = {
  destaque: '#ff7a45', // cor da palavra-chave (combina com a camiseta do Nino)
  destaque2: '#ffd23a', // segunda cor (números, onomatopeias)
  perigo: '#ff3b4f',
  fonte: '"Arial Black", "Inter Display", Inter, sans-serif',
  palavrasPorLegenda: 3,
  legendaBaixo: 600, // distância da legenda até a borda de baixo (px)
  canal: '', // nome do canal na tela final (vazio = não mostra)
};

const contorno = (px: number, cor = '#15121a'): CSSProperties => ({ WebkitTextStroke: `${px}px ${cor}`, paintOrder: 'stroke fill' });
const pop = (t: number, at: number) => Math.max(0, seg(t, at - 2 * F, at + 5 * F, back));

// Pergunta-título no topo, linha por linha: [{ texto, at, grande? }]. A linha `grande` sai na cor de destaque.
export const Titulo = ({ t, linhas, sai }: { t: number; linhas: { texto: string; at: number; grande?: boolean; cor?: string }[]; sai?: number }) => {
  const out = sai ? 1 - seg(t, sai, sai + 6 * F) : 1;
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 170, opacity: out }}>
      {linhas.map((l, i) => {
        const k = pop(t, l.at);
        if (k <= 0) return null;
        return (
          <div key={i} style={{ fontFamily: ESTILO.fonte, fontWeight: 900, fontSize: l.grande ? 128 : 78, lineHeight: 1.08, color: l.grande ? l.cor ?? ESTILO.destaque : '#fff', ...contorno(l.grande ? 18 : 13), transform: `scale(${k})`, textAlign: 'center', maxWidth: 980, textShadow: '0 8px 0 rgba(0,0,0,0.3)' }}>
            {l.texto}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Número/palavra grande que salta (ex.: "4X", "15 M", "+30 KG").
export const Numero = ({ t, at, texto, x = 540, y = 420, size = 150, cor = ESTILO.destaque2, ate }: { t: number; at: number; texto: string; x?: number; y?: number; size?: number; cor?: string; ate?: number }) => {
  const k = pop(t, at) * (ate ? 1 - seg(t, ate, ate + 5 * F) : 1);
  if (k <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${k}) rotate(-4deg)`, fontFamily: ESTILO.fonte, fontWeight: 900, fontSize: size, color: cor, ...contorno(size * 0.13), textShadow: '0 10px 0 rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
      {texto}
    </div>
  );
};

// Selo com anel de carga: conta de `de` até `para` e trava na palavra `at`.
export const Selo = ({ t, from, at, de = 0, para, sufixo = '', prefixo = '', x = 540, y = 300, cor = '#3fe0b0', escala = 1 }: { t: number; from: number; at: number; de?: number; para: number; sufixo?: string; prefixo?: string; x?: number; y?: number; cor?: string; escala?: number }) => {
  const k = seg(t, from, at - F, easeOut);
  const v = Math.round(de + (para - de) * k);
  const hit = t >= at - F ? 1 + 0.15 * Math.max(0, 1 - (t - at) / 0.25) : 1;
  const ent = pop(t, from);
  if (ent <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${ent * hit * escala})`, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 36px 18px 22px', borderRadius: 34, background: 'rgba(14,18,30,0.86)', border: `6px solid ${cor}`, boxShadow: `0 0 40px ${cor}66` }}>
      <svg width={70} height={70} viewBox="0 0 70 70">
        <circle cx={35} cy={35} r={27} stroke="#ffffff33" strokeWidth={9} fill="none" />
        <circle cx={35} cy={35} r={27} stroke={cor} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={`${170 * k} 170`} transform="rotate(-90 35 35)" />
      </svg>
      <span style={{ fontFamily: ESTILO.fonte, fontWeight: 900, fontSize: 84, color: '#fff', whiteSpace: 'nowrap' }}>
        {prefixo}
        {v}
        <span style={{ fontSize: 50, color: cor }}>{sufixo}</span>
      </span>
    </div>
  );
};

// Onomatopeia de quadrinho (TUM!, TÓC!, SPLASH!).
export const Onoma = ({ t, at, texto, x = 540, y = 500, size = 130, cor = ESTILO.destaque2, rot = -8, hold = 0.8 }: { t: number; at: number; texto: string; x?: number; y?: number; size?: number; cor?: string; rot?: number; hold?: number }) => {
  const k = pop(t, at) * (1 - seg(t, at + hold, at + hold + 5 * F));
  if (k <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${k}) rotate(${rot}deg)`, fontFamily: ESTILO.fonte, fontWeight: 900, fontStyle: 'italic', fontSize: size, color: cor, ...contorno(size * 0.16, '#2a1708'), whiteSpace: 'nowrap' }}>
      {texto}
    </div>
  );
};

// Capítulo/rótulo de tempo em pílula ("SÁBADO", "DIA 3", "NOITE 7").
export const Capitulo = ({ t, at, texto, sub, ate }: { t: number; at: number; texto: string; sub?: string; ate?: number }) => {
  const k = pop(t, at) * (ate ? 1 - seg(t, ate, ate + 5 * F) : 1);
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 150 }}>
      <div style={{ transform: `scale(${k})`, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '14px 46px', borderRadius: 26, background: 'rgba(14,18,30,0.88)', border: `5px solid ${ESTILO.destaque}`, fontFamily: ESTILO.fonte, fontWeight: 900, fontSize: 80, color: '#fff' }}>{texto}</div>
        {sub && <div style={{ marginTop: 10, fontFamily: ESTILO.fonte, fontWeight: 700, fontSize: 40, color: '#ffffffcc', ...contorno(6) }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

// Pálpebra: tela preta que abre como um olho (personagem acordando / voltando a si).
export const Palpebra = ({ t, from, dur = 0.7 }: { t: number; from: number; dur?: number }) => {
  const k = seg(t, from, from + dur);
  if (k >= 1) return null;
  const ry = 2 + k * 75; // % da altura
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% ${ry}% at 50% 50%, transparent 97%, #000 100%)` }} />;
};

// Vinheta escura nas bordas (tensão, perigo).
export const Vinheta = ({ forca = 0.55 }: { forca?: number }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${forca}) 100%)` }} />
);

// Mascote 2D chapado para a tela final (cabeça preta, olhos grandes, túnica na cor do personagem).
export const Mascote = ({ cor, tam = 1, pulo = 0 }: { cor: string; tam?: number; pulo?: number }) => (
  <div style={{ position: 'relative', width: 130 * tam, height: 230 * tam, transform: `translateY(${-pulo}px)` }}>
    <div style={{ position: 'absolute', left: 15 * tam, top: 0, width: 100 * tam, height: 100 * tam, borderRadius: '50%', background: '#141419', boxShadow: '0 0 0 5px #ffe3b0' }}>
      {[30, 62].map((x) => (
        <div key={x} style={{ position: 'absolute', left: x * tam, top: 34 * tam, width: 20 * tam, height: 26 * tam, borderRadius: '50%', background: '#fff' }}>
          <div style={{ position: 'absolute', left: 6 * tam, top: 9 * tam, width: 9 * tam, height: 12 * tam, borderRadius: '50%', background: '#141419' }} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 36 * tam, top: 66 * tam, width: 28 * tam, height: 14 * tam, borderBottom: `${5 * tam}px solid #fff`, borderRadius: '0 0 30px 30px' }} />
    </div>
    <div style={{ position: 'absolute', left: 30 * tam, top: 108 * tam, width: 70 * tam, height: 70 * tam, borderRadius: 22 * tam, background: cor }} />
    {[-1, 1].map((s) => (
      <div key={s} style={{ position: 'absolute', left: (s < 0 ? 12 : 104) * tam, top: 112 * tam, width: 8 * tam, height: 60 * tam, background: '#141419', borderRadius: 4, transform: `rotate(${s * 20}deg)` }} />
    ))}
    {[44, 76].map((x) => (
      <div key={x} style={{ position: 'absolute', left: x * tam, top: 176 * tam, width: 9 * tam, height: 52 * tam, background: '#141419', borderRadius: 4 }} />
    ))}
  </div>
);

// Tela final: nome do canal, "COMENTA AÍ", "INSCREVA-SE" e os mascotes.
export const TelaFinal = ({ t, t0, cores = ['#ff6a3d', '#a98bff'], fundo = ['#2a2f7a', '#ff9a6a'] }: { t: number; t0: number; cores?: string[]; fundo?: [string, string] }) => {
  const a = pop(t, t0 + 0.05);
  const b = pop(t, t0 + 0.3);
  const c = pop(t, t0 + 0.55);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${fundo[0]} 0%, ${fundo[1]} 100%)`, alignItems: 'center' }}>
      {ESTILO.canal && <div style={{ marginTop: 300, fontFamily: ESTILO.fonte, fontWeight: 900, fontSize: 92, color: '#fff', ...contorno(10), transform: `scale(${a})` }}>{ESTILO.canal}</div>}
      <div style={{ marginTop: ESTILO.canal ? 120 : 420, transform: `scale(${b})`, position: 'relative', padding: '34px 70px', borderRadius: 40, background: '#fff', fontFamily: ESTILO.fonte, fontWeight: 900, fontSize: 76, color: '#15121a' }}>
        <span style={{ color: ESTILO.destaque, marginRight: 18 }}>●●</span>COMENTA AÍ
        <div style={{ position: 'absolute', left: 90, bottom: -48, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderTop: '52px solid #fff', transform: 'skewX(-25deg)' }} />
      </div>
      <div style={{ marginTop: 110, transform: `scale(${c})`, padding: '26px 72px', borderRadius: 60, background: '#ff2d3d', fontFamily: ESTILO.fonte, fontWeight: 900, fontSize: 72, color: '#fff', boxShadow: '0 10px 0 #a3121e' }}>INSCREVA-SE</div>
      <div style={{ marginTop: 130, display: 'flex', gap: 70, alignItems: 'flex-end' }}>
        {cores.map((cor, i) => (
          <Mascote key={i} cor={cor} tam={1.6 - i * 0.12} pulo={Math.abs(Math.sin((t - t0) * 6 + i)) * 26 * clamp01((t - t0 - 0.6) * 3)} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Agrupa vários elementos de HUD numa tomada.
export const Hud = ({ children }: { children: ReactNode }) => <AbsoluteFill>{children}</AbsoluteFill>;
