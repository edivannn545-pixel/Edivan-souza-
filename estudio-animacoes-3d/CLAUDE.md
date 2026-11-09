# 🎬 ESTÚDIO DE PRODUÇÃO DE ANIMAÇÕES 3D

Este projeto é um estúdio pronto para criar Shorts 3D cartoon (vertical 1080×1920) com Three.js + Remotion.
O Claude Code lê este arquivo sozinho. **Claude: siga a PARTE 1 à risca.**

---

## PARTE 1 — O que fazer

### 1.0 Boas-vindas (gatilho)
Se o arquivo `.estudio-iniciado` **não existir** na raiz do projeto, esta é a primeira conversa do comprador.
Na sua **primeira resposta**, seja qual for a mensagem dele (até um "oi"), faça nesta ordem:

1. **Mostre a imagem `ELENCO.png`** (está na raiz do projeto; anexe/abra a imagem na conversa se a sua interface permitir,
   senão mostre o caminho do arquivo) junto com esta mensagem, exatamente:

   > **Agradecemos sua compra para o Estúdio de Produção de Animações! 🎬**
   > Estes são apenas alguns dos personagens disponíveis para você utilizar nos vídeos:
   > 20 personagens originais em 6 tipos de corpo, e 12 roupas especiais (astronauta, mergulhador, proteção química,
   > explorador, inverno, praia, operário, medieval, cavaleiro, faraó, piloto e marinheiro).
   > Você pode usar qualquer um deles, misturar roupas ou me pedir personagens novos.

2. Faça a checagem do ElevenLabs (1.1).
3. Peça o roteiro (ou o tema), o tipo de voz (masculina/feminina, animada/séria) e se quer legendas.
   Se ele já mandou o roteiro na primeira mensagem, não peça de novo: comece a trabalhar.
4. Rode `npm install` (se a pasta `node_modules` não existir). No Windows, se o PowerShell bloquear `npm`/`npx`
   (política de scripts), use `npm.cmd`/`npx.cmd` — não altere a política.
5. Crie o arquivo vazio `.estudio-iniciado` para não repetir as boas-vindas nas próximas conversas.

Se a pessoa arrastou o **zip** na conversa em vez de abrir a pasta: descompacte numa pasta nova (ex.: `estudio-animacoes-3d/`),
trabalhe dentro dela e siga este arquivo normalmente. Recomende abrir o Claude Code direto nessa pasta nas próximas vezes.

### 1.1 O ElevenLabs da pessoa está conectado?
Este kit **não traz chave nem conta de ninguém**. A narração usa a conta ElevenLabs **de quem está usando**,
conectada ao Claude Code dessa pessoa.

Veja se nesta sessão existem ferramentas do ElevenLabs (nomes com `elevenlabs`, ou ferramentas de *text to speech* /
*generate speech* / *list voices* / *speech to text* / *transcribe*).

- **Se existirem:** diga "✅ ElevenLabs conectado." e siga.
- **Se não existirem:** mostre este aviso, exatamente:

  > ⚠️ **Para criar a narração, conecte a SUA conta do ElevenLabs ao Claude Code.**
  > Este kit não inclui conta nem chave — cada pessoa usa a própria.
  >
  > **1. Crie sua conta** em **elevenlabs.io** (o plano grátis serve para testar; para vídeos longos ou uso comercial, veja os planos pagos).
  >
  > **2. Conecte ao Claude Code** — escolha um jeito:
  > - **Conector (mais fácil):** em **claude.ai → Configurações → Conectores**, procure **ElevenLabs**, clique em
  >   **Conectar** e faça login na sua conta ElevenLabs. Ele aparece no Claude Code que estiver logado na mesma conta Claude.
  > - **Pelo terminal (MCP oficial):** no ElevenLabs, vá em **perfil → API Keys → Create API Key**, copie a chave e rode no terminal
  >   (não aqui no chat): `claude mcp add elevenlabs -e ELEVENLABS_API_KEY=SUA_CHAVE -- uvx elevenlabs-mcp`
  >   (precisa do `uv` instalado: docs.astral.sh/uv).
  >
  > **3. Feche e abra o Claude Code de novo** nesta pasta.
  >
  > Enquanto isso, posso adiantar o roteiro, o storyboard e as cenas com tempos estimados — a voz entra depois e tudo se reajusta sozinho.

Nunca peça para colarem a chave no chat; se alguém colar, não repita a chave e recomende gerar uma nova no ElevenLabs.

### 1.2 Etapas de cada vídeo (siga na ordem, mostrando o resultado de cada uma)
1. **Roteiro.** Ajuste o texto do usuário às regras: gancho forte na 1ª frase, segunda pessoa ("você"),
   cada frase = uma ideia visual, 40–60 s falados (~130–170 palavras), números escritos por extenso se forem falados,
   e a palavra mais importante de cada frase marcada com `*asteriscos*` (1–2 por frase).
   Grave em `LINES` (src/timeline.ts) e mostre ao usuário. Siga se ele aprovar (ou se já tinha pedido para seguir direto).
2. **Voz (pelo ElevenLabs conectado da pessoa).**
   1. Liste as vozes da conta dela e escolha uma em português que combine com o pedido (diga qual escolheu; ela pode trocar).
   2. Gere a fala com o roteiro inteiro, **sem os asteriscos**, numa take só. Salve o áudio em `public/voz.mp3`
      (se a ferramenta devolver um link, baixe; se salvar num arquivo, mova para lá).
   3. Transcreva esse áudio com a ferramenta de *speech to text* do ElevenLabs pedindo **tempo por palavra**.
      Salve a lista de palavras (JSON com `text`, `start`, `end`) em `public/palavras.json` e rode
      `node tools/palavras.mjs public/palavras.json` → grava `src/voz.ts` com o tempo real de cada palavra do roteiro.
   4. Se o script avisar que palavras não bateram, ajuste o roteiro para ficar igual ao que foi falado (números, siglas).
   - **Alternativa sem conector:** a pessoa cria um arquivo `.env` com `ELEVENLABS_API_KEY=...` (a chave dela, escrita por ela
     no arquivo, nunca no chat) e você roda `node tools/voz.mjs --listar pt` e `node tools/voz.mjs --voz <id>`.
   - **Sem ElevenLabs ainda:** siga com os tempos estimados e avise que a sincronia final só fica certa com a voz.
3. **Storyboard.** Escreva `STORYBOARD.md`: uma linha por tomada com tempo, frase, ação, objeto de informação,
   câmera e expressão. Planeje uma imagem nova a cada ~1–2 s, reutilizando personagens e cenários. Escolha o elenco em
   `src/personagens.ts` e chame os personagens pelo nome. Mostre ao usuário.
4. **Elenco, cenários e objetos.** Use os personagens prontos ou crie novos `Look`; crie os cenários e objetos que a história
   pede seguindo os padrões do motor (PARTE 3). Coloque o que for novo em `src/historia.tsx` e importe em `shots.tsx`.
5. **Animação.** Reescreva `src/shots.tsx` com as tomadas do storyboard, tudo ancorado em palavras com `W(...)`.
6. **Revisão (obrigatória).** `node tools/stills.mjs` → abra e olhe **cada** imagem em `out/stills/`. Confira a lista das regras
   (enquadramento, nada atravessando nada, expressão certa, objeto de informação visível). Corrija e repita só nas tomadas alteradas.
7. **Render final.** `npx remotion render src/index.ts Filme out/video.mp4` (rode em segundo plano; demora alguns minutos).
   Se as ferramentas avisaram "sem placa de vídeo" (comum em máquinas na nuvem), renderize com `REMOTION_GL=swangle`
   (Linux/Mac: `REMOTION_GL=swangle npx remotion render ...`; Windows PowerShell: `$env:REMOTION_GL='swangle'; npx remotion render ...`).
   Entregue o caminho do vídeo e diga o que não conseguiu verificar.

### 1.3 Boas maneiras
- A conta e a chave do ElevenLabs são sempre da pessoa que está usando. Nunca mostre, repita ou grave uma chave
  em lugar nenhum além do `.env` dela.
- Não mude configurações do sistema. Não baixe nada além das dependências do `package.json`.
- Personagens, marcas e textos são sempre originais — nunca copie personagens ou logotipos de terceiros.
- Fale com o usuário em frases curtas e simples.
- `node tools/elenco.mjs` gera de novo a folha do elenco (em `out/elenco.png`) quando você criar personagens novos.

---

## PARTE 2 — Regras do estilo

O Claude Code lê este arquivo antes de qualquer tarefa neste projeto. Toda cena, personagem ou movimento respeita
estas regras. Quando uma regra não puder ser cumprida, avise antes de seguir.

## Formato
- Vertical **1080 × 1920**, **30 fps**, 40–60 s.
- Cada quadro é função pura do tempo `t`: nada de `Math.random()` solto nem estado acumulado entre quadros.
  Use `rand(semente)` de `src/anim.ts` — o mesmo quadro sai igual em qualquer render.

## 1 — Forma
- Cabeça grande e redonda (~1/3 da altura), corpo arredondado, braços e pernas **finos**, mãos e pés escuros sem dedos.
- Todos os personagens saem da mesma base (`Character`); muda só o `Look` (roupa, cabelo, acessórios, cores).

## 2 — Cenário
- Nenhuma cena começa num chão vazio: sempre há fundo, objetos e luz com sombra (`WarmLights`).
- Luz quente e suave, cores saturadas, névoa ao fundo; o assunto principal sempre nítido.
- Um componente por lugar, reutilizado em várias tomadas.

## 3 — Informação vira objeto
- Todo número, data ou fato falado aparece **dentro da cena** como objeto (placa, calendário, contador, medidor,
  carimbo, etiqueta, papel, pilha de moedas) e **chega no número exatamente na palavra** correspondente.
- Nada de texto solto na tela, exceto a legenda.

## 4 — Rostos
- O rosto faz a atuação; a boca **não** faz sincronia labial.
- A expressão **nunca se transforma**: troca durante uma piscada (meio fechado → fechado com o rosto novo → aberto),
  pronta ~2 quadros antes da palavra (`faceAt` já faz isso). Um rosto novo a cada ~1–1,5 s nas falas do protagonista.
- Piscadas de rotina sozinhas quando o rosto fica parado.

## 5 — Movimento
- Um gesto dura **~5 quadros** e termina **3–5 quadros antes** da palavra enfatizada (`track` faz isso). Nunca depois.
- A cabeça acompanha 2–4 quadros depois da mão (chave da cabeça com `lead` menor).
- Parado é parado: sem respiração, sem balanço aleatório entre gestos.
- Física coerente: roda gira na proporção da distância, pé não desliza, mão encosta no objeto no quadro do som (`lead: 0`).

## 6 — Câmera
- Nunca para totalmente e nunca treme: movimentos suaves (empurra, recua, órbita, grua, travelling) começando numa palavra.
- Uma imagem nova a cada ~1–2 s (nova tomada ou mudança clara de enquadramento).
- Tomadas se ligam com dissolução de 6 quadros começando na primeira palavra da frase nova.
- O enquadramento mostra o que a narração diz **naquele momento**. Personagem ocupa de 1/3 a 2/3 da altura do quadro.
- **Regra do foco (pedido do dono do estúdio):** tudo o que a narração mostra fica **sempre no centro da tela**, como foco.
  O alvo da câmera é o próprio objeto ou personagem citado (não um ponto entre ele e outra coisa). Se o assunto muda
  dentro da tomada (ex.: do vulcão para a banheira), a câmera se move até o novo assunto e o deixa no centro.
  Nada importante pode ficar cortado na borda. Confira isso em cada prévia.

## 7 — Som (pedido do dono do estúdio)
- **Todo vídeo tem efeitos sonoros** ligados ao que aparece na cena, sempre **abaixo da voz**:
  passos quando alguém anda (`passos(de, ate)`), tic-tac quando há relógio (`tictac`), queda/impacto quando algo cai
  ou bate (`som('queda' | 'tum' | 'carimbo', W(...))`), splash na água, moedas, pop quando um objeto surge, whoosh em
  movimento rápido, e **ambiente em loop** conforme o lugar: vento em lugar aberto, chuva quando chove, pássaros de dia
  ao ar livre, mar, cidade, escritório (`ambiente('vento', de, ate)`).
- Biblioteca em `public/sfx/` (gerada em código por `python3 tools/sfx.py`, só numpy). Funções em `src/sfx.ts`.
  Cada som de impacto cai **exatamente no quadro** da ação (mesmo tempo do `lead: 0`/`dropY`).
- Volumes padrão em `VOL` (impacto 0,55, passos 0,35, ambiente 0,16). A voz sempre entendível por cima de tudo.

## Preferências fixas do dono do estúdio
- **Antes de montar qualquer cena:** mostrar a imagem dos personagens (folha do elenco e/ou como aparecem nas cenas)
  e **esperar o "aprovado"**. Mesmo que o áudio chegue antes, não começar sem a aprovação.
- A narração é **gravada pelo dono** (ele manda o áudio); o texto do áudio é igual ao roteiro. Alinhar pelas pausas
  quando a transcrição do ElevenLabs não estiver disponível.
- **Sem legenda** no render final: `--props='{"legendas":false,"voz":true,"musica":false}'`.
- **Efeitos visuais** nas cenas (pop, brilhos, poeira, quadrinhos) **e efeitos sonoros** (seção 7).
- **Regra do foco** (seção 6): o que a narração mostra fica no centro da tela.
- Cada vídeo começa com uma **abertura diferente** dos anteriores (não repetir cenário de abertura).
- Antes de entregar: olhar o vídeo inteiro a cada meio segundo (com uma linha no centro) procurando câmera
  atravessando coisas, personagem cortado ou fora do centro.

## Narração e tempos
- Roteiro em segunda pessoa, gancho na primeira frase, uma ideia visual por frase, ênfase com `*palavra*`.
- No render final os tempos vêm da voz real (`src/voz.ts`, gerado por `tools/voz.mjs`).
- Todo gesto, troca de rosto, objeto de informação e corte é ancorado numa palavra: `W(linha, 'palavra')`.
- O último plano pode voltar ao primeiro para o vídeo funcionar em loop.

## Revisão (antes de dizer "pronto")
- Renderize prévias (`node tools/stills.mjs`) e **olhe cada imagem**.
- Confira: personagem grande no quadro, nada atravessando nada, pés no chão, expressão certa na hora certa,
  objeto de informação visível e legível, câmera mostrando o que importa.
- Corrigir uma cena não pode mudar as outras: `node tools/hashes.mjs salvar antes`, corrija, `salvar depois`, `comparar antes depois`.

---

## PARTE 3 — Como o motor funciona (consulta rápida)

**Tempo.** `src/timeline.ts`: `LINES` = roteiro (`*palavra*` = ênfase). `W(linha, 'palavra')` ou `W(linha, índice)` devolve
o segundo em que a palavra começa (linha começa em 0; busca pelo começo da palavra, sem acento). `WORDS`, `END`, `F` (1 quadro).

**Gestos.** `track(t, poseInicial, [{ at: W(...), v: { ...campos }, dur?: 5, lead?: 4 }])` — cada chave termina
`lead` quadros antes da palavra e dura `dur` quadros; entre chaves a pose fica parada. Use `lead: 0` para impactos
(martelo, carimbo) que precisam bater no quadro exato.

**Personagem.** `<Character pose={...} face={...} look={...} right={objeto} left={objeto} />`
- Pose (`REST` + campos): `x, y, z, ry` (posição/giro), `lean` (inclina p/ frente), `side`, `twist`, `squash` (agacha 0–1),
  `hy, hp, hr` (cabeça: vira, inclina p/ baixo, tomba), braços `lsz/rsz` (abre p/ o lado), `lsx/rsx` (levanta p/ frente),
  `lel/rel` (cotovelo; negativo dobra p/ frente), `walk` (fase dos passos) + `stride` (0–1), `ltap/rtap` (bate o pé), `pockets` (bolsos p/ fora).
- Olha para +Z. Altura ~2,1 (cabeça com centro em y 1,62, raio 0,5). Ombros em y 1,0.
- Atrás de balcão (`Room`), use `y: 0.75` para ele aparecer acima do balcão.
- Objetos na mão (`right`/`left`): o eixo -Y local continua o antebraço (ex.: `Hammer`).
- Caminhada: ~1 passo a cada 5–6 quadros → `walk = distância / 0.24`, `stride: 1`; pare com `stride: 0`.
- `Look` (aparência): `skin, jacket, pants, shoes, gloves, hair` + opcionais:
  `body` ('adulto' | 'magro' | 'forte' | 'crianca' | 'idoso' | 'baixo'),
  `hairStyle` ('curto' | 'liso' | 'longo' | 'coque' | 'crespo' | 'careca' | 'chanel' | 'rabo' | 'nenhum'),
  `hat` + `hatColor` ('bone' | 'gorro' | 'touca' | 'boina' | 'policia' | 'chef' | 'capacete' | 'explorador' | 'astronauta' |
  'cavaleiro' | 'farao' | 'marinheiro' | 'piloto' | 'capuz'), `eyewear` ('grau' | 'escuro' | 'mergulho' | 'aviador'),
  `beard` ('bigode' | 'barba'), `pattern` + `pattern2` + `patternH` ('listras' | 'xadrez' | 'florido' | 'acolchoado'),
  `coat` (jaleco), `vest` (colete), `apron` (avental), `skirt` ({ color, long }), `shorts`, `scarf`, `tie`, `shirt`,
  `metal` (armadura), `backpack` (mochila/tanque). Mãos claras: `gloves` = cor da pele (ou branco no estilo "rosto branco").

**Elenco pronto (src/personagens.ts).** `ELENCO.<id>.look` — voce (protagonista de boné), teo (cientista), lia (criança),
tonhao (grandão), zuza (avó), bento (vovô), kaio (estudante), paula (vizinha), ramos (guarda), nena (comerciante),
henrique (executivo), caio (friorento), bruna (enfermeira), rafa (atleta), tiao (trabalhador), nico (cozinheiro),
gabi (artista), pedrinho (menino), funcionario (bancário), sombra (suspeito). `ROUPAS.<id>.look` — astronauta, mergulhador,
protecao, explorador, inverno, praia, operario, medieval, cavaleiro, farao, piloto, marinheiro.
Para vestir alguém com uma roupa especial: `{ ...ROUPAS.astronauta.look, skin: ELENCO.kaio.look.skin, hair: ELENCO.kaio.look.hair }`.
Escolha o elenco de cada vídeo a partir daqui (ou crie novos no mesmo formato) e use os nomes ao falar com o usuário.
`node tools/elenco.mjs` gera de novo a folha `out/elenco.png` (ex.: depois de criar personagens novos).

**Rosto.** `faceAt(t, [{ at: W(...), f: 'surprised', o: ['sweat'] }], semente)` troca pela piscada sozinho.
Expressões: neutral, happy, smile, bigSmile, laugh, grin, closedSmile, content, wink, confident, smug, sideEye, suspicious,
thinking, curious, lookUp, lookDown, surprised, shocked, amazed, confused, unsure, worried, anxious, nervous, panic, scared,
terrified, anger, furious, annoyed, frustrated, disgusted, sick, tired, sleepy, bored, deadpan, dizzy, drunk, starstruck,
inLove, knockedOut. Extras (`o`): blush, stress, sparkle, sweat, sweat3, tears, vein, shading.
Os rostos são desenhados em código (olhos em (182,220) e (330,220), boca em (256,350) num decal 512×512).
Para usar um kit próprio, coloque PNGs 512×512 transparentes em `public/faces/` com os nomes de `FACES`
(src/textures.ts), ex.: `public/faces/04_big_smile.png`, e mude `KIT_PROPRIO` para `true`.

**Câmera.** `<Cam t t0 t1 keys={[[tempo, [x,y,z], [alvoX,alvoY,alvoZ], fov?], ...]} />` dentro de cada tomada.
Uma chave só com `t` como tempo = câmera que segue algo (ex.: travelling ao lado de quem anda).
Distância típica: 3–3,5 para close de rosto, 4,5–5,5 para corpo inteiro com objeto ao lado, 8+ para cenário.
No vertical o quadro é estreito: personagem e objeto lado a lado cabem até ~1,6 de distância entre eles.

**Cenários (src/sets.tsx).** `Street` (fachada com `placa`, cores), `Room` (interior com balcão e `placa`),
`Warehouse` (prateleiras até o teto, `item` configurável), `Stage` (palco liso colorido para fatos e números).
Cada cenário já traz luz, sombra, fundo e névoa. Crie novos no mesmo padrão (caixas, cilindros, `labelTex`, `WarmLights`).

**Objetos (src/props.tsx).** Efeitos: `Comic` (palavra de quadrinho), `Sparkles`, `Puff`. Informação: `Sign`, `Calendar`
(`pages` configurável), `LedCounter`, `Gauge`, `Stamp` + `StampMark`, `Tag`, `PaperRain`. Valor: `Coin`, `CoinBurst`,
`CoinStacks`, `MoneyStack` (`symbol`), `UpArrow`. Mão: `Hammer`, `Magnifier`, `Clipboard`. Mercadoria: `Crate`, `Field`
(muitas cópias numa malha só). Utilitário: `dropY` (queda com quique).

**Filme (src/Film.tsx + src/shots.tsx).** `SHOTS = [{ from: W(...), name, C }]` — cada tomada é um componente `({t,t0,t1}) => JSX`
que monta cenário + câmera + personagens + objetos. Dissolve de 6 quadros entre tomadas, legendas e áudio já prontos.
`SFX` (em shots.tsx) toca arquivos de `public/sfx/` em tempos de palavra. Música opcional: `public/musica.mp3` + prop `musica`.

**Ferramentas.** `tools/palavras.mjs` (transcrição do ElevenLabs → `src/voz.ts`), `tools/voz.mjs` (alternativa: narração + tempos direto pela API com `.env`), `tools/stills.mjs` (prévias), `tools/hashes.mjs`
(`salvar antes` → corrigir → `salvar depois` → `comparar antes depois`: prova que a correção só mexeu onde devia).

---

## PARTE 4 — Problemas comuns

- **O render não abre o navegador / erro "Failed to launch the browser" / ENOENT no chrome-headless-shell:** acontece
  no Windows quando a pasta tem um caminho muito longo. Mova o projeto para uma pasta curta (ex.: `C:\shorts\`) ou defina
  `CHROME_PATH` apontando para o Chrome instalado (ex.: `C:\Program Files\Google\Chrome\Application\chrome.exe`).
- **Máquina sem placa de vídeo (nuvem, servidor) — erro de WebGL, cena vazia ou preta:** `tools/elenco.mjs` e
  `tools/stills.mjs` já trocam sozinhos para o WebGL por software. No render final pelo terminal, defina `REMOTION_GL=swangle`.
  Não edite o código para isso.
- **`npx` bloqueado no PowerShell:** use `npx.cmd`. Não altere a política de execução do Windows.
- **Aviso do npm sobre install-scripts do esbuild:** pode ignorar, o projeto funciona.
- **"o áudio tem X palavras e o roteiro Y":** palavras com hífen, números ou siglas foram faladas diferente. Escreva-as como
  serão faladas (ex.: "cento e vinte" em vez de "120") e gere a voz de novo.
- **Tela preta ou cena vazia numa prévia:** a câmera está olhando para o lugar errado — confira alvo e distância da `Cam`.
- **Render lento:** normal (WebGL no navegador). Use `--concurrency=4` e renderize em segundo plano.
