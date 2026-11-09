import { AbsoluteFill } from 'remotion';
import { Cartoes, PAGE } from './Elenco';
import { Membro, NOVOS } from './personagens';

// Folha dos personagens do vídeo "O tempo voa" (node tools/elenco.mjs PersonagensTempo out/personagens-tempo.png).
const MEMBROS: Membro[] = [
  { ...NOVOS.leo, nome: 'Léo', papel: 'você (protagonista)', rosto: 'shocked' },
  { ...NOVOS.moraes, nome: 'Dr. Moraes', papel: 'o chefe da reunião', rosto: 'annoyed' },
  { ...NOVOS.tati, nome: 'Tati', papel: 'a colega (café)', rosto: 'happy' },
  { ...NOVOS.arlindo, nome: 'Seu Arlindo', papel: 'colega na reunião', rosto: 'sleepy' },
];

export const PersonagensTempo = () => (
  <AbsoluteFill style={{ background: PAGE, padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: 26 }}>
    <div>
      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, letterSpacing: 4, color: '#6b6b6b', fontWeight: 700 }}>O TEMPO VOA</div>
      <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 80, color: '#141414', lineHeight: 1 }}>
        Os <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>personagens.</span>
      </div>
    </div>
    <div style={{ alignSelf: "center" }}><Cartoes membros={MEMBROS} w={1360} h={900} /></div>
  </AbsoluteFill>
);
