import { AbsoluteFill } from 'remotion';
import { Cartoes, PAGE } from './Elenco';
import { CHEFE, KAIO, MINEIRO, TIAO, TONHAO } from './historia';
import { Membro } from './personagens';

// Folha dos personagens do vídeo "O passarinho da mina" (node tools/elenco.mjs PersonagensMina out/personagens-mina.png).
const MEMBROS: Membro[] = [
  { nome: 'Você', papel: 'o mineiro da gaiola', look: MINEIRO, rosto: 'bigSmile' },
  { nome: 'O Chefe', papel: 'o chefe da mina', look: CHEFE, rosto: 'annoyed' },
  { nome: 'Tonhão', papel: 'mineiro', look: TONHAO, rosto: 'tired' },
  { nome: 'Tião', papel: 'mineiro', look: TIAO, rosto: 'neutral' },
  { nome: 'Kaio', papel: 'mineiro', look: KAIO, rosto: 'happy' },
];

export const PersonagensMina = () => (
  <AbsoluteFill style={{ background: PAGE, padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: 26 }}>
    <div>
      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, letterSpacing: 4, color: '#6b6b6b', fontWeight: 700 }}>O PASSARINHO DA MINA</div>
      <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 80, color: '#141414', lineHeight: 1 }}>
        Os <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>personagens.</span>
      </div>
    </div>
    <Cartoes membros={MEMBROS} w={1840} h={860} />
  </AbsoluteFill>
);
