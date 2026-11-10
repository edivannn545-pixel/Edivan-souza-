# Guia do estilo "E se...?" no estúdio

Este guia transforma a análise dos shorts de referência num modo de produção do estúdio.
Os personagens são **nossos** (elenco "cabeça-esfera"). Não copie personagens, nomes nem logotipo de outros canais.

## 1. A fórmula do roteiro (60–80 s, cerca de 150–200 palavras)

| # | Bloco | O que fazer | No episódio de exemplo |
|---|---|---|---|
| 1 | Gancho absurdo | Mostre a consequência do poder antes de explicar. Uma frase. | "Você cai do skate… e quem quebra é a calçada." |
| 2 | Pergunta-título | "E se [parte do corpo] fosse [N]x mais [qualidade]?" no topo da tela | `Titulo` com "DE AÇO?" grande |
| 3 | Ciência | 1–2 fatos reais no mundo raio-X, com número na tela | osso × concreto na prensa, "4X" |
| 4 | Fantasia de poder | 2 cenas divertidas com número na tela | "10 KG → 40 KG", o chute do Bruno |
| 5 | "Só que…" | O custo real do poder, mais ou menos em 40% do vídeo | +30 kg, "corpo pesado não boia" |
| 6 | Dilema | Personagens com nome + pergunta "A ou B?" no topo | "FICAR NA BORDA? / OU PULAR?" |
| 7 | Clímax | O herói escolhe o outro. Planos de 0,5–1 s | pula, afunda, anda no fundo, empurra |
| 8 | Moral | Uma frase curta | "Quem afunda é quem levanta os outros." |
| 9 | Volta ao começo | Repete a cena do gancho, agora sob controle | cai do skate de novo… e ri |
| 10 | Pergunta final + tela final | "E você, o que faria com…?" + `TelaFinal` | "COMENTA AÍ / INSCREVA-SE" |

Regras de texto: segunda pessoa ("você"), frases de até 8–10 palavras, números falados **por extenso** no roteiro
(a voz fala "quarenta", a tela mostra "40 KG"), 1–2 palavras com `*ênfase*` por frase.

## 2. Elenco "cabeça-esfera" (`src/personagens.ts` → `ESFERAS`)

Cabeça preta brilhante com verniz, contorno claro (`contorno`), olhos grandes brancos, corpo de bastão,
camiseta de manga curta (`mangaCurta`). Cada personagem tem **uma cor + um acessório** que o identifica de longe.

| id | Nome | Papel | Marca visual |
|---|---|---|---|
| `nino` | Nino | protagonista ("você") | camiseta coral, topete |
| `lara` | Lara | melhor amiga | camiseta lilás, rabo de cavalo, bermuda |
| `bruno` | Bruno | rival | cabelo espetado, faixa vermelha, camiseta branca |
| `mel` | Mel | irmã caçula | rosa, coque, corpo de criança |
| `dona_cida` | Dona Cida | mãe | turquesa, saia, chanel |
| `mestre_ono` | Mestre Ono | treinador sábio | roupa branca, barba branca |
| `dra_iara` | Dra. Iara | cientista | jaleco, óculos, cabelo crespo |
| `zeca` | Zeca | amigo engraçado | verde, boné amarelo, baixinho |

Folha do elenco: `node tools/elenco.mjs ElencoEsferas` → `out/elenco-esferas.png`.

Campos novos do `Look`: `esfera`, `contorno`, `mangaCurta`, `faixa`, `hairStyle: 'espetado' | 'topete'`, `holo`.

### Modo raio-X / holograma
```ts
raioX(ESFERAS.nino.look)                                                   // corpo azul translúcido, ossos brancos
raioX(look, { destaque: 'pernas', destaqueCor: '#ff5a7a' })                 // destaca ossos das pernas (ou 'bracos' / 'tudo')
raioX(look, { destaque: 'tudo', destaqueCor: '#dfe7f0', ossoMetal: true })  // esqueleto de aço
raioX(look, { cor: '#ff7a2a' })                                             // corpo "em chamas" (calor)
```
Use sempre no cenário `GradeNeon` (fundo azul-marinho, chão de grade neon, partículas).
Corte direto da pose real para a mesma pose no raio-X: é o "corte de ideia" do estilo.

## 3. Câmera (`<Cam keys={[[tempo, posição, alvo, fov, giro]]} />`)

O ritmo vem de **cortar entre tamanhos de plano**, com a câmera se movendo pouco dentro de cada plano.
Troque o tamanho do plano a cada corte.

| Receita | Como fazer | Quando usar |
|---|---|---|
| Aproximação lenta | 2 chaves no mesmo eixo, a 2ª ~15% mais perto | título, revelação, medo (S04, S20) |
| Órbita | posições `[sen(a)*R, y, cos(a)*R]` com `a` indo de -0,6 a 0,5 | raio-X, moral (S05, S28) |
| De baixo para cima | câmera em y 0,4–0,6 olhando para y 1,3+ | ameaça, peso, autoridade (S09, S13, S19) |
| De cima para baixo | câmera alta (y 4–7) e longe | lugar novo, comédia (S16) |
| Por cima do ombro | câmera atrás e acima do herói, alvo no que ele vê | dilema (S21) |
| Detalhe com câmera baixa | câmera perto do chão, perto do objeto | impacto, pé, bola (S02) |
| Travelling lateral | posição e alvo andam juntos com o personagem | caminhada (S24) |
| Inclinação holandesa | 5º número da chave (giro em radianos, ex.: 0.25) | tontura, desmaio, perigo |

Distâncias: close de rosto 3–3,5; corpo inteiro 4,5–5,5; cenário 8+.

## 4. Cortes e transições (campo `trans` da tomada)

- `'corte'` (padrão): corte seco. Duração média de 1,6–1,9 s por plano; 0,5–1 s no clímax.
- `'flash'`: clarão branco. Use no título, na virada ("Só que…") e na tela final.
- `'dissolve'`: mudança de lugar/tempo calma (chegada na piscina, moral).
- `'preto'`: "dias depois", desmaio.
- `Palpebra` (no HUD): tela preta que abre como um olho, para quem acorda.

## 5. HUD 2D (`src/hud.tsx`, campo `O` da tomada)

| Componente | Uso |
|---|---|
| `Titulo` | pergunta "E se…?", o dilema e "E VOCÊ?", no topo, linha por linha |
| `Selo` | número com anel de carga que trava na palavra (10 KG, +30 KG) |
| `Numero` | número/palavra grande que salta (4X, 15 M) |
| `Onoma` | onomatopeia de quadrinho (TUM!, CRACK!, SPLASH!) |
| `Capitulo` | "SÁBADO", "DIA 3", "DIAS DEPOIS" |
| `Vinheta` | bordas escuras para tensão |
| `TelaFinal` | nome do canal + COMENTA AÍ + INSCREVA-SE + mascotes |

Troque `ESTILO.canal` em `src/hud.tsx` pelo nome do seu canal.
Legenda: 3 palavras por vez, abaixo do meio, branca com contorno; a palavra `*enfatizada*` sai em coral (`ESTILO.destaque`).

## 6. Som

- Voz: uma narração inteira numa take só (ElevenLabs). No exemplo: voz "Luiz Henrique" (leve, rápida, animada).
- Música de fundo: `public/musica.mp3` + prop `musica: true`; ela já entra baixinha (~-19 dB da voz) e some no fim.
- Efeitos: um efeito para cada onomatopeia, em `SFX` (`src/shots.tsx`), ancorado na mesma palavra.

## 7. Prompts para fazer o mesmo estilo em geradores de IA (imagem/vídeo)

Ficha do personagem (gere uma vez e reutilize como referência):
```
3D stylized character turnaround sheet, front / 3/4 / side / back, glossy jet-black sphere head with a thin
cream rim outline, big white oval eyes with black pupils, simple white eyebrows, stick-thin black arms and legs,
round mitten hands, short-sleeve [COR] t-shirt, [CALÇA], [TÊNIS], signature accessory: [ACESSÓRIO],
smooth soft shading, no black outlines on the body, toy-like proportions, neutral gray background, 9:16
```
Cena:
```
Vertical 9:16 3D cartoon still, [PERSONAGEM da ficha] [AÇÃO] in a [CENÁRIO simples e limpo],
[wide / medium / close-up / extreme close-up], [low angle / top-down / over-the-shoulder / side view],
soft key light, soft contact shadows, saturated colors, [paleta: blue-orange | navy night | sunset magenta-orange],
empty space in the upper third for a title
```
Raio-X:
```
Same character as a translucent glowing blue hologram, white bones visible, [OSSO/ÓRGÃO] highlighted in [COR],
dark navy background, cyan neon perspective grid floor, floating particles, 9:16
```
Movimento (um movimento de câmera + uma ação por clipe de 3–5 s):
```
Static camera, medium shot. [Personagem] [ação curta]. Snappy cartoon timing, squash and stretch.
Slow push-in toward the face; the character raises eyebrows and smiles confidently.
Slow 40° orbit around the hologram character standing still on the neon grid.
Low camera at ground level, [objeto] toward the lens, shallow depth of field.
Camera tilts 15°, slight blur, the character's eyes slowly close, fade to black.
```

## 8. Como fazer um episódio novo

1. Escreva o roteiro na fórmula da seção 1 e grave em `LINES` (`src/timeline.ts`).
2. Gere a voz e os tempos (`public/voz.mp3` → `public/palavras.json` → `node tools/palavras.mjs public/palavras.json`).
3. Escreva `STORYBOARD.md` (uma linha por tomada) e as tomadas em `src/shots.tsx`, copiando as do exemplo.
4. `node tools/stills.mjs <quadros>` e olhe cada imagem.
5. Render: `REMOTION_GL=swangle npx remotion render src/index.ts Filme out/video.mp4 --concurrency=4`
   (sem `REMOTION_GL` num computador com placa de vídeo).
