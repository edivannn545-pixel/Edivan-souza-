import { JSX } from 'react';
import { Vila } from './batatas';
import { Cam } from './sets';
import type { Som } from './sfx';

// Provisório: a história da batata ainda espera a aprovação de personagens e cenários.
// Versões anteriores em historias/ (pachinko, escritorio, elnino).
export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element };
export const SFX: Som[] = [];
const S01 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Vila t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0, 2.4, 7], [0, 1.8, -1], 32]]} />
  </>
);
export const SHOTS: Shot[] = [{ from: 0, name: '01 provisorio', C: S01 }];
