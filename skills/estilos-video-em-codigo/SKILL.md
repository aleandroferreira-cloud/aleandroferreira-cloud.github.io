---
name: estilos-video-em-codigo
description: Cria vídeos animados 100% em código (canvas, WebGL, FFmpeg) usando a biblioteca de estilos lemo-opuscar (aquarela, quadro-negro, peças de montar, pixel art, tinta, notícia de TV etc.), com a voz do próprio usuário ou voz sintética, legendas grandes com destaque palavra por palavra, trilha e efeitos sintetizados. Use quando o usuário pedir um vídeo "em estilo X", "vídeo viral animado", "transforme meu áudio em vídeo animado", em vertical 9:16 ou horizontal 16:9, ou quando mencionar lemo-opuscar.
---

# Vídeos em código com os estilos do lemo-opuscar

Repositório (MIT): github.com/lemomo-ai/lemo-opuscar. No Claude Code local: `claude plugin marketplace add lemomo-ai/lemo-opuscar` e `claude plugin install lemo-opuscar@lemolab`. Na nuvem, clone a biblioteca e siga o `AGENTS.md` dela.

## Fluxo
1. **Estilos**: proponha 3 a 5 estilos adequados ao assunto e deixe escolher. Diga o que cada um custa (2D rápido, 3D lento no ambiente na nuvem).
2. **Preparação**: `sh plugin/skills/lemo-opuscar/scripts/setup.sh` (clona em `/root/lemo-opuscar`, caminho curto) e `... deps voice` se precisar de TTS/Whisper. Instale ffmpeg 7+.
3. **Áudio do usuário**: limpe o ruído, transcreva com Whisper `medium` (tempo por palavra) e confirme o texto antes de montar.
4. **Tratamento** em `TREATMENT.md`: 3 estruturas possíveis, a escolhida, linha do tempo por fala, câmera, som, legendas. Leia `styles/<estilo>/STYLE.md` antes do `DEMO.md`.
5. **Construir** a página `index.html` com `render(t)` determinístico; testar com `still.mjs` e contact sheets antes de renderizar tudo.
6. **Renderizar** (`video.mjs --fps 30 --size WxH`), mixar (`mux.sh`, −14 LUFS), checar (blackdetect, transcrição do áudio final) e entregar com `.srt`, poster, `CREDITS` e `build.sh`.

## Legenda com destaque palavra por palavra (padrão do usuário)
- Fonte grossa e grande (~88 px em 1080 de largura), até 2 linhas, pílula escura com ícone.
- Palavra atual: fundo amarelo (ou gradiente dourado) e pop de até 5%; ditas em branco; futuras a 50%.
- Tempos de `faster-whisper` com `word_timestamps=True`; trechos de 3–8 palavras; manter ≥1,4–1,8 s.
- Código de referência: `references/legenda-destaque.js`.

## Limites honestos
- Estilos tipo quadro-negro dependem de dados de traço (a biblioteca usa traços reais para caracteres chineses); para português usei fonte manuscrita revelada traço a traço.
- 3D sem GTAO, DOF e luzes de estúdio no ambiente sem GPU: o resultado é mais liso que o estilo original.
- Sempre diga o que não foi visto/ouvido.
