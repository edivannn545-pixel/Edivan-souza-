import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { clamp01, easeInOut, lerp3, V3 } from './anim';
import { Field, Sign } from './props';
import { cobbleTex, crateTex, plasterTex, tileTex, windowsTex } from './textures';

// ---------- Câmera ----------
// Nunca para: segue as chaves, avança ~5%/s, acelera para dentro do corte e chega no plano seguinte já em movimento.
// fov é multiplicado por 1.6 porque no vertical 9:16 o fov do three é vertical.
// Afasta todas as câmeras um pouco (o elenco cabeça-esfera tem cabeça maior). 1 = distância original.
export const DIST = 1.22;
export type CamKey = [number, V3, V3, number?, number?]; // tempo, posição, alvo, fov, giro (inclinação holandesa, em radianos)
// shake = tremor da câmera em metros (decolagem, pouso). Função pura do tempo: o mesmo quadro sai sempre igual.
export const Cam = ({ t, t0, t1, keys, shake = 0 }: { t: number; t0: number; t1: number; keys: CamKey[]; shake?: number }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    let i = 0;
    while (i < keys.length - 1 && t > keys[i + 1][0]) i++;
    const a = keys[i];
    const b = keys[Math.min(i + 1, keys.length - 1)];
    const k = b[0] === a[0] ? 0 : easeInOut(clamp01((t - a[0]) / (b[0] - a[0])));
    const pos = lerp3(a[1], b[1], k);
    const tgt = lerp3(a[2], b[2], k);
    const fov = (a[3] ?? 32) + ((b[3] ?? 32) - (a[3] ?? 32)) * k;
    const creep = 1 - 0.015 * Math.max(0, t - t0); // aproximação automática bem leve: nunca corta o personagem
    const xin = clamp01((t - (t1 - 0.3)) / 0.5);
    const f = DIST * creep * (1 - 0.04 * xin * xin) * (1 + 0.07 * Math.pow(1 - clamp01((t - t0) / 0.4), 2));
    camera.position.set(tgt[0] + (pos[0] - tgt[0]) * f, tgt[1] + (pos[1] - tgt[1]) * f, tgt[2] + (pos[2] - tgt[2]) * f);
    if (shake > 0) {
      camera.position.x += shake * (Math.sin(t * 71) + 0.5 * Math.sin(t * 133));
      camera.position.y += shake * (Math.sin(t * 89 + 1) + 0.5 * Math.sin(t * 151));
    }
    camera.lookAt(tgt[0] + (shake > 0 ? shake * 0.5 * Math.sin(t * 97) : 0), tgt[1], tgt[2]);
    const roll = (a[4] ?? 0) + ((b[4] ?? 0) - (a[4] ?? 0)) * k;
    if (roll) camera.rotateZ(roll);
    camera.fov = fov * 1.6;
    camera.near = 0.05;
    camera.far = 200;
    camera.updateProjectionMatrix();
  }, [camera, t, t0, t1, keys, shake]);
  return null;
};

// ---------- Luz, fundo e névoa ----------
// Fundo e névoa vão direto na cena (attach dentro de um group prenderia no group).
const Sky = ({ bg, near, far }: { bg: string; near: number; far: number }) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, near, far);
  }, [scene, bg, near, far]);
  return null;
};

export const WarmLights = ({ sun = [-5, 7, 6] as V3, sky = '#fff1d8', ground = '#8a6040', power = 2.4, fill = 0.9, bg = '#f4c58c', fog = [14, 40] as [number, number] }) => (
  <>
    <Sky bg={bg} near={fog[0]} far={fog[1]} />
    <hemisphereLight args={[sky, ground, fill]} />
    <directionalLight
      position={sun}
      intensity={power}
      color="#ffe2b8"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
    <directionalLight position={[4, 3, -6]} intensity={0.8} color="#b9d4ff" />
  </>
);

export const Box = ({ p, s, c, map, r = 0.8 }: { p: V3; s: V3; c?: string; map?: THREE.Texture; r?: number }) => (
  <mesh position={p} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c ?? '#fff'} map={map} roughness={r} />
  </mesh>
);

// ---------- Rua com fachada (loja, banco, escola, prefeitura...) ----------
export const Street = ({ placa = 'LOJA', parede = '#efe0c2', porta = '#2d4a3a', bg = '#f2b97c' }: { placa?: string; parede?: string; porta?: string; bg?: string }) => (
  <group>
    <WarmLights sun={[-6, 6, 7]} bg={bg} fog={[16, 45]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial map={cobbleTex()} roughness={0.95} />
    </mesh>
    <Box p={[0, 0.06, -3.2]} s={[30, 0.12, 2.4]} c="#cdbb9f" />
    <Box p={[0, 3.6, -5.3]} s={[9, 7.2, 1]} c={parede} map={plasterTex(parede)} />
    {[-3.2, -1.6, 1.6, 3.2].map((x) => (
      <group key={x}>
        <mesh position={[x, 2.3, -4.4]} castShadow>
          <cylinderGeometry args={[0.28, 0.32, 4.2, 24]} />
          <meshStandardMaterial color="#f6ecd8" roughness={0.6} />
        </mesh>
        <Box p={[x, 0.3, -4.4]} s={[0.8, 0.3, 0.8]} c="#e7dbc3" />
        <Box p={[x, 4.5, -4.4]} s={[0.8, 0.25, 0.8]} c="#e7dbc3" />
      </group>
    ))}
    <Box p={[0, 4.85, -4.5]} s={[8.4, 0.5, 1.2]} c="#e7d6b3" />
    <Sign text={placa} w={6} h={0.9} position={[0, 5.6, -4.7]} />
    {[0, 1, 2].map((i) => (
      <Box key={i} p={[0, 0.12 + i * 0.12, -3.9 - i * 0.3]} s={[5 - i * 0.4, 0.12, 1]} c="#ddd0b6" />
    ))}
    <Box p={[0, 1.7, -4.75]} s={[1.6, 2.8, 0.2]} c={porta} r={0.4} />
    <mesh position={[0, 3.1, -4.74]}>
      <circleGeometry args={[0.8, 32, 0, Math.PI]} />
      <meshStandardMaterial color={porta} />
    </mesh>
    <Box p={[-8, 4.5, -6]} s={[6.5, 9, 3]} map={windowsTex('#d98c5f', 4, 3)} />
    <Box p={[8, 4, -6]} s={[6.5, 8, 3]} map={windowsTex('#e8b85a', 4, 3)} />
    <Box p={[-14, 5, -9]} s={[6, 10, 3]} map={windowsTex('#c7765a', 5, 3)} />
    <Box p={[14, 4.5, -9]} s={[6, 9, 3]} map={windowsTex('#d7a36b', 4, 3)} />
    {[-4.6, 4.6].map((x) => (
      <group key={x}>
        <mesh position={[x, 1.6, -2.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 3.2, 12]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[x, 3.3, -2.3]}>
          <sphereGeometry args={[0.22, 16, 12]} />
          <meshStandardMaterial color="#ffe7a8" emissive="#ffcf6a" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[x * 0.62, 0.45, -3.4]} castShadow>
          <cylinderGeometry args={[0.35, 0.28, 0.6, 16]} />
          <meshStandardMaterial color="#b4643c" />
        </mesh>
        <mesh position={[x * 0.62, 1.0, -3.4]} castShadow>
          <sphereGeometry args={[0.45, 16, 12]} />
          <meshStandardMaterial color="#4f7d3c" roughness={0.9} />
        </mesh>
      </group>
    ))}
  </group>
);

// ---------- Interior com balcão (banco, loja, recepção, cartório...) ----------
// O personagem atrás do balcão fica em y = 0.75 (há um degrau) para aparecer acima dele.
export const Room = ({ placa = 'RECEPÇÃO', parede = '#2f5a47', piso = ['#e9e3d6', '#3a3a3a'] as [string, string], balcao = true }: { placa?: string; parede?: string; piso?: [string, string]; balcao?: boolean }) => (
  <group>
    <WarmLights sun={[-3, 7, 6]} bg={parede} sky="#fff3dd" ground="#4a3a2a" fill={1.0} fog={[14, 40]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial map={tileTex(piso[0], piso[1], 20)} roughness={0.35} />
    </mesh>
    <Box p={[0, 3, -3]} s={[16, 6, 0.3]} c={parede} r={0.6} />
    <Box p={[0, 0.6, -2.84]} s={[16, 1.2, 0.05]} c="#6b4426" r={0.5} />
    <Sign text={placa} w={3.6} h={0.55} position={[0, 3.3, -2.8]} bg="#24382e" />
    <group position={[2.6, 3.3, -2.82]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.06, 32]} />
        <meshStandardMaterial color="#f7f1e2" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.04, 8, 32]} />
        <meshStandardMaterial color="#c9a14a" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
    {balcao && (
      <>
        <Box p={[0, 0.375, -0.95]} s={[4.2, 0.75, 1.1]} c="#5a3a22" />
        <Box p={[0, 0.5, 0]} s={[4.2, 1.0, 0.8]} c="#7a4a26" r={0.45} />
        <Box p={[0, 1.03, 0]} s={[4.4, 0.07, 0.95]} c="#ece6da" r={0.2} />
        {[-1.4, 0, 1.4].map((x) => (
          <Box key={x} p={[x, 0.5, 0.41]} s={[1.1, 0.7, 0.03]} c="#8f5a30" r={0.4} />
        ))}
      </>
    )}
    {[-4.5, 4.5].map((x) => (
      <mesh key={x} position={[x, 2.6, -2.6]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 5.2, 24]} />
        <meshStandardMaterial color="#efe6d2" roughness={0.5} />
      </mesh>
    ))}
  </group>
);

// ---------- Depósito com prateleiras até o teto (armazém, fábrica, biblioteca...) ----------
export const shelfItems = (x0: number, z0: number, z1: number, levels: number, step = 0.66, y0 = 0.4, dy = 0.62): V3[] => {
  const out: V3[] = [];
  for (let l = 0; l < levels; l++) for (let z = z0; z <= z1; z += step) out.push([x0, y0 + l * dy, z]);
  return out;
};

const Rack = ({ x, z0, z1, levels, dy, item }: { x: number; z0: number; z1: number; levels: number; dy: number; item: { geometry: THREE.BufferGeometry; material: THREE.Material; h: number } }) => {
  const items = useMemo(() => shelfItems(x, z0, z1, levels, 0.66, 0.4 + item.h / 2, dy), [x, z0, z1, levels, dy, item.h]);
  const len = z1 - z0 + 0.8;
  return (
    <group>
      {Array.from({ length: levels }, (_, l) => (
        <Box key={l} p={[x, 0.37 + l * dy, (z0 + z1) / 2]} s={[0.75, 0.05, len]} c="#9a6b3e" r={0.7} />
      ))}
      {Array.from({ length: Math.ceil(len / 2.5) + 1 }, (_, i) =>
        [-0.36, 0.36].map((dx) => <Box key={`${i}${dx}`} p={[x + dx, (levels * dy) / 2 + 0.2, z0 - 0.4 + i * 2.5]} s={[0.06, levels * dy + 0.4, 0.06]} c="#7a5230" />),
      )}
      <Field items={items} geometry={item.geometry} material={item.material} />
    </group>
  );
};

// `item` = o que fica nas prateleiras. Padrão: caixas. Passe outra geometria/material para livros, potes, rodas...
export const Warehouse = ({ levels = 12, item }: { levels?: number; item?: { geometry: THREE.BufferGeometry; material: THREE.Material; h: number } }) => {
  const caixa = useMemo(() => ({ geometry: new THREE.BoxGeometry(0.5, 0.42, 0.5), material: new THREE.MeshStandardMaterial({ map: crateTex(), roughness: 0.8 }), h: 0.42 }), []);
  const it = item ?? caixa;
  return (
    <group>
      <WarmLights sun={[-3, 9, 4]} bg="#3b2f22" sky="#ffe6b8" ground="#3a2c1c" fill={0.9} power={1.6} fog={[10, 34]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -12]}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#8d8a82" roughness={0.8} />
      </mesh>
      <mesh position={[0, levels * 0.66 + 0.8, -12]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#5e5a52" />
      </mesh>
      {[-4.4, -3.3, -1.1, 1.1, 3.3, 4.4].map((x) => (
        <Rack key={x} x={x} z0={-28} z1={-1.5} levels={levels} dy={0.66} item={it} />
      ))}
      {[-4, -10, -16, -22].map((zz) => (
        <group key={zz}>
          <mesh position={[0, levels * 0.66 + 0.4, zz]}>
            <boxGeometry args={[1.6, 0.08, 0.3]} />
            <meshStandardMaterial emissive="#ffdca0" emissiveIntensity={2} color="#fff" />
          </mesh>
          <pointLight position={[0, levels * 0.66 - 0.6, zz]} intensity={10} distance={12} color="#ffd59a" />
        </group>
      ))}
    </group>
  );
};

// ---------- Palco liso para "fatos como objetos" ----------
export const Stage = ({ color = '#2a5466', pedestal = true }: { color?: string; pedestal?: boolean }) => (
  <group>
    <WarmLights sun={[-3, 6, 6]} bg={color} sky="#ffffff" ground={color} fill={1.0} fog={[12, 30]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
    {pedestal && (
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.95, 0.3, 48]} />
        <meshStandardMaterial color="#e9e2d0" roughness={0.6} />
      </mesh>
    )}
  </group>
);
