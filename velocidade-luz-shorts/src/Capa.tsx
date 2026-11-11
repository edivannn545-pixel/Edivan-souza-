import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { REST } from './Character';
import { BlackHole, Floating, LightFall, SpaceLights, Stars } from './espaco';
import { useFacesReady } from './textures';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';

// Capa do Short (1080x1920): Nino sendo esticado na frente do buraco negro + título grande.
const CamFixa = () => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(0.2, -0.3, 6.6);
    camera.lookAt(0, 0.4, 0);
    camera.fov = 34 * 1.6;
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const FONTE = '"Arial Black", "Inter Display", Inter, sans-serif';
const contorno = (px: number) => ({ WebkitTextStroke: `${px}px #15121a`, paintOrder: 'stroke fill' as const });

export const Capa = () => {
  const ready = useFacesReady();
  const t = 3.2;
  return (
    <AbsoluteFill style={{ background: '#05060f' }}>
      {ready && (
        <ThreeCanvas width={1080} height={1920} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1, antialias: true }} camera={{ fov: 32, near: 0.05, far: 200, position: [0, 0, 6] }}>
          <CamFixa />
          <SpaceLights glowPos={[0, -1, -6]} />
          <Stars />
          <BlackHole t={t} position={[0, -2.6, -9]} r={3.6} glow={1.3} />
          <LightFall t={t} from={0} center={[0, -2.6, -9]} r0={7} />
          <Floating
            pose={{ ...REST, lsz: 2.4, rsz: 2.4, lel: 0.1, rel: 0.1, hp: -0.15 }}
            face={{ f: 'panic', blink: 0, o: ['sweat'] }}
            position={[0, -1.15, 0.6]}
            rotation={[0.05, 0.3, -0.12]}
            stretch={1.4}
          />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 150 }}>
        <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 104, lineHeight: 1.02, color: '#fff', textAlign: 'center', ...contorno(16), textShadow: '0 10px 0 rgba(0,0,0,0.35)' }}>
          WHAT IF YOU FELL<br />INTO A
        </div>
        <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 134, lineHeight: 1.0, color: '#ff7a45', textAlign: 'center', marginTop: 14, ...contorno(22), textShadow: '0 12px 0 rgba(0,0,0,0.35)' }}>
          BLACK HOLE?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
