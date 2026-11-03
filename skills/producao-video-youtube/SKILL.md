---
name: producao-video-youtube
description: Produz um vídeo longo e completo para YouTube a partir de um vídeo gravado e/ou um áudio (voz do autor) em português. Estabiliza o vídeo, limpa o ruído das vozes, transcreve com tempo por palavra, monta a linha do tempo (corta repetições, encaixa o áudio no meio), cria motion graphics em canvas (paleta marrom e dourado, lousa com mão desenhando e bonequinhos de palito), legenda com a palavra falada em destaque, música de reportagem sintetizada em arquivo separado, capa e título/descrição/tags. Use quando o usuário pedir "faça um vídeo para YouTube", "coloque meu áudio no meio do vídeo", "estabilize e melhore o som", "motion graphics", "legenda com destaque", "capa" ou "descrição do YouTube".
---

# Produção de vídeo para YouTube (voz do autor + gráficos em código)

Pipeline testado para um vídeo de ~3 min 49 s em 16:9 (1920×1080, 30 fps). Tudo em código: sem modelo de vídeo.

## Antes de começar (sempre)
1. **Analise os arquivos** (ffprobe) e **transcreva os dois** com Whisper para entender o conteúdo e achar repetições.
2. **Sugira 5 estilos** e deixe o usuário escolher antes de produzir. Pergunte formato (16:9 ou 9:16), duração e logos.
3. **Faça uma amostra** (40 a 60 s) e só renderize o vídeo completo depois do "aprovado".
4. Leia `references/licoes.md` (armadilhas que já custaram tempo).

## Passo a passo
1. **Pasta do projeto** com `src/` (originais), `assets/`, `fonts/`, `work/`, `out/`. Não versione mídia pesada (`.gitignore` para `src/ work/ out/ *.mp4 *.wav *.mp3`).
2. **Logos sem fundo**: `scripts/logos.py` (fundo escuro: extrai o dourado por diferença para o fundo; fundo branco: remove o branco conectado à borda e preserva o branco interno). Confira o resultado em fundo escuro e claro.
3. **Estabilizar e limpar**: `scripts/prep.sh` (vidstab em 2 passagens, 30 fps, nitidez leve; `denoise.py` com perfil de ruído automático; EQ, compressão e loudnorm −16 LUFS por voz). Precisa de ffmpeg com vidstab e de `noisereduce` num venv.
4. **Transcrever**: `scripts/transcribe.py` com modelo `medium` (o `small` erra mais; `initial_prompt` com os termos do assunto ajuda). Corrija erros conhecidos por mapa de palavras em `assemble.py` (ex.: sigla mal reconhecida, gênero).
5. **Linha do tempo**: edite os pontos de corte em `scripts/assemble.py` (abertura do vídeo, áudio inteiro, fecho do vídeo). O script acha as palavras-chave nos tempos reais (`find`), gera `timeline.json` (marcos, legendas por frase com tempo de cada palavra, efeitos) e `work/voz-final.wav`. **Corte frases soltas no fim do áudio** (ex.: sobras de texto de outra ferramenta).
6. **Gráficos**: `templates/index.html` (cenas, vinheta, legenda com destaque, capa em `?cover=1`) + `templates/lousa.js` (lousa, giz, mão, bonequinhos, apagador, preenchimentos). Adapte textos, cores e cenas ao novo assunto. Todo quadro é função do tempo `render(t)`.
7. **Renderizar** com a biblioteca lemo-opuscar (`node core/render/video.mjs <pasta> --fps 30 --workers 3 --size 1920x1080`; `events.mjs` exporta os eventos de giz). 2D leva ~7 min para 3 min de vídeo.
8. **Montar**: `scripts/compose.sh` põe o vídeo estabilizado na moldura nas janelas de abertura e fecho (overlay com fade). Depois `core/render/mux.sh` faz o áudio −14 LUFS.
9. **Música e efeitos**: `scripts/mix.py` sintetiza música de reportagem (baixo pulsante, pad, arpejo, percussão), efeitos (whoosh, carimbo, sino, giz, apagador), ducking sob a voz e gera: música separada, mix sem trilha e mix com trilha. Equalize a música (menos grave e miolo, mais brilho) para a voz aparecer.
10. **Entregar**: vídeo com e sem trilha, música `.mp3` separada, capa 1280×720 (<2 MB), `.srt`, título/descrição/capítulos/tags (`templates/youtube-metadata-exemplo.txt`), `CREDITS`.

## Checagens obrigatórias
- Duração e resolução (ffprobe), `blackdetect` sem quadros pretos, loudness (ebur128).
- Transcrever o áudio final de novo e comparar com o texto.
- Contact sheets: um quadro de cada capítulo, olhando sobreposição de legenda com conteúdo e textos cortados.
- Dizer com honestidade o que **não** foi verificado (ex.: não ouviu a mixagem, não viu em movimento).

## Regras de conduta
- Mantenha valores, prazos e citações como o usuário falou; só ajuste a grafia de siglas. Avise sobre o que foi corrigido.
- Conteúdo de advocacia: incluir aviso de que é informativo e não garante resultado; contatos e OAB ficam como `[COLE AQUI]` se não forem dados.
- Não faz upload no YouTube sem uma ferramenta que controle o navegador do usuário; entregue título, descrição, tags e arquivos prontos.
