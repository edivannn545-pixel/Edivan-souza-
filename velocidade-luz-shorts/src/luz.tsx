import * as THREE from 'three';
import { rand, seg, V3 } from './anim';
import { Look } from './Character';
import { glowTex, SpaceLights, Stars } from './espaco';
import { ESFERAS } from './personagens';
import { canvasTex } from './textures';

// ============================================================================
// "What if you traveled at the speed of light?" — cenários e objetos novos.
// Elenco fixo: Nino ("você"), Dra. Iara (a cientista) e Dra. Iara idosa.
// ============================================================================

export const NINO: Look = ESFERAS.nino.look;
export const IARA: Look = ESFERAS.dra_iara.look;
export const IARA_IDOSA: Look = { ...IARA, hair: '#f1f1ec', hairStyle: 'coque', body: 'idoso' };

export const Space = ({ bg, glowPos, glow }: { bg?: string; glowPos?: V3; glow?: string }) => (
  <>
    <SpaceLights bg={bg} glowPos={glowPos} glow={glow} />
    <Stars />
  </>
);

// ---------- Lua ----------
const moonTex = () =>
  canvasTex('moon', 512, 256, (c) => {
    c.fillStyle = '#c9c6bf';
    c.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 70; i++) {
      c.fillStyle = i % 3 ? 'rgba(120,115,108,0.55)' : 'rgba(235,232,225,0.6)';
      c.beginPath();
      c.arc(rand(i * 3.3) * 512, rand(i * 5.1) * 256, 4 + rand(i * 7.7) * 22, 0, Math.PI * 2);
      c.fill();
    }
  });

export const Moon = ({ t, position = [0, 0, 0] as V3, r = 1 }: { t: number; position?: V3; r?: number }) => (
  <mesh position={position} rotation={[0.2, t * 0.1, 0]}>
    <sphereGeometry args={[r, 48, 32]} />
    <meshStandardMaterial map={moonTex()} roughness={0.95} />
  </mesh>
);

// ---------- Sol ----------
export const Sun = ({ t, position = [0, 0, 0] as V3, r = 4 }: { t: number; position?: V3; r?: number }) => (
  <group position={position}>
    <mesh rotation={[0, t * 0.05, 0]}>
      <sphereGeometry args={[r, 48, 32]} />
      <meshBasicMaterial color="#ffb23a" toneMapped={false} />
    </mesh>
    <sprite scale={[r * 4.2 * (1 + 0.03 * Math.sin(t * 3)), r * 4.2 * (1 + 0.03 * Math.sin(t * 3)), 1]}>
      <spriteMaterial map={glowTex('rgba(255,170,60,0.85)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </sprite>
    <pointLight intensity={120} distance={80} decay={1} color="#ffd08a" />
  </group>
);

// ---------- Raio de luz: bolinha brilhante com rastro ----------
export const LightBolt = ({ position, dir = [1, 0, 0] as V3, len = 3, size = 0.35 }: { position: V3; dir?: V3; len?: number; size?: number }) => {
  const ang = Math.atan2(dir[1], dir[0]);
  return (
    <group position={position}>
      <sprite scale={[size * 2.2, size * 2.2, 1]}>
        <spriteMaterial map={glowTex('rgba(255,250,210,1)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
      <mesh rotation={[0, 0, ang]} position={[-dir[0] * len * 0.5, -dir[1] * len * 0.5, 0]}>
        <boxGeometry args={[len, size * 0.35, 0.02]} />
        <meshBasicMaterial color="#fff3b0" transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

// Rastro de luz em volta da Terra: anel que vai se desenhando, `laps` voltas até `at`.
export const OrbitTrail = ({ t, from, at, laps, r, tilt = 0.35 }: { t: number; from: number; at: number; laps: number; r: number; tilt?: number }) => {
  const k = seg(t, from, at, (x) => x);
  const a = k * laps * Math.PI * 2 + Math.max(0, t - at) * 6;
  return (
    <group rotation={[tilt, 0, 0.15]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.03, 8, 96]} />
        <meshBasicMaterial color="#fff2a0" transparent opacity={k > 0 ? 0.55 : 0} toneMapped={false} />
      </mesh>
      <sprite position={[Math.cos(a) * r, 0, Math.sin(a) * r]} scale={[0.6, 0.6, 1]}>
        <spriteMaterial map={glowTex('rgba(255,250,210,1)')} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
    </group>
  );
};

// ---------- Laboratório (hangar da nave) ----------
export const Lab = ({ t }: { t: number }) => (
  <group>
    <SpaceLights bg="#141a3a" glowPos={[3, 3, -6]} glow="#7fb4ff" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#2a3150" roughness={0.8} />
    </mesh>
    {/* faixas no piso */}
    {[-3, 3].map((x) => (
      <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, -3]}>
        <planeGeometry args={[0.15, 14]} />
        <meshBasicMaterial color="#ffd23a" />
      </mesh>
    ))}
    {/* parede do fundo com janelões para o espaço */}
    <mesh position={[0, 4, -9]}>
      <boxGeometry args={[30, 8, 0.4]} />
      <meshStandardMaterial color="#1c2240" />
    </mesh>
    {[-6, 0, 6].map((x) => (
      <group key={x} position={[x, 4.2, -8.75]}>
        <mesh>
          <planeGeometry args={[4.6, 4.6]} />
          <meshBasicMaterial color="#070a1c" />
        </mesh>
        {Array.from({ length: 18 }, (_, i) => (
          <mesh key={i} position={[(rand(i + x) - 0.5) * 4.2, (rand(i * 3 + x) - 0.5) * 4.2, 0.01]}>
            <circleGeometry args={[0.03 + rand(i * 7) * 0.03, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.02]}>
          <torusGeometry args={[3.25, 0.12, 6, 4]} />
          <meshStandardMaterial color="#8a93b0" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    ))}
    {/* painéis piscando nas laterais */}
    {[-7, 7].map((x) => (
      <group key={x} position={[x, 0, -5]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[1.6, 2.4, 0.8]} />
          <meshStandardMaterial color="#39406a" />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[-0.5 + (i % 4) * 0.33, 1.6 - Math.floor(i / 4) * 0.4, 0.41]}>
            <boxGeometry args={[0.2, 0.12, 0.02]} />
            <meshBasicMaterial color={Math.sin(t * 4 + i * 1.7 + x) > 0 ? ['#ff4d4d', '#3dff8a', '#ffd23a', '#4dc3ff'][i % 4] : '#222838'} />
          </mesh>
        ))}
      </group>
    ))}
    <directionalLight position={[-4, 8, 6]} intensity={1.4} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
  </group>
);

// Tablet/placa de carga que acende quando a nave fica pronta.
export const Ready = ({ t, at, position = [0, 0, 0] as V3 }: { t: number; at: number; position?: V3 }) => {
  const k = seg(t, at - 0.5, at - 1 / 30);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.6, 0.3, 0.1]} />
        <meshStandardMaterial color="#14182a" />
      </mesh>
      <mesh position={[-0.75 + 0.75 * k, 0, 0.06]} scale={[Math.max(0.001, k), 1, 1]}>
        <boxGeometry args={[1.5, 0.2, 0.02]} />
        <meshBasicMaterial color="#3dff8a" toneMapped={false} />
      </mesh>
    </group>
  );
};
