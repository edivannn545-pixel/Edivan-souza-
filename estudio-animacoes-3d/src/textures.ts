import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';

// ---------- Rostos ----------
// 43 expressões desenhadas em código (decal 512x512: olhos em (182,220) e (330,220), boca em (256,350)).
// Kit próprio (opcional): PNGs 512x512 transparentes em public/faces/<arquivo>.png e public/overlays/<arquivo>.png,
// com os nomes da lista abaixo. Depois de copiar o kit, mude KIT_PROPRIO para true.
export const KIT_PROPRIO = false;
export const FACES = {
  neutral: '01_neutral', happy: '02_happy', smile: '03_smile', bigSmile: '04_big_smile', laugh: '05_laugh',
  grin: '06_grin', closedSmile: '07_closed_smile', content: '08_content', wink: '09_wink', confident: '10_confident',
  smug: '11_smug', sideEye: '12_side_eye', suspicious: '13_suspicious', thinking: '14_thinking', curious: '15_curious',
  lookUp: '16_looking_up', lookDown: '17_looking_down', surprised: '18_surprised', shocked: '19_shocked',
  amazed: '20_amazed', confused: '21_confused', unsure: '22_unsure', worried: '23_worried', anxious: '24_anxious',
  nervous: '25_nervous', panic: '26_panic', scared: '27_scared', terrified: '28_terrified', anger: '29_anger',
  furious: '30_furious', annoyed: '31_annoyed', frustrated: '32_frustrated', disgusted: '33_disgusted',
  sick: '34_sick', tired: '35_tired', sleepy: '36_sleepy', bored: '37_bored', deadpan: '38_deadpan',
  dizzy: '39_dizzy', drunk: '40_drunk', starstruck: '41_starstruck', inLove: '42_in_love', knockedOut: '43_knocked_out',
} as const;
export type FaceName = keyof typeof FACES;

export const OVERLAYS = {
  blush: 'E1_blush', stress: 'E2_stress_lines', sparkle: 'E3_sparkle', sweat: 'E4_sweat_drop',
  sweat3: 'E5_sweat_drops_3', tears: 'E6_tears', vein: 'E7_anger_vein', shading: 'E8_shading',
} as const;
export type OverlayName = keyof typeof OVERLAYS;

// Receita de cada expressão: [olhos, sobrancelhas, boca]
type Eyes = 'open' | 'wide' | 'dot' | 'happy' | 'closed' | 'half' | 'side' | 'up' | 'down' | 'wink' | 'angry' | 'heart' | 'star' | 'x' | 'spiral' | 'tiny';
type Brows = 'none' | 'neutral' | 'raised' | 'angry' | 'worried' | 'oneUp' | 'flat';
type Mouth = 'smile' | 'smallSmile' | 'bigSmile' | 'laugh' | 'grin' | 'o' | 'O' | 'flat' | 'frown' | 'wavy' | 'teeth' | 'smirk' | 'tongue' | 'small' | 'shout';
const RECEITA: Record<FaceName, [Eyes, Brows, Mouth]> = {
  neutral: ['open', 'neutral', 'small'], happy: ['open', 'raised', 'bigSmile'], smile: ['open', 'neutral', 'smile'],
  bigSmile: ['wide', 'raised', 'bigSmile'], laugh: ['happy', 'raised', 'laugh'], grin: ['open', 'raised', 'grin'],
  closedSmile: ['happy', 'neutral', 'smile'], content: ['closed', 'neutral', 'smallSmile'], wink: ['wink', 'oneUp', 'smile'],
  confident: ['half', 'angry', 'smirk'], smug: ['half', 'oneUp', 'smirk'], sideEye: ['side', 'flat', 'flat'],
  suspicious: ['half', 'angry', 'flat'], thinking: ['up', 'oneUp', 'small'], curious: ['wide', 'oneUp', 'o'],
  lookUp: ['up', 'raised', 'o'], lookDown: ['down', 'worried', 'small'], surprised: ['wide', 'raised', 'o'],
  shocked: ['wide', 'raised', 'O'], amazed: ['dot', 'raised', 'O'], confused: ['side', 'oneUp', 'wavy'],
  unsure: ['open', 'worried', 'wavy'], worried: ['open', 'worried', 'frown'], anxious: ['open', 'worried', 'wavy'],
  nervous: ['wide', 'worried', 'teeth'], panic: ['tiny', 'raised', 'shout'], scared: ['wide', 'worried', 'O'],
  terrified: ['tiny', 'worried', 'shout'], anger: ['angry', 'angry', 'frown'], furious: ['angry', 'angry', 'shout'],
  annoyed: ['half', 'flat', 'flat'], frustrated: ['angry', 'angry', 'teeth'], disgusted: ['half', 'angry', 'tongue'],
  sick: ['closed', 'worried', 'wavy'], tired: ['half', 'worried', 'flat'], sleepy: ['closed', 'flat', 'small'],
  bored: ['half', 'flat', 'flat'], deadpan: ['half', 'flat', 'flat'], dizzy: ['spiral', 'none', 'wavy'],
  drunk: ['half', 'raised', 'smirk'], starstruck: ['star', 'raised', 'bigSmile'], inLove: ['heart', 'raised', 'smile'],
  knockedOut: ['x', 'none', 'tongue'],
};

const INK = '#26232a';
const EYES: [number, number][] = [
  [182, 220],
  [330, 220],
];

const line = (c: CanvasRenderingContext2D, w = 11) => {
  c.strokeStyle = INK;
  c.lineWidth = w;
  c.lineCap = 'round';
  c.lineJoin = 'round';
};

const star = (c: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) => {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  line(c, 6);
  c.stroke();
};

const heart = (c: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  c.beginPath();
  c.moveTo(x, y + s * 0.9);
  c.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
  c.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
  c.fillStyle = '#e8364c';
  c.fill();
};

const drawEye = (c: CanvasRenderingContext2D, kind: Eyes, x: number, y: number, side: number, skin: string) => {
  const open = (rx: number, ry: number, pr: number, dx = 0, dy = 0) => {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = '#fff';
    c.fill();
    line(c, 9);
    c.stroke();
    c.beginPath();
    c.ellipse(x + dx, y + dy, pr, pr * 1.25, 0, 0, Math.PI * 2);
    c.fillStyle = INK;
    c.fill();
    c.beginPath();
    c.arc(x + dx - pr * 0.35, y + dy - pr * 0.45, pr * 0.32, 0, Math.PI * 2);
    c.fillStyle = '#fff';
    c.fill();
  };
  switch (kind) {
    case 'open': return open(26, 32, 12);
    case 'wide': return open(31, 38, 10);
    case 'tiny': return open(31, 38, 5);
    case 'side': return open(26, 32, 11, 11 * side + 3, 3);
    case 'up': return open(26, 32, 11, 2, -14);
    case 'down': return open(26, 32, 11, 0, 14);
    case 'dot':
      c.beginPath();
      c.ellipse(x, y, 14, 18, 0, 0, Math.PI * 2);
      c.fillStyle = INK;
      return c.fill();
    case 'happy':
      line(c);
      c.beginPath();
      c.arc(x, y + 14, 26, Math.PI * 1.12, Math.PI * 1.88);
      return c.stroke();
    case 'closed':
      line(c);
      c.beginPath();
      c.arc(x, y - 12, 26, Math.PI * 0.15, Math.PI * 0.85);
      return c.stroke();
    case 'wink':
      return side < 0 ? open(26, 32, 12) : drawEye(c, 'happy', x, y, side, skin);
    case 'half':
    case 'angry': {
      // Desenha só a parte do olho abaixo da pálpebra (recorte), sem pintar cor de pele por cima:
      // assim não aparece um retângulo de outra cor sobre o rosto.
      c.save();
      c.beginPath();
      if (kind === 'half') c.rect(x - 40, y - 2, 80, 60);
      else {
        c.moveTo(x - 40, y - 34 + (side < 0 ? 4 : 22) + (side < 0 ? -2 : 0));
        c.lineTo(x + 40, y - 34 + (side < 0 ? 22 : 4));
        c.lineTo(x + 40, y + 60);
        c.lineTo(x - 40, y + 60);
      }
      c.clip();
      open(26, 32, 12, 0, 6);
      c.restore();
      line(c, 9);
      c.beginPath();
      if (kind === 'half') {
        c.moveTo(x - 27, y - 2);
        c.lineTo(x + 27, y - 2);
      } else {
        c.moveTo(x - 26, y - 34 + (side < 0 ? 4 : 22));
        c.lineTo(x + 26, y - 34 + (side < 0 ? 22 : 4));
      }
      return c.stroke();
    }
    case 'heart': return heart(c, x, y, 30);
    case 'star': return star(c, x, y, 34, '#ffd23a');
    case 'x':
      line(c);
      c.beginPath();
      c.moveTo(x - 20, y - 20);
      c.lineTo(x + 20, y + 20);
      c.moveTo(x + 20, y - 20);
      c.lineTo(x - 20, y + 20);
      return c.stroke();
    case 'spiral':
      line(c, 7);
      c.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.2) c.lineTo(x + Math.cos(a * side) * a * 1.6, y + Math.sin(a * side) * a * 1.6);
      return c.stroke();
  }
};

const drawBrow = (c: CanvasRenderingContext2D, kind: Brows, x: number, y: number, side: number) => {
  if (kind === 'none') return;
  line(c, 12);
  c.beginPath();
  const by = y - 62;
  if (kind === 'neutral') c.arc(x, by + 26, 30, Math.PI * 1.25, Math.PI * 1.75);
  else if (kind === 'raised' || (kind === 'oneUp' && side > 0)) c.arc(x, by + 6, 30, Math.PI * 1.22, Math.PI * 1.78);
  else if (kind === 'oneUp' || kind === 'flat') {
    c.moveTo(x - 26, by + 6);
    c.lineTo(x + 26, by + 6);
  } else if (kind === 'angry') {
    // ponta de dentro (perto do nariz) baixa
    c.moveTo(x - 28 * side, by + 18);
    c.lineTo(x + 26 * side, by - 6);
  } else if (kind === 'worried') {
    // ponta de dentro alta
    c.moveTo(x - 28 * side, by - 8);
    c.lineTo(x + 26 * side, by + 14);
  }
  c.stroke();
};

const drawMouth = (c: CanvasRenderingContext2D, kind: Mouth) => {
  const x = 256;
  const y = 350;
  const dark = '#2a1f24';
  const tongue = (tx: number, ty: number, w: number) => {
    c.beginPath();
    c.ellipse(tx, ty, w, w * 0.55, 0, Math.PI, 0);
    c.fillStyle = '#e45a6a';
    c.fill();
  };
  line(c);
  c.beginPath();
  switch (kind) {
    case 'small':
      c.moveTo(x - 18, y);
      c.quadraticCurveTo(x, y + 6, x + 18, y);
      return c.stroke();
    case 'smile':
      c.arc(x, y - 40, 58, Math.PI * 0.22, Math.PI * 0.78);
      return c.stroke();
    case 'smallSmile':
      c.arc(x, y - 22, 34, Math.PI * 0.25, Math.PI * 0.75);
      return c.stroke();
    case 'smirk':
      c.moveTo(x - 40, y + 4);
      c.quadraticCurveTo(x + 10, y + 16, x + 46, y - 14);
      return c.stroke();
    case 'flat':
      c.moveTo(x - 32, y + 4);
      c.lineTo(x + 32, y + 4);
      return c.stroke();
    case 'frown':
      c.arc(x, y + 44, 46, Math.PI * 1.22, Math.PI * 1.78);
      return c.stroke();
    case 'wavy':
      c.moveTo(x - 42, y + 4);
      for (let i = 1; i <= 6; i++) c.lineTo(x - 42 + i * 14, y + (i % 2 ? -8 : 6));
      return c.stroke();
    case 'o':
    case 'O':
    case 'shout': {
      const [rx, ry] = kind === 'o' ? [14, 18] : kind === 'O' ? [30, 40] : [52, 44];
      c.ellipse(x, y + 6, rx, ry, 0, 0, Math.PI * 2);
      c.fillStyle = dark;
      c.fill();
      c.stroke();
      if (kind !== 'o') tongue(x, y + 6 + ry * 0.75, rx * 0.7);
      return;
    }
    case 'bigSmile':
    case 'laugh':
    case 'tongue': {
      const w = kind === 'laugh' ? 70 : 62;
      c.moveTo(x - w, y - 22);
      c.quadraticCurveTo(x, y - 8, x + w, y - 22);
      c.quadraticCurveTo(x + w * 0.8, y + (kind === 'laugh' ? 70 : 56), x, y + (kind === 'laugh' ? 72 : 58));
      c.quadraticCurveTo(x - w * 0.8, y + (kind === 'laugh' ? 70 : 56), x - w, y - 22);
      c.closePath();
      c.fillStyle = kind === 'tongue' ? '#fff0' : dark;
      if (kind !== 'tongue') {
        c.fill();
        c.save();
        c.clip();
        tongue(x, y + 58, 34);
        c.restore();
        c.stroke();
      } else {
        c.beginPath();
        c.arc(x, y - 30, 50, Math.PI * 0.25, Math.PI * 0.75);
        c.stroke();
        c.beginPath();
        c.ellipse(x + 14, y + 22, 20, 26, 0.2, 0, Math.PI * 2);
        c.fillStyle = '#e45a6a';
        c.fill();
        line(c, 7);
        c.stroke();
      }
      return;
    }
    case 'grin':
    case 'teeth': {
      const w = kind === 'grin' ? 62 : 48;
      c.roundRect(x - w, y - 22, w * 2, 44, 20);
      c.fillStyle = '#fff';
      c.fill();
      c.stroke();
      line(c, 5);
      c.beginPath();
      c.moveTo(x - w, y);
      c.lineTo(x + w, y);
      for (let i = -2; i <= 2; i++) {
        c.moveTo(x + i * (w / 3), y - 20);
        c.lineTo(x + i * (w / 3), y + 20);
      }
      return c.stroke();
    }
  }
};

const drawOverlay = (c: CanvasRenderingContext2D, o: OverlayName) => {
  const drop = (x: number, y: number, s: number) => {
    c.beginPath();
    c.moveTo(x, y - s);
    c.quadraticCurveTo(x + s * 0.9, y + s * 0.3, x, y + s * 0.8);
    c.quadraticCurveTo(x - s * 0.9, y + s * 0.3, x, y - s);
    c.fillStyle = '#5fb7f0';
    c.fill();
    line(c, 4);
    c.stroke();
  };
  switch (o) {
    case 'blush':
      c.fillStyle = 'rgba(240,110,130,0.45)';
      for (const x of [150, 362]) {
        c.beginPath();
        c.ellipse(x, 292, 34, 18, 0, 0, Math.PI * 2);
        c.fill();
      }
      return;
    case 'sweat': return drop(392, 160, 26);
    case 'sweat3':
      drop(392, 150, 22);
      drop(420, 220, 16);
      return drop(110, 170, 18);
    case 'tears':
      c.fillStyle = 'rgba(95,183,240,0.85)';
      for (const [x] of EYES) c.fillRect(x - 12, 255, 24, 150);
      return;
    case 'vein':
      c.strokeStyle = '#e0283c';
      c.lineWidth = 10;
      c.beginPath();
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        c.moveTo(380 + dx * 8, 110 + dy * 8);
        c.quadraticCurveTo(380 + dx * 26, 110 + dy * 8, 380 + dx * 28, 110 + dy * 26);
      }
      return c.stroke();
    case 'sparkle':
      star(c, 395, 130, 30, '#ffd23a');
      return star(c, 430, 185, 16, '#ffd23a');
    case 'stress':
      c.strokeStyle = 'rgba(90,70,140,0.55)';
      c.lineWidth = 6;
      c.beginPath();
      for (let x = 150; x <= 362; x += 26) {
        c.moveTo(x, 40);
        c.lineTo(x, 120);
      }
      return c.stroke();
    case 'shading': {
      const g = c.createLinearGradient(0, 0, 0, 260);
      g.addColorStop(0, 'rgba(60,40,90,0.45)');
      g.addColorStop(1, 'rgba(60,40,90,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 512, 260);
      return;
    }
  }
};

// ---------- Kit opcional (PNG) ----------
const imgs: Record<string, HTMLImageElement> = {};
let loading: Promise<void> | null = null;
const loadImg = (key: string, src: string) =>
  new Promise<void>((res) => {
    const im = new Image();
    im.onload = () => {
      imgs[key] = im;
      res();
    };
    im.onerror = () => res(); // sem kit: usa o desenho em código
    im.src = src;
  });

export const loadFaces = () => {
  if (!loading) {
    if (!KIT_PROPRIO) return (loading = Promise.resolve());
    loading = Promise.all([
      ...Object.values(FACES).map((f) => loadImg(f, staticFile(`faces/${f}.png`))),
      ...Object.values(OVERLAYS).map((f) => loadImg(f, staticFile(`overlays/${f}.png`))),
    ]).then(() => undefined);
  }
  return loading;
};

export const useFacesReady = () => {
  const [handle] = useState(() => delayRender('Carregando rostos'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    loadFaces().then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok;
};

// Desenha o rosto no canvas. blink: 0 aberto, 0.5 meio fechado, 1 fechado.
// escala > 1 = olhos, sobrancelhas e boca maiores (estilo dos Shorts de referência), olhos um pouco mais baixos e afastados.
const olhos = (escala: number): [number, number][] =>
  escala > 1 ? EYES.map(([x, y], i) => [x + (i === 0 ? -14 : 14), y + 30] as [number, number]) : EYES;
const emVolta = (c: CanvasRenderingContext2D, x: number, y: number, k: number, draw: () => void) => {
  c.save();
  c.translate(x, y);
  c.scale(k, k);
  c.translate(-x, -y);
  draw();
  c.restore();
};
export function drawFace(c: CanvasRenderingContext2D, face: FaceName, blink: number, overlays: OverlayName[], skin: string, escala = 1) {
  c.clearRect(0, 0, 512, 512);
  if (overlays.includes('shading')) {
    const s = imgs[OVERLAYS.shading];
    if (s) c.drawImage(s, 0, 0);
    else drawOverlay(c, 'shading');
  }
  const kit = imgs[FACES[face]];
  if (kit) c.drawImage(kit, 0, 0);
  else {
    const [e, b, m] = RECEITA[face];
    olhos(escala).forEach(([x, y], i) =>
      emVolta(c, x, y, escala, () => {
        drawBrow(c, b, x, y, i === 0 ? -1 : 1);
        drawEye(c, e, x, y, i === 0 ? -1 : 1, skin);
      }),
    );
    emVolta(c, 256, escala > 1 ? 345 : 335, 1 + (escala - 1) * 0.6, () => {
      if (escala > 1) c.translate(0, 18);
      drawMouth(c, m);
    });
  }
  if (blink > 0) {
    for (const [x, y] of olhos(escala)) emVolta(c, x, y, escala, () => {
      c.fillStyle = skin;
      c.beginPath();
      if (blink >= 1) c.ellipse(x, y, 42, 46, 0, 0, Math.PI * 2);
      else c.rect(x - 44, y - 50, 88, 52);
      c.fill();
      line(c);
      c.beginPath();
      if (blink >= 1) c.arc(x, y - 22, 30, Math.PI * 0.2, Math.PI * 0.8);
      else {
        c.moveTo(x - 30, y + 2);
        c.lineTo(x + 30, y + 2);
      }
      c.stroke();
    });
  }
  for (const o of overlays) {
    if (o === 'shading') continue;
    const k = imgs[OVERLAYS[o]];
    if (k) c.drawImage(k, 0, 0);
    else drawOverlay(c, o);
  }
}

// ---------- Texturas feitas em código ----------
const cache = new Map<string, THREE.Texture>();
export const canvasTex = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const k = key + (rep ? rep.join('x') : '');
  const hit = cache.get(k);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  draw(cv.getContext('2d')!);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (rep) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rep[0], rep[1]);
  }
  cache.set(k, tex);
  return tex;
};

export const FONT = '"Arial Black", "Arial", sans-serif';

export const labelTex = (
  text: string,
  o: { w?: number; h?: number; bg?: string; fg?: string; border?: string; size?: number; radius?: number } = {},
) => {
  const w = o.w ?? 1024;
  const h = o.h ?? 256;
  return canvasTex(`label|${text}|${JSON.stringify(o)}`, w, h, (c) => {
    if (o.bg) {
      c.fillStyle = o.bg;
      c.beginPath();
      c.roundRect(4, 4, w - 8, h - 8, o.radius ?? 28);
      c.fill();
    }
    if (o.border) {
      c.strokeStyle = o.border;
      c.lineWidth = 14;
      c.beginPath();
      c.roundRect(14, 14, w - 28, h - 28, o.radius ?? 22);
      c.stroke();
    }
    const lines = text.split('\n');
    let size = o.size ?? (h * 0.62) / lines.length;
    c.font = `900 ${size}px ${FONT}`;
    const widest = Math.max(...lines.map((l) => c.measureText(l).width));
    if (widest > w * 0.88) size *= (w * 0.88) / widest;
    c.font = `900 ${size}px ${FONT}`;
    c.fillStyle = o.fg ?? '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    lines.forEach((l, i) => c.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.08));
  });
};

// Palavra de quadrinho (POW!, TOC!): letras com contorno grosso.
export const comicTex = (text: string, fill = '#ffd23a') =>
  canvasTex(`comic|${text}|${fill}`, 512, 256, (c) => {
    let size = 150;
    c.font = `900 ${size}px ${FONT}`;
    const wd = c.measureText(text).width;
    if (wd > 440) size *= 440 / wd;
    c.font = `900 ${size}px ${FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineJoin = 'round';
    c.strokeStyle = '#2a1708';
    c.lineWidth = 34;
    c.strokeText(text, 256, 132);
    c.fillStyle = fill;
    c.fillText(text, 256, 132);
  });

// Estampas de roupa: listras (verticais; horizontal=true para deitadas), xadrez, florido, acolchoado (jaqueta de inverno).
export const patternTex = (kind: 'listras' | 'xadrez' | 'florido' | 'acolchoado', a: string, b: string, horizontal = false) =>
  canvasTex(`pat|${kind}|${a}|${b}|${horizontal}`, 256, 256, (c) => {
    c.fillStyle = a;
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = b;
    if (kind === 'listras') {
      for (let i = 0; i < 256; i += 32) horizontal ? c.fillRect(0, i, 256, 14) : c.fillRect(i, 0, 14, 256);
    } else if (kind === 'xadrez') {
      c.globalAlpha = 0.55;
      for (let i = 0; i < 256; i += 64) {
        c.fillRect(i, 0, 26, 256);
        c.fillRect(0, i, 256, 26);
      }
      c.globalAlpha = 1;
      c.fillStyle = 'rgba(0,0,0,0.25)';
      for (let i = 32; i < 256; i += 64) {
        c.fillRect(i, 0, 4, 256);
        c.fillRect(0, i, 256, 4);
      }
    } else if (kind === 'florido') {
      for (let i = 0; i < 14; i++) {
        const x = (i * 71) % 256;
        const y = (i * 113) % 256;
        for (let k = 0; k < 5; k++) {
          const ang = (k / 5) * Math.PI * 2;
          c.beginPath();
          c.ellipse(x + Math.cos(ang) * 12, y + Math.sin(ang) * 12, 9, 6, ang, 0, Math.PI * 2);
          c.fill();
        }
      }
    } else {
      c.fillStyle = 'rgba(0,0,0,0.22)';
      for (let y = 0; y < 256; y += 42) c.fillRect(0, y, 256, 6);
    }
  }, horizontal ? [1, 4] : kind === 'acolchoado' ? [1, 2] : [4, 2]);

export const stripesTex = (base = '#2d3b66', stripe = '#e9ecf5') =>
  canvasTex(`stripes|${base}|${stripe}`, 256, 64, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 256, 64);
    c.fillStyle = stripe;
    for (let x = 0; x < 256; x += 16) c.fillRect(x + 6, 0, 3, 64);
  }, [6, 1]);

export const tileTex = (a: string, b: string, n = 8) =>
  canvasTex(`tile|${a}|${b}|${n}`, 512, 512, (c) => {
    const s = 512 / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        c.fillStyle = (i + j) % 2 ? a : b;
        c.fillRect(i * s, j * s, s, s);
      }
  });

export const cobbleTex = () =>
  canvasTex('cobble', 512, 512, (c) => {
    c.fillStyle = '#8a7a68';
    c.fillRect(0, 0, 512, 512);
    for (let j = 0; j < 8; j++)
      for (let i = 0; i < 8; i++) {
        const v = 150 + ((i * 7 + j * 13) % 5) * 9;
        c.fillStyle = `rgb(${v + 18},${v + 4},${v - 14})`;
        c.beginPath();
        c.roundRect(i * 64 + (j % 2) * 32 + 3, j * 64 + 3, 58, 58, 14);
        c.fill();
      }
  }, [10, 10]);

export const windowsTex = (wall: string, rows: number, cols: number) =>
  canvasTex(`win|${wall}|${rows}|${cols}`, 512, 512, (c) => {
    c.fillStyle = wall;
    c.fillRect(0, 0, 512, 512);
    const cw = 512 / cols;
    const rh = 512 / rows;
    for (let r = 0; r < rows; r++)
      for (let k = 0; k < cols; k++) {
        c.fillStyle = '#5a3a24';
        c.fillRect(k * cw + cw * 0.22, r * rh + rh * 0.18, cw * 0.56, rh * 0.62);
        c.fillStyle = (r + k) % 3 ? '#9cc3cf' : '#f6d38b';
        c.fillRect(k * cw + cw * 0.27, r * rh + rh * 0.23, cw * 0.46, rh * 0.52);
      }
  });

export const plasterTex = (base: string) =>
  canvasTex(`plaster|${base}`, 256, 256, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 256, 256);
    c.globalAlpha = 0.06;
    for (let i = 0; i < 500; i++) {
      c.fillStyle = i % 2 ? '#000' : '#fff';
      c.fillRect((i * 97) % 256, (i * 61) % 256, 6, 6);
    }
  }, [4, 4]);

export const starTex = () =>
  canvasTex('star', 128, 128, (c) => {
    c.fillStyle = '#fff6c4';
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 ? 14 : 60;
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      c.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r);
    }
    c.fill();
  });

// Papel com título (conta, boleto, carta, multa...).
export const paperTex = (title: string, footer = '', color = '#d33a2c') =>
  canvasTex(`paper|${title}|${footer}|${color}`, 256, 340, (c) => {
    c.fillStyle = '#fbfaf4';
    c.fillRect(0, 0, 256, 340);
    c.fillStyle = color;
    c.fillRect(0, 0, 256, 70);
    c.fillStyle = '#fff';
    c.font = `900 40px ${FONT}`;
    c.textAlign = 'center';
    c.fillText(title, 128, 50, 236);
    c.fillStyle = '#9a9a9a';
    for (let y = 100; y < 250; y += 26) c.fillRect(28, y, 200 - (y % 3) * 30, 10);
    c.fillStyle = color;
    c.font = `900 36px ${FONT}`;
    c.fillText(footer, 128, 310, 236);
  });

// Cédula genérica (símbolo configurável: 'R$', '$', '€'...).
export const moneyTex = (symbol = '$') =>
  canvasTex(`money|${symbol}`, 256, 128, (c) => {
    c.fillStyle = '#7fbf7a';
    c.fillRect(0, 0, 256, 128);
    c.strokeStyle = '#3e7d3f';
    c.lineWidth = 8;
    c.strokeRect(10, 10, 236, 108);
    c.fillStyle = '#3e7d3f';
    c.font = `900 56px ${FONT}`;
    c.textAlign = 'center';
    c.fillText(symbol, 128, 86);
  });

// Caixa de papelão / mercadoria genérica.
export const crateTex = (label = '') =>
  canvasTex(`crate|${label}`, 256, 256, (c) => {
    c.fillStyle = '#c99a5b';
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = '#b4854a';
    c.fillRect(110, 0, 36, 256);
    c.strokeStyle = '#8a6232';
    c.lineWidth = 8;
    c.strokeRect(4, 4, 248, 248);
    if (label) {
      c.fillStyle = '#5a3a1a';
      c.font = `900 44px ${FONT}`;
      c.textAlign = 'center';
      c.fillText(label, 128, 150, 220);
    }
  });
