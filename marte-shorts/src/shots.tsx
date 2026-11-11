import { JSX } from 'react';
import { seg, track, V3 } from './anim';
import { Character, faceAt, Pose, REST } from './Character';
import { ASTRO, Clock, Earth, FloatSign, Stars, StarStreaks } from './espaco';
import { salto } from './historia';
import { Titulo } from './hud';
import { IARA } from './luz';
import { BaseLancamento, BaseMarte, Foguete, Fumaca, NuvemCO2, Passagem, PlanetaMarte, PoeiraMarte, Radio, ReguaPulo, Sinal, SoloMarte, Termometro } from './marte';
import { Calendar, Gauge, Sparkles } from './props';
import { Cam, CamKey } from './sets';
import { W } from './timeline';
import { glowTex } from './espaco';
import * as THREE from 'three';

// ============================================================================
// "E se você vivesse em Marte?" — elenco esfera: Nino ("você", de astronauta) e Dra. Iara (a cientista).
// Cenas novas: base de lançamento na Terra, foguete vertical, decolagem, viagem, pouso e superfície de Marte.
// A câmera ACOMPANHA quem está em cena e mantém tudo centralizado, sem cortar ninguém.
// Sem legenda, sem música e sem efeitos sonoros.
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element; O?: (p: ShotProps) => JSX.Element; trans?: 'corte' | 'dissolve' | 'flash' | 'preto'; semLegenda?: boolean };

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });

// Câmera que acompanha o alvo: mira nele (centralizado), aproxima de d0 até d1 e gira `lado` radianos em volta.
// alt = quanto a câmera fica acima do alvo (negativo = de baixo para cima).
const segue = (t: number, t0: number, t1: number, alvo: V3, d0 = 5.8, d1 = 5.2, lado = 0.3, alt = 0.25, fov = 32): CamKey[] => {
  const k = seg(t, t0, t1);
  const d = d0 + (d1 - d0) * k;
  const a = lado * (0.5 - k);
  return [[t, [alvo[0] + Math.sin(a) * d, alvo[1] + alt, alvo[2] + Math.cos(a) * d], alvo, fov]];
};

// 1a. "E se você vivesse em" — Marte inteiro girando no espaço, a câmera mergulha nele.
const S01 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <ambientLight intensity={0.25} />
    <directionalLight position={[-5, 3, 6]} intensity={2.4} color="#fff1dc" />
    <Stars />
    <PlanetaMarte t={t} r={2.2} />
    <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 0, 0], 10.5, 8.8, 0.4, 0.2, 34)} />
  </>
);
const O01 = ({ t }: ShotProps) => (
  <Titulo t={t} linhas={[{ texto: 'E SE VOCÊ', at: 0.05 }, { texto: 'VIVESSE EM', at: W(0, 'vivesse') }, { texto: 'MARTE?', at: W(0, 'marte'), grande: true }]} sai={W(1, 0) - 0.15} />
);

// 1b. "*Marte?*" — Nino de pé no chão vermelho, a câmera gira em volta dele.
const S01b = ({ t, t0, t1 }: ShotProps) => {
  const pose = P({ lsz: 1.1, rsz: 1.1, lel: 0.3, rel: 0.3, hp: -0.1 });
  const face = faceAt(t, [{ at: t0, f: 'amazed' }], 1);
  return (
    <>
      <SoloMarte t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 1.3, 0], 6.0, 5.4, 0.9, -0.4)} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};
const O01b = ({ t }: ShotProps) => (
  <Titulo t={t} linhas={[{ texto: 'E SE VOCÊ', at: 0 }, { texto: 'VIVESSE EM', at: 0 }, { texto: 'MARTE?', at: 0, grande: true }]} sai={W(1, 0) - 0.15} />
);

// 2. "A doutora Yara *construiu* um" — Dra. Iara na base de lançamento, o foguete atrás.
const S02 = ({ t, t0, t1 }: ShotProps) => {
  const co = W(1, 'construiu');
  const pose = track(t, P({ z: 3 }), [{ at: co, v: { rsz: 1.5, rsx: 0.4, rel: 0.1, lsz: 0.3, hy: 0.25, hp: -0.1 } }]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: co, f: 'confident' }], 2);
  return (
    <>
      <BaseLancamento />
      <Foguete t={t} position={[0, 0.12, -3]} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 3.4, 1.0], 11.5, 11.0, -0.3, -0.4)} />
      <Character pose={pose} face={face} look={IARA} />
    </>
  );
};

// 3. "*foguete.*" — grua: a câmera sobe pelo foguete da base até o nariz.
const S03 = ({ t, t0, t1 }: ShotProps) => {
  const k = seg(t, t0, t1 + 0.2);
  return (
    <>
      <BaseLancamento />
      <Foguete t={t} position={[0, 0.12, -1]} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 4.8, -1], 12.5, 11.8, 0.8, -3.2 + 3.6 * k, 34)} />
    </>
  );
};

// 4. "E *adivinha* quem vai ser o" — Nino de astronauta anda até a porta do foguete (câmera vai junto, de lado).
const S04 = ({ t, t0, t1 }: ShotProps) => {
  const z = 6 - 4.0 * seg(t, t0, t1 + 0.2, (x) => x);
  const pose = P({ ry: Math.PI, z, walk: (6 - z) / 0.24, stride: 1, lsz: 0.25, rsz: 0.25 });
  const face = faceAt(t, [{ at: t0, f: 'confident' }], 3);
  return (
    <>
      <BaseLancamento />
      <Foguete t={t} position={[0, 0.12, -1]} porta={1} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [7.5, 3.6, z + 9.0], [0, 3.8, (z - 1) / 2], 36]]} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 5. "*primeiro* a morar lá?" — a porta fecha, o motor acende e o foguete decola; a câmera sobe junto.
const S05 = ({ t, t0, t1 }: ShotProps) => {
  const fecha = seg(t, t0, t0 + 0.35);
  const ign = t0 + 0.4;
  const sobe = Math.pow(Math.max(0, t - ign - 0.3), 2) * 2.2;
  const y = 0.12 + sobe;
  return (
    <>
      <BaseLancamento />
      <Foguete t={t} position={[0, y, -1]} porta={1 - fecha} chama={seg(t, ign, ign + 0.25)} />
      <Fumaca t={t} from={ign} position={[0, 0, -1]} n={12} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [0.8, 3.2 + sobe * 0.9, 15], [0, 4.6 + sobe, -1], 40]]} shake={0.12 * seg(t, ign, ign + 0.4)} />
    </>
  );
};

// 6. "*Você!*" — o foguete no espaço: a Terra fica para trás, Marte lá na frente. A câmera voa junto.
const S06 = ({ t, t0, t1 }: ShotProps) => {
  const k = seg(t, t0, t1 + 0.4);
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-5, 4, 6]} intensity={2.2} color="#fff1dc" />
      <Stars />
      <StarStreaks t={t} speed={30} n={120} />
      <Earth t={t} position={[0, -8.2 - 1.5 * k, -4]} r={1.4 - 0.4 * k} />
      <PlanetaMarte t={t} position={[0, 8.6, -4]} r={0.9 + 0.5 * k} />
      <Foguete t={t} position={[0, -4.6, 0]} chama={1} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [3.0 * Math.sin(t * 0.8), 0.3, 15], [0, 0.2, 0], 40]]} shake={0.05} />
    </>
  );
};

// 7. "Você *abre* a porta e" — foguete pousado em Marte, a poeira baixando; a porta abre e Nino aparece.
const S07 = ({ t, t0, t1 }: ShotProps) => {
  const ab = W(4, 'abre');
  const porta = seg(t, ab - 0.25, ab + 0.2);
  const pose = track(t, P({ y: 0.9, z: 0.95 }), [{ at: ab, v: { rsx: 1.6, rsz: 0.5, rel: -0.2 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: ab, f: 'bigSmile' }], 4);
  return (
    <>
      <SoloMarte t={t} />
      <Foguete t={t} position={[0, 0, 0]} porta={porta} />
      <PoeiraMarte t={t} at={t0 - 0.6} position={[0, 0, 0]} raio={3} />
      {porta > 0.3 && <Character pose={pose} face={face} look={ASTRO} />}
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 4.6, 0.5], 11.5, 10.5, 0.4, -1.2, 34)} shake={0.15 * Math.max(0, 1 - (t - t0) / 0.7)} />
    </>
  );
};

// 8. "*pula.*" — Nino salta da porta e vai lá no alto; a câmera acompanha o pulo.
const S08 = ({ t, t0, t1 }: ShotProps) => {
  const a = t0 + 0.05;
  const k = seg(t, a, a + 2.4, (x) => x);
  const y = 0.9 * (1 - k) + salto(t, a, a + 2.4, 4.2);
  const z = 0.95 + 3.0 * k;
  const pose = P({ y, z, squash: t < a + 0.1 ? 0.3 : 0, lsz: 2.2, rsz: 2.2, lel: 0.2, rel: 0.2, ltap: 0.4, rtap: 0.4 });
  const face = faceAt(t, [{ at: t0, f: 'surprised' }, { at: t0 + 0.4, f: 'laugh' }], 5);
  return (
    <>
      <SoloMarte t={t} />
      <Foguete t={t} position={[0, 0, 0]} porta={1} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 2.6 + 0.6 * y, z * 0.5], 11.0, 10.0, -0.5, -0.4, 36)} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 9. "*Uau!*" — no topo do pulo, Marte inteiro lá embaixo. Câmera de baixo para cima.
const S09 = ({ t, t0, t1 }: ShotProps) => {
  const y = 3.6 + 0.4 * Math.sin((t - t0) * 2);
  const pose = P({ y, z: 3, lsz: 2.6, rsz: 2.6, lel: 0, rel: 0, ltap: 0.5, rtap: 0.5, hp: -0.15 });
  const face = faceAt(t, [{ at: t0, f: 'starstruck', o: ['sparkle'] }], 6);
  return (
    <>
      <SoloMarte t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, y + 1.1, 3], 6.2, 5.6, 0.6, -1.6)} />
      <Character pose={pose} face={face} look={ASTRO} />
      <Sparkles t={t} from={t0} n={10} radius={1.3} center={[0, y + 1.3, 3]} />
    </>
  );
};

// 10. "Você vai *3* vezes mais *alto* do que na Terra." — Nino pula ao lado da régua TERRA x MARTE 3X.
const S10 = ({ t, t0, t1 }: ShotProps) => {
  const al = W(6, 'alto');
  const y = salto(t, al - 0.9, al + 0.9, 1.8);
  const pose = P({ x: 0.45, y, lsz: 2.4, rsz: 2.4, lel: 0.2, rel: 0.2, squash: y < 0.05 && t < al ? 0.25 : 0 });
  const face = faceAt(t, [{ at: t0, f: 'confident' }, { at: al, f: 'laugh' }], 7);
  return (
    <>
      <SoloMarte t={t} />
      <Sparkles t={t} from={W(6, '3')} n={8} radius={0.6} center={[-1.3, 2.8, -0.3]} size={0.14} />
      <ReguaPulo t={t} at={W(6, '3')} position={[-0.55, 0, -0.3]} h1={0.6} h3={1.8} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [-0.45, 1.9, 0], 7.8, 7.2, 0.25, 0.2)} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 11. "Marte tem só *1* *terço* da *gravidade* da Terra." — medidor GRAVIDADE desce para 1/3, Nino flutua devagar.
const S11 = ({ t, t0, t1 }: ShotProps) => {
  const te = W(7, 'terço');
  const y = 0.35 + 0.3 * Math.sin((t - t0) * 2.2);
  const pose = track(t, P({ y, lsz: 1.3, rsz: 1.3, lel: 0.5, rel: 0.5 }), [{ at: te, v: { lsz: 0.4, rsz: 0.4, rsx: 2.6, rel: 0.1, hp: -0.3 } }]);
  const face = faceAt(t, [{ at: t0, f: 'happy' }, { at: te, f: 'smug' }], 8);
  return (
    <>
      <SoloMarte t={t} />
      <Gauge t={t} from={t0 + 0.2} at={te} value={0.33} label="GRAVIDADE" position={[0, 3.85, -0.2]} scale={0.85} />
      <FloatSign t={t} at={W(7, 'gravidade')} text="1/3 DA TERRA" position={[0, 4.85, -0.2]} w={1.9} h={0.45} />
      <Sparkles t={t} from={W(7, 'gravidade')} n={8} radius={1.0} center={[0, 4.85, -0.2]} size={0.16} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 2.4, 0], 8.0, 7.4, -0.4, 0.2)} />
      <Character pose={P({ ...pose, y })} face={face} look={ASTRO} />
    </>
  );
};

// 12. "Mas *não* tire o *capacete.*" — Nino leva as mãos ao capacete e para assustado; placa NÃO!
const S12 = ({ t, t0, t1 }: ShotProps) => {
  const na = W(8, 'não');
  const ca = W(8, 'capacete');
  const pose = track(t, P({}), [{ at: na, v: { lsx: 2.6, rsx: 2.6, lsz: 0.5, rsz: 0.5, lel: -1.6, rel: -1.6 } }, { at: ca, v: { lsx: 0.6, rsx: 0.6, lsz: 0.9, rsz: 0.9, lel: 0.2, rel: 0.2, squash: 0.1 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: na, f: 'nervous' }, { at: ca, f: 'scared', o: ['sweat'] }], 9);
  return (
    <>
      <SoloMarte t={t} />
      <FloatSign t={t} at={ca} text="NÃO!" position={[0, 3.15, 0]} w={1.3} h={0.5} bg="#5a0f0f" fg="#ffffff" />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 1.6, 0], 6.0, 5.2, 0.5, 0.1)} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 13. "O *ar* é fino e quase todo é *gás* carbônico." — moléculas de CO2 girando em volta de Nino.
const S13 = ({ t, t0, t1 }: ShotProps) => {
  const ga = W(9, 'gás');
  const pose = track(t, P({ hy: 0.3 }), [{ at: W(9, 'ar'), v: { hy: -0.3, hp: -0.15 } }, { at: ga, v: { hy: 0, rsx: 1.4, rsz: 0.6, rel: -0.3 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: ga, f: 'disgusted' }], 10);
  return (
    <>
      <SoloMarte t={t} />
      <NuvemCO2 t={t} from={W(9, 'ar')} centro={[0, 1.4, 0]} raio={1.15} />
      <FloatSign t={t} at={ga} text="95% CO2" position={[0, 3.35, 0]} w={2.3} h={0.62} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 1.8, 0], 7.6, 7.0, 0.8, 0.2)} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 14. "À *noite,* a temperatura cai para *80* graus *negativos.*" — Marte à noite, termômetro despenca, Nino tremendo.
const S14 = ({ t, t0, t1 }: ShotProps) => {
  const n80 = W(10, '80');
  const tremor = t > n80 ? 0.03 * Math.sin(t * 60) : 0;
  const pose = track(t, P({}), [{ at: W(10, 'noite'), v: { hy: 0.3, hp: -0.25 } }, { at: n80, v: { hy: 0, hp: 0.1, lsx: 1.3, rsx: 1.3, lsz: -0.3, rsz: -0.3, lel: -1.9, rel: -1.9, squash: 0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'lookUp' }, { at: n80, f: 'shocked' }, { at: W(10, 'negativos'), f: 'nervous', o: ['sweat3'] }], 11);
  return (
    <>
      <SoloMarte t={t} hora="noite" />
      <pointLight position={[0, 3, 4]} intensity={14} distance={12} color="#b8c8ff" />
      <Termometro t={t} from={W(10, 'temperatura')} at={n80} position={[0, 3.6, -0.2]} scale={0.7} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 2.0, 0], 7.4, 6.6, -0.5, 0.1)} />
      <Character pose={P({ ...pose, x: tremor })} face={face} look={ASTRO} />
    </>
  );
};

// 15. "Lá, um *dia* dura *24* horas e *37* minutos." — o Sol cruza o céu, relógio gira rápido, placa 24H 37MIN.
const S15 = ({ t, t0, t1 }: ShotProps) => {
  const n24 = W(11, '24');
  const n37 = W(11, '37');
  const k = seg(t, t0, t1, (x) => x);
  const sol: V3 = [-7 + 14 * k, 10 + 6 * Math.sin(k * Math.PI), -40];
  const txt = t >= n37 - 0.05 ? '24H 37MIN' : '24 HORAS';
  const pose = track(t, P({ hy: -0.4, hp: -0.3 }), [{ at: n24, v: { hy: 0.4, hp: -0.3 } }, { at: n37, v: { hy: 0, hp: 0, rsx: 2.6, rsz: 0.2, rel: 0 } }]);
  const face = faceAt(t, [{ at: t0, f: 'lookUp' }, { at: n37, f: 'surprised' }], 12);
  return (
    <>
      <SoloMarte t={t} />
      <sprite position={sol} scale={[6, 6, 1]}>
        <spriteMaterial map={glowTex('rgba(255,245,220,1)')} transparent depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <Clock time={(t - t0) * 2400} position={[0, 3.35, -0.2]} scale={0.8} />
      {t >= n24 - 0.2 && <FloatSign t={t} at={n24} text={txt} position={[0, 4.35, -0.2]} w={2.0} h={0.5} />}
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 2.2, 0], 7.6, 7.0, 0.5, 0.1)} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 16. "Mas um *ano,* quase *dois* anos da Terra." — calendário vira 687 dias.
const S16 = ({ t, t0, t1 }: ShotProps) => {
  const d = W(12, 'dois');
  const pages = ['DIA 1', 'DIA 100', 'DIA 200', 'DIA 300', 'DIA 365', 'DIA 450', 'DIA 550', 'DIA 687', 'QUASE 2 ANOS!'];
  const pose = track(t, P({ hp: -0.3 }), [{ at: d, v: { lsz: 1.6, rsz: 1.6, lel: 0.2, rel: 0.2, hp: -0.35, squash: 0.08 } }]);
  const face = faceAt(t, [{ at: t0, f: 'thinking' }, { at: W(12, 'ano'), f: 'curious' }, { at: d, f: 'shocked' }], 13);
  return (
    <>
      <SoloMarte t={t} />
      <Calendar t={t} from={t0 + 0.1} at={d} pages={pages} position={[0, 3.55, -0.2]} scale={1.3} />
      <Sparkles t={t} from={d} n={10} radius={0.9} center={[0, 3.55, -0.2]} size={0.16} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 2.3, 0], 7.8, 7.0, -0.6, 0.1)} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 17. "E o *pôr* do sol em Marte?" — câmera atrás de Nino, ele olha o horizonte; o céu escurece.
const S17 = ({ t, t0, t1 }: ShotProps) => {
  const pose = P({ ry: Math.PI, hp: -0.1 });
  return (
    <>
      <SoloMarte t={t} hora="porDoSol" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [0.6 * Math.sin((t - t0) * 0.8), 1.0, 6.4 - 0.8 * seg(t, t0, t1)], [0, 1.5, 0], 32]]} />
      <Character pose={pose} face={{ f: 'content', blink: 0, o: [] }} look={ASTRO} />
    </>
  );
};

// 18. "É *azul.*" — a câmera dá a volta: rosto de Nino iluminado pelo pôr do sol azul.
const S18 = ({ t, t0, t1 }: ShotProps) => {
  const pose = P({ ry: 0, hp: -0.05, lsz: 0.9, rsz: 0.9, lel: 0.4, rel: 0.4 });
  const face = faceAt(t, [{ at: t0, f: 'amazed' }, { at: W(14, 'azul'), f: 'starstruck', o: ['sparkle'] }], 14);
  return (
    <>
      <SoloMarte t={t} hora="porDoSol" />
      <pointLight position={[0, 2.5, 3]} intensity={10} distance={10} color="#8fc8ff" />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 1.4, 0], 6.0, 5.4, 0.6, -0.3)} />
      <Character pose={pose} face={face} look={ASTRO} />
    </>
  );
};

// 19. "Você *liga* para casa." — Nino na frente da base marciana, rádio no ouvido, a antena acende.
const S19 = ({ t, t0, t1 }: ShotProps) => {
  const li = W(15, 'liga');
  const pose = track(t, P({ z: 1.6 }), [{ at: li, v: { rsx: 2.3, rsz: 0.5, rel: -2.3, hr: 0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: li, f: 'happy' }], 15);
  return (
    <>
      <SoloMarte t={t} terraNoCeu />
      <group scale={0.75}><BaseMarte t={t} position={[-0.65, 0, -3.6]} antena={t > li ? 1 : 0} /></group>
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 1.6, 0.6], 8.6, 8.2, 0.2, 0.2)} />
      <Character pose={pose} face={face} look={ASTRO} right={<Radio position={[0, -0.25, 0.1]} />} />
    </>
  );
};

// 20. "Mas a sua *mensagem* leva até *20* minutos" — a mensagem viaja de Marte (embaixo) até a Terra (em cima).
const S20 = ({ t, t0, t1 }: ShotProps) => {
  const n20 = W(16, '20');
  const de: V3 = [0, -3.2, 0];
  const para: V3 = [0, 3.6, -1];
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[-5, 3, 6]} intensity={2.2} color="#fff1dc" />
      <Stars />
      <PlanetaMarte t={t} position={[0, -5.2, 0]} r={2} />
      <Earth t={t} position={[0, 5.4, -1]} r={1.6} />
      <Sinal t={t} from={W(16, 'mensagem') - 0.3} at={t1 + 1.2} de={de} para={para} />
      <Sparkles t={t} from={n20} n={10} radius={2.2} center={[0, -1.2, 3]} size={0.3} />
      <FloatSign t={t} at={n20} text="ATÉ 20 MINUTOS" position={[0, -1.2, 3]} w={4.6} h={1.05} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 0.2, 0], 16.5, 15.5, 0.4, 0.0, 36)} />
    </>
  );
};

// 21. "para *chegar.*" — na Terra, a Dra. Iara recebe a mensagem no rádio e comemora.
const S21 = ({ t, t0, t1 }: ShotProps) => {
  const ch = W(16, 'chegar');
  const pose = track(t, P({ z: 3 }), [{ at: ch, v: { rsx: 2.3, rsz: 0.5, rel: -2.3, lsz: 2.2, lel: 0.2, hr: 0.12 } }]);
  const face = faceAt(t, [{ at: t0, f: 'worried' }, { at: ch, f: 'bigSmile' }], 16);
  return (
    <>
      <BaseLancamento torre={false} />
      <Sinal t={t} from={t0 - 0.6} at={ch} de={[0, 8, -6]} para={[0.3, 2.4, 3]} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 1.5, 3], 6.0, 5.4, -0.5, 0.2)} />
      <Character pose={pose} face={face} look={IARA} right={<Radio position={[0, -0.25, 0.1]} />} />
    </>
  );
};

// 22. "E aí, você *compraria* uma *passagem* para Marte?" — Nino mostra a passagem e pisca; a câmera gira em volta.
const S22 = ({ t, t0, t1 }: ShotProps) => {
  const co = W(17, 'compraria');
  const pa = W(17, 'passagem');
  const pose = track(t, P({}), [{ at: co, v: { hr: 0.15, hy: 0.1 } }, { at: pa, v: { rsx: 1.5, rsz: 0.15, rel: -0.6, hr: 0 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: co, f: 'smug' }, { at: pa, f: 'wink' }], 17);
  return (
    <>
      <SoloMarte t={t} />
      <Foguete t={t} position={[-3.6, 0, -20]} porta={1} />
      <Cam t={t} t0={t0} t1={t1} keys={segue(t, t0, t1, [0, 1.4, 0], 6.0, 5.2, 0.8, 0.15)} />
      <Character pose={pose} face={face} look={ASTRO} right={t > pa - 0.3 ? <Passagem position={[0, -0.45, 0.2]} rotation={[0.3, 0, 0]} scale={1.6} /> : undefined} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: '01 planeta marte', C: S01, O: O01 },
  { from: W(0, 'marte') - 0.1, name: '01b nino em marte', C: S01b, O: O01b },
  { from: W(1, 0), name: '02 iara construiu', C: S02, trans: 'flash' },
  { from: W(1, 'foguete') - 0.15, name: '03 foguete', C: S03 },
  { from: W(2, 0), name: '04 nino vai ao foguete', C: S04 },
  { from: W(2, 'primeiro') - 0.1, name: '05 decolagem', C: S05 },
  { from: W(3, 0), name: '06 viagem', C: S06, trans: 'flash' },
  { from: W(4, 0), name: '07 abre a porta', C: S07, trans: 'flash' },
  { from: W(4, 'pula') - 0.05, name: '08 pula', C: S08 },
  { from: W(5, 0), name: '09 uau', C: S09, trans: 'flash' },
  { from: W(6, 0), name: '10 3x mais alto', C: S10 },
  { from: W(7, 0), name: '11 gravidade', C: S11 },
  { from: W(8, 0), name: '12 capacete', C: S12, trans: 'flash' },
  { from: W(9, 0), name: '13 co2', C: S13 },
  { from: W(10, 0), name: '14 noite', C: S14, trans: 'preto' },
  { from: W(11, 0), name: '15 dia', C: S15, trans: 'flash' },
  { from: W(12, 0), name: '16 ano', C: S16 },
  { from: W(13, 0), name: '17 por do sol', C: S17, trans: 'dissolve' },
  { from: W(14, 0), name: '18 azul', C: S18, trans: 'flash' },
  { from: W(15, 0), name: '19 liga', C: S19 },
  { from: W(16, 'mensagem') - 0.2, name: '20 mensagem', C: S20 },
  { from: W(16, 'para'), name: '21 chegar', C: S21 },
  { from: W(17, 0), name: '22 passagem', C: S22, trans: 'flash' },
];

// Sem efeitos sonoros: o usuário coloca os dele na edição.
// Efeitos sonoros profissionais (gerados no ElevenLabs da conta do usuário), em public/sfx/.
// Volumes baixos para a voz ficar sempre na frente.
export const SFX: { at: number; file: string; vol: number }[] = [
  { at: 0.02, file: 'whoosh.mp3', vol: 0.35 },
  { at: W(0, 'marte') - 0.1, file: 'brilho.mp3', vol: 0.35 },
  { at: W(1, 'foguete') - 0.2, file: 'whoosh.mp3', vol: 0.25 },
  { at: W(2, 'primeiro') - 0.1, file: 'porta-fecha.mp3', vol: 0.35 },
  { at: W(2, 'primeiro') + 0.3, file: 'foguete.mp3', vol: 0.5 },
  { at: W(3, 0), file: 'warp.mp3', vol: 0.4 },
  { at: W(4, 0) - 0.05, file: 'pouso.mp3', vol: 0.45 },
  { at: W(4, 'abre') - 0.3, file: 'porta-abre.mp3', vol: 0.3 },
  { at: W(4, 'pula') - 0.05, file: 'pulo.mp3', vol: 0.4 },
  { at: W(5, 0), file: 'brilho.mp3', vol: 0.35 },
  { at: W(6, 'alto') - 0.9, file: 'pulo-curto.mp3', vol: 0.4 },
  { at: W(6, '3'), file: 'ding.mp3', vol: 0.35 },
  { at: W(7, 'terço'), file: 'ding.mp3', vol: 0.35 },
  { at: W(8, 'não'), file: 'alerta.mp3', vol: 0.3 },
  { at: W(9, 'gás'), file: 'ding.mp3', vol: 0.3 },
  { at: W(10, '80'), file: 'gelo.mp3', vol: 0.45 },
  { at: W(11, 'dia'), file: 'relogio.mp3', vol: 0.3 },
  { at: W(11, 'dia') + 1.0, file: 'relogio.mp3', vol: 0.3 },
  { at: W(11, 'dia') + 2.0, file: 'relogio.mp3', vol: 0.3 },
  { at: W(11, '37'), file: 'ding.mp3', vol: 0.35 },
  { at: W(12, 'dois'), file: 'ding.mp3', vol: 0.35 },
  { at: W(13, 0), file: 'whoosh.mp3', vol: 0.2 },
  { at: W(14, 'azul'), file: 'brilho.mp3', vol: 0.4 },
  { at: W(15, 'liga'), file: 'radio.mp3', vol: 0.3 },
  { at: W(16, 'mensagem'), file: 'radio2.mp3', vol: 0.25 },
  { at: W(16, '20'), file: 'ding.mp3', vol: 0.35 },
  { at: W(16, 'chegar'), file: 'brilho.mp3', vol: 0.35 },
  { at: W(17, 0), file: 'whoosh.mp3', vol: 0.25 },
  { at: W(17, 'passagem'), file: 'ding.mp3', vol: 0.4 },
];
