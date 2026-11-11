import * as THREE from 'three';
import { rand, V3 } from './anim';
import { Box, WarmLights } from './sets';
import { canvasTex, labelTex, tileTex, windowsTex } from './textures';

// ============================================================================
// CENÁRIOS DO ESTILO "E se...?" — lugares do dia a dia, cores saturadas, formas simples.
// Todos com o personagem na origem (chão em y = 0) e a câmera olhando para -Z.
// Área livre para os personagens: x de -2 a 2, z de -1 a 2.
//   RuaBairro    rua com casas, calçada, faixa de pedestre, carro, árvores (dia ou pôr do sol)
//   CorredorEscola  corredor com armários, mural, janelas e portas de sala
//   Enfermaria   maca, cortina, armário de remédios, cartaz
//   Quarto       cama, criado-mudo, janela, escrivaninha, tapete (dia ou noite)
//   Quadra       quadra coberta com linhas, gol e arquibancada com torcida
//   Telhados     topo de prédios ao pôr do sol, caixas d'água e antenas
//   Parque       grama, caminho, banco, árvores e lago
// Vitrine de todos: node tools/elenco.mjs Cenarios → out/cenarios.png
// ============================================================================

export type Hora = 'dia' | 'tarde' | 'noite';
const CEU: Record<Hora, { bg: string; sky: string; ground: string; sun: V3; power: number }> = {
  dia: { bg: '#9fd6ff', sky: '#ffffff', ground: '#8a7a68', sun: [-6, 9, 7], power: 2.4 },
  tarde: { bg: '#ffad7a', sky: '#ffd9b8', ground: '#7a4a5a', sun: [-8, 4, 5], power: 2.1 },
  noite: { bg: '#1b2a5c', sky: '#7f9cff', ground: '#1a1a33', sun: [-4, 6, 6], power: 0.9 },
};
const Luz = ({ hora = 'dia', fog = [16, 46] as [number, number] }: { hora?: Hora; fog?: [number, number] }) => {
  const c = CEU[hora];
  return <WarmLights sun={c.sun} bg={c.bg} sky={c.sky} ground={c.ground} power={c.power} fill={hora === 'noite' ? 0.7 : 1.0} fog={fog} />;
};

// ---------- peças reutilizáveis ----------
export const Arvore = ({ p, s = 1, cor = '#4caf50' }: { p: V3; s?: number; cor?: string }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 1.0, 0]} castShadow>
      <cylinderGeometry args={[0.13, 0.18, 2, 10]} />
      <meshStandardMaterial color="#8a5a3a" />
    </mesh>
    {[[0, 2.4, 0, 1.0], [0.5, 2.1, 0.2, 0.7], [-0.5, 2.2, -0.1, 0.75], [0.1, 2.9, -0.1, 0.7]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} castShadow>
        <sphereGeometry args={[r, 14, 10]} />
        <meshStandardMaterial color={i % 2 ? cor : new THREE.Color(cor).multiplyScalar(0.85).getStyle()} roughness={0.9} />
      </mesh>
    ))}
  </group>
);

export const Casa = ({ p, cor, telhado = '#c4513c', larg = 4, alt = 3, porta = '#5a3a24' }: { p: V3; cor: string; telhado?: string; larg?: number; alt?: number; porta?: string }) => (
  <group position={p}>
    <Box p={[0, alt / 2, 0]} s={[larg, alt, 3]} map={windowsTex(cor, 1, 3)} />
    {[1, -1].map((s) => (
      <mesh key={s} position={[s * larg * 0.26, alt + 0.36, 0]} rotation={[0, 0, s * -0.32]} castShadow>
        <boxGeometry args={[larg * 0.58, 0.16, 3.3]} />
        <meshStandardMaterial color={telhado} roughness={0.8} />
      </mesh>
    ))}
    <Box p={[0, alt + 0.02, 0]} s={[larg * 0.98, 0.06, 3]} c={cor} />
    <Box p={[0, 0.85, 1.52]} s={[0.9, 1.7, 0.06]} c={porta} r={0.5} />
  </group>
);

export const Carro = ({ p, cor = '#e63946', ry = 0 }: { p: V3; cor?: string; ry?: number }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box p={[0, 0.55, 0]} s={[3.2, 0.7, 1.5]} c={cor} r={0.35} />
    <Box p={[-0.2, 1.15, 0]} s={[1.8, 0.6, 1.4]} c={cor} r={0.35} />
    <Box p={[-0.2, 1.15, 0]} s={[1.6, 0.45, 1.45]} c="#bfe3ff" r={0.1} />
    {[-1.05, 1.05].map((x) =>
      [-0.72, 0.72].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.32, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.22, 18]} />
          <meshStandardMaterial color="#1d1d22" />
        </mesh>
      )),
    )}
    <Box p={[1.6, 0.6, 0.5]} s={[0.05, 0.16, 0.3]} c="#fff6c8" />
    <Box p={[1.6, 0.6, -0.5]} s={[0.05, 0.16, 0.3]} c="#fff6c8" />
  </group>
);

const Poste = ({ p, acesa = false }: { p: V3; acesa?: boolean }) => (
  <group position={p}>
    <mesh position={[0, 2, 0]}>
      <cylinderGeometry args={[0.06, 0.08, 4, 10]} />
      <meshStandardMaterial color="#3a3f4a" />
    </mesh>
    <Box p={[0.35, 3.95, 0]} s={[0.8, 0.08, 0.1]} c="#3a3f4a" />
    <mesh position={[0.7, 3.85, 0]}>
      <sphereGeometry args={[0.16, 12, 8]} />
      <meshStandardMaterial color="#fff2c4" emissive="#ffd27a" emissiveIntensity={acesa ? 2 : 0.4} />
    </mesh>
  </group>
);

// Bonequinhos simples para torcida e fundo (cabeça preta + corpo colorido).
export const Torcida = ({ linhas = 4, por = 14, x0 = -6, z0 = -6, dy = 0.55, dz = -0.8, t = 0 }: { linhas?: number; por?: number; x0?: number; z0?: number; dy?: number; dz?: number; t?: number }) => (
  <>
    {Array.from({ length: linhas }, (_, l) =>
      Array.from({ length: por }, (_, i) => {
        const k = l * por + i;
        const cor = ['#ff6a3d', '#3fbf6a', '#a98bff', '#ffd23a', '#4b7bd8', '#ff8fc2', '#e8edf2'][k % 7];
        const pulo = Math.max(0, Math.sin(t * 6 + k * 1.3)) * 0.06;
        return (
          <group key={k} position={[x0 + i * ((-x0 * 2) / (por - 1)) + (rand(k) - 0.5) * 0.2, 0.6 + l * dy + pulo, z0 + l * dz]}>
            <mesh>
              <capsuleGeometry args={[0.14, 0.22, 4, 8]} />
              <meshStandardMaterial color={cor} />
            </mesh>
            <mesh position={[0, 0.36, 0]}>
              <sphereGeometry args={[0.17, 12, 10]} />
              <meshStandardMaterial color="#141419" roughness={0.3} />
            </mesh>
          </group>
        );
      }),
    )}
  </>
);

// ---------- Rua de bairro ----------
const asfaltoTex = () =>
  canvasTex('asfalto', 256, 256, (c) => {
    c.fillStyle = '#4a4d55';
    c.fillRect(0, 0, 256, 256);
    c.globalAlpha = 0.08;
    for (let i = 0; i < 400; i++) {
      c.fillStyle = i % 2 ? '#000' : '#fff';
      c.fillRect((i * 71) % 256, (i * 37) % 256, 3, 3);
    }
  }, [12, 12]);

export const RuaBairro = ({ hora = 'dia', faixa = true, carro = true }: { hora?: Hora; faixa?: boolean; carro?: boolean }) => (
  <group>
    <Luz hora={hora} fog={[18, 55]} />
    {/* calçada onde ficam os personagens */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 2]}>
      <planeGeometry args={[60, 8]} />
      <meshStandardMaterial map={tileTex('#e6dccb', '#d9cdb8', 40)} roughness={0.9} />
    </mesh>
    {/* rua */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.12, -3.5]}>
      <planeGeometry args={[60, 6]} />
      <meshStandardMaterial map={asfaltoTex()} roughness={0.95} />
    </mesh>
    <Box p={[0, -0.06, -0.45]} s={[60, 0.12, 0.2]} c="#cfc6b6" />
    {Array.from({ length: 14 }, (_, i) => (
      <Box key={i} p={[-26 + i * 4, -0.11, -3.5]} s={[1.8, 0.01, 0.15]} c="#f5d547" />
    ))}
    {faixa && Array.from({ length: 6 }, (_, i) => <Box key={`f${i}`} p={[4.5, -0.105, -1.2 - i * 0.9]} s={[1.6, 0.01, 0.5]} c="#f4f4f0" />)}
    {/* calçada do outro lado + casas */}
    <Box p={[0, -0.03, -8]} s={[60, 0.18, 3]} c="#e6dccb" />
    <Casa p={[-9, 0, -11]} cor="#f2a65a" />
    <Casa p={[-4.3, 0, -11]} cor="#7fc8a9" telhado="#4a6fa5" larg={4.2} alt={3.6} />
    <Casa p={[0.4, 0, -11]} cor="#f6e27a" telhado="#d9534f" />
    <Casa p={[5, 0, -11]} cor="#b9a3e3" telhado="#5c4a8a" larg={4.2} alt={3.4} />
    <Casa p={[9.6, 0, -11]} cor="#f28fa6" />
    <Arvore p={[-6.6, 0, -8.2]} s={0.9} />
    <Arvore p={[2.7, 0, -8.2]} s={1.05} />
    <Arvore p={[7.3, 0, -8.2]} s={0.85} cor="#5cbf60" />
    <Poste p={[-2.5, 0, -0.75]} acesa={hora === 'noite'} />
    {carro && <Carro p={[-5.5, -0.12, -2.4]} cor="#e63946" />}
    {/* muro baixo e vasos atrás dos personagens não: a rua fica atrás, para dar profundidade */}
    <Arvore p={[6.5, 0, 0.2]} s={0.8} />
  </group>
);

// ---------- Corredor da escola ----------
export const CorredorEscola = ({ parede = '#f3e6c8', faixa = '#3a6aa6' }: { parede?: string; faixa?: string }) => (
  <group>
    <WarmLights sun={[-3, 8, 6]} bg="#e9dcc0" sky="#fffaf0" ground="#8a7a68" fill={1.1} fog={[16, 40]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 30]} />
      <meshStandardMaterial map={tileTex('#e9edf2', '#c9d3de', 22)} roughness={0.35} />
    </mesh>
    <Box p={[0, 3, -3]} s={[24, 6, 0.3]} c={parede} />
    <Box p={[0, 0.5, -2.84]} s={[24, 1.0, 0.04]} c={faixa} />
    {/* armários */}
    {Array.from({ length: 12 }, (_, i) => {
      const x = -6.6 + i * 0.62 + (i >= 6 ? 2.4 : 0);
      const cor = ['#ff6a3d', '#ffd23a', '#3fbf6a', '#4b7bd8'][Math.floor(i / 3) % 4];
      return (
        <group key={i} position={[x, 0, -2.6]}>
          <Box p={[0, 1.2, 0]} s={[0.58, 2.4, 0.5]} c={cor} r={0.4} />
          {[0, 1, 2].map((k) => <Box key={k} p={[0, 2.0 - k * 0.07, 0.26]} s={[0.36, 0.025, 0.01]} c="#2a2a30" />)}
          <Box p={[0.2, 1.25, 0.26]} s={[0.04, 0.16, 0.02]} c="#d8dde3" />
        </group>
      );
    })}
    {/* porta de sala com número e mural */}
    <Box p={[0, 1.3, -2.83]} s={[1.6, 2.6, 0.06]} c="#8a5a3a" r={0.5} />
    <mesh position={[0, 2.85, -2.79]}>
      <planeGeometry args={[0.9, 0.3]} />
      <meshBasicMaterial map={labelTex('SALA 7', { w: 512, h: 170, bg: '#24382e', fg: '#f3cf6b' })} />
    </mesh>
    <Box p={[0, 4.2, -2.84]} s={[2.4, 1.1, 0.05]} c="#c99a5b" />
    {[[-0.7, 4.3, '#ffffff'], [0.1, 4.15, '#ffd23a'], [0.75, 4.35, '#a98bff']].map(([x, y, c], i) => (
      <Box key={i} p={[x as number, y as number, -2.8]} s={[0.5, 0.6, 0.02]} c={c as string} />
    ))}
    {/* janelas altas */}
    {[-5, 5].map((x) => (
      <Box key={x} p={[x, 4.4, -2.83]} s={[2.6, 1.2, 0.05]} c="#bfe6ff" r={0.1} />
    ))}
    {/* luzes do teto */}
    {[-4, 0, 4].map((x) => (
      <mesh key={x} position={[x, 5.9, -1]}>
        <boxGeometry args={[1.8, 0.08, 0.4]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff6dc" emissiveIntensity={1.2} />
      </mesh>
    ))}
  </group>
);

// ---------- Enfermaria ----------
export const Enfermaria = () => (
  <group>
    <WarmLights sun={[-3, 8, 6]} bg="#d8efea" sky="#ffffff" ground="#9ab" fill={1.1} fog={[14, 36]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 30]} />
      <meshStandardMaterial map={tileTex('#f4f7f6', '#dfe9e6', 20)} roughness={0.35} />
    </mesh>
    <Box p={[0, 3, -3]} s={[20, 6, 0.3]} c="#cfeee6" />
    <Box p={[0, 0.45, -2.84]} s={[20, 0.9, 0.04]} c="#7cc6b6" />
    {/* maca */}
    <group position={[-2.6, 0, -1.6]}>
      <Box p={[0, 0.75, 0]} s={[2.2, 0.18, 0.9]} c="#f6f6f2" r={0.5} />
      <Box p={[-0.85, 0.92, 0]} s={[0.5, 0.16, 0.7]} c="#ffffff" r={0.6} />
      {[-0.95, 0.95].map((x) => [-0.35, 0.35].map((z) => <Box key={`${x}${z}`} p={[x, 0.33, z]} s={[0.06, 0.66, 0.06]} c="#c9ced4" />))}
    </group>
    {/* cortina */}
    {Array.from({ length: 7 }, (_, i) => (
      <Box key={i} p={[-4.3 + i * 0.22, 1.9, -0.9 + Math.sin(i * 1.4) * 0.08]} s={[0.24, 3.0, 0.04]} c={i % 2 ? '#9fd8f0' : '#8ccbe6'} />
    ))}
    {/* armário de remédios com cruz */}
    <group position={[2.8, 0, -2.6]}>
      <Box p={[0, 1.1, 0]} s={[1.4, 2.2, 0.5]} c="#ffffff" r={0.4} />
      <Box p={[0, 1.7, 0.26]} s={[0.5, 0.14, 0.02]} c="#e63946" />
      <Box p={[0, 1.7, 0.26]} s={[0.14, 0.5, 0.02]} c="#e63946" />
      <Box p={[0, 0.9, 0.26]} s={[1.2, 0.02, 0.02]} c="#c9ced4" />
    </group>
    {/* cartaz do esqueleto */}
    <mesh position={[0.4, 3.3, -2.83]}>
      <planeGeometry args={[1.0, 1.4]} />
      <meshBasicMaterial map={labelTex('SAÚDE\nDOS OSSOS', { w: 360, h: 504, bg: '#ffffff', fg: '#3a6aa6', border: '#7cc6b6' })} />
    </mesh>
  </group>
);

// ---------- Quarto ----------
export const Quarto = ({ noite = false, cama = '#4b7bd8' }: { noite?: boolean; cama?: string }) => (
  <group>
    {noite ? (
      <WarmLights sun={[-2, 6, 5]} bg="#1f2f6b" sky="#8aa4ff" ground="#1a1a33" power={1.0} fill={0.8} fog={[12, 30]} />
    ) : (
      <WarmLights sun={[-4, 7, 6]} bg="#ffe2b8" sky="#fff6e6" ground="#8a6a4a" fill={1.0} fog={[12, 30]} />
    )}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial map={tileTex('#c98a55', '#b97d4c', 14)} roughness={0.6} />
    </mesh>
    <Box p={[0, 3, -3]} s={[16, 6, 0.3]} c={noite ? '#2d3f86' : '#9fd0c8'} />
    {/* janela */}
    <Box p={[2.2, 3.0, -2.83]} s={[1.8, 1.6, 0.06]} c={noite ? '#0d1638' : '#bfe6ff'} r={0.1} />
    <Box p={[2.2, 3.0, -2.79]} s={[0.07, 1.6, 0.02]} c="#ffffff" />
    <Box p={[2.2, 3.0, -2.79]} s={[1.8, 0.07, 0.02]} c="#ffffff" />
    {noite && (
      <mesh position={[2.6, 3.4, -2.78]}>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial color="#fff6c4" />
      </mesh>
    )}
    {/* cama */}
    <group position={[-1.9, 0, -1.7]}>
      <Box p={[0, 0.3, 0]} s={[1.6, 0.6, 2.6]} c="#8a5a3a" />
      <Box p={[0, 0.7, 0.1]} s={[1.5, 0.25, 2.3]} c="#ffffff" />
      <Box p={[0, 0.85, 0.35]} s={[1.55, 0.12, 1.8]} c={cama} />
      <Box p={[0, 0.9, -0.95]} s={[1.0, 0.2, 0.45]} c="#ffffff" r={0.7} />
      <Box p={[0, 0.9, -1.25]} s={[1.6, 1.2, 0.12]} c="#6e4329" />
    </group>
    {/* criado-mudo + despertador */}
    <Box p={[-0.6, 0.35, -2.5]} s={[0.6, 0.7, 0.5]} c="#a0754a" />
    <mesh position={[-0.6, 0.85, -2.45]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.16, 0.16, 0.1, 20]} />
      <meshStandardMaterial color="#e63946" />
    </mesh>
    {/* escrivaninha */}
    <Box p={[2.6, 0.75, -2.3]} s={[1.6, 0.08, 0.8]} c="#ffffff" />
    {[-0.7, 0.7].map((x) => <Box key={x} p={[2.6 + x, 0.37, -2.3]} s={[0.06, 0.75, 0.7]} c="#ffffff" />)}
    <Box p={[2.6, 1.1, -2.45]} s={[0.7, 0.5, 0.05]} c="#2a2a30" />
    {/* pôster e tapete */}
    <Box p={[-1.9, 3.3, -2.83]} s={[1.0, 1.3, 0.03]} c="#ffd23a" />
    <Box p={[-1.9, 3.3, -2.8]} s={[0.6, 0.6, 0.02]} c="#ff6a3d" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.01, 0.4]}>
      <circleGeometry args={[1.3, 32]} />
      <meshStandardMaterial color={noite ? '#5a4a9a' : '#ff8a5c'} />
    </mesh>
  </group>
);

// ---------- Quadra coberta com torcida ----------
export const Quadra = ({ t = 0, piso = '#e8873a', parede = '#3f52b5' }: { t?: number; piso?: string; parede?: string }) => (
  <group>
    <WarmLights sun={[-3, 10, 6]} bg="#2d3a8c" sky="#ffffff" ground="#7a4a2a" fill={1.1} fog={[18, 48]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={piso} roughness={0.5} />
    </mesh>
    {/* linhas */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -1]}>
      <ringGeometry args={[1.8, 1.9, 48]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <Box p={[0, 0.005, -1]} s={[0.1, 0.01, 14]} c="#ffffff" />
    <Box p={[-7, 0.005, -1]} s={[0.1, 0.01, 14]} c="#ffffff" />
    <Box p={[7, 0.005, -1]} s={[0.1, 0.01, 14]} c="#ffffff" />
    {/* gol */}
    <group position={[6.2, 0, -1]}>
      {[-1.5, 1.5].map((z) => <Box key={z} p={[0, 1.0, z]} s={[0.1, 2, 0.1]} c="#ffffff" />)}
      <Box p={[0, 2.0, 0]} s={[0.1, 0.1, 3.1]} c="#ffffff" />
      <Box p={[0.6, 1.0, 0]} s={[0.02, 2, 3.0]} c="#e8f0ff" r={0.9} />
    </group>
    {/* arquibancada + torcida */}
    {[0, 1, 2, 3, 4].map((l) => (
      <Box key={l} p={[0, 0.25 + l * 0.55, -6.2 - l * 0.8]} s={[16, 0.5 + l * 1.1, 0.8]} c={l % 2 ? '#d9dde6' : '#c4c9d6'} />
    ))}
    <Torcida t={t} linhas={5} por={16} x0={-7} z0={-6.2} dy={0.55} dz={-0.8} />
    <Box p={[0, 6, -11]} s={[30, 8, 0.3]} c={parede} />
    {[-6, 0, 6].map((x) => (
      <mesh key={x} position={[x, 8, -2]}>
        <boxGeometry args={[2.4, 0.12, 0.6]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff6dc" emissiveIntensity={1.4} />
      </mesh>
    ))}
  </group>
);

// ---------- Telhados ao pôr do sol ----------
export const Telhados = () => (
  <group>
    <WarmLights sun={[-8, 3, 4]} bg="#c86aa8" sky="#ffd2a8" ground="#5a3a6a" power={2.0} fill={0.9} fog={[14, 45]} />
    {/* laje onde os personagens ficam */}
    <Box p={[0, -0.15, 0.5]} s={[9, 0.3, 6]} c="#c9b4a4" />
    <Box p={[0, 0.25, 3.45]} s={[9, 0.5, 0.15]} c="#b8574a" />
    <Box p={[-4.45, 0.25, 0.5]} s={[0.15, 0.5, 6]} c="#b8574a" />
    {/* caixa d'água e antena */}
    <mesh position={[2.8, 0.7, -1.6]} castShadow>
      <cylinderGeometry args={[0.6, 0.6, 1.4, 20]} />
      <meshStandardMaterial color="#3f8ad8" />
    </mesh>
    <mesh position={[-2.8, 1.5, -1.8]}>
      <cylinderGeometry args={[0.03, 0.03, 3, 6]} />
      <meshStandardMaterial color="#444" />
    </mesh>
    <Box p={[-2.8, 2.7, -1.8]} s={[1.0, 0.04, 0.04]} c="#444" />
    {/* prédios em volta, abaixo e atrás */}
    {[[-8, -6, 4, 5, '#d98c5f'], [-3, -9, 5, 8, '#8a6fc8'], [3, -8, 4, 6, '#e8b85a'], [8, -6, 4, 4, '#5fa3b8'], [12, -10, 5, 9, '#c7765a'], [-12, -10, 5, 7, '#b85a7a']].map(
      ([x, z, w, h, c], i) => <Box key={i} p={[x as number, (h as number) / 2 - 3, z as number]} s={[w as number, h as number, 3]} map={windowsTex(c as string, 4, 3)} />,
    )}
    {/* varal com fios */}
    <mesh position={[0, 1.6, -2.4]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.01, 0.01, 6, 4]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {[-1.5, -0.6, 0.6].map((x, i) => (
      <Box key={x} p={[x, 1.3, -2.4]} s={[0.5, 0.6, 0.02]} c={['#ffd23a', '#ff8fc2', '#7fe3ff'][i]} />
    ))}
  </group>
);

// ---------- Parque com lago ----------
export const Parque = ({ hora = 'dia' }: { hora?: Hora }) => (
  <group>
    <Luz hora={hora} fog={[18, 55]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#7cc46a" roughness={0.95} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.6]}>
      <planeGeometry args={[30, 2.2]} />
      <meshStandardMaterial color="#e8d6a8" roughness={0.95} />
    </mesh>
    {/* lago */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0.02, -7]} scale={[1.6, 1, 1]}>
      <circleGeometry args={[4, 40]} />
      <meshStandardMaterial color="#3fa7d8" roughness={0.1} metalness={0.1} />
    </mesh>
    {/* banco */}
    <group position={[-2.6, 0, -1.2]}>
      <Box p={[0, 0.5, 0]} s={[1.8, 0.1, 0.5]} c="#a0643a" />
      <Box p={[0, 0.85, -0.22]} s={[1.8, 0.4, 0.08]} c="#a0643a" />
      {[-0.75, 0.75].map((x) => <Box key={x} p={[x, 0.25, 0]} s={[0.08, 0.5, 0.45]} c="#3a3f4a" />)}
    </group>
    <Arvore p={[-5, 0, -3]} s={1.1} />
    <Arvore p={[4.5, 0, -2.5]} s={0.9} cor="#5cbf60" />
    <Arvore p={[-8, 0, -9]} s={1.3} />
    <Arvore p={[8, 0, -10]} s={1.2} />
    <Poste p={[2.6, 0, -0.6]} acesa={hora === 'noite'} />
    {/* patinhos */}
    {[0, 1, 2].map((i) => (
      <group key={i} position={[-0.5 + i * 0.6, 0.12, -6 - i * 0.3]}>
        <mesh>
          <sphereGeometry args={[0.15, 10, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.12, 0.12, 0]}>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    ))}
  </group>
);
