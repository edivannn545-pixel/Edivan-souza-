import { AbsoluteFill } from 'remotion';
import { Cartoes, PAGE } from './Elenco';
import { Membro, NOVOS } from './personagens';

// Folha do elenco novo (node tools/elenco.mjs NovosPersonagens out/novos-personagens.png).
export const NovosPersonagens = () => {
  const todos = Object.values(NOVOS) as Membro[];
  return (
    <AbsoluteFill style={{ background: PAGE, padding: '44px 40px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 22, letterSpacing: 4, color: '#6b6b6b', fontWeight: 700 }}>ESTÚDIO DE PRODUÇÃO DE ANIMAÇÕES</div>
        <div style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 80, color: '#141414', lineHeight: 1 }}>
          Elenco <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>novo.</span>
        </div>
      </div>
      <Cartoes membros={todos.slice(0, 6)} w={1840} h={740} />
      <Cartoes membros={todos.slice(6)} w={1840} h={740} />
    </AbsoluteFill>
  );
};
