import { V3 } from './anim';
import { CamKey } from './sets';
import { F } from './timeline';

// ============================================================================
// RECEITAS DE CÂMERA — movimentos prontos, tirados de Shorts de história que deram certo.
// Cada receita devolve as chaves para <Cam keys={...} />. Use dentro da tomada:
//   <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, [0, 1.5, 0], { de: 5, para: 3.2 })} />
//
// Direção da câmera em volta do alvo:
//   yaw   = gira em volta (0 = de frente, + = vem pela direita do personagem, - = pela esquerda)
//   pitch = altura do olhar (+ = de cima, - = câmera BAIXA olhando para cima — dá peso e profundidade)
//   giro  = inclinação holandesa (rad, ~0.1–0.2): tensão, raiva, perigo
//   fov   = abertura (padrão 32; 40+ = grande-angular, exagera a profundidade como no vídeo da mina)
//
// Mapa de emoções (o que cada receita comunica):
//   revela        gancho: começa colado no OBJETO-MISTÉRIO e recua até mostrar quem está com ele
//   empurra       atenção / tensão crescendo (lento) — o padrão de quase toda fala
//   recua         isolamento, "olha o tamanho disso", final de cena
//   impacto       choque, raiva, virada: aproximação rápida de ~6 quadros que chega NA palavra
//   lateral       travelling que revela alguém entrando pela borda do quadro
//   orbita        destaque / herói / objeto importante
//   grua          sobe = alívio, vitória, plano geral; desce = chegada, começo de cena
//   queda         desastre: a câmera tomba e afunda junto com o personagem
//   voltaAoInicio fecha o vídeo no mesmo enquadramento do primeiro plano (loop)
// ============================================================================

type Dir = { yaw?: number; pitch?: number; fov?: number; giro?: number };

export const orbitPos = (alvo: V3, dist: number, yaw = 0, pitch = 0): V3 => [
  alvo[0] + dist * Math.sin(yaw) * Math.cos(pitch),
  alvo[1] + dist * Math.sin(pitch),
  alvo[2] + dist * Math.cos(yaw) * Math.cos(pitch),
];

const key = (t: number, alvo: V3, dist: number, d: Dir = {}): CamKey => [t, orbitPos(alvo, dist, d.yaw ?? 0, d.pitch ?? 0), alvo, d.fov ?? 32, d.giro ?? 0];

export const CAM = {
  // Gancho: colado no objeto (com lente aberta) e recua até o personagem. `ate` = quando termina de recuar.
  revela(t0: number, t1: number, objeto: V3, final: V3, o: Dir & { de?: number; para?: number; ate?: number; yaw1?: number; pitch1?: number } = {}): CamKey[] {
    const ate = o.ate ?? t0 + (t1 - t0) * 0.6;
    return [
      key(t0, objeto, o.de ?? 0.9, { ...o, fov: o.fov ?? 40 }),
      key(ate, final, o.para ?? 4.6, { yaw: o.yaw1 ?? o.yaw, pitch: o.pitch1 ?? o.pitch, fov: 32, giro: 0 }),
      key(t1, final, (o.para ?? 4.6) * 0.92, { yaw: o.yaw1 ?? o.yaw, pitch: o.pitch1 ?? o.pitch, fov: 32 }),
    ];
  },

  // Aproximação suave (ou afastamento, se `para` > `de`).
  empurra(t0: number, t1: number, alvo: V3, o: Dir & { de?: number; para?: number; alvo1?: V3; yaw1?: number; pitch1?: number } = {}): CamKey[] {
    return [key(t0, alvo, o.de ?? 5.2, o), key(t1, o.alvo1 ?? alvo, o.para ?? 3.6, { ...o, yaw: o.yaw1 ?? o.yaw, pitch: o.pitch1 ?? o.pitch })];
  },

  recua(t0: number, t1: number, alvo: V3, o: Dir & { de?: number; para?: number; alvo1?: V3 } = {}): CamKey[] {
    return CAM.empurra(t0, t1, alvo, { ...o, de: o.de ?? 3.2, para: o.para ?? 6.5 });
  },

  // Aproximação lenta até ~6 quadros antes da palavra, depois um tranco rápido que CHEGA na palavra `at`.
  // Use com um efeito 'velocidade' no Film (EFEITOS) para o estouro de linhas.
  impacto(t0: number, at: number, t1: number, alvo: V3, o: Dir & { de?: number; meio?: number; para?: number; alvo1?: V3 } = {}): CamKey[] {
    const pre = Math.max(t0 + F, at - 6 * F);
    const a1 = o.alvo1 ?? alvo;
    return [
      key(t0, alvo, o.de ?? 5, { ...o, giro: 0 }),
      key(pre, alvo, o.meio ?? (o.de ?? 5) * 0.88, { ...o, giro: 0 }),
      key(at, a1, o.para ?? 2.6, o),
      key(Math.max(at + F, t1), a1, (o.para ?? 2.6) * 0.95, o),
    ];
  },

  // Travelling lateral: a câmera anda de lado, do alvo `de` ao alvo `ate` (revela quem entra pela borda).
  lateral(t0: number, t1: number, de: V3, ate: V3, o: Dir & { dist?: number; dist1?: number } = {}): CamKey[] {
    return [key(t0, de, o.dist ?? 4.8, o), key(t1, ate, o.dist1 ?? o.dist ?? 4.8, o)];
  },

  // Órbita em volta do alvo (yaw0 → yaw1).
  orbita(t0: number, t1: number, alvo: V3, o: Dir & { dist?: number; yaw0?: number; yaw1?: number } = {}): CamKey[] {
    return [key(t0, alvo, o.dist ?? 4.5, { ...o, yaw: o.yaw0 ?? -0.5 }), key(t1, alvo, o.dist ?? 4.5, { ...o, yaw: o.yaw1 ?? 0.5 })];
  },

  // Grua: a câmera sobe (pitch0 → pitch1) e pode afastar (dist0 → dist1).
  grua(t0: number, t1: number, alvo: V3, o: Dir & { dist?: number; dist1?: number; pitch0?: number; pitch1?: number; alvo1?: V3 } = {}): CamKey[] {
    return [key(t0, alvo, o.dist ?? 6, { ...o, pitch: o.pitch0 ?? -0.05 }), key(t1, o.alvo1 ?? alvo, o.dist1 ?? o.dist ?? 6, { ...o, pitch: o.pitch1 ?? 0.6 })];
  },

  // Desastre: parado/empurrando até `at`, então tomba (giro) e afunda o olhar para `chao`.
  queda(t0: number, at: number, t1: number, alvo: V3, chao: V3, o: Dir & { dist?: number; dist1?: number } = {}): CamKey[] {
    return [
      key(t0, alvo, o.dist ?? 4.2, { ...o, giro: 0 }),
      key(at, alvo, (o.dist ?? 4.2) * 0.9, { ...o, giro: 0 }),
      key(Math.max(at + 0.5, t1), chao, o.dist1 ?? 3.4, { ...o, pitch: (o.pitch ?? 0) + 0.45, giro: o.giro ?? 0.22 }),
    ];
  },

  // Fecha no mesmo enquadramento do primeiro plano do vídeo (passe as chaves do primeiro plano).
  voltaAoInicio(t0: number, t1: number, daqui: CamKey, inicio: CamKey[]): CamKey[] {
    const alvo = inicio[0];
    return [[t0, daqui[1], daqui[2], daqui[3], daqui[4]], [t1, alvo[1], alvo[2], alvo[3], alvo[4]]];
  },
};

// ============================================================================
// EFEITOS DE TELA (2D, por cima da imagem) — ver EFEITOS em shots.tsx.
//   velocidade : estouro de linhas de velocidade (choque, virada) — dura ~0,35 s
//   flash      : clarão branco curto (impacto, ideia)
// ============================================================================
export type Efeito = { tipo: 'velocidade' | 'flash'; at: number; dur?: number; cor?: string };
