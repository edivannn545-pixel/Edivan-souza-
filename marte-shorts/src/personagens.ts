import { FUNC, Look, VOCE } from './Character';
import { FaceName } from './textures';

// ============================================================================
// ELENCO DO ESTÚDIO — 20 personagens originais (6 tipos de corpo) + 12 roupas especiais.
// Use direto nas cenas: <Character look={ELENCO.teo.look} ... />
// Para um personagem novo, copie um Look parecido e troque cores, cabelo, chapéu e roupa.
// ============================================================================

export type Membro = { nome: string; papel: string; look: Look; rosto: FaceName };

const PELE = { clara: '#f0dccb', media: '#d9a57c', morena: '#a36a45', escura: '#6e4329', muitoEscura: '#4e2f1e' };
const MAO = '#1e1f24';

export const ELENCO = {
  voce: { nome: 'Você', papel: 'o protagonista', look: VOCE, rosto: 'bigSmile' },
  teo: {
    nome: 'Doutor Teo', papel: 'o cientista', rosto: 'happy',
    look: { skin: PELE.clara, jacket: '#8fb7d9', pants: '#3b4250', shoes: '#2a2a2a', gloves: MAO, hair: '#d9b56a', hairStyle: 'liso', body: 'magro', coat: '#f4f4f2', shirt: '#ffffff', tie: '#2f5fa8', eyewear: 'grau' },
  },
  lia: {
    nome: 'Lia', papel: 'a criança', rosto: 'smile',
    look: { skin: PELE.morena, jacket: '#d8352f', pants: PELE.morena, shoes: '#e8c240', gloves: MAO, hair: '#2a1a12', hairStyle: 'coque', body: 'crianca', skirt: { color: '#d8352f' } },
  },
  tonhao: {
    nome: 'Tonhão', papel: 'o grandão', rosto: 'grin',
    look: { skin: PELE.media, jacket: '#b3332e', pattern: 'xadrez', pattern2: '#3a1a18', pants: '#34405a', shoes: '#3a2a1e', gloves: MAO, hair: '#3a2416', beard: 'barba', body: 'forte' },
  },
  zuza: {
    nome: 'Vó Zuza', papel: 'a avó', rosto: 'content',
    look: { skin: PELE.clara, jacket: '#7b5aa6', pants: '#4a3a66', shoes: '#2a2a2a', gloves: MAO, hair: '#d6d6d6', hairStyle: 'coque', body: 'idoso', skirt: { color: '#5b467e', long: true }, eyewear: 'grau' },
  },
  bento: {
    nome: 'Seu Bento', papel: 'o vovô', rosto: 'smile',
    look: { skin: PELE.clara, jacket: '#f2efe6', pants: '#4a4f3e', shoes: '#3a2a1e', gloves: MAO, hair: '#e6e6e6', hairStyle: 'careca', beard: 'bigode', vest: '#5d7a45', body: 'idoso', eyewear: 'grau' },
  },
  kaio: {
    nome: 'Kaio', papel: 'o estudante', rosto: 'happy',
    look: { skin: PELE.escura, jacket: '#3d5fcf', pants: '#2c3346', shoes: '#f2f2f2', gloves: MAO, hair: '#1a120c', hairStyle: 'crespo' },
  },
  paula: {
    nome: 'Paula', papel: 'a vizinha', rosto: 'smile',
    look: { skin: PELE.morena, jacket: '#2fa36b', pants: '#2c3346', shoes: '#2a2a2a', gloves: MAO, hair: '#1f140e', hairStyle: 'longo' },
  },
  ramos: {
    nome: 'Sargento Ramos', papel: 'o guarda', rosto: 'confident',
    look: { skin: PELE.muitoEscura, jacket: '#1f2f5c', pants: '#1a2547', shoes: '#111', gloves: MAO, hair: '#120c08', hat: 'policia', hatColor: '#1a2547', tie: '#111a33', shirt: '#dfe6f5' },
  },
  nena: {
    nome: 'Dona Nena', papel: 'a comerciante', rosto: 'bigSmile',
    look: { skin: PELE.escura, jacket: '#f2ece0', pants: '#e08a2e', shoes: '#5a3a22', gloves: MAO, hair: '#1a120c', hairStyle: 'coque', body: 'baixo', apron: '#e08a2e' },
  },
  henrique: {
    nome: 'Dr. Henrique', papel: 'o executivo', rosto: 'smug',
    look: { skin: PELE.clara, jacket: '#1f2228', pants: '#1f2228', shoes: '#111', gloves: MAO, hair: '#161210', hairStyle: 'liso', body: 'magro', shirt: '#ffffff', tie: '#c22a2a' },
  },
  caio: {
    nome: 'Caio', papel: 'o friorento', rosto: 'nervous',
    look: { skin: PELE.media, jacket: '#d6402f', pattern: 'acolchoado', pants: '#2c3346', shoes: '#3a2a1e', gloves: MAO, hair: '#3a2416', hat: 'gorro', hatColor: '#2f4f8f', scarf: '#2f4f8f' },
  },
  bruna: {
    nome: 'Bruna', papel: 'a enfermeira', rosto: 'content',
    look: { skin: PELE.clara, jacket: '#4fb3b6', pants: '#4fb3b6', shoes: '#f2f2f2', gloves: MAO, hair: '#1a1410', hairStyle: 'chanel' },
  },
  rafa: {
    nome: 'Rafa', papel: 'o atleta', rosto: 'confident',
    look: { skin: PELE.morena, jacket: '#f6f6f6', pants: '#d23a3a', shoes: '#f2f2f2', gloves: MAO, hair: '#1a120c', hairStyle: 'crespo', shorts: true },
  },
  tiao: {
    nome: 'Tião', papel: 'o trabalhador', rosto: 'neutral',
    look: { skin: PELE.media, jacket: '#6b4a2e', pants: '#3b3a36', shoes: '#2a2a2a', gloves: MAO, hair: '#2a1a12', hat: 'touca', hatColor: '#2f6fb3', body: 'baixo' },
  },
  nico: {
    nome: 'Chef Nico', papel: 'o cozinheiro', rosto: 'laugh',
    look: { skin: PELE.clara, jacket: '#fbfbf8', pants: '#2a2a2a', shoes: '#111', gloves: MAO, hair: '#3a2416', beard: 'bigode', hat: 'chef', scarf: '#d23a3a', body: 'forte' },
  },
  gabi: {
    nome: 'Gabi', papel: 'a artista', rosto: 'wink',
    look: { skin: PELE.clara, jacket: '#2f4f8f', pattern: 'listras', pattern2: '#f4f0e8', patternH: true, pants: '#1f2228', shoes: '#2a2a2a', gloves: MAO, hair: '#c8572b', hairStyle: 'chanel' },
  },
  pedrinho: {
    nome: 'Pedrinho', papel: 'o menino', rosto: 'bigSmile',
    look: { skin: PELE.media, jacket: '#3aa14a', pants: '#2f5fa8', shoes: '#e8c240', gloves: MAO, hair: '#3a2416', hat: 'touca', hatColor: '#2f6fb3', body: 'crianca', shorts: true },
  },
  funcionario: { nome: 'Funcionário', papel: 'o bancário', look: FUNC, rosto: 'smile' },
  sombra: {
    nome: 'Sombra', papel: 'o suspeito', rosto: 'suspicious',
    look: { skin: PELE.clara, jacket: '#16171b', pants: '#16171b', shoes: '#0c0c0e', gloves: MAO, hair: '#0c0c0e', hairStyle: 'liso', body: 'magro', eyewear: 'escuro' },
  },
} satisfies Record<string, Membro>;

export const ROUPAS = {
  astronauta: {
    nome: 'astronauta', papel: '', rosto: 'amazed',
    look: { skin: PELE.clara, jacket: '#f4f4f6', pants: '#f4f4f6', shoes: '#9aa0a8', gloves: '#e8e8ec', hair: '#3a2416', hat: 'astronauta', backpack: '#d8d8de' },
  },
  mergulhador: {
    nome: 'mergulhador', papel: '', rosto: 'smile',
    look: { skin: PELE.media, jacket: '#1a1b20', pants: '#1a1b20', shoes: '#1a1b20', gloves: '#1a1b20', hair: '#1a120c', hairStyle: 'liso', eyewear: 'mergulho' },
  },
  protecao: {
    nome: 'proteção química', papel: '', rosto: 'worried',
    look: { skin: PELE.morena, jacket: '#f2c62e', pants: '#f2c62e', shoes: '#2a2a2a', gloves: '#2a2a2a', hair: '#1a120c', hat: 'capuz', hatColor: '#f2c62e', backpack: '#d9ae1e' },
  },
  explorador: {
    nome: 'explorador', papel: '', rosto: 'curious',
    look: { skin: PELE.morena, jacket: '#a8915e', pants: '#8a744a', shoes: '#5a3a22', gloves: MAO, hair: '#1a120c', hairStyle: 'longo', hat: 'explorador', hatColor: '#d8c49a', backpack: '#6b4a2e' },
  },
  inverno: {
    nome: 'inverno', papel: '', rosto: 'nervous',
    look: { skin: PELE.clara, jacket: '#3256b8', pattern: 'acolchoado', pants: '#232a3a', shoes: '#3a2a1e', gloves: MAO, hair: '#3a2416', hat: 'gorro', hatColor: '#c8322c', scarf: '#c8322c' },
  },
  praia: {
    nome: 'praia', papel: '', rosto: 'bigSmile',
    look: { skin: PELE.clara, jacket: '#e9792f', pattern: 'florido', pattern2: '#fff3d6', pants: '#3b7fc4', shoes: '#e8c240', gloves: MAO, hair: '#c8572b', hairStyle: 'chanel', shorts: true },
  },
  operario: {
    nome: 'operário', papel: '', rosto: 'confident',
    look: { skin: PELE.escura, jacket: '#3d4048', pants: '#2c3346', shoes: '#3a2a1e', gloves: MAO, hair: '#1a120c', vest: '#c6f03a', hat: 'capacete', hatColor: '#f2c62e' },
  },
  medieval: {
    nome: 'medieval', papel: '', rosto: 'neutral',
    look: { skin: PELE.media, jacket: '#7a5634', pants: '#5a3e26', shoes: '#3a2a1e', gloves: MAO, hair: '#3a2416', hat: 'boina', hatColor: '#3a5fa8', skirt: { color: '#7a5634', long: true } },
  },
  cavaleiro: {
    nome: 'cavaleiro', papel: '', rosto: 'confident',
    look: { skin: PELE.morena, jacket: '#b9c0c8', pants: '#b9c0c8', shoes: '#8a9098', gloves: '#9aa2ab', hair: '#1a120c', hat: 'cavaleiro', metal: true },
  },
  farao: {
    nome: 'faraó', papel: '', rosto: 'smug',
    look: { skin: PELE.morena, jacket: '#f4efe2', pants: '#f4efe2', shoes: '#c9a14a', gloves: MAO, hair: '#1a120c', hairStyle: 'nenhum', hat: 'farao', scarf: '#e8b931', skirt: { color: '#f4efe2', long: true } },
  },
  piloto: {
    nome: 'piloto', papel: '', rosto: 'happy',
    look: { skin: PELE.clara, jacket: '#5f6b3e', pants: '#4a5230', shoes: '#3a2a1e', gloves: MAO, hair: '#3a2416', hat: 'piloto', hatColor: '#6b4a2e', eyewear: 'aviador', scarf: '#f4f0e8' },
  },
  marinheiro: {
    nome: 'marinheiro', papel: '', rosto: 'smile',
    look: { skin: PELE.escura, jacket: '#f4f4f2', pattern: 'listras', pattern2: '#1f3b7a', patternH: true, pants: '#1f3b7a', shoes: '#111', gloves: MAO, hair: '#1a120c', hat: 'marinheiro', hatColor: '#fbfbf8' },
  },
} satisfies Record<string, Membro>;

// ============================================================================
// ELENCO "CABEÇA-ESFERA" — estilo dos shorts "E se...?": cabeça preta brilhante com contorno claro,
// olhos grandes brancos, corpo de bastão, camiseta de manga curta. Cada um tem UMA cor e UM acessório
// que o identificam de longe. Personagens originais deste estúdio.
// ============================================================================
const ESFERA = { skin: '#141419', gloves: '#141419', esfera: true, contorno: '#ffe3b0', mangaCurta: true, body: 'esbelto' } as const;

export const ESFERAS = {
  nino: {
    nome: 'Nino', papel: 'o protagonista ("você")', rosto: 'bigSmile',
    look: { ...ESFERA, jacket: '#ff6a3d', pants: '#27324a', shoes: '#f4f2ec', hair: '#141419', hairStyle: 'topete' },
  },
  lara: {
    nome: 'Lara', papel: 'a melhor amiga', rosto: 'happy',
    look: { ...ESFERA, jacket: '#a98bff', pants: '#f3efe6', shoes: '#ff6a8a', hair: '#2a1712', hairStyle: 'rabo', shorts: true },
  },
  bruno: {
    nome: 'Bruno', papel: 'o rival', rosto: 'smug',
    look: { ...ESFERA, jacket: '#e8edf2', pants: '#1f2026', shoes: '#e63946', hair: '#141419', hairStyle: 'espetado', faixa: '#e63946' },
  },
  mel: {
    nome: 'Mel', papel: 'a irmã caçula', rosto: 'smile',
    look: { ...ESFERA, jacket: '#ff8fc2', pants: '#3a3f8f', shoes: '#ffd23a', hair: '#141419', hairStyle: 'coque', body: 'esbeltoCrianca' },
  },
  dona_cida: {
    nome: 'Dona Cida', papel: 'a mãe', rosto: 'content',
    look: { ...ESFERA, jacket: '#2ab3a6', pants: '#2a2f45', shoes: '#3a2a1e', hair: '#141419', hairStyle: 'chanel', skirt: { color: '#24485c' } },
  },
  mestre_ono: {
    nome: 'Mestre Ono', papel: 'o treinador sábio', rosto: 'smile',
    look: { ...ESFERA, jacket: '#f2f0ea', pants: '#f2f0ea', shoes: '#2a2a2a', hair: '#e9e9e9', hairStyle: 'careca', beard: 'barba', body: 'idoso', mangaCurta: false },
  },
  dra_iara: {
    nome: 'Dra. Iara', papel: 'a cientista', rosto: 'thinking',
    look: { ...ESFERA, jacket: '#4b7bd8', pants: '#2c3346', shoes: '#2a2a2a', hair: '#141419', hairStyle: 'crespo', coat: '#f6f6f2', eyewear: 'grau', mangaCurta: false },
  },
  zeca: {
    nome: 'Zeca', papel: 'o amigo engraçado', rosto: 'grin',
    look: { ...ESFERA, jacket: '#3fbf6a', pants: '#3a2f28', shoes: '#f4f2ec', hair: '#141419', hairStyle: 'nenhum', hat: 'bone', hatColor: '#ffd23a', body: 'baixo' },
  },
} satisfies Record<string, Membro>;

// Versão raio-X de qualquer look: <Character look={raioX(ESFERAS.nino.look, { destaque: 'pernas', destaqueCor: '#cfd8e3', ossoMetal: true })} />
export const raioX = (look: Look, h: Look['holo'] = {}): Look => ({ ...look, holo: { cor: '#3fb4ff', osso: '#f4fbff', ...h } });
